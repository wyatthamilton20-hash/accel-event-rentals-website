import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

/**
 * Newsletter subscribe — POST { email }
 *
 * Upserts the subscriber into a Mailchimp audience. Uses PUT with the
 * md5-lowercased-email subscriber hash so repeat submits don't 400 with
 * "Member Exists".
 *
 * Env vars (server-only, configured in Vercel):
 *   MAILCHIMP_API_KEY   — full key, e.g. "abc123...-us14"
 *   MAILCHIMP_LIST_ID   — audience id
 *   MAILCHIMP_DC        — datacenter prefix, e.g. "us14"
 *
 * If any are missing we return 503 so the UI surfaces a friendly message
 * instead of silently losing signups.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const rateHits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    rateHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  rateHits.set(ip, hits);
  return false;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again shortly." },
      { status: 429 }
    );
  }

  let email: string;
  try {
    const body = (await request.json()) as { email?: unknown };
    if (typeof body.email !== "string") {
      return NextResponse.json(
        { ok: false, error: "Email is required" },
        { status: 400 }
      );
    }
    email = body.email.trim().toLowerCase();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address" },
      { status: 400 }
    );
  }

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const dc = process.env.MAILCHIMP_DC;

  if (!apiKey || !listId || !dc) {
    console.warn("[newsletter] Mailchimp env vars not configured");
    return NextResponse.json(
      {
        ok: false,
        error:
          "Newsletter signups are not configured yet. Check back soon or email us directly.",
      },
      { status: 503 }
    );
  }

  const subscriberHash = createHash("md5").update(email).digest("hex");
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`;
  const auth = Buffer.from(`anystring:${apiKey}`).toString("base64");

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status_if_new: "subscribed",
      }),
    });

    if (!res.ok) {
      const upstream: { title?: string; detail?: string } = await res
        .json()
        .catch(() => ({}));
      console.error(
        `[newsletter] mailchimp ${res.status}: ${upstream.title ?? ""} ${upstream.detail ?? ""}`
      );
      return NextResponse.json(
        { ok: false, error: "Could not subscribe right now. Try again shortly." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] network error:", err);
    return NextResponse.json(
      { ok: false, error: "Could not subscribe right now. Try again shortly." },
      { status: 502 }
    );
  }
}
