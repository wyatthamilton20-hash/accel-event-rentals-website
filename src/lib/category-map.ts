export interface CategoryDef {
  /** Local kebab-case identifier used as map key in CATEGORIES. */
  slug: string;
  /** Display label shown on tiles, mega-menu, and footer. Matches the shop's wording. */
  label: string;
  /** Current RMS product_group ids. Drives image lookup via /api/catalog. May contain
   *  multiple ids when a shop category bundles standard + premium RMS groups. */
  groupIds: number[];
  /** Numeric id used in the storefront URL: `/categories/{shopCategoryId}/{shopCategoryName}`. */
  shopCategoryId: number;
  /** Storefront category name as it appears in the URL path (raw — encoded in shopCategoryUrl). */
  shopCategoryName: string;
  /** Hand-picked cover image used by the shop (shop.accelrentals.com/categories).
   *  Hotlinked from Rent Ant's media CDN to keep visual parity with the storefront. */
  imageUrl: string;
}

// Order: visual / popular categories first, tabletop sub-categories grouped, utility last.
// Mirrors every category exposed at https://shop.accelrentals.com/categories so each tile
// deep-links to a real storefront page and shows the shop's cover image.
export const CATEGORIES: CategoryDef[] = [
  { slug: "tents",             label: "Tents",             groupIds: [119],      shopCategoryId: 19, shopCategoryName: "Tents",             imageUrl: "https://api.rentant.co.uk//media/t3bfhi0s.png" },
  { slug: "chairs",            label: "Chairs",            groupIds: [61],       shopCategoryId: 4,  shopCategoryName: "Chairs",            imageUrl: "https://api.rentant.co.uk//media/kex0i2t2.jpg" },
  { slug: "tables",            label: "Tables",            groupIds: [60],       shopCategoryId: 11, shopCategoryName: "Tables",            imageUrl: "https://api.rentant.co.uk//media/aultqjpj.jpg" },
  { slug: "flooring",          label: "Flooring",          groupIds: [123],      shopCategoryId: 13, shopCategoryName: "Flooring",          imageUrl: "https://api.rentant.co.uk//media/wkphedbm.jpg" },
  { slug: "bar",               label: "Bar",               groupIds: [120],      shopCategoryId: 1,  shopCategoryName: "Bar",               imageUrl: "https://api.rentant.co.uk//media/p4lxpi3n.jpg" },
  { slug: "lounge",            label: "Lounge",            groupIds: [132],      shopCategoryId: 20, shopCategoryName: "Lounge",            imageUrl: "https://api.rentant.co.uk//media/nnx5xioz.jpg" },
  { slug: "lighting",          label: "Lighting",          groupIds: [82],       shopCategoryId: 8,  shopCategoryName: "Lighting",          imageUrl: "https://api.rentant.co.uk//media/hbrkbfnv.jpg" },
  { slug: "linens",            label: "Linens",            groupIds: [124],      shopCategoryId: 16, shopCategoryName: "Linens",            imageUrl: "https://api.rentant.co.uk//media/oxvr5n5b.jpg" },
  { slug: "decor",             label: "Decor",             groupIds: [97],       shopCategoryId: 12, shopCategoryName: "Decor",             imageUrl: "https://api.rentant.co.uk//media/jtdsrv4k.jpg" },
  { slug: "catering",          label: "Catering",          groupIds: [121],      shopCategoryId: 3,  shopCategoryName: "Catering",          imageUrl: "https://api.rentant.co.uk//media/gbdzpufu.jpg" },
  { slug: "plateware",         label: "Plateware",         groupIds: [125, 128], shopCategoryId: 18, shopCategoryName: "Plateware",         imageUrl: "https://api.rentant.co.uk//media/awuhzksh.jpg" },
  { slug: "glassware",         label: "Glassware",         groupIds: [127, 130], shopCategoryId: 9,  shopCategoryName: "Glassware",         imageUrl: "https://api.rentant.co.uk//media/0puujqxg.jpg" },
  { slug: "flatware",          label: "Flatware",          groupIds: [126, 129], shopCategoryId: 5,  shopCategoryName: "Flatware",          imageUrl: "https://api.rentant.co.uk//media/1g4lh1nr.jpg" },
  { slug: "chargers",          label: "Chargers",          groupIds: [131],      shopCategoryId: 14, shopCategoryName: "Chargers",          imageUrl: "https://api.rentant.co.uk//media/exjkzrpj.jpg" },
  { slug: "bar-fronts",        label: "Bar Fronts",        groupIds: [133],      shopCategoryId: 2,  shopCategoryName: "Bar Fronts",        imageUrl: "https://api.rentant.co.uk//media/jlmhkuym.jpg" },
];

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryByLabel(label: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.label === label);
}
