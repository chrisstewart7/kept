"use client";

import Link from "next/link";
import { useToken } from "@/lib/api";
import { relTime, usd, usdCompact, usdWhole } from "@/lib/format";
import { AddressChip, PayoutRow, VenueBadge } from "@/components/cards";
import {
  Avatar,
  Badge,
  EmptyState,
  MilestoneBar,
  SectionLabel,
  SkeletonRows,
  TokenGlyph,
} from "@/components/ui";

export function TokenView({ mint }: { mint: string }) {
  const { data, isLoading, isError } = useToken(mint);

  if (isError) {
    return (
      <div className="card mx-auto max-w-lg">
        <EmptyState
          title="Token not found."
          hint="It may not be registered with Kept yet. Register it on the Launch page."
        />
        <div className="flex justify-center pb-8">
          <Link href="/launch" className="btn-primary">
            Register a token
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !data) return <SkeletonRows n={10} />;

  const { token: t, creator: c, payments } = data;
  const heldToward = c ? c.heldUsdCents % c.subPriceUsdCents : 0;

  return (
    <div className="space-y-5">
      {/* header */}
      <header className="flex flex-wrap items-center gap-4">
        <TokenGlyph ticker={t.ticker} image={t.imageUrl} size={52} />
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2.5 text-[24px] font-semibold text-ink">
            {t.name} <span className="text-ink-3">${t.ticker}</span>
            <VenueBadge />
            {t.feeSharePermanent && <Badge tone="blue">100% → treasury</Badge>}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <AddressChip
              value={t.mint}
              href={`https://solscan.io/token/${t.mint}`}
            />
            <span className="text-[12px] text-ink-3">
              created {relTime(t.createdAt)} ago
            </span>
          </div>
        </div>
      </header>

      {/* pairing */}
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <SectionLabel>Fees route to</SectionLabel>
        {c ? (
          <>
            <Link
              href={`/creator/${c.ofUsername}`}
              className="flex items-center gap-2 font-medium text-ink hover:text-blue"
            >
              <Avatar creator={c} size={26} />
              onlyfans.com/{c.ofUsername}
            </Link>
            <span className="text-[13px] text-ink-3">
              subs + donations, delivered on OnlyFans
            </span>
          </>
        ) : (
          <span className="text-[13px] text-ink-3">Unpaired</span>
        )}
        <span className="ml-auto text-[12px] text-ink-3">
          Not endorsed by the creator.
        </span>
      </div>

      {/* stats */}
      <div className="card grid grid-cols-2 divide-x divide-line max-lg:divide-x-0 max-lg:divide-y lg:grid-cols-5">
        {(
          [
            ["Market cap", usdCompact(t.mcUsd)],
            ["24h volume", usdCompact(t.vol24hUsd)],
            ["Fees claimed", usdWhole(t.feesClaimedUsdCents)],
            ["Subs bought", String(t.subsBought)],
            ["Donated", usd(t.cashSentUsdCents)],
          ] as [string, string][]
        ).map(([k, v]) => (
          <div key={k} className="px-4 py-3.5">
            <SectionLabel>{k}</SectionLabel>
            <p className="mt-1 text-[17px] font-semibold tabular-nums text-ink">
              {v}
            </p>
          </div>
        ))}
      </div>

      {/* next milestone */}
      {c && (
        <div className="card p-5">
          <SectionLabel>Next milestone</SectionLabel>
          <div className="mt-3">
            <MilestoneBar
              currentCents={heldToward}
              targetCents={c.subPriceUsdCents}
            />
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* payments for this mint */}
        <div className="card p-5">
          <SectionLabel>Payments from this token</SectionLabel>
          <div className="mt-2">
            {payments.length ? (
              payments.map((p) => <PayoutRow key={p.id} p={p} />)
            ) : (
              <EmptyState
                title="No payouts yet."
                hint="The first claim can take a few hours after launch."
              />
            )}
          </div>
        </div>

        {/* raw description */}
        <div className="card p-5">
          <SectionLabel>Description — raw</SectionLabel>
          <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-line bg-tint p-3.5 font-mono text-[12px] leading-relaxed text-ink-2">
            {t.description}
          </pre>
          <div className="mt-3 space-y-1.5 text-[12.5px] text-ink-2">
            <p>
              <span className="text-ink-3">Parsed OF:</span>{" "}
              <b className="font-semibold">{c ? c.ofUsername : "—"}</b>
            </p>
            <p>
              <span className="text-ink-3">Rails:</span>{" "}
              <b className="font-semibold">subs + donations</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
