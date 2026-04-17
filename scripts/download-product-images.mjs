#!/usr/bin/env node
/**
 * Download all product icons from Current RMS into public/images/products/rms/
 * and write src/lib/product-images-manifest.json mapping product id -> local paths.
 *
 * Current RMS exposes icons as AWS S3 pre-signed URLs that expire in a few hours.
 * Caching the live URLs leads to broken images once the signatures expire, so we
 * mirror the assets locally and reference static paths at runtime.
 *
 * Usage:
 *   npm run sync-products
 *   # or directly, with creds in .env.local or the shell:
 *   node scripts/download-product-images.mjs
 */

import { writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Env vars are loaded by Node's --env-file-if-exists flag in the npm script.
// Trim any stray whitespace or trailing newline a dotenv file might leave behind.
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

const OUT_DIR = join(ROOT, "public", "images", "products", "rms");
const MANIFEST_PATH = join(ROOT, "src", "lib", "product-images-manifest.json");

async function crmsFetch(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-SUBDOMAIN": SUBDOMAIN,
      "X-AUTH-TOKEN": API_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Current RMS ${res.status} ${res.statusText} on ${endpoint}`);
  }
  return res.json();
}

async function fetchAllActiveProducts() {
  const all = [];
  const perPage = 100;
  let page = 1;
  for (;;) {
    const data = await crmsFetch("products", {
      per_page: String(perPage),
      page: String(page),
      "q[active_eq]": "true",
    });
    const batch = data.products ?? [];
    all.push(...batch);
    const total = data.meta?.total_row_count ?? all.length;
    if (all.length >= total || batch.length === 0) break;
    page++;
  }
  return all;
}

function extFromUrl(url) {
  try {
    const u = new URL(url);
    const ext = extname(u.pathname).toLowerCase();
    if (ext && ext.length >= 2 && ext.length <= 5) return ext;
  } catch {}
  return ".img";
}

async function downloadTo(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
}

async function clearStaleRmsImages() {
  if (!existsSync(OUT_DIR)) return;
  const entries = await readdir(OUT_DIR);
  await Promise.all(
    entries
      .filter((f) => /^\d+-(full|thumb)\./.test(f))
      .map((f) => unlink(join(OUT_DIR, f)))
  );
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(dirname(MANIFEST_PATH), { recursive: true });

  console.log("Fetching active products from Current RMS…");
  const products = await fetchAllActiveProducts();
  console.log(`  → ${products.length} products returned`);

  console.log("Clearing any stale downloaded icons…");
  await clearStaleRmsImages();

  const manifest = {};
  let downloaded = 0;
  let noIcon = 0;
  let failed = 0;

  for (const p of products) {
    // Mirror the runtime filter in src/lib/current-rms.ts so we don't download
    // icons for products that will never be shown.
    const tags = Array.isArray(p.tag_list) ? p.tag_list : [];
    if (tags.includes("noshow")) continue;
    if (typeof p.name === "string" && p.name.toLowerCase().includes("losberger")) continue;

    const iconUrl = p.icon?.url;
    if (!iconUrl) {
      noIcon++;
      continue;
    }
    const fullExt = extFromUrl(iconUrl);
    const thumbUrl = p.icon?.thumb_url || null;
    const thumbExt = thumbUrl ? extFromUrl(thumbUrl) : fullExt;
    const fullRel = `/images/products/rms/${p.id}-full${fullExt}`;
    const thumbRel = thumbUrl ? `/images/products/rms/${p.id}-thumb${thumbExt}` : null;
    try {
      await downloadTo(iconUrl, join(ROOT, "public", fullRel));
      if (thumbUrl) {
        await downloadTo(thumbUrl, join(ROOT, "public", thumbRel));
      }
      manifest[String(p.id)] = { imageUrl: fullRel, thumbUrl: thumbRel };
      downloaded++;
      if (downloaded % 25 === 0) console.log(`  …${downloaded} downloaded`);
    } catch (err) {
      failed++;
      console.warn(`  ⚠ product ${p.id} (${p.name}): ${err.message}`);
    }
  }

  const sorted = Object.fromEntries(
    Object.entries(manifest).sort(([a], [b]) => Number(a) - Number(b))
  );
  await writeFile(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + "\n");

  console.log("");
  console.log(`Downloaded: ${downloaded}`);
  console.log(`No icon:    ${noIcon}`);
  console.log(`Failed:     ${failed}`);
  console.log(`Manifest:   ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
