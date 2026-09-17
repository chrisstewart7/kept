"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { create } from "zustand";
import { Menu, Plus, X } from "lucide-react";
import { X_HANDLE } from "@/lib/constants";
import { TickerTape } from "./live-chrome";
import { PigMark, Wordmark } from "./logo";
import { SearchOverlay, SearchTrigger } from "./search";
import { WalletButton, WalletPicker } from "./wallet";

/* §2 — Stonks chrome: top nav only. No left sidebar, ever. */
const NAV = [
  { href: "/", label: "Board" },
  { href: "/flow", label: "Flow" },
  { href: "/paypig", label: "$PAYPIG" },
  { href: "/docs", label: "Docs" },
];

const MENU_EXTRA = [
  { href: "/explore", label: "Explore" },
  { href: "/payments", label: "Payments" },
  { href: "/analytics", label: "Analytics" },
];

const useShell = create<{
  menu: boolean;
  setMenu: (v: boolean) => void;
}>((set) => ({ menu: false, setMenu: (menu) => set({ menu }) }));

export function AppShell({ children }: { children: React.ReactNode }) {
  const { menu, setMenu } = useShell();
  const pathname = usePathname();

  useEffect(() => setMenu(false), [pathname, setMenu]);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* ── top bar ── */}
      <header className="sticky top-0 z-[60] border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1240px] items-center gap-5 px-4 py-3 sm:px-6">
          <Link href="/" aria-label="PayPig home" className="shrink-0">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map(({ href, label }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-lg px-3 py-1.5 text-[13.5px] font-semibold transition-colors ${
                    active
                      ? "bg-blue-soft text-blue"
                      : "text-ink-2 hover:bg-tint hover:text-ink"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden flex-1 justify-center md:flex">
            <SearchTrigger />
          </div>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <span className="md:hidden">
              <SearchTrigger iconOnly />
            </span>
            <span className="max-sm:hidden">
              <WalletButton />
            </span>
            <Link href="/launch" className="btn-primary">
              <Plus size={15} aria-hidden /> Launch
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenu(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-elevated text-ink-2 lg:hidden"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
        {/* 32px activity ticker — real events only */}
        <TickerTape />
      </header>

      {/* ── mobile menu ── */}
      {menu && (
        <div
          className="fixed inset-0 z-[70] bg-ink/25 lg:hidden"
          onClick={() => setMenu(false)}
          aria-hidden
        />
      )}
      <div
        className={`fixed inset-x-0 top-0 z-[75] rounded-b-2xl border-b border-line bg-elevated p-5 shadow-card transition-transform duration-200 lg:hidden ${
          menu ? "translate-y-0" : "-translate-y-full"
        }`}
        role="dialog"
        aria-label="Menu"
      >
        <div className="flex items-center justify-between">
          <Wordmark />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenu(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-3 hover:bg-tint hover:text-ink"
          >
            <X size={17} />
          </button>
        </div>
        <nav className="mt-4 grid gap-1" aria-label="Menu">
          {[...NAV, ...MENU_EXTRA].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-ink hover:bg-tint"
            >
              {label}
            </Link>
          ))}
          <Link href="/launch" className="btn-primary mt-2 w-full">
            <Plus size={15} aria-hidden /> Launch
          </Link>
          <span className="mt-1 sm:hidden">
            <WalletButton />
          </span>
        </nav>
      </div>

      {/* ── main ── */}
      <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>

      {/* ── footer ── */}
      <footer className="border-t border-line px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-ink-3">
          <span className="flex items-center gap-2">
            <PigMark size={16} /> © 2026 PayPig
          </span>
          {MENU_EXTRA.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-ink">
              {label}
            </Link>
          ))}
          <Link href="/legal/terms" className="hover:text-ink">
            Terms
          </Link>
          <Link href="/legal/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <Link href="/legal/disclosures" className="hover:text-ink">
            Disclosures
          </Link>
          <a
            href={`https://x.com/${X_HANDLE.replace("@", "")}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink"
          >
            {X_HANDLE}
          </a>
          <span className="ml-auto">
            Not affiliated with OnlyFans, X, or Pump.fun.
          </span>
        </div>
      </footer>
      <SearchOverlay />
      <WalletPicker />
    </div>
  );
}
