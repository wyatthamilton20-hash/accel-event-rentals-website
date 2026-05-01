export interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

export const rateHits = new Map<string, number[]>();

export function rateLimit(opts: RateLimitOptions): boolean {
  const { key, limit, windowMs } = opts;
  const now = Date.now();
  const hits = (rateHits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    rateHits.set(key, hits);
    return true;
  }
  hits.push(now);
  rateHits.set(key, hits);
  if (rateHits.size > 1000) {
    for (const [k, v] of rateHits) {
      if (v.every((t) => now - t >= windowMs)) rateHits.delete(k);
    }
  }
  return false;
}

export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
