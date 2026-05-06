/**
 * Single source of truth for contact info, locations, and social URLs.
 *
 * Data pulled from accelrentals.com + Accel's verified Yelp listing (Oahu
 * warehouse). Update here if anything changes.
 */

import { getCategoryBySlug } from "@/lib/category-map";

export const SITE = {
  name: "Accel Event Rentals",
  // Swap to the production domain (e.g. https://accelrentals.com) once the
  // Vercel redeploy is pointed at the real DNS.
  url: "https://accel-website-template-zeta.vercel.app",
  // External e-commerce storefront (Rent Ant). All commerce links open here.
  shopUrl: "https://shop.accelrentals.com",
  phone: "(808) 484-2258",
  email: "sales@accelrentals.com",
  tagline: "Laulima. Ho'okipa. Pono.",
  locations: [
    {
      island: "Oahu",
      name: "Honolulu Warehouse",
      address: "1299 Kaumualii Street\nHonolulu, HI 96817",
      phone: "(808) 484-2258",
      hours: "Warehouse: Mon–Fri 9am–3pm HST · Showroom by appointment only",
      mapsUrl:
        "https://www.google.com/maps/place/Accel+Events+%26+Tent/@21.3241377,-157.8746606,17z/data=!3m1!4b1!4m6!3m5!1s0x7c006fd9e267d0ad:0x18c919a04bdb899c!8m2!3d21.3241377!4d-157.8746606!16s%2Fg%2F11k63f_9rb",
    },
  ],
  social: {
    instagram: "https://www.instagram.com/accelrentals",
    facebook: "https://www.facebook.com/accelrentals/",
  },
} as const;

// Deep-links into the Rent Ant storefront when the slug resolves to a known
// category, otherwise falls back to the storefront's category index.
// Pattern: `/categories/{numericId}/{Name}` — Name is URL-encoded but kept
// human-readable (the storefront uses the path segment for SEO).
export function shopCategoryUrl(slug?: string): string {
  if (slug) {
    const cat = getCategoryBySlug(slug);
    if (cat) {
      return `${SITE.shopUrl}/categories/${cat.shopCategoryId}/${encodeURIComponent(cat.shopCategoryName)}`;
    }
  }
  return `${SITE.shopUrl}/categories`;
}
