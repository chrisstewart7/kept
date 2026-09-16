"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  ExternalLink,
  Loader2,
  Search,
} from "lucide-react";
import { useStats } from "@/lib/api";
import { OF_USERNAME_RE, TREASURY, descriptionLine } from "@/lib/constants";
import { usd } from "@/lib/format";
import { launchOnPump, fixFeeShare, LaunchError, LaunchPhase } from "@/lib/pump-client";
import { ConnectPrompt, activeProvider, useWallet } from "@/components/wallet";
import { CopyButton, SectionLabel, TokenGlyph } from "@/components/ui";

type Mode = "launch" | "register";

interface Profile {
  exists: boolean | null;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  subPriceUsdCents?: number;
  verified?: boolean;
  optOut?: boolean;
  error?: string;
}

type LookupState =
  | { s: "idle" }
  | { s: "checking" }
  | { s: "found"; p: Profile }
  | { s: "notfound" }
  | { s: "optout"; p: Profile }
  | { s: "error"; message: string };

const PHASES: [LaunchPhase, string][] = [
  ["uploading", "Metadata → IPFS"],
  ["building", "Building create + fee-share transaction"],
  ["signing", "Waiting for your wallet"],
  ["confirming", "Confirming on Solana"],
  ["detecting", "Indexer verifying the config"],
];

const inputCls =
  "w-full rounded-xl border border-line bg-elevated px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-ink-3 focus:border-blue-3";

function CopyBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-tint p-3.5">
      <div className="flex items-center justify-between">
        <SectionLabel>{label}</SectionLabel>
        <CopyButton value={value} label={`Copy ${label}`} />
      </div>
      <p className="mt-1.5 break-all font-mono text-[12px] leading-relaxed text-ink-2">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-semibold text-ink">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-ink-3">{hint}</span>}
    </label>
  );
}

export function LaunchView() {
  const [mode, setMode] = useState<Mode>("launch");
  const { address } = useWallet();
  const { data: stats } = useStats();
  const treasuryReady = stats?.ready?.treasury ?? false;
  const rpcReady = stats?.ready?.rpc ?? false;
  const launchesEnabled = treasuryReady && rpcReady;

  /* form */
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [ofUsername, setOf] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [useAvatar, setUseAvatar] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [mint, setMint] = useState("");

  /* OF lookup — debounced 400ms (§5) */
  const [lookup, setLookup] = useState<LookupState>({ s: "idle" });
  const lookupSeq = useRef(0);
  useEffect(() => {
    const u = ofUsername.trim().toLowerCase();
    setUseAvatar(false);
    if (!u) return setLookup({ s: "idle" });
    if (!OF_USERNAME_RE.test(u) || u.length < 3) {
      return setLookup({ s: "error", message: "a-z, 0-9, dot, dash, underscore · 3-30 chars" });
    }
    setLookup({ s: "checking" });
    const seq = ++lookupSeq.current;
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/of/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: u }),
        });
        const p = (await res.json()) as Profile;
        if (seq !== lookupSeq.current) return;
        if (!res.ok) return setLookup({ s: "error", message: p.error ?? "Lookup failed" });
        if (p.optOut) return setLookup({ s: "optout", p });
        if (p.exists === false) return setLookup({ s: "notfound" });
        setLookup({ s: "found", p });
      } catch {
        if (seq === lookupSeq.current)
          setLookup({ s: "error", message: "Lookup failed — you can still launch with an uploaded image." });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [ofUsername]);

  const profile = lookup.s === "found" ? lookup.p : null;
  const subPrice = profile?.subPriceUsdCents ?? 999;

  /* launch state machine */
  const [phase, setPhase] = useState<LaunchPhase | null>(null);
  const [error, setError] = useState("");
  const [orphanMint, setOrphanMint] = useState<string | null>(null);
  const [done, setDone] = useState<{ mint: string; signature: string } | null>(null);

  /* register/detect */
  const [detecting, setDetecting] = useState(false);
  const [detectMsg, setDetectMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const ofValid = OF_USERNAME_RE.test(ofUsername.trim()) && ofUsername.trim().length >= 3;
  const imageReady = !!imageFile || (useAvatar && !!profile?.avatarUrl);
  const formValid =
    name.trim().length > 0 &&
    /^[A-Z0-9]{2,10}$/.test(ticker.trim()) &&
    ofValid &&
    lookup.s !== "optout" &&
    imageReady &&
    accepted;

  const runLaunch = async () => {
    const provider = activeProvider();
    if (!provider || !address) return;
    setError("");
    setOrphanMint(null);
    try {
      const out = await launchOnPump(
        {
          name: name.trim(),
          ticker: ticker.trim(),
          ofUsername: ofUsername.trim().toLowerCase(),
          imageFile,
          useAvatarOf: useAvatar ? ofUsername.trim().toLowerCase() : null,
          provider,
          walletAddress: address,
        },
        setPhase,
      );
      setDone(out);
      window.location.href = `/token/${out.mint}`;
    } catch (e) {
      setPhase(null);
      if (e instanceof LaunchError) {
        setError(e.message);
        /* created but shares failed → recovery, never a fake success (§4) */
        if (e.mint && (e.phase === "signing" || e.phase === "confirming")) {
          setOrphanMint(e.mint);
        }
      } else {
        setError(e instanceof Error ? e.message : "Launch failed");
      }
    }
  };

  const runFix = async () => {
    const provider = activeProvider();
    if (!provider || !address || !orphanMint) return;
    setError("");
    try {
      setPhase("signing");
      await fixFeeShare(orphanMint, provider, address);
      setPhase("detecting");
      await fetch("/api/tokens/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mint: orphanMint }),
      });
      window.location.href = `/token/${orphanMint}`;
    } catch (e) {
      setPhase(null);
      setError(e instanceof Error ? e.message : "Fee-share fix failed");
    }
  };

  const runDetect = async () => {
    setDetecting(true);
    setDetectMsg(null);
    try {
      const res = await fetch("/api/tokens/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mint: mint.trim() }),
      });
      const json = await res.json();
      if (json.detected) {
        setDetectMsg({ ok: true, text: "Verified on-chain. The token is on the Board." });
        setTimeout(() => (window.location.href = `/token/${mint.trim()}`), 900);
      } else {
        setDetectMsg({ ok: false, text: json.hint ?? json.error ?? "Not detected." });
      }
    } catch {
      setDetectMsg({ ok: false, text: "Detection failed. Try again." });
    } finally {
      setDetecting(false);
    }
  };

  /* $100 math (§4) */
  const hundredShare = 8000; // cents, 80% of $100
  const mathSubs = Math.floor(hundredShare / subPrice);
  const mathResidual = hundredShare - mathSubs * subPrice;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-[34px] text-ink" style={{ letterSpacing: "-0.02em" }}>
          Launch
        </h1>
        <p className="mt-1 max-w-xl text-[14px] text-ink-2">
          Create a pump.fun coin whose description and 100% fee share point at
          Kept. Your wallet signs everything — the server never holds a key.
        </p>
      </header>

      {!launchesEnabled && (
        <div className="flex items-start gap-3 rounded-xl border border-red/30 bg-red-soft px-4 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red" />
          <div className="text-[13px] text-ink-2">
            <p className="font-semibold text-red">
              {treasuryReady
                ? "RPC not configured — launches disabled."
                : "Treasury not configured — launches disabled."}
            </p>
            <p className="mt-0.5">
              Set {!treasuryReady && <code className="font-mono text-[12px]">NEXT_PUBLIC_TREASURY</code>}
              {!treasuryReady && !rpcReady && " and "}
              {!rpcReady && <code className="font-mono text-[12px]">NEXT_PUBLIC_SOLANA_RPC</code>}{" "}
              in the environment. Registration and detection stay available.
            </p>
          </div>
        </div>
      )}

      <div className="inline-flex rounded-full border border-line bg-elevated p-1">
        {(
          [
            ["launch", "Launch on Pump"],
            ["register", "Register an existing token"],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
              mode === m ? "bg-blue text-white" : "text-ink-2 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* ── left: form ── */}
        <div className="space-y-4">
          {mode === "launch" && !address && <ConnectPrompt />}

          {mode === "launch" ? (
            <div className="card space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Token name">
                  <input
                    className={inputCls}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Token name"
                    maxLength={48}
                  />
                </Field>
                <Field label="Ticker" hint="Caps, 2–10 characters.">
                  <input
                    className={inputCls}
                    value={ticker}
                    onChange={(e) =>
                      setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                    }
                    placeholder="TICKER"
                    maxLength={10}
                  />
                </Field>
              </div>

              <Field
                label="OnlyFans username (required)"
                hint="The creator who receives the 80% — as subs and donations. They never sign up."
              >
                <div className="relative">
                  <input
                    className={`${inputCls} pr-9 ${lookup.s === "notfound" || lookup.s === "optout" ? "!border-red" : ""}`}
                    value={ofUsername}
                    onChange={(e) => setOf(e.target.value)}
                    placeholder="onlyfans.com/…"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3">
                    {lookup.s === "checking" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Search size={14} />
                    )}
                  </span>
                </div>
              </Field>

              {/* lookup states (§5) */}
              {lookup.s === "notfound" && (
                <p className="rounded-xl border border-red/25 bg-red-soft px-3.5 py-2.5 text-[13px] text-red">
                  No OnlyFans account at that username. Check the URL on their
                  page — this field must match onlyfans.com/&lt;username&gt;.
                </p>
              )}
              {lookup.s === "optout" && (
                <p className="rounded-xl border border-red/25 bg-red-soft px-3.5 py-2.5 text-[13px] text-red">
                  This creator opted out of Kept. Launches for them are
                  disabled.
                </p>
              )}
              {lookup.s === "error" && (
                <p className="rounded-xl border border-amber/25 bg-amber-soft px-3.5 py-2.5 text-[13px] text-ink-2">
                  {lookup.message}
                </p>
              )}
              {profile && (
                <div className="flex items-center gap-3 rounded-xl border border-blue/20 bg-blue-soft p-3.5">
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="h-11 w-11 rounded-full border border-line object-cover"
                    />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-elevated text-[15px] font-bold text-blue">
                      {(profile.displayName ?? profile.username)[0]?.toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-[14px] font-semibold text-ink">
                      {profile.displayName ?? profile.username}
                      {profile.verified && (
                        <BadgeCheck size={14} className="text-blue" aria-label="Verified" />
                      )}
                    </p>
                    <p className="truncate text-[12px] text-ink-2">
                      onlyfans.com/{profile.username}
                      {profile.subPriceUsdCents != null
                        ? ` · ${usd(profile.subPriceUsdCents)} / month`
                        : " · price not public — $9.99 default"}
                    </p>
                  </div>
                  {profile.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setUseAvatar(true);
                        setImageFile(null);
                      }}
                      className={`ml-auto shrink-0 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-colors ${
                        useAvatar
                          ? "border-blue bg-blue text-white"
                          : "border-line bg-elevated text-ink-2 hover:border-blue-3"
                      }`}
                    >
                      {useAvatar ? "Using this photo ✓" : "Use this photo as token image"}
                    </button>
                  )}
                </div>
              )}

              <Field
                label={useAvatar ? "Image — using the OF avatar" : "Image"}
                hint="Raster only, max 2MB. Or resolve the OF profile and use the public avatar."
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    if (f && f.size > 2 * 1024 * 1024) {
                      setError("Image over 2MB");
                      return;
                    }
                    setImageFile(f);
                    if (f) setUseAvatar(false);
                  }}
                  className={`${inputCls} file:mr-3 file:rounded-full file:border-0 file:bg-blue-soft file:px-3 file:py-1 file:text-[12px] file:font-semibold file:text-blue`}
                />
              </Field>

              <div className="rounded-xl border border-line bg-tint p-3.5">
                <SectionLabel>Description — written on-chain</SectionLabel>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-ink-2">
                  {descriptionLine(ofUsername.trim().toLowerCase() || "USERNAME")}
                </pre>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-line bg-tint px-3.5 py-2.5">
                <SectionLabel>Fee share</SectionLabel>
                <span className="font-mono text-[12px] font-semibold text-ink">
                  100% → {TREASURY.slice(0, 4)}…{TREASURY.slice(-4)}
                </span>
              </div>

              <label className="flex items-start gap-2.5 text-[13px] text-ink-2">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#1d4ed8]"
                />
                <span>
                  I accept the{" "}
                  <Link href="/legal/terms" className="font-semibold text-blue hover:underline">
                    Terms
                  </Link>
                  . Fee direction is permanent. I do not claim the creator
                  endorsed this token.
                </span>
              </label>

              {error && (
                <div className="rounded-xl border border-red/25 bg-red-soft px-3.5 py-2.5 text-[13px] text-red">
                  {error}
                  {orphanMint && (
                    <div className="mt-2 rounded-lg border border-line bg-elevated p-3 text-ink-2">
                      <p className="font-semibold text-ink">
                        Coin may exist but fees are not pointed at Kept yet.
                      </p>
                      <p className="mt-0.5 font-mono text-[11px]">{orphanMint}</p>
                      <button type="button" className="btn-primary mt-2" onClick={runFix}>
                        Fix fee share
                      </button>
                    </div>
                  )}
                </div>
              )}

              {phase ? (
                <div className="rounded-xl border border-line bg-tint p-4">
                  {PHASES.map(([p, label]) => {
                    const idx = PHASES.findIndex(([x]) => x === phase);
                    const mine = PHASES.findIndex(([x]) => x === p);
                    return (
                      <div key={p} className="flex items-center gap-2.5 py-1.5 text-[13px]">
                        {mine < idx ? (
                          <Check size={15} className="text-green" />
                        ) : mine === idx ? (
                          <Loader2 size={15} className="animate-spin text-blue" />
                        ) : (
                          <span className="h-[15px] w-[15px] rounded-full border border-line-strong" />
                        )}
                        <span className={mine <= idx ? "font-medium text-ink" : "text-ink-3"}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : done ? (
                <Link href={`/token/${done.mint}`} className="btn-primary w-full">
                  View token
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn-primary w-full"
                  disabled={!formValid || !address || !launchesEnabled}
                  onClick={runLaunch}
                >
                  {!launchesEnabled
                    ? "Launches disabled — treasury not configured"
                    : address
                      ? "Launch on pump.fun"
                      : "Connect a wallet to launch"}
                </button>
              )}
            </div>
          ) : (
            /* ── register existing ── */
            <div className="card space-y-4 p-6">
              <Field
                label="Mint address"
                hint="We fetch metadata and check the on-chain share config — nothing is listed until every check passes."
              >
                <input
                  className={inputCls}
                  value={mint}
                  onChange={(e) => setMint(e.target.value.trim())}
                  placeholder="Mint address"
                />
              </Field>
              {detectMsg && (
                <p
                  className={`rounded-xl border px-3.5 py-2.5 text-[13px] ${
                    detectMsg.ok
                      ? "border-green/25 bg-green-soft text-green"
                      : "border-amber/25 bg-amber-soft text-ink-2"
                  }`}
                >
                  {detectMsg.text}
                </p>
              )}
              <button
                type="button"
                className="btn-primary"
                disabled={!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint) || detecting}
                onClick={runDetect}
              >
                {detecting ? "Verifying on-chain…" : "Detect"}
              </button>
            </div>
          )}

          {/* manual fallback — always visible (§4) */}
          <div className="rounded-xl border border-line bg-tint p-4 text-[13px] leading-relaxed text-ink-2">
            <p className="font-semibold text-ink">Manual path</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>Create on pump.fun</li>
              <li>Set fee sharing to the treasury at 100%</li>
              <li>Revoke / lock the share config</li>
              <li>
                Description must include:{" "}
                <code className="font-mono text-[12px]">
                  Fees to onlyfans.com/USER via Kept
                </code>
              </li>
              <li>Paste the mint in Register and hit Detect</li>
            </ol>
          </div>
        </div>

        {/* ── right: live preview ── */}
        <div className="space-y-4">
          <div className="card p-5">
            <SectionLabel>Preview</SectionLabel>
            <div className="mt-3 flex items-center gap-3">
              {useAvatar && profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="h-10 w-10 rounded-lg border border-line object-cover"
                />
              ) : (
                <TokenGlyph ticker={ticker || "?"} size={40} />
              )}
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-ink">
                  {name || "Token name"}{" "}
                  <span className="text-ink-3">${ticker || "TICKER"}</span>
                </p>
                <p className="truncate text-[12px] text-ink-3">
                  → onlyfans.com/{ofUsername.trim().toLowerCase() || "username"}
                </p>
              </div>
            </div>
            <div className="mt-4 border-t border-line pt-3 text-[12.5px] leading-relaxed text-ink-2">
              At {usd(subPrice)} / month, $100 of creator fees ≈{" "}
              <b className="font-semibold text-green">
                {mathSubs} sub{mathSubs === 1 ? "" : "s"}
              </b>{" "}
              +{" "}
              <b className="font-semibold tabular-nums text-blue">
                {usd(mathResidual)}
              </b>{" "}
              donated, after the 20% burn.
            </div>
            {profile && (
              <a
                href={`https://onlyfans.com/${profile.username}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-blue hover:underline"
              >
                onlyfans.com/{profile.username} <ExternalLink size={11} />
              </a>
            )}
            <p className="mt-3 border-t border-line pt-3 text-[11px] text-ink-3">
              This token is launched by a third party. The creator does not
              have to sign up and has not endorsed it.
            </p>
          </div>
          <CopyBlock label="Treasury" value={TREASURY} />
          <CopyBlock
            label="Description line"
            value={descriptionLine(ofUsername.trim().toLowerCase() || "USERNAME")}
          />
        </div>
      </div>
    </div>
  );
}
