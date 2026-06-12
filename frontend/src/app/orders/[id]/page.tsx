"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, formatCurrency } from "@/lib/api";
import { OrderStatusTracker } from "@/components/OrderStatusTracker";
import type { Order } from "@/lib/types";

export default function OrderDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=/orders/${id}`);
  }, [loading, user, router, id]);

  useEffect(() => {
    if (!user || !id) return;
    api
      .getOrder(id)
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false));
  }, [user, id]);

  if (loading || !user) return <p className="text-slate-500">Carregando…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/orders" className="text-sm text-slate-500 hover:text-brand-700">
        ← Voltar para meus pedidos
      </Link>

      {fetching && <p className="mt-4 text-slate-500">Carregando pedido…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {order && (
        <div className="mt-4 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Pedido #{order.id}</h1>
            <p className="text-sm text-slate-500">
              Realizado em {new Date(order.orderDate).toLocaleString("pt-BR")}
            </p>
          </div>

          {/* Real-time status */}
          <OrderStatusTracker orderId={order.id} initialStatus={order.status} />

          {/* Customer */}
          <section className="card p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Cliente
            </h2>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-slate-500">{order.customerEmail}</p>
          </section>

          {/* Items */}
          <section className="card p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Itens
            </h2>
            <ul className="divide-y divide-slate-100 text-sm">
              {order.items.map((item) => (
                <li key={item.productId} className="flex justify-between py-2">
                  <span>
                    {item.quantity}× {item.productName}
                    <span className="ml-2 text-slate-400">({formatCurrency(item.price)} un.)</span>
                  </span>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
