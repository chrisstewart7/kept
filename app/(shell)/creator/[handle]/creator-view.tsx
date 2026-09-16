"use client";

import { useCreator } from "@/lib/api";
import { usd, usdWhole } from "@/lib/format";
import { ADMIN_EMAIL, X_HANDLE } from "@/lib/constants";
import { PayoutRow, TokenCard } from "@/components/cards";
import {
  Avatar,
  Badge,
  EmptyState,
  MilestoneBar,
  SectionLabel,
  SkeletonRows,
} from "@/components/ui";

export function CreatorView({ handle }: { handle: string }) {
  const { data, isLoading, isError } = useCreator(handle);

  if (isError) {
    return (
      <div className="card mx-auto max-w-lg">
        <EmptyState
          title="Creator not found."
          hint="No token has pointed fees at this OnlyFans username yet."
        />
      </div>
    );
  }
  if (isLoading || !data) return <SkeletonRows n={10} />;

  const { creator: c, tokens, payments } = data;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center gap-4">
        <Avatar creator={c} size={56} />
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2.5 text-[24px] font-semibold text-ink">
            @{c.ofUsername}
            <Badge tone="blue">subs + donations</Badge>
          </h1>
          <p className="mt-0.5 text-[13px] text-ink-3">
            onlyfans.com/{c.ofUsername} · does not need to have signed up
          </p>
        </div>
      </header>

      {/* lifetime */}
      <div className="card grid grid-cols-2 divide-x divide-line max-lg:divide-x-0 max-lg:divide-y lg:grid-cols-4">
        {(
          [
            ["Subs purchased", `${c.lifetimeSubCount}`],
            ["Donations received", usdWhole(c.lifetimeCashUsdCents)],
            ["Tokens pointed", `${c.tokenCount}`],
            ["Held balance", usd(c.heldUsdCents)],
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

      <div className="card p-5">
        <SectionLabel>Progress toward next subscription</SectionLabel>
        <div className="mt-3">
          <MilestoneBar
            currentCents={c.heldUsdCents % c.subPriceUsdCents}
            targetCents={c.subPriceUsdCents}
          />
        </div>
      </div>

      {/* tokens */}
      <section>
        <SectionLabel>Tokens pointing at @{c.ofUsername}</SectionLabel>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tokens.map((t) => (
            <TokenCard key={t.mint} t={{ ...t, creator: c }} />
          ))}
        </div>
      </section>

      {/* payout history */}
      <div className="card p-5">
        <SectionLabel>Payout history</SectionLabel>
        <div className="mt-2">
          {payments.length ? (
            payments.map((p) => <PayoutRow key={p.id} p={p} />)
          ) : (
            <EmptyState title="No payouts yet." />
          )}
        </div>
      </div>

      {/* opt-out (§6.9) */}
      <p className="rounded-xl border border-line bg-tint px-4 py-3 text-[13px] leading-relaxed text-ink-2">
        <b className="font-semibold text-ink">Are you @{c.ofUsername}?</b> You
        can refuse further payments at any time by contacting{" "}
        <a href={`mailto:${ADMIN_EMAIL}`} className="font-semibold text-blue hover:underline">
          {ADMIN_EMAIL}
        </a>{" "}
        or{" "}
        <a
          href={`https://x.com/${X_HANDLE.replace("@", "")}`}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-blue hover:underline"
        >
          {X_HANDLE}
        </a>
        . Honored within 7 days. Held balances are paid out on request.
      </p>
    </div>
  );
}
