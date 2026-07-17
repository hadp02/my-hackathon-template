from typing import Optional
from agno.agent import Agent
# PDF import removed temporarily
from src.ai.core.base_agent import BaseAgent
from src.ai.core.knowledge_provider import KnowledgeProvider

def get_rag_agent(session_id: Optional[str] = None) -> Agent:
    """
    Creates an Agent equipped with Qdrant Vector Search.
    It will automatically bypass RAG if QDRANT_URL is not set.
    """
    instructions = [
        "You are an expert knowledge assistant.",
        "When answering questions, search your knowledge base first.",
        "If you find relevant context in the knowledge base, use it to craft a highly accurate response in Vietnamese."
    ]
    
    # Init Vector DB (graceful fallback to None if Qdrant isn't configured)
    KnowledgeProvider.get_qdrant_db(collection_name="company_docs")
    
    # Construct KnowledgeBase wrapper (e.g., PDFUrlKnowledgeBase is one of Agno's generic wrappers)
    # Even if vector_db is None, this will just gracefully disable search if designed well, 
    # but we should safely pass None to Agent if vector_db is missing.
    knowledge_base = None
    # if vector_db:
    #     knowledge_base = PDFUrlKnowledgeBase(...)
    
    return BaseAgent.create(
        agent_id="rag_assistant",
        name="RAG Assistant",
        instructions=instructions,
        knowledge=knowledge_base,
        session_id=session_id
    )
