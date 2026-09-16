"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useFlow } from "@/lib/api";
import { Badge, SkeletonRows, SplitLegend, StatusBadge } from "@/components/ui";

export function FlowView() {
  const { data } = useFlow();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="flex items-center gap-3 font-serif text-[34px] text-ink" style={{ letterSpacing: "-0.02em" }}>
          Capital flow
          {data?.example && <Badge tone="blue">Example</Badge>}
        </h1>
        <p className="mt-1 text-[14px] text-ink-2">
          {data?.example
            ? "No real claims have settled yet — these are illustrative numbers showing the path every claim will take. This page switches to the latest real claim automatically."
            : "The most recent claim, walked all the way through. Every claim takes this exact path."}
        </p>
      </header>

      <div className="card p-5">
        <SplitLegend />
      </div>

      <div className="relative">
        {/* vertical rail */}
        <div
          className="absolute bottom-6 left-[19px] top-6 w-px bg-line-strong"
          aria-hidden
        />
        <div className="space-y-3">
          {!data && <SkeletonRows n={6} />}
          {data?.steps.map((s, i) => (
            <div key={s.id} className="relative flex gap-4">
              <span
                className={`z-10 mt-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold ${
                  s.status === "confirmed"
                    ? "border-blue/25 bg-blue-soft text-blue"
                    : s.status === "sent"
                      ? "border-line bg-elevated text-ink-2"
                      : "border-amber/25 bg-amber-soft text-amber"
                }`}
              >
                {i + 1}
              </span>
              <div className="card flex-1 p-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-[14.5px] font-semibold text-ink">
                    {s.title}
                  </h2>
                  <StatusBadge status={s.status} />
                  <span className="ml-auto font-mono text-[12.5px] tabular-nums text-ink-2">
                    {s.amount}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
                  {s.detail}
                </p>
                {s.link && (
                  <a
                    href={s.link.href}
                    target={s.link.href.startsWith("http") ? "_blank" : undefined}
                    rel={s.link.href.startsWith("http") ? "noreferrer" : undefined}
                    className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-blue hover:underline"
                  >
                    {s.link.label}
                    {s.link.href.startsWith("http") && (
                      <ExternalLink size={11} aria-hidden />
                    )}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[13px] text-ink-3">
        Claims are scheduled, not per-trade. Vaults under 0.01 SOL are skipped
        and retried — fees are not lost.{" "}
        <Link href="/docs/how-claims-work" className="font-semibold text-blue hover:underline">
          How claims work
        </Link>
      </p>
    </div>
  );
}
