export interface QuoteCartItem {
  id: number;
  qty: number;
  notes?: string;
}

export interface QuotePayload {
  name: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
  guestCount?: number;
  eventLocation?: string;
  delivery: "delivery" | "pickup";
  notes?: string;
  items: QuoteCartItem[];
  website?: string;
  idempotencyKey: string;
}

export type Ok<T> = { ok: true; value: T };
export type Err = { ok: false; error: string; field?: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s\-+().]{7,30}$/;
const IDEMPOTENCY_RE = /^[A-Za-z0-9-]{8,128}$/;

const MAX_ITEMS = 50;
const MAX_QTY = 10000;
const MAX_GUESTS = 10000;

function err(error: string, field?: string): Err {
  return field ? { ok: false, error, field } : { ok: false, error };
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function parseQuotePayload(body: unknown): Ok<QuotePayload> | Err {
  if (!body || typeof body !== "object") {
    return err("Invalid request body");
  }
  const b = body as Record<string, unknown>;

  const name = asString(b.name).trim();
  if (!name) return err("Name is required", "name");
  if (name.length < 2) return err("Name must be at least 2 characters", "name");
  if (name.length > 120) return err("Name is too long", "name");

  const emailRaw = asString(b.email).trim().toLowerCase();
  if (!emailRaw) return err("Email is required", "email");
  if (emailRaw.length > 254) return err("Email is too long", "email");
  if (!EMAIL_RE.test(emailRaw)) return err("Email is invalid", "email");

  const phone = asString(b.phone).trim();
  if (!phone) return err("Phone is required", "phone");
  if (!PHONE_RE.test(phone)) return err("Phone is invalid", "phone");

  const startDate = asString(b.startDate).trim();
  if (!startDate) return err("Start date is required", "startDate");
  if (!DATE_RE.test(startDate)) return err("Start date must be YYYY-MM-DD", "startDate");

  const endDate = asString(b.endDate).trim();
  if (!endDate) return err("End date is required", "endDate");
  if (!DATE_RE.test(endDate)) return err("End date must be YYYY-MM-DD", "endDate");
  if (endDate < startDate) return err("End date must be on or after start date", "endDate");

  let guestCount: number | undefined;
  if (b.guestCount !== undefined && b.guestCount !== null && b.guestCount !== "") {
    const n = typeof b.guestCount === "number" ? b.guestCount : Number(b.guestCount);
    if (!Number.isInteger(n) || n < 1 || n > MAX_GUESTS) {
      return err("Guest count must be between 1 and 10000", "guestCount");
    }
    guestCount = n;
  }

  let eventLocation: string | undefined;
  if (b.eventLocation !== undefined && b.eventLocation !== null) {
    const loc = asString(b.eventLocation).trim();
    if (loc) {
      if (loc.length > 500) return err("Event location is too long", "eventLocation");
      eventLocation = loc;
    }
  }

  const delivery = asString(b.delivery).trim();
  if (delivery !== "delivery" && delivery !== "pickup") {
    return err("Delivery must be 'delivery' or 'pickup'", "delivery");
  }

  let notes: string | undefined;
  if (b.notes !== undefined && b.notes !== null) {
    const n = asString(b.notes).trim();
    if (n) {
      if (n.length > 2000) return err("Notes are too long", "notes");
      notes = n;
    }
  }

  if (!Array.isArray(b.items) || b.items.length === 0) {
    return err("Cart is empty", "items");
  }
  if (b.items.length > MAX_ITEMS) {
    return err(`Cart cannot exceed ${MAX_ITEMS} items`, "items");
  }
  const items: QuoteCartItem[] = [];
  for (const raw of b.items) {
    if (!raw || typeof raw !== "object") {
      return err("Cart item is invalid", "items");
    }
    const r = raw as Record<string, unknown>;
    const id = typeof r.id === "number" ? r.id : Number(r.id);
    if (!Number.isInteger(id) || id <= 0) {
      return err("Cart item id must be a positive integer", "items");
    }
    const qty = typeof r.qty === "number" ? r.qty : Number(r.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return err("Cart item qty must be a positive integer", "items");
    }
    let itemNotes: string | undefined;
    if (r.notes !== undefined && r.notes !== null) {
      const n = asString(r.notes).trim();
      if (n) {
        if (n.length > 2000) return err("Cart item notes are too long", "items");
        itemNotes = n;
      }
    }
    items.push(itemNotes ? { id, qty, notes: itemNotes } : { id, qty });
  }

  let website: string | undefined;
  if (b.website !== undefined && b.website !== null) {
    const w = asString(b.website);
    if (w.trim() !== "") {
      return err("Submission rejected", "website");
    }
    website = "";
  }

  const idempotencyKey = asString(b.idempotencyKey).trim();
  if (!idempotencyKey) return err("Idempotency key is required", "idempotencyKey");
  if (!IDEMPOTENCY_RE.test(idempotencyKey)) {
    return err("Idempotency key is invalid", "idempotencyKey");
  }

  const value: QuotePayload = {
    name,
    email: emailRaw,
    phone,
    startDate,
    endDate,
    delivery,
    items,
    idempotencyKey,
  };
  if (guestCount !== undefined) value.guestCount = guestCount;
  if (eventLocation !== undefined) value.eventLocation = eventLocation;
  if (notes !== undefined) value.notes = notes;
  if (website !== undefined) value.website = website;

  return { ok: true, value };
}
