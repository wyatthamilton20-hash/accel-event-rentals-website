// One-shot helper: list every Current RMS product_group with its id + name.
// Used to map shop-storefront category IDs (e.g. /categories/19/Tents) back
// to the RMS group IDs that drive image lookup in `src/lib/category-map.ts`.
//
// Run: node --env-file-if-exists=.env.local scripts/list-product-groups.mjs

const SUBDOMAIN = process.env.CURRENT_RMS_SUBDOMAIN;
const API_KEY = process.env.CURRENT_RMS_API_KEY;

if (!SUBDOMAIN || !API_KEY) {
  console.error("Missing CURRENT_RMS_SUBDOMAIN or CURRENT_RMS_API_KEY");
  process.exit(1);
}

const all = [];
let page = 1;
while (true) {
  const url = new URL("https://api.current-rms.com/api/v1/product_groups");
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", "100");
  const res = await fetch(url, {
    headers: {
      "X-SUBDOMAIN": SUBDOMAIN,
      "X-AUTH-TOKEN": API_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    console.error(`HTTP ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const json = await res.json();
  const groups = json.product_groups ?? [];
  all.push(...groups);
  if (groups.length < 100) break;
  page++;
}

all.sort((a, b) => a.id - b.id);
for (const g of all) {
  console.log(`${String(g.id).padStart(4)}  ${g.name}`);
}
console.log(`\n${all.length} groups total`);
