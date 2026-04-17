import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug, CATEGORIES } from "@/lib/category-map";
import { getProducts } from "@/lib/current-rms";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";

export const revalidate = 86400; // 24 hours — product catalog

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  return {
    title: cat
      ? `${cat.label} Rentals | Accel Event Rentals`
      : "Rentals | Accel Event Rentals",
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  // Fetch all products for this category's group IDs
  let products: Awaited<ReturnType<typeof getProducts>>["products"] = [];
  try {
    const productSets = await Promise.all(
      cat.groupIds.map((gid) =>
        getProducts({ groupId: gid, perPage: 50, activeOnly: true }).then(
          (r) => r.products
        )
      )
    );
    products = productSets.flat();
  } catch {
    // API unavailable during build — page renders with empty products
  }

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-[#888] mb-8">
          <Link
            href="/"
            className="hover:text-[#111] transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <span className="text-[#111] font-medium">{cat.label}</span>
        </nav>

        {/* Category header */}
        <div className="mb-10">
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 700,
              color: "#111",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {cat.label}
          </h1>
          <p className="mt-2 text-[15px] text-[#888]">
            {products.length} items available for rent
          </p>

          {/* Category pills for quick switching */}
          <div className="flex gap-2 mt-6 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/rentals/${c.slug}`}
                className="whitespace-nowrap transition-all"
                style={{
                  padding: "7px 18px",
                  borderRadius: 50,
                  fontSize: 13,
                  fontWeight: 600,
                  border: "1.5px solid #111",
                  backgroundColor: c.slug === slug ? "#111" : "transparent",
                  color: c.slug === slug ? "#fff" : "#111",
                  textDecoration: "none",
                }}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Product grid */}
        {products.length > 0 ? (
          <CategoryProductGrid products={products} />
        ) : (
          <p className="text-center text-[#999] py-20">
            No products found in this category.
          </p>
        )}
      </div>
    </main>
  );
}
