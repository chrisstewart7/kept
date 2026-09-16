"use client";

import { ExternalLink } from "lucide-react";
import { useAnalytics, useKept } from "@/lib/api";
import { numCompact, relTime, usd, usdCompact } from "@/lib/format";
import { AddressChip } from "@/components/cards";
import { CashArea } from "@/components/charts";
import {
  EmptyState,
  SectionLabel,
  Skeleton,
  SkeletonRows,
} from "@/components/ui";

export function KeptView() {
  const { data } = useKept();
  const { data: analytics } = useAnalytics("30d");
  const info = data?.info;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[34px] text-ink" style={{ letterSpacing: "-0.02em" }}>
            $KEPT
          </h1>
          <p className="mt-1 text-[14px] text-ink-2">
            The value-accrual token of Kept.
          </p>
        </div>
        {info &&
          (info.launched ? (
            <div className="flex items-center gap-2">
              <AddressChip value={info.mint} />
              <a
                href={info.pumpUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                pump.fun <ExternalLink size={13} aria-hidden />
              </a>
            </div>
          ) : (
            <span className="rounded-full border border-amber/25 bg-amber-soft px-4 py-1.5 text-[12.5px] font-semibold text-amber">
              $KEPT is not launched yet — no CA, no market
            </span>
          ))}
      </header>

      {/* stat strip */}
      <div className="card grid grid-cols-2 divide-x divide-line max-lg:divide-x-0 max-lg:divide-y lg:grid-cols-5">
        {info ? (
          <>
            <div className="px-4 py-3.5">
              <SectionLabel>Price</SectionLabel>
              <p className="mt-1 text-[15px] font-semibold tabular-nums text-ink">
                {info.live ? `$${info.priceUsd.toFixed(4)}` : "not live"}
              </p>
            </div>
            <div className="px-4 py-3.5">
              <SectionLabel>Market cap</SectionLabel>
              <p className="mt-1 text-[15px] font-semibold tabular-nums text-ink">
                {info.live ? usdCompact(info.mcUsd) : "not live"}
              </p>
            </div>
            <div className="px-4 py-3.5">
              <SectionLabel>Supply</SectionLabel>
              <p className="mt-1 text-[17px] font-semibold tabular-nums text-ink">
                {numCompact(info.supply)}
              </p>
            </div>
            <div className="px-4 py-3.5">
              <SectionLabel>Burned</SectionLabel>
              <p className="mt-1 text-[17px] font-semibold tabular-nums text-ink">
                {numCompact(info.burned)}
              </p>
            </div>
            <div className="px-4 py-3.5">
              <SectionLabel>Burned %</SectionLabel>
              <p className="mt-1 text-[17px] font-semibold tabular-nums text-ink">
                {info.burnedPct}%
              </p>
            </div>
          </>
        ) : (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3.5">
              <Skeleton className="h-10 w-full" />
            </div>
          ))
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* chart */}
        <div className="card p-5">
          <SectionLabel>Buyback value burned (30D)</SectionLabel>
          <div className="mt-3">
            {analytics?.points.length ? (
              <CashArea points={analytics.points} />
            ) : analytics ? (
              <EmptyState
                title="No history yet."
                hint="The chart draws itself from the first claim onward."
              />
            ) : (
              <Skeleton className="h-[200px] w-full" />
            )}
          </div>
        </div>

        {/* what it is / is not (§6.7) */}
        <div className="card p-5">
          <SectionLabel>What $KEPT is</SectionLabel>
          <div className="mt-3 space-y-2.5 text-[13.5px] leading-relaxed text-ink-2">
            <p>$KEPT is the value-accrual token of Kept.</p>
            <p>
              It has no governance. Holding it does not change the 80/20
              split.
            </p>
            <p>
              20% of every claimed fee buys $KEPT on the market and burns it.
            </p>
            <p className="border-t border-line pt-2.5 text-[12.5px] text-ink-3">
              $KEPT&apos;s own creator fees stay in the protocol treasury. No
              fee discount, no access rights, not equity.
            </p>
          </div>
        </div>
      </div>

      {/* buyback feed */}
      <div className="card p-5">
        <SectionLabel>Buyback feed</SectionLabel>
        <div className="mt-2">
          {!data && <SkeletonRows n={6} />}
          {data && !data.burns.length && (
            <EmptyState
              title="No buybacks yet."
              hint="20% of the first claimed fee buys $KEPT on the market and burns it. The transaction posts here."
            />
          )}
          {data?.burns.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-3 border-b border-line py-2.5 text-[13px] last:border-b-0"
            >
              <span className="font-medium tabular-nums text-ink">
                {numCompact(b.keptAmount)} $KEPT
              </span>
              <span className="text-[12px] text-ink-3">bought and burned</span>
              <a
                href={`https://solscan.io/tx/${b.sig}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11.5px] text-ink-3 hover:text-blue"
              >
                {b.sig.slice(0, 4)}…{b.sig.slice(-4)}
              </a>
              <span className="ml-auto font-medium tabular-nums text-ink-2">
                {usd(b.usdCents)}
              </span>
              <span className="w-9 text-right text-[12px] tabular-nums text-ink-3">
                {relTime(b.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
