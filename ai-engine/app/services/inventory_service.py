"""Análise de estoque: alertas de baixo estoque, produtos sem giro e sugestão
de reposição baseada na velocidade real de vendas.

A reposição sugerida cobre ``lead_time_days`` de demanda projetada a partir da
velocidade média (unidades/dia) observada nas vendas recentes, descontando o
estoque atual.
"""

from __future__ import annotations

import math

import pandas as pd

from ..repository import CANCELED


def _velocity(lines: pd.DataFrame, window_days: int = 30) -> pd.Series:
    """Velocidade de vendas (unidades/dia) por produto na janela recente."""
    if lines.empty:
        return pd.Series(dtype=float)
    sales = lines[lines["status"] != CANCELED]
    if sales.empty:
        return pd.Series(dtype=float)
    cutoff = pd.Timestamp.now() - pd.Timedelta(days=window_days)
    recent = sales[sales["order_date"] >= cutoff]
    if recent.empty:
        return pd.Series(dtype=float)
    units = recent.groupby("product_id")["quantity"].sum()
    return units / float(window_days)


def _last_sale_dates(lines: pd.DataFrame) -> pd.Series:
    """Data da última venda por produto (pedidos não cancelados)."""
    if lines.empty:
        return pd.Series(dtype="datetime64[ns]")
    sales = lines[lines["status"] != CANCELED]
    if sales.empty:
        return pd.Series(dtype="datetime64[ns]")
    return sales.groupby("product_id")["order_date"].max()


def stock_alerts(
    products: pd.DataFrame,
    lines: pd.DataFrame,
    threshold: int = 5,
    lead_time_days: int = 7,
) -> list[dict]:
    """Produtos com estoque <= threshold, com severidade e reposição sugerida."""
    if products.empty:
        return []
    velocity = _velocity(lines)
    low = products[products["stock_quantity"] <= threshold]

    alerts: list[dict] = []
    for p in low.itertuples():
        stock = int(p.stock_quantity)
        v = float(velocity.get(p.product_id, 0.0))

        if stock <= 0:
            severity = "out_of_stock"
        elif stock <= max(1, threshold // 2):
            severity = "critical"
        else:
            severity = "low"

        days_cover = round(stock / v, 1) if v > 0 else None
        # Repor para cobrir o lead time de demanda projetada, menos o que há.
        target = math.ceil(v * lead_time_days)
        suggested = max(target - stock, 0)
        # Garante reposição mínima para itens zerados que já tiveram giro.
        if stock <= 0 and v > 0 and suggested == 0:
            suggested = max(1, math.ceil(v * lead_time_days))

        alerts.append(
            {
                "product_id": int(p.product_id),
                "name": str(p.name),
                "stock_quantity": stock,
                "severity": severity,
                "daily_velocity": round(v, 3),
                "days_of_cover": days_cover,
                "suggested_restock": int(suggested),
            }
        )

    # Mais urgentes primeiro: sem estoque > crítico > baixo, depois menor cobertura.
    order = {"out_of_stock": 0, "critical": 1, "low": 2}
    alerts.sort(key=lambda a: (order[a["severity"]], a["stock_quantity"]))
    return alerts


def no_turnover(products: pd.DataFrame, lines: pd.DataFrame, days: int = 60) -> list[dict]:
    """Produtos em estoque sem vendas há `days` dias (ou nunca vendidos)."""
    if products.empty:
        return []
    last_sale = _last_sale_dates(lines)
    now = pd.Timestamp.now()
    cutoff = now - pd.Timedelta(days=days)

    items: list[dict] = []
    for p in products.itertuples():
        if int(p.stock_quantity) <= 0:
            continue  # sem estoque parado não é "sem giro" relevante
        last = last_sale.get(p.product_id, pd.NaT)
        if pd.isna(last):
            items.append(
                {
                    "product_id": int(p.product_id),
                    "name": str(p.name),
                    "stock_quantity": int(p.stock_quantity),
                    "days_without_sales": None,  # nunca vendido
                }
            )
        elif last < cutoff:
            items.append(
                {
                    "product_id": int(p.product_id),
                    "name": str(p.name),
                    "stock_quantity": int(p.stock_quantity),
                    "days_without_sales": int((now - last).days),
                }
            )

    # Nunca vendidos primeiro; depois maior tempo parado.
    items.sort(key=lambda i: (i["days_without_sales"] is not None, -(i["days_without_sales"] or 10**9)))
    return items
