import { NextRequest, NextResponse } from "next/server";
import { getCreator, getTokens, paymentsForCreator } from "@/lib/data";
import { getProfile } from "@/lib/registry";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const creator = await getCreator(handle);
  if (!creator) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const profile = (await getProfile(creator.ofUsername)) ?? null;
  const tokens = (await getTokens({ sort: "fees" })).filter(
    (t) => t.creatorId === creator.id,
  );
  const payments = (await paymentsForCreator(creator.id)).map((p) => ({
    ...p,
    creator,
    token: tokens.find((t) => t.mint === p.tokenMint) ?? null,
  }));
  return NextResponse.json({ creator, profile, tokens, payments });
}
