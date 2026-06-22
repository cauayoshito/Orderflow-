"use client";

import { useEffect, useState } from "react";
import { api, formatCurrency } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import type {
  DashboardData,
  InsightSeverity,
  InsightsResponse,
  SalesAnalysisResponse,
  StockAlertsResponse,
} from "@/lib/types";

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

      <OrderFlowIntelligence />
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

const SEVERITY_STYLES: Record<InsightSeverity, string> = {
  info: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  critical: "border-red-200 bg-red-50 text-red-800",
};

const SEVERITY_ICON: Record<InsightSeverity, string> = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  critical: "🚨",
};

const STOCK_SEVERITY: Record<StockAlertsResponse["alerts"][number]["severity"], { label: string; cls: string }> = {
  out_of_stock: { label: "Esgotado", cls: "bg-red-100 text-red-700" },
  critical: { label: "Crítico", cls: "bg-amber-100 text-amber-700" },
  low: { label: "Baixo", cls: "bg-yellow-100 text-yellow-700" },
};

function OrderFlowIntelligence() {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [sales, setSales] = useState<SalesAnalysisResponse | null>(null);
  const [stock, setStock] = useState<StockAlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([api.aiInsights(), api.aiSalesAnalysis(7), api.aiStockAlerts()])
      .then(([i, s, st]) => {
        if (!active) return;
        setInsights(i);
        setSales(s);
        setStock(st);
      })
      .catch((e: any) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xl">🧠</span>
        <h2 className="text-lg font-semibold">Inteligência OrderFlow</h2>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Análise automática dos seus dados — vendas, estoque e clientes. Processada localmente,
        sem nenhuma API externa.
      </p>

      {loading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-white/70" />
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Não foi possível carregar a inteligência: {error}
        </p>
      )}

      {!loading && !error && insights && sales && stock && (
        <div className="space-y-6">
          {/* Manchete + insights */}
          <div>
            <p className="mb-3 rounded-lg bg-white p-3 text-sm font-medium text-slate-800 shadow-sm">
              {insights.headline}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {insights.insights.map((ins, idx) => (
                <div key={idx} className={`rounded-lg border p-3 text-sm ${SEVERITY_STYLES[ins.severity]}`}>
                  <div className="mb-1 font-semibold">
                    {SEVERITY_ICON[ins.severity]} {ins.title}
                  </div>
                  <p className="opacity-90">{ins.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Análise de vendas */}
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Análise de vendas (7 dias)</h3>
                <TrendBadge trend={sales.trend} drop={sales.sales_drop_detected} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Metric label="Receita no período" value={formatCurrency(sales.revenue_current_window)} />
                <Metric label="Ticket médio" value={formatCurrency(sales.average_ticket)} />
                <Metric
                  label="Variação vs. anterior"
                  value={`${(sales.change_pct * 100).toFixed(0)}%`}
                  accent={sales.change_pct < 0 ? "text-red-600" : "text-emerald-600"}
                />
                <Metric
                  label="Horário de pico"
                  value={sales.peak_hours[0] ? `${sales.peak_hours[0].hour}h` : "—"}
                />
              </div>

              <h4 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Mais vendidos
              </h4>
              {sales.top_products.length === 0 ? (
                <p className="text-sm text-slate-500">Sem vendas no período.</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {sales.top_products.map((p) => (
                    <li key={p.product_id} className="flex items-center justify-between py-1.5">
                      <span>{p.name}</span>
                      <span className="text-slate-500">
                        {p.units_sold} un. · {formatCurrency(p.revenue)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Estoque */}
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-semibold">Estoque & reposição</h3>
              {stock.alerts.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum alerta de estoque. 👍</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {stock.alerts.map((a) => (
                    <li key={a.product_id} className="flex items-center justify-between gap-2 py-1.5">
                      <span className="flex items-center gap-2">
                        <span className={`badge ${STOCK_SEVERITY[a.severity].cls}`}>
                          {STOCK_SEVERITY[a.severity].label}
                        </span>
                        {a.name}
                      </span>
                      <span className="text-slate-500">
                        {a.stock_quantity} un.
                        {a.suggested_restock > 0 && (
                          <span className="ml-2 text-brand-600">repor {a.suggested_restock}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {stock.no_turnover.length > 0 && (
                <>
                  <h4 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Sem giro
                  </h4>
                  <ul className="divide-y divide-slate-100 text-sm">
                    {stock.no_turnover.map((p) => (
                      <li key={p.product_id} className="flex items-center justify-between py-1.5">
                        <span>{p.name}</span>
                        <span className="text-slate-500">
                          {p.days_without_sales === null
                            ? "nunca vendido"
                            : `${p.days_without_sales} dias parado`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Clientes recorrentes */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-semibold">Clientes recorrentes</h3>
            {insights.recurring_customers.length === 0 ? (
              <p className="text-sm text-slate-500">Ainda não há clientes com compras repetidas.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {insights.recurring_customers.map((c) => (
                  <li key={c.customer_id} className="flex items-center justify-between py-1.5">
                    <span>{c.name}</span>
                    <span className="text-slate-500">
                      {c.orders} pedidos · {formatCurrency(c.total_spent)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accent ?? "text-slate-800"}`}>{value}</p>
    </div>
  );
}

function TrendBadge({
  trend,
  drop,
}: {
  trend: SalesAnalysisResponse["trend"];
  drop: boolean;
}) {
  if (drop) return <span className="badge bg-red-100 text-red-700">📉 Queda detectada</span>;
  if (trend === "up") return <span className="badge bg-emerald-100 text-emerald-700">📈 Em alta</span>;
  if (trend === "down") return <span className="badge bg-amber-100 text-amber-700">↘ Em baixa</span>;
  return <span className="badge bg-slate-100 text-slate-600">→ Estável</span>;
}
