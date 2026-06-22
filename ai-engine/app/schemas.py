"""Contratos de resposta (Pydantic) dos endpoints da engine."""

from __future__ import annotations

from pydantic import BaseModel


# ----- Blocos reutilizáveis ----------------------------------------------
class TopProduct(BaseModel):
    product_id: int
    name: str
    units_sold: int
    revenue: float


class StatusCount(BaseModel):
    status: str
    count: int


class PeakHour(BaseModel):
    hour: int
    orders: int


class PeakWeekday(BaseModel):
    weekday: str
    orders: int


class StockAlertItem(BaseModel):
    product_id: int
    name: str
    stock_quantity: int
    severity: str          # "out_of_stock" | "critical" | "low"
    daily_velocity: float  # média de unidades vendidas por dia
    days_of_cover: float | None  # dias até zerar o estoque (None se sem giro)
    suggested_restock: int


class NoTurnoverItem(BaseModel):
    product_id: int
    name: str
    stock_quantity: int
    days_without_sales: int | None  # None => nunca vendido


class RecurringCustomer(BaseModel):
    customer_id: int
    name: str
    orders: int
    total_spent: float


class Insight(BaseModel):
    type: str       # categoria do insight (sales, inventory, customers, ...)
    severity: str   # "info" | "success" | "warning" | "critical"
    title: str
    message: str    # texto em PT-BR (NLG por template)


# ----- Respostas dos endpoints -------------------------------------------
class DashboardSummaryResponse(BaseModel):
    total_sales: float
    total_orders: int
    valid_orders: int
    canceled_orders: int
    average_ticket: float
    low_stock_count: int
    orders_by_status: list[StatusCount]
    generated_at: str
    engine: str = "orderflow-intelligence-v1"


class SalesAnalysisResponse(BaseModel):
    window_days: int
    revenue_current_window: float
    revenue_previous_window: float
    change_pct: float
    trend: str                 # "up" | "down" | "stable"
    sales_drop_detected: bool
    average_ticket: float
    top_products: list[TopProduct]
    peak_hours: list[PeakHour]
    peak_weekdays: list[PeakWeekday]
    narrative: str
    generated_at: str
    engine: str = "orderflow-intelligence-v1"


class StockAlertsResponse(BaseModel):
    low_stock_threshold: int
    no_turnover_days: int
    alerts: list[StockAlertItem]
    no_turnover: list[NoTurnoverItem]
    narrative: str
    generated_at: str
    engine: str = "orderflow-intelligence-v1"


class InsightsResponse(BaseModel):
    insights: list[Insight]
    headline: str
    recurring_customers: list[RecurringCustomer]
    generated_at: str
    engine: str = "orderflow-intelligence-v1"


# ----- Geração de conteúdo (descrição de produto) ------------------------
class ProductDescriptionRequest(BaseModel):
    name: str
    category: str | None = None
    keywords: str | None = None


class ProductDescriptionResponse(BaseModel):
    description: str
    engine: str = "orderflow-intelligence-v1"
