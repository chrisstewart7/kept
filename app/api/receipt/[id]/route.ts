import { NextRequest, NextResponse } from "next/server";
import { creatorById, getReceipt, getToken } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payout = await getReceipt(id);
  if (!payout) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    payout,
    creator: (await creatorById(payout.creatorId)) ?? null,
    token: (await getToken(payout.tokenMint)) ?? null,
  });
}
