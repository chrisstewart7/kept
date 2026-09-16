"use client";

import { useState } from "react";
import { usePayments, useStats } from "@/lib/api";
import { usdWhole } from "@/lib/format";
import { PayoutRowDetailed } from "@/components/cards";
import {
  EmptyState,
  SectionLabel,
  SkeletonRows,
} from "@/components/ui";

const TABS = [
  ["all", "All"],
  ["sub", "Subscriptions"],
  ["cash", "Donations"],
  ["held", "Held"],
  ["receipts", "Receipts"],
] as const;

export function PaymentsView() {
  const [tab, setTab] = useState<string>("all");
  const [cursor, setCursor] = useState(0);
  const { data: stats } = useStats();
  const { data, isLoading } = usePayments(tab, cursor, cursor === 0);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-serif text-[34px] text-ink" style={{ letterSpacing: "-0.02em" }}>
          Payments
        </h1>
        <p className="mt-1 text-[14px] text-ink-2">
          Every payout — subscription purchases and donations — posted
          publicly by @UseKept and recorded here.
        </p>
      </header>

      {/* header totals */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card p-4">
          <SectionLabel>Total paid out</SectionLabel>
          <p className="mt-1.5 text-[22px] font-semibold tabular-nums text-ink">
            {stats
              ? usdWhole(
                  stats.cashSentUsdCents + stats.subsPurchased * 999,
                )
              : "—"}
          </p>
        </div>
        <div className="card p-4">
          <SectionLabel>Subscriptions purchased</SectionLabel>
          <p className="mt-1.5 text-[22px] font-semibold tabular-nums text-green">
            {stats
              ? new Intl.NumberFormat("en-US").format(stats.subsPurchased)
              : "—"}
          </p>
        </div>
        <div className="card p-4">
          <SectionLabel>Donations sent</SectionLabel>
          <p className="mt-1.5 text-[22px] font-semibold tabular-nums text-blue">
            {stats ? usdWhole(stats.cashSentUsdCents) : "—"}
          </p>
        </div>
        <div className="card p-4">
          <SectionLabel>Queued</SectionLabel>
          <p className="mt-1.5 text-[22px] font-semibold tabular-nums text-amber">
            {stats ? usdWhole(stats.queuedUsdCents) : "—"}
          </p>
        </div>
      </div>

      {/* tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setCursor(0);
            }}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
              tab === t
                ? "bg-blue-soft text-blue"
                : "border border-line bg-elevated text-ink-2 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "held" && (
        <p className="rounded-xl border border-amber/25 bg-amber-soft px-4 py-3 text-[13px] text-ink-2">
          Held balances are waiting on the delivery worker — card declines or
          an unavailable creator page. They stay claimable for 7 days, then
          route to the $KEPT buyback.
        </p>
      )}

      {/* rows */}
      <div className="space-y-3">
        {isLoading && <SkeletonRows n={8} />}
        {data?.items.map((p) => <PayoutRowDetailed key={p.id} p={p} />)}
        {data && !data.items.length && (
          <div className="card">
            <EmptyState
              title="Nothing here yet."
              hint="Payouts land as soon as claims settle."
            />
          </div>
        )}
      </div>

      {/* pagination */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="btn-secondary"
          disabled={cursor === 0}
          onClick={() => setCursor(Math.max(0, cursor - 25))}
          style={cursor === 0 ? { opacity: 0.4, pointerEvents: "none" } : {}}
        >
          Newer
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={data?.nextCursor == null}
          onClick={() => data?.nextCursor != null && setCursor(data.nextCursor)}
          style={
            data?.nextCursor == null
              ? { opacity: 0.4, pointerEvents: "none" }
              : {}
          }
        >
          Older
        </button>
      </div>
    </div>
  );
}
