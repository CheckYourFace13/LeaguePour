import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBoolSetting } from "@/lib/app-settings";
import { BRANDS } from "@/lib/content-engine/brand-config";
import { KILL_SWITCH_KEY } from "@/lib/content-engine/publish";
import type { Brand } from "@/lib/content-engine/types";

// Read-only diagnostic for the content engine - never mutates anything. Same auth as the other
// cron routes. Exists so queue state (queued topics, publish counts, kill switch) can be
// inspected without direct database access - this app is the only thing with a working
// connection to it from most environments (see the CDN/IP-allowlist notes elsewhere in this repo).
function startOfIsoWeek(d: Date): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay() || 7;
  if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1));
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

async function brandStatus(brand: Brand) {
  const config = BRANDS[brand];
  const weekStart = startOfIsoWeek(new Date());

  const [needsContentAll, published, publishedThisWeek] = await Promise.all([
    prisma.guide.findMany({
      where: { brand, status: "NEEDS_CONTENT" },
      select: { title: true, slug: true, category: true, priorityScore: true, searchIntent: true, bodyHtml: true, rejectReason: true, createdAt: true },
      orderBy: { priorityScore: "desc" },
    }),
    prisma.guide.count({ where: { brand, status: "PUBLISHED" } }),
    prisma.guide.count({ where: { brand, status: "PUBLISHED", datePublished: { gte: weekStart } } }),
  ]);

  const queuedNoBody = needsContentAll.filter((g) => !g.bodyHtml);
  const readyToPublish = needsContentAll.filter((g) => !!g.bodyHtml);

  return {
    publishedCount: published,
    publishedThisIsoWeek: publishedThisWeek,
    weeklyCap: config.weeklyCap,
    queueBuffer: config.queueBuffer,
    queuedTopics: queuedNoBody.slice(0, 5).map((g) => ({
      title: g.title,
      slug: g.slug,
      category: g.category,
      priorityScore: g.priorityScore,
      searchIntent: g.searchIntent,
      createdAt: g.createdAt,
    })),
    queuedTopicsTotal: queuedNoBody.length,
    readyToPublish: readyToPublish.map((g) => ({ title: g.title, slug: g.slug, rejectReason: g.rejectReason })),
  };
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured on the server." }, { status: 500 });
  }
  const url = new URL(request.url);
  const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
  if (given !== secret) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  try {
    const killSwitchEnabled = await getBoolSetting(KILL_SWITCH_KEY, true);
    const [lp, vs] = await Promise.all([brandStatus("LP"), brandStatus("VS")]);
    return NextResponse.json({ ok: true, guideTableAccessible: true, killSwitchEnabled, LP: lp, VS: vs });
  } catch (err) {
    console.error("[content-engine-status] failed", err);
    return NextResponse.json(
      { ok: false, guideTableAccessible: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
