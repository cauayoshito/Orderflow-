import { appUrl, baseEmail, button, escapeHtml, formatBRL } from "./layout";

export interface OrderConfirmationItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderConfirmationData {
  customerName: string;
  orderId: number | string;
  items: OrderConfirmationItem[];
  total: number;
  estimatedDelivery?: string;
}

export function orderConfirmationEmail(data: OrderConfirmationData): { subject: string; html: string } {
  const estimated =
    data.estimatedDelivery ??
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR");

  const rows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;color:#334155;">${escapeHtml(item.productName)}</td>
        <td style="padding:8px 0;color:#64748b;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;color:#334155;text-align:right;">${formatBRL(item.price * item.quantity)}</td>
      </tr>`,
    )
    .join("");

  const html = baseEmail(
    `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1a1a2e;">Pedido confirmado! 🎉</h1>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;">
      Olá ${escapeHtml(data.customerName)}, recebemos o seu pagamento e seu pedido
      <strong>#${escapeHtml(String(data.orderId))}</strong> está sendo preparado.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr>
          <th align="left" style="padding:8px 0;border-bottom:2px solid #e2e8f0;font-size:13px;color:#64748b;">Produto</th>
          <th align="center" style="padding:8px 0;border-bottom:2px solid #e2e8f0;font-size:13px;color:#64748b;">Qtd.</th>
          <th align="right" style="padding:8px 0;border-bottom:2px solid #e2e8f0;font-size:13px;color:#64748b;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:12px 0 0;font-weight:700;color:#1a1a2e;border-top:2px solid #e2e8f0;">Total pago</td>
          <td style="padding:12px 0 0;font-weight:700;color:#1a1a2e;text-align:right;border-top:2px solid #e2e8f0;">${formatBRL(data.total)}</td>
        </tr>
      </tfoot>
    </table>

    <p style="margin:8px 0 24px;color:#475569;font-size:14px;">
      Entrega estimada: <strong>${escapeHtml(estimated)}</strong>
    </p>

    <p style="margin:0 0 24px;">${button("Acompanhar pedido", appUrl("/orders"))}</p>

    <p style="margin:0;color:#475569;font-size:14px;">Obrigado por comprar com a gente! 💜</p>
  `,
    { preheader: `Seu pedido #${data.orderId} foi confirmado` },
  );

  return { subject: `Pedido #${data.orderId} confirmado — OrderFlow Commerce Cloud`, html };
}
