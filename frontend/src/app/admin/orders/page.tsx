"use client";

import { useEffect, useState } from "react";
import { api, formatCurrency } from "@/lib/api";
import { triggerOrderStatusEmail } from "@/lib/email";
import { StatusBadge } from "@/components/StatusBadge";
import type { Order, OrderStatus } from "@/lib/types";

// Mirrors the backend's allowed status transitions for nicer UX.
const NEXT: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELED"],
  PAID: ["PROCESSING", "CANCELED"],
  PAYMENT_FAILED: ["CANCELED"],
  CONFIRMED: ["PROCESSING", "CANCELED"],
  PROCESSING: ["SHIPPED", "CANCELED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELED: [],
};

const LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  PAYMENT_FAILED: "Pagamento falhou",
  CONFIRMED: "Confirmado",
  PROCESSING: "Em preparação",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    api.allOrders().then((d) => setOrders(d.sort((a, b) => b.id - a.id))).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function changeStatus(id: number, status: OrderStatus) {
    setBusyId(id);
    setError(null);
    const previous = orders.find((o) => o.id === id)?.status;
    try {
      const updated = await api.updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      // Notify the customer of the status change (best-effort).
      triggerOrderStatusEmail({
        orderId: updated.id,
        customerEmail: updated.customerEmail,
        customerName: updated.customerName,
        oldStatus: previous ?? "",
        newStatus: updated.status,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Itens</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Avançar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-medium">{o.id}</td>
                <td className="px-4 py-3">
                  <div>{o.customerName}</div>
                  <div className="text-xs text-slate-400">{o.customerEmail}</div>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(o.orderDate).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {o.items.reduce((n, i) => n + i.quantity, 0)}
                </td>
                <td className="px-4 py-3">{formatCurrency(o.total)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3">
                  {NEXT[o.status].length === 0 ? (
                    <span className="text-xs text-slate-400">—</span>
                  ) : (
                    <select
                      className="input py-1"
                      disabled={busyId === o.id}
                      value=""
                      onChange={(e) => e.target.value && changeStatus(o.id, e.target.value as OrderStatus)}
                    >
                      <option value="">Alterar…</option>
                      {NEXT[o.status].map((s) => (
                        <option key={s} value={s}>
                          {LABELS[s]}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Nenhum pedido ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
