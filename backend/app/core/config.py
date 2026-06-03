"""
Core configuration module for AI Women Safety Companion backend.
Uses Pydantic BaseSettings for environment-variable-driven configuration.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or .env file.
    All sensitive values should be set via environment variables in production.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ────────────────────────────────────────────────
    APP_NAME: str = "AI Women Safety Companion"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = Field(default="development", description="Environment: development | staging | production")
    DEBUG: bool = Field(default=True, description="Enable debug mode")

    # ── MongoDB ────────────────────────────────────────────────────
    MONGODB_URL: str = Field(
        default="mongodb://localhost:27017",
        description="MongoDB connection string",
    )
    DB_NAME: str = Field(default="women_safety_db", description="MongoDB database name")

    # ── JWT / Security ─────────────────────────────────────────────
    SECRET_KEY: str = Field(
        default="super-secret-key-change-in-production-min-32-chars",
        description="Secret key for JWT signing (min 32 chars in production)",
    )
    ALGORITHM: str = Field(default="HS256", description="JWT signing algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, description="Access token TTL in minutes")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, description="Refresh token TTL in days")

    # ── AI APIs ────────────────────────────────────────────────────
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API key")
    OPENAI_API_KEY: str = Field(default="", description="OpenAI API key")

    # ── LangSmith ─────────────────────────────────────────────────
    LANGSMITH_API_KEY: str = Field(default="", description="LangSmith API key for tracing")
    LANGSMITH_PROJECT: str = Field(
        default="women-safety-companion",
        description="LangSmith project name",
    )

    # ── ChromaDB ──────────────────────────────────────────────────
    CHROMADB_HOST: str = Field(default="localhost", description="ChromaDB host")
    CHROMADB_PORT: int = Field(default=8000, description="ChromaDB port")

    # ── n8n Integration ───────────────────────────────────────────
    N8N_WEBHOOK_URL: str = Field(
        default="http://localhost:5678/webhook",
        description="Base URL for n8n webhooks",
    )

    # ── CORS ──────────────────────────────────────────────────────
    CORS_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8080",
            "http://127.0.0.1:3000",
        ],
        description="List of allowed CORS origins",
    )

    # ── Rate Limiting ─────────────────────────────────────────────
    RATE_LIMIT_DEFAULT: str = Field(default="100/minute", description="Default rate limit")
    RATE_LIMIT_AUTH: str = Field(default="5/minute", description="Auth endpoints rate limit")
    RATE_LIMIT_AI: str = Field(default="20/minute", description="AI endpoints rate limit")

    # ── File Storage ──────────────────────────────────────────────
    UPLOAD_DIR: str = Field(default="uploads", description="Directory for uploaded files")
    MAX_UPLOAD_SIZE_MB: int = Field(default=10, description="Max file upload size in MB")

    @property
    def is_production(self) -> bool:
        """Check if the application is running in production mode."""
        return self.APP_ENV.lower() == "production"

    @property
    def has_gemini_key(self) -> bool:
        """Check if Gemini API key is configured."""
        return bool(self.GEMINI_API_KEY and self.GEMINI_API_KEY.strip())

    @property
    def has_openai_key(self) -> bool:
        """Check if OpenAI API key is configured."""
        return bool(self.OPENAI_API_KEY and self.OPENAI_API_KEY.strip())

    @property
    def has_langsmith_key(self) -> bool:
        """Check if LangSmith API key is configured."""
        return bool(self.LANGSMITH_API_KEY and self.LANGSMITH_API_KEY.strip())


# Singleton settings instance — import this throughout the application
settings = Settings()
