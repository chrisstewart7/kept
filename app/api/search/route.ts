import { NextRequest, NextResponse } from "next/server";
import { creatorById, search } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const { tokens, creators } = await search(q);
  const enriched = await Promise.all(
    tokens.map(async (t) => ({
      ...t,
      creator: (await creatorById(t.creatorId)) ?? null,
    })),
  );
  return NextResponse.json({ tokens: enriched, creators });
}
