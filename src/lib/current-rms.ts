/**
 * Current RMS API Client — READ ONLY
 *
 * This client ONLY makes GET requests. No POST, PUT, PATCH, or DELETE
 * operations are permitted. This is enforced at the function level.
 */

const SUBDOMAIN = process.env.CURRENT_RMS_SUBDOMAIN;
const API_KEY = process.env.CURRENT_RMS_API_KEY;
const BASE_URL = "https://api.current-rms.com/api/v1";

interface CurrentRMSIcon {
  url: string;
  thumb_url: string;
}

interface CurrentRMSProductGroup {
  id: number;
  name: string;
  description: string;
}

interface CurrentRMSRentalRate {
  price: string;
}

interface CurrentRMSProduct {
  id: number;
  name: string;
  description: string;
  active: boolean;
  tag_list: string[];
  product_group_id: number;
  product_group: CurrentRMSProductGroup;
  rental_rate: CurrentRMSRentalRate;
  icon: CurrentRMSIcon | null;
}

interface CurrentRMSResponse<T> {
  meta: {
    total_row_count: number;
    row_count: number;
    page: number;
    per_page: number;
  };
  [key: string]: T[] | CurrentRMSResponse<T>["meta"];
}

// --- READ ONLY fetch wrapper ---
async function fetchCRMS<T>(
  endpoint: string,
  params: Record<string, string> = {},
  revalidate: number = 86400 // Default: 24 hours for product data
): Promise<T> {
  if (!SUBDOMAIN || !API_KEY) {
    console.warn("Current RMS credentials not configured — returning empty data");
    return {} as T;
  }

  const url = new URL(`${BASE_URL}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    method: "GET", // READ ONLY — never anything else
    headers: {
      "X-SUBDOMAIN": SUBDOMAIN,
      "X-AUTH-TOKEN": API_KEY,
      "Content-Type": "application/json",
    },
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`Current RMS API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// --- Public Types ---
export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  categoryId: number;
  price: string;
  imageUrl: string | null;
  thumbUrl: string | null;
}

export interface ProductGroup {
  id: number;
  name: string;
}

// --- Public API (READ ONLY) ---

export async function getProductGroups(): Promise<ProductGroup[]> {
  const data = await fetchCRMS<CurrentRMSResponse<CurrentRMSProductGroup>>(
    "product_groups",
    { per_page: "100" }
  );
  const groups = data.product_groups as CurrentRMSProductGroup[];
  return groups
    .filter((g) => !["Disclaimers", "Additional Discounts", "Package", "Packages"].includes(g.name))
    .map((g) => ({ id: g.id, name: g.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProducts(options?: {
  groupId?: number;
  page?: number;
  perPage?: number;
  activeOnly?: boolean;
}): Promise<{ products: Product[]; totalCount: number }> {
  const params: Record<string, string> = {
    per_page: String(options?.perPage ?? 20),
    page: String(options?.page ?? 1),
  };

  if (options?.groupId) {
    params["q[product_group_id_eq]"] = String(options.groupId);
  }

  if (options?.activeOnly !== false) {
    params["q[active_eq]"] = "true";
  }

  const data = await fetchCRMS<CurrentRMSResponse<CurrentRMSProduct>>(
    "products",
    params
  );

  const raw = data.products as CurrentRMSProduct[];
  const meta = data.meta as CurrentRMSResponse<CurrentRMSProduct>["meta"];

  const products: Product[] = raw
    .filter((p) => !p.tag_list.includes("noshow") && !p.name.toLowerCase().includes("losberger"))
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || "",
      category: p.product_group?.name || "Uncategorized",
      categoryId: p.product_group_id,
      price: `$${parseFloat(p.rental_rate?.price || "0").toFixed(0)}`,
      imageUrl: p.icon?.url || null,
      thumbUrl: p.icon?.thumb_url || null,
    }));

  return { products, totalCount: meta.total_row_count };
}

export async function getProductsByGroup(
  groupId: number,
  perPage = 50
): Promise<Product[]> {
  const { products } = await getProducts({ groupId, perPage, activeOnly: true });
  return products;
}

export async function getFeaturedProducts(count = 12): Promise<Product[]> {
  const { products } = await getProducts({ perPage: count, activeOnly: true });
  return products;
}

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const data = await fetchCRMS<{ product: CurrentRMSProduct }>(
      `products/${id}`
    );
    const p = data.product;
    return {
      id: p.id,
      name: p.name,
      description: p.description || "",
      category: p.product_group?.name || "Uncategorized",
      categoryId: p.product_group_id,
      price: `$${parseFloat(p.rental_rate?.price || "0").toFixed(0)}`,
      imageUrl: p.icon?.url || null,
      thumbUrl: p.icon?.thumb_url || null,
    };
  } catch {
    return null;
  }
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  const results = await Promise.all(ids.map((id) => getProductById(id)));
  return results.filter((p): p is Product => p !== null);
}
