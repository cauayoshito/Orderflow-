"""Consultas SQL → DataFrames.

Centraliza todo o SQL para que os serviços de análise trabalhem apenas com
DataFrames, desacoplados do esquema do banco. Espelha as tabelas mantidas pelo
backend Java: orders, order_items, products, customers.

Vendas válidas excluem pedidos com status CANCELED.
"""

from __future__ import annotations

import pandas as pd

from .db import query_df

CANCELED = "CANCELED"


def load_sales_lines() -> pd.DataFrame:
    """Linhas de venda (item a item) com data, status, cliente e produto.

    Colunas: order_id, order_date, status, customer_id, product_id,
    product_name, quantity, unit_price, line_total.
    """
    sql = """
        SELECT o.id          AS order_id,
               o.order_date  AS order_date,
               o.status      AS status,
               o.customer_id AS customer_id,
               oi.product_id AS product_id,
               p.name        AS product_name,
               oi.quantity   AS quantity,
               oi.price      AS unit_price
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p     ON p.id = oi.product_id
    """
    df = query_df(sql)
    if df.empty:
        return df
    df["order_date"] = pd.to_datetime(df["order_date"])
    df["line_total"] = df["quantity"] * df["unit_price"]
    return df


def load_orders() -> pd.DataFrame:
    """Pedidos (sem itens). Colunas: order_id, order_date, status, customer_id."""
    sql = """
        SELECT o.id AS order_id, o.order_date, o.status, o.customer_id
        FROM orders o
    """
    df = query_df(sql)
    if not df.empty:
        df["order_date"] = pd.to_datetime(df["order_date"])
    return df


def load_products() -> pd.DataFrame:
    """Catálogo. Colunas: product_id, name, price, stock_quantity."""
    sql = """
        SELECT id AS product_id, name, price, stock_quantity
        FROM products
    """
    return query_df(sql)


def load_customers() -> pd.DataFrame:
    """Clientes. Colunas: customer_id, name, email."""
    sql = """
        SELECT id AS customer_id, name, email
        FROM customers
    """
    return query_df(sql)
