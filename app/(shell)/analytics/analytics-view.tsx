"use client";

import Link from "next/link";
import { useState } from "react";
import { useAnalytics } from "@/lib/api";
import { numCompact, usd, usdWhole } from "@/lib/format";
import { CashArea, FeesArea, SplitBars, SubsBar } from "@/components/charts";
import { Avatar, SectionLabel, Skeleton } from "@/components/ui";

type Range = "1d" | "30d" | "all";

export function AnalyticsView() {
  const [range, setRange] = useState<Range>("30d");
  const { data } = useAnalytics(range);
  const points = data?.points ?? [];
  const stats = data?.stats;

  const rangeSubs = points.reduce((s, p) => s + p.subsCount, 0);
  const rangeSubsUsd = points.reduce((s, p) => s + p.subsUsdCents, 0);
  const rangeCash = points.reduce((s, p) => s + p.cashUsdCents, 0);
  const rangeFees = points.reduce((s, p) => s + p.feesUsdCents, 0);
  const rangeBurn = points.reduce((s, p) => s + p.burnedUsdCents, 0);

  const kpis: [string, string][] = stats
    ? [
        ["Fees claimed", usdWhole(rangeFees)],
        ["Creator share", usdWhole(Math.round(rangeFees * 0.8))],
        ["Subs purchased", `${new Intl.NumberFormat("en-US").format(rangeSubs)} · ${usdWhole(rangeSubsUsd)}`],
        ["Donations paid", usdWhole(rangeCash)],
        ["$KEPT burned", usdWhole(rangeBurn)],
        ["Queued now", usdWhole(stats.queuedUsdCents)],
      ]
    : [];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[34px] text-ink" style={{ letterSpacing: "-0.02em" }}>
            Analytics
          </h1>
          <p className="mt-1 text-[14px] text-ink-2">
            The protocol&apos;s books, in public.
          </p>
        </div>
        <div className="flex gap-1">
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
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                range === r
                  ? "bg-blue-soft text-blue"
                  : "border border-line bg-elevated text-ink-3 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* KPI strip — 6 numbers (§6.4) */}
      <div className="card grid grid-cols-2 divide-x divide-line max-lg:divide-x-0 max-lg:divide-y lg:grid-cols-6">
        {kpis.length
          ? kpis.map(([k, v]) => (
              <div key={k} className="px-4 py-3.5">
                <SectionLabel>{k}</SectionLabel>
                <p className="mt-1 truncate text-[17px] font-semibold tabular-nums text-ink">
                  {v}
                </p>
              </div>
            ))
          : Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-4 py-3.5">
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
      </div>

      {/* zero state — no history yet */}
      {data && !points.length && (
        <div className="card">
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-sm font-semibold text-ink-2">
              No activity to chart yet.
            </p>
            <p className="max-w-md text-[13px] text-ink-3">
              Fees claimed, the 80/20 split, subscriptions purchased,
              donations paid, and $KEPT burns all chart here from the first
              claim onward.
            </p>
          </div>
        </div>
      )}

      {/* main chart */}
      <div className={`card p-5 ${data && !points.length ? "hidden" : ""}`}>
        <SectionLabel>Fees claimed</SectionLabel>
        <div className="mt-3">
          {points.length ? (
            <FeesArea points={points} />
          ) : (
            <Skeleton className="h-[220px] w-full" />
          )}
        </div>
      </div>

      <div className={`grid gap-4 lg:grid-cols-2 ${data && !points.length ? "hidden" : ""}`}>
        <div className="card p-5">
          <SectionLabel>80 / 20 split over time</SectionLabel>
          <div className="mt-3">
            {points.length ? (
              <SplitBars points={points} />
            ) : (
              <Skeleton className="h-[200px] w-full" />
            )}
          </div>
        </div>
        <div className="card p-5">
          <SectionLabel>Subscriptions purchased</SectionLabel>
          <div className="mt-3">
            {points.length ? (
              <SubsBar points={points} />
            ) : (
              <Skeleton className="h-[200px] w-full" />
            )}
          </div>
        </div>
        <div className="card p-5 lg:col-span-2">
          <SectionLabel>Donations paid vs $KEPT burned</SectionLabel>
          <div className="mt-3">
            {points.length ? (
              <CashArea points={points} />
            ) : (
              <Skeleton className="h-[200px] w-full" />
            )}
          </div>
        </div>
      </div>

      {/* top lists */}
      <div className={`grid gap-4 lg:grid-cols-2 ${data && !points.length ? "hidden" : ""}`}>
        <div className="card p-5">
          <SectionLabel>Top creators</SectionLabel>
          <div className="mt-2">
            {(data?.topCreators ?? []).map((c) => (
              <Link
                key={c.id}
                href={`/creator/${c.ofUsername}`}
                className="flex items-center gap-2.5 border-b border-line py-2 text-[13px] last:border-b-0 hover:bg-tint/50"
              >
                <Avatar creator={c} size={24} />
                <span className="font-medium text-ink">@{c.ofUsername}</span>
                <span className="ml-auto tabular-nums text-ink-2">
                  {usd(c.lifetimeSubUsdCents + c.lifetimeCashUsdCents)}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <SectionLabel>Top tokens by fees routed</SectionLabel>
          <div className="mt-2">
            {(data?.topTokens ?? []).map((t) => (
              <Link
                key={t.mint}
                href={`/token/${t.mint}`}
                className="flex items-center gap-2.5 border-b border-line py-2 text-[13px] last:border-b-0 hover:bg-tint/50"
              >
                <span className="font-medium text-ink">${t.ticker}</span>
                <span className="text-[12px] text-ink-3">
                  {t.creator ? `@${t.creator.ofUsername}` : ""}
                </span>
                <span className="ml-auto tabular-nums text-ink-2">
                  {usdWhole(t.feesClaimedUsdCents)}
                </span>
                <span className="text-[11px] tabular-nums text-ink-3">
                  {numCompact(t.subsBought)} subs
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
