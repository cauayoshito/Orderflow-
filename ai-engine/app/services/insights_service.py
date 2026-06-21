"""Orquestrador da engine: monta as respostas dos quatro endpoints combinando
os serviços de vendas, estoque e clientes, e o NLG.

Carrega os DataFrames uma única vez por requisição e os repassa aos serviços.
"""

from __future__ import annotations

from datetime import datetime, timezone

import pandas as pd

from .. import repository as repo
from ..config import Settings
from . import customer_service, inventory_service, nlg, sales_service
from .util import money


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _orders_by_status(orders: pd.DataFrame) -> list[dict]:
    if orders.empty:
        return []
    counts = orders.groupby("status")["order_id"].count()
    return [{"status": str(s), "count": int(c)} for s, c in counts.items()]


# ----- /dashboard-summary -------------------------------------------------
def build_dashboard_summary(settings: Settings) -> dict:
    orders = repo.load_orders()
    lines = repo.load_sales_lines()
    products = repo.load_products()

    if orders.empty:
        total_sales = 0.0
        valid = canceled = total = 0
    else:
        valid_orders = orders[orders["status"] != repo.CANCELED]
        canceled = int((orders["status"] == repo.CANCELED).sum())
        total = int(len(orders))
        valid = int(len(valid_orders))
        total_sales = money(lines[lines["status"] != repo.CANCELED]["line_total"].sum()) if not lines.empty else 0.0

    low_stock_count = (
        int((products["stock_quantity"] <= settings.low_stock_threshold).sum())
        if not products.empty
        else 0
    )

    return {
        "total_sales": total_sales,
        "total_orders": total,
        "valid_orders": valid,
        "canceled_orders": canceled,
        "average_ticket": sales_service.average_ticket(lines),
        "low_stock_count": low_stock_count,
        "orders_by_status": _orders_by_status(orders),
        "generated_at": _now_iso(),
    }


# ----- /sales-analysis ----------------------------------------------------
def build_sales_analysis(settings: Settings, window_days: int = 7) -> dict:
    lines = repo.load_sales_lines()

    drop = sales_service.detect_sales_drop(
        lines, window_days=window_days, threshold=settings.sales_drop_threshold
    )
    tops = sales_service.top_products(lines, window_days=max(window_days, 30))

    payload = {
        **drop,
        "average_ticket": sales_service.average_ticket(lines),
        "top_products": tops,
        "peak_hours": sales_service.peak_hours(lines),
        "peak_weekdays": sales_service.peak_weekdays(lines),
        "generated_at": _now_iso(),
    }
    payload["narrative"] = nlg.sales_narrative(payload, tops)
    return payload


# ----- /stock-alerts ------------------------------------------------------
def build_stock_alerts(settings: Settings) -> dict:
    products = repo.load_products()
    lines = repo.load_sales_lines()

    alerts = inventory_service.stock_alerts(
        products,
        lines,
        threshold=settings.low_stock_threshold,
        lead_time_days=settings.restock_lead_time_days,
    )
    stale = inventory_service.no_turnover(products, lines, days=settings.no_turnover_days)

    return {
        "low_stock_threshold": settings.low_stock_threshold,
        "no_turnover_days": settings.no_turnover_days,
        "alerts": alerts,
        "no_turnover": stale,
        "narrative": nlg.stock_narrative(alerts, stale),
        "generated_at": _now_iso(),
    }


# ----- /insights ----------------------------------------------------------
def build_insights(settings: Settings) -> dict:
    """Painel consolidado: combina vendas, estoque e clientes em insights
    acionáveis com texto em PT-BR."""
    lines = repo.load_sales_lines()
    products = repo.load_products()
    customers = repo.load_customers()

    dashboard = build_dashboard_summary(settings)
    sales = sales_service.detect_sales_drop(
        lines, window_days=7, threshold=settings.sales_drop_threshold
    )
    tops = sales_service.top_products(lines, window_days=30, limit=3)
    alerts = inventory_service.stock_alerts(
        products, lines,
        threshold=settings.low_stock_threshold,
        lead_time_days=settings.restock_lead_time_days,
    )
    stale = inventory_service.no_turnover(products, lines, days=settings.no_turnover_days)
    recurring = customer_service.recurring_customers(lines, customers)
    peaks = sales_service.peak_hours(lines)

    insights: list[dict] = []

    # Vendas
    if sales["sales_drop_detected"]:
        insights.append({
            "type": "sales",
            "severity": "critical",
            "title": "Queda de vendas detectada",
            "message": nlg.sales_narrative({**sales}, tops),
        })
    elif sales["trend"] == "up":
        insights.append({
            "type": "sales",
            "severity": "success",
            "title": "Vendas em crescimento",
            "message": nlg.sales_narrative({**sales}, tops),
        })
    else:
        insights.append({
            "type": "sales",
            "severity": "info",
            "title": "Desempenho de vendas",
            "message": nlg.sales_narrative({**sales}, tops),
        })

    # Produto destaque
    if tops:
        t = tops[0]
        insights.append({
            "type": "sales",
            "severity": "info",
            "title": "Produto mais vendido",
            "message": f"\"{t['name']}\" lidera com {t['units_sold']} unidade(s) vendida(s) recentemente.",
        })

    # Estoque
    if alerts:
        insights.append({
            "type": "inventory",
            "severity": "warning" if alerts[0]["severity"] == "low" else "critical",
            "title": "Estoque exige atenção",
            "message": nlg.stock_narrative(alerts, []),
        })
    if stale:
        insights.append({
            "type": "inventory",
            "severity": "warning",
            "title": "Produtos sem giro",
            "message": nlg.stock_narrative([], stale),
        })

    # Clientes
    if recurring:
        nomes = ", ".join(c["name"] for c in recurring[:3])
        insights.append({
            "type": "customers",
            "severity": "success",
            "title": "Clientes recorrentes",
            "message": f"{len(recurring)} cliente(s) recorrente(s). Destaques: {nomes}.",
        })

    # Horário de pico
    if peaks:
        h = peaks[0]
        insights.append({
            "type": "operations",
            "severity": "info",
            "title": "Horário de pico",
            "message": f"O maior volume de pedidos ocorre por volta das {h['hour']}h "
                       f"({h['orders']} pedido(s)). Planeje equipe e campanhas para esse horário.",
        })

    return {
        "insights": insights,
        "headline": nlg.headline(dashboard, sales),
        "recurring_customers": recurring,
        "generated_at": _now_iso(),
    }
