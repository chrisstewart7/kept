"use client";

import Link from "next/link";
import { TokenRowData } from "@/lib/api";
import { usd, usdCompact } from "@/lib/format";
import { TokenGlyph } from "./ui";

export { LivePill, PayoutRow } from "./cards";

/* Explore mosaic tile (§6.1) — slight collage offsets, MC + "Sent" */
export function TokenGlyphMosaicTile({
  t,
  index,
}: {
  t: TokenRowData;
  index: number;
}) {
  const sentCents = t.cashSentUsdCents + t.subsBought * 999;
  const offsets = ["", "translate-y-1", "-translate-y-1"];
  return (
    <Link
      href={`/token/${t.mint}`}
      className={`rounded-xl border border-line bg-elevated p-3 shadow-card transition-transform hover:-translate-y-0.5 ${offsets[index % 3]}`}
    >
      <div className="flex items-center gap-2">
        <TokenGlyph ticker={t.ticker} image={t.imageUrl} size={26} />
        <span className="min-w-0 truncate text-[12.5px] font-semibold text-ink">
          ${t.ticker}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="tabular-nums text-ink-3">{usdCompact(t.mcUsd)}</span>
        <span className="tabular-nums font-medium text-blue">
          Sent {usd(sentCents)}
        </span>
      </div>
    </Link>
  );
}
