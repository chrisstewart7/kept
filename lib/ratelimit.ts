/* In-memory sliding-window rate limiter (per serverless instance). */

const g = globalThis as unknown as {
  __paypigRates?: Map<string, number[]>;
};

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  if (!g.__paypigRates) g.__paypigRates = new Map();
  const now = Date.now();
  const hits = (g.__paypigRates.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    g.__paypigRates.set(key, hits);
    return false;
  }
  hits.push(now);
  g.__paypigRates.set(key, hits);
  return true;
}
