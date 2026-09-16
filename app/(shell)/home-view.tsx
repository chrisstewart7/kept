"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  useAnalytics,
  useBurns,
  useOfframp,
  usePayments,
  useStats,
  useTokens,
} from "@/lib/api";
import { numCompact, relTime, sol, usd, usdWhole } from "@/lib/format";
import { LivePill, PayoutRow, TokenGlyphMosaicTile } from "@/components/home-bits";
import {
  HeroRail,
  MilestonePlayground,
  NextSlot,
  TopStrip,
} from "@/components/live-chrome";
import {
  Avatar,
  Badge,
  EmptyState,
  Odometer,
  SectionLabel,
  SkeletonRows,
  SplitLegend,
} from "@/components/ui";

type Range = "1d" | "30d" | "all";

export function HomeView() {
  const { data: stats } = useStats();
  const { data: payments } = usePayments("all");
  const { data: tokens } = useTokens("mc", "");
  const { data: analytics } = useAnalytics("30d");
  const { data: burns } = useBurns();
  const { data: offramp } = useOfframp();
  const [range, setRange] = useState<Range>("all");

  const feed = payments?.items ?? [];
  const mosaic = (tokens?.items ?? []).slice(0, 9);

  const feesFor = (r: Range) => {
    if (!stats) return 0;
    if (r === "1d") return stats.fees1dUsdCents;
    if (r === "30d")
      return (
        analytics?.points.reduce((s, p) => s + p.feesUsdCents, 0) ??
        stats.feesAllTimeUsdCents
      );
    return stats.feesAllTimeUsdCents;
  };

  return (
    <div className="space-y-6">
      {/* ── hero ── */}
      <section className="hero-wash -mx-4 -mt-8 px-4 pb-12 pt-10 sm:-mx-8 sm:px-8">
        <div className="mx-auto grid max-w-[1120px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:justify-start">
              <LivePill items={feed} />
            </div>
            <h1
              className="font-serif text-[44px] leading-[1.02] text-ink sm:text-[64px]"
              style={{ letterSpacing: "-0.03em" }}
            >
              Route token fees
              <br />
              into subs and donations
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-2 max-lg:mx-auto sm:text-[16px]">
              Point a token&apos;s creator fees at any OnlyFans creator. We
              turn those fees into real subscriptions and donations, delivered
              straight to the creator.
            </p>
            <div className="mt-7 flex items-center justify-center gap-3 lg:justify-start">
              <Link href="/launch" className="btn-primary">
                Launch a token
              </Link>
              <Link href="/docs" className="btn-secondary">
                Read the docs
              </Link>
              <Badge tone="pump">Pump</Badge>
            </div>
          </div>
          <div className="pb-4 max-lg:hidden">
            <HeroRail />
          </div>
        </div>
      </section>

      {/* ── top coins strip ── */}
      <TopStrip />

      {/* ── bento row 1: mosaic + payments ── */}
      <section className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="card flex flex-col p-5">
          <div className="grid grid-cols-3 gap-2.5">
            {mosaic.map((t, i) => (
              <TokenGlyphMosaicTile key={t.mint} t={t} index={i} />
            ))}
            {mosaic.length > 0 && mosaic.length < 9 && (
              <NextSlot compact label="Next" />
            )}
          </div>
          {!tokens && <SkeletonRows n={4} />}
          {tokens && !mosaic.length && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10">
              <p className="text-sm font-semibold text-ink-2">No tokens yet.</p>
              <p className="max-w-xs text-center text-[13px] text-ink-3">
                The first token launched through Kept appears here with its fee
                trail.
              </p>
              <Link href="/launch" className="btn-primary">
                Launch the first one
              </Link>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
            <SectionLabel>Explore</SectionLabel>
            <Link
              href="/explore"
              className="flex items-center gap-1 text-[13px] font-semibold text-blue hover:underline"
            >
              Open <ArrowRight size={13} aria-hidden />
            </Link>
          </div>
        </div>

        <div className="card flex flex-col p-5">
          <div className="min-h-[280px]">
            {!payments && <SkeletonRows n={6} />}
            {feed.slice(0, 6).map((p, i) => (
              <PayoutRow key={p.id} p={p} animate={i === 0} />
            ))}
            {payments && !feed.length && (
              <EmptyState
                title="No payouts yet."
                hint="Every payout posts here the moment it settles — with a public receipt."
              />
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
            <SectionLabel>Payments</SectionLabel>
            <Link
              href="/payments"
              className="flex items-center gap-1 text-[13px] font-semibold text-blue hover:underline"
            >
              Open <ArrowRight size={13} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ── bento row 2: fees / routing / mechanism ── */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <SectionLabel>Fees</SectionLabel>
          <p className="mt-3 text-[36px] font-semibold tabular-nums leading-none text-ink">
            {stats ? <Odometer cents={feesFor(range)} /> : "—"}
          </p>
          <div className="mt-3 flex gap-1">
            {(
              [
                ["1d", "1D"],
                ["30d", "30D"],
                ["all", "All time"],
              ] as [Range, string][]
            ).map(([r, label]) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
                  range === r
                    ? "bg-blue-soft text-blue"
                    : "text-ink-3 hover:bg-tint hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <SectionLabel>Fees route to</SectionLabel>
          <div className="mt-2.5 space-y-0.5">
            {analytics && !analytics.topCreators.length && (
              <p className="py-4 text-[13px] text-ink-3">
                No creators are receiving yet. When a token points fees at a
                creator, they show up here with their running total.
              </p>
            )}
            {(analytics?.topCreators ?? []).slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href={`/creator/${c.ofUsername}`}
                className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-tint"
              >
                <Avatar creator={c} size={24} />
                <span className="min-w-0 truncate text-[13px] font-medium text-ink">
                  @{c.ofUsername}
                </span>
                <span className="ml-auto text-[12px] tabular-nums text-ink-2">
                  {usd(c.lifetimeSubUsdCents + c.lifetimeCashUsdCents)}
                </span>
              </Link>
            ))}
            {!analytics && <SkeletonRows n={4} />}
          </div>
        </div>

        <div className="card p-5">
          <SectionLabel>How the rail works</SectionLabel>
          <ul className="mt-3 space-y-2 text-[13px] leading-snug text-ink-2">
            <li>Sharing config is per mint.</li>
            <li>100% of creator fees → Kept treasury.</li>
            <li>80% buys subs and sends donations.</li>
            <li>20% buys $KEPT and burns it.</li>
          </ul>
          <Link
            href="/flow"
            className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-blue hover:underline"
          >
            Capital flow <ArrowRight size={13} aria-hidden />
          </Link>
        </div>
      </section>

      {/* ── milestone playground ── */}
      <MilestonePlayground />

      {/* ── worked example — shown until real launches exist ── */}
      {stats && stats.feesAllTimeUsdCents === 0 && (
        <section className="card p-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <SectionLabel>How a claim settles</SectionLabel>
            <Badge tone="blue">Example</Badge>
            <span className="ml-auto text-[12px] text-ink-3">
              Illustrative numbers — no real payments yet
            </span>
          </div>
          <div className="mt-4 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <ol className="space-y-2.5 text-[13.5px] leading-relaxed text-ink-2">
              <li>
                <b className="font-semibold text-ink">1 · Claim.</b> An example
                token, $LUNA, points 100% of its creator fees at the Kept
                treasury. A scheduled claim sweeps{" "}
                <span className="tabular-nums font-medium text-ink">
                  1.250 SOL ($306.25)
                </span>
                .
              </li>
              <li>
                <b className="font-semibold text-ink">2 · Split.</b>{" "}
                <span className="tabular-nums font-medium text-blue">
                  $245.00
                </span>{" "}
                to the creator&apos;s balance,{" "}
                <span className="tabular-nums font-medium text-ink">$61.25</span>{" "}
                to the protocol. Fixed, per claim, no discretion.
              </li>
              <li>
                <b className="font-semibold text-ink">3 · Subscriptions.</b>{" "}
                The worker purchases{" "}
                <span className="font-medium text-green">
                  24 × 30-day OnlyFans subs
                </span>{" "}
                to onlyfans.com/luna at $9.99 — she sees 24 new paying
                subscribers. No signup, no crypto.
              </li>
              <li>
                <b className="font-semibold text-ink">4 · Residual donation.</b>{" "}
                The leftover{" "}
                <span className="tabular-nums font-medium text-blue">$5.24</span>{" "}
                is tipped to her on OnlyFans.
              </li>
              <li>
                <b className="font-semibold text-ink">5 · Burn.</b> The protocol
                share market-buys $KEPT and burns it. Every step posts a public
                receipt.
              </li>
            </ol>
            <div className="flex flex-col justify-center gap-4 rounded-xl border border-line bg-tint p-5">
              <SplitLegend />
              <div className="flex gap-2">
                <Link href="/flow" className="btn-primary">
                  See the full example flow
                </Link>
                <Link href="/docs" className="btn-secondary">
                  Docs
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── bento row 3: tables + feeds ── */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-baseline justify-between">
            <SectionLabel>Top tokens</SectionLabel>
            <Link href="/explore" className="text-[12px] font-semibold text-blue hover:underline">
              All
            </Link>
          </div>
          <div className="mt-2">
            {(analytics?.topTokens ?? []).slice(0, 6).map((t) => (
              <Link
                key={t.mint}
                href={`/token/${t.mint}`}
                className="flex items-center gap-2.5 border-b border-line py-2 text-[13px] last:border-b-0 hover:bg-tint/50"
              >
                <span className="min-w-0 truncate font-medium text-ink">
                  ${t.ticker}
                </span>
                <span className="text-[12px] text-ink-3">
                  {t.creator ? `@${t.creator.ofUsername}` : ""}
                </span>
                <span className="ml-auto tabular-nums text-ink-2">
                  {usdWhole(t.feesClaimedUsdCents)} fees
                </span>
              </Link>
            ))}
            {!analytics && <SkeletonRows n={5} />}
            {analytics && !analytics.topTokens.length && (
              <p className="py-4 text-[13px] text-ink-3">
                Launched tokens rank here by fees routed.
              </p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-baseline justify-between">
            <SectionLabel>Most paid creators</SectionLabel>
            <Link href="/explore?tab=creators" className="text-[12px] font-semibold text-blue hover:underline">
              All
            </Link>
          </div>
          <div className="mt-2">
            {(analytics?.topCreators ?? []).slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href={`/creator/${c.ofUsername}`}
                className="flex items-center gap-2.5 border-b border-line py-2 text-[13px] last:border-b-0 hover:bg-tint/50"
              >
                <Avatar creator={c} size={22} />
                <span className="min-w-0 truncate font-medium text-ink">
                  @{c.ofUsername}
                </span>
                <span className="ml-auto flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-green">
                    {c.lifetimeSubCount} subs
                  </span>
                  <span className="tabular-nums text-ink-2">
                    {usd(c.lifetimeSubUsdCents + c.lifetimeCashUsdCents)}
                  </span>
                </span>
              </Link>
            ))}
            {!analytics && <SkeletonRows n={5} />}
            {analytics && !analytics.topCreators.length && (
              <p className="py-4 text-[13px] text-ink-3">
                Creators rank here by lifetime received — subs plus donations.
              </p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-baseline justify-between">
            <SectionLabel>Buyback &amp; burn</SectionLabel>
            <Link href="/kept" className="text-[12px] font-semibold text-blue hover:underline">
              $KEPT
            </Link>
          </div>
          <div className="mt-2">
            {(burns?.items ?? []).slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-2.5 border-b border-line py-2 text-[13px] last:border-b-0"
              >
                <span className="font-medium tabular-nums text-ink">
                  {numCompact(b.keptAmount)} $KEPT
                </span>
                <span className="text-[12px] text-ink-3">burned</span>
                <a
                  href={`https://solscan.io/tx/${b.sig}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] text-ink-3 hover:text-blue"
                >
                  {b.sig.slice(0, 4)}…{b.sig.slice(-4)}
                </a>
                <span className="ml-auto tabular-nums text-ink-2">
                  {usd(b.usdCents)}
                </span>
                <span className="w-8 text-right text-[11px] tabular-nums text-ink-3">
                  {relTime(b.createdAt)}
                </span>
              </div>
            ))}
            {!burns && <SkeletonRows n={5} />}
            {burns && !burns.items.length && (
              <p className="py-4 text-[13px] text-ink-3">
                20% of every claim buys $KEPT and burns it. Burn transactions
                post here with Solscan links.
              </p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-baseline justify-between">
            <SectionLabel>Off-ramp &amp; float</SectionLabel>
            <Link href="/flow" className="text-[12px] font-semibold text-blue hover:underline">
              Flow
            </Link>
          </div>
          <div className="mt-2">
            {(offramp?.items ?? []).slice(0, 5).map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-2.5 border-b border-line py-2 text-[13px] last:border-b-0"
              >
                <span className="min-w-0 truncate text-ink-2">{o.route}</span>
                {o.solAmount != null && (
                  <span className="text-[11px] tabular-nums text-ink-3">
                    {sol(o.solAmount * 1e9)}
                  </span>
                )}
                <span className="ml-auto font-medium tabular-nums text-ink">
                  {usdWhole(o.usdCents)}
                </span>
                <span className="w-8 text-right text-[11px] tabular-nums text-ink-3">
                  {relTime(o.createdAt)}
                </span>
              </div>
            ))}
            {!offramp && <SkeletonRows n={5} />}
            {offramp && !offramp.items.length && (
              <p className="py-4 text-[13px] text-ink-3">
                SOL off-ramps and float top-ups for the payment rails appear
                here.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── recent payments strip ── */}
      <section className="card p-5">
        <div className="flex items-baseline justify-between">
          <SectionLabel>Recent payments</SectionLabel>
          <Link
            href="/payments"
            className="flex items-center gap-1 text-[13px] font-semibold text-blue hover:underline"
          >
            All payments <ArrowUpRight size={13} aria-hidden />
          </Link>
        </div>
        <div className="mt-2">
          {feed.slice(6, 14).map((p) => (
            <PayoutRow key={p.id} p={p} />
          ))}
          {!payments && <SkeletonRows n={6} />}
          {payments && !feed.length && (
            <EmptyState
              title="The ledger is empty."
              hint="It fills in the moment the first launch starts trading."
            />
          )}
        </div>
      </section>

      {/* stat strip */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats && (
          <>
            <div className="card p-4">
              <SectionLabel>Subscriptions purchased</SectionLabel>
              <p className="mt-1.5 text-[22px] font-semibold tabular-nums text-ink">
                {new Intl.NumberFormat("en-US").format(stats.subsPurchased)}
              </p>
            </div>
            <div className="card p-4">
              <SectionLabel>Donations sent</SectionLabel>
              <p className="mt-1.5 text-[22px] font-semibold tabular-nums text-ink">
                {usdWhole(stats.cashSentUsdCents)}
              </p>
            </div>
            <div className="card p-4">
              <SectionLabel>Queued</SectionLabel>
              <p className="mt-1.5 text-[22px] font-semibold tabular-nums text-ink">
                {usdWhole(stats.queuedUsdCents)}
              </p>
            </div>
            <div className="card p-4">
              <SectionLabel>$KEPT burned</SectionLabel>
              <p className="mt-1.5 text-[22px] font-semibold tabular-nums text-ink">
                {numCompact(stats.burnedKept)}
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
