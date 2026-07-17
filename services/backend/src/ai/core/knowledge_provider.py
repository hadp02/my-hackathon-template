from src.ai.config.settings import settings
from typing import Optional
from agno.vectordb.qdrant import Qdrant
from agno.knowledge.embedder.openai import OpenAIEmbedder

class KnowledgeProvider:
    """
    Factory for provisioning Knowledge Bases.
    Supports Plug-and-Play Qdrant RAG.
    If QDRANT_URL is not set, returns None to bypass RAG smoothly.
    """
    
    @staticmethod
    def get_qdrant_db(collection_name: str) -> Optional[Qdrant]:
        qdrant_url = settings.QDRANT_URL
        if not qdrant_url:
            return None
            
        qdrant_api_key = settings.QDRANT_API_KEY
        
        # Custom Embedder Setup (e.g. Kaggle Tunnel or Local Model)
        embedding_api_base = settings.EMBEDDING_API_BASE
        embedding_model = settings.EMBEDDING_MODEL
        
        if embedding_api_base:
            # Override OpenAI base_url to hit custom endpoint (like vLLM/Ollama tunnel)
            embedder = OpenAIEmbedder(
                api_key="dummy_key_if_unauthenticated",
                base_url=embedding_api_base,
                id=embedding_model
            )
        else:
            # Fallback to standard OpenAI embeddings if tunnel is not provided
            embedder = OpenAIEmbedder(id="text-embedding-3-small")

        return Qdrant(
            collection=collection_name,
            url=qdrant_url,
            api_key=qdrant_api_key,
            embedder=embedder
        )
