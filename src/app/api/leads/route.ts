import { NextRequest, NextResponse } from "next/server";

type LeadPayload = {
  email?: string;
  intent?: string;
  placement?: string;
  sourcePath?: string;
};

const LEAD_CAPTURE_WEBHOOK_URL = process.env.LEAD_CAPTURE_WEBHOOK_URL || "";
const LEAD_CAPTURE_TO_EMAIL =
  process.env.LEAD_CAPTURE_TO_EMAIL || process.env.SUPPORT_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "";
const LEAD_CAPTURE_FROM_EMAIL = process.env.LEAD_CAPTURE_FROM_EMAIL || "TarotDeck.online <onboarding@resend.dev>";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatLeadText(payload: Required<Pick<LeadPayload, "email" | "intent">> & LeadPayload) {
  return [
    `Email: ${payload.email}`,
    `Intent: ${payload.intent}`,
    payload.placement ? `Placement: ${payload.placement}` : "",
    payload.sourcePath ? `Source: ${payload.sourcePath}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function deliverToWebhook(payload: Required<Pick<LeadPayload, "email" | "intent">> & LeadPayload) {
  if (!LEAD_CAPTURE_WEBHOOK_URL) return false;

  const response = await fetch(LEAD_CAPTURE_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Lead webhook failed with ${response.status}`);
  }

  return true;
}

async function deliverViaResend(payload: Required<Pick<LeadPayload, "email" | "intent">> & LeadPayload) {
  if (!RESEND_API_KEY || !LEAD_CAPTURE_TO_EMAIL) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: LEAD_CAPTURE_FROM_EMAIL,
      to: [LEAD_CAPTURE_TO_EMAIL],
      reply_to: payload.email,
      subject: `TarotDeck.online lead: ${payload.intent}`,
      text: formatLeadText(payload),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend lead delivery failed: ${errorText}`);
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LeadPayload;
    const email = String(body.email || "").trim().toLowerCase();
    const intent = String(body.intent || "").trim() || "first-deck";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
    }

    const payload = {
      email,
      intent,
      placement: body.placement?.trim() || "unknown",
      sourcePath: body.sourcePath?.trim() || "",
      submittedAt: new Date().toISOString(),
    };

    let delivered = false;

    delivered = (await deliverToWebhook(payload)) || delivered;
    delivered = (await deliverViaResend(payload)) || delivered;

    console.log("[lead_capture]", JSON.stringify(payload));

    return NextResponse.json({
      delivered,
      message: "Thanks. We saved your tarot guide request and will follow up soon.",
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not save your request." },
      { status: 500 }
    );
  }
}
