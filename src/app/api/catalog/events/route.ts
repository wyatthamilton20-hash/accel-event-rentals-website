import { NextResponse } from "next/server";
import { getProductById, type Product } from "@/lib/current-rms";

export const revalidate = 86400; // 24 hours — curated bundles with product details

/**
 * Curated event bundles with scaling rules.
 * - `perGuest: 1` = 1 per guest (chairs, plates, glasses)
 * - `perGuest: 0` + `fixed: N` = fixed quantity regardless of guest count (tents, bars, decor)
 * - `per8: 1` = 1 per 8 guests (tables)
 */
interface BundleItemConfig {
  productId: number;
  label: string;
  perGuest?: number;   // qty = guests * perGuest
  per8?: number;        // qty = ceil(guests / 8) * per8
  per10?: number;       // qty = ceil(guests / 10) * per10
  fixed?: number;       // qty = fixed (doesn't scale)
}

interface BundleConfig {
  heading: string;
  description: string;
  baseGuests: number;
  items: BundleItemConfig[];
}

const BUNDLE_CONFIGS: Record<string, BundleConfig> = {
  Weddings: {
    heading: "Wedding Essentials",
    description: "Elegant setup for your dream wedding.",
    baseGuests: 120,
    items: [
      { productId: 769, label: "Tents", fixed: 1 },
      { productId: 1741, label: "Seating", perGuest: 1 },
      { productId: 692, label: "Tables", per8: 1 },
      { productId: 583, label: "Chargers", perGuest: 1 },
      { productId: 1631, label: "Flatware", perGuest: 1 },
      { productId: 539, label: "Glassware", perGuest: 1 },
      { productId: 477, label: "Bars", fixed: 2 },
      { productId: 820, label: "Lighting", fixed: 4 },
    ],
  },
  Birthdays: {
    heading: "Birthday Party",
    description: "Fun and festive party setup.",
    baseGuests: 30,
    items: [
      { productId: 767, label: "Tents", fixed: 1 },
      { productId: 2146, label: "Seating", perGuest: 1 },
      { productId: 2164, label: "Tables", per8: 1 },
      { productId: 689, label: "Cocktail Tables", fixed: 4 },
      { productId: 536, label: "Glassware", perGuest: 1 },
      { productId: 851, label: "Coolers", fixed: 1 },
    ],
  },
  Corporate: {
    heading: "Corporate Event",
    description: "Professional and polished event setup.",
    baseGuests: 80,
    items: [
      { productId: 769, label: "Tents", fixed: 1 },
      { productId: 1916, label: "Seating", perGuest: 1 },
      { productId: 691, label: "Tables", per8: 1 },
      { productId: 1562, label: "Cocktail Tables", per10: 1 },
      { productId: 480, label: "Bars", fixed: 1 },
      { productId: 1627, label: "Flatware", perGuest: 1 },
      { productId: 2118, label: "Glassware", perGuest: 1 },
    ],
  },
  Luau: {
    heading: "Luau & Beach Party",
    description: "Island vibes for a tropical celebration.",
    baseGuests: 40,
    items: [
      { productId: 1959, label: "Seating", per8: 1 },
      { productId: 1910, label: "Bars", fixed: 2 },
      { productId: 2177, label: "Chargers", perGuest: 1 },
      { productId: 531, label: "Glassware", perGuest: 1 },
      { productId: 1953, label: "Decor", fixed: 1 },
      { productId: 826, label: "Lighting", fixed: 10 },
    ],
  },
  "Baby Shower": {
    heading: "Baby Shower",
    description: "Sweet and elegant celebration for the parents-to-be.",
    baseGuests: 25,
    items: [
      { productId: 767, label: "Tents", fixed: 1 },
      { productId: 1819, label: "Seating", perGuest: 1 },
      { productId: 690, label: "Cake Table", fixed: 1 },
      { productId: 2164, label: "Tables", per8: 1 },
      { productId: 579, label: "Chargers", perGuest: 1 },
      { productId: 2118, label: "Glassware", perGuest: 1 },
    ],
  },
  "Graduation Party": {
    heading: "Graduation Party",
    description: "Celebrate the milestone in style.",
    baseGuests: 50,
    items: [
      { productId: 769, label: "Tents", fixed: 1 },
      { productId: 2010, label: "Seating", perGuest: 1 },
      { productId: 691, label: "Tables", per8: 1 },
      { productId: 689, label: "Cocktail Tables", fixed: 6 },
      { productId: 536, label: "Glassware", perGuest: 1 },
      { productId: 845, label: "Beverage Tubs", fixed: 3 },
      { productId: 851, label: "Coolers", fixed: 1 },
    ],
  },
  "Fundraiser": {
    heading: "Fundraiser & Gala",
    description: "Upscale setup for charity events and galas.",
    baseGuests: 150,
    items: [
      { productId: 769, label: "Tents", fixed: 2 },
      { productId: 1741, label: "Seating", perGuest: 1 },
      { productId: 692, label: "Tables", per8: 1 },
      { productId: 586, label: "Chargers", perGuest: 1 },
      { productId: 1631, label: "Flatware", perGuest: 1 },
      { productId: 539, label: "Glassware", perGuest: 1 },
      { productId: 1688, label: "Bars", fixed: 2 },
      { productId: 820, label: "Lighting", fixed: 6 },
    ],
  },
  "Holiday Party": {
    heading: "Holiday Party",
    description: "Festive gathering for the holiday season.",
    baseGuests: 60,
    items: [
      { productId: 769, label: "Tents", fixed: 1 },
      { productId: 1916, label: "Seating", perGuest: 1 },
      { productId: 692, label: "Tables", per8: 1 },
      { productId: 1562, label: "Cocktail Tables", per10: 1 },
      { productId: 1627, label: "Flatware", perGuest: 1 },
      { productId: 529, label: "Glassware", perGuest: 1 },
      { productId: 1732, label: "Bars", fixed: 1 },
      { productId: 827, label: "Lighting", fixed: 8 },
    ],
  },
};

export interface EventItemConfig {
  productId: number;
  label: string;
  perGuest?: number;
  per8?: number;
  per10?: number;
  fixed?: number;
}

export interface EventProductData extends Product {
  groupLabel: string;
  config: EventItemConfig;
}

export interface EventData {
  heading: string;
  description: string;
  baseGuests: number;
  products: EventProductData[];
}

export async function GET() {
  try {
    const events: Record<string, EventData> = {};

    await Promise.all(
      Object.entries(BUNDLE_CONFIGS).map(async ([eventName, config]) => {
        const products = await Promise.all(
          config.items.map(async (item) => {
            const product = await getProductById(item.productId);
            if (!product) return null;
            return {
              ...product,
              groupLabel: item.label,
              config: {
                productId: item.productId,
                label: item.label,
                ...(item.perGuest !== undefined && { perGuest: item.perGuest }),
                ...(item.per8 !== undefined && { per8: item.per8 }),
                ...(item.per10 !== undefined && { per10: item.per10 }),
                ...(item.fixed !== undefined && { fixed: item.fixed }),
              },
            };
          })
        );

        events[eventName] = {
          heading: config.heading,
          description: config.description,
          baseGuests: config.baseGuests,
          products: products.filter((p) => p !== null) as EventProductData[],
        };
      })
    );

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Events catalog API error:", error);
    return NextResponse.json(
      { error: "Failed to load event catalog" },
      { status: 500 }
    );
  }
}
