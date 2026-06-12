import { NextResponse } from "next/server";
import { sendEmail } from "@/emails/sender";
import { welcomeEmail } from "@/emails/welcome";

export const runtime = "nodejs";

// No internal-secret guard: this is triggered by the client right after signup.
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { customerEmail, customerName } = body ?? {};
  if (!customerEmail) {
    return NextResponse.json(
      { success: false, error: "Missing required field: customerEmail" },
      { status: 400 },
    );
  }

  const { subject, html } = welcomeEmail({ customerName: customerName ?? "cliente" });
  const result = await sendEmail({ to: customerEmail, subject, html });
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}
