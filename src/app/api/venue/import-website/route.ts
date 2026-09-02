import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { auth } from "@/auth";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";

export const runtime = "nodejs";

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
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * SSRF guard: this endpoint lets any authenticated venue staff member (any role) make the
 * server fetch an arbitrary URL - found via security audit. Without this check a venue account
 * could point websiteUrl at localhost, an RFC1918 private address, or a cloud metadata endpoint
 * (169.254.169.254) and have the response (title/description/og:image) reflected back to them.
 * Resolves the hostname first and rejects private/loopback/link-local/reserved ranges before
 * ever issuing the actual fetch - checking the URL string alone isn't enough since a hostname
 * can resolve to a private IP even when it doesn't look like one.
 */
function isPrivateOrReservedIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (a === 127) return true; // loopback
    if (a === 10) return true; // RFC1918
    if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
    if (a === 192 && b === 168) return true; // RFC1918
    if (a === 169 && b === 254) return true; // link-local incl. cloud metadata
    if (a === 0) return true; // "this network"
    if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
    return false;
  }
  if (version === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true; // loopback
    if (lower.startsWith("fe80:") || lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true; // link-local
    if (/^f[cd][0-9a-f]{2}:/.test(lower)) return true; // unique local (fc00::/7)
    if (lower.startsWith("::ffff:")) return isPrivateOrReservedIp(lower.slice(7)); // IPv4-mapped
    return false;
  }
  return true; // couldn't parse - refuse rather than risk it
}

async function assertPublicHost(urlString: string): Promise<boolean> {
  const hostname = new URL(urlString).hostname;
  // A literal IP in the URL - check it directly, no DNS needed.
  if (isIP(hostname)) return !isPrivateOrReservedIp(hostname);
  try {
    const results = await lookup(hostname, { all: true });
    return results.every((r) => !isPrivateOrReservedIp(r.address));
  } catch {
    return false; // DNS failure - refuse rather than risk it
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { websiteUrl?: string };
  const websiteUrl = normalizeUrl(body.websiteUrl ?? "");
  if (!websiteUrl) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  if (!(await assertPublicHost(websiteUrl))) {
    return NextResponse.json({ error: "That URL can't be imported." }, { status: 400 });
  }

  try {
    const res = await fetch(websiteUrl, { cache: "no-store", redirect: "manual" });
    // Refuse to blindly follow a redirect the destination controls - it could point at a
    // private/internal address that wasn't visible in the original URL. A legitimate venue
    // website redirect (e.g. bare domain -> www) is rare enough that surfacing this as an error
    // is an acceptable tradeoff for closing the SSRF-via-redirect gap.
    if (res.status >= 300 && res.status < 400) {
      return NextResponse.json({ error: "That URL redirects - please paste the final URL directly." }, { status: 400 });
    }
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
