"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { usePayments, useTokens } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Creator } from "@/lib/types";
import { CreatorRow, PayoutRow, TokenRow } from "@/components/cards";
import { NextSlot } from "@/components/live-chrome";
import { Badge, EmptyState, SectionLabel, SkeletonRows } from "@/components/ui";

type Tab = "tokens" | "creators" | "live";

const SORTS = [
  ["new", "New"],
  ["mc", "Market cap"],
  ["subs", "Subs bought"],
  ["cash", "Donated"],
] as const;

function useCreators() {
  return useQuery<{ items: Creator[] }>({
    queryKey: ["creators"],
    queryFn: async () => {
      const res = await fetch("/api/creators");
      if (!res.ok) throw new Error("creators");
      return res.json();
    },
  });
}

export function ExploreView() {
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>(
    params.get("tab") === "creators" ? "creators" : "tokens",
  );
  const [sort, setSort] = useState("new");
  const [q, setQ] = useState("");
  const { data: tokens, isLoading } = useTokens(sort, q);
  const { data: creatorsData } = useCreators();
  const { data: live } = usePayments("all");

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-serif text-[34px] text-ink" style={{ letterSpacing: "-0.02em" }}>
          Explore
        </h1>
        <p className="mt-1 text-[14px] text-ink-2">
          Every token routing fees through PayPig, and every creator receiving
          them.
        </p>
      </header>

      {/* tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["tokens", "Tokens"],
            ["creators", "Creators"],
            ["live", "Live"],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
              tab === t
                ? "bg-blue-soft text-blue"
                : "border border-line bg-elevated text-ink-2 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-2">
          <Badge tone="pump">Pump</Badge>
        </span>
      </div>

      {tab === "tokens" && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative flex-1 min-w-[220px]">
              <SearchIcon
                size={14}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3"
                aria-hidden
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, ticker, mint, OF username…"
                aria-label="Search tokens"
                className="w-full rounded-full border border-line bg-elevated py-2 pl-9 pr-4 text-[13px] text-ink outline-none placeholder:text-ink-3 focus:border-blue-3"
              />
            </label>
            <div className="flex gap-1">
              {SORTS.map(([s, label]) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSort(s)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                    sort === s
                      ? "bg-blue-soft text-blue"
                      : "text-ink-3 hover:bg-tint hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="grid grid-cols-[minmax(0,2.2fr)_1fr_1fr_0.7fr_1fr_0.6fr] gap-3 border-b border-line bg-tint/60 px-4 py-2.5 max-md:hidden">
              {["Token", "MC", "24h vol", "Subs", "Donated", "Age"].map(
                (h) => (
                  <span key={h} className="sec-label">
                    {h}
                  </span>
                ),
              )}
            </div>
            {isLoading && <SkeletonRows n={8} />}
            {tokens?.items.map((t) => <TokenRow key={t.mint} t={t} />)}
            {tokens && tokens.items.length > 0 && tokens.items.length < 8 && !q && (
              <div className="p-3">
                <NextSlot label="Launch the next one" />
              </div>
            )}
            {tokens && !tokens.items.length && (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-sm font-semibold text-ink-2">
                  {q ? "No tokens match." : "No tokens yet."}
                </p>
                <p className="max-w-sm text-[13px] text-ink-3">
                  {q
                    ? "Try a different name, ticker, mint, or OF username."
                    : "Every token launched or registered through PayPig lists here with its fee trail, live."}
                </p>
                {!q && (
                  <Link href="/launch" className="btn-primary">
                    Launch the first token
                  </Link>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "creators" && (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[minmax(0,2fr)_0.6fr_1fr_1.4fr_1.4fr] gap-3 border-b border-line bg-tint/60 px-4 py-2.5 max-md:hidden">
            {["Creator", "Tokens", "Lifetime", "Mix", "Next sub"].map((h) => (
              <span key={h} className="sec-label">
                {h}
              </span>
            ))}
          </div>
          {!creatorsData && <SkeletonRows n={8} />}
          {creatorsData?.items.map((c) => <CreatorRow key={c.id} c={c} />)}
          {creatorsData && !creatorsData.items.length && (
            <EmptyState
              title="No creators yet."
              hint="A creator appears here the first time a token points fees at their OnlyFans username."
            />
          )}
        </div>
      )}

      {tab === "live" && (
        <div className="card p-5">
          <SectionLabel>Live payouts</SectionLabel>
          <div className="mt-2">
            {!live && <SkeletonRows n={8} />}
            {live?.items.slice(0, 20).map((p, i) => (
              <PayoutRow key={p.id} p={p} animate={i === 0} />
            ))}
            {live && !live.items.length && (
              <EmptyState
                title="Nothing live yet."
                hint="Payouts stream here in real time once the first launch starts trading."
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
