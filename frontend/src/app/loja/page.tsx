"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

const STACK = [
  "Java 17",
  "Spring Boot",
  "Next.js 14",
  "PostgreSQL",
  "Stripe",
  "Python / FastAPI",
  "WebSocket",
];

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6 py-20 sm:px-12 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            Loja demo — Spring Boot · Next.js · IA própria (Python)
          </span>
          <h1 className="font-display mt-6 whitespace-pre-line text-4xl font-bold leading-tight text-white sm:text-5xl">
            {"Commerce em tempo real,\npotencializado por IA"}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-400">
            Catálogo, carrinho, checkout Stripe, rastreamento WebSocket e insights da
            OrderFlow Intelligence — tudo conectado.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#catalog" className="btn-primary">
              Ver produtos
            </a>
            <a href="/" className="btn-secondary">
              Conhecer o OrderFlow
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {STACK.map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="catalog" className="pt-16">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Catálogo de produtos</h2>
          <p className="mt-1 text-slate-500">Produtos criados automaticamente na inicialização.</p>
        </div>

        {loading && <p className="text-slate-500">Carregando produtos…</p>}
        {error && (
          <div className="card border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-slate-500">Nenhum produto cadastrado ainda.</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
