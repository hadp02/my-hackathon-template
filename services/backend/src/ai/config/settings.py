"""
AI Service configuration.

Uses Pydantic Settings for consistent env var management,
matching the pattern in services/backend.
"""


from pydantic_settings import BaseSettings, SettingsConfigDict


class AISettings(BaseSettings):
    """AI service environment configuration."""

    # Service Identity
    SERVICE_NAME: str = "AI Service"
    ENVIRONMENT: str = "development"

    # LLM Provider
    AI_MODEL_PROVIDER: str = "mock"  # mock | openai | gemini | anthropic
    AI_MODEL_NAME: str = "gpt-4o-mini"

    # API Keys
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # Mock LLM
    MOCK_LLM_URL: str = "http://localhost:8001/v1"

    # RAG / Vector DB
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""
    EMBEDDING_API_BASE: str = ""
    EMBEDDING_MODEL: str = "keepitreal/vietnamese-sbert"

    # Evaluation
    EVAL_SAMPLE_RATE: float = 1.0  # 1.0 = 100% for dev, 0.05 = 5% for prod

    # Auth (shared JWT secret with API service)
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = AISettings()
