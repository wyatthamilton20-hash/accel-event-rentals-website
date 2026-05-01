/**
 * Single source of truth for contact info, locations, and social URLs.
 *
 * Data pulled from accelrentals.com + Accel's verified Yelp listings (Oahu
 * warehouse + Maui showroom). Update here if anything changes.
 */

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
      name: "Honolulu Sales Office",
      address: "1299 Kaumualii Street\nHonolulu, HI 96817",
      phone: "(808) 484-2258",
      hours: "Mon–Fri: 9am–4pm HST · Sat–Sun: closed",
    },
    {
      island: "Maui",
      name: "Wailuku Showroom",
      address: "167 Manea Pl\nWailuku, HI 96793",
      phone: "(808) 243-7368",
      hours: "Mon–Fri: 9am–5pm HST · Sat–Sun: closed",
    },
  ],
  social: {
    instagram: "https://www.instagram.com/accelrentals/",
    facebook: "https://www.facebook.com/accelrentals/",
    pinterest: "https://www.pinterest.com/accelpartyrentals/",
    // Accel doesn't appear to maintain a YouTube channel — leave as "#" so the
    // Footer renders the icon but doesn't link out to a dead URL.
    youtube: "#",
  },
} as const;

// Today returns the shop hub. Future deep-link upgrade (slug → numeric ID)
// is a single function-body change here.
export function shopCategoryUrl(_slug?: string): string {
  return `${SITE.shopUrl}/categories`;
}
