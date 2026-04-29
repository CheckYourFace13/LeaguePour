import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";

function pickFirstMatch(html: string, re: RegExp): string | null {
  const m = html.match(re);
  if (!m?.[1]) return null;
  return m[1].trim();
}

function normalizeUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return u.toString();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { websiteUrl?: string };
  const websiteUrl = normalizeUrl(body.websiteUrl ?? "");
  if (!websiteUrl) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });

  try {
    const res = await fetch(websiteUrl, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ error: "Could not fetch URL" }, { status: 400 });
    const html = await res.text();

    const title = pickFirstMatch(html, /<title[^>]*>([^<]+)<\/title>/i);
    const desc = pickFirstMatch(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    );
    const logo = pickFirstMatch(
      html,
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    );

    const links = Array.from(
      html.matchAll(/https?:\/\/(?:www\.)?(instagram\.com|facebook\.com|x\.com|twitter\.com|tiktok\.com)\/[^\s"'<>]+/gi),
    ).map((m) => m[0]);

    const first = (host: string) => links.find((l) => l.toLowerCase().includes(host)) ?? null;

    return NextResponse.json({
      websiteUrl,
      description: desc,
      logoUrl: logo,
      title,
      instagramUrl: first("instagram.com"),
      facebookUrl: first("facebook.com"),
      xUrl: first("x.com") ?? first("twitter.com"),
      tiktokUrl: first("tiktok.com"),
    });
  } catch {
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
