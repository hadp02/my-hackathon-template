from src.ai.config.settings import settings
from src.core.config import settings as core_settings
from typing import List, Optional, Any
from agno.agent import Agent
from agno.db.postgres import PostgresDb
from src.ai.core.model_provider import ModelProvider
from src.ai.core.tracing.db_tracer import DBTracer

class BaseAgent:
    """
    Factory class that creates a standard Agno Agent with our architecture conventions:
    - Model injected via ModelProvider
    - Memory stored in PostgresDb
    """
    
    @staticmethod
    def create(
        agent_id: str,
        name: str,
        instructions: List[str],
        tools: Optional[List[Any]] = None,
        session_id: Optional[str] = None,
        knowledge: Any = None
    ) -> Agent:
        # 1. Get Model
        model = ModelProvider.get_model()
        
        # 2. Get DB for memory
        memory_db = PostgresDb(
            table_name="agent_sessions",
            db_url=core_settings.SYNC_DATABASE_URL
        )
        
        # 3. Create Agent
        agent = Agent(
            id=agent_id,
            name=name,
            model=model,
            instructions=instructions,
            tools=tools or [],
            db=memory_db,
            session_id=session_id,
            read_chat_history=True,
            markdown=True,
            knowledge=knowledge,
            search_knowledge=True if knowledge else False,
            post_hooks=[DBTracer.post_run]
        )
        
        return agent
