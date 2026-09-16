import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setOptOut } from "@/lib/registry";
import { rateLimit } from "@/lib/ratelimit";
import { ADMIN_EMAIL } from "@/lib/constants";

export const dynamic = "force-dynamic";

const Schema = z.object({ username: z.string().regex(/^[a-zA-Z0-9._-]{3,30}$/) });

/**
 * Creator opt-out (§5): honored immediately — avatar hidden, new lookups
 * and registrations for the username frozen. Historical on-chain rows stay.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!rateLimit(`optout:${ip}`, 5, 3600_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }
  await setOptOut(parsed.data.username.toLowerCase());
  return NextResponse.json({
    ok: true,
    message: `Opt-out recorded. For verification or reversal, email ${ADMIN_EMAIL}.`,
  });
}
