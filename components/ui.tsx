"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { initials, usd } from "@/lib/format";
import { Creator } from "@/lib/types";

/* ── Amount ─────────────────────────────────────────────────────────── */
export function Amount({
  cents,
  className = "",
  accent,
}: {
  cents: number;
  className?: string;
  accent?: "green" | "blue" | "ink" | "red";
}) {
  const color =
    accent === "green"
      ? "text-green"
      : accent === "blue"
        ? "text-blue"
        : accent === "red"
          ? "text-red"
          : "text-ink";
  return (
    <span className={`tabular-nums font-semibold ${color} ${className}`}>
      {usd(cents)}
    </span>
  );
}

/* ── badges ─────────────────────────────────────────────────────────── */
export function RailBadge({ rail }: { rail: string }) {
  const map: Record<string, string> = {
    sub: "bg-green-soft text-green",
    cash: "bg-blue-soft text-blue",
    held: "bg-amber-soft text-amber",
    buyback: "bg-tint text-ink-2",
  };
  /* wire value stays "cash"; the product calls the residual rail a donation */
  const label: Record<string, string> = { cash: "donation" };
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[rail] ?? "bg-tint text-ink-2"}`}
    >
      {label[rail] ?? rail}
    </span>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "green" | "blue" | "amber" | "red" | "pump";
  children: React.ReactNode;
}) {
  const map = {
    neutral: "bg-tint text-ink-2 border-line",
    green: "bg-green-soft text-green border-green/20",
    blue: "bg-blue-soft text-blue border-blue/20",
    amber: "bg-amber-soft text-amber border-amber/20",
    red: "bg-red-soft text-red border-red/20",
    pump: "bg-green-soft text-green border-green/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${map[tone]}`}
    >
      {tone === "pump" && (
        <span className="h-1.5 w-1.5 rounded-full bg-green" aria-hidden />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "confirmed"
      ? "green"
      : status === "sent" || status === "queued"
        ? "blue"
        : status === "held" || status === "waiting"
          ? "amber"
          : "red";
  return <Badge tone={tone as "green"}>{status}</Badge>;
}

/* ── CopyButton ─────────────────────────────────────────────────────── */
export function CopyButton({
  value,
  label,
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={label ?? `Copy ${value}`}
      onClick={() => {
        navigator.clipboard.writeText(value).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-tint hover:text-ink"
    >
      {copied ? (
        <Check size={13} className="text-green" />
      ) : (
        <Copy size={13} />
      )}
    </button>
  );
}

/* ── Avatar — initials on blue-soft, SFW (§12) ──────────────────────── */
const TINTS = ["#eff4ff", "#e6efff", "#dbe6ff", "#e9f0ff", "#f0f5ff"];
const INKS = ["#1d4ed8", "#2563eb", "#1e40af", "#3b82f6", "#1d4ed8"];

export function Avatar({
  creator,
  size = 34,
  square = false,
}: {
  creator: Pick<Creator, "id" | "displayName"> | null;
  size?: number;
  square?: boolean;
}) {
  const name = creator?.displayName ?? "??";
  const h = creator
    ? creator.id.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0)
    : 0;
  return (
    <span
      aria-hidden
      className={`flex shrink-0 select-none items-center justify-center font-semibold ${square ? "rounded-lg" : "rounded-full"}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.34),
        background: TINTS[h % TINTS.length],
        color: INKS[h % INKS.length],
        border: "1px solid var(--line)",
      }}
    >
      {initials(name)}
    </span>
  );
}

export function TokenGlyph({
  ticker,
  image,
  size = 34,
}: {
  ticker: string;
  image?: string;
  size?: number;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-lg border border-line object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const h = ticker.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
  return (
    <span
      aria-hidden
      className="flex shrink-0 select-none items-center justify-center rounded-lg font-mono font-bold"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, size * 0.28),
        background: h % 2 ? "var(--bg-tint)" : "var(--bg-tint-2)",
        color: "#1d4ed8",
        border: "1px solid var(--line)",
      }}
    >
      {ticker.slice(0, 4)}
    </span>
  );
}

/* ── SplitLegend — 80/20 (§5) ───────────────────────────────────────── */
export function SplitLegend() {
  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full">
        <div className="w-[80%] bg-blue" />
        <div className="w-[20%] bg-ink" />
      </div>
      <div className="mt-2 flex justify-between text-[12px] font-medium text-ink-2">
        <span>
          <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-blue" />
          80% creator share — subs + donations
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-ink" />
          20% $KEPT burn
        </span>
      </div>
    </div>
  );
}

/* ── MilestoneBar — progress toward next sub (§5) ───────────────────── */
export function MilestoneBar({
  currentCents,
  targetCents,
}: {
  currentCents: number;
  targetCents: number;
}) {
  const pct = Math.min(100, (currentCents / Math.max(1, targetCents)) * 100);
  return (
    <div>
      <div className="flex justify-between text-[12px] text-ink-3">
        <span className="font-medium text-ink-2">
          {usd(currentCents)} / {usd(targetCents)}
        </span>
        <span>to next subscription</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-tint">
        <div
          className="h-full rounded-full bg-blue transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── Odometer — animated fee total, no layout shift (§5, §14) ───────── */
export function Odometer({ cents }: { cents: number }) {
  const [display, setDisplay] = useState(cents);
  const prev = useRef(cents);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (reduced.current || prev.current === cents) {
      prev.current = cents;
      setDisplay(cents);
      return;
    }
    const from = prev.current;
    const delta = cents - from;
    const start = performance.now();
    const dur = 800;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + delta * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    prev.current = cents;
    return () => cancelAnimationFrame(raf);
  }, [cents]);

  const target = usd(cents);
  return (
    <span className="relative inline-block tabular-nums">
      {/* reserve width on the final value to avoid layout shift */}
      <span className="invisible">{target}</span>
      <span className="absolute inset-0">{usd(display)}</span>
    </span>
  );
}

/* ── section label ──────────────────────────────────────────────────── */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="sec-label">{children}</div>;
}

/* ── empty / error / skeleton (§5) ──────────────────────────────────── */
export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-12 text-center">
      <p className="text-sm font-semibold text-ink-2">{title}</p>
      {hint && <p className="max-w-sm text-[13px] text-ink-3">{hint}</p>}
    </div>
  );
}

export function ErrorState({ retry }: { retry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-sm font-semibold text-red">Something went wrong.</p>
      {retry && (
        <button type="button" className="btn-secondary" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function SkeletonRows({ n = 5 }: { n?: number }) {
  return (
    <div className="space-y-3 py-2">
      {Array.from({ length: n }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
