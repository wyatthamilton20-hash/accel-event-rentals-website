/**
 * Current RMS API Client — WRITES (server-only).
 *
 * Kept separate from `current-rms.ts` (which is read-only by contract). All
 * writes flow through `crmsPost` and only the helpers below are exposed.
 *
 * Auth: same X-SUBDOMAIN / X-AUTH-TOKEN headers as reads, but the configured
 * `CURRENT_RMS_API_KEY` token must have write scope. If credentials are
 * missing, callers get a thrown Error — env-gate at the route level.
 */

const SUBDOMAIN = process.env.CURRENT_RMS_SUBDOMAIN;
const API_KEY = process.env.CURRENT_RMS_API_KEY;
const BASE_URL = "https://api.current-rms.com/api/v1";

// Stable Current RMS option/type IDs observed in Accel's account
// (verified via read-only probes — see `scripts/probe-rms-countries.mjs`
// pattern; these came from sample opportunity #19160 + member #30989).
export const EMAIL_TYPE_WORK = 4001;
export const PHONE_TYPE_WORK = 6001;
export const ADDRESS_TYPE_PRIMARY = 3001;
export const LAWFUL_BASIS_PROSPECT = 11001;

// Picklist option IDs — list 1000007 "Website - Which fits you best?"
export const OPT_PRIVATE_CLIENT = 1000053;
export const OPT_PROFESSIONAL_PLANNER = 1000054;

// Picklist option IDs — list 1000008 "Website - Venue Type"
export const OPT_VENUE_PRIVATE_RESIDENCE = 1000057;
export const OPT_VENUE_PROFESSIONAL = 1000056;

// Picklist option IDs — list 1000009 "Website - Event Type"
export const OPT_EVENT_WEDDING = 1000059;
export const OPT_EVENT_CORPORATE = 1000060;
export const OPT_EVENT_FUNDRAISER = 1000061;
export const OPT_EVENT_PARTY = 1000062;

// Picklist option IDs — list 1000010 "Have you used our services before?"
export const OPT_USED_BEFORE_YES = 1000065;
export const OPT_USED_BEFORE_NO = 1000064;

// Picklist option ID — list 1000002 "Customer Type" (default for inquiries)
export const OPT_CUSTOMER_TYPE_DIRECT_END_CLIENT = 1000066;

// RMS user assigned as record owner on every inquiry. The existing
// WordPress form on accelrentals.com has assigned 100% of untouched
// web-form records to user 1 (Jake McCool). Staff reassign manually
// afterward. Verified across 19/19 untouched web-form opps.
export const DEFAULT_OWNER_ID = 1;

// Picklist defaults the WordPress form sends on every Opportunity.
// Both are the picklist's default value — RMS may auto-default these,
// but mirroring WordPress eliminates any chance of divergence.
//   "Active Draft" -> "No"        (list 1000012 default)
//   "GPA Score"    -> "0.0 : N/A" (list 1000011 default — staff grade later)
export const OPP_ACTIVE_DRAFT_DEFAULT = 1000085;
export const OPP_GPA_SCORE_DEFAULT = 1000079;

async function crmsPost<T>(endpoint: string, body: unknown): Promise<T> {
  if (!SUBDOMAIN || !API_KEY) {
    throw new Error("Current RMS credentials not configured");
  }
  if (process.env.RENTAL_INQUIRY_DRY_RUN === "1") {
    console.log(
      `[crms-dry-run] POST ${endpoint}\n${JSON.stringify(body, null, 2)}`
    );
    if (endpoint === "members") {
      return { member: { id: 999, primary_address: { id: 999 } } } as T;
    }
    if (endpoint === "opportunities") {
      return { opportunity: { id: 999 } } as T;
    }
    return {} as T;
  }
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "X-SUBDOMAIN": SUBDOMAIN,
        "X-AUTH-TOKEN": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[crms] kind=network endpoint=${endpoint}`);
    console.error(`[crms] err=${msg.slice(0, 300)}`);
    throw new Error(`Current RMS network error on ${endpoint}: ${msg}`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[crms] kind=http endpoint=${endpoint} status=${res.status}`);
    console.error(`[crms] body=${text.slice(0, 300)}`);
    throw new Error(`Current RMS POST ${endpoint} -> ${res.status}: ${text.slice(0, 500)}`);
  }
  try {
    return (await res.json()) as T;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[crms] kind=parse endpoint=${endpoint}`);
    console.error(`[crms] err=${msg.slice(0, 300)}`);
    throw new Error(`Current RMS returned non-JSON response from ${endpoint}`);
  }
}

export interface OrgInput {
  name: string;
  customerTypeId: number;
}

export async function createOrganisation(input: OrgInput): Promise<{ id: number }> {
  const body = {
    member: {
      name: input.name,
      membership_type: "Organisation",
      lawful_basis_type_id: LAWFUL_BASIS_PROSPECT,
      // RMS rejects with `membership.owned_by: can't be blank` if this
      // is missing or placed at the top-level. Live web-form Org records
      // (member 30985) show owned_by nested inside the membership object.
      membership: {
        owned_by: DEFAULT_OWNER_ID,
      },
      custom_fields: {
        customer_type: input.customerTypeId,
      },
    },
  };
  const res = await crmsPost<{ member: { id: number } }>("members", body);
  return { id: res.member.id };
}

export interface ContactInput {
  organisationId: number;
  name: string;
  email: string;
  phone: string;
  address: {
    name: string;
    street: string;
    city: string;
    county: string; // state code or full name
    postcode: string;
    countryId: number;
  };
  customerTypeId: number;
}

export async function createContact(
  input: ContactInput
): Promise<{ id: number; primaryAddressId: number }> {
  const body = {
    member: {
      name: input.name,
      membership_type: "Contact",
      membership_id: input.organisationId,
      lawful_basis_type_id: LAWFUL_BASIS_PROSPECT,
      // No owned_by on Contact — live data (member 30984) shows the
      // Contact's membership object holds only {id, title, department}.
      // Ownership lives on the parent Organisation.
      emails: [{ address: input.email, type_id: EMAIL_TYPE_WORK }],
      phones: [{ number: input.phone, type_id: PHONE_TYPE_WORK }],
      // The primary address goes on `primary_address` — the `addresses`
      // array is for ADDITIONAL addresses only and rejects Primary type.
      // Live web-form Contact (30984) shows primary_address populated and
      // addresses=[]; mirror that.
      primary_address: {
        name: input.address.name,
        street: input.address.street,
        city: input.address.city,
        county: input.address.county,
        postcode: input.address.postcode,
        country_id: input.address.countryId,
        type_id: ADDRESS_TYPE_PRIMARY,
      },
      custom_fields: {
        customer_type: input.customerTypeId,
      },
    },
  };
  const res = await crmsPost<{
    member: {
      id: number;
      primary_address?: { id: number };
      addresses?: Array<{ id: number }>;
    };
  }>("members", body);
  const primaryAddressId =
    res.member.primary_address?.id ?? res.member.addresses?.[0]?.id;
  if (!primaryAddressId) {
    throw new Error("Current RMS did not return a primary address id on contact create");
  }
  return { id: res.member.id, primaryAddressId };
}

export interface OpportunityInput {
  contactId: number;
  billingAddressId: number;
  subject: string;
  startsAt: string; // ISO datetime
  endsAt: string; // ISO datetime
  whichFitsYouBest: number;
  // null when client is a Professional Planner — matches live-form behaviour.
  venueType: number | null;
  // null when not collected by the form.
  eventType: number | null;
  numberOfAttendees: string;
  haveUsedBefore: number;
  tellUsAboutEvent: string;
}

export async function createOpportunity(
  input: OpportunityInput
): Promise<{ id: number }> {
  const body = {
    opportunity: {
      member_id: input.contactId,
      billing_address_id: input.billingAddressId,
      subject: input.subject,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      owned_by: DEFAULT_OWNER_ID,
      custom_fields: {
        which_fits_you_best: input.whichFitsYouBest,
        venue_type: input.venueType,
        event_type: input.eventType,
        number_of_attendees: input.numberOfAttendees,
        have_you_used_our_services_before: input.haveUsedBefore,
        tell_us_about_the_event_you_are_having: input.tellUsAboutEvent,
        active_draft: OPP_ACTIVE_DRAFT_DEFAULT,
        gpa_score: OPP_GPA_SCORE_DEFAULT,
      },
    },
  };
  const res = await crmsPost<{ opportunity: { id: number } }>(
    "opportunities",
    body
  );
  return { id: res.opportunity.id };
}
