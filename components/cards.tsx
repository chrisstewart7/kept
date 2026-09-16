"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { PayoutRowData, TokenRowData } from "@/lib/api";
import { relTime, truncMint, usd, usdCompact } from "@/lib/format";
import { Creator } from "@/lib/types";
import {
  Amount,
  Avatar,
  Badge,
  CopyButton,
  MilestoneBar,
  RailBadge,
  StatusBadge,
  TokenGlyph,
} from "./ui";

/* ── PayoutRow (§5.6) ───────────────────────────────────────────────── */
export function PayoutRow({
  p,
  animate = false,
}: {
  p: PayoutRowData;
  animate?: boolean;
}) {
  const accent =
    p.rail === "sub" ? "green" : p.rail === "cash" ? "blue" : "ink";
  return (
    <div
      className={`flex items-center gap-3 border-b border-line px-1 py-2.5 last:border-b-0 ${animate ? "payout-in" : ""}`}
    >
      <Amount cents={p.usdCents} accent={accent as "green"} className="w-[72px] shrink-0 text-[14px]" />
      <RailBadge rail={p.rail} />
      <span className="flex min-w-0 items-center gap-2">
        {p.token && <TokenGlyph ticker={p.token.ticker} size={22} />}
        <ArrowRight size={12} className="shrink-0 text-ink-3" aria-hidden />
        <Avatar creator={p.creator} size={22} />
        <Link
          href={p.creator ? `/creator/${p.creator.ofUsername}` : "#"}
          className="truncate text-[13px] font-medium text-ink hover:text-blue"
        >
          {p.creator ? `@${p.creator.ofUsername}` : "unknown"}
        </Link>
      </span>
      <span className="ml-auto flex shrink-0 items-center gap-3">
        {(p.rail === "sub" || p.rail === "cash") && (
          <Link
            href={`/receipt/${p.id}`}
            className="text-[12px] font-medium text-ink-3 hover:text-blue"
          >
            Receipt
          </Link>
        )}
        <span className="w-8 text-right text-[12px] tabular-nums text-ink-3">
          {relTime(p.createdAt)}
        </span>
      </span>
    </div>
  );
}

/* expanded row for /payments */
export function PayoutRowDetailed({ p }: { p: PayoutRowData }) {
  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Amount
          cents={p.usdCents}
          accent={p.rail === "sub" ? "green" : p.rail === "cash" ? "blue" : "ink"}
          className="text-[16px]"
        />
        <RailBadge rail={p.rail} />
        <span className="text-[13px] text-ink-2">
          {p.rail === "sub"
            ? "purchased for"
            : p.rail === "cash"
              ? "sent to"
              : "held for"}
        </span>
        <span className="flex items-center gap-1.5">
          <Avatar creator={p.creator} size={20} />
          <Link
            href={p.creator ? `/creator/${p.creator.ofUsername}` : "#"}
            className="text-[13px] font-semibold text-ink hover:text-blue"
          >
            @{p.creator?.ofUsername ?? "unknown"}
          </Link>
        </span>
        <span className="ml-auto text-[12px] tabular-nums text-ink-3">
          {relTime(p.createdAt)}
        </span>
      </div>
      <div className="mt-3 grid gap-x-8 gap-y-1.5 text-[12.5px] sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <span className="text-ink-3">Token</span>
          {p.token ? (
            <Link
              href={`/token/${p.token.mint}`}
              className="font-medium text-ink hover:text-blue"
            >
              ${p.token.ticker}{" "}
              <span className="font-mono text-[11px] text-ink-3">
                {truncMint(p.token.mint)}
              </span>
            </Link>
          ) : (
            <span className="text-ink-3">—</span>
          )}
        </div>
        {p.rail === "sub" && (
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <span className="text-ink-3">Period</span>
            <span className="font-medium text-ink">{p.ofPeriodDays ?? 30} days</span>
          </div>
        )}
        {p.rail === "cash" && (
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <span className="text-ink-3">Via</span>
            <span className="font-medium text-ink">OnlyFans tip</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <span className="text-ink-3">Status</span>
          <span className="font-medium text-ink">
            {p.rail === "sub" && p.status === "confirmed"
              ? "Confirmed on OnlyFans"
              : p.status}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          {p.rail === "held" ? (
            <span className="text-[12px] text-ink-3">
              Waiting on the delivery worker · 7-day window
            </span>
          ) : (
            <Link
              href={`/receipt/${p.id}`}
              className="font-medium text-blue hover:underline"
            >
              Receipt · View
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── LivePill (§5.5) — rotates every 6s from the payments feed ──────── */
export function LivePill({ items }: { items: PayoutRowData[] }) {
  const [i, setI] = useState(0);
  const usable = items.filter((p) => p.rail === "sub" || p.rail === "cash");
  useEffect(() => {
    if (usable.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % usable.length), 6000);
    return () => clearInterval(id);
  }, [usable.length]);
  const p = usable[i % Math.max(1, usable.length)];
  /* no real payouts → omit the pill rather than lying (§6) */
  if (!p) return null;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-elevated px-4 py-1.5 shadow-card">
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-soft text-[10px] font-bold text-blue">
        $
      </span>
      <span className="text-[13px] font-medium tabular-nums text-ink">
        {usd(p.usdCents)} {p.rail === "sub" ? "sub" : "donation"} →{" "}
        <Link
          href={`/creator/${p.creator?.ofUsername}`}
          className="font-semibold hover:text-blue"
        >
          @{p.creator?.ofUsername}
        </Link>
      </span>
    </span>
  );
}

/* ── TokenCard (§5.7) ───────────────────────────────────────────────── */
export function TokenCard({ t }: { t: TokenRowData }) {
  return (
    <Link
      href={`/token/${t.mint}`}
      className="card block p-4 transition-shadow hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_12px_32px_rgba(29,78,216,0.10)]"
    >
      <div className="flex items-center gap-3">
        <TokenGlyph ticker={t.ticker} image={t.imageUrl} size={38} />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-ink">
            {t.name} <span className="text-ink-3">${t.ticker}</span>
          </p>
          <p className="truncate text-[12px] text-ink-3">
            {t.creator ? `onlyfans.com/${t.creator.ofUsername}` : "—"}
          </p>
        </div>
        <span className="ml-auto text-[12px] font-semibold tabular-nums text-ink-2">
          {usdCompact(t.mcUsd)}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-[12px]">
        <span className="text-ink-3">
          Subs <b className="font-semibold text-green">{t.subsBought}</b>
        </span>
        <span className="text-ink-3">
          Donated{" "}
          <b className="font-semibold tabular-nums text-blue">
            {usd(t.cashSentUsdCents)}
          </b>
        </span>
        <span className="tabular-nums text-ink-3">{relTime(t.createdAt)}</span>
      </div>
    </Link>
  );
}

/* table-style token row for Explore */
export function TokenRow({ t }: { t: TokenRowData }) {
  return (
    <Link
      href={`/token/${t.mint}`}
      className="grid grid-cols-[minmax(0,2.2fr)_1fr_1fr_0.7fr_1fr_0.6fr] items-center gap-3 border-b border-line px-4 py-3 text-[13px] last:border-b-0 hover:bg-tint/60 max-md:grid-cols-[minmax(0,1fr)_auto]"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <TokenGlyph ticker={t.ticker} image={t.imageUrl} size={30} />
        <span className="min-w-0">
          <span className="block truncate font-semibold text-ink">
            {t.name} <span className="font-normal text-ink-3">${t.ticker}</span>
          </span>
          <span className="block truncate font-mono text-[11px] text-ink-3">
            {truncMint(t.mint)} · {t.creator ? `@${t.creator.ofUsername}` : "—"}
          </span>
        </span>
      </span>
      <span className="tabular-nums text-ink-2 max-md:hidden">
        {usdCompact(t.mcUsd)}
      </span>
      <span className="tabular-nums text-ink-2 max-md:hidden">
        {usdCompact(t.vol24hUsd)}
      </span>
      <span className="tabular-nums font-medium text-green max-md:hidden">
        {t.subsBought}
      </span>
      <span className="tabular-nums font-medium text-blue max-md:hidden">
        {usd(t.cashSentUsdCents)}
      </span>
      <span className="text-right tabular-nums text-ink-3">
        {relTime(t.createdAt)}
      </span>
    </Link>
  );
}

/* ── CreatorCard (§5.8) ─────────────────────────────────────────────── */
export function CreatorRow({ c }: { c: Creator }) {
  const lifetime = c.lifetimeSubUsdCents + c.lifetimeCashUsdCents;
  const nextProgress = c.heldUsdCents % c.subPriceUsdCents;
  return (
    <Link
      href={`/creator/${c.ofUsername}`}
      className="grid grid-cols-[minmax(0,2fr)_0.6fr_1fr_1.4fr_1.4fr] items-center gap-3 border-b border-line px-4 py-3 text-[13px] last:border-b-0 hover:bg-tint/60 max-md:grid-cols-[minmax(0,1fr)_auto]"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Avatar creator={c} size={30} />
        <span className="min-w-0">
          <span className="block truncate font-semibold text-ink">
            @{c.ofUsername}
          </span>
          <span className="block truncate text-[11px] text-ink-3">
            onlyfans.com/{c.ofUsername}
          </span>
        </span>
      </span>
      <span className="tabular-nums text-ink-2 max-md:hidden">{c.tokenCount}</span>
      <span className="tabular-nums font-medium text-ink max-md:text-right">
        {usd(lifetime)}
      </span>
      <span className="text-[12px] text-ink-3 max-md:hidden">
        <b className="font-semibold text-green">{c.lifetimeSubCount}</b> subs ·{" "}
        <b className="font-semibold tabular-nums text-blue">
          {usd(c.lifetimeCashUsdCents)}
        </b>{" "}
        donated
      </span>
      <span className="max-md:hidden">
        <MilestoneBar
          currentCents={nextProgress}
          targetCents={c.subPriceUsdCents}
        />
      </span>
    </Link>
  );
}

export function CreatorCard({ c }: { c: Creator }) {
  const lifetime = c.lifetimeSubUsdCents + c.lifetimeCashUsdCents;
  return (
    <Link
      href={`/creator/${c.ofUsername}`}
      className="card block p-4 transition-shadow hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_12px_32px_rgba(29,78,216,0.10)]"
    >
      <div className="flex items-center gap-3">
        <Avatar creator={c} size={38} />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-ink">
            @{c.ofUsername}
          </p>
          <p className="truncate text-[12px] text-ink-3">
            {c.tokenCount} token{c.tokenCount === 1 ? "" : "s"} pointed
          </p>
        </div>
        <span className="ml-auto text-[13px] font-semibold tabular-nums text-ink">
          {usd(lifetime)}
        </span>
      </div>
    </Link>
  );
}

/* ── mint / address chip ────────────────────────────────────────────── */
export function AddressChip({ value, href }: { value: string; href?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-line bg-tint px-2 py-1">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-mono text-[12px] text-ink-2 hover:text-blue"
        >
          {truncMint(value)}
          <ExternalLink size={11} aria-hidden />
        </a>
      ) : (
        <span className="font-mono text-[12px] text-ink-2">{truncMint(value)}</span>
      )}
      <CopyButton value={value} />
    </span>
  );
}

export function VenueBadge() {
  return <Badge tone="pump">Pump</Badge>;
}

export { StatusBadge };
