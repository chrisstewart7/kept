import { NextRequest, NextResponse } from "next/server";
import {
  creatorById,
  getAnalytics,
  getCreators,
  getStats,
  getTokens,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const range = (req.nextUrl.searchParams.get("range") ?? "30d") as
    | "1d"
    | "30d"
    | "all";
  const topTokensRaw = (await getTokens({ sort: "fees" })).slice(0, 8);
  const topTokens = await Promise.all(
    topTokensRaw.map(async (t) => ({
      ...t,
      creator: (await creatorById(t.creatorId)) ?? null,
    })),
  );
  return NextResponse.json({
    range,
    points: await getAnalytics(range),
    stats: await getStats(),
    topCreators: (await getCreators()).slice(0, 8),
    topTokens,
  });
}
