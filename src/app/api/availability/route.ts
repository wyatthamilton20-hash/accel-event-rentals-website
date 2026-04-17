import { NextResponse } from "next/server";

/**
 * Availability Check — READ ONLY
 *
 * Checks Current RMS for product availability on given dates.
 * This endpoint ONLY reads data. No bookings, orders, or writes.
 */

const SUBDOMAIN = process.env.CURRENT_RMS_SUBDOMAIN;
const API_KEY = process.env.CURRENT_RMS_API_KEY;
const BASE_URL = "https://api.current-rms.com/api/v1";

export async function POST(request: Request) {
  try {
    const { startDate, endDate, productIds } = await request.json();

    if (!startDate || !endDate || !productIds?.length) {
      return NextResponse.json(
        { error: "startDate, endDate, and productIds are required" },
        { status: 400 }
      );
    }

    if (!SUBDOMAIN || !API_KEY) {
      return NextResponse.json(
        { error: "API not configured" },
        { status: 500 }
      );
    }

    // Check availability for each product — READ ONLY GET requests
    const results = await Promise.all(
      (productIds as number[]).slice(0, 20).map(async (productId) => {
        const url = new URL(`${BASE_URL}/availability`);
        url.searchParams.set("item_ids[]", String(productId));
        url.searchParams.set("starts_at", `${startDate}T00:00:00`);
        url.searchParams.set("ends_at", `${endDate}T23:59:59`);

        try {
          const res = await fetch(url.toString(), {
            method: "GET", // READ ONLY
            headers: {
              "X-SUBDOMAIN": SUBDOMAIN,
              "X-AUTH-TOKEN": API_KEY,
              "Content-Type": "application/json",
            },
            cache: "no-store", // Always fresh — availability changes constantly
          });

          if (!res.ok) {
            return { productId, available: true, error: res.status };
          }

          const data = await res.json();
          // Current RMS availability endpoint returns item availability info
          const avail = data.availability;
          const isAvailable = avail ? avail.some((a: { quantity_available: number }) => a.quantity_available > 0) : true;

          return { productId, available: isAvailable };
        } catch {
          // If we can't check, assume available (don't block the user)
          return { productId, available: true };
        }
      })
    );

    const allAvailable = results.every((r) => r.available);

    return NextResponse.json({
      allAvailable,
      results,
      testMode: true, // Always flag as test mode
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
