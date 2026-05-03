# Current RMS — Opportunity creation reference

What Current RMS expects when our homemade quote flow turns a cart + form submission into an opportunity (their term for quote/order). Compiled from two sources:

1. The official API docs at `https://api.current-rms.com/doc` (Slate-style single-page docs; a 10 MB HTML page).
2. Empirical inspection of real opportunities in our production Current RMS account — see `scripts/inspect-current-rms-opportunity.mjs` (output gitignored at `docs/current-rms-opportunity-inspection.json`; contains real PII so don't commit it).

> **For implementers:** when you build the homemade flow, the highest-leverage endpoint is `POST /opportunities/checkout` (see §2). It creates the opportunity AND its line items in one atomic call. The plain `POST /opportunities` requires a separate dance to add items afterward and there's no documented bulk-item-create endpoint.

## Contents

| § | Topic | Read when… |
| --- | --- | --- |
| 1 | Auth | wiring credentials |
| 2 | Two creation endpoints | choosing between checkout vs. plain create |
| 3 | Opportunity fields | building the request body |
| 4 | Member creation | adding find-or-create for customers |
| 5 | Custom fields on this account | piping form fields into RMS custom slots |
| 6 | Line items | shaping cart items for `items[]` |
| 7 | Date/time format | converting our `YYYY-MM-DD` to ISO 8601 |
| 8 | State/status enums | choosing the initial state |
| 9 | Validation gotchas | debugging 422s |
| **10** | **Customer accounts & cart persistence** | **adding login + persistent cart** |
| **11** | **Contract signing (typed-name signature)** | **adding the "type your name to sign" step** |
| **12** | **Notes — logistics vs order** | **splitting general notes from delivery notes** |
| 13 | Gap list | scoping the implementation |
| 14 | Minimal valid payload | copy-paste starting point |
| 15 | Open questions | items needing staff/team decisions |
| 16 | References | jumping back to source docs |

---

## 1. Auth

| Item | Value |
| --- | --- |
| Base URL | `https://api.current-rms.com/api/v1` |
| Required headers | `X-SUBDOMAIN: <subdomain>`, `X-AUTH-TOKEN: <api key>` |
| Content type | `application/json` (UTF-8) |
| Token source | Current RMS UI → System Setup → Integrations → API |

Existing client: `crmsGet()` in `src/lib/current-rms.ts:21` for reads. There's no write helper yet — `createOpportunity()` at `src/lib/current-rms.ts:248` is a stub.

Env vars (already present in `.env.example`):
- `CURRENT_RMS_SUBDOMAIN` (we use `accel`)
- `CURRENT_RMS_API_KEY`
- `RMS_WRITE_ENABLED` — gate; default `false`
- `RMS_WRITE_DRY_RUN` — default `true`; logs the would-be payload instead of POSTing

---

## 2. Two creation endpoints — pick the right one

### `POST /opportunities` (basic)

Creates an empty opportunity shell. Per the JSON schema in the docs, **only `store_id` is required.** In practice you almost always also send `member_id`, `subject`, `starts_at`, `ends_at`, `state`. Items must be added afterward via separate calls — and there is no documented `POST /opportunities/{id}/opportunity_items` (only `GET`, `DELETE`, allocate/deallocate). Avoid this path for the homemade flow.

### `POST /opportunities/checkout` (atomic create-with-items) — **recommended**

Single call that creates the opportunity AND its line items together. Body shape:

```json
{
  "opportunity": { /* same fields as POST /opportunities */ },
  "items": [
    { "item_id": 151, "item_type": "Product", "quantity": 1, ... }
  ]
}
```

This matches Current RMS's own checkout flow, so item validation, tax/surcharge calculation, and availability allocation all happen server-side in one transaction.

---

## 3. Opportunity fields (top-level body)

Every field below is **optional** at the JSON-schema level except `store_id`. Practical-required calls out what we should always send for the homemade flow.

| Field | Type | Practical-required? | Source in our flow | Notes |
| --- | --- | --- | --- | --- |
| `store_id` | number | **Yes (schema)** | env / hardcoded | Our live store_id is `2` (the "Accel Event Rentals" store; we also have store `1`). Put in env: `CURRENT_RMS_STORE_ID`. |
| `member_id` | number | **Yes** | created/looked-up from form | Existing customer record. See §4 for member creation. |
| `billing_address_id` | number | recommended | from looked-up/created member's `addresses[]` | Defaults to member's primary address if omitted. Use when the customer has multiple billing addresses. |
| `subject` | string | **Yes** | derived: `"{name} — {event date}"` or quote ID | The opportunity title shown in Current RMS UI. |
| `description` | string | optional | `payload.notes` | Internal long description. Could also live in `external_description`. |
| `external_description` | string | optional | — | Long description that appears on customer-facing documents. |
| `reference` | string | optional | our `quoteId` | Customer-facing reference; great place for our generated quote ID. |
| `starts_at` | string (ISO 8601 UTC) | **Yes** | `payload.startDate` + time-of-day | "Overall start date or delivery date." Format `YYYY-MM-DDTHH:mm:ss.sssZ`. |
| `ends_at` | string (ISO 8601 UTC) | **Yes** | `payload.endDate` + time-of-day | "Overall end date or collection date." |
| `charge_starts_at` | string | recommended | mirror `starts_at` | The billing window start. Usually same as `starts_at`. |
| `charge_ends_at` | string | recommended | mirror `ends_at` | The billing window end. |
| `ordered_at` | string | optional | submission timestamp | When the order was placed. |
| `quote_invalid_at` | string | optional | `submission + N days` | Quote expiry. |
| `state` | number | **Yes** | constant: `0` (Enquiry) | **0 = Enquiry, 1 = Draft, 2 = Quotation, 3 = Order.** Homemade flow always creates at `0` — staff progress to 2/3 manually after vetting. |
| `tax_class_id` | number | recommended | env / lookup | Our live opportunities use `tax_class_id: 1` ("Oahu Tax"). Hardcode or env-configure. |
| `customer_collecting` | boolean | **Yes** | `payload.delivery === "pickup"` | True if customer picks up. |
| `customer_returning` | boolean | **Yes** | `payload.delivery === "pickup"` | True if customer returns. Usually equals `customer_collecting`. |
| `delivery_instructions` | string | optional | `payload.eventLocation` + `payload.notes` | Free text shown to delivery crew. |
| `collection_instructions` | string | optional | — | Free text shown to pickup crew. |
| `tag_list` | string[] | optional | `["online-quote"]` or similar | Tags. Useful for filtering homemade-flow records in CRM. |
| `assigned_surcharge_group_ids` | number[] | optional | env / lookup | Auto-applied surcharges (delivery fee, fuel, etc.). Live records show `[4, 7]`. |
| `custom_fields` | object | recommended | event details — see §5 | Account-specific. We have great matches; see below. |
| `owned_by` | number | optional | env: sales rep user ID | Member ID of the assigned sales rep. |
| `venue_id` | number\|null | optional | — | Member ID of the venue (members can be of type `"Venue"`). Skip unless we have a venue lookup. |
| `project_id` | number\|null | optional | — | Skip. |
| `participants` | array | optional | — | Other internal members tied to the opp. Skip. |
| `rating` | number | optional | — | Lead rating (0–5). Skip. |
| `revenue` | string | optional | — | Predicted revenue (numeric string). Server computes from items, so skip. |

**Optional logistics windows** — all ISO-8601 strings, all nullable. Send when known, otherwise omit:
`prep_starts_at`/`ends_at`, `load_starts_at`/`ends_at`, `deliver_starts_at`/`ends_at`, `setup_starts_at`/`ends_at`, `show_starts_at`/`ends_at` (the actual event time), `takedown_starts_at`/`ends_at`, `collect_starts_at`/`ends_at`, `unload_starts_at`/`ends_at`, `deprep_starts_at`/`ends_at`. For homemade-flow opportunities at state=Enquiry, leave these blank — staff fill them in.

**Read-only on response** (don't send these — Current RMS computes them):
`charge_total`, `charge_excluding_tax_total`, `charge_including_tax_total`, `rental_charge_total`, `sale_charge_total`, `surcharge_total`, `service_charge_total`, `tax_total`, `original_*` totals, `provisional_cost_total`, `actual_cost_total`, `predicted_cost_total`, `replacement_charge_total`, `weight_total`, `state_name`, `status`, `status_name`, `id`, `number`, `created_at`, `updated_at`, `chargeable_days`.

---

## 4. Member (customer) creation — `POST /members`

Required fields: `name`, `membership_type`. The homemade flow needs a member before creating the opportunity. Two options:

**Option A — find-or-create.** Search for existing member by email (`GET /members?q[primary_email_address_eq]=...`). If found, reuse `member_id`. If not, `POST /members` with the form data, capture the returned `id`, use as `member_id`.

**Option B — always create.** Simpler. Risks creating duplicate Member records when the same customer requests multiple quotes. Only viable if staff are OK deduping in the CRM.

Recommend Option A. Implementation: extend `current-rms.ts` with `findMemberByEmail()` and `createMember()`.

### `POST /members` body shape

```json
{
  "member": {
    "name": "Jane Doe",
    "membership_type": "Contact",
    "active": true,
    "bookable": false,
    "location_type": 1,
    "locale": "en-US",
    "lawful_basis_type_id": 11001,
    "primary_address": {
      "name": "Jane Doe",
      "street": "123 Main St",
      "city": "Honolulu",
      "county": "HI",
      "postcode": "96815",
      "country_id": 3,
      "type_id": 3001,
      "address_type_name": "Primary"
    },
    "emails": [
      { "address": "jane@example.com", "type_id": 4001, "email_type_name": "Work" }
    ],
    "phones": [
      { "number": "(808) 555-1234", "type_id": 6001, "phone_type_name": "Work" }
    ]
  }
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | **Yes** | Customer name. |
| `membership_type` | string | **Yes** | `"Contact"` for individuals, `"Organisation"` for companies, `"Venue"`, `"User"`. Live lead records use `"Organisation"` even for individuals — match account convention. |
| `location_type` | number | optional | `0`=Internal, `1`=External. Use `1` for customers. |
| `locale` | string | optional | `"en-US"`. |
| `lawful_basis_type_id` | number | optional | GDPR basis. Live lead records use `11001` (`"Legitimate interest - prospect/lead"`). Hardcode this. |
| `primary_address` | object | recommended | See address shape below. |
| `emails` | array | recommended | At least one entry. `type_id: 4001` = Work. |
| `phones` | array | recommended | At least one entry. `type_id: 6001` = Work. |
| `tag_list` | string[] | optional | Tag homemade-flow members. |
| `custom_fields` | object | optional | We have account-level member custom fields — `organization_full_address`, `dedicated_sales_representative_email`, `customer_type`. |

### Address shape

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | Recipient. |
| `street` | string | |
| `city` | string | |
| `county` | string | US state goes here (Current RMS is UK-origin). |
| `postcode` | string | ZIP. |
| `country_id` | number | `3` = United States (per live data). |
| `type_id` | number | `3001` = Primary, `3002` = Billing, `3003` = Delivery. |
| `address_type_name` | string | Display name for the type. |

---

## 5. Custom fields on this account (the gold mine)

Current RMS lets the account configure custom fields. **Our Accel account already has fields built specifically for online-inquiry use cases.** The homemade flow should populate these directly:

| Custom field key | Type | Source in our form | Notes |
| --- | --- | --- | --- |
| `tell_us_about_the_event_you_are_having` | string | `payload.notes` | Free-text notes from the customer. |
| `number_of_attendees` | string (numeric) | `payload.guestCount` | Guest count. Sent as a string. |
| `event_type` | number (picklist option ID) | derived from cart category? | Picklist option IDs like `1000058`. We'd need to fetch the picklist values from Current RMS — see "Open questions" below. |
| `venue_type` | number (picklist option ID) | optional | Picklist. |
| `which_fits_you_best` | number (picklist option ID) | optional | Picklist. Probably maps to budget tier or package preference. |
| `have_you_used_our_services_before` | number (picklist option ID) | optional | Yes/No picklist. Default to "No" / "Unknown". |

**Operational checkboxes seen** (some staff-managed, but `terms_conditions_signed` is the one our flow should set when the customer signs — see §11): `50_confirmation_deposit_received`, `terms_conditions_signed`, `cc_auth_credit_card_on_file`, `damage_waiver_declination_form`, `custom_items_confirmed`, `onsite_poc_confirmed`, `notes_in_the_right_place`, `delivery_and_pickup_windows_confirmed`, `layout_recieved` (sic), `final_payment_received`, `active_draft`, `gpa_score`.

---

## 6. Line items — `items[]` in `/opportunities/checkout`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `item_id` | number | **Yes** | Current RMS product ID (we already store this in cart as `id`). |
| `item_type` | string | **Yes** | `"Product"` for our use case. Other values: `"AccessoryProduct"`, `"BundleProduct"`. |
| `opportunity_item_type` | number | **Yes** | `1` = Principal (the line item itself). `0` = Group (parent container). For a flat list, send `1`. |
| `quantity` | number | **Yes** | Cart `qty`. |
| `name` | string | optional | Display name. Server fills from product if omitted. Send for safety. |
| `transaction_type` | number | optional | `1` = Rental, `2` = Sale, `3` = Service. We're rentals → `1`. |
| `accessory_inclusion_type` | number | optional | `0` for principal items. |
| `accessory_mode` | number | optional | `0` for principal items. |
| `revenue_group_id` | number\|null | optional | Skip. |
| `rate_definition_id` | number | optional | Rate to use. Server defaults from product. |
| `service_rate_type` | number | optional | Skip for rentals. |
| `price` | string | optional | Unit price override. **Skip** — let server compute from product's `rental_rate` so pricing stays consistent with Current RMS. |
| `discount_percent` | string | optional | `"0.0"` or skip. |
| `starts_at` / `ends_at` | string | optional | Per-item window. Skip — items inherit from opportunity. |
| `use_chargeable_days` | boolean | optional | `false` to use computed period. |
| `chargeable_days` | string | optional | Skip — server computes. |
| `sub_rent` | boolean | optional | `false`. |
| `description` | string | optional | Customer-facing line note. Could pipe `cartItem.notes` here. |
| `replacement_charge` | string | optional | Skip — defaults from product. |
| `weight` | string | optional | Skip. |
| `custom_fields` | object | optional | Per-line custom fields. Empty `{}`. |

**Minimal valid item:**

```json
{ "item_id": 2015, "item_type": "Product", "opportunity_item_type": 1, "quantity": 30 }
```

---

## 7. Date/time format

ISO 8601 UTC with milliseconds: `YYYY-MM-DDTHH:mm:ss.sssZ`. Examples in live data: `"2026-05-01T19:00:00.000Z"`. Our cart stores `YYYY-MM-DD` only; convert on the server with a default time-of-day (e.g., 09:00 local → UTC) before sending.

---

## 8. State / status enums

**`state` (request + response)** — opportunity lifecycle:
| Code | Name |
| --- | --- |
| 0 | Enquiry |
| 1 | Draft |
| 2 | Quotation |
| 3 | Order |

(Confirmed by docs schema description; live record had `state_name: "Order"` corresponding to `3`.)

**`status` (response only)** — operational status (open vs. cancelled etc.):
- Observed: `0` → `"Open"`. Other codes exist but no public enum; Current RMS doesn't expose a `/opportunity_statuses` endpoint (we tried — 404). Don't send `status` in create requests.

---

## 9. Validation gotchas

- **Schema vs reality:** the JSON-schema only requires `store_id`, but in practice POSTing without `member_id`, `subject`, `starts_at`, `ends_at` will produce an unusable record. Always send them.
- **Date strings, not Date objects.** Always serialize via `.toISOString()`.
- **`customer_collecting` and `customer_returning` should be set together.** If pickup, both `true`; if delivery, both `false`.
- **Don't send computed totals.** Anything in `charge_*`, `rental_charge_*`, `tax_*`, `original_*` is server-computed; sending values may be silently ignored or cause confusion in the UI.
- **`tax_class_id` matters for totals.** If the customer is in our default Oahu tax zone, use `1`. Other zones need a different ID.
- **Member creation can fail on duplicate emails** depending on account settings — wrap in try/catch and fall back to find-by-email if create fails with 422.
- **`opportunity_item_type` is mandatory** even though it's not in the obvious required list. Without it, the server can't slot the line item into the opportunity tree.

---

## 10. Customer accounts & cart persistence

**Critical fact: Current RMS has no end-customer auth.** "Members" are CRM records, not login users. There's no `password`, `password_reset`, `customer portal`, or `self-serve` endpoints in the API. We have to own the entire account/auth/persistence stack.

### 10.1 Architecture

```
[ Customer ] ──login──▶ [ Our auth (NextAuth / Clerk / Supabase) ]
                              │
                              │ user_id (our system)
                              ▼
                       [ Our DB ]
                              │
                              │ stores: profile, cart, quote history, signature audit
                              ▼
                       [ Current RMS ]  ← linked via member_id (CRM record)
```

| Concern | Owned by | Notes |
| --- | --- | --- |
| Email/password / OAuth | **Us** | Recommend: NextAuth.js with magic-link email + Google OAuth. Cheapest to wire on a Next.js App Router project. Vercel Marketplace also has Clerk if we want a hosted option. |
| Profile (name, phone, billing/delivery address) | **Us** (mirror to RMS) | Source of truth: our DB. Mirror to Current RMS Member on first quote submission and on profile edit. |
| Active cart | **Us** | Source of truth: our DB (anonymous users keep using `localStorage`; logged-in users get DB-backed cart). |
| Quote history | **Us** + RMS | Our DB stores the link `quote_id ↔ rms_opportunity_id`. RMS is the source of truth for status (Quotation/Order/Booked). |
| Signature audit | **Us** (primary) + RMS (mirror) | See §11. |

### 10.2 Linking our user → Current RMS Member

On the **first** quote submission for a logged-in user (or a guest providing an email):

1. `GET /members?q[primary_email_address_eq]={email}` → if found, save `member_id` on our user record.
2. If not found, `POST /members` with form data (see §4) → save the returned `id` as `member_id` on our user record.

On **subsequent** submissions: read `member_id` from our user record. If the customer's name/phone/address has changed since last time, `PUT /members/{id}` to keep RMS in sync. (Don't sync on every page load — only when they actually change profile data.)

For **anonymous (guest) submissions**: do the same find-or-create, but link `member_id` to the email rather than to a user record. If they later sign up with the same email, merge the records on our side.

### 10.3 Persistent cart schema (recommended minimal DB tables)

```sql
users (
  id            uuid primary key,
  email         citext unique not null,
  name          text,
  phone         text,
  rms_member_id integer,              -- nullable until first quote
  created_at    timestamptz,
  updated_at    timestamptz
)

user_addresses (
  id           uuid primary key,
  user_id      uuid references users,
  type         text check (type in ('billing','delivery')),
  street       text, city text, state text, postcode text, country text,
  is_default   boolean
)

carts (
  user_id      uuid primary key references users,
  start_date   date,
  end_date     date,
  delivery     text check (delivery in ('delivery','pickup')),
  notes        text,
  guest_count  integer,
  updated_at   timestamptz
)

cart_items (
  cart_user_id uuid references carts(user_id) on delete cascade,
  rms_product_id integer not null,    -- snapshot of Current RMS product id
  qty          integer not null,
  notes        text,
  added_at     timestamptz,
  primary key (cart_user_id, rms_product_id)
)

quotes (
  id                 text primary key,         -- our quote id (e.g. "Q-AB12CD3")
  user_id            uuid references users,
  rms_opportunity_id integer,                  -- nullable until RMS write succeeds
  payload            jsonb not null,           -- the QuotePayload as submitted
  signed_by          text,                     -- typed name (see §11)
  signed_at          timestamptz,
  signer_ip          inet,
  signer_user_agent  text,
  created_at         timestamptz
)
```

Storage on Vercel: prefer **Neon Postgres** via Vercel Marketplace (cheap, auto-scales, native pooling). Use Drizzle or Prisma; project has neither yet.

### 10.4 Anonymous → logged-in cart merge

When a guest with cart contents logs in (or creates an account during checkout): merge the localStorage cart into the DB cart. Strategy: union by `rms_product_id`, max() the qty, take the most recent dates/notes. Run server-side after auth callback so it's atomic.

---

## 11. Contract signing (typed-name signature)

The user must type their name to sign before completing checkout. Two paths exist; pick one and stick with it.

### 11.1 Path A — Current RMS Document Approval (hosted by RMS)

Current RMS has a built-in document approval flow:
1. After creating the opportunity, `GET /opportunities/{id}/prepare_document?document_id={N}` returns an `opportunity_document` with a `uuid`.
2. Public approval URL (no auth): `https://accel.current-rms.com/view_document/{uuid}`.
3. Customer types their name and (optionally) draws a signature on **Current RMS's page**. RMS captures `signed_by`, `signature` (base64 PNG), `remote_ip`, `user_agent`, `approved_declined_at`, and sets `status: 1` (Accepted) on the `opportunity_document` record.
4. We can poll `GET /opportunity_documents/{id}` or subscribe to a webhook to detect approval.

**Pros:** real legal-grade signature audit captured by RMS, no schema work on our side, staff already trust the workflow.
**Cons:** customer leaves our site. UX inconsistency. Hosted page styling is RMS's, not ours. The document layout (`document_id`) must be configured by staff in Current RMS first.

The relevant `Document` record fields (set by staff on the layout) that govern this flow:
- `use_for_approval: true` — enables the approval flow.
- `require_signature: true` — requires a typed name and/or drawn signature.
- `approval_accept_text` / `approval_decline_text` — copy on the approval page.
- `approval_custom_fields: number[]` — custom field IDs to surface during approval (where `terms_conditions_signed` likely lives).

### 11.2 Path B — Own the signature on our site (recommended)

Capture the typed name on `/quote/review`, validate server-side, store the audit trail in our DB, AND mirror a summary into the opportunity as custom fields. The contract is legally signed on our site; RMS gets a record-of-signing.

**Server-side capture** (in `POST /api/quotes`):
```ts
const signedBy = body.signedByName.trim();          // typed name
const signerIp = req.headers.get('x-forwarded-for') ?? '';
const signerUserAgent = req.headers.get('user-agent') ?? '';
const signedAt = new Date().toISOString();

if (!signedBy || signedBy.length < 2) {
  return err('Please type your full name to sign');
}
// Optional, recommended: require typed name to match `payload.name` (case-insensitive,
// whitespace-tolerant). Reject otherwise.
```

Store all four (`signedBy`, `signerIp`, `signerUserAgent`, `signedAt`) on the `quotes` row in our DB. **This is the legal record** — keep it forever.

**Mirror into Current RMS** via opportunity body:
```json
{
  "opportunity": {
    "...": "...",
    "custom_fields": {
      "terms_conditions_signed": "Yes",
      "tell_us_about_the_event_you_are_having": "..."
    },
    "tag_list": ["online-quote", "self-signed"]
  }
}
```

If staff want a richer audit trail visible in Current RMS, add custom fields to their account (we'd ask them to create these in the RMS UI):
- `signed_by_name` (text)
- `signed_at_utc` (text or datetime)
- `signer_ip` (text)
- `signer_user_agent` (text)

We then populate them in `custom_fields` on opportunity create.

**Pros:** customer never leaves our site. UX is fully ours. Faster checkout. Straightforward to implement.
**Cons:** RMS doesn't have the actual signature image — but a typed name + IP + UA is generally enough for click-wrap contracts (see DocuSign, ToS-style agreements). If staff later want a draw-a-signature step, we can add a `<canvas>` and POST the base64 PNG into a custom field too.

**Recommendation: Path B.** Keep the customer in our flow. If staff need a stronger signature later, we can layer Path A on top for high-value events.

### 11.3 Form changes implied by §11

In `QuoteForm` (`src/components/forms/QuoteForm.tsx`), add at the bottom of the form, above the submit button:

- A **terms acceptance** block: link to `/terms`, link to `/rental-agreement`, an explanatory paragraph.
- A **typed-name signature** input (`name="signedByName"`), labeled "Type your full name to sign and submit".
- Validation: required, ≥2 chars, must match `payload.name` (case/whitespace tolerant).

In `quote-types.ts`:
- Add `signedByName: string` to `QuotePayload` (required, 2–120 chars).
- In `parseQuotePayload`, validate it and (recommended) confirm it matches `name`.

Submit button copy changes from "Get a quote" / "Submit" to "Sign and submit" or "Submit and accept terms".

---

## 12. Notes — logistics vs order

Current RMS distinguishes between **internal/order notes** and **logistics notes** (delivery and collection crew instructions). Map our form fields accordingly.

| Our field | RMS target | Visibility |
| --- | --- | --- |
| `payload.notes` (general "anything else we should know?") | `opportunity.description` AND `custom_fields.tell_us_about_the_event_you_are_having` | Internal (sales). Description is the primary internal note. |
| `payload.notes` (if we want it on customer-facing PDF) | `opportunity.external_description` | Customer-facing in quote/order documents. |
| Logistics / delivery-specific note (NEW field) | `opportunity.delivery_instructions` | Delivery crew. |
| Pickup / collection note (NEW field) | `opportunity.collection_instructions` | Collection crew. |
| `cartItem.notes` (per-line-item note) | `items[].description` | Shows on line item; visible internally and on documents. |

### 12.1 Form changes implied

Today the form has one `notes` textarea labeled "Anything else we should know?" That's fine for `description` + `tell_us_about_the_event_you_are_having`, but logistics notes should be a separate field. Recommend:

- `notes` → "Anything else about your event?" → `opportunity.description` + `custom_fields.tell_us_about_the_event_you_are_having`
- `deliveryNotes` (NEW, only shown when `delivery === "delivery"`) → "Delivery instructions (gate codes, parking, contact at venue)?" → `opportunity.delivery_instructions`
- `pickupNotes` (NEW, optional) → "Pickup instructions (after the event)?" → `opportunity.collection_instructions`

Per-line-item notes (`cartItem.notes`) already exist in the cart; pipe them to `items[].description` on the RMS payload.

### 12.2 What NOT to do

- Don't dump everything into `description`. Staff filter on `delivery_instructions` for delivery routing — concatenating obscures it.
- Don't put PII or payment info in `external_description` — it's printed on customer-facing PDFs.
- Don't use `reference` for notes — that's a customer reference *number* shown in the UI as a short identifier (max ~80 chars by convention).

---

## 13. Gap list — what the homemade flow is missing today

Cross-referenced with `src/lib/quote-types.ts` (current cart/form payload):

**Already captured (just need mapping):**
- Customer name → `member.name`
- Email → `member.emails[0].address`
- Phone → `member.phones[0].number`
- Event start/end → `opportunity.starts_at` / `ends_at` (need time-of-day)
- Notes → `opportunity.description` and `custom_fields.tell_us_about_the_event_you_are_having`
- Guest count → `custom_fields.number_of_attendees`
- Delivery vs pickup → `customer_collecting`/`customer_returning`
- Cart items → `items[]`

**Configuration we need to pin down (one-time, in env):**
- `CURRENT_RMS_STORE_ID=2`
- `CURRENT_RMS_TAX_CLASS_ID=1`
- `CURRENT_RMS_DEFAULT_OWNER_ID=` (a sales rep's member ID — ask the team)
- `CURRENT_RMS_LEAD_TAGS=online-quote` (or similar)
- `CURRENT_RMS_LAWFUL_BASIS_TYPE_ID=11001`

**Truly missing from homemade flow (recommend adding to the form / app):**
- **Customer accounts** (auth, persistent profile, persistent cart, quote history). Today: cart is `localStorage` only, no login. See §10. Needs: auth provider + DB.
- **Typed-name signature on the review page.** Today: form submits without signing. See §11. Needs: `signedByName` field, validation, audit-trail capture (IP/UA/timestamp), DB persistence.
- **Billing address** (street/city/state/zip). Required for RMS member creation; without it the member record has no address and staff have to chase the customer for it. Add fields to `QuoteForm` (or to user profile if we have accounts).
- **Delivery address** (separate from event location). The current free-text `eventLocation` is fine for `delivery_instructions`, but if we want a structured delivery address we need separate fields.
- **Logistics / delivery notes textarea** (separate from general notes). See §12.
- **Pickup notes textarea** (optional). See §12.

**Optional captures that would improve CRM data:**
- Event type picklist → `custom_fields.event_type` (need to GET picklist option IDs once and hardcode the mapping).
- Venue type picklist → `custom_fields.venue_type`.
- "Have you used our services before?" Yes/No → `custom_fields.have_you_used_our_services_before`.

**Out of scope for homemade flow (staff handles in CRM):**
- Most `_received`/`_signed`/`_confirmed` operational checkboxes (deposit received, payment received, layout received, etc.).
- Logistics windows (prep, deliver, setup, show, collect, etc.).
- Payment / deposit tracking.
- Surcharge group assignment (if it should be auto, set via `CURRENT_RMS_DEFAULT_SURCHARGE_GROUP_IDS` env).
- The actual rental-agreement document layout in Current RMS (staff create + maintain it).

---

## 14. Minimal valid `POST /opportunities/checkout` payload

Reflects everything from §3–§12: signature mirrored as custom fields, separate logistics + collection notes, account-aware structure (member_id resolved from our user record).

```json
{
  "opportunity": {
    "store_id": 2,
    "member_id": 24407,
    "tax_class_id": 1,
    "subject": "Online Quote — Q-AB12CD3 — Jane Doe",
    "reference": "Q-AB12CD3",
    "description": "Wedding reception, 80 guests. Beachside ceremony at 5pm.",
    "external_description": "",
    "starts_at": "2026-06-15T17:00:00.000Z",
    "ends_at":   "2026-06-16T03:00:00.000Z",
    "charge_starts_at": "2026-06-15T17:00:00.000Z",
    "charge_ends_at":   "2026-06-16T03:00:00.000Z",
    "state": 0,
    "customer_collecting": false,
    "customer_returning": false,
    "delivery_instructions": "Beachside lot, gate code 4421. Contact Anna at venue: 808-555-0199.",
    "collection_instructions": "Pickup after 11pm; staff will leave items stacked by main entrance.",
    "tag_list": ["online-quote", "self-signed"],
    "lawful_basis_type_id": 11001,
    "custom_fields": {
      "tell_us_about_the_event_you_are_having": "Wedding reception, 80 guests. Beachside ceremony at 5pm.",
      "number_of_attendees": "80",
      "terms_conditions_signed": "Yes",
      "signed_by_name": "Jane Doe",
      "signed_at_utc": "2026-05-03T22:14:08.000Z",
      "signer_ip": "203.0.113.42",
      "signer_user_agent": "Mozilla/5.0 ..."
    }
  },
  "items": [
    { "item_id": 2015, "item_type": "Product", "opportunity_item_type": 1, "transaction_type": 1, "quantity": 12, "name": "29\" Round Stand-Up Farm Table", "description": "Please reserve cleanest 12 if possible." },
    { "item_id": 1837, "item_type": "Product", "opportunity_item_type": 1, "transaction_type": 1, "quantity": 80, "name": "Crossback Chair" }
  ]
}
```

> **Note:** The `signed_by_name`, `signed_at_utc`, `signer_ip`, `signer_user_agent` custom fields don't exist on the account yet. Either ask staff to add them in Current RMS UI (System Setup → Custom Fields → Opportunity), or fold the audit info into `description` as a footer block until they do. Our DB is the legal source of truth for the signature regardless.

---

## 15. Open questions to resolve before turning on writes

**RMS configuration questions for staff:**
1. **Picklist option IDs** for `event_type`, `venue_type`, `which_fits_you_best`, `have_you_used_our_services_before` — need a `GET /list_values` (or similar) call, or staff sends us the mapping.
2. **Default sales rep** (`owned_by`) — who should own homemade-flow opportunities by default?
3. **Surcharge groups** — should homemade-flow opps auto-assign delivery/fuel surcharges, or leave for staff?
4. **Time of day for `starts_at` / `ends_at`** — we capture date only. Default to 09:00 → 17:00 local? Ask staff.
5. **Find-or-create policy on members** — when a customer has prior quotes, attach the new opp to their existing member record (recommended) or always create a new one?
6. **Add custom fields for signature audit** — ask staff to add `signed_by_name`, `signed_at_utc`, `signer_ip`, `signer_user_agent` to the Opportunity custom fields in Current RMS, OR confirm we should fold this audit info into `description` instead.
7. **Document layout for §11.1 path (if we ever switch)** — staff would need to set `use_for_approval: true` and `require_signature: true` on a Document layout, plus list the `document_id` in our env.

**Architectural decisions for our team:**
8. **Auth provider**: NextAuth.js (free, embedded), Clerk (Vercel Marketplace, hosted), or Supabase Auth? Recommend NextAuth for cost; Clerk if we want hosted UI components.
9. **Database**: Neon Postgres (Vercel Marketplace, recommended) vs Supabase Postgres vs sticking with localStorage + flat files. Need a real DB once we add accounts.
10. **ORM**: Drizzle (lighter, SQL-first, recommended for this size) vs Prisma (heavier, more features).
11. **Signing path** — confirm Path B (own the signature on our site, mirror as custom fields) vs Path A (redirect to Current RMS hosted approval page). §11 recommends Path B.
12. **Cart merge on login** — when an anonymous user with cart contents creates an account, what's the merge strategy? Default proposed: union by product, max(qty), most recent dates.
13. **Required fields at signature time** — do we require billing address before allowing signing? Current RMS doesn't strictly need it for `state=0` opps, but staff probably want it.

---

## 16. References

**Current RMS API:**
- Root: <https://api.current-rms.com/api/v1>
- Single-page Slate doc (~10 MB): <https://api.current-rms.com/doc>
- Help center API overview: <https://help.current-rms.com/en/articles/1062372-what-is-the-api>
- Key endpoints used in this doc (anchor links into the doc above):
  - `POST /opportunities/checkout` → `#opportunities-opportunity-checkout-post`
  - `POST /opportunities` → `#opportunities-opportunities-post`
  - `PUT /opportunities/{id}` → `#opportunities-opportunity-put`
  - `POST /members` → `#members-members-post`
  - `GET /opportunities/{id}/prepare_document` → `#opportunities-prepare-opportunity-document-get`
  - `GET /opportunity_documents/{id}` → `#opportunity-documents-opportunity-document-get`
  - `POST /webhooks` → `#webhooks-webhooks-post` (subscribe to events for approval polling alternative)
  - `GET /stores` → `#stores-stores-get`

**This repo:**
- Empirical inspection script: `scripts/inspect-current-rms-opportunity.mjs`
- Inspection output (gitignored — contains real PII): `docs/current-rms-opportunity-inspection.json`
- Existing read client: `src/lib/current-rms.ts:21`
- Stub write entry point: `src/lib/current-rms.ts:248`
- Quote API call site: `src/app/api/quotes/route.ts:413`
- Quote payload types: `src/lib/quote-types.ts`
- Quote form (will need account/signing/notes additions per §10–§12): `src/components/forms/QuoteForm.tsx`
- Cart context (will need DB-backed mode for logged-in users per §10.3): `src/lib/cart-context.tsx`
