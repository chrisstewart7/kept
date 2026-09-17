/**
 * Data layer — real tokens only.
 *
 * The demo/preview universe is gone. Every read comes from the registry
 * (lib/registry.ts), which is written exclusively by the verified
 * detect/indexer path (lib/verify.ts). Payouts, claims, and burns stay
 * empty until the claim worker exists — they are never fabricated.
 */

import {
  AnalyticsPoint,
  Burn,
  Claim,
  Creator,
  FlowStep,
  PayPigInfo,
  OfframpEvent,
  Payout,
  Stats,
  Token,
} from "./types";
import {
  PAYPIG_MINT,
  paypigMintConfigured,
  treasuryConfigured,
} from "./constants";
import { chainConfig, VerifyResult } from "./verify";
import {
  getCreatorRow,
  getProfile,
  getTokenRow,
  listBurns,
  listClaims,
  listCreators,
  listPayouts,
  listTokens,
  upsertCreator,
  upsertToken,
} from "./registry";

/* ── stats ──────────────────────────────────────────────────────────── */

export async function getStats(): Promise<
  Stats & { ready: { treasury: boolean; rpc: boolean } }
> {
  const [claims, payouts, burns] = await Promise.all([
    listClaims(),
    listPayouts(),
    listBurns(),
  ]);
  const day = Date.now() - 86_400_000;
  return {
    feesAllTimeUsdCents: claims.reduce((s, c) => s + c.usdCents, 0),
    fees1dUsdCents: claims
      .filter((c) => +new Date(c.createdAt) > day)
      .reduce((s, c) => s + c.usdCents, 0),
    subsPurchased: payouts.filter((p) => p.rail === "sub").length,
    cashSentUsdCents: payouts
      .filter((p) => p.rail === "cash")
      .reduce((s, p) => s + p.usdCents, 0),
    queuedUsdCents: payouts
      .filter((p) => p.rail === "held")
      .reduce((s, p) => s + p.usdCents, 0),
    burnedPayPig: burns.reduce((s, b) => s + b.paypigAmount, 0),
    ready: {
      treasury: treasuryConfigured(),
      rpc: !!chainConfig().rpc,
    },
  };
}

/* ── payments ───────────────────────────────────────────────────────── */

export async function getPayments(opts: {
  rail?: string;
  cursor?: number;
  limit?: number;
}): Promise<{ items: Payout[]; nextCursor: number | null }> {
  let all = [...(await listPayouts())].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
  if (opts.rail && opts.rail !== "all") {
    if (opts.rail === "receipts") {
      all = all.filter((p) => p.rail === "sub" || p.rail === "cash");
    } else {
      all = all.filter((p) => p.rail === opts.rail);
    }
  }
  const cursor = opts.cursor ?? 0;
  const limit = opts.limit ?? 25;
  return {
    items: all.slice(cursor, cursor + limit),
    nextCursor: cursor + limit < all.length ? cursor + limit : null,
  };
}

export async function getReceipt(id: string): Promise<Payout | undefined> {
  return (await listPayouts()).find((p) => p.id === id);
}

export async function paymentsForToken(mint: string, limit = 20) {
  return (await listPayouts())
    .filter((p) => p.tokenMint === mint)
    .slice(0, limit);
}

export async function paymentsForCreator(creatorId: string, limit = 20) {
  return (await listPayouts())
    .filter((p) => p.creatorId === creatorId)
    .slice(0, limit);
}

/* ── tokens / creators ──────────────────────────────────────────────── */

export async function getTokens(opts: {
  sort?: string;
  q?: string;
}): Promise<Token[]> {
  let all = [...(await listTokens())];
  if (opts.q) {
    const q = opts.q.toLowerCase();
    const creators = await listCreators();
    all = all.filter((t) => {
      const c = creators.find((x) => x.id === t.creatorId);
      return (
        t.name.toLowerCase().includes(q) ||
        t.ticker.toLowerCase().includes(q) ||
        t.mint.toLowerCase().includes(q) ||
        c?.ofUsername.includes(q)
      );
    });
  }
  const by: Record<string, (a: Token, b: Token) => number> = {
    new: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    mc: (a, b) => b.mcUsd - a.mcUsd,
    subs: (a, b) => b.subsBought - a.subsBought,
    cash: (a, b) => b.cashSentUsdCents - a.cashSentUsdCents,
    fees: (a, b) => b.feesClaimedUsdCents - a.feesClaimedUsdCents,
  };
  return all.sort(by[opts.sort ?? "new"] ?? by.new);
}

export async function getToken(mint: string) {
  return getTokenRow(mint);
}

export async function creatorById(id: string): Promise<Creator | undefined> {
  return (await listCreators()).find((c) => c.id === id);
}

export async function getCreator(handle: string) {
  return getCreatorRow(handle);
}

export async function getCreators(): Promise<Creator[]> {
  return [...(await listCreators())].sort(
    (a, b) =>
      b.lifetimeSubUsdCents + b.lifetimeCashUsdCents -
      (a.lifetimeSubUsdCents + a.lifetimeCashUsdCents),
  );
}

/* ── burns / claims / offramp / analytics ───────────────────────────── */

export async function getBurns(limit = 30): Promise<Burn[]> {
  return (await listBurns()).slice(0, limit);
}

export async function getClaims(limit = 30): Promise<Claim[]> {
  return (await listClaims()).slice(0, limit);
}

export async function getOfframp(): Promise<OfframpEvent[]> {
  return []; // off-ramp worker not built — never faked
}

export async function getAnalytics(
  range: "1d" | "30d" | "all",
): Promise<AnalyticsPoint[]> {
  const claims = await listClaims();
  if (!claims.length) return [];
  const days = range === "1d" ? 2 : range === "30d" ? 30 : 120;
  const out: AnalyticsPoint[] = [];
  for (let d = days - 1; d >= 0; d--) {
    const start = Date.now() - (d + 1) * 86_400_000;
    const end = Date.now() - d * 86_400_000;
    const inDay = claims.filter((c) => {
      const t = +new Date(c.createdAt);
      return t > start && t <= end;
    });
    const fees = inDay.reduce((s, c) => s + c.usdCents, 0);
    out.push({
      date: new Date(end).toISOString().slice(0, 10),
      feesUsdCents: fees,
      creatorShareCents: Math.round(fees * 0.8),
      protocolShareCents: Math.round(fees * 0.2),
      subsCount: 0,
      subsUsdCents: 0,
      cashUsdCents: 0,
      burnedUsdCents: 0,
      burnedPayPig: 0,
    });
  }
  return out;
}

/* ── $PAYPIG ──────────────────────────────────────────────────────────── */

export async function getPayPigInfo(): Promise<PayPigInfo & { launched: boolean }> {
  const launched = paypigMintConfigured();
  const burned = (await listBurns()).reduce((s, b) => s + b.paypigAmount, 0);
  const supply = 1_000_000_000;
  return {
    mint: PAYPIG_MINT,
    launched,
    live: false, // price/MC need a market feed — never guessed
    priceUsd: 0,
    mcUsd: 0,
    supply,
    burned,
    burnedPct: +((burned / supply) * 100).toFixed(2),
    pumpUrl: `https://pump.fun/coin/${PAYPIG_MINT}`,
  };
}

/* ── capital flow — worked example until a real claim settles ───────── */

const EXAMPLE_FLOW: FlowStep[] = [
  {
    id: "claim",
    title: "Claim on-chain",
    detail:
      "Creator fees are claimed from the pump.fun vault for an example token pointed at onlyfans.com/<creator>.",
    amount: "1.250 SOL · $306.25",
    status: "confirmed",
    link: { label: "How claims work", href: "/docs/how-claims-work" },
  },
  {
    id: "split",
    title: "Split",
    detail: "Applied per claim. No discretion.",
    amount: "80% $245.00 · 20% $61.25",
    status: "confirmed",
  },
  {
    id: "offramp",
    title: "Off-ramp",
    detail: "The creator share converts to dollars for the delivery float.",
    amount: "1.000 SOL → exchange → USD",
    status: "confirmed",
  },
  {
    id: "sub",
    title: "Subscription worker",
    detail:
      "24 × 30-day subscriptions at $9.99, purchased from a protocol fan account. The creator sees 24 new paying subscribers.",
    amount: "24 subs · $239.76",
    status: "confirmed",
    link: { label: "Subscription purchases", href: "/docs/subscription-purchases" },
  },
  {
    id: "residual",
    title: "Residual donation",
    detail: "Leftover after whole subs, tipped to the creator on OnlyFans.",
    amount: "$5.24 tipped",
    status: "sent",
    link: { label: "Donations", href: "/docs/donations" },
  },
  {
    id: "buyback",
    title: "Buyback",
    detail: "The protocol share market-buys $PAYPIG via Jupiter, then burns it.",
    amount: "0.250 SOL → $PAYPIG → burn",
    status: "confirmed",
    link: { label: "$PAYPIG and the buyback", href: "/docs/paypig-and-the-buyback" },
  },
];

export async function getFlow(): Promise<{
  steps: FlowStep[];
  example: boolean;
}> {
  const claims = await listClaims();
  if (!claims.length) return { steps: EXAMPLE_FLOW, example: true };
  const claim = claims[0];
  const tk = await getTokenRow(claim.tokenMint);
  const c = tk ? await creatorById(tk.creatorId) : undefined;
  const subPrice = c?.subPriceUsdCents ?? 999;
  const subs = Math.floor(claim.creatorShareCents / subPrice);
  const residual = claim.creatorShareCents - subs * subPrice;
  const steps: FlowStep[] = [
    {
      id: "claim",
      title: "Claim on-chain",
      detail: `Creator fees claimed from the pump.fun vault for ${tk ? `$${tk.ticker}` : "token"}.`,
      amount: `${(claim.solLamports / 1e9).toFixed(3)} SOL`,
      status: "confirmed",
      link: { label: "Solscan", href: `https://solscan.io/tx/${claim.sig}` },
    },
    {
      id: "split",
      title: "Split",
      detail: "Applied per claim. No discretion.",
      amount: "80% creator · 20% protocol",
      status: "confirmed",
    },
    {
      id: "sub",
      title: "Subscription worker",
      detail: "Delivery worker not live yet — claim recorded, rail pending.",
      amount: `${subs} sub${subs === 1 ? "" : "s"} queued`,
      status: "waiting",
    },
    {
      id: "residual",
      title: "Residual donation",
      detail: "Queued behind the subscription worker.",
      amount: `$${(residual / 100).toFixed(2)} queued`,
      status: "waiting",
    },
    {
      id: "buyback",
      title: "Buyback",
      detail: "Protocol share market-buys $PAYPIG via Jupiter, then burns it.",
      amount: `${(claim.protocolShareCents / 100 / 245).toFixed(3)} SOL → $PAYPIG → burn`,
      status: "waiting",
    },
  ];
  return { steps, example: false };
}

/* ── search ─────────────────────────────────────────────────────────── */

export async function search(q: string) {
  const query = q.trim().toLowerCase();
  if (!query) return { tokens: [], creators: [] };
  const [tokens, creators] = await Promise.all([listTokens(), listCreators()]);
  return {
    tokens: tokens
      .filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.ticker.toLowerCase().includes(query) ||
          t.mint.toLowerCase().includes(query),
      )
      .slice(0, 8),
    creators: creators
      .filter(
        (c) =>
          c.ofUsername.includes(query) ||
          c.displayName.toLowerCase().includes(query),
      )
      .slice(0, 8),
  };
}

/* ── ingest — the ONLY way a token reaches the Board ────────────────── */

export async function ingestVerified(
  mint: string,
  v: VerifyResult,
): Promise<Token> {
  if (!v.ok || !v.meta) throw new Error(v.reason ?? "not verified");
  const username = v.meta.ofUsername.toLowerCase();
  let creator = await getCreatorRow(username);
  if (!creator) {
    const profile = await getProfile(username);
    creator = {
      id: `of_${username}`,
      ofUsername: username,
      displayName: profile?.displayName ?? username,
      avatarUrl: profile?.avatarUrl ?? "",
      subPriceUsdCents: profile?.subPriceUsdCents ?? 999,
      lifetimeSubCount: 0,
      lifetimeSubUsdCents: 0,
      lifetimeCashUsdCents: 0,
      heldUsdCents: 0,
      tokenCount: 0,
    };
  }
  const existing = await getTokenRow(mint);
  if (!existing) creator.tokenCount += 1;
  await upsertCreator(creator);
  const token: Token = {
    mint,
    name: v.meta.name,
    ticker: v.meta.symbol.toUpperCase().replace(/^\$/, ""),
    imageUrl: v.meta.imageUrl,
    venue: "pump",
    creatorId: creator.id,
    description: v.meta.description,
    mcUsd: v.meta.mcUsd,
    vol24hUsd: v.meta.vol24hUsd,
    feesClaimedUsdCents: existing?.feesClaimedUsdCents ?? 0,
    subsBought: existing?.subsBought ?? 0,
    cashSentUsdCents: existing?.cashSentUsdCents ?? 0,
    createdAt: v.meta.createdAt,
    feeSharePermanent: true,
  };
  await upsertToken(token);
  return token;
}
