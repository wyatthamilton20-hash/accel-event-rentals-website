/**
 * Current RMS API Client — READ ONLY
 *
 * This client ONLY makes GET requests. No POST, PUT, PATCH, or DELETE
 * operations are permitted. This is enforced at the function level.
 */

import manifest from "./product-images-manifest.json";
import { log } from "./log";

const SUBDOMAIN = process.env.CURRENT_RMS_SUBDOMAIN;
const API_KEY = process.env.CURRENT_RMS_API_KEY;
const BASE_URL = "https://api.current-rms.com/api/v1";

/**
 * Server-only auth'd GET against the Current RMS REST API. Returns the parsed
 * response envelope or `null` if credentials aren't configured (so callers can
 * render an empty state during local dev / preview builds without blowing up).
 * Throws on non-2xx responses from the upstream API.
 */
export async function crmsGet(
  endpoint: string,
  params: Record<string, string> = {},
  init: { revalidate?: number; cache?: RequestCache } = {}
): Promise<Response | null> {
  if (!SUBDOMAIN || !API_KEY) return null;
  const url = new URL(`${BASE_URL}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-SUBDOMAIN": SUBDOMAIN,
      "X-AUTH-TOKEN": API_KEY,
      "Content-Type": "application/json",
    },
    ...(init.cache
      ? { cache: init.cache }
      : { next: { revalidate: init.revalidate ?? 86400 } }),
  });

  return res;
}

// Built by scripts/download-product-images.mjs — maps product id to a local
// static path. Current RMS serves icons via AWS S3 pre-signed URLs that expire
// after a few hours, so we mirror them and reference the mirrored copy.
const LOCAL_IMAGES = manifest as Record<
  string,
  { imageUrl: string; thumbUrl: string | null }
>;

function resolveImages(p: CurrentRMSProduct): {
  imageUrl: string | null;
  thumbUrl: string | null;
} {
  const local = LOCAL_IMAGES[String(p.id)];
  return {
    imageUrl: local?.imageUrl ?? p.icon?.url ?? null,
    thumbUrl: local?.thumbUrl ?? p.icon?.thumb_url ?? null,
  };
}

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

// --- READ ONLY fetch wrapper (thin helper over crmsGet for JSON reads) ---
async function fetchCRMS<T>(
  endpoint: string,
  params: Record<string, string> = {},
  revalidate: number = 86400 // Default: 24 hours for product data
): Promise<T> {
  const res = await crmsGet(endpoint, params, { revalidate });
  if (!res) {
    console.warn("Current RMS credentials not configured — returning empty data");
    return {} as T;
  }
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
      ...resolveImages(p),
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
      ...resolveImages(p),
    };
  } catch {
    return null;
  }
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  const results = await Promise.all(ids.map((id) => getProductById(id)));
  return results.filter((p): p is Product => p !== null);
}

// --- Phase C write-back stub ---
// The READ ONLY enforcement above still applies to every other code path.
// `createOpportunity` is gated behind `RMS_WRITE_ENABLED` and ships the
// real fetch only when staff explicitly turn it on. Until then it either
// throws (default) or dry-runs (logs the payload).
//
// See docs/current-rms-opportunity-schema.md for the full target payload.
// The recommended live endpoint is POST /opportunities/checkout, which creates
// the opportunity AND its line items atomically.

import type { QuotePayload, ResolvedQuoteItem } from "./quote-types";

export interface CreateOpportunityInput {
  quoteId: string;
  payload: QuotePayload;
  items: ResolvedQuoteItem[];
}

export interface CreateOpportunityResult {
  id: string | number;
  dryRun: boolean;
}

export async function createOpportunity(
  input: CreateOpportunityInput
): Promise<CreateOpportunityResult> {
  if (process.env.RMS_WRITE_ENABLED !== "true") {
    throw new Error(
      "createOpportunity is disabled — set RMS_WRITE_ENABLED=true to enable Current RMS write-back"
    );
  }

  if (process.env.RMS_WRITE_DRY_RUN === "true") {
    log.info(
      "rms_create_opportunity_dry_run",
      {
        quoteId: input.quoteId,
        payload: input.payload as unknown as Record<string, unknown>,
        items: input.items as unknown as Record<string, unknown>[],
      },
      { pii: true }
    );
    return { id: `dry-run-${Date.now()}`, dryRun: true };
  }

  // TODO: live write-back. See docs/current-rms-opportunity-schema.md §11
  // for the target payload shape. Recommended: POST /opportunities/checkout
  // with `{ opportunity: {...}, items: [...] }` and headers X-SUBDOMAIN +
  // X-AUTH-TOKEN. Caller passes raw form payload + resolved items; this
  // function is responsible for member find-or-create, date conversion to
  // ISO 8601 UTC, custom-field mapping, and item shape translation.
  throw new Error("createOpportunity live write-back is not implemented yet");
}
