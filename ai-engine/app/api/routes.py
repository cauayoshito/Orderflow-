"""Endpoints da OrderFlow Intelligence.

Quatro rotas de inteligência sobre os dados reais do banco:
  - GET /insights         → painel consolidado de insights acionáveis
  - GET /dashboard-summary → KPIs administrativos
  - GET /stock-alerts     → alertas de estoque + produtos sem giro + reposição
  - GET /sales-analysis   → ranking, ticket médio, queda de vendas, picos
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import SQLAlchemyError

from ..config import Settings, get_settings
from ..schemas import (
    DashboardSummaryResponse,
    InsightsResponse,
    ProductDescriptionRequest,
    ProductDescriptionResponse,
    SalesAnalysisResponse,
    StockAlertsResponse,
)
from ..services import content_service, insights_service

router = APIRouter()


def _guard(fn, *args):
    """Executa um builder traduzindo falhas de banco em 503 com mensagem clara."""
    try:
        return fn(*args)
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Falha ao acessar o banco de dados: {exc.__class__.__name__}.",
        ) from exc


@router.get("/insights", response_model=InsightsResponse, tags=["intelligence"])
def insights(settings: Settings = Depends(get_settings)) -> InsightsResponse:
    """Insights administrativos consolidados (vendas + estoque + clientes)."""
    return InsightsResponse(**_guard(insights_service.build_insights, settings))


@router.get("/dashboard-summary", response_model=DashboardSummaryResponse, tags=["intelligence"])
def dashboard_summary(settings: Settings = Depends(get_settings)) -> DashboardSummaryResponse:
    """KPIs do negócio: vendas, pedidos, ticket médio e estoque baixo."""
    return DashboardSummaryResponse(**_guard(insights_service.build_dashboard_summary, settings))


@router.get("/stock-alerts", response_model=StockAlertsResponse, tags=["intelligence"])
def stock_alerts(settings: Settings = Depends(get_settings)) -> StockAlertsResponse:
    """Alertas de estoque baixo, produtos sem giro e reposição sugerida."""
    return StockAlertsResponse(**_guard(insights_service.build_stock_alerts, settings))


@router.get("/sales-analysis", response_model=SalesAnalysisResponse, tags=["intelligence"])
def sales_analysis(
    window_days: int = Query(default=7, ge=1, le=90, description="Tamanho da janela de comparação (dias)."),
    settings: Settings = Depends(get_settings),
) -> SalesAnalysisResponse:
    """Análise de vendas: ranking, ticket médio, queda e horários de pico."""
    return SalesAnalysisResponse(**_guard(insights_service.build_sales_analysis, settings, window_days))


@router.post("/product-description", response_model=ProductDescriptionResponse, tags=["content"])
def product_description(req: ProductDescriptionRequest) -> ProductDescriptionResponse:
    """Gera uma descrição de marketing para um produto (NLG por template)."""
    try:
        text = content_service.generate_product_description(req.name, req.category, req.keywords)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return ProductDescriptionResponse(description=text)
