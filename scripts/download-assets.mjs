import { writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "..", "public");

const BASE = "https://www.townandcountry.com";

const assets = [
  // Logos
  { url: "/images/2025/landing-assets/tacer-footer-logo.png", dest: "images/logos/tacer-footer-logo.png" },
  { url: "/mm5/graphics/00000001/4/Town-&-Country-Logo_600x119.png", dest: "images/logos/town-country-logo.png" },
  { url: "/images/Town-&-Country-Logo.png", dest: "images/logos/town-country-logo-nav.png" },
  { url: "/images/2025/landing-assets/about-logo.png", dest: "images/logos/about-logo.png" },
  { url: "/images/2025/landing-assets/signature-footer-logo.png", dest: "images/logos/signature-footer-logo.png" },

  // Hero carousel images
  { url: "/cdn-cgi/image/width=1600,quality=85/images/2026/carousel-images/1.jpg", dest: "images/hero/1.jpg" },
  { url: "/cdn-cgi/image/width=1600,quality=85/images/2026/carousel-images/2.jpg", dest: "images/hero/2.jpg" },
  { url: "/cdn-cgi/image/width=1600,quality=85/images/2026/carousel-images/3.jpg", dest: "images/hero/3.jpg" },
  { url: "/cdn-cgi/image/width=1600,quality=85/images/2026/carousel-images/4.jpg", dest: "images/hero/4.jpg" },
  { url: "/cdn-cgi/image/width=1600,quality=85/images/2026/carousel-images/5.jpg", dest: "images/hero/5.jpg" },
  { url: "/cdn-cgi/image/width=1600,quality=85/images/2026/carousel-images/6.jpg", dest: "images/hero/6.jpg" },
  { url: "/cdn-cgi/image/width=1600,quality=85/images/2026/carousel-images/7.jpg", dest: "images/hero/7.jpg" },
  { url: "/cdn-cgi/image/width=1600,quality=85/images/2026/carousel-images/8.jpg", dest: "images/hero/8.jpg" },

  // On Trend product images
  { url: "/mm5/graphics/00000001/3/flora_bella_stacked_b_400x400.jpg", dest: "images/products/flora-bella.jpg" },
  { url: "/mm5/graphics/00000001/4/aria_stainless_steel_set_plus_butter_400x400.jpg", dest: "images/products/aria-stainless.jpg" },
  { url: "/mm5/graphics/00000001/3/Rattan-Honey_400x400.jpg", dest: "images/products/birch-honey.jpg" },
  { url: "/mm5/graphics/00000001/3/Napoli_Glassware_400x400.jpg", dest: "images/products/napoli-glassware.jpg" },
  { url: "/mm5/graphics/00000001/3/Tivoli%20natural%20perspective_400x400.jpg", dest: "images/products/tivoli-chair.jpg" },
  { url: "/mm5/graphics/00000001/4/Vero-Natural-Sideview_400x400.jpg", dest: "images/products/vero-chair.jpg" },
  { url: "/mm5/graphics/00000001/4/townandcountry-053-top_400x400.jpg", dest: "images/products/palermo-highboy.jpg" },
  { url: "/mm5/graphics/00000001/3/Tribeca_bar_back_White%20Powder%20Coat_cane_400x400.jpg", dest: "images/products/tribeca-bar.jpg" },
  { url: "/mm5/graphics/00000001/3/Milo%20Bar%20Velvet%20Panel_Poished%20%20Gold_Dusty%20Rose_400x400.jpg", dest: "images/products/milo-bar.jpg" },
  { url: "/mm5/graphics/00000001/4/townandcountry-096-top_400x400.jpg", dest: "images/products/product-10.jpg" },
  { url: "/mm5/graphics/00000001/4/132A1126_edit_400x400.jpg", dest: "images/products/product-11.jpg" },
  { url: "/mm5/graphics/00000001/3/132A2535_400x400.jpg", dest: "images/products/product-12.jpg" },

  // Featured Events background
  { url: "/cdn-cgi/image/width=1600,quality=85/images/2026/featured-events/assets/2025_07_03HummingBirdSonyExp_152_2000x1130.jpg", dest: "images/featured-events-bg.jpg" },

  // Design Centers background
  { url: "/cdn-cgi/image/height=600,quality=85/images/2025/landing-assets/Design-Centers-HP-Image-May-2025.jpg", dest: "images/design-centers-bg.jpg" },

  // Navigation icon
  { url: "/images/2025/navigation/location-icon.png", dest: "images/icons/location-icon.png" },
];

async function download(url, dest) {
  const fullUrl = url.startsWith("http") ? url : BASE + url;
  const fullDest = join(PUBLIC, dest);
  await mkdir(dirname(fullDest), { recursive: true });

  try {
    const res = await fetch(fullUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (!res.ok) {
      console.error(`FAIL ${res.status}: ${fullUrl}`);
      return;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(fullDest, buffer);
    console.log(`OK: ${dest} (${(buffer.length / 1024).toFixed(1)}KB)`);
  } catch (err) {
    console.error(`ERROR: ${fullUrl} - ${err.message}`);
  }
}

async function main() {
  console.log(`Downloading ${assets.length} assets...`);
  // Download in batches of 4
  for (let i = 0; i < assets.length; i += 4) {
    const batch = assets.slice(i, i + 4);
    await Promise.all(batch.map((a) => download(a.url, a.dest)));
  }
  console.log("Done!");
}

main();
