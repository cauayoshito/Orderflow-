import { Resend } from "resend";

export interface SendResult {
  success: boolean;
  skipped?: boolean;
  id?: string;
  error?: string;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

/**
 * Sends an email via Resend with graceful degradation: when RESEND_API_KEY is
 * not configured the call is logged and skipped (success: true, skipped: true)
 * so the main user flow never breaks because of email.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("Email not sent: RESEND_API_KEY not configured");
    return { success: true, skipped: true };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      console.error("Resend send error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("Resend send threw:", message);
    return { success: false, error: message };
  }
}

/**
 * Verifies the internal shared secret for server-to-server routes.
 *
 * If INTERNAL_API_SECRET is not set, the check is skipped so the demo works
 * end-to-end from the browser. When it IS set, the caller must send a matching
 * `x-internal-secret` header — which locks these routes to trusted server-side
 * callers (e.g. the Java backend or the Stripe webhook).
 */
export function isInternalAuthorized(request: Request): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return true;
  return request.headers.get("x-internal-secret") === secret;
}
