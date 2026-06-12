// Client-side helpers that trigger the Next.js email Route Handlers.
// All are fire-and-forget: email failures must never break the main flow.

import type { Order } from "./types";

async function post(path: string, body: unknown): Promise<void> {
  try {
    await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Swallow — email is best-effort.
    console.warn(`Email trigger failed (${path}):`, err);
  }
}

export function triggerWelcomeEmail(customerEmail: string, customerName: string) {
  void post("/api/email/welcome", { customerEmail, customerName });
}

export function triggerOrderConfirmationEmail(order: Order) {
  void post("/api/email/order-confirmation", {
    orderId: order.id,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    items: order.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      price: i.price,
    })),
    total: order.total,
  });
}

export function triggerOrderStatusEmail(params: {
  orderId: number;
  customerEmail: string;
  customerName: string;
  oldStatus: string;
  newStatus: string;
}) {
  void post("/api/email/order-status", params);
}
