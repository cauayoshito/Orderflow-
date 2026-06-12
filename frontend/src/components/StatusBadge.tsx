import type { OrderStatus } from "@/lib/types";

const STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
  PAYMENT_FAILED: "bg-rose-100 text-rose-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELED: "bg-red-100 text-red-700",
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

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge ${STYLES[status] ?? "bg-slate-100 text-slate-700"}`}>{LABELS[status] ?? status}</span>;
}
