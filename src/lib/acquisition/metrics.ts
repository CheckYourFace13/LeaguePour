/**
 * Owner dashboard numbers for the acquisition program. Every figure is a real query; nothing is
 * estimated. Window = program start to now. Brand of a new venue: its attribution record when it
 * has one (recorded at signup from the host), else VenueSprocket if it has a VS config created
 * within an hour of the venue, else LeaguePour.
 */
import { prisma } from "@/lib/db";
import { PLAN_DEFINITIONS } from "@/lib/pricing";
import { CAMPAIGN_ID, CONTACTED_STATUSES, PROGRAM_START, type AcqBrand } from "./program";
import { ensureAcquisitionTable } from "./store";

type BrandMetrics = {
  prospects: number;
  suppressed: number;
  queued: number;
  approved: number;
  withEmail: number;
  contacted: number;
  replied: number;
  positive: number;
  notInterested: number;
  demoVisits: number;
  unsubscribed: number;
  bounced: number;
  complained: number;
  registrations: number;
  registrationsFromOutreach: number;
  registrationsAnySource: number;
  activated: number;
  tournamentsCreated: number;
  tournamentsPublished: number;
  paidConversions: number;
  paidFromOutreach: number;
  newMrrCents: number;
  outreachMrrCents: number;
  sourceBreakdown: { label: string; count: number }[];
};

const LIVE = ["active", "trialing"];
const PUBLISHED_STATUSES = ["PUBLISHED", "SIGNUP_OPEN", "SIGNUP_CLOSED", "IN_PROGRESS", "COMPLETED"] as const;

function planMonthlyCents(plan: string | undefined, interval: string | undefined, brand: AcqBrand): number {
  const vsMap: Record<string, string> = { starter: "STARTER", pro: "GROWTH", growth: "PRO" };
  const key = (brand === "vs" ? vsMap[(plan ?? "").toLowerCase()] : (plan ?? "").toUpperCase()) ?? "";
  const def = PLAN_DEFINITIONS.find((p) => p.plan === key);
  if (!def) return 0;
  return interval === "annual" ? Math.round(def.annualCents / 12) : def.monthlyCents;
}

export async function getAcquisitionMetrics(now = new Date()) {
  await ensureAcquisitionTable();
  const since = PROGRAM_START;

  const [prospects, venues, attributionRows, conversionRows] = await Promise.all([
    prisma.acquisitionProspect.findMany({
      select: { brand: true, status: true, email: true, visitCount: true, repliedAt: true, signedUpVenueId: true },
    }),
    prisma.venue.findMany({
      where: { createdAt: { gte: since } },
      select: {
        id: true,
        createdAt: true,
        subscriptionId: true,
        vsConfig: { select: { createdAt: true, vsSubscriptionId: true } },
        competitions: { select: { status: true, createdAt: true } },
        _count: { select: { privateEventLeads: true } },
      },
    }),
    prisma.appSetting.findMany({ where: { key: { startsWith: "acq:venue:" } }, select: { key: true, value: true } }),
    prisma.appSetting.findMany({ where: { key: { startsWith: "conversion:subscription_activated:" } }, select: { key: true, value: true } }),
  ]);

  const attribution = new Map<string, { brand?: AcqBrand; source?: string; campaign?: string; ref?: string; referrerHost?: string; prospectId?: string | null }>();
  for (const r of attributionRows) {
    try {
      attribution.set(r.key.slice("acq:venue:".length), JSON.parse(r.value));
    } catch {
      /* skip malformed */
    }
  }
  const isOutreach = (venueId: string) => {
    const a = attribution.get(venueId);
    return !!a && (a.campaign === CAMPAIGN_ID || !!a.prospectId);
  };

  const venueBrand = (v: (typeof venues)[number]): AcqBrand => {
    const a = attribution.get(v.id);
    if (a?.brand === "lp" || a?.brand === "vs") return a.brand;
    if (v.vsConfig && Math.abs(v.vsConfig.createdAt.getTime() - v.createdAt.getTime()) < 60 * 60 * 1000) return "vs";
    return "lp";
  };

  const empty = (): BrandMetrics => ({
    prospects: 0, suppressed: 0, queued: 0, approved: 0, withEmail: 0, contacted: 0, replied: 0, positive: 0,
    notInterested: 0, demoVisits: 0, unsubscribed: 0, bounced: 0, complained: 0, registrations: 0,
    registrationsFromOutreach: 0, registrationsAnySource: 0, activated: 0, tournamentsCreated: 0,
    tournamentsPublished: 0, paidConversions: 0, paidFromOutreach: 0, newMrrCents: 0, outreachMrrCents: 0,
    sourceBreakdown: [],
  });
  const m: Record<AcqBrand, BrandMetrics> = { lp: empty(), vs: empty() };

  for (const p of prospects) {
    const b = m[p.brand as AcqBrand];
    if (!b) continue;
    b.prospects++;
    if (p.status === "SUPPRESSED") b.suppressed++;
    if (p.status === "QUEUED") b.queued++;
    if (p.status === "APPROVED") b.approved++;
    if (p.email && p.status !== "SUPPRESSED") b.withEmail++;
    if ((CONTACTED_STATUSES as string[]).includes(p.status)) b.contacted++;
    if (p.status === "REPLIED" || p.status === "POSITIVE" || (p.status === "NOT_INTERESTED" && p.repliedAt)) b.replied++;
    if (p.status === "POSITIVE") b.positive++;
    if (p.status === "NOT_INTERESTED") b.notInterested++;
    if (p.visitCount > 0) b.demoVisits++;
    if (p.status === "UNSUBSCRIBED") b.unsubscribed++;
    if (p.status === "BOUNCED") b.bounced++;
    if (p.status === "COMPLAINED") b.complained++;
  }

  const sources: Record<AcqBrand, Map<string, number>> = { lp: new Map(), vs: new Map() };
  for (const v of venues) {
    const brand = venueBrand(v);
    const b = m[brand];
    b.registrations++;
    if (isOutreach(v.id)) b.registrationsFromOutreach++;
    const a = attribution.get(v.id);
    const label = a ? (a.source ? `${a.source}${a.campaign ? ` / ${a.campaign}` : ""}` : a.referrerHost ? `referral: ${a.referrerHost}` : "direct") : "no source recorded";
    sources[brand].set(label, (sources[brand].get(label) ?? 0) + 1);
    if (brand === "lp") {
      if (v.competitions.some((c) => (PUBLISHED_STATUSES as readonly string[]).includes(c.status))) b.activated++;
    } else if (v._count.privateEventLeads > 0) {
      b.activated++;
    }
  }
  for (const brand of ["lp", "vs"] as AcqBrand[]) {
    m[brand].sourceBreakdown = [...sources[brand].entries()].map(([label, count]) => ({ label, count })).sort((x, y) => y.count - x.count);
  }

  const [created, published] = await Promise.all([
    prisma.competition.count({ where: { createdAt: { gte: since } } }),
    prisma.competition.count({ where: { publishedAt: { gte: since } } }),
  ]);
  m.lp.tournamentsCreated = created;
  m.lp.tournamentsPublished = published;

  // Paid conversions in the window: the webhook's once-only conversion markers (src/lib/conversions.ts).
  const subToVenue = new Map<string, string>();
  for (const v of venues) {
    if (v.subscriptionId) subToVenue.set(v.subscriptionId, v.id);
    if (v.vsConfig?.vsSubscriptionId) subToVenue.set(v.vsConfig.vsSubscriptionId, v.id);
  }
  const liveSubs = new Set<string>();
  const [liveLp, liveVs] = await Promise.all([
    prisma.venue.findMany({ where: { subscriptionStatus: { in: LIVE }, subscriptionId: { not: null } }, select: { id: true, subscriptionId: true } }),
    prisma.venueVsConfig.findMany({ where: { vsSubscriptionStatus: { in: LIVE }, vsSubscriptionId: { not: null } }, select: { venueId: true, vsSubscriptionId: true } }),
  ]);
  for (const v of liveLp) {
    liveSubs.add(v.subscriptionId!);
    subToVenue.set(v.subscriptionId!, v.id);
  }
  for (const c of liveVs) {
    liveSubs.add(c.vsSubscriptionId!);
    subToVenue.set(c.vsSubscriptionId!, c.venueId);
  }
  for (const r of conversionRows) {
    let d: { product?: string; plan?: string; interval?: string; at?: string };
    try {
      d = JSON.parse(r.value);
    } catch {
      continue;
    }
    if (!d.at || new Date(d.at) < since) continue;
    const brand: AcqBrand = d.product === "vs" ? "vs" : "lp";
    const subId = r.key.slice("conversion:subscription_activated:".length);
    const venueId = subToVenue.get(subId);
    const b = m[brand];
    b.paidConversions++;
    const mrr = liveSubs.has(subId) ? planMonthlyCents(d.plan, d.interval, brand) : 0;
    b.newMrrCents += mrr;
    if (venueId && isOutreach(venueId)) {
      b.paidFromOutreach++;
      b.outreachMrrCents += mrr;
    }
  }

  return { since, now, lp: m.lp, vs: m.vs, attributionRecords: attributionRows.length };
}

export type DailyTableRow = {
  day: string;
  brand: AcqBrand;
  sessions: number | null;
  signups: number;
  activations: number;
  paid: number;
  emailsSent: number;
};

/**
 * Per-day, per-brand series for the dashboard (last `days` Chicago days, newest first).
 * sessions is null (no data) for days before first-party tracking started; other columns come
 * from production records that exist for every day, so they are real zeros when empty.
 */
export async function getDailyTable(days = 14, now = new Date()): Promise<DailyTableRow[]> {
  const { dailyRows, lastDays, trackingSince } = await import("./daily");
  const { chicagoDay } = await import("./program");
  const dayList = lastDays(days, now);
  const oldest = dayList[dayList.length - 1];
  const windowStart = new Date(now.getTime() - (days + 1) * 24 * 60 * 60 * 1000);
  const [since, rows, venues, attrRows, comps, leads, conv, sent] = await Promise.all([
    trackingSince(),
    dailyRows(oldest),
    prisma.venue.findMany({ where: { createdAt: { gte: windowStart } }, select: { id: true, createdAt: true, vsConfig: { select: { createdAt: true } } } }),
    prisma.appSetting.findMany({ where: { key: { startsWith: "acq:venue:" } }, select: { key: true, value: true } }),
    prisma.competition.findMany({ where: { publishedAt: { gte: windowStart } }, select: { publishedAt: true } }),
    prisma.privateEventLead.findMany({ where: { createdAt: { gte: windowStart } }, select: { createdAt: true } }),
    prisma.appSetting.findMany({ where: { key: { startsWith: "conversion:subscription_activated:" } }, select: { value: true } }),
    prisma.acquisitionProspect.findMany({ where: { sentAt: { gte: windowStart } }, select: { brand: true, sentAt: true } }),
  ]);
  const brandOf = new Map<string, string>();
  for (const r of attrRows) {
    try {
      brandOf.set(r.key.slice("acq:venue:".length), (JSON.parse(r.value) as { brand?: string }).brand ?? "");
    } catch {
      /* skip */
    }
  }
  const convDays = conv.flatMap((c) => {
    try {
      const d = JSON.parse(c.value) as { product?: string; at?: string };
      return d.at ? [{ brand: d.product === "vs" ? "vs" : "lp", day: chicagoDay(new Date(d.at)) }] : [];
    } catch {
      return [];
    }
  });
  const out: DailyTableRow[] = [];
  for (const day of dayList) {
    for (const brand of ["lp", "vs"] as AcqBrand[]) {
      const venuesDay = venues.filter((v) => {
        if (chicagoDay(v.createdAt) !== day) return false;
        const b = brandOf.get(v.id) || (v.vsConfig && Math.abs(v.vsConfig.createdAt.getTime() - v.createdAt.getTime()) < 3_600_000 ? "vs" : "lp");
        return b === brand;
      });
      out.push({
        day,
        brand,
        sessions: since && day >= since ? (rows.find((r) => r.day === day && r.brand === brand && r.metric === "sessions" && r.dim === "all")?.count ?? 0) : null,
        signups: venuesDay.length,
        activations: brand === "lp" ? comps.filter((c) => c.publishedAt && chicagoDay(c.publishedAt) === day).length : leads.filter((l) => chicagoDay(l.createdAt) === day).length,
        paid: convDays.filter((c) => c.brand === brand && c.day === day).length,
        emailsSent: sent.filter((s) => s.brand === brand && s.sentAt && chicagoDay(s.sentAt) === day).length,
      });
    }
  }
  return out;
}
