from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="KOUSEI_", extra="ignore")

    app_env: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    database_url: str = "postgresql+psycopg://kousei:kousei@postgres:5432/kousei"
    snapshot_root: Path = Path("/data/snapshots")
    credential_key: str = Field(
        default="Uo4rfNqnj5zMTKgfFrSguD8Oh2LdZf5X6sadlHwZK3Y=",
        description="Base64 encoded 32-byte Fernet key.",
    )

    cisco_default_command: str = "show running-config"
    collector_timeout_seconds: int = 30


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
