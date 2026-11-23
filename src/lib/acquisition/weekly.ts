/**
 * Weekly growth report (Monday 8:00 America/Chicago, previous Monday-Sunday), per brand and
 * combined. Production data only:
 *  - Missing is never zero: a metric whose source is not connected or not tracked for the whole
 *    week is null (rendered "not connected" / "not tracked"), never 0.
 *  - Paying = subscriptions currently active or trialing. Canceled/refunded ones never count.
 *  - Weekly revenue = paid Stripe invoices in the week (live account) minus refunds created in the
 *    week; null if Stripe can't be read.
 * One send per week, guarded by an atomic AppSetting claim (weekly_report_claim:<weekStart>), so
 * restarts, redeploys and several instances never double-send. Each week's snapshot is kept in
 * AppSetting weekly_report:<weekStart> for the dashboard's history.
 */
import { prisma } from "@/lib/db";
import { getBoolSetting, getSetting } from "@/lib/app-settings";
import { sendEmail, escHtml } from "@/lib/email";
import { getLeaguePourMetrics, getVenueSprocketMetrics } from "@/lib/admin-metrics";
import { chicagoDay, type AcqBrand } from "./program";
import { ensureDailyTable, trackingSince } from "./daily";
import { ensureAcquisitionTable } from "./store";

export const WEEKLY_REPORT_ENABLED_KEY = "acq_weekly_report_enabled";
const DAY_MS = 24 * 60 * 60 * 1000;
const LIVE = ["active", "trialing"];

// ── Chicago week arithmetic (DST-aware) ──────────────────────────────────────

function chicagoOffsetMs(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(at);
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second")) - Math.floor(at.getTime() / 1000) * 1000;
}

/** UTC instant of 00:00 America/Chicago on a YYYY-MM-DD day. */
export function chicagoMidnight(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  // First guess from the noon offset, then re-evaluate the offset at that instant: on a DST change
  // day midnight and noon have different offsets.
  const guess = Date.UTC(y, m - 1, d) - chicagoOffsetMs(new Date(Date.UTC(y, m - 1, d, 12)));
  return new Date(Date.UTC(y, m - 1, d) - chicagoOffsetMs(new Date(guess)));
}

function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function chicagoWeekday(now: Date): number {
  const [y, m, d] = chicagoDay(now).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sunday
}

export function chicagoHour(now: Date): number {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "numeric", hourCycle: "h23" }).format(now));
}

export type WeekRange = { startDay: string; endDay: string; start: Date; end: Date; label: string; partial: boolean };

/** The Monday-Sunday week before the one containing `now` (or the current week to date if partial). */
export function weekRange(now: Date, partial = false): WeekRange {
  const today = chicagoDay(now);
  const thisMonday = addDays(today, -((chicagoWeekday(now) + 6) % 7));
  const startDay = partial ? thisMonday : addDays(thisMonday, -7);
  const endDay = addDays(startDay, 6);
  const start = chicagoMidnight(startDay);
  const end = partial ? now : chicagoMidnight(addDays(startDay, 7));
  const fmt = (d: string, withYear: boolean) =>
    new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" });
  return { startDay, endDay, start, end, partial, label: `${fmt(startDay, false)} – ${fmt(endDay, true)}${partial ? " (to date)" : ""}` };
}

// ── Snapshot ─────────────────────────────────────────────────────────────────

export type BrandWeek = {
  newRegistrations: number;
  totalRegistrations: number;
  newPlayers: number | null;
  totalPlayers: number | null;
  newActivated: number;
  totalActivated: number;
  newPaying: number;
  totalPaying: number;
  revenueCents: number | null;
  mrrCents: number;
  visitors: number | null;
  visitorsNote: string;
  topSources: string[];
  prospectsDiscovered: number;
  prospectsQualified: number;
  outreachSent: number;
  outreachReplies: number;
  optOuts: number;
  complaints: number;
  freeToPaidPct: number | null;
};

export type WeeklySnapshot = {
  range: WeekRange;
  lp: BrandWeek;
  vs: BrandWeek;
  prev: { lp: BrandWeek; vs: BrandWeek } | null;
  refundsCents: number | null;
  unattributedRevenueCents: number | null;
  work: string[];
  issues: string[];
  next: string[];
  ga4: "not connected";
};

type VenueRow = { id: string; createdAt: Date; vsConfig: { createdAt: Date; vsSubscriptionStatus: string | null } | null; subscriptionStatus: string | null; firstPublish: Date | null; firstLead: Date | null };

async function venueRows(): Promise<{ rows: VenueRow[]; brandOf: (v: VenueRow) => AcqBrand }> {
  const [venues, attr] = await Promise.all([
    prisma.venue.findMany({
      where: { isDisabled: false },
      select: {
        id: true, createdAt: true, subscriptionStatus: true,
        vsConfig: { select: { createdAt: true, vsSubscriptionStatus: true } },
        competitions: { where: { publishedAt: { not: null } }, select: { publishedAt: true }, orderBy: { publishedAt: "asc" }, take: 1 },
        privateEventLeads: { select: { createdAt: true }, orderBy: { createdAt: "asc" }, take: 1 },
      },
    }),
    prisma.appSetting.findMany({ where: { key: { startsWith: "acq:venue:" } }, select: { key: true, value: true } }),
  ]);
  const attrBrand = new Map<string, string>();
  for (const a of attr) {
    try {
      attrBrand.set(a.key.slice("acq:venue:".length), (JSON.parse(a.value) as { brand?: string }).brand ?? "");
    } catch {
      /* skip */
    }
  }
  const rows = venues.map((v) => ({
    id: v.id, createdAt: v.createdAt, subscriptionStatus: v.subscriptionStatus, vsConfig: v.vsConfig,
    firstPublish: v.competitions[0]?.publishedAt ?? null, firstLead: v.privateEventLeads[0]?.createdAt ?? null,
  }));
  const brandOf = (v: VenueRow): AcqBrand => {
    const a = attrBrand.get(v.id);
    if (a === "lp" || a === "vs") return a;
    return v.vsConfig && Math.abs(v.vsConfig.createdAt.getTime() - v.createdAt.getTime()) < 3_600_000 ? "vs" : "lp";
  };
  return { rows, brandOf };
}

type StripeRevenue = { lp: number; vs: number; unattributed: number; refunds: number } | null;

/** Paid invoices in [start, end) by product metadata, and refunds created in the window. */
export async function stripeWeekRevenue(start: Date, end: Date): Promise<StripeRevenue> {
  try {
    if (!process.env.STRIPE_SECRET_KEY?.trim()) return null;
    const { getStripe } = await import("@/lib/stripe/server");
    const stripe = getStripe();
    const created = { gte: Math.floor(start.getTime() / 1000), lt: Math.floor(end.getTime() / 1000) };
    const out = { lp: 0, vs: 0, unattributed: 0, refunds: 0 };
    for await (const inv of stripe.invoices.list({ status: "paid", created, limit: 100 })) {
      const i = inv as unknown as {
        amount_paid?: number;
        parent?: { subscription_details?: { metadata?: Record<string, string> } };
        subscription_details?: { metadata?: Record<string, string> };
        lines?: { data?: { metadata?: Record<string, string> }[] };
      };
      const product = i.parent?.subscription_details?.metadata?.product ?? i.subscription_details?.metadata?.product ?? i.lines?.data?.[0]?.metadata?.product;
      const amt = i.amount_paid ?? 0;
      if (product === "lp") out.lp += amt;
      else if (product === "vs") out.vs += amt;
      else out.unattributed += amt;
    }
    for await (const r of stripe.refunds.list({ created, limit: 100 })) if (r.status === "succeeded") out.refunds += r.amount;
    return out;
  } catch (err) {
    console.error("[weekly-report] Stripe revenue read failed", err);
    return null;
  }
}

async function brandWeeks(start: Date, end: Date, withRevenue: boolean) {
  await ensureAcquisitionTable();
  await ensureDailyTable();
  const { rows, brandOf } = await venueRows();
  const inRange = (d: Date | null) => !!d && d >= start && d < end;
  const before = (d: Date | null) => !!d && d < end;
  const [players, newPlayers, conversions, prospects, discovery, sessionRows, since, lpM, vsM, revenue] = await Promise.all([
    prisma.playerProfile.count({ where: { user: { createdAt: { lt: end } } } }).catch(() => null),
    prisma.playerProfile.count({ where: { user: { createdAt: { gte: start, lt: end } } } }).catch(() => null),
    prisma.appSetting.findMany({ where: { key: { startsWith: "conversion:subscription_activated:" } }, select: { key: true, value: true } }),
    prisma.acquisitionProspect.findMany({ select: { brand: true, createdAt: true, sentAt: true, repliedAt: true, status: true, updatedAt: true } }),
    prisma.acquisitionDiscovery.findMany({ where: { createdAt: { gte: start, lt: end } }, select: { brandHint: true } }).catch(() => [] as { brandHint: string }[]),
    prisma.acquisitionDaily.findMany({ where: { day: { gte: chicagoDay(start), lte: chicagoDay(new Date(end.getTime() - 1)) }, metric: "sessions" } }),
    trackingSince(),
    getLeaguePourMetrics(),
    getVenueSprocketMetrics(),
    withRevenue ? stripeWeekRevenue(start, end) : Promise.resolve(null),
  ]);
  const liveSubs = new Set<string>();
  for (const v of await prisma.venue.findMany({ where: { subscriptionStatus: { in: LIVE }, subscriptionId: { not: null } }, select: { subscriptionId: true } })) liveSubs.add(v.subscriptionId!);
  for (const c of await prisma.venueVsConfig.findMany({ where: { vsSubscriptionStatus: { in: LIVE }, vsSubscriptionId: { not: null } }, select: { vsSubscriptionId: true } })) liveSubs.add(c.vsSubscriptionId!);

  const tracked = !!since && since <= chicagoDay(start);
  const startedMidWeek = !!since && !tracked && since <= chicagoDay(new Date(end.getTime() - 1));

  const build = (brand: AcqBrand): BrandWeek => {
    const mine = rows.filter((v) => brandOf(v) === brand);
    const activation = (v: VenueRow) => (brand === "lp" ? v.firstPublish : v.firstLead);
    const paying = mine.filter((v) => LIVE.includes((brand === "lp" ? v.subscriptionStatus : v.vsConfig?.vsSubscriptionStatus) ?? "")).length;
    const newPaying = conversions.filter((c) => {
      try {
        const d = JSON.parse(c.value) as { product?: string; at?: string };
        return (d.product === "vs" ? "vs" : "lp") === brand && !!d.at && inRange(new Date(d.at)) && liveSubs.has(c.key.slice("conversion:subscription_activated:".length));
      } catch {
        return false;
      }
    }).length;
    const sess = sessionRows.filter((r) => r.brand === brand);
    const visitorsAll = sess.filter((r) => r.dim === "all").reduce((n, r) => n + r.count, 0);
    const bySource = new Map<string, number>();
    for (const r of sess) if (r.dim !== "all") bySource.set(r.dim, (bySource.get(r.dim) ?? 0) + r.count);
    const p = prospects.filter((x) => x.brand === brand);
    const totalRegistrations = mine.filter((v) => before(v.createdAt)).length;
    return {
      newRegistrations: mine.filter((v) => inRange(v.createdAt)).length,
      totalRegistrations,
      newPlayers: brand === "lp" ? newPlayers : null,
      totalPlayers: brand === "lp" ? players : null,
      newActivated: mine.filter((v) => inRange(activation(v))).length,
      totalActivated: mine.filter((v) => before(activation(v))).length,
      newPaying,
      totalPaying: paying,
      revenueCents: revenue ? revenue[brand] : null,
      mrrCents: brand === "lp" ? lpM.mrrCents : vsM.mrrCents,
      visitors: tracked || startedMidWeek ? visitorsAll : null,
      visitorsNote: tracked ? "first-party sessions" : startedMidWeek ? `counting started ${since} (partial week)` : "not tracked yet",
      topSources: [...bySource.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k} ${v}`),
      prospectsDiscovered: discovery.filter((d) => d.brandHint === brand).length,
      prospectsQualified: p.filter((x) => inRange(x.createdAt)).length,
      outreachSent: p.filter((x) => inRange(x.sentAt)).length,
      outreachReplies: p.filter((x) => inRange(x.repliedAt)).length,
      optOuts: p.filter((x) => x.status === "UNSUBSCRIBED" && inRange(x.updatedAt)).length,
      complaints: p.filter((x) => (x.status === "COMPLAINED" || x.status === "BOUNCED") && inRange(x.updatedAt)).length,
      freeToPaidPct: totalRegistrations > 0 ? Math.round((paying / totalRegistrations) * 1000) / 10 : null,
    };
  };
  return { lp: build("lp"), vs: build("vs"), revenue };
}

export async function buildWeeklySnapshot(now = new Date(), opts: { partial?: boolean; stripe?: boolean } = {}): Promise<WeeklySnapshot> {
  const range = weekRange(now, opts.partial);
  const cur = await brandWeeks(range.start, range.end, opts.stripe !== false);
  const prevStart = new Date(range.start.getTime() - 7 * DAY_MS);
  const prev = await brandWeeks(prevStart, range.start, false).catch(() => null);

  const [jobs, guides, queued] = await Promise.all([
    prisma.jobRun.findMany({ where: { job: { startsWith: "acquisition-" }, startedAt: { gte: range.start, lt: range.end } }, select: { job: true, status: true, detail: true } }),
    prisma.guide.findMany({ where: { status: "PUBLISHED", datePublished: { gte: range.start, lt: range.end } }, select: { brand: true, title: true } }).catch(() => []),
    prisma.acquisitionProspect.count({ where: { status: { in: ["QUEUED", "APPROVED"] } } }),
  ]);
  const runs = (job: string) => jobs.filter((j) => j.job === job && j.status !== "skipped").length;
  const work = [
    `${runs("acquisition-discover")} discovery run(s): ${cur.lp.prospectsDiscovered + cur.vs.prospectsDiscovered} new places found.`,
    `${cur.lp.prospectsQualified + cur.vs.prospectsQualified} prospects qualified and drafted (LP ${cur.lp.prospectsQualified}, VS ${cur.vs.prospectsQualified}).`,
    `${runs("acquisition-qualify")} existing-list qualification run(s); ${runs("acquisition-report")} daily owner report run(s).`,
    guides.length ? `Guides published: ${guides.map((g) => `${g.title} (${g.brand})`).join("; ")}.` : "No new guides published this week.",
    "Automatic cold email stayed paused; drafts wait in the approval queue.",
  ];

  const issues: string[] = [];
  for (const b of ["lp", "vs"] as AcqBrand[]) {
    const x = cur[b];
    const name = b === "lp" ? "LeaguePour" : "VenueSprocket";
    if (x.newRegistrations > 0 && x.newActivated === 0) issues.push(`${name}: ${x.newRegistrations} new signup(s) but none activated; check onboarding.`);
    if (x.totalPaying === 0) issues.push(`${name}: no paying customers yet.`);
    if (x.visitors === null) issues.push(`${name}: visitor counts not available for this whole week.`);
  }
  if (queued > 0) issues.push(`${queued} drafted prospect emails are waiting. Sending needs a separate owner authorization (scope, sender, recipient criteria, limits).`);
  issues.push("GA4 and Search Console are not connected to this report.");

  const next = [
    queued > 0 ? "Authorize (or decline) one capped outbound campaign so drafted, verified prospects can be contacted." : "Keep discovery running; review the first replies.",
    "Connect GA4/Search Console read access so traffic and search queries appear in this report.",
    cur.lp.totalActivated + cur.vs.totalActivated === 0 ? "Get the first venue activated (published competition / first inquiry) with hands-on onboarding." : "Turn activated free venues into paid with an in-app upgrade prompt at their plan limit.",
  ];

  return { range, lp: cur.lp, vs: cur.vs, prev: prev ? { lp: prev.lp, vs: prev.vs } : null, refundsCents: cur.revenue?.refunds ?? null, unattributedRevenueCents: cur.revenue?.unattributed ?? null, work, issues, next: next.slice(0, 3), ga4: "not connected" };
}

// ── Rendering ────────────────────────────────────────────────────────────────

const usd = (c: number | null) => (c === null ? "not available" : `$${(c / 100).toFixed(2)}`);

function delta(cur: number | null, prev: number | null | undefined): string {
  if (cur === null || prev === null || prev === undefined) return "";
  const d = cur - prev;
  return d === 0 ? " (=)" : ` (${d > 0 ? "+" : ""}${d})`;
}

export function weeklySubject(s: WeeklySnapshot): string {
  return `LeaguePour + VenueSprocket | Weekly Growth Report | ${s.range.label}`;
}

export function renderWeekly(s: WeeklySnapshot): string {
  const row = (label: string, f: (b: BrandWeek, p?: BrandWeek) => string) =>
    `<tr><td style="padding:5px 10px;border-bottom:1px solid #eee;">${escHtml(label)}</td><td style="padding:5px 10px;border-bottom:1px solid #eee;">${escHtml(f(s.lp, s.prev?.lp))}</td><td style="padding:5px 10px;border-bottom:1px solid #eee;">${escHtml(f(s.vs, s.prev?.vs))}</td></tr>`;
  const n = (v: number | null, note = "not tracked") => (v === null ? note : String(v));
  const table = [
    row("New registered venues", (b, p) => `${b.newRegistrations}${delta(b.newRegistrations, p?.newRegistrations)}`),
    row("Total registered venues", (b) => String(b.totalRegistrations)),
    row("New / total player accounts", (b) => (b.newPlayers === null ? "n/a (no player accounts)" : `${b.newPlayers} / ${b.totalPlayers}`)),
    row("New / total activated venues", (b, p) => `${b.newActivated}${delta(b.newActivated, p?.newActivated)} / ${b.totalActivated}`),
    row("New / total paying customers", (b, p) => `${b.newPaying}${delta(b.newPaying, p?.newPaying)} / ${b.totalPaying}`),
    row("Weekly revenue (paid invoices)", (b) => usd(b.revenueCents)),
    row("Current MRR", (b) => usd(b.mrrCents)),
    row("Free-to-paid (paying / registered)", (b) => (b.freeToPaidPct === null ? "no registrations" : `${b.freeToPaidPct}%`)),
    row("Website visitors", (b, p) => (b.visitors === null ? b.visitorsNote : `${b.visitors}${delta(b.visitors, p?.visitors)} (${b.visitorsNote})`)),
    row("Traffic sources", (b) => b.topSources.join(", ") || (b.visitors === null ? "not tracked" : "none")),
    row("Prospects discovered / qualified", (b) => `${b.prospectsDiscovered} / ${b.prospectsQualified}`),
    row("Outreach sent / replies", (b) => `${b.outreachSent} / ${b.outreachReplies} (sending requires owner authorization)`),
    row("Opt-outs / bounces+complaints", (b) => `${b.optOuts} / ${b.complaints}`),
  ].join("");
  const combined = {
    reg: s.lp.newRegistrations + s.vs.newRegistrations,
    total: s.lp.totalRegistrations + s.vs.totalRegistrations,
    paying: s.lp.totalPaying + s.vs.totalPaying,
    mrr: s.lp.mrrCents + s.vs.mrrCents,
    rev: s.lp.revenueCents === null || s.vs.revenueCents === null ? null : s.lp.revenueCents + s.vs.revenueCents + (s.unattributedRevenueCents ?? 0) - (s.refundsCents ?? 0),
    visitors: s.lp.visitors === null || s.vs.visitors === null ? null : s.lp.visitors + s.vs.visitors,
  };
  const list = (items: string[]) => `<ul>${items.map((i) => `<li>${escHtml(i)}</li>`).join("")}</ul>`;
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1f36;max-width:760px;">
<h2 style="margin:0 0 4px;">Weekly Growth Report</h2>
<p style="margin:0 0 14px;color:#555;">${escHtml(s.range.label)} (Monday-Sunday, America/Chicago). Production data; "not tracked" / "not available" means missing, not zero. Changes vs the previous week in brackets.</p>
<h3 style="margin:10px 0 4px;">Portfolio summary</h3>
<p style="margin:0 0 10px;">${combined.reg} new venue registrations (${combined.total} total) · ${combined.paying} paying customers · MRR ${usd(combined.mrr)} · net revenue this week ${usd(combined.rev)} · visitors ${n(combined.visitors)} · GA4/Search Console: not connected.</p>
<table style="border-collapse:collapse;font-size:14px;width:100%;"><tr><th style="text-align:left;padding:5px 10px;"></th><th style="text-align:left;padding:5px 10px;">LeaguePour</th><th style="text-align:left;padding:5px 10px;">VenueSprocket</th></tr>${table}</table>
<p style="font-size:12px;color:#777;">Refunds this week: ${usd(s.refundsCents)}. Revenue without a product tag: ${usd(s.unattributedRevenueCents)}. Paying counts exclude canceled and refunded subscriptions.</p>
<h3 style="margin:14px 0 4px;">Done automatically</h3>${list(s.work)}
<h3 style="margin:14px 0 4px;">Issues and opportunities</h3>${list(s.issues)}
<h3 style="margin:14px 0 4px;">Three most valuable next improvements</h3>${list(s.next)}
<p style="font-size:13px;color:#555;">Dashboard: https://leaguepour.com/internal/acquisition</p>
</body></html>`;
}

// ── Sending (one per week) ───────────────────────────────────────────────────

/** Recipients from verified configuration only: WEEKLY_REPORT_TO, else the owner allowlist. */
export function weeklyRecipients(): string[] {
  const raw = process.env.WEEKLY_REPORT_TO?.trim() || process.env.INTERNAL_OWNER_EMAILS || process.env.OWNER_EMAIL || "";
  return raw.split(",").map((v) => v.trim().toLowerCase()).filter((v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));
}

export function maskEmail(e: string): string {
  const [local, domain] = e.split("@");
  return `${local.slice(0, 1)}***@${domain}`;
}

export type WeeklyOutcome = { status: "sent" | "skipped" | "failure"; detail: string };

/**
 * Sends last week's report if it's Monday 08:00-11:59 in Chicago and this week hasn't been sent.
 * The claim row is created atomically before sending and removed again if the send fails, so a
 * later scheduled attempt the same morning retries; success leaves it in place for good.
 */
export async function sendWeeklyReportIfDue(now = new Date(), opts: { send?: typeof sendEmail; force?: boolean } = {}): Promise<WeeklyOutcome> {
  if (!(await getBoolSetting(WEEKLY_REPORT_ENABLED_KEY, true))) return { status: "skipped", detail: "Weekly report switched off." };
  if (!opts.force && (chicagoWeekday(now) !== 1 || chicagoHour(now) < 8 || chicagoHour(now) > 11)) {
    return { status: "skipped", detail: `Not Monday 8-11am Chicago (weekday ${chicagoWeekday(now)}, hour ${chicagoHour(now)}).` };
  }
  const to = weeklyRecipients();
  if (to.length === 0) return { status: "skipped", detail: "No recipient configured: set INTERNAL_OWNER_EMAILS (or WEEKLY_REPORT_TO) in the Hostinger environment." };
  const range = weekRange(now);
  const claimKey = `weekly_report_claim:${range.startDay}`;
  try {
    await prisma.appSetting.create({ data: { key: claimKey, value: `sending ${now.toISOString()}` } });
  } catch {
    return { status: "skipped", detail: `Report for week of ${range.startDay} already sent or in progress.` };
  }
  try {
    const snap = await buildWeeklySnapshot(now);
    const r = await (opts.send ?? sendEmail)({ to, subject: weeklySubject(snap), html: renderWeekly(snap), from: "LeaguePour Reports <hello@leaguepour.com>", brand: "lp" });
    if (!r.ok) throw new Error(r.error ?? "send failed");
    await prisma.appSetting.update({ where: { key: claimKey }, data: { value: `sent ${new Date().toISOString()}` } });
    await prisma.appSetting.upsert({
      where: { key: `weekly_report:${range.startDay}` },
      create: { key: `weekly_report:${range.startDay}`, value: JSON.stringify({ label: range.label, lp: snap.lp, vs: snap.vs, sentAt: new Date().toISOString(), recipients: to.length }) },
      update: { value: JSON.stringify({ label: range.label, lp: snap.lp, vs: snap.vs, sentAt: new Date().toISOString(), recipients: to.length }) },
    });
    return { status: "sent", detail: `Weekly report ${range.label} sent to ${to.map(maskEmail).join(", ")}.` };
  } catch (err) {
    await prisma.appSetting.deleteMany({ where: { key: claimKey, value: { startsWith: "sending" } } });
    return { status: "failure", detail: `Weekly report failed (will retry at the next scheduled attempt): ${err instanceof Error ? err.message : String(err)}` };
  }
}

/** Week history for the dashboard (newest first). */
export async function weeklyHistory(limit = 12) {
  const rows = await prisma.appSetting.findMany({ where: { key: { startsWith: "weekly_report:" } }, orderBy: { key: "desc" }, take: limit });
  return rows.flatMap((r) => {
    try {
      const v = JSON.parse(r.value) as { label: string; lp: BrandWeek; vs: BrandWeek; sentAt: string; recipients: number };
      return [{ week: r.key.slice("weekly_report:".length), ...v }];
    } catch {
      return [];
    }
  });
}

export async function weeklyReportEnabled(): Promise<boolean> {
  return (await getSetting(WEEKLY_REPORT_ENABLED_KEY, "true")) === "true";
}
