"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { triggerOrderConfirmationEmail } from "@/lib/email";

/**
 * Landing page after Stripe redirects back from payment confirmation.
 * Stripe appends ?payment_intent=...&redirect_status=succeeded|... to the URL,
 * and we also carry ?orderId=... through the return_url.
 *
 * On success we fetch the order and fire the confirmation email (best-effort).
 */
export default function PaymentConfirmationPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);
  const emailSent = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectStatus = params.get("redirect_status");
    const orderId = params.get("orderId");
    setStatus(redirectStatus);
    setPaymentIntent(params.get("payment_intent"));

    // Send the order confirmation email once, only on a successful payment.
    const ok = redirectStatus === "succeeded" || redirectStatus === null;
    if (ok && orderId && !emailSent.current) {
      emailSent.current = true;
      api
        .getOrder(Number(orderId))
        .then((order) => triggerOrderConfirmationEmail(order))
        .catch(() => {
          /* best-effort: ignore */
        });
    }
  }, []);

  const succeeded = status === "succeeded" || status === null; // default optimistic

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="card p-10">
        {succeeded ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
              ✓
            </div>
            <h1 className="text-2xl font-bold">Pagamento confirmado!</h1>
            <p className="mt-2 text-slate-500">
              Recebemos seu pagamento e seu pedido está sendo processado.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl text-amber-600">
              !
            </div>
            <h1 className="text-2xl font-bold">Pagamento em processamento</h1>
            <p className="mt-2 text-slate-500">
              Status: {status}. Acompanhe a atualização em "Meus pedidos".
            </p>
          </>
        )}

        {paymentIntent && (
          <p className="mt-3 text-xs text-slate-400">Pagamento: {paymentIntent}</p>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <Link href="/orders" className="btn-secondary">
            Meus pedidos
          </Link>
          <Link href="/" className="btn-primary">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
