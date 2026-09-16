import type { Metadata } from "next";
import { TokenView } from "./token-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mint: string }>;
}): Promise<Metadata> {
  const { mint } = await params;
  return {
    title: `Token ${mint.slice(0, 4)}…${mint.slice(-4)}`,
    description: "Fee trail, subs bought, and donations sent for this token.",
  };
}

export default async function TokenPage({
  params,
}: {
  params: Promise<{ mint: string }>;
}) {
  const { mint } = await params;
  return <TokenView mint={mint} />;
}
