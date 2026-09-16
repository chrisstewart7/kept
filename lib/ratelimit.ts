/* In-memory sliding-window rate limiter (per serverless instance). */

const g = globalThis as unknown as {
  __keptRates?: Map<string, number[]>;
};

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  if (!g.__keptRates) g.__keptRates = new Map();
  const now = Date.now();
  const hits = (g.__keptRates.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    g.__keptRates.set(key, hits);
    return false;
  }
  hits.push(now);
  g.__keptRates.set(key, hits);
  return true;
}
