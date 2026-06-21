"""Configurações da engine, lidas de variáveis de ambiente (prefixo ORDERFLOW_).

Todas as configurações têm padrões compatíveis com o docker-compose do projeto,
de modo que a engine sobe sem nenhuma variável definida em ambiente de dev.
"""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="ORDERFLOW_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ----- Banco de dados -------------------------------------------------
    database_url: str = Field(default="")
    db_host: str = Field(default="localhost")
    db_port: int = Field(default=5432)
    db_name: str = Field(default="orderflow_db")
    db_user: str = Field(default="orderflow")
    db_password: str = Field(default="orderflow")

    # ----- Regras de negócio ---------------------------------------------
    low_stock_threshold: int = Field(default=5)
    no_turnover_days: int = Field(default=60)
    sales_drop_threshold: float = Field(default=0.15)
    restock_lead_time_days: int = Field(default=7)

    # ----- API ------------------------------------------------------------
    allowed_origins: str = Field(default="http://localhost:3000,http://localhost:8080")

    @property
    def sqlalchemy_url(self) -> str:
        """URL de conexão completa (componentes são usados como fallback)."""
        if self.database_url:
            return self.database_url
        return (
            f"postgresql+psycopg2://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
