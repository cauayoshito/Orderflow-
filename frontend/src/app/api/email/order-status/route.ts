import { NextResponse } from "next/server";
import { isInternalAuthorized, sendEmail } from "@/emails/sender";
import { orderStatusUpdateEmail } from "@/emails/order-status-update";

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

  const { orderId, customerEmail, customerName, oldStatus, newStatus } = body ?? {};
  if (!orderId || !customerEmail || !newStatus) {
    return NextResponse.json(
      { success: false, error: "Missing required fields: orderId, customerEmail, newStatus" },
      { status: 400 },
    );
  }

  const { subject, html } = orderStatusUpdateEmail({
    customerName: customerName ?? "cliente",
    orderId,
    oldStatus: oldStatus ?? "",
    newStatus,
  });

  const result = await sendEmail({ to: customerEmail, subject, html });
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}
