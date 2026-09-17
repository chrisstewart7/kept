/* Placeholder on-chain values (§1). Swap via env before launch. */

export const PAYPIG_MINT =
  process.env.NEXT_PUBLIC_PAYPIG_MINT ??
  "PAYPIGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxpump";

export const TREASURY =
  process.env.NEXT_PUBLIC_TREASURY ??
  "PayPigTreasury11111111111111111111111111111";

/** true only when a real base58 pubkey is set — placeholders don't count */
export function treasuryConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_TREASURY &&
    !/^PayPigTreasury1+$/.test(TREASURY) &&
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(TREASURY)
  );
}

/** true only when $PAYPIG's real mint is set */
export function paypigMintConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_PAYPIG_MINT &&
    !PAYPIG_MINT.startsWith("PAYPIGxxxx") &&
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(PAYPIG_MINT)
  );
}

export const X_HANDLE = process.env.NEXT_PUBLIC_X_HANDLE ?? "@PayPigApp";

export const SITE_URL = "https://paypig.app";
export const SITE_NAME = "PayPig";
export const ADMIN_EMAIL = "admin@paypig.app";

export const DEFAULT_SUB_PRICE_CENTS = 999;

export const descriptionLine = (ofUsername: string) =>
  `Fees to onlyfans.com/${ofUsername} via PayPig`;

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
  { href: "/paypig", label: "$PAYPIG" },
  { href: "/docs", label: "Docs" },
] as const;
