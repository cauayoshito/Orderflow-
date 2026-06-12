"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { api } from "@/lib/api";
import { getStripe } from "@/lib/stripe";

/**
 * Loads a PaymentIntent for the given order, then renders Stripe's
 * PaymentElement so the customer can pay. On success Stripe redirects to
 * /orders/confirmation.
 */
export function CheckoutForm({ orderId }: { orderId: number }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .createPaymentIntent(orderId)
      .then((res) => {
        setClientSecret(res.clientSecret);
        setPublishableKey(res.publishableKey);
      })
      .catch((e) => setError(e.message));
  }, [orderId]);

  // Prefer the key returned by the backend; fall back to the public env key.
  const stripePromise = useMemo<Promise<Stripe | null>>(() => {
    if (publishableKey) return loadStripe(publishableKey);
    return getStripe();
  }, [publishableKey]);

  if (error) {
    return <div className="card border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  }
  if (!clientSecret) {
    return <p className="text-slate-500">Preparando pagamento…</p>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
      <PaymentInner orderId={orderId} />
    </Elements>
  );
}

function PaymentInner({ orderId }: { orderId: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/confirmation?orderId=${orderId}`,
      },
    });

    // confirmPayment only returns when there's an immediate error; otherwise it
    // redirects to return_url.
    if (stripeError) {
      setError(stripeError.message ?? "Falha no pagamento.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn-primary w-full" disabled={!stripe || submitting}>
        {submitting ? "Processando…" : "Pagar agora"}
      </button>
      <p className="text-center text-xs text-slate-400">
        Pagamento de teste — use o cartão 4242 4242 4242 4242, qualquer data futura e CVC.
      </p>
    </form>
  );
}
