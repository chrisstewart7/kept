const usdFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const usdFmtWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Integer cents → "$12.00" */
export function usd(cents: number): string {
  return usdFmt.format(cents / 100);
}

/** Integer cents → "$12,401" (whole dollars, for large aggregates) */
export function usdWhole(cents: number): string {
  return usdFmtWhole.format(Math.round(cents / 100));
}

/** Plain USD number (not cents) → "$1.2M" style compact */
export function usdCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `$${Math.round(n / 1000)}k`;
  if (n >= 1_000) return `$${(n / 1000).toFixed(1)}k`;
  return usdFmtWhole.format(n);
}

export function numCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

/** Relative time: 2m, 14m, 1h, 4h, 3d (§7) */
export function relTime(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  const s = Math.max(1, Math.floor((now - t) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  const mo = Math.floor(d / 30);
  return `${mo}mo`;
}

/** Mint truncation `4…4` (§14) */
export function truncMint(mint: string): string {
  if (mint.length <= 9) return mint;
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`;
}

export function sol(lamports: number): string {
  return `${(lamports / 1_000_000_000).toFixed(3)} SOL`;
}

export function fullDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

export function initials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
