"""Utilitários compartilhados pelos serviços de análise."""

from __future__ import annotations


def money(value: float | int | None) -> float:
    """Arredonda valores monetários para 2 casas, tratando None como 0."""
    if value is None:
        return 0.0
    return round(float(value), 2)


def brl(value: float | int | None) -> str:
    """Formata um valor como moeda brasileira para uso em textos (NLG)."""
    v = money(value)
    return f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def pct(value: float | None) -> str:
    """Formata uma fração (0.12) como percentual textual (+12%)."""
    if value is None:
        return "0%"
    return f"{value * 100:+.0f}%"


WEEKDAY_PT = {
    0: "segunda-feira",
    1: "terça-feira",
    2: "quarta-feira",
    3: "quinta-feira",
    4: "sexta-feira",
    5: "sábado",
    6: "domingo",
}
