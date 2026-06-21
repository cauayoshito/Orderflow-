"""Análise de clientes: identificação de clientes recorrentes.

Recorrente = cliente com 2 ou mais pedidos válidos (não cancelados).
"""

from __future__ import annotations

import pandas as pd

from ..repository import CANCELED
from .util import money


def recurring_customers(
    lines: pd.DataFrame,
    customers: pd.DataFrame,
    min_orders: int = 2,
    limit: int = 10,
) -> list[dict]:
    """Clientes com >= min_orders pedidos válidos, ordenados por total gasto."""
    if lines.empty:
        return []
    sales = lines[lines["status"] != CANCELED]
    if sales.empty:
        return []

    per_customer = sales.groupby("customer_id").agg(
        orders=("order_id", "nunique"),
        total_spent=("line_total", "sum"),
    )
    recurring = per_customer[per_customer["orders"] >= min_orders]
    if recurring.empty:
        return []

    name_by_id: dict = {}
    if not customers.empty:
        name_by_id = dict(zip(customers["customer_id"], customers["name"]))

    recurring = recurring.sort_values(
        ["total_spent", "orders"], ascending=False
    ).head(limit)

    return [
        {
            "customer_id": int(cid),
            "name": str(name_by_id.get(cid, f"Cliente #{int(cid)}")),
            "orders": int(row.orders),
            "total_spent": money(row.total_spent),
        }
        for cid, row in recurring.iterrows()
    ]
