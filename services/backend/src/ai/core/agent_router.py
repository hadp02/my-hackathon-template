"""
Agent Router — Dynamic agent dispatch.

Routes chat requests to the appropriate Agno agent based on ``agent_id``.
Supports adding new agents by registering them in the AGENT_REGISTRY.

Usage in endpoints::

    agent = AgentRouter.get_agent(agent_id="rag", session_id="...")
    response = agent.run("Hello")
"""

from typing import Optional

import structlog

from src.ai.agents.assistant_agent import get_assistant_agent
from src.ai.agents.rag_agent import get_rag_agent
from src.ai.agents.team_agent import get_team_agent

logger = structlog.get_logger()

# Agent registry — maps agent_id to factory function.
# TEMPLATE: Add new agents here.
AGENT_REGISTRY = {
    "assistant": get_assistant_agent,
    "rag": get_rag_agent,
    "team": get_team_agent,
}

# Default agent when no agent_id specified
DEFAULT_AGENT = "assistant"


class AgentRouter:
    """
    Routes requests to the appropriate agent based on agent_id.

    Usage::

        agent = AgentRouter.get_agent("assistant", session_id="abc123")
        response = agent.run("Hello")
    """

    @staticmethod
    def get_agent(agent_id: Optional[str] = None, session_id: Optional[str] = None):
        """
        Get an agent instance by ID.

        Args:
            agent_id: The agent identifier. Falls back to DEFAULT_AGENT.
            session_id: Optional session ID for conversation continuity.

        Returns:
            An Agno Agent instance ready to run.

        Raises:
            ValueError: If agent_id is not found in the registry.
        """
        agent_id = agent_id or DEFAULT_AGENT

        factory = AGENT_REGISTRY.get(agent_id)
        if factory is None:
            available = ", ".join(AGENT_REGISTRY.keys())
            raise ValueError(
                f"Unknown agent_id: '{agent_id}'. Available agents: {available}"
            )

        logger.info("Agent routed", agent_id=agent_id, session_id=session_id)
        return factory(session_id=session_id)

    @staticmethod
    def list_agents() -> list[dict]:
        """List all registered agents with their IDs."""
        return [
            {"id": agent_id, "name": agent_id.replace("_", " ").title()}
            for agent_id in AGENT_REGISTRY
        ]
