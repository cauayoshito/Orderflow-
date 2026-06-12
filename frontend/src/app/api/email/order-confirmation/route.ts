import { NextResponse } from "next/server";
import { isInternalAuthorized, sendEmail } from "@/emails/sender";
import { orderConfirmationEmail } from "@/emails/order-confirmation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isInternalAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { orderId, customerEmail, customerName, items, total } = body ?? {};
  if (!orderId || !customerEmail || !Array.isArray(items)) {
    return NextResponse.json(
      { success: false, error: "Missing required fields: orderId, customerEmail, items" },
      { status: 400 },
    );
  }

  const { subject, html } = orderConfirmationEmail({
    customerName: customerName ?? "cliente",
    orderId,
    items,
    total: Number(total) || 0,
  });

  const result = await sendEmail({ to: customerEmail, subject, html });
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}
