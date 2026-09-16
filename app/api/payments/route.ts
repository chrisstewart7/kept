import { NextRequest, NextResponse } from "next/server";
import { creatorById, getPayments, getToken } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const rail = sp.get("rail") ?? undefined;
  const cursor = sp.get("cursor") ? Number(sp.get("cursor")) : undefined;
  const limit = sp.get("limit") ? Number(sp.get("limit")) : undefined;
  const { items, nextCursor } = await getPayments({ rail, cursor, limit });
  const enriched = await Promise.all(
    items.map(async (p) => ({
      ...p,
      creator: (await creatorById(p.creatorId)) ?? null,
      token: (await getToken(p.tokenMint)) ?? null,
    })),
  );
  return NextResponse.json({ items: enriched, nextCursor });
}
