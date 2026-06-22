"""Análise de vendas: ranking de produtos, ticket médio, detecção de queda
e horários de pico. Trabalha sobre o DataFrame de linhas de venda.

Vendas válidas excluem pedidos CANCELED.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from ..repository import CANCELED
from .util import WEEKDAY_PT, money


def _valid_sales(lines: pd.DataFrame) -> pd.DataFrame:
    """Filtra linhas de venda de pedidos não cancelados."""
    if lines.empty:
        return lines
    return lines[lines["status"] != CANCELED]


def top_products(lines: pd.DataFrame, window_days: int = 30, limit: int = 5) -> list[dict]:
    """Produtos mais vendidos (por unidades) na janela informada."""
    sales = _valid_sales(lines)
    if sales.empty:
        return []
    cutoff = pd.Timestamp.now() - pd.Timedelta(days=window_days)
    recent = sales[sales["order_date"] >= cutoff]
    if recent.empty:
        recent = sales  # sem vendas na janela: usa o histórico todo
    grouped = (
        recent.groupby(["product_id", "product_name"], as_index=False)
        .agg(units_sold=("quantity", "sum"), revenue=("line_total", "sum"))
        .sort_values(["units_sold", "revenue"], ascending=False)
        .head(limit)
    )
    return [
        {
            "product_id": int(r.product_id),
            "name": str(r.product_name),
            "units_sold": int(r.units_sold),
            "revenue": money(r.revenue),
        }
        for r in grouped.itertuples()
    ]


def average_ticket(lines: pd.DataFrame) -> float:
    """Ticket médio = receita válida / número de pedidos válidos distintos."""
    sales = _valid_sales(lines)
    if sales.empty:
        return 0.0
    revenue = sales["line_total"].sum()
    n_orders = sales["order_id"].nunique()
    if n_orders == 0:
        return 0.0
    return money(revenue / n_orders)


def daily_revenue(lines: pd.DataFrame) -> pd.Series:
    """Série de receita diária (indexada por data), preenchendo dias vazios."""
    sales = _valid_sales(lines)
    if sales.empty:
        return pd.Series(dtype=float)
    s = sales.copy()
    s["day"] = s["order_date"].dt.floor("D")
    daily = s.groupby("day")["line_total"].sum().sort_index()
    full_range = pd.date_range(daily.index.min(), daily.index.max(), freq="D")
    return daily.reindex(full_range, fill_value=0.0)


def detect_sales_drop(lines: pd.DataFrame, window_days: int = 7, threshold: float = 0.15) -> dict:
    """Compara a janela recente com a anterior e analisa a tendência.

    Usa variação percentual entre janelas + inclinação de uma regressão linear
    simples (mínimos quadrados) sobre a receita diária da janela recente para
    classificar a tendência. Sinaliza queda quando a variação <= -threshold.
    """
    series = daily_revenue(lines)
    result = {
        "window_days": window_days,
        "revenue_current_window": 0.0,
        "revenue_previous_window": 0.0,
        "change_pct": 0.0,
        "trend": "stable",
        "sales_drop_detected": False,
    }
    if series.empty:
        return result

    end = series.index.max()
    cur_start = end - pd.Timedelta(days=window_days - 1)
    prev_start = cur_start - pd.Timedelta(days=window_days)

    current = series.loc[series.index >= cur_start].sum()
    previous = series.loc[(series.index >= prev_start) & (series.index < cur_start)].sum()

    if previous > 0:
        change = (current - previous) / previous
    elif current > 0:
        change = 1.0   # do zero para algo positivo: crescimento
    else:
        change = 0.0

    # Tendência via inclinação da regressão linear na janela recente.
    recent = series.loc[series.index >= cur_start]
    trend = "stable"
    if len(recent) >= 2 and recent.sum() > 0:
        x = np.arange(len(recent))
        slope = np.polyfit(x, recent.values, 1)[0]
        avg = recent.mean() or 1.0
        norm_slope = slope / avg  # inclinação relativa ao patamar médio
        if norm_slope > 0.05:
            trend = "up"
        elif norm_slope < -0.05:
            trend = "down"

    result.update(
        revenue_current_window=money(current),
        revenue_previous_window=money(previous),
        change_pct=round(float(change), 4),
        trend=trend,
        sales_drop_detected=bool(change <= -abs(threshold)),
    )
    return result


def peak_hours(lines: pd.DataFrame, limit: int = 3) -> list[dict]:
    """Horários de pico por hora do dia (contagem de pedidos distintos)."""
    sales = _valid_sales(lines)
    if sales.empty:
        return []
    orders = sales.drop_duplicates("order_id").copy()
    orders["hour"] = orders["order_date"].dt.hour
    counts = orders.groupby("hour")["order_id"].count().sort_values(ascending=False).head(limit)
    return [{"hour": int(h), "orders": int(c)} for h, c in counts.items()]


def peak_weekdays(lines: pd.DataFrame, limit: int = 3) -> list[dict]:
    """Dias da semana de pico (contagem de pedidos distintos)."""
    sales = _valid_sales(lines)
    if sales.empty:
        return []
    orders = sales.drop_duplicates("order_id").copy()
    orders["weekday"] = orders["order_date"].dt.weekday
    counts = orders.groupby("weekday")["order_id"].count().sort_values(ascending=False).head(limit)
    return [{"weekday": WEEKDAY_PT[int(d)], "orders": int(c)} for d, c in counts.items()]
