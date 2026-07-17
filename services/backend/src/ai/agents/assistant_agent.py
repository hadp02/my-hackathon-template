from typing import Optional
from agno.agent import Agent
from src.ai.core.base_agent import BaseAgent
from src.ai.tools.mock_tools import get_weather, get_stock_price, query_internal_database

def get_assistant_agent(session_id: Optional[str] = None) -> Agent:
    """
    Creates the concrete Assistant Agent using the BaseAgent factory.
    """
    instructions = [
        "You are a helpful, brilliant, and concise AI assistant.",
        "You always provide clear formatting using markdown.",
        "When asked for factual real-time information, explain that you are a mock assistant.",
        "When asked about weather, use the get_weather tool.",
        "When asked about stock prices, use the get_stock_price tool.",
        "When asked about internal company documents, policies, or RAG, use the query_internal_database tool.",
        "Always respond in the user's language."
    ]
    
    return BaseAgent.create(
        agent_id="core_assistant",
        name="Assistant",
        instructions=instructions,
        tools=[get_weather, get_stock_price, query_internal_database],
        session_id=session_id
    )
