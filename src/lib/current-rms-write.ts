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

async function crmsPost<T>(endpoint: string, body: unknown): Promise<T> {
  if (!SUBDOMAIN || !API_KEY) {
    throw new Error("Current RMS credentials not configured");
  }
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "X-SUBDOMAIN": SUBDOMAIN,
      "X-AUTH-TOKEN": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Current RMS POST ${endpoint} -> ${res.status}: ${text.slice(0, 500)}`);
  }
  return res.json();
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
      emails: [{ address: input.email, type_id: EMAIL_TYPE_WORK }],
      phones: [{ number: input.phone, type_id: PHONE_TYPE_WORK }],
      addresses: [
        {
          name: input.address.name,
          street: input.address.street,
          city: input.address.city,
          county: input.address.county,
          postcode: input.address.postcode,
          country_id: input.address.countryId,
          type_id: ADDRESS_TYPE_PRIMARY,
        },
      ],
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
      custom_fields: {
        which_fits_you_best: input.whichFitsYouBest,
        venue_type: input.venueType,
        event_type: input.eventType,
        number_of_attendees: input.numberOfAttendees,
        have_you_used_our_services_before: input.haveUsedBefore,
        tell_us_about_the_event_you_are_having: input.tellUsAboutEvent,
      },
    },
  };
  const res = await crmsPost<{ opportunity: { id: number } }>(
    "opportunities",
    body
  );
  return { id: res.opportunity.id };
}
