import { NextRequest, NextResponse } from "next/server";
import { creatorById, getTokens } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const tokens = await getTokens({
    sort: sp.get("sort") ?? undefined,
    q: sp.get("q") ?? undefined,
  });
  const items = await Promise.all(
    tokens.map(async (t) => ({
      ...t,
      creator: (await creatorById(t.creatorId)) ?? null,
    })),
  );
  return NextResponse.json({ items });
}
