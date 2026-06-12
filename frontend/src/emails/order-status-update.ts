import { appUrl, baseEmail, button, escapeHtml } from "./layout";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  PAYMENT_FAILED: "Pagamento falhou",
  CONFIRMED: "Confirmado",
  PROCESSING: "Em preparação",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

export interface OrderStatusUpdateData {
  customerName: string;
  orderId: number | string;
  oldStatus: string;
  newStatus: string;
}

function label(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function orderStatusUpdateEmail(data: OrderStatusUpdateData): { subject: string; html: string } {
  const html = baseEmail(
    `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1a1a2e;">Atualização do seu pedido</h1>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;">
      Olá ${escapeHtml(data.customerName)}, o status do pedido
      <strong>#${escapeHtml(String(data.orderId))}</strong> mudou.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
      <tr>
        <td style="color:#94a3b8;font-size:14px;padding-right:12px;">${escapeHtml(label(data.oldStatus))}</td>
        <td style="color:#94a3b8;font-size:14px;padding-right:12px;">→</td>
        <td>
          <span style="display:inline-block;background-color:#4f46e5;color:#ffffff;font-weight:700;padding:8px 16px;border-radius:999px;font-size:14px;">
            ${escapeHtml(label(data.newStatus))}
          </span>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px;">${button("Acompanhar pedido", appUrl("/orders"))}</p>
  `,
    { preheader: `Pedido #${data.orderId}: ${label(data.newStatus)}` },
  );

  return {
    subject: `Pedido #${data.orderId}: ${label(data.newStatus)} — OrderFlow Commerce Cloud`,
    html,
  };
}
