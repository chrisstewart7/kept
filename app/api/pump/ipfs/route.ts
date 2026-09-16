import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";
import { getProfile } from "@/lib/registry";

export const dynamic = "force-dynamic";

/**
 * Metadata upload proxy → pump.fun's public IPFS endpoint.
 * Accepts either an uploaded image (≤2MB raster, §8) or `avatarOf=<username>`
 * to use the cached PUBLIC OnlyFans avatar. The server never holds keys —
 * this only produces the metadata URI the user's wallet then signs over.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!rateLimit(`ipfs:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Bad form" }, { status: 400 });

  const name = String(form.get("name") ?? "").slice(0, 48);
  const symbol = String(form.get("symbol") ?? "").slice(0, 12);
  const description = String(form.get("description") ?? "").slice(0, 500);
  if (!name || !symbol || !description) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  let file = form.get("file");
  const avatarOf = form.get("avatarOf");

  if (!(file instanceof File) && typeof avatarOf === "string") {
    const username = avatarOf.toLowerCase();
    const profile = await getProfile(username);
    if (!profile?.rawAvatarUrl || profile.optOut) {
      return NextResponse.json(
        { error: "No cached public avatar for that username" },
        { status: 400 },
      );
    }
    const res = await fetch(profile.rawAvatarUrl, {
      headers: { "user-agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Avatar fetch failed" }, { status: 502 });
    }
    const type = res.headers.get("content-type") ?? "image/jpeg";
    const buf = await res.arrayBuffer();
    file = new File([buf], `${username}.jpg`, { type });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image required" }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Image over 2MB" }, { status: 400 });
  }
  if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.type)) {
    return NextResponse.json({ error: "Raster images only" }, { status: 400 });
  }

  const out = new FormData();
  out.set("file", file);
  out.set("name", name);
  out.set("symbol", symbol);
  out.set("description", description);
  out.set("showName", "true");

  try {
    const res = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: out,
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `pump.fun IPFS rejected the upload (${res.status})` },
        { status: 502 },
      );
    }
    const json = (await res.json()) as { metadataUri?: string };
    if (!json.metadataUri) {
      return NextResponse.json({ error: "No metadata URI returned" }, { status: 502 });
    }
    return NextResponse.json({ metadataUri: json.metadataUri });
  } catch {
    return NextResponse.json(
      { error: "pump.fun IPFS unreachable — try again or use the manual path" },
      { status: 502 },
    );
  }
}
