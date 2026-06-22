"""Geração de descrição de produto por templates (NLG), em PT-BR e offline.

Substitui o copywriting que antes vinha de um LLM externo. É determinística:
a mesma entrada produz sempre a mesma saída (variação estável derivada do nome
do produto), mantendo as descrições honestas e sem inventar atributos.
"""

from __future__ import annotations

import hashlib

# Aberturas persuasivas (variação estável escolhida pelo hash do nome).
_OPENINGS = [
    "Conheça {name}",
    "Apresentamos {name}",
    "{name} chegou para facilitar o seu dia a dia",
    "Descubra {name}",
]

_CATEGORY_PHRASES = {
    "default": "uma escolha pensada para quem busca qualidade e bom custo-benefício.",
    "roupas": "peça versátil para compor looks com conforto e estilo.",
    "moda": "peça versátil para compor looks com conforto e estilo.",
    "eletronicos": "tecnologia prática para o seu dia a dia.",
    "casa": "ideal para deixar a sua casa mais funcional e aconchegante.",
    "beleza": "feito para realçar o que você tem de melhor.",
    "alimentos": "sabor de verdade para os seus melhores momentos.",
    "acessorios": "o detalhe certo para completar o seu visual.",
}

_CLOSINGS = [
    "Garanta o seu e sinta a diferença.",
    "Aproveite enquanto está disponível.",
    "Peça agora e receba com toda a comodidade.",
    "Uma ótima escolha para você ou para presentear.",
]


def _pick(options: list[str], seed: str, salt: str = "") -> str:
    digest = hashlib.md5((seed + salt).encode("utf-8")).hexdigest()
    return options[int(digest, 16) % len(options)]


def _normalize_category(category: str | None) -> str:
    if not category:
        return "default"
    key = category.strip().lower()
    # remove acentos comuns para casar com as chaves
    table = str.maketrans("áàâãéêíóôõúç", "aaaaeeiooouc")
    return key.translate(table)


def generate_product_description(
    name: str,
    category: str | None = None,
    keywords: str | None = None,
) -> str:
    """Monta uma descrição curta (2–3 frases) a partir do nome, categoria e
    palavras-chave informados."""
    name = (name or "").strip()
    if not name:
        raise ValueError("O nome do produto é obrigatório.")

    opening = _pick(_OPENINGS, name).format(name=name)

    cat_key = _normalize_category(category)
    cat_phrase = _CATEGORY_PHRASES.get(cat_key, _CATEGORY_PHRASES["default"])

    sentences = [f"{opening}: {cat_phrase}"]

    if keywords:
        terms = [k.strip() for k in keywords.replace(";", ",").split(",") if k.strip()]
        if terms:
            destaque = ", ".join(terms[:3])
            sentences.append(f"Destaques: {destaque}.")

    sentences.append(_pick(_CLOSINGS, name, salt="close"))
    return " ".join(sentences)
