"use client";

import { useEffect, useState } from "react";
import { api, formatCurrency } from "@/lib/api";
import type { Product } from "@/lib/types";

interface FormState {
  id: number | null;
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
}

const EMPTY: FormState = { id: null, name: "", description: "", price: "", stockQuantity: "" };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  function load() {
    api.listProducts().then(setProducts).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  function edit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      stockQuantity: String(p.stockQuantity),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stockQuantity: form.stockQuantity === "" ? 0 : Number(form.stockQuantity),
    };
    try {
      if (form.id) await api.updateProduct(form.id, payload);
      else await api.createProduct(payload);
      setForm(EMPTY);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Remover este produto?")) return;
    try {
      await api.deleteProduct(id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function generateDescription() {
    if (!form.name.trim()) {
      setError("Informe o nome do produto antes de gerar a descrição.");
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const res = await api.aiProductDescription(form.name);
      setForm((f) => ({ ...f, description: res.result }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="card p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {form.id ? `Editar produto #${form.id}` : "Novo produto"}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Nome</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="label">Descrição</label>
              <button
                type="button"
                onClick={generateDescription}
                disabled={aiLoading}
                className="text-xs font-medium text-brand-700 hover:underline disabled:opacity-50"
              >
                {aiLoading ? "Gerando…" : "✨ Gerar com IA"}
              </button>
            </div>
            <textarea
              className="input min-h-[80px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Preço (R$)</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Estoque</label>
            <input
              className="input"
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button className="btn-primary" disabled={saving}>
            {saving ? "Salvando…" : form.id ? "Salvar alterações" : "Criar produto"}
          </button>
          {form.id && (
            <button type="button" className="btn-secondary" onClick={() => setForm(EMPTY)}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{p.name}</div>
                  <div className="line-clamp-1 text-xs text-slate-400">{p.description}</div>
                </td>
                <td className="px-4 py-3">{formatCurrency(p.price)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      p.stockQuantity <= 5 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {p.stockQuantity}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => edit(p)} className="text-brand-700 hover:underline">
                    Editar
                  </button>
                  <button onClick={() => remove(p.id)} className="ml-4 text-red-600 hover:underline">
                    Remover
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
