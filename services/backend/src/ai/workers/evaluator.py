import asyncio
import random
import structlog
import os
from sqlalchemy import select

from src.core.database import AsyncSessionLocal
from src.models.agent_trace import AgentTrace

logger = structlog.get_logger(__name__)

async def evaluate_trace(trace_id, input_text, output_text):
    """
    Simulate LLM-as-a-judge calling Mock LLM to evaluate Groundedness and Relevance.
    """
    groundedness = round(random.uniform(0.7, 1.0), 2)
    relevance = round(random.uniform(0.7, 1.0), 2)
    
    try:
        from src.ai.core.model_provider import ModelProvider
        model = ModelProvider.get_model()
        prompt = f"Evaluate the following interaction for groundedness and relevance.\nInput: {input_text}\nOutput: {output_text}"
        response = model.run(prompt)
        # We simulate extracting JSON evaluation.
        # In MVP, we just use random high scores to populate the UI.
        logger.debug("Mock LLM evaluation completed", response_length=len(str(response)))
    except Exception as e:
        logger.warning(f"Mock LLM evaluation failed (using fallback random scores): {e}")

    return groundedness, relevance

def should_run_llm_eval(trace: AgentTrace) -> bool:
    """
    Tiered Evaluation Router:
    Decides whether a trace should be evaluated by the expensive LLM-as-a-judge.
    """
    # Tier 1: Heuristics / Fast Checks (100% execution)
    if trace.status == 'failed':
        logger.info("Routing to LLM Eval", trace_id=str(trace.id), trigger="Error Status")
        return True
        
    forbidden_words = ["password", "secret", "credit card"]
    text_to_check = str(trace.input_text or "") + " " + str(trace.output_text or "")
    if any(word in text_to_check.lower() for word in forbidden_words):
        logger.info("Routing to LLM Eval", trace_id=str(trace.id), trigger="Heuristics/Regex matched forbidden word")
        return True

    # Tier 2: Random Sampling
    sample_rate_str = os.getenv("EVAL_SAMPLE_RATE", "1.0")
    try:
        sample_rate = float(sample_rate_str)
    except ValueError:
        sample_rate = 1.0
        
    if random.random() < sample_rate:
        logger.info("Routing to LLM Eval", trace_id=str(trace.id), trigger=f"Sample Rate {sample_rate*100}%")
        return True
        
    return False

async def run_evaluator_loop():
    """
    Background polling loop to find pending traces and evaluate them.
    """
    logger.info("Starting Evaluator Worker loop...")
    while True:
        try:
            async with AsyncSessionLocal() as session:
                # Fetch pending traces that are not tool calls
                query = select(AgentTrace).where(
                    AgentTrace.eval_status == 'pending',
                    AgentTrace.step_type != 'tool_call'
                ).limit(5)
                
                result = await session.execute(query)
                pending_traces = result.scalars().all()
                
                for trace in pending_traces:
                    if not should_run_llm_eval(trace):
                        trace.eval_status = 'skipped'
                        logger.info("Trace evaluated", trace_id=str(trace.id), status="SKIPPED")
                        continue

                    logger.info("Evaluating trace", trace_id=str(trace.id))
                    groundedness, relevance = await evaluate_trace(
                        trace.id, 
                        trace.input_text, 
                        trace.output_text
                    )
                    
                    trace.eval_status = 'completed'
                    trace.eval_groundedness = groundedness
                    trace.eval_relevance = relevance
                    logger.info("Trace evaluated", trace_id=str(trace.id), groundedness=groundedness, relevance=relevance)
                
                if pending_traces:
                    await session.commit()
                    
        except Exception as e:
            logger.error("Error in evaluator loop", error=str(e))
            
        await asyncio.sleep(10) # Poll every 10 seconds
