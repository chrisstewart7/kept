import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ingestVerified } from "@/lib/data";
import { verifyToken } from "@/lib/verify";
import { rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const DetectSchema = z.object({
  mint: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/),
});

/**
 * The ONLY path onto the Board. Runs the full on-chain verification
 * (§3: on pump + 100% share to treasury + locked config + description
 * line) and upserts the registry row only when every check passes.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!rateLimit(`detect:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = DetectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid mint" }, { status: 400 });
  }
  const result = await verifyToken(parsed.data.mint);
  if (!result.ok) {
    return NextResponse.json({
      detected: false,
      checks: result.checks,
      hint: result.reason,
    });
  }
  const token = await ingestVerified(parsed.data.mint, result);
  return NextResponse.json({ detected: true, token, checks: result.checks });
}
