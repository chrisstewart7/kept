"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, X } from "lucide-react";
import { create } from "zustand";
import { useSearch } from "@/lib/api";
import { usd, usdCompact } from "@/lib/format";
import { Avatar, TokenGlyph } from "./ui";

export const useSearchOverlay = create<{
  open: boolean;
  setOpen: (v: boolean) => void;
}>((set) => ({ open: false, setOpen: (open) => set({ open }) }));

export function SearchTrigger({ iconOnly = false }: { iconOnly?: boolean }) {
  const setOpen = useSearchOverlay((s) => s.setOpen);
  if (iconOnly) {
    return (
      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-elevated text-ink-3 hover:text-ink"
      >
        <SearchIcon size={15} />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex w-full max-w-md items-center gap-2 rounded-full border border-line bg-elevated px-4 py-2 text-left text-[13px] text-ink-3 transition-colors hover:border-line-strong"
    >
      <SearchIcon size={14} aria-hidden />
      <span>Search tokens, creators, mints…</span>
      <kbd className="ml-auto rounded-md border border-line bg-tint px-1.5 text-[10px] font-medium text-ink-3">
        /
      </kbd>
    </button>
  );
}

export function SearchOverlay() {
  const { open, setOpen } = useSearchOverlay();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data } = useSearch(q);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !open) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  if (!open) return null;

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-ink/20 p-4 pt-[12vh] backdrop-blur-[2px]"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="card mx-auto w-full max-w-xl overflow-hidden !rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <SearchIcon size={16} className="text-ink-3" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tokens, creators, mints, OF usernames…"
            className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
            className="text-ink-3 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {!q.trim() && (
            <p className="px-3 py-6 text-center text-[13px] text-ink-3">
              Type to search the protocol.
            </p>
          )}
          {q.trim() && !data?.tokens.length && !data?.creators.length && (
            <p className="px-3 py-6 text-center text-[13px] text-ink-3">
              No matches for “{q}”.
            </p>
          )}
          {!!data?.tokens.length && (
            <>
              <p className="sec-label px-3 pb-1 pt-2">Tokens</p>
              {data.tokens.map((t) => (
                <button
                  key={t.mint}
                  type="button"
                  onClick={() => go(`/token/${t.mint}`)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-tint"
                >
                  <TokenGlyph ticker={t.ticker} size={26} />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
                    {t.name} <span className="text-ink-3">${t.ticker}</span>
                  </span>
                  <span className="text-[12px] tabular-nums text-ink-3">
                    {usdCompact(t.mcUsd)}
                  </span>
                </button>
              ))}
            </>
          )}
          {!!data?.creators.length && (
            <>
              <p className="sec-label px-3 pb-1 pt-2">Creators</p>
              {data.creators.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => go(`/creator/${c.ofUsername}`)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-tint"
                >
                  <Avatar creator={c} size={26} />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
                    @{c.ofUsername}
                  </span>
                  <span className="text-[12px] tabular-nums text-ink-3">
                    {usd(c.lifetimeSubUsdCents + c.lifetimeCashUsdCents)}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
