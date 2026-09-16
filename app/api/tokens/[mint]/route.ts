import { NextRequest, NextResponse } from "next/server";
import { creatorById, getToken, paymentsForToken } from "@/lib/data";
import { getProfile } from "@/lib/registry";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ mint: string }> },
) {
  const { mint } = await params;
  const token = await getToken(mint);
  if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const creator = (await creatorById(token.creatorId)) ?? null;
  const profile = creator ? ((await getProfile(creator.ofUsername)) ?? null) : null;
  const payments = (await paymentsForToken(mint)).map((p) => ({
    ...p,
    creator,
    token,
  }));
  return NextResponse.json({ token, creator, profile, payments });
}
