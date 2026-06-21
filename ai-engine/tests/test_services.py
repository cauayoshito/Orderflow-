"""Testes das regras de inteligência usando DataFrames sintéticos (sem banco)."""

from __future__ import annotations

import pandas as pd
import pytest

from app.services import content_service, customer_service, inventory_service, sales_service


def make_lines(rows: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(rows)
    df["order_date"] = pd.to_datetime(df["order_date"])
    df["line_total"] = df["quantity"] * df["unit_price"]
    return df


def days_ago(n: int) -> pd.Timestamp:
    return pd.Timestamp.now() - pd.Timedelta(days=n)


# ----- Vendas -------------------------------------------------------------
def test_top_products_ranks_by_units_and_excludes_canceled():
    lines = make_lines([
        {"order_id": 1, "order_date": days_ago(1), "status": "PAID",
         "customer_id": 1, "product_id": 10, "product_name": "A", "quantity": 5, "unit_price": 10.0},
        {"order_id": 2, "order_date": days_ago(2), "status": "PAID",
         "customer_id": 2, "product_id": 20, "product_name": "B", "quantity": 2, "unit_price": 50.0},
        {"order_id": 3, "order_date": days_ago(1), "status": "CANCELED",
         "customer_id": 3, "product_id": 20, "product_name": "B", "quantity": 99, "unit_price": 50.0},
    ])
    tops = sales_service.top_products(lines, window_days=30)
    assert tops[0]["product_id"] == 10
    assert tops[0]["units_sold"] == 5
    # O pedido cancelado não infla as unidades de B.
    b = next(t for t in tops if t["product_id"] == 20)
    assert b["units_sold"] == 2


def test_average_ticket():
    lines = make_lines([
        {"order_id": 1, "order_date": days_ago(1), "status": "PAID",
         "customer_id": 1, "product_id": 10, "product_name": "A", "quantity": 2, "unit_price": 10.0},
        {"order_id": 1, "order_date": days_ago(1), "status": "PAID",
         "customer_id": 1, "product_id": 11, "product_name": "C", "quantity": 1, "unit_price": 30.0},
        {"order_id": 2, "order_date": days_ago(2), "status": "PAID",
         "customer_id": 2, "product_id": 10, "product_name": "A", "quantity": 1, "unit_price": 10.0},
    ])
    # Receita = (2*10 + 1*30) + (1*10) = 60; pedidos = 2 -> ticket 30.0
    assert sales_service.average_ticket(lines) == 30.0


def test_detect_sales_drop_flags_decline():
    rows = []
    # Janela anterior (dias 8-14): vendas altas
    for d in range(8, 15):
        rows.append({"order_id": 100 + d, "order_date": days_ago(d), "status": "PAID",
                     "customer_id": 1, "product_id": 10, "product_name": "A",
                     "quantity": 10, "unit_price": 10.0})
    # Janela recente (dias 0-6): vendas baixas
    for d in range(0, 7):
        rows.append({"order_id": 200 + d, "order_date": days_ago(d), "status": "PAID",
                     "customer_id": 1, "product_id": 10, "product_name": "A",
                     "quantity": 1, "unit_price": 10.0})
    result = sales_service.detect_sales_drop(make_lines(rows), window_days=7, threshold=0.15)
    assert result["sales_drop_detected"] is True
    assert result["change_pct"] < 0


def test_peak_hours_detects_busiest_hour():
    rows = []
    base = pd.Timestamp.now().normalize()
    for i in range(4):
        rows.append({"order_id": i, "order_date": base.replace(hour=14),
                     "status": "PAID", "customer_id": 1, "product_id": 10,
                     "product_name": "A", "quantity": 1, "unit_price": 10.0})
    rows.append({"order_id": 99, "order_date": base.replace(hour=3),
                 "status": "PAID", "customer_id": 2, "product_id": 10,
                 "product_name": "A", "quantity": 1, "unit_price": 10.0})
    peaks = sales_service.peak_hours(make_lines(rows))
    assert peaks[0]["hour"] == 14
    assert peaks[0]["orders"] == 4


# ----- Estoque ------------------------------------------------------------
def test_stock_alerts_and_restock_suggestion():
    products = pd.DataFrame([
        {"product_id": 10, "name": "A", "price": 10.0, "stock_quantity": 0},
        {"product_id": 20, "name": "B", "price": 50.0, "stock_quantity": 4},
        {"product_id": 30, "name": "C", "price": 5.0, "stock_quantity": 100},  # estoque ok
    ])
    rows = []
    for d in range(0, 30):
        rows.append({"order_id": d, "order_date": days_ago(d), "status": "PAID",
                     "customer_id": 1, "product_id": 10, "product_name": "A",
                     "quantity": 3, "unit_price": 10.0})  # 3/dia -> velocidade 3
    alerts = inventory_service.stock_alerts(products, make_lines(rows), threshold=5, lead_time_days=7)
    ids = [a["product_id"] for a in alerts]
    assert 10 in ids and 20 in ids and 30 not in ids
    a = next(x for x in alerts if x["product_id"] == 10)
    assert a["severity"] == "out_of_stock"
    # velocidade ~3/dia * 7 dias de cobertura = ~21 a repor
    assert a["suggested_restock"] >= 21


def test_no_turnover_detects_stale_and_never_sold():
    products = pd.DataFrame([
        {"product_id": 10, "name": "A", "price": 10.0, "stock_quantity": 5},  # vendido recente
        {"product_id": 20, "name": "B", "price": 50.0, "stock_quantity": 5},  # vendido há muito tempo
        {"product_id": 30, "name": "C", "price": 5.0, "stock_quantity": 5},   # nunca vendido
    ])
    rows = [
        {"order_id": 1, "order_date": days_ago(1), "status": "PAID",
         "customer_id": 1, "product_id": 10, "product_name": "A", "quantity": 1, "unit_price": 10.0},
        {"order_id": 2, "order_date": days_ago(120), "status": "PAID",
         "customer_id": 1, "product_id": 20, "product_name": "B", "quantity": 1, "unit_price": 50.0},
    ]
    stale = inventory_service.no_turnover(products, make_lines(rows), days=60)
    ids = [s["product_id"] for s in stale]
    assert 20 in ids and 30 in ids and 10 not in ids
    never = next(s for s in stale if s["product_id"] == 30)
    assert never["days_without_sales"] is None


# ----- Clientes -----------------------------------------------------------
def test_recurring_customers():
    customers = pd.DataFrame([
        {"customer_id": 1, "name": "Ana", "email": "ana@x.com"},
        {"customer_id": 2, "name": "Beto", "email": "beto@x.com"},
    ])
    rows = [
        {"order_id": 1, "order_date": days_ago(1), "status": "PAID",
         "customer_id": 1, "product_id": 10, "product_name": "A", "quantity": 1, "unit_price": 100.0},
        {"order_id": 2, "order_date": days_ago(2), "status": "PAID",
         "customer_id": 1, "product_id": 10, "product_name": "A", "quantity": 1, "unit_price": 100.0},
        {"order_id": 3, "order_date": days_ago(3), "status": "PAID",
         "customer_id": 2, "product_id": 10, "product_name": "A", "quantity": 1, "unit_price": 10.0},
    ]
    recurring = customer_service.recurring_customers(make_lines(rows), customers, min_orders=2)
    assert len(recurring) == 1
    assert recurring[0]["customer_id"] == 1
    assert recurring[0]["orders"] == 2


# ----- Bordas -------------------------------------------------------------
def test_empty_data_is_safe():
    empty = pd.DataFrame()
    assert sales_service.top_products(empty) == []
    assert sales_service.average_ticket(empty) == 0.0
    assert sales_service.peak_hours(empty) == []
    assert inventory_service.stock_alerts(empty, empty) == []
    assert customer_service.recurring_customers(empty, empty) == []
    drop = sales_service.detect_sales_drop(empty)
    assert drop["sales_drop_detected"] is False


# ----- Conteúdo (descrição de produto) -----------------------------------
def test_product_description_is_deterministic_and_uses_inputs():
    d1 = content_service.generate_product_description("Camiseta Premium", "Roupas", "algodão, confortável")
    d2 = content_service.generate_product_description("Camiseta Premium", "Roupas", "algodão, confortável")
    assert d1 == d2                       # determinístico
    assert "Camiseta Premium" in d1       # usa o nome
    assert "algodão" in d1                # incorpora palavras-chave
    assert len(d1) > 20


def test_product_description_requires_name():
    with pytest.raises(ValueError):
        content_service.generate_product_description("")


if __name__ == "__main__":
    raise SystemExit(pytest.main([__file__, "-v"]))
