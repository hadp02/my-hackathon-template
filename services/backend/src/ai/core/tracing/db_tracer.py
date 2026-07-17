import json
import asyncio
import structlog
from agno.hooks import hook

from src.core.database import AsyncSessionLocal
from src.models.agent_trace import AgentTrace
from sqlalchemy import select

logger = structlog.get_logger(__name__)

async def _save_trace_async(agent, run_output, run_context=None):
    try:
        input_text = getattr(agent, 'custom_run_input', "")
        if not input_text and hasattr(agent, 'memory') and hasattr(agent.memory, 'messages'):
            user_msgs = [m for m in agent.memory.messages if getattr(m, 'role', '') == 'user']
            if user_msgs:
                input_text = getattr(user_msgs[-1], 'content', "")
        
        if not input_text and hasattr(agent, 'run_input'):
            input_text = str(agent.run_input)
            
        output_text = run_output.content if run_output and hasattr(run_output, 'content') else ""
        metrics = getattr(run_output, 'metrics', None)
        
        def get_metric(name, default=0):
            if not metrics:
                return default
            if isinstance(metrics, dict):
                return metrics.get(name, default)
            return getattr(metrics, name, default) or default

        prompt_tokens = get_metric('input_tokens') or get_metric('prompt_tokens', 0)
        if not prompt_tokens:
            prompt_tokens = int(len(str(input_text)) / 4)
            
        completion_tokens = get_metric('output_tokens') or get_metric('completion_tokens', 0)
        if not completion_tokens:
            completion_tokens = int(len(str(output_text)) / 4)
            
        total_tokens = get_metric('total_tokens') or (prompt_tokens + completion_tokens)
        
        latency_raw = get_metric('time') or get_metric('duration') or get_metric('total_latency') or get_metric('latency') or 0
        if latency_raw == 0 and hasattr(run_output, 'metrics') and isinstance(run_output.metrics, dict):
            latency_raw = run_output.metrics.get('time', 0)
        latency_ms = int(latency_raw * 1000)
        
        ttft_raw = get_metric('time_to_first_token') or get_metric('ttft_ms') or 0
        ttft_ms = int(ttft_raw * 1000) if ttft_raw < 100 else int(ttft_raw)
        
        if latency_ms == 0:
            latency_ms = ttft_ms + (completion_tokens * 15)
            if latency_ms == 0:
                latency_ms = 1200
                
        tokens_per_sec = 0.0
        generation_time_s = (latency_ms - ttft_ms) / 1000.0
        if generation_time_s > 0 and completion_tokens > 0:
            tokens_per_sec = round(completion_tokens / generation_time_s, 2)
        
        cost_usd = get_metric('cost_usd', (prompt_tokens * 0.15 / 1000000) + (completion_tokens * 0.60 / 1000000))
        is_cache_hit = get_metric('cache_hit', False)
        finish_reason = get_metric('finish_reason', 'stop')
        
        run_id = getattr(run_context, 'run_id', 'unknown') if run_context else 'unknown'
        parent_run_id = getattr(run_context, 'parent_run_id', None) if run_context else None
        session_id = agent.session_id if hasattr(agent, 'session_id') else 'unknown'
        
        user_id = getattr(run_context, 'user_id', 'anonymous') if run_context else 'anonymous'
        tenant_id = getattr(run_context, 'tenant_id', 'default') if run_context else 'default'
        is_regenerated = getattr(run_context, 'is_regenerated', False) if run_context else False
        
        agent_id = getattr(agent, 'id', getattr(agent, 'name', 'unknown_agent'))
        step_type = get_metric('step_type', 'main_agent')
        model_name = getattr(agent.model, 'id', getattr(agent.model, 'name', 'unknown')) if hasattr(agent, 'model') and agent.model else 'unknown'
        prompt_version = getattr(agent, 'prompt_version', 'v1.0')
        
        tool_outputs_map = {}
        extracted_tools = []
        if hasattr(agent, 'memory') and hasattr(agent.memory, 'messages'):
            for m in agent.memory.messages:
                if getattr(m, 'role', '') == 'tool':
                    t_id = getattr(m, 'tool_call_id', getattr(m, 'name', ''))
                    if t_id:
                        tool_outputs_map[t_id] = getattr(m, 'content', '')
                if getattr(m, 'role', '') == 'assistant':
                    tcs = getattr(m, 'tool_calls', None)
                    if tcs and isinstance(tcs, list):
                        for tc in tcs:
                            if isinstance(tc, dict):
                                tc_id = tc.get('id', tc.get('tool_call_id'))
                                func = tc.get('function', {})
                                tc_name = func.get('name', tc.get('name', 'unknown'))
                                tc_args = func.get('arguments', tc.get('arguments', {}))
                            else:
                                tc_id = getattr(tc, 'id', getattr(tc, 'tool_call_id', None))
                                func = getattr(tc, 'function', None)
                                if func:
                                    tc_name = getattr(func, 'name', 'unknown')
                                    tc_args = getattr(func, 'arguments', {})
                                else:
                                    tc_name = getattr(tc, 'name', 'unknown')
                                    tc_args = getattr(tc, 'arguments', {})
                            if isinstance(tc_args, str):
                                try:
                                    tc_args = json.loads(tc_args)
                                except Exception:
                                    pass
                            extracted_tools.append({"id": tc_id, "name": tc_name, "arguments": tc_args})
        
        tools = getattr(run_output, 'tools', [])
        tools_called_list = []
        if tools:
            for t in tools:
                t_name = getattr(t, 'tool_name', getattr(t, 'name', None))
                if not t_name and isinstance(t, dict):
                    t_name = t.get('tool_name', t.get('name', 'unknown'))
                t_id = getattr(t, 'id', getattr(t, 'tool_call_id', None))
                if t_id is None and isinstance(t, dict):
                    t_id = t.get('id', t.get('tool_call_id'))
                args = getattr(t, 'arguments', getattr(t, 'args', None))
                if args is None and hasattr(t, 'function'):
                    args = getattr(t.function, 'arguments', None)
                if args is None and isinstance(t, dict):
                    args = t.get('arguments', t.get('args', {}))
                if args is None and hasattr(t, '__dict__'):
                    args = {k: v for k, v in t.__dict__.items() if not k.startswith('_') and k not in ['tool_name', 'name', 'id', 'tool_call_id']}
                tools_called_list.append({"id": t_id, "name": t_name, "arguments": args})
                
        if not tools_called_list and extracted_tools:
            tools_called_list = extracted_tools
        tools_called = json.dumps(tools_called_list, default=str)
        
        error_message = get_metric('error_message', None)
        status = 'failed' if error_message else 'success'
        eval_status = 'pending' if step_type != 'tool_call' else 'skipped'
        
        async with AsyncSessionLocal() as session:
            trace = AgentTrace(
                run_id=run_id, parent_run_id=parent_run_id, session_id=session_id, user_id=user_id, tenant_id=tenant_id,
                agent_id=agent_id, step_type=step_type, model=model_name, prompt_version=prompt_version, tools_called=tools_called,
                input_text=input_text, output_text=output_text, status=status, prompt_tokens=prompt_tokens, completion_tokens=completion_tokens,
                total_tokens=total_tokens, latency_ms=latency_ms, ttft_ms=ttft_ms, tokens_per_sec=tokens_per_sec, cost_usd=cost_usd,
                is_cache_hit=is_cache_hit, error_message=error_message, finish_reason=finish_reason, is_regenerated=is_regenerated, eval_status=eval_status
            )
            session.add(trace)
            
            for i, t_info in enumerate(tools_called_list):
                t_name = t_info.get("name", "unknown_tool")
                t_args = json.dumps(t_info.get("arguments", {}), ensure_ascii=False, default=str)
                t_id = t_info.get("id")
                t_output = tool_outputs_map.get(t_id, "") if t_id else ""
                t_status = 'success' if t_output else 'pending'
                t_output_summary = t_output[:500] + "... [truncated]" if len(t_output) > 500 else t_output
                
                tool_trace = AgentTrace(
                    run_id=f"{run_id}_tool_{i}", parent_run_id=run_id, session_id=session_id, user_id=user_id, tenant_id=tenant_id,
                    agent_id=agent_id, step_type='tool_call', model=model_name, prompt_version=prompt_version, tools_called=json.dumps([{"name": t_name}]),
                    tool_outputs_summary=t_output_summary, input_text=t_args, output_text=t_output_summary, status=t_status,
                    prompt_tokens=0, completion_tokens=0, total_tokens=0, latency_ms=0, ttft_ms=0, tokens_per_sec=0.0, cost_usd=0.0,
                    is_cache_hit=False, error_message=None, finish_reason='stop', is_regenerated=False, eval_status='skipped'
                )
                session.add(tool_trace)
            await session.commit()
            
    except Exception as e:
        logger.error("Error saving trace", error=str(e))

class DBTracer:
    """
    SQLAlchemy tracer using Agno hooks to log agent runs.
    """
    @staticmethod
    @hook
    def post_run(run_output, agent, run_context=None):
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(_save_trace_async(agent, run_output, run_context))
        except RuntimeError:
            asyncio.run(_save_trace_async(agent, run_output, run_context))

    @staticmethod
    async def get_traces(limit: int = 50):
        try:
            async with AsyncSessionLocal() as session:
                # Basic mock-up for dashboard. We will pull the latest traces
                # and compute simple aggregation.
                query = select(AgentTrace).order_by(AgentTrace.created_at.desc()).limit(limit)
                result = await session.execute(query)
                traces = result.scalars().all()
                traces_list = [
                    {
                        "id": str(t.id),
                        "run_id": t.run_id,
                        "session_id": t.session_id,
                        "agent_id": t.agent_id,
                        "step_type": t.step_type,
                        "input_text": t.input_text,
                        "output_text": t.output_text,
                        "status": t.status,
                        "total_tokens": t.total_tokens,
                        "latency_ms": t.latency_ms,
                        "created_at": t.created_at.isoformat() if t.created_at else None,
                    } for t in traces
                ]
                
                # Mock stats
                stats = {
                    "total_runs": len(traces),
                    "total_tokens": sum([t.total_tokens or 0 for t in traces]),
                    "avg_latency": sum([t.latency_ms or 0 for t in traces]) / max(len(traces), 1),
                    "total_errors": sum([1 for t in traces if t.status == 'failed']),
                    "success_rate": 100.0,
                    "cache_hit_rate": 0.0,
                }
                return {"metrics": stats, "traces": traces_list}
        except Exception as e:
            logger.error("Error getting traces", error=str(e))
            return {"metrics": {}, "traces": []}
