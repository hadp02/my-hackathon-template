"""
AI direct endpoints (Modular Monolith architecture).

Handles chat requests directly using Agno agents.
"""

import json
import structlog
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from src.ai.core.agent_router import AgentRouter
from src.ai.core.tracing.db_tracer import DBTracer
from src.core.security import get_current_user
from src.models.user import User

logger = structlog.get_logger()
router = APIRouter(prefix="/ai", tags=["AI"])

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    agent_id: Optional[str] = None

@router.get("/traces")
async def get_traces(current_user: User = Depends(get_current_user)):
    return await DBTracer.get_traces()

@router.post("/chat")
async def chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    try:
        session = request.session_id or str(current_user.id)
        agent = AgentRouter.get_agent(agent_id=request.agent_id, session_id=session)
        agent.custom_run_input = request.message
        response = agent.run(request.message)

        return {
            "content": response.content,
            "session_id": agent.session_id,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Chat error", error=str(e), agent_id=request.agent_id)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest, current_user: User = Depends(get_current_user)):
    try:
        session = request.session_id or str(current_user.id)
        agent = AgentRouter.get_agent(agent_id=request.agent_id, session_id=session)
        agent.custom_run_input = request.message

        async def event_generator():
            async for event in agent.arun(request.message, stream=True, stream_events=True):
                if event.event == "ToolCallStarted" and getattr(event, "tool", None):
                    tool_args = getattr(event.tool, "args", {})
                    if isinstance(tool_args, str):
                        try:
                            tool_args = json.loads(tool_args)
                        except Exception as parse_err:
                            logger.debug("Failed to parse tool_args as JSON", error=str(parse_err))
                    yield json.dumps({
                        "type": "tool_call",
                        "content": f"Calling {event.tool.tool_name}...",
                        "name": event.tool.tool_name,
                        "args": tool_args
                    }) + "\n"
                elif event.event == "RunContent":
                    content = event.content if hasattr(event, "content") else str(event)
                    if content:
                        yield json.dumps({"content": content}) + "\n"
                elif event.event == "RunCompleted":
                    yield json.dumps({"type": "status", "content": "done"}) + "\n"

        return StreamingResponse(
            event_generator(),
            media_type="application/x-ndjson",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        logger.error("Stream error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def ai_health():
    return {"status": "ok"}
