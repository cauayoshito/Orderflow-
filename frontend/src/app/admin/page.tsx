"use client";

import { useCallback, useEffect, useState } from "react";
import { api, formatCurrency } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import type { AiTextResponse, DashboardData } from "@/lib/types";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.dashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data)
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    );

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi
          label="Total de vendas"
          value={formatCurrency(data.totalSales)}
          accent="text-emerald-600"
          border="border-t-emerald-500"
        />
        <Kpi
          label="Total de pedidos"
          value={String(data.totalOrders)}
          accent="text-brand-600"
          border="border-t-indigo-500"
        />
        <Kpi
          label="Produtos com estoque baixo"
          value={String(data.lowStockProducts.length)}
          accent="text-amber-600"
          border="border-t-amber-500"
        />
      </div>

      {/* Orders by status */}
      <section className="card p-6">
        <h2 className="mb-4 text-lg font-semibold">Pedidos por status</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(data.ordersByStatus).map(([status, count]) => (
            <div key={status} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className="mt-1 flex justify-center">
                <StatusBadge status={status as any} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Low stock */}
        <section className="card p-6">
          <h2 className="mb-4 text-lg font-semibold">Estoque baixo</h2>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum produto com estoque baixo. 👍</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {data.lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span>{p.name}</span>
                  <span className="badge bg-amber-100 text-amber-700">{p.stockQuantity} un.</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent orders */}
        <section className="card p-6">
          <h2 className="mb-4 text-lg font-semibold">Pedidos recentes</h2>
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500">Sem pedidos ainda.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {data.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2">
                  <div>
                    <span className="font-medium">#{o.id}</span>{" "}
                    <span className="text-slate-500">{o.customerName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{formatCurrency(o.total)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <AiInsights />
    </div>
  );
}

function Kpi({
  label,
  value,
  accent,
  border,
}: {
  label: string;
  value: string;
  accent: string;
  border: string;
}) {
  return (
    <div className={`card border-t-4 p-6 ${border}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function AiInsights() {
  const [summary, setSummary] = useState<AiTextResponse | null>(null);
  const [suggestions, setSuggestions] = useState<AiTextResponse | null>(null);
  const [loading, setLoading] = useState<"summary" | "suggestions" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (kind: "summary" | "suggestions") => {
    setError(null);
    setLoading(kind);
    try {
      if (kind === "summary") setSummary(await api.aiWeeklySummary());
      else setSuggestions(await api.aiLowStockSuggestions());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  }, []);

  return (
    <section className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <h2 className="text-lg font-semibold">Insights de IA (Claude)</h2>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Gere um resumo das vendas da semana e sugestões de ações para produtos com estoque baixo.
      </p>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <button onClick={() => run("summary")} disabled={loading === "summary"} className="btn-secondary">
            {loading === "summary" ? "Gerando…" : "Resumir vendas da semana"}
          </button>
          {summary && (
            <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              {summary.result}
            </p>
          )}
        </div>
        <div>
          <button
            onClick={() => run("suggestions")}
            disabled={loading === "suggestions"}
            className="btn-secondary"
          >
            {loading === "suggestions" ? "Gerando…" : "Sugerir ações p/ estoque baixo"}
          </button>
          {suggestions && (
            <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              {suggestions.result}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
