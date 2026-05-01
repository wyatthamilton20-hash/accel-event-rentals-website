import Link from "next/link";
import { CATEGORIES } from "@/lib/category-map";
import { getProducts, type Product } from "@/lib/current-rms";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";

export const revalidate = 86400;

export const metadata = {
  title: "Search | Accel Event Rentals",
  robots: { index: false, follow: true },
};

async function getAllProducts(): Promise<Product[]> {
  const groupIds = CATEGORIES.flatMap((c) => c.groupIds);
  const productSets = await Promise.all(
    groupIds.map((gid) =>
      getProducts({ groupId: gid, perPage: 100, activeOnly: true })
        .then((r) => r.products)
        .catch(() => [] as Product[])
    )
  );
  const seen = new Set<number>();
  const unique: Product[] = [];
  for (const p of productSets.flat()) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    unique.push(p);
  }
  return unique;
}

function matches(product: Product, terms: string[]): boolean {
  const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
  return terms.every((t) => haystack.includes(t));
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  let results: Product[] = [];
  if (terms.length > 0) {
    try {
      const all = await getAllProducts();
      results = all.filter((p) => matches(p, terms));
    } catch {
      results = [];
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f7]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <nav className="flex items-center gap-2 text-[13px] text-[#888] mb-8">
          <Link href="/" className="hover:text-[#111] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#111] font-medium">Search</span>
        </nav>

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
            {query ? <>Results for &ldquo;{query}&rdquo;</> : "Search"}
          </h1>
          <p className="mt-2 text-[15px] text-[#888]">
            {query
              ? `${results.length} item${results.length === 1 ? "" : "s"} found`
              : "Type a search term in the header to find rentals."}
          </p>

          <form
            action="/search"
            method="GET"
            className="mt-6 flex max-w-xl overflow-hidden rounded-full border border-[#cccccc] bg-white"
          >
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="What are you looking for?"
              className="w-full border-none bg-transparent px-4 py-2.5 text-[15px] text-[#111] outline-none placeholder:text-[#999]"
            />
            <button
              type="submit"
              className="shrink-0 bg-[#111] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            >
              Search
            </button>
          </form>
        </div>

        {query && results.length > 0 ? (
          <CategoryProductGrid products={results} />
        ) : query ? (
          <div className="text-center py-20">
            <p className="text-[#999] text-[15px] mb-4">
              No products matched your search.
            </p>
            <Link
              href="/rentals/tents"
              className="inline-block px-5 py-2.5 rounded-full bg-[#ff6c0e] text-white text-sm font-semibold transition-opacity hover:opacity-90"
            >
              Browse all rentals
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
