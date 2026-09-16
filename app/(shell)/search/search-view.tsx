"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { useSearch } from "@/lib/api";
import { CreatorCard, TokenCard } from "@/components/cards";
import { EmptyState, SectionLabel } from "@/components/ui";

export function SearchPageView() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const { data } = useSearch(q);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-serif text-[34px] text-ink" style={{ letterSpacing: "-0.02em" }}>
          Search
        </h1>
      </header>
      <label className="relative block max-w-xl">
        <SearchIcon
          size={15}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3"
          aria-hidden
        />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tokens, creators, mints, OF usernames…"
          aria-label="Search"
          className="w-full rounded-full border border-line bg-elevated py-2.5 pl-10 pr-4 text-[14px] text-ink outline-none placeholder:text-ink-3 focus:border-blue-3"
        />
      </label>

      {q.trim() && data && !data.tokens.length && !data.creators.length && (
        <div className="card max-w-xl">
          <EmptyState title={`No matches for “${q}”.`} />
        </div>
      )}

      {!!data?.tokens.length && (
        <section>
          <SectionLabel>Tokens</SectionLabel>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.tokens.map((t) => (
              <TokenCard key={t.mint} t={t} />
            ))}
          </div>
        </section>
      )}
      {!!data?.creators.length && (
        <section>
          <SectionLabel>Creators</SectionLabel>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.creators.map((c) => (
              <CreatorCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
