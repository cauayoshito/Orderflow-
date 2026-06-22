"""Geração de linguagem natural (PT-BR) por templates — substitui o texto que
antes vinha de um LLM externo. Determinística e 100% offline.
"""

from __future__ import annotations

from .util import brl, pct


def sales_narrative(analysis: dict, top_products: list[dict]) -> str:
    """Narrativa curta da análise de vendas."""
    cur = brl(analysis["revenue_current_window"])
    change = analysis["change_pct"]
    window = analysis["window_days"]

    parts = [
        f"Nos últimos {window} dias, a receita foi {cur} "
        f"({pct(change)} em relação ao período anterior)."
    ]

    if analysis["sales_drop_detected"]:
        parts.append(
            "⚠️ Queda relevante de vendas detectada — vale revisar campanhas, "
            "preços e disponibilidade dos produtos principais."
        )
    elif analysis["trend"] == "up":
        parts.append("📈 A tendência recente é de crescimento. Bom momento para reforçar o estoque.")
    elif analysis["trend"] == "down":
        parts.append("📉 A tendência recente é levemente de baixa; acompanhe de perto os próximos dias.")
    else:
        parts.append("As vendas estão estáveis no período.")

    if top_products:
        nomes = ", ".join(p["name"] for p in top_products[:3])
        parts.append(f"Destaques de venda: {nomes}.")

    return " ".join(parts)


def stock_narrative(alerts: list[dict], no_turnover: list[dict]) -> str:
    """Narrativa curta dos alertas de estoque."""
    if not alerts and not no_turnover:
        return "Estoque saudável: nenhum alerta de baixo estoque ou produto sem giro no momento."

    parts: list[str] = []
    if alerts:
        out = sum(1 for a in alerts if a["severity"] == "out_of_stock")
        crit = sum(1 for a in alerts if a["severity"] == "critical")
        msg = f"{len(alerts)} produto(s) precisam de atenção no estoque"
        extra = []
        if out:
            extra.append(f"{out} esgotado(s)")
        if crit:
            extra.append(f"{crit} em nível crítico")
        if extra:
            msg += " (" + ", ".join(extra) + ")"
        parts.append(msg + ".")
        top = alerts[0]
        if top["suggested_restock"] > 0:
            parts.append(
                f"Prioridade: repor {top['suggested_restock']} unidade(s) de "
                f"\"{top['name']}\"."
            )
    if no_turnover:
        parts.append(
            f"{len(no_turnover)} produto(s) sem giro recente — considere promoção "
            "ou descontinuação para liberar capital."
        )
    return " ".join(parts)


def headline(dashboard: dict, sales: dict) -> str:
    """Manchete executiva combinando faturamento e tendência."""
    total = brl(dashboard["total_sales"])
    orders = dashboard["total_orders"]
    ticket = brl(dashboard["average_ticket"])
    base = (
        f"{orders} pedido(s), {total} em vendas e ticket médio de {ticket}."
    )
    if sales["sales_drop_detected"]:
        return base + " Atenção: queda de vendas detectada no período recente."
    if sales["trend"] == "up":
        return base + " Tendência de crescimento nas vendas recentes."
    return base
