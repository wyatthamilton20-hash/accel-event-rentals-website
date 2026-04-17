import { NextResponse } from "next/server";
import { getProducts, type Product } from "@/lib/current-rms";
import { CATEGORIES } from "@/lib/category-map";

export const revalidate = 86400; // 24 hours — product catalog rarely changes

export interface CatalogCategory {
  label: string;
  groupIds: number[];
  products: Product[];
}

export async function GET() {
  try {
    const categories: CatalogCategory[] = await Promise.all(
      CATEGORIES.map(async (cat) => {
        // Fetch up to 6 products from each group, combine for categories with multiple groups
        const productSets = await Promise.all(
          cat.groupIds.map((gid) =>
            getProducts({ groupId: gid, perPage: 50, activeOnly: true }).then(
              (r) => r.products
            )
          )
        );
        const products = productSets.flat();
        return {
          label: cat.label,
          groupIds: [...cat.groupIds],
          products,
        };
      })
    );

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Catalog API error:", error);
    return NextResponse.json(
      { error: "Failed to load catalog" },
      { status: 500 }
    );
  }
}
