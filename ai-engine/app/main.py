"""Ponto de entrada da OrderFlow Intelligence (FastAPI).

    uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import __version__
from .api.routes import router
from .config import get_settings
from .db import ping

settings = get_settings()

app = FastAPI(
    title="OrderFlow Intelligence",
    description=(
        "Engine de inteligência proprietária do OrderFlow. Analisa dados reais "
        "de vendas, estoque e clientes usando regras de negócio e estatística — "
        "sem qualquer dependência de API externa de IA."
    ),
    version=__version__,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health", tags=["meta"])
def health() -> dict:
    """Liveness/readiness: status do serviço e conectividade com o banco."""
    db_ok = ping()
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "up" if db_ok else "down",
        "engine": "orderflow-intelligence",
        "version": __version__,
    }


@app.get("/", tags=["meta"])
def root() -> dict:
    return {
        "service": "OrderFlow Intelligence",
        "version": __version__,
        "endpoints": ["/insights", "/dashboard-summary", "/stock-alerts", "/sales-analysis", "/health"],
        "docs": "/docs",
    }
