"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api, formatCurrency } from "@/lib/api";
import { CheckoutForm } from "@/components/CheckoutForm";

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { lines, total, clear } = useCart();
  const router = useRouter();

  const [orderId, setOrderId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send unauthenticated users to login, preserving the destination.
  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/checkout");
  }, [loading, user, router]);

  // Support arriving at /checkout?orderId=... (e.g. on refresh during payment).
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("orderId");
    if (fromUrl) setOrderId(Number(fromUrl));
  }, []);

  if (loading || !user) return <p className="text-slate-500">Carregando…</p>;

  // Step 2: order created — collect payment.
  if (orderId) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Pagamento</h1>
        <div className="card p-6">
          <p className="mb-4 text-sm text-slate-600">
            Pedido <strong>#{orderId}</strong> criado. Conclua o pagamento abaixo.
          </p>
          <CheckoutForm orderId={orderId} />
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-bold">Nada para finalizar</h1>
        <Link href="/loja" className="btn-primary mt-6">
          Ver catálogo
        </Link>
      </div>
    );
  }

  // Step 1: review and create the order.
  async function placeOrder() {
    if (!user?.customerId) {
      setError(
        "Sua conta não possui um perfil de cliente. Faça login com uma conta de cliente para comprar.",
      );
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const order = await api.createOrder(
        user.customerId,
        lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      );
      clear();
      setOrderId(order.id);
      router.replace(`/checkout?orderId=${order.id}`);
    } catch (err: any) {
      setError(err.message || "Não foi possível criar o pedido.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold">Resumo do pedido</h2>
        <ul className="divide-y divide-slate-100">
          {lines.map((l) => (
            <li key={l.product.id} className="flex justify-between py-2 text-sm">
              <span>
                {l.quantity}× {l.product.name}
              </span>
              <span className="font-medium">{formatCurrency(l.product.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-bold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          Comprando como <strong>{user.username}</strong> ({user.email})
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button onClick={placeOrder} disabled={creating} className="btn-primary mt-6 w-full">
          {creating ? "Criando pedido…" : `Continuar para pagamento — ${formatCurrency(total)}`}
        </button>
      </div>
    </div>
  );
}
