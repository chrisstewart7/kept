/* Placeholder on-chain values (§1). Swap via env before launch. */

export const KEPT_MINT =
  process.env.NEXT_PUBLIC_KEPT_MINT ??
  "KEPTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxpump";

export const TREASURY =
  process.env.NEXT_PUBLIC_TREASURY ??
  "KeptTreasury11111111111111111111111111111";

/** true only when a real base58 pubkey is set — placeholders don't count */
export function treasuryConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_TREASURY &&
    !/^KeptTreasury1+$/.test(TREASURY) &&
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(TREASURY)
  );
}

/** true only when $KEPT's real mint is set */
export function keptMintConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_KEPT_MINT &&
    !KEPT_MINT.startsWith("KEPTxxxx") &&
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(KEPT_MINT)
  );
}

export const X_HANDLE = process.env.NEXT_PUBLIC_X_HANDLE ?? "@UseKept";

export const SITE_URL = "https://usekept.app";
export const SITE_NAME = "Kept";
export const ADMIN_EMAIL = "admin@usekept.app";

export const DEFAULT_SUB_PRICE_CENTS = 999;

export const descriptionLine = (ofUsername: string) =>
  `Fees to onlyfans.com/${ofUsername} via Kept`;

export const OF_USERNAME_RE = /^[a-zA-Z0-9._-]+$/;

/* Residual donations fire once the leftover after whole subs reaches this */
export const DONATION_MIN_CENTS = 500;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/payments", label: "Payments" },
  { href: "/analytics", label: "Analytics" },
  { href: "/launch", label: "Launch" },
  { href: "/flow", label: "Capital Flow" },
  { href: "/kept", label: "$KEPT" },
  { href: "/docs", label: "Docs" },
] as const;
