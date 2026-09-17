import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getProfile } from "@/lib/registry";
import { rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/**
 * One-time public-avatar cache (§5): downloads the creator's PUBLIC avatar
 * once, stores it locally, serves it from us. Never hotlinks OF CDNs from
 * the browser, never fetches anything paywalled.
 */

const DIR =
  process.env.VERCEL === "1"
    ? "/tmp/paypig-avatars"
    : path.join(process.cwd(), ".paypig-data", "avatars");

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!rateLimit(`avatar:${ip}`, 120, 60_000)) {
    return new NextResponse("Rate limited", { status: 429 });
  }
  const u = (req.nextUrl.searchParams.get("u") ?? "").toLowerCase();
  if (!/^[a-z0-9._-]{3,30}$/.test(u)) {
    return new NextResponse("Bad username", { status: 400 });
  }
  const profile = await getProfile(u);
  if (!profile || profile.optOut || !profile.rawAvatarUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = path.join(DIR, `${u}.img`);
  const typeFile = path.join(DIR, `${u}.type`);
  try {
    const [buf, type] = await Promise.all([
      fs.readFile(file),
      fs.readFile(typeFile, "utf8").catch(() => "image/jpeg"),
    ]);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "content-type": type,
        "cache-control": "public, max-age=21600",
      },
    });
  } catch {
    /* not cached yet — fetch once */
  }

  try {
    const res = await fetch(profile.rawAvatarUrl, {
      headers: { "user-agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const type = res.headers.get("content-type") ?? "image/jpeg";
    if (!type.startsWith("image/")) throw new Error("not an image");
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > 4 * 1024 * 1024) throw new Error("too large");
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(file, buf);
    await fs.writeFile(typeFile, type, "utf8");
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "content-type": type,
        "cache-control": "public, max-age=21600",
      },
    });
  } catch {
    return new NextResponse("Unavailable", { status: 502 });
  }
}
