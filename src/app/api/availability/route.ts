import { NextResponse } from "next/server";
import { crmsGet } from "@/lib/current-rms";

/**
 * Availability Check — READ ONLY
 *
 * Reads availability from Current RMS for a set of product ids and date
 * range. Never books, never writes. Input is validated; upstream errors
 * are logged server-side, not surfaced to the client.
 */

const MAX_PRODUCT_IDS = 20;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; error: string };
type Parsed = Ok<{ startDate: string; endDate: string; productIds: number[] }> | Err;

function parseBody(body: unknown): Parsed {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }
  const b = body as Record<string, unknown>;
  const startDate = typeof b.startDate === "string" ? b.startDate : "";
  const endDate = typeof b.endDate === "string" ? b.endDate : "";
  const rawIds = Array.isArray(b.productIds) ? b.productIds : null;

  if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
    return { ok: false, error: "startDate and endDate must be YYYY-MM-DD" };
  }
  if (startDate > endDate) {
    return { ok: false, error: "startDate must be on or before endDate" };
  }
  if (!rawIds || rawIds.length === 0) {
    return { ok: false, error: "productIds is required" };
  }
  if (rawIds.length > MAX_PRODUCT_IDS) {
    return { ok: false, error: `productIds cannot exceed ${MAX_PRODUCT_IDS} items` };
  }
  const productIds: number[] = [];
  for (const id of rawIds) {
    const n = typeof id === "number" ? id : Number(id);
    if (!Number.isInteger(n) || n <= 0) {
      return { ok: false, error: "productIds must be positive integers" };
    }
    productIds.push(n);
  }

  return { ok: true, value: { startDate, endDate, productIds } };
}

// Tiny in-memory per-IP rate limiter. Good enough for Vercel Fluid Compute
// where a hot instance handles many requests; not a durable global limit.
const RATE_WINDOW_MS = 30_000;
const RATE_MAX = 10;
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
  // Light GC so the map doesn't grow unbounded on long-lived instances.
  if (rateHits.size > 1000) {
    for (const [k, v] of rateHits) {
      if (v.every((t) => now - t >= RATE_WINDOW_MS)) rateHits.delete(k);
    }
  }
  return false;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { startDate, endDate, productIds } = parsed.value;

  const results = await Promise.all(
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

        if (!res) {
          // Credentials not configured (local / preview). Don't block the user.
          return { productId, available: true };
        }
        if (!res.ok) {
          console.error(
            `[availability] upstream ${res.status} for product ${productId}`
          );
          return { productId, available: true };
        }

        const data: { availability?: { quantity_available: number }[] } =
          await res.json();
        const avail = data.availability;
        const isAvailable = avail
          ? avail.some((a) => a.quantity_available > 0)
          : true;
        return { productId, available: isAvailable };
      } catch (err) {
        console.error(`[availability] error for product ${productId}:`, err);
        return { productId, available: true };
      }
    })
  );

  const allAvailable = results.every((r) => r.available);

  return NextResponse.json({
    allAvailable,
    results,
    testMode: true,
  });
}
