"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, formatCurrency } from "@/lib/api";
import { OrderStatusTracker } from "@/components/OrderStatusTracker";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [placed, setPlaced] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPlaced(new URLSearchParams(window.location.search).get("placed"));
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/orders");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user?.customerId) {
      if (user) setFetching(false);
      return;
    }
    api
      .myOrders(user.customerId)
      .then((data) => setOrders(data.sort((a, b) => b.id - a.id)))
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || !user) return <p className="text-slate-500">Carregando…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Meus pedidos</h1>

      {placed && (
        <div className="card mb-6 border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          Pedido #{placed} realizado com sucesso! 🎉
        </div>
      )}

      {!user.customerId && (
        <div className="card border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Esta conta não possui perfil de cliente (provavelmente é uma conta de admin).
        </div>
      )}

      {fetching && <p className="text-slate-500">Carregando pedidos…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!fetching && user.customerId && orders.length === 0 && (
        <p className="text-slate-500">Você ainda não fez nenhum pedido.</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/orders/${order.id}`} className="font-semibold hover:text-brand-700">
                  Pedido #{order.id}
                </Link>
                <p className="text-sm text-slate-500">
                  {new Date(order.orderDate).toLocaleString("pt-BR")}
                </p>
              </div>
              <OrderStatusTracker orderId={order.id} initialStatus={order.status} compact />
            </div>
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {order.items.map((item) => (
                <li key={item.productId} className="flex justify-between py-1.5">
                  <span>
                    {item.quantity}× {item.productName}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
