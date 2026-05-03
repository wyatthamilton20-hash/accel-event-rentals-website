import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { SITE } from "@/lib/site-config";
import { CATEGORIES } from "@/lib/category-map";
import { crmsGet, getProducts } from "@/lib/current-rms";
import { log } from "@/lib/log";
import { IS_TEST_MODE, tagSubject } from "@/lib/test-mode";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getIdempotent, setIdempotent } from "@/lib/idempotency";
import { getEmailProvider } from "@/lib/email";
import {
  parseQuotePayload,
  type QuotePayload,
  type ResolvedQuoteItem,
} from "@/lib/quote-types";
import { quoteStore } from "@/lib/quote-store";

/**
 * POST /api/quotes — Quote submission pipeline
 *
 * Pipeline:
 *  1. Same-origin check (skipped in dev)
 *  2. Idempotency cache lookup
 *  3. JSON parse + validate
 *  4. Honeypot
 *  5. Rate limit (per IP, per email)
 *  6. Re-resolve product IDs against the canonical RMS catalog
 *  7. Re-check availability (soft warn — never reject)
 *  8. Generate quote ID
 *  9. Send staff email + customer auto-reply
 * 10. Optional RMS write (flagged off by default)
 * 11. Persist + cache idempotent response
 */

// Crockford base32 alphabet (no I, L, O, U).
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function randomQuoteId(): string {
  const bytes = randomBytes(5);
  let id = "";
  for (let i = 0; i < 8; i += 1) {
    id += CROCKFORD[bytes[i % bytes.length] % CROCKFORD.length];
  }
  return `QUOTE-${id}`;
}

function makeFakeQuoteId(): string {
  return randomQuoteId();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailBodies(args: {
  quoteId: string;
  payload: QuotePayload;
  resolvedItems: ResolvedQuoteItem[];
  conflicts: number[];
}): { html: string; text: string } {
  const { quoteId, payload, resolvedItems, conflicts } = args;
  const conflictSet = new Set(conflicts);

  const itemsTextLines = resolvedItems.map((it) => {
    const flag = conflictSet.has(it.id) ? " [CHECK AVAILABILITY]" : "";
    const notes = it.notes ? ` — notes: ${it.notes}` : "";
    return `  • ${it.name} (id ${it.id}) × ${it.qty}${flag}${notes}`;
  });

  const text = [
    `New quote request — ${quoteId}`,
    IS_TEST_MODE ? `(TEST MODE — review only, no booking has been made.)` : "",
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    payload.eventLocation ? `Event location: ${payload.eventLocation}` : "",
    payload.guestCount ? `Guest count: ${payload.guestCount}` : "",
    `Dates: ${payload.startDate} to ${payload.endDate}`,
    `Delivery: ${payload.delivery}`,
    payload.notes ? `Notes from customer:\n${payload.notes}` : "",
    "",
    "Items:",
    ...itemsTextLines,
    "",
    conflicts.length > 0
      ? `WARNING — possible availability conflicts on ids: ${conflicts.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const itemsHtml = resolvedItems
    .map((it) => {
      const flag = conflictSet.has(it.id)
        ? ` <strong style="color:#b42318">[check availability]</strong>`
        : "";
      const notes = it.notes
        ? `<div style="color:#666;font-size:13px">notes: ${escapeHtml(it.notes)}</div>`
        : "";
      return `<li><strong>${escapeHtml(it.name)}</strong> <span style="color:#888">(id ${it.id})</span> × ${it.qty}${flag}${notes}</li>`;
    })
    .join("");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:640px">
      <h2 style="margin:0 0 8px">New quote request</h2>
      <p style="margin:0 0 16px;color:#666">Reference: <strong>${quoteId}</strong></p>
      ${IS_TEST_MODE ? `<p style="background:#fef3c7;border:1px solid #fde68a;padding:10px 12px;border-radius:6px;color:#92400e;font-size:13px">TEST MODE — review only, no booking has been made.</p>` : ""}
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <tbody>
          <tr><td style="padding:4px 0;color:#666">Name</td><td style="padding:4px 0"><strong>${escapeHtml(payload.name)}</strong></td></tr>
          <tr><td style="padding:4px 0;color:#666">Email</td><td style="padding:4px 0">${escapeHtml(payload.email)}</td></tr>
          <tr><td style="padding:4px 0;color:#666">Phone</td><td style="padding:4px 0">${escapeHtml(payload.phone)}</td></tr>
          ${payload.eventLocation ? `<tr><td style="padding:4px 0;color:#666">Location</td><td style="padding:4px 0">${escapeHtml(payload.eventLocation)}</td></tr>` : ""}
          ${payload.guestCount ? `<tr><td style="padding:4px 0;color:#666">Guests</td><td style="padding:4px 0">${payload.guestCount}</td></tr>` : ""}
          <tr><td style="padding:4px 0;color:#666">Dates</td><td style="padding:4px 0">${payload.startDate} → ${payload.endDate}</td></tr>
          <tr><td style="padding:4px 0;color:#666">Delivery</td><td style="padding:4px 0">${payload.delivery}</td></tr>
        </tbody>
      </table>
      ${payload.notes ? `<h3 style="margin:20px 0 6px;font-size:15px">Customer notes</h3><p style="margin:0;white-space:pre-wrap">${escapeHtml(payload.notes)}</p>` : ""}
      <h3 style="margin:20px 0 6px;font-size:15px">Items</h3>
      <ul style="margin:0;padding-left:20px">${itemsHtml}</ul>
      ${conflicts.length > 0 ? `<p style="margin-top:16px;color:#b42318;font-size:13px"><strong>Warning:</strong> possible availability conflicts on ids: ${conflicts.join(", ")}</p>` : ""}
    </div>
  `.trim();

  return { html, text };
}

function buildCustomerBodies(args: {
  quoteId: string;
  payload: QuotePayload;
}): { html: string; text: string } {
  const { quoteId, payload } = args;
  const text = [
    `Aloha ${payload.name},`,
    "",
    "We received your event rental request and a team member will be in touch within one business day.",
    "",
    `Reference: ${quoteId}`,
    `Dates: ${payload.startDate} to ${payload.endDate}`,
    "",
    "Mahalo,",
    SITE.name,
    SITE.phone,
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;color:#111">
      <p>Aloha ${escapeHtml(payload.name)},</p>
      <p>We received your event rental request and a team member will be in touch within one business day.</p>
      <p style="background:#f7f7f7;border-radius:8px;padding:12px 16px">
        <strong>Reference:</strong> ${quoteId}<br />
        <strong>Dates:</strong> ${payload.startDate} → ${payload.endDate}
      </p>
      <p style="margin-top:24px">Mahalo,<br />${SITE.name}<br />${SITE.phone}</p>
    </div>
  `.trim();

  return { html, text };
}

async function buildValidProductSet(): Promise<Map<number, string>> {
  const valid = new Map<number, string>();
  const groupIds = new Set<number>();
  for (const cat of CATEGORIES) {
    for (const id of cat.groupIds) groupIds.add(id);
  }

  await Promise.all(
    Array.from(groupIds).map(async (groupId) => {
      try {
        const { products } = await getProducts({
          groupId,
          perPage: 100,
          activeOnly: true,
        });
        for (const p of products) {
          valid.set(p.id, p.name);
        }
      } catch (err) {
        log.warn("quote_catalog_fetch_failed", { groupId, err: String(err) });
      }
    })
  );

  return valid;
}

interface AvailabilityRow {
  quantity_available?: number;
}

async function checkAvailabilityConflicts(args: {
  startDate: string;
  endDate: string;
  productIds: number[];
}): Promise<number[]> {
  const { startDate, endDate, productIds } = args;
  const conflicts: number[] = [];

  await Promise.all(
    productIds.map(async (productId) => {
      try {
        const res = await crmsGet(
          "availability",
          {
            "item_ids[]": String(productId),
            starts_at: `${startDate}T00:00:00`,
            ends_at: `${endDate}T23:59:59`,
          },
          { cache: "no-store" }
        );
        if (!res || !res.ok) return; // soft-pass on missing creds / upstream errors
        const data: { availability?: AvailabilityRow[] } = await res.json();
        const rows = data.availability ?? [];
        if (rows.length === 0) return;
        const allOut = rows.every((r) => (r.quantity_available ?? 0) <= 0);
        if (allOut) conflicts.push(productId);
      } catch (err) {
        log.warn("quote_availability_check_failed", {
          productId,
          err: String(err),
        });
      }
    })
  );

  return conflicts;
}

function isSameOrigin(request: Request): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(SITE.url).origin;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  // 1. Same-origin guard
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  // 2. Idempotency cache lookup
  const idempotencyHeader = request.headers.get("Idempotency-Key");
  if (idempotencyHeader) {
    const cached = getIdempotent(idempotencyHeader);
    if (cached) {
      return NextResponse.json(cached.body, { status: cached.status });
    }
  }

  // 3. JSON parse
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  // 4. Validate
  const parsed = parseQuotePayload(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: parsed.error, field: parsed.field },
      { status: 400 }
    );
  }
  const payload = parsed.value;
  const ip = getClientIp(request);

  // 5. Honeypot — silently succeed with fake id
  if (payload.website && payload.website.length > 0) {
    log.warn("quote_honeypot_triggered", { ip, email: "[hidden]" });
    return NextResponse.json(
      { ok: true, quoteId: makeFakeQuoteId() },
      { status: 200 }
    );
  }

  // 6. Rate limit per IP
  if (rateLimit({ key: `ip:${ip}`, limit: 5, windowMs: 60_000 })) {
    return NextResponse.json(
      { ok: false, error: "Too many requests — please try again in a minute." },
      { status: 429 }
    );
  }

  // 7. Rate limit per email
  if (
    rateLimit({
      key: `email:${payload.email}`,
      limit: 3,
      windowMs: 3_600_000,
    })
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "We've already received several requests from this email. Please give us a chance to follow up before sending another.",
      },
      { status: 429 }
    );
  }

  // 8. Re-resolve product IDs
  const validProducts = await buildValidProductSet();
  const resolvedItems: ResolvedQuoteItem[] = [];
  for (const item of payload.items) {
    const name = validProducts.get(item.id);
    if (!name) {
      log.warn("quote_unknown_product_dropped", {
        productId: item.id,
        email: payload.email,
      });
      continue;
    }
    resolvedItems.push({ ...item, name });
  }

  if (resolvedItems.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "We couldn't recognize any items from your cart. Please refresh and try again.",
      },
      { status: 400 }
    );
  }

  // 9. Re-check availability (soft warn)
  const conflicts = await checkAvailabilityConflicts({
    startDate: payload.startDate,
    endDate: payload.endDate,
    productIds: resolvedItems.map((i) => i.id),
  });

  // 10. Generate quote id
  const quoteId = randomQuoteId();

  // 11. Send staff email
  const staffRecipients =
    process.env.QUOTE_NOTIFY_EMAILS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  const staffBodies = buildEmailBodies({
    quoteId,
    payload,
    resolvedItems,
    conflicts,
  });

  try {
    if (staffRecipients.length > 0) {
      await getEmailProvider().send({
        to: staffRecipients,
        subject: tagSubject(`New quote request — ${payload.name} (${quoteId})`),
        html: staffBodies.html,
        text: staffBodies.text,
      });
    } else {
      log.info("quote_staff_email_skipped", {
        quoteId,
        reason: "no_recipients_configured",
      });
    }
  } catch (err) {
    log.error("quote_email_failed", {
      quoteId,
      audience: "staff",
      err: String(err),
    });
  }

  // 12. Customer auto-reply
  const customerBodies = buildCustomerBodies({ quoteId, payload });
  try {
    await getEmailProvider().send({
      to: [payload.email],
      subject: tagSubject(`We got your request — ${quoteId}`),
      html: customerBodies.html,
      text: customerBodies.text,
    });
  } catch (err) {
    log.error("quote_email_failed", {
      quoteId,
      audience: "customer",
      err: String(err),
    });
  }

  // 13. Optional RMS write — best-effort, never fails the request.
  if (process.env.RMS_WRITE_ENABLED === "true") {
    try {
      const { createOpportunity } = await import("@/lib/current-rms");
      await createOpportunity({ quoteId, payload, items: resolvedItems });
      log.info("rms_write_succeeded", { quoteId });
    } catch (err) {
      log.error("rms_write_failed", { quoteId, err: String(err) });
    }
  } else {
    log.info("rms_write_skipped", { quoteId, reason: "flag_off" });
  }

  // 14. Persist
  try {
    await quoteStore.put(quoteId, payload);
  } catch (err) {
    log.error("quote_store_failed", { quoteId, err: String(err) });
  }

  // 15. Cache idempotency + return
  const responseBody = { ok: true as const, quoteId };
  if (idempotencyHeader) {
    setIdempotent(idempotencyHeader, { status: 200, body: responseBody });
  }

  return NextResponse.json(responseBody, { status: 200 });
}
