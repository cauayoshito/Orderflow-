"use client";

import { useEffect, useState } from "react";
import { api, formatCurrency } from "@/lib/api";
import type { Coupon, GrowthMetrics, LeadResponse } from "@/lib/types";

export default function GrowthPage() {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [leads, setLeads] = useState<LeadResponse[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const [m, l, c] = await Promise.all([api.growthMetrics(), api.leads(), api.coupons()]);
      setMetrics(m);
      setLeads(l);
      setCoupons(c);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Leads capturados" value={String(metrics.totalLeads)} />
        <Kpi label="Convertidos" value={String(metrics.convertedLeads)} accent="text-emerald-600" />
        <Kpi label="Taxa de conversão" value={`${(metrics.conversionRate * 100).toFixed(1)}%`} accent="text-brand-600" />
        <Kpi label="Via indicação" value={String(metrics.referredLeads)} accent="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Leads por canal */}
        <section className="card p-6">
          <h2 className="mb-4 text-lg font-semibold">Leads por canal</h2>
          {Object.keys(metrics.leadsBySource).length === 0 ? (
            <p className="text-sm text-slate-500">Ainda sem leads.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {Object.entries(metrics.leadsBySource)
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => (
                  <li key={source} className="flex items-center justify-between">
                    <span className="capitalize">{source}</span>
                    <span className="badge bg-slate-100 text-slate-700">{count}</span>
                  </li>
                ))}
            </ul>
          )}
        </section>

        {/* Top indicadores */}
        <section className="card p-6">
          <h2 className="mb-4 text-lg font-semibold">Top indicadores (afiliados)</h2>
          {metrics.topReferrers.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma indicação ainda.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {metrics.topReferrers.map((r) => (
                <li key={r.code} className="flex items-center justify-between">
                  <code className="rounded bg-slate-100 px-2 py-0.5">{r.code}</code>
                  <span className="text-slate-500">{r.count} indicação(ões)</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Cupons */}
      <CouponManager coupons={coupons} onChange={refresh} />

      {/* Leads recentes */}
      <section className="card p-6">
        <h2 className="mb-4 text-lg font-semibold">Leads recentes</h2>
        {leads.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum lead capturado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr className="border-b">
                  <th className="py-2">Nome</th>
                  <th className="py-2">E-mail</th>
                  <th className="py-2">Canal</th>
                  <th className="py-2">Código</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 20).map((l) => (
                  <tr key={l.id} className="border-b last:border-0">
                    <td className="py-2">{l.name}</td>
                    <td className="py-2 text-slate-500">{l.email}</td>
                    <td className="py-2 capitalize">{l.source ?? "—"}</td>
                    <td className="py-2"><code className="text-xs">{l.referralCode}</code></td>
                    <td className="py-2">
                      <span className="badge bg-slate-100 text-slate-700">{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent ?? "text-slate-800"}`}>{value}</p>
    </div>
  );
}

function CouponManager({ coupons, onChange }: { coupons: Coupon[]; onChange: () => void }) {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [value, setValue] = useState("10");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.createCoupon({ code, type, value: Number(value) });
      setCode("");
      setValue("10");
      onChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    await api.deleteCoupon(id);
    onChange();
  }

  return (
    <section className="card p-6">
      <h2 className="mb-4 text-lg font-semibold">Cupons & promoções</h2>

      <form onSubmit={create} className="mb-5 flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Código</label>
          <input className="input w-40" value={code} onChange={(e) => setCode(e.target.value)} required placeholder="PROMO10" />
        </div>
        <div>
          <label className="label">Tipo</label>
          <select className="input w-36" value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="PERCENT">Percentual (%)</option>
            <option value="FIXED">Valor fixo (R$)</option>
          </select>
        </div>
        <div>
          <label className="label">Valor</label>
          <input className="input w-28" type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} required />
        </div>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? "Salvando…" : "Criar cupom"}
        </button>
      </form>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {coupons.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum cupom criado ainda.</p>
      ) : (
        <ul className="divide-y divide-slate-100 text-sm">
          {coupons.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2">
              <span className="flex items-center gap-3">
                <code className="rounded bg-slate-100 px-2 py-0.5 font-semibold">{c.code}</code>
                <span className="text-slate-500">
                  {c.type === "PERCENT" ? `${c.value}%` : formatCurrency(c.value)} de desconto
                </span>
                {!c.active && <span className="badge bg-slate-100 text-slate-500">inativo</span>}
                <span className="text-xs text-slate-400">{c.timesRedeemed} usos</span>
              </span>
              <button onClick={() => remove(c.id)} className="btn btn-danger px-3 py-1 text-xs">
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
