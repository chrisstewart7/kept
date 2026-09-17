import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { creatorById, getReceipt, getToken } from "@/lib/data";
import { fullDate, usd } from "@/lib/format";
import { PigMark } from "@/components/logo";
import { ReceiptActions } from "./receipt-actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await getReceipt(id);
  if (!p) return { title: "Receipt" };
  return {
    title: `Receipt — ${usd(p.usdCents)} ${p.rail.toUpperCase()}`,
    description: "Public PayPig payment receipt.",
  };
}

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getReceipt(id);
  if (!p) notFound();
  const creator = await creatorById(p.creatorId);
  const token = await getToken(p.tokenMint);
  const sig = p.solscanUrl?.split("/tx/")[1] ?? "";

  const rows: [string, React.ReactNode][] = [
    [
      "Creator",
      creator ? (
        <Link
          key="c"
          href={`/creator/${creator.ofUsername}`}
          className="font-medium text-blue hover:underline"
        >
          onlyfans.com/{creator.ofUsername}
        </Link>
      ) : (
        "—"
      ),
    ],
    [
      "Token",
      token ? (
        <Link
          key="t"
          href={`/token/${token.mint}`}
          className="font-medium text-blue hover:underline"
        >
          ${token.ticker}
        </Link>
      ) : (
        "—"
      ),
    ],
    [
      "Claim",
      sig ? (
        <a
          key="s"
          href={p.solscanUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[13px] text-blue hover:underline"
        >
          {sig.slice(0, 4)}…{sig.slice(-4)} · Solscan
        </a>
      ) : (
        "—"
      ),
    ],
    ["Rail", p.rail.toUpperCase()],
    ...(p.rail === "sub"
      ? ([["Period", `${p.ofPeriodDays ?? 30} days`]] as [string, string][])
      : ([["Via", "OnlyFans tip"]] as [string, string][])),
    ["Time", fullDate(p.createdAt)],
  ];

  return (
    <div className="min-h-dvh bg-bg">
      {/* slim header (§6.10) */}
      <header className="border-b border-line bg-elevated">
        <div className="mx-auto flex max-w-xl items-center gap-2.5 px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="PayPig home">
            <PigMark size={22} />
            <span
              className="font-serif text-[18px] text-ink"
              style={{ letterSpacing: "-0.02em" }}
            >
              PayPig receipt
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-5 py-10">
        <div className="card p-8">
          <p className="text-[44px] font-semibold tabular-nums text-ink">
            {usd(p.usdCents)}
          </p>
          <p className="mt-1 text-[15px] text-ink-2">
            {p.rail === "sub"
              ? "OnlyFans subscription purchased"
              : p.rail === "cash"
                ? "Donation sent on OnlyFans"
                : "Held for the creator"}
          </p>
          <dl className="mt-6 divide-y divide-line border-t border-line">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between py-2.5">
                <dt className="text-[13px] text-ink-3">{k}</dt>
                <dd className="text-[13.5px] text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <ReceiptActions />
        <p className="mt-6 text-center text-[11.5px] text-ink-3">
          Payment by the PayPig protocol. Not an endorsement by the creator. Not
          affiliated with OnlyFans or X.
        </p>
      </main>
    </div>
  );
}
