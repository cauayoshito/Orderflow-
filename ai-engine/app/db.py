"""Camada de acesso ao banco: engine SQLAlchemy (lazy) e helper de consulta.

As consultas retornam ``pandas.DataFrame`` para alimentar as análises. O engine
é criado sob demanda para que a aplicação suba mesmo sem o banco disponível
(útil em testes e healthchecks).
"""

from __future__ import annotations

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

from .config import get_settings

_engine: Engine | None = None


def get_engine() -> Engine:
    """Retorna um engine SQLAlchemy singleton com pool pré-aquecido."""
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_engine(
            settings.sqlalchemy_url,
            pool_pre_ping=True,   # reconecta conexões ociosas quebradas
            pool_size=5,
            max_overflow=5,
            future=True,
        )
    return _engine


def query_df(sql: str, params: dict | None = None) -> pd.DataFrame:
    """Executa SQL parametrizado e devolve o resultado como DataFrame."""
    engine = get_engine()
    with engine.connect() as conn:
        return pd.read_sql_query(text(sql), conn, params=params or {})


def ping() -> bool:
    """Verifica conectividade com o banco (usado no /health)."""
    try:
        engine = get_engine()
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
