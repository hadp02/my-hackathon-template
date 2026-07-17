"""
Agent Trace model for tracking AI interactions and evaluations.
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, Text

from src.models.base import BaseModel

class AgentTrace(BaseModel):
    """AI Agent execution trace log."""

    __tablename__ = "agent_traces"

    run_id = Column(String(255), index=True, nullable=True)
    parent_run_id = Column(String(255), index=True, nullable=True)
    session_id = Column(String(255), index=True, nullable=True)
    user_id = Column(String(255), index=True, nullable=True)
    tenant_id = Column(String(255), index=True, nullable=True)
    
    agent_id = Column(String(255), nullable=True)
    step_type = Column(String(100), nullable=True)
    model = Column(String(255), nullable=True)
    prompt_version = Column(String(100), nullable=True)
    
    tools_called = Column(Text, nullable=True)
    tool_outputs_summary = Column(Text, nullable=True)
    
    input_text = Column(Text, nullable=True)
    output_text = Column(Text, nullable=True)
    
    status = Column(String(50), nullable=True)
    
    prompt_tokens = Column(Integer, nullable=True)
    completion_tokens = Column(Integer, nullable=True)
    total_tokens = Column(Integer, nullable=True)
    
    latency_ms = Column(Integer, nullable=True)
    ttft_ms = Column(Integer, nullable=True)
    tokens_per_sec = Column(Float, nullable=True)
    cost_usd = Column(Float, nullable=True)
    
    is_cache_hit = Column(Boolean, default=False)
    error_message = Column(Text, nullable=True)
    finish_reason = Column(String(100), nullable=True)
    is_regenerated = Column(Boolean, default=False)
    
    eval_status = Column(String(50), default="pending")
    eval_groundedness = Column(Float, nullable=True)
    eval_relevance = Column(Float, nullable=True)
    
    feedback_score = Column(Integer, nullable=True)
    feedback_notes = Column(Text, nullable=True)
