from src.ai.config.settings import settings
from typing import Optional
from agno.models.base import Model
from agno.models.openai import OpenAIChat
from agno.models.google import Gemini
from agno.models.anthropic import Claude

class ModelProvider:
    @staticmethod
    def get_model(provider: Optional[str] = None, model_name: Optional[str] = None) -> Model:
        provider = provider or settings.AI_MODEL_PROVIDER.lower()
        model_name = model_name or settings.AI_MODEL_NAME

        if provider == "mock":
            mock_url = settings.MOCK_LLM_URL
            return OpenAIChat(
                id="mock-gpt",
                api_key="mock-key",
                base_url=mock_url
            )
        elif provider == "openai":
            return OpenAIChat(id=model_name)
        elif provider in ["google", "gemini"]:
            return Gemini(id=model_name)
        elif provider in ["anthropic", "claude"]:
            return Claude(id=model_name)
        else:
            raise ValueError(f"Unsupported model provider: {provider}")
