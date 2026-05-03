#!/usr/bin/env node
/**
 * Read-only introspection of Current RMS opportunity / member / status shapes.
 *
 * Pure GETs — no writes, no order placement. Goal is to discover what fields
 * Current RMS actually persists on an opportunity so we can build a matching
 * homemade quote-flow payload.
 *
 * Usage:
 *   node --env-file-if-exists=.env.local scripts/inspect-current-rms-opportunity.mjs
 *
 * Output: docs/current-rms-opportunity-inspection.json (PII-scrubbed)
 */

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SUBDOMAIN = process.env.CURRENT_RMS_SUBDOMAIN?.trim();
const API_KEY = process.env.CURRENT_RMS_API_KEY?.trim();
const BASE_URL = "https://api.current-rms.com/api/v1";

if (!SUBDOMAIN || !API_KEY) {
  console.error(
    "Missing CURRENT_RMS_SUBDOMAIN or CURRENT_RMS_API_KEY.\n" +
      "Set them in .env.local (gitignored) or export them in your shell before running."
  );
  process.exit(1);
}

async function crmsGet(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) {
      for (const item of v) url.searchParams.append(k, item);
    } else {
      url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-SUBDOMAIN": SUBDOMAIN,
      "X-AUTH-TOKEN": API_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${endpoint} → ${res.status} ${res.statusText}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

const PII_KEYS = new Set([
  "name",
  "first_name",
  "last_name",
  "email",
  "email_address",
  "phone",
  "phone_number",
  "mobile",
  "fax",
  "address_1",
  "address_2",
  "address_3",
  "address_4",
  "street",
  "city",
  "state",
  "county",
  "zip",
  "postcode",
  "company_name",
  "tax_number",
  "notes",
  "description",
  "subject",
  "reference",
]);

function scrub(value) {
  if (Array.isArray(value)) return value.map(scrub);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (PII_KEYS.has(k) && v != null && v !== "") {
        const t = typeof v;
        out[k] = t === "string" ? `<scrubbed:${t}:len=${v.length}>` : `<scrubbed:${t}>`;
      } else {
        out[k] = scrub(v);
      }
    }
    return out;
  }
  return value;
}

function summarizeShape(value, depth = 0, maxDepth = 4) {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "array<empty>";
    if (depth >= maxDepth) return `array[${value.length}]`;
    return [`array[${value.length}] of:`, summarizeShape(value[0], depth + 1, maxDepth)];
  }
  if (typeof value === "object") {
    if (depth >= maxDepth) return "object";
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = summarizeShape(v, depth + 1, maxDepth);
    }
    return out;
  }
  return typeof value;
}

async function tryGet(label, endpoint, params) {
  try {
    const data = await crmsGet(endpoint, params);
    console.log(`✓ ${label} → ${endpoint}`);
    return { ok: true, data };
  } catch (err) {
    console.log(`✗ ${label} → ${endpoint}: ${err.message.split("\n")[0]}`);
    return { ok: false, error: err.message };
  }
}

const report = {
  fetched_at: new Date().toISOString(),
  base_url: BASE_URL,
  subdomain: SUBDOMAIN,
  endpoints: {},
};

console.log("Inspecting Current RMS — read-only GETs\n");

// 1. List recent opportunities (no includes — see what comes back by default)
const list = await tryGet("List recent opportunities", "opportunities", {
  per_page: "5",
  "q[s]": "id desc",
});
if (list.ok) {
  const opportunities = list.data.opportunities || [];
  report.endpoints["GET /opportunities (list)"] = {
    meta: list.data.meta,
    count: opportunities.length,
    keys_per_record: opportunities.length > 0 ? Object.keys(opportunities[0]).sort() : [],
    first_record_shape: opportunities.length > 0 ? summarizeShape(opportunities[0]) : null,
    first_record_scrubbed: opportunities.length > 0 ? scrub(opportunities[0]) : null,
  };

  // 2. Detail GET on the first opportunity — full nested shape
  if (opportunities.length > 0) {
    const id = opportunities[0].id;
    const detail = await tryGet(`Detail opportunity #${id}`, `opportunities/${id}`);
    if (detail.ok) {
      const opp = detail.data.opportunity || detail.data;
      report.endpoints[`GET /opportunities/${id}`] = {
        keys: Object.keys(opp).sort(),
        shape: summarizeShape(opp),
        scrubbed: scrub(opp),
      };

      // 3. Member detail
      const memberId = opp.member_id || opp.member?.id;
      if (memberId) {
        const member = await tryGet(`Member #${memberId}`, `members/${memberId}`);
        if (member.ok) {
          const m = member.data.member || member.data;
          report.endpoints[`GET /members/${memberId}`] = {
            keys: Object.keys(m).sort(),
            shape: summarizeShape(m),
            scrubbed: scrub(m),
          };
        }
      }
    }

    // Also try fetching with explicit includes — many Current RMS endpoints
    // gate nested resources behind ?include[]= params.
    const withIncludes = await tryGet(
      `Detail #${id} with includes`,
      `opportunities/${id}`,
      {
        "include[]": [
          "opportunity_items",
          "member",
          "billing_address",
          "delivery_address",
          "custom_fields",
        ],
      }
    );
    if (withIncludes.ok) {
      const opp = withIncludes.data.opportunity || withIncludes.data;
      report.endpoints[`GET /opportunities/${id}?include[]=...`] = {
        keys: Object.keys(opp).sort(),
        shape: summarizeShape(opp),
        scrubbed: scrub(opp),
      };
    }
  }
}

// 4. Try a few endpoints that might enumerate status / metadata
for (const ep of [
  "opportunity_statuses",
  "opportunity_states",
  "opportunities/statuses",
  "stores",
  "currencies",
  "tax_classes",
]) {
  const r = await tryGet(`Discovery: ${ep}`, ep, { per_page: "20" });
  report.endpoints[`GET /${ep}`] = r.ok
    ? {
        keys: r.data && typeof r.data === "object" ? Object.keys(r.data) : [],
        scrubbed: scrub(r.data),
      }
    : { error: r.error };
}

const outDir = join(ROOT, "docs");
await mkdir(outDir, { recursive: true });
const outPath = join(outDir, "current-rms-opportunity-inspection.json");
await writeFile(outPath, JSON.stringify(report, null, 2));

console.log(`\nWrote ${outPath}`);
