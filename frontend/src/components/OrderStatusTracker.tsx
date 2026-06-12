"use client";

import { useEffect, useState } from "react";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import { StatusBadge } from "@/components/StatusBadge";
import type { OrderStatus } from "@/lib/types";

// Happy-path fulfilment flow shown as a stepper.
const FLOW: OrderStatus[] = ["PENDING", "PAID", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

const STEP_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  PAYMENT_FAILED: "Pagamento falhou",
  CONFIRMED: "Confirmado",
  PROCESSING: "Em preparação",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

export function OrderStatusTracker({
  orderId,
  initialStatus,
  compact = false,
}: {
  orderId: number;
  initialStatus: OrderStatus;
  compact?: boolean;
}) {
  const { status, updatedAt, connected } = useOrderStatus(orderId);
  const current = (status ?? initialStatus) as OrderStatus;

  // Live "updated N seconds ago" counter.
  const [secondsAgo, setSecondsAgo] = useState<number | null>(null);
  useEffect(() => {
    if (!updatedAt) {
      setSecondsAgo(null);
      return;
    }
    const tick = () => setSecondsAgo(Math.max(0, Math.floor((Date.now() - updatedAt.getTime()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [updatedAt]);

  const isTerminalSide = current === "CANCELED" || current === "PAYMENT_FAILED";
  const currentIndex = FLOW.indexOf(current);

  return (
    <div className={compact ? "" : "card p-4"}>
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={current} />

        {/* Live indicator */}
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <span className="relative flex h-2.5 w-2.5">
            {connected && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                connected ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />
          </span>
          {connected ? "ao vivo" : "offline"}
        </span>

        {secondsAgo !== null && (
          <span className="text-xs text-slate-400">
            Última atualização: há {secondsAgo}s
          </span>
        )}
      </div>

      {!compact && (
        <div className="mt-4">
          {isTerminalSide ? (
            <p className="text-sm text-slate-500">
              Este pedido está <strong>{STEP_LABELS[current]}</strong>.
            </p>
          ) : (
            <ol className="flex flex-wrap items-center gap-y-3">
              {FLOW.map((step, idx) => {
                const done = currentIndex >= 0 && idx < currentIndex;
                const active = idx === currentIndex;
                return (
                  <li key={step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                          active
                            ? "bg-brand-600 text-white ring-4 ring-brand-100"
                            : done
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {done ? "✓" : idx + 1}
                      </span>
                      <span
                        className={`mt-1 text-[11px] ${
                          active ? "font-semibold text-brand-700" : "text-slate-400"
                        }`}
                      >
                        {STEP_LABELS[step]}
                      </span>
                    </div>
                    {idx < FLOW.length - 1 && (
                      <span
                        className={`mx-1 h-0.5 w-6 sm:w-10 ${
                          done ? "bg-emerald-500" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
