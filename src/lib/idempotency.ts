export interface CachedResponse {
  status: number;
  body: unknown;
}

interface Entry {
  response: CachedResponse;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 10 * 60 * 1000;

const store = new Map<string, Entry>();

export function getIdempotent(key: string): CachedResponse | null {
  if (!key) return null;
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.response;
}

export function setIdempotent(
  key: string,
  response: CachedResponse,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  if (!key) return;
  const now = Date.now();
  store.set(key, { response, expiresAt: now + ttlMs });
  if (store.size > 1000) {
    for (const [k, v] of store) {
      if (now >= v.expiresAt) store.delete(k);
    }
  }
}
