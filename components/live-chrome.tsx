"use client";

/**
 * The "alive" chrome: ticker tape, hero rail visual, milestone playground,
 * genesis slots, top-coins strip. Blue/white system only — density and
 * motion come from data, not from a dark skin.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Check, Flame, Plus } from "lucide-react";
import { useBurns, usePayments, useTokens, TokenRowData } from "@/lib/api";
import { numCompact, relTime, usd, usdCompact, usdWhole } from "@/lib/format";
import { SectionLabel, TokenGlyph } from "./ui";

/* ── status chips (stonks-style trading-floor chips, paypig palette) ──── */
export function TokenChip({ t }: { t: TokenRowData }) {
  const ageH = (Date.now() - +new Date(t.createdAt)) / 3.6e6;
  if (ageH < 48)
    return (
      <span className="rounded-md bg-blue-soft px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-blue">
        New
      </span>
    );
  if (t.vol24hUsd > t.mcUsd * 0.3)
    return (
      <span className="rounded-md bg-green-soft px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-green">
        Trending
      </span>
    );
  return (
    <span className="rounded-md bg-tint px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-ink-3">
      Live
    </span>
  );
}

/* ── ticker tape ────────────────────────────────────────────────────── */
interface TickerItem {
  key: string;
  href: string;
  node: React.ReactNode;
}

export function TickerTape() {
  const { data: payments } = usePayments("all");
  const { data: burns } = useBurns();
  const { data: tokens } = useTokens("new", "");

  /* REAL events only (§2): launches from the indexer, payouts and burns
     from the claim worker. Nothing is invented to fill the tape. */
  const items = useMemo<TickerItem[]>(() => {
    const out: TickerItem[] = [];
    for (const t of (tokens?.items ?? []).slice(0, 10)) {
      out.push({
        key: `t${t.mint}`,
        href: `/token/${t.mint}`,
        node: (
          <>
            <span className="rounded bg-blue-soft px-1 text-[9px] font-bold uppercase text-blue">
              new
            </span>
            <span className="font-semibold text-ink">${t.ticker}</span>
            <span className="text-ink-2">
              → @{t.creator?.ofUsername ?? "?"}
            </span>
            <span className="tabular-nums text-ink-3">{relTime(t.createdAt)}</span>
          </>
        ),
      });
    }
    for (const p of (payments?.items ?? []).filter((x) => x.rail !== "held").slice(0, 10)) {
      out.push({
        key: `p${p.id}`,
        href: `/receipt/${p.id}`,
        node: (
          <>
            <span className="tabular-nums font-semibold text-ink">
              {usd(p.usdCents)}
            </span>
            <span
              className={`rounded px-1 text-[9px] font-bold uppercase ${p.rail === "sub" ? "bg-green-soft text-green" : "bg-blue-soft text-blue"}`}
            >
              {p.rail === "sub" ? "sub" : "dono"}
            </span>
            <span className="text-ink-2">→ @{p.creator?.ofUsername}</span>
          </>
        ),
      });
    }
    for (const b of (burns?.items ?? []).slice(0, 6)) {
      out.push({
        key: `b${b.id}`,
        href: "/paypig",
        node: (
          <>
            <Flame size={11} className="text-ink" aria-hidden />
            <span className="text-ink-2">
              burn{" "}
              <b className="tabular-nums font-semibold text-ink">
                {numCompact(b.paypigAmount)} $PAYPIG
              </b>
            </span>
          </>
        ),
      });
    }
    return out;
  }, [tokens, payments, burns]);

  /* zero real events → one honest static line, no marquee */
  if (!items.length) {
    return (
      <div className="flex h-8 items-center overflow-hidden border-t border-line bg-elevated">
        <Link
          href="/launch"
          className="mx-auto flex items-center gap-2 px-4 text-[12px] text-ink-2 hover:text-blue"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue" aria-hidden />
          No launches yet — be the first.
          <span className="font-mono text-[11px] text-ink-3">
            Fees to onlyfans.com/&lt;user&gt; via PayPig
          </span>
        </Link>
      </div>
    );
  }

  const strip = (dup: number) => (
    <div className="flex shrink-0 items-center" aria-hidden={dup > 0}>
      {items.map((it) => (
        <Link
          key={`${dup}-${it.key}`}
          href={it.href}
          tabIndex={dup > 0 ? -1 : 0}
          className="flex h-8 items-center gap-1.5 border-r border-line px-4 text-[12px] hover:bg-tint"
        >
          {it.node}
        </Link>
      ))}
    </div>
  );

  return (
    <div className="relative h-8 overflow-hidden border-t border-line bg-elevated">
      <div className="ticker-viewport flex overflow-hidden">
        <div className="ticker-track flex">
          {strip(0)}
          {strip(1)}
        </div>
      </div>
    </div>
  );
}

/* ── hero rail visual (Hyped-style destination panel) ───────────────── */
export function HeroRail() {
  return (
    <div className="relative mx-auto w-full max-w-[400px]" aria-hidden>
      {/* speech bubbles */}
      <div className="bubble-float absolute -left-3 -top-5 z-20 rounded-2xl rounded-bl-md border border-green/20 bg-green-soft px-3.5 py-2 text-[12px] font-semibold text-green shadow-card">
        $9.99 sub purchased <Check size={12} className="mb-0.5 inline" />
      </div>
      <div className="bubble-float-2 absolute -right-2 top-16 z-20 rounded-2xl rounded-br-md border border-blue/20 bg-blue-soft px-3.5 py-2 text-[12px] font-semibold text-blue shadow-card">
        $12.40 donation landed
      </div>

      {/* creator dashboard card */}
      <div className="card overflow-hidden !rounded-2xl">
        <div className="flex items-center gap-2.5 border-b border-line bg-tint/70 px-4 py-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue text-[11px] font-bold text-white">
            L
          </span>
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold text-ink">onlyfans.com/luna</p>
            <p className="text-[10.5px] text-ink-3">creator dashboard</p>
          </div>
          <span className="ml-auto rounded-md bg-green-soft px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-green">
            earning
          </span>
        </div>
        <div className="px-4 py-3.5">
          <p className="sec-label">This month</p>
          <p className="mt-0.5 text-[26px] font-semibold tabular-nums text-ink">
            $1,247.30
          </p>
          <div className="mt-3 space-y-0">
            {[
              ["paypig_fan_01 subscribed", "$9.99", "2m"],
              ["paypig_fan_01 tipped", "$12.40", "1h"],
              ["paypig_fan_02 subscribed", "$9.99", "4h"],
            ].map(([who, amt, when]) => (
              <div
                key={who}
                className="flex items-center gap-2 border-t border-line py-2 text-[12px]"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-soft text-[9px] font-bold text-blue">
                  K
                </span>
                <span className="text-ink-2">{who}</span>
                <span className="ml-auto tabular-nums font-semibold text-green">
                  {amt}
                </span>
                <span className="w-6 text-right tabular-nums text-[11px] text-ink-3">
                  {when}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* floating receipt */}
      <div className="card absolute -bottom-6 -right-4 z-10 w-[200px] !rounded-xl p-3.5">
        <div className="flex items-center justify-between">
          <span className="sec-label">PayPig receipt</span>
          <span className="rounded bg-green-soft px-1 text-[9px] font-bold uppercase text-green">
            sub
          </span>
        </div>
        <p className="mt-1 text-[20px] font-semibold tabular-nums text-ink">$9.99</p>
        <p className="text-[11px] text-ink-2">30 days → @luna</p>
        <p className="mt-1.5 border-t border-line pt-1.5 font-mono text-[9.5px] text-ink-3">
          5K2a…9fRw · confirmed
        </p>
      </div>
      <p className="mt-10 text-center text-[10.5px] text-ink-3">
        the rail, visualized — subs land in her dashboard, receipts land here
      </p>
    </div>
  );
}

/* ── milestone playground (Hyped's ladder, rebuilt for PayPig) ────────── */
const FEE_RATE = 0.003; // ~0.30% of trade volume accrues as creator fees
const SUB_PRICE = 999;

export function MilestonePlayground() {
  const [volK, setVolK] = useState(120); // monthly volume in $k
  const volume = volK * 1000;
  const feesCents = Math.round(volume * FEE_RATE * 100);
  const creatorCents = Math.round(feesCents * 0.8);
  const burnCents = feesCents - creatorCents;
  const subs = Math.floor(creatorCents / SUB_PRICE);
  const residual = creatorCents - subs * SUB_PRICE;
  const hoursPerSub = subs > 0 ? 720 / subs : Infinity;

  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="flex items-center gap-2">
          <SectionLabel>Milestone playground</SectionLabel>
          <span className="rounded-md bg-tint px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-ink-3">
            Example math — not a live claim
          </span>
        </span>
        <span className="text-[11px] text-ink-3">
          assumes ~0.30% of volume accrues as creator fees · $9.99 sub
        </span>
      </div>
      <div className="mt-5 grid items-center gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-semibold text-ink">
              Monthly trade volume
            </span>
            <span className="text-[22px] font-semibold tabular-nums text-blue">
              {usdCompact(volume)}
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={1000}
            step={5}
            value={volK}
            onChange={(e) => setVolK(Number(e.target.value))}
            aria-label="Monthly trade volume"
            className="mt-3 w-full accent-[#00AFF0]"
          />
          <div className="mt-1 flex justify-between text-[10.5px] text-ink-3">
            <span>$5k</span>
            <span>$1M</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-tint p-3">
              <p className="sec-label">Subs / month</p>
              <p className="mt-0.5 text-[22px] font-semibold tabular-nums text-green">
                {subs}
              </p>
              <p className="text-[10.5px] text-ink-3">
                {Number.isFinite(hoursPerSub)
                  ? hoursPerSub < 1
                    ? `one every ${Math.max(1, Math.round(hoursPerSub * 60))} min`
                    : `one every ${hoursPerSub.toFixed(1)}h`
                  : "below the first milestone"}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-tint p-3">
              <p className="sec-label">Donation residual</p>
              <p className="mt-0.5 text-[22px] font-semibold tabular-nums text-blue">
                {usd(residual)}
              </p>
              <p className="text-[10.5px] text-ink-3">tipped on OnlyFans</p>
            </div>
            <div className="rounded-xl border border-line bg-tint p-3">
              <p className="sec-label">Creator share</p>
              <p className="mt-0.5 text-[18px] font-semibold tabular-nums text-ink">
                {usdWhole(creatorCents)}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-tint p-3">
              <p className="sec-label">$PAYPIG burned</p>
              <p className="mt-0.5 text-[18px] font-semibold tabular-nums text-ink">
                {usdWhole(burnCents)}
              </p>
            </div>
          </div>
        </div>
        {/* sub pill grid */}
        <div>
          <p className="sec-label mb-2.5">
            {subs} subscription{subs === 1 ? "" : "s"} fire this month
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: Math.min(subs, 96) }).map((_, i) => (
              <span
                key={i}
                className="h-3 w-6 rounded-full bg-green/70"
                style={{ opacity: 0.45 + ((i * 7) % 10) * 0.055 }}
              />
            ))}
            {subs > 96 && (
              <span className="text-[11px] font-semibold text-green">
                +{subs - 96} more
              </span>
            )}
            {subs === 0 && (
              <span className="text-[12px] text-ink-3">
                fees accrue until the first $9.99 milestone, then the sub fires
              </span>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Link href="/launch" className="btn-primary">
              Launch a token
            </Link>
            <Link href="/docs/subscription-purchases" className="btn-secondary">
              How milestones work
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── genesis "next" slot (stonks: THE NEXT STONK) ───────────────────── */
export function NextSlot({
  label = "The next one",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/launch"
      className={`flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong text-ink-3 transition-colors hover:border-blue-3 hover:text-blue ${compact ? "w-[164px] shrink-0 p-3" : "p-5"}`}
    >
      <Plus size={14} aria-hidden />
      <span className="text-[12px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </Link>
  );
}

/* ── top coins horizontal strip ─────────────────────────────────────── */
export function TopStrip() {
  const { data: tokens } = useTokens("mc", "");
  const items = (tokens?.items ?? []).slice(0, 12);
  if (!items.length) return null;
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <SectionLabel>Top coins</SectionLabel>
        <Link
          href="/explore"
          className="flex items-center gap-1 text-[12px] font-semibold text-blue hover:underline"
        >
          Explore <ArrowRight size={12} aria-hidden />
        </Link>
      </div>
      <div className="feed-scroll mt-3 flex gap-3 overflow-x-auto pb-2">
        {items.map((t) => (
          <Link
            key={t.mint}
            href={`/token/${t.mint}`}
            className="card w-[164px] shrink-0 p-3.5 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2">
              <TokenGlyph ticker={t.ticker} image={t.imageUrl} size={30} />
              <span className="min-w-0 truncate text-[13px] font-bold text-ink">
                ${t.ticker}
              </span>
              <span className="ml-auto">
                <TokenChip t={t} />
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-[13px] font-semibold tabular-nums text-ink">
                {usdCompact(t.mcUsd)}
              </span>
              <span className="text-[11px] tabular-nums text-ink-3">
                {relTime(t.createdAt)}
              </span>
            </div>
            <p className="mt-1 truncate text-[11px] text-ink-3">
              {t.subsBought} subs · {usd(t.cashSentUsdCents)} donated
            </p>
          </Link>
        ))}
        <NextSlot compact label="The next one" />
      </div>
    </section>
  );
}
