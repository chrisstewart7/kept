/**
 * On-chain verification — the gate to the Board.
 *
 * A mint is a Kept token only when ALL hold (§3):
 *  1. it exists on pump.fun (bonding curve or PumpSwap)
 *  2. fee sharing routes 100% of shares to the treasury
 *  3. the sharing config is no longer editable
 *  4. the description carries "Fees to onlyfans.com/<user> via Kept"
 *
 * Anything that cannot be verified is NOT listed. No simulation.
 */

import { TREASURY, treasuryConfigured, OF_USERNAME_RE } from "./constants";

export interface ChainConfig {
  rpc: string | null;
  treasury: string | null;
  ready: boolean; // rpc + real treasury present
}

export function chainConfig(): ChainConfig {
  const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC || null;
  const treasury = treasuryConfigured() ? TREASURY : null;
  return { rpc, treasury, ready: !!(rpc && treasury) };
}

export interface VerifyResult {
  ok: boolean;
  reason?: string;
  checks: {
    onPump: boolean;
    feeShare100: boolean;
    configLocked: boolean;
    descriptionLine: boolean;
  };
  meta?: {
    name: string;
    symbol: string;
    description: string;
    imageUrl: string;
    ofUsername: string;
    mcUsd: number;
    vol24hUsd: number;
    createdAt: string;
  };
}

const FAIL = {
  onPump: false,
  feeShare100: false,
  configLocked: false,
  descriptionLine: false,
};

export function parseRecipient(description: string): string | null {
  const m = description?.match(
    /Fees to onlyfans\.com\/([a-zA-Z0-9._-]{3,30}) via Kept/i,
  );
  if (!m) return null;
  return OF_USERNAME_RE.test(m[1]) ? m[1].toLowerCase() : null;
}

/** pump.fun frontend snapshot: metadata + market numbers */
async function pumpSnapshot(mint: string) {
  const res = await fetch(`https://frontend-api-v3.pump.fun/coins/${mint}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) return null;
  return (await res.json()) as {
    name?: string;
    symbol?: string;
    description?: string;
    image_uri?: string;
    usd_market_cap?: number;
    created_timestamp?: number;
  };
}

export async function verifyToken(mint: string): Promise<VerifyResult> {
  const cfg = chainConfig();
  if (!cfg.ready) {
    return {
      ok: false,
      reason:
        "Indexer not configured — set NEXT_PUBLIC_SOLANA_RPC and a real NEXT_PUBLIC_TREASURY, then detect again.",
      checks: FAIL,
    };
  }

  /* metadata + description line (frontend snapshot) */
  let snap;
  try {
    snap = await pumpSnapshot(mint);
  } catch {
    snap = null;
  }
  if (!snap) {
    return {
      ok: false,
      reason: "Mint not found on pump.fun (or the pump API is unreachable).",
      checks: FAIL,
    };
  }
  const ofUsername = parseRecipient(snap.description ?? "");

  /* on-chain fee sharing config */
  let feeShare100 = false;
  let configLocked = false;
  let shareReason = "";
  try {
    const { Connection, PublicKey } = await import("@solana/web3.js");
    const sdk = await import("@pump-fun/pump-sdk");
    const connection = new Connection(cfg.rpc!, "confirmed");
    const mintPk = new PublicKey(mint);
    const pda = sdk.feeSharingConfigPda(mintPk);
    const info = await connection.getAccountInfo(pda);
    if (!info) {
      shareReason = "No fee sharing config found for this mint.";
    } else {
      const decoded = new sdk.PumpSdk().decodeSharingConfig(info);
      const holders =
        (decoded as { shareholders?: { address: { toString(): string }; shareBps: number }[] })
          .shareholders ?? [];
      feeShare100 =
        holders.length === 1 &&
        holders[0].address.toString() === cfg.treasury &&
        holders[0].shareBps === 10_000;
      if (!feeShare100) shareReason = "Fee share is not 100% to the Kept treasury.";
      try {
        configLocked = !sdk.isSharingConfigEditable({
          sharingConfig: decoded,
        } as Parameters<typeof sdk.isSharingConfigEditable>[0]);
      } catch {
        configLocked = false;
      }
      if (feeShare100 && !configLocked)
        shareReason = "Sharing config is still editable — revoke/lock it.";
    }
  } catch (e) {
    shareReason = `Chain check failed: ${e instanceof Error ? e.message : "RPC error"}`;
  }

  const checks = {
    onPump: true,
    feeShare100,
    configLocked,
    descriptionLine: !!ofUsername,
  };
  const ok = checks.onPump && feeShare100 && configLocked && !!ofUsername;
  return {
    ok,
    reason: ok
      ? undefined
      : !ofUsername
        ? 'Description is missing the exact line "Fees to onlyfans.com/<username> via Kept".'
        : shareReason || "Verification failed.",
    checks,
    meta: {
      name: snap.name ?? mint.slice(0, 6),
      symbol: snap.symbol ?? "",
      description: snap.description ?? "",
      imageUrl: snap.image_uri ?? "",
      ofUsername: ofUsername ?? "",
      mcUsd: Math.round(snap.usd_market_cap ?? 0),
      vol24hUsd: 0,
      createdAt: snap.created_timestamp
        ? new Date(snap.created_timestamp).toISOString()
        : new Date().toISOString(),
    },
  };
}
