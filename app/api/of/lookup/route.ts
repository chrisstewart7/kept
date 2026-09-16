import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProfile, saveProfile, CreatorProfile } from "@/lib/registry";
import { rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

/**
 * Public OnlyFans profile lookup (§5). Server-side only.
 * Allowed fields: existence, username, display name, public avatar,
 * public bio, subscription price, verified flag. Nothing behind a login
 * or paywall is ever requested. Results cached 6h; avatars are served
 * through /api/of/avatar so the Board never hotlinks OF CDNs.
 */

const CACHE_MS = 6 * 3600_000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";

const LookupSchema = z.object({
  username: z.string().regex(/^[a-zA-Z0-9._-]{3,30}$/),
});

function meta(html: string, property: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
    "i",
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
    "i",
  );
  return html.match(re)?.[1] ?? html.match(alt)?.[1];
}

async function resolvePublicProfile(
  username: string,
): Promise<Omit<CreatorProfile, "fetchedAt">> {
  /* Path 2 — commercial public-profile API, if configured */
  const apiKey = process.env.ONLYFANSAPI_KEY;
  if (apiKey) {
    try {
      const res = await fetch(
        `https://app.onlyfansapi.com/api/profiles/${username}`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(12_000),
        },
      );
      if (res.status === 404) return { ofUsername: username, exists: false };
      if (res.ok) {
        const j = (await res.json()) as {
          name?: string;
          avatar?: string;
          about?: string;
          subscribePrice?: number;
          isVerified?: boolean;
        };
        return {
          ofUsername: username,
          exists: true,
          displayName: j.name || username,
          avatarUrl: j.avatar ? `/api/of/avatar?u=${username}` : undefined,
          rawAvatarUrl: j.avatar,
          about: j.about?.slice(0, 280),
          subPriceUsdCents:
            typeof j.subscribePrice === "number"
              ? Math.round(j.subscribePrice * 100)
              : undefined,
          verified: j.isVerified,
        };
      }
    } catch {
      /* fall through to Path 1 */
    }
  }

  /* Path 1 — the public profile page itself */
  const res = await fetch(`https://onlyfans.com/${username}`, {
    headers: {
      "user-agent": UA,
      accept: "text/html,application/xhtml+xml",
      "accept-language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(12_000),
  });
  if (res.status === 404) return { ofUsername: username, exists: false };
  if (!res.ok) throw new Error(`blocked:${res.status}`);
  const html = await res.text();
  if (/cf-challenge|just a moment|turnstile/i.test(html.slice(0, 4000))) {
    throw new Error("blocked:challenge");
  }
  const ogTitle = meta(html, "og:title") ?? meta(html, "twitter:title");
  const ogImage = meta(html, "og:image") ?? meta(html, "twitter:image");
  const ogDesc = meta(html, "og:description");
  if (!ogTitle && !ogImage) throw new Error("blocked:unparseable");
  const displayName = (ogTitle ?? username)
    .replace(/\s*(\|\s*)?OnlyFans.*$/i, "")
    .trim();
  const price = html.match(/\$\s?(\d{1,3}(?:\.\d{2})?)\s*(?:\/|per\s+)mo/i)?.[1];
  return {
    ofUsername: username,
    exists: true,
    displayName: displayName || username,
    avatarUrl: ogImage ? `/api/of/avatar?u=${username}` : undefined,
    rawAvatarUrl: ogImage,
    about: ogDesc?.slice(0, 280),
    subPriceUsdCents: price ? Math.round(parseFloat(price) * 100) : undefined,
  };
}

function publicShape(p: CreatorProfile) {
  return {
    exists: p.exists,
    username: p.ofUsername,
    displayName: p.displayName,
    avatarUrl: p.avatarUrl,
    about: p.about,
    subPriceUsdCents: p.subPriceUsdCents,
    verified: p.verified,
    optOut: p.optOut,
  };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!rateLimit(`oflookup:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = LookupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid username — a-z, 0-9, dot, dash, underscore, 3-30 chars." },
      { status: 400 },
    );
  }
  const username = parsed.data.username.toLowerCase();
  if (!rateLimit(`oflookup:u:${username}`, 6, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const cached = await getProfile(username);
  if (cached?.optOut) {
    return NextResponse.json({
      ...publicShape(cached),
      error: "This creator opted out of Kept. New launches for them are disabled.",
    });
  }
  if (cached && Date.now() - cached.fetchedAt < CACHE_MS) {
    return NextResponse.json(publicShape(cached));
  }

  try {
    const resolved = await resolvePublicProfile(username);
    const record: CreatorProfile = { ...resolved, fetchedAt: Date.now() };
    await saveProfile(record);
    return NextResponse.json(publicShape(record));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "lookup failed";
    return NextResponse.json({
      exists: null,
      username,
      error: msg.startsWith("blocked")
        ? "Profile could not be resolved (upstream block). You can still launch — upload a token image instead."
        : "Lookup failed. You can still launch — upload a token image instead.",
    });
  }
}
