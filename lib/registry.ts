/**
 * Token / creator registry — the ONLY source the Board reads.
 *
 * Real tokens only: rows are written exclusively by the indexer/detect path
 * after on-chain verification (lib/verify.ts). No seeded names, ever.
 *
 * Storage: JSON file (durable in dev; /tmp on serverless — a cache, since
 * chain state is the real source of truth and a rescan rebuilds it).
 * Swap `load`/`persist` for Postgres/KV without touching callers.
 */

import { promises as fs } from "fs";
import path from "path";
import { Creator, Payout, Token, Burn, Claim } from "./types";

export interface CreatorProfile {
  ofUsername: string;
  exists: boolean;
  displayName?: string;
  avatarUrl?: string; // our proxy URL, never a raw OF CDN link
  rawAvatarUrl?: string; // server-only: source for the one-time avatar cache
  headerUrl?: string;
  about?: string;
  subPriceUsdCents?: number;
  verified?: boolean;
  fetchedAt: number;
  optOut?: boolean;
}

interface RegistryData {
  tokens: Token[];
  creators: Creator[];
  profiles: Record<string, CreatorProfile>;
  payouts: Payout[]; // stays empty until the claim worker exists — never faked
  claims: Claim[];
  burns: Burn[];
}

const EMPTY: RegistryData = {
  tokens: [],
  creators: [],
  profiles: {},
  payouts: [],
  claims: [],
  burns: [],
};

const FILE =
  process.env.VERCEL === "1"
    ? "/tmp/paypig-registry.json"
    : path.join(process.cwd(), ".paypig-data", "registry.json");

const g = globalThis as unknown as { __paypigRegistry?: RegistryData };

async function load(): Promise<RegistryData> {
  if (g.__paypigRegistry) return g.__paypigRegistry;
  try {
    const raw = await fs.readFile(FILE, "utf8");
    g.__paypigRegistry = { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    g.__paypigRegistry = structuredClone(EMPTY);
  }
  return g.__paypigRegistry!;
}

async function persist(): Promise<void> {
  if (!g.__paypigRegistry) return;
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(g.__paypigRegistry), "utf8");
  } catch {
    /* /tmp may be read-only mid-shutdown; memory copy still serves */
  }
}

/* ── reads ──────────────────────────────────────────────────────────── */

export async function listTokens(): Promise<Token[]> {
  return (await load()).tokens;
}

export async function getTokenRow(mint: string): Promise<Token | undefined> {
  return (await load()).tokens.find((t) => t.mint === mint);
}

export async function listCreators(): Promise<Creator[]> {
  return (await load()).creators;
}

export async function getCreatorRow(
  ofUsername: string,
): Promise<Creator | undefined> {
  return (await load()).creators.find(
    (c) => c.ofUsername === ofUsername.toLowerCase(),
  );
}

export async function getProfile(
  ofUsername: string,
): Promise<CreatorProfile | undefined> {
  return (await load()).profiles[ofUsername.toLowerCase()];
}

export async function listPayouts(): Promise<Payout[]> {
  return (await load()).payouts;
}

export async function listClaims(): Promise<Claim[]> {
  return (await load()).claims;
}

export async function listBurns(): Promise<Burn[]> {
  return (await load()).burns;
}

/* ── writes (indexer / detect path only) ────────────────────────────── */

export async function upsertToken(token: Token): Promise<void> {
  const db = await load();
  const i = db.tokens.findIndex((t) => t.mint === token.mint);
  if (i >= 0) db.tokens[i] = token;
  else db.tokens.unshift(token);
  await persist();
}

export async function upsertCreator(creator: Creator): Promise<void> {
  const db = await load();
  const i = db.creators.findIndex((c) => c.ofUsername === creator.ofUsername);
  if (i >= 0) db.creators[i] = creator;
  else db.creators.push(creator);
  await persist();
}

export async function saveProfile(p: CreatorProfile): Promise<void> {
  const db = await load();
  db.profiles[p.ofUsername.toLowerCase()] = p;
  await persist();
}

export async function setOptOut(ofUsername: string): Promise<void> {
  const db = await load();
  const key = ofUsername.toLowerCase();
  const p = db.profiles[key];
  if (p) {
    p.optOut = true;
    p.avatarUrl = undefined;
    p.headerUrl = undefined;
  } else {
    db.profiles[key] = { ofUsername: key, exists: true, optOut: true, fetchedAt: Date.now() };
  }
  await persist();
}
