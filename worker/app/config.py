from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    REDIS_URL: str = "redis://redis:6379/0"
    WEAVIATE_URL: str = "http://weaviate:8080"
    GEMINI_API_KEY: str = ""
    EXPRESS_API_URL: str = "http://localhost:3000"

    EMBEDDING_MODEL: str = "text-embedding-004"
    GENERATION_MODEL: str = "gemini-2.0-flash"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
