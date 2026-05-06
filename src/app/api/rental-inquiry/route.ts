import { NextResponse } from "next/server";
import {
  OPT_CUSTOMER_TYPE_DIRECT_END_CLIENT,
  OPT_EVENT_CORPORATE,
  OPT_EVENT_FUNDRAISER,
  OPT_EVENT_PARTY,
  OPT_EVENT_WEDDING,
  OPT_PRIVATE_CLIENT,
  OPT_PROFESSIONAL_PLANNER,
  OPT_USED_BEFORE_NO,
  OPT_USED_BEFORE_YES,
  OPT_VENUE_PRIVATE_RESIDENCE,
  OPT_VENUE_PROFESSIONAL,
  createContact,
  createOpportunity,
  createOrganisation,
} from "@/lib/current-rms-write";

/**
 * Rental Inquiry submission — POST.
 *
 * Performs three sequential Current RMS writes (Organisation -> Contact ->
 * Opportunity). All env-gated; if creds are missing, returns 503. If
 * RENTAL_INQUIRY_DRY_RUN=1, the crmsPost helper logs the exact RMS body for
 * each call and returns synthetic success — so we can verify payloads
 * locally without polluting the CRM with test submissions.
 *
 * Anti-spam:
 *   - hidden honeypot field "_hp_company_url" must be empty
 *   - "_t" elapsed-ms must be >= 3000
 *   - per-IP in-memory rate limit, 3 / 60s
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 3;
const MIN_FORM_TIME_MS = 3_000;

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

type ClientType = "private" | "professional";
type Venue = "residential" | "commercial";
type EventType = "wedding" | "corporate" | "fundraiser" | "party";
type UsedBefore = "yes" | "no";

interface InquiryPayload {
  clientType: ClientType;
  firstName: string;
  lastName: string;
  // Private branch
  venue?: Venue;
  // Pro Planner branch
  companyName?: string;
  companyCountryId?: number;
  companyState?: string;
  eventType: EventType;
  eventDate: string; // YYYY-MM-DD
  attendees: string;
  island: string;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingPostcode: string;
  billingCountryId: number;
  email: string;
  phone: string;
  usedBefore: UsedBefore;
  message: string;
  consent: boolean;
  _hp_company_url?: string;
  _t?: number;
}

function isString(v: unknown, max = 500): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= max;
}

function parseAndValidate(body: unknown):
  | { ok: true; data: InquiryPayload }
  | { ok: false; status: number; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, status: 400, error: "Invalid request" };
  }
  const b = body as Record<string, unknown>;

  // Honeypot — silently rejected upstream by the route handler.
  if (b._hp_company_url && String(b._hp_company_url).length > 0) {
    return { ok: false, status: 200, error: "honeypot" };
  }
  if (typeof b._t === "number" && b._t < MIN_FORM_TIME_MS) {
    return { ok: false, status: 400, error: "Submitted too quickly" };
  }

  const clientType = b.clientType;
  if (clientType !== "private" && clientType !== "professional") {
    return { ok: false, status: 400, error: "Please choose a client type" };
  }
  if (!isString(b.firstName, 80) || !isString(b.lastName, 80)) {
    return { ok: false, status: 400, error: "Please enter your name" };
  }

  // Branch validation: Private requires Venue; Pro Planner requires Company fields.
  let venue: Venue | undefined;
  let companyName: string | undefined;
  let companyCountryId: number | undefined;
  let companyState: string | undefined;
  if (clientType === "private") {
    if (b.venue !== "residential" && b.venue !== "commercial") {
      return { ok: false, status: 400, error: "Please choose a venue type" };
    }
    venue = b.venue;
  } else {
    if (!isString(b.companyName, 200)) {
      return { ok: false, status: 400, error: "Please enter the company name" };
    }
    if (typeof b.companyCountryId !== "number") {
      return { ok: false, status: 400, error: "Please choose a company country" };
    }
    companyName = (b.companyName as string).trim();
    companyCountryId = b.companyCountryId;
    if (typeof b.companyState === "string" && b.companyState.length <= 80) {
      companyState = b.companyState;
    }
  }

  if (
    b.eventType !== "wedding" &&
    b.eventType !== "corporate" &&
    b.eventType !== "fundraiser" &&
    b.eventType !== "party"
  ) {
    return { ok: false, status: 400, error: "Please choose an event type" };
  }
  const eventType: EventType = b.eventType;
  if (!isString(b.eventDate, 20) || !/^\d{4}-\d{2}-\d{2}$/.test(b.eventDate as string)) {
    return { ok: false, status: 400, error: "Please choose an event date" };
  }
  if (!isString(b.attendees, 12) || !/^\d+$/.test(b.attendees as string)) {
    return { ok: false, status: 400, error: "Please enter the number of attendees" };
  }
  if (!isString(b.island, 40)) {
    return { ok: false, status: 400, error: "Please choose an island" };
  }
  if (
    !isString(b.billingStreet, 200) ||
    !isString(b.billingCity, 80) ||
    !isString(b.billingState, 80) ||
    !isString(b.billingPostcode, 20) ||
    typeof b.billingCountryId !== "number"
  ) {
    return { ok: false, status: 400, error: "Please complete the billing address" };
  }
  if (!isString(b.email, 254) || !EMAIL_RE.test(b.email as string)) {
    return { ok: false, status: 400, error: "Please enter a valid email address" };
  }
  if (!isString(b.phone, 40)) {
    return { ok: false, status: 400, error: "Please enter a phone number" };
  }
  const usedBefore = b.usedBefore;
  if (usedBefore !== "yes" && usedBefore !== "no") {
    return { ok: false, status: 400, error: "Please answer the prior-services question" };
  }
  if (typeof b.message !== "string" || b.message.length > 4000) {
    return { ok: false, status: 400, error: "Message is too long" };
  }
  if (b.consent !== true) {
    return { ok: false, status: 400, error: "Please tick the acknowledgment box" };
  }

  return {
    ok: true,
    data: {
      clientType,
      firstName: b.firstName as string,
      lastName: b.lastName as string,
      venue,
      companyName,
      companyCountryId,
      companyState,
      eventType,
      eventDate: b.eventDate as string,
      attendees: b.attendees as string,
      island: b.island as string,
      billingStreet: b.billingStreet as string,
      billingCity: b.billingCity as string,
      billingState: b.billingState as string,
      billingPostcode: b.billingPostcode as string,
      billingCountryId: b.billingCountryId as number,
      email: (b.email as string).trim().toLowerCase(),
      phone: b.phone as string,
      usedBefore,
      message: b.message,
      consent: true,
    },
  };
}

const VENUE_TO_RMS: Record<Venue, number> = {
  residential: OPT_VENUE_PRIVATE_RESIDENCE,
  commercial: OPT_VENUE_PROFESSIONAL,
};

const EVENT_TO_RMS: Record<EventType, number> = {
  wedding: OPT_EVENT_WEDDING,
  corporate: OPT_EVENT_CORPORATE,
  fundraiser: OPT_EVENT_FUNDRAISER,
  party: OPT_EVENT_PARTY,
};

function buildPayloads(d: InquiryPayload) {
  const fullName = `${d.firstName.trim()} ${d.lastName.trim()}`.trim();
  const orgName = d.companyName?.trim() || fullName;
  const whichFits =
    d.clientType === "private" ? OPT_PRIVATE_CLIENT : OPT_PROFESSIONAL_PLANNER;

  // Same YYYY/MM/DD prefix the live form uses, but we PRESERVE the user's
  // textarea content (live form drops it).
  const datePrefix = d.eventDate.replace(/-/g, "/");
  const subject = `${datePrefix}: ${fullName}`;
  const tellUs = d.message.trim()
    ? `${subject}\n\n${d.message.trim()}`
    : subject;

  return {
    org: {
      name: orgName,
      customerTypeId: OPT_CUSTOMER_TYPE_DIRECT_END_CLIENT,
    },
    contact: (organisationId: number) => ({
      organisationId,
      name: fullName,
      email: d.email,
      phone: d.phone,
      address: {
        name: fullName,
        street: d.billingStreet,
        city: d.billingCity,
        county: d.billingState,
        postcode: d.billingPostcode,
        countryId: d.billingCountryId,
      },
      customerTypeId: OPT_CUSTOMER_TYPE_DIRECT_END_CLIENT,
    }),
    opportunity: (contactId: number, billingAddressId: number) => ({
      contactId,
      billingAddressId,
      subject,
      startsAt: `${d.eventDate}T09:00:00.000Z`,
      endsAt: `${d.eventDate}T17:00:00.000Z`,
      whichFitsYouBest: whichFits,
      // venue_type is Private-only; Pro Planner submissions leave it null,
      // matching the live form (verified in RMS opp #19157).
      venueType: d.venue ? VENUE_TO_RMS[d.venue] : null,
      eventType: EVENT_TO_RMS[d.eventType],
      numberOfAttendees: d.attendees,
      haveUsedBefore:
        d.usedBefore === "yes" ? OPT_USED_BEFORE_YES : OPT_USED_BEFORE_NO,
      tellUsAboutEvent: tellUs,
    }),
  };
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    console.warn(`[rental-inquiry] kind=rate-limit ip=${ip}`);
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again shortly." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.warn(`[rental-inquiry] kind=bad-json ip=${ip}`);
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const parsed = parseAndValidate(body);
  if (!parsed.ok) {
    if (parsed.error === "honeypot") {
      console.warn(`[rental-inquiry] kind=honeypot ip=${ip}`);
      return NextResponse.json({ ok: true });
    }
    console.warn(`[rental-inquiry] kind=validation reason="${parsed.error}"`);
    return NextResponse.json(
      { ok: false, error: parsed.error },
      { status: parsed.status }
    );
  }

  if (!process.env.CURRENT_RMS_SUBDOMAIN || !process.env.CURRENT_RMS_API_KEY) {
    console.warn(`[rental-inquiry] kind=missing-creds`);
    return NextResponse.json(
      {
        ok: false,
        error:
          "We can't take inquiries online right now. Please email us directly while we get this fixed.",
      },
      { status: 503 }
    );
  }

  const payloads = buildPayloads(parsed.data);

  let orgId: number | null = null;
  let contactId: number | null = null;
  let primaryAddressId: number | null = null;

  try {
    const org = await createOrganisation(payloads.org);
    orgId = org.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[rental-inquiry] step=organisation FAIL`);
    console.error(`[rental-inquiry] err=${msg.slice(0, 300)}`);
    return NextResponse.json(
      { ok: false, error: "Could not submit your inquiry. Please try again shortly." },
      { status: 502 }
    );
  }

  try {
    const contact = await createContact(payloads.contact(orgId));
    contactId = contact.id;
    primaryAddressId = contact.primaryAddressId;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[rental-inquiry] step=contact FAIL`);
    console.error(`[rental-inquiry] orphan org=${orgId}`);
    console.error(`[rental-inquiry] err=${msg.slice(0, 300)}`);
    return NextResponse.json(
      { ok: false, error: "Could not submit your inquiry. Please try again shortly." },
      { status: 502 }
    );
  }

  try {
    const opp = await createOpportunity(
      payloads.opportunity(contactId, primaryAddressId)
    );
    console.log(
      `[rental-inquiry] success org=${orgId} contact=${contactId} opp=${opp.id}`
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[rental-inquiry] step=opportunity FAIL`);
    console.error(`[rental-inquiry] orphan org=${orgId} contact=${contactId}`);
    console.error(`[rental-inquiry] err=${msg.slice(0, 300)}`);
    return NextResponse.json(
      { ok: false, error: "Could not submit your inquiry. Please try again shortly." },
      { status: 502 }
    );
  }
}
