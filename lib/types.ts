export type Rail = "sub" | "cash" | "held" | "buyback";

export interface Creator {
  id: string;
  ofUsername: string;
  displayName: string;
  xHandle?: string;
  avatarUrl: string; // generated identicon / initials, SFW
  subPriceUsdCents: number; // default 999
  lifetimeSubCount: number;
  lifetimeSubUsdCents: number;
  lifetimeCashUsdCents: number;
  heldUsdCents: number;
  tokenCount: number;
}

export interface Token {
  mint: string;
  name: string;
  ticker: string;
  imageUrl: string;
  venue: "pump";
  creatorId: string;
  description: string;
  mcUsd: number;
  vol24hUsd: number;
  feesClaimedUsdCents: number;
  subsBought: number;
  cashSentUsdCents: number;
  createdAt: string;
  feeSharePermanent: boolean;
}

export type PayoutStatus = "queued" | "sent" | "confirmed" | "failed" | "held";

export interface Payout {
  id: string;
  rail: Rail;
  usdCents: number;
  creatorId: string;
  tokenMint: string;
  status: PayoutStatus;
  createdAt: string;
  ofPeriodDays?: number;
  xReceiptUrl?: string;
  solscanUrl?: string;
}

export interface Claim {
  id: string;
  tokenMint: string;
  solLamports: number;
  usdCents: number;
  creatorShareCents: number;
  protocolShareCents: number;
  sig: string;
  createdAt: string;
}

export interface Burn {
  id: string;
  paypigAmount: number;
  usdCents: number;
  sig: string;
  createdAt: string;
}

export interface OfframpEvent {
  id: string;
  kind: "offramp" | "onramp";
  solAmount?: number;
  usdCents: number;
  route: string; // e.g. "SOL → Kraken → USD"
  status: "sent" | "confirmed";
  createdAt: string;
}

export interface Stats {
  feesAllTimeUsdCents: number;
  fees1dUsdCents: number;
  subsPurchased: number;
  cashSentUsdCents: number;
  queuedUsdCents: number;
  burnedPayPig: number;
  /** production readiness flags — surfaced so the UI can gate honestly */
  ready?: { treasury: boolean; rpc: boolean };
}

export interface FlowStep {
  id: string;
  title: string;
  detail: string;
  amount: string;
  status: "sent" | "waiting" | "confirmed";
  link?: { label: string; href: string };
}

export interface AnalyticsPoint {
  date: string; // yyyy-mm-dd
  feesUsdCents: number;
  creatorShareCents: number;
  protocolShareCents: number;
  subsCount: number;
  subsUsdCents: number;
  cashUsdCents: number;
  burnedUsdCents: number;
  burnedPayPig: number;
}

export interface PayPigInfo {
  mint: string;
  live: boolean;
  launched?: boolean;
  priceUsd: number;
  mcUsd: number;
  supply: number;
  burned: number;
  burnedPct: number;
  pumpUrl: string;
}

export interface SearchResults {
  tokens: Token[];
  creators: Creator[];
}
