// One-shot helper: mirror the inspiration photos from accelrentals.com/galleries/
// into /public/images/inspiration/ so the /gallery page can render them via
// next/image without depending on the WordPress origin staying up.
//
// Run: node --env-file-if-exists=.env.local scripts/download-inspiration-photos.mjs
//
// Re-runnable: skips files that already exist locally. Pass --force to
// overwrite.

import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = `${__dirname}/../public/images/inspiration`;
const FORCE = process.argv.includes("--force");

// Pulled from https://accelrentals.com/galleries/ — these are the cover photos
// (each is itself a full inspiration photo, the page is a flat lightbox grid).
// Renamed to short kebab-case slugs that survive a future move to a CMS.
const PHOTOS = [
  { src: "https://accelrentals.com/wp-content/uploads/2020/10/AccelEventRentals_Outdoor3.png",                    out: "outdoor.png" },
  { src: "https://accelrentals.com/wp-content/uploads/2020/10/AER_Ashley-Goodwin-Photos.png",                     out: "ashley-goodwin.png" },
  { src: "https://accelrentals.com/wp-content/uploads/2020/10/Desiree-Leilani-Photos_AER.png",                    out: "desiree-leilani.png" },
  { src: "https://accelrentals.com/wp-content/uploads/2020/10/India-Pearl-Photos_AER.png",                        out: "india-pearl.png" },
  { src: "https://accelrentals.com/wp-content/uploads/2020/10/Jessica-Sullivan-Photography_AER.png",              out: "jessica-sullivan.png" },
  { src: "https://accelrentals.com/wp-content/uploads/2020/10/Lighting_Accel-Event-Rentals.png",                  out: "lighting.png" },
  { src: "https://accelrentals.com/wp-content/uploads/2020/10/Lighting-Fixtures_Accel-Event-Rentals.png",         out: "lighting-fixtures.png" },
  { src: "https://accelrentals.com/wp-content/uploads/2020/10/Lights_Accel-Event-Rentals.png",                    out: "lights.png" },
  { src: "https://accelrentals.com/wp-content/uploads/2020/10/Molly-Caskey_AER.png",                              out: "molly-caskey.png" },
  { src: "https://accelrentals.com/wp-content/uploads/2020/11/Kualoa-Ranch_Accel-Event-Rentals-scaled.jpeg",      out: "kualoa-ranch.jpeg" },
  { src: "https://accelrentals.com/wp-content/uploads/2020/11/yPJBEQqg.jpg",                                       out: "tented-wedding.jpg" },
  { src: "https://accelrentals.com/wp-content/uploads/2021/05/3.png",                                              out: "wedding-tent-1.png" },
  { src: "https://accelrentals.com/wp-content/uploads/2021/05/4.png",                                              out: "wedding-tent-2.png" },
  { src: "https://accelrentals.com/wp-content/uploads/2021/05/Four-Seasons_Accel-Events-Tents.png",                out: "four-seasons.png" },
];

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

let downloaded = 0;
let skipped = 0;
let failed = 0;

for (const { src, out } of PHOTOS) {
  const dest = `${OUT_DIR}/${out}`;
  if (!FORCE && existsSync(dest)) {
    skipped++;
    continue;
  }
  try {
    const res = await fetch(src, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) {
      console.error(`  ✗ ${out}  HTTP ${res.status}`);
      failed++;
      continue;
    }
    await pipeline(res.body, createWriteStream(dest));
    console.log(`  ✓ ${out}`);
    downloaded++;
  } catch (err) {
    console.error(`  ✗ ${out}  ${err.message}`);
    failed++;
  }
}

console.log(`\n${downloaded} downloaded, ${skipped} skipped, ${failed} failed`);
if (failed > 0) process.exit(1);
