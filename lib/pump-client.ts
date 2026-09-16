"use client";

/**
 * Client-side pump.fun launch (§4). All instructions are built in the
 * browser and signed by the user's wallet — the server never sees a key.
 *
 * Sequence per spec: create → createFeeSharingConfig → updateFeeShares
 * (single shareholder: treasury @ 10000 bps) in ONE transaction, then
 * notify the indexer.
 */

import { descriptionLine, TREASURY } from "./constants";
import type { InjectedProvider } from "@/components/wallet";

export interface LaunchInput {
  name: string;
  ticker: string;
  ofUsername: string;
  imageFile: File | null;
  useAvatarOf: string | null;
  provider: InjectedProvider;
  walletAddress: string;
}

export type LaunchPhase =
  | "uploading"
  | "building"
  | "signing"
  | "confirming"
  | "detecting";

export interface LaunchOutcome {
  mint: string;
  signature: string;
}

export class LaunchError extends Error {
  constructor(
    message: string,
    public phase: LaunchPhase,
    public mint?: string,
  ) {
    super(message);
  }
}

export async function launchOnPump(
  input: LaunchInput,
  onPhase: (p: LaunchPhase) => void,
): Promise<LaunchOutcome> {
  const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC;
  if (!rpc) throw new LaunchError("RPC not configured", "building");

  /* 1 — metadata to IPFS via our proxy */
  onPhase("uploading");
  const fd = new FormData();
  fd.set("name", input.name);
  fd.set("symbol", input.ticker);
  fd.set("description", descriptionLine(input.ofUsername));
  if (input.imageFile) fd.set("file", input.imageFile);
  else if (input.useAvatarOf) fd.set("avatarOf", input.useAvatarOf);
  const up = await fetch("/api/pump/ipfs", { method: "POST", body: fd });
  const upJson = (await up.json()) as { metadataUri?: string; error?: string };
  if (!up.ok || !upJson.metadataUri) {
    throw new LaunchError(upJson.error ?? "Metadata upload failed", "uploading");
  }

  /* 2 — build create + fee-share instructions */
  onPhase("building");
  const [{ Connection, Keypair, PublicKey, Transaction }, sdk] =
    await Promise.all([import("@solana/web3.js"), import("@pump-fun/pump-sdk")]);
  const connection = new Connection(rpc, "confirmed");
  const pump = new sdk.PumpSdk();
  const user = new PublicKey(input.walletAddress);
  const treasury = new PublicKey(TREASURY);
  const mintKp = Keypair.generate();

  const createIx = await pump.createV2Instruction({
    mint: mintKp.publicKey,
    name: input.name,
    symbol: input.ticker,
    uri: upJson.metadataUri,
    creator: user,
    user,
  } as Parameters<typeof pump.createV2Instruction>[0]);

  const shareCfgIx = await pump.createFeeSharingConfig({
    creator: user,
    mint: mintKp.publicKey,
    pool: null,
  } as unknown as Parameters<typeof pump.createFeeSharingConfig>[0]);

  const sharesIx = await pump.updateFeeShares({
    authority: user,
    mint: mintKp.publicKey,
    currentShareholders: [],
    newShareholders: [{ address: treasury, shareBps: 10_000 }],
  } as unknown as Parameters<typeof pump.updateFeeShares>[0]);

  const tx = new Transaction();
  for (const ix of [createIx, shareCfgIx, sharesIx].flat()) tx.add(ix);
  tx.feePayer = user;
  tx.recentBlockhash = (
    await connection.getLatestBlockhash("confirmed")
  ).blockhash;
  tx.partialSign(mintKp);

  /* 3 — one wallet signature */
  onPhase("signing");
  if (!input.provider.signAndSendTransaction) {
    throw new LaunchError(
      "This wallet does not expose signAndSendTransaction",
      "signing",
      mintKp.publicKey.toString(),
    );
  }
  let signature: string;
  try {
    const res = await input.provider.signAndSendTransaction(tx);
    signature = res.signature;
  } catch (e) {
    throw new LaunchError(
      e instanceof Error ? e.message : "Wallet rejected the transaction",
      "signing",
      mintKp.publicKey.toString(),
    );
  }

  /* 4 — confirm */
  onPhase("confirming");
  try {
    const bh = await connection.getLatestBlockhash("confirmed");
    await connection.confirmTransaction(
      { signature, ...bh },
      "confirmed",
    );
  } catch {
    throw new LaunchError(
      "Transaction sent but not confirmed yet — check the mint on Solscan, then hit Detect.",
      "confirming",
      mintKp.publicKey.toString(),
    );
  }

  /* 5 — wake the indexer */
  onPhase("detecting");
  await fetch("/api/tokens/detect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mint: mintKp.publicKey.toString() }),
  }).catch(() => {});

  return { mint: mintKp.publicKey.toString(), signature };
}

/** Retry fee-share config for an already-created mint (recovery panel). */
export async function fixFeeShare(
  mint: string,
  provider: InjectedProvider,
  walletAddress: string,
): Promise<string> {
  const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC;
  if (!rpc) throw new Error("RPC not configured");
  const [{ Connection, PublicKey, Transaction }, sdk] = await Promise.all([
    import("@solana/web3.js"),
    import("@pump-fun/pump-sdk"),
  ]);
  const connection = new Connection(rpc, "confirmed");
  const pump = new sdk.PumpSdk();
  const user = new PublicKey(walletAddress);
  const mintPk = new PublicKey(mint);
  const treasury = new PublicKey(TREASURY);

  const tx = new Transaction();
  const pda = sdk.feeSharingConfigPda(mintPk);
  const existing = await connection.getAccountInfo(pda);
  if (!existing) {
    tx.add(
      await pump.createFeeSharingConfig({
        creator: user,
        mint: mintPk,
        pool: null,
      } as unknown as Parameters<typeof pump.createFeeSharingConfig>[0]),
    );
  }
  tx.add(
    await pump.updateFeeShares({
      authority: user,
      mint: mintPk,
      currentShareholders: [],
      newShareholders: [{ address: treasury, shareBps: 10_000 }],
    } as unknown as Parameters<typeof pump.updateFeeShares>[0]),
  );
  tx.feePayer = user;
  tx.recentBlockhash = (
    await connection.getLatestBlockhash("confirmed")
  ).blockhash;
  if (!provider.signAndSendTransaction) {
    throw new Error("Wallet cannot sign transactions");
  }
  const { signature } = await provider.signAndSendTransaction(tx);
  return signature;
}
