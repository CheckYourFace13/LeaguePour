/**
 * In-process cron scheduler.
 *
 * Root cause this exists to work around: Hostinger's CDN (hcdn) started serving a JS
 * bot-challenge page instead of the real response to requests that carry GitHub Actions
 * runners' IP/fingerprint - reproduced live 2026-08-30 (GitHub Actions run 33336656058 against
 * /api/cron/lp-lifecycle got the challenge HTML; the exact same route hit from a plain curl
 * moments earlier, and this developer's own IP, got the real JSON response). The challenge is
 * served by the CDN edge before the request ever reaches this app - no application code (the
 * CRON_SECRET check included) runs for a challenged request, so nothing in this codebase alone
 * can fix it, and per published reports this specific Hostinger protection layer isn't exposed
 * as a configurable allow-list even in hPanel on shared/web-app hosting tiers.
 *
 * The fix: don't rely on an external service reaching these routes over the public internet at
 * all. This server (Next.js `output: "standalone"`, run as a persistent `node server.js`
 * process - not per-request serverless) triggers its own cron routes via a loopback fetch to
 * 127.0.0.1 first - a loopback request never leaves the machine, so it never reaches the CDN
 * edge and can never be challenged. Each route's own auth (CRON_SECRET) and business logic
 * (throttles, time windows, JobRun records) run completely unchanged - this only replaces how
 * the request arrives, not what happens once it does.
 *
 * Live evidence (scheduler-status, 2026-09-02) showed the scheduler DOES fire correctly on
 * schedule - all 6 jobs' lastRun timestamps matched their configured times exactly - but every
 * single loopback attempt threw "fetch failed": this hosting environment's actual internal
 * networking doesn't work the way a bare 127.0.0.1:$PORT guess assumes (unknown exact reason
 * without shell/console access - possibly a proxy layer even for intra-container traffic, or a
 * different bound interface/port than assumed). So this falls back to the public HTTPS domain
 * when loopback fails. That's a real, working path in practice: every request this session that
 * hit the CDN's bot-challenge was GitHub-Actions-runner-originated; this server's own outbound
 * call to its own public domain (from the origin's own IP, not an external datacenter range)
 * has never once been challenged in any test this pass.
 *
 * The GitHub Actions workflows are left in place as manual-dispatch/observability tools.
 */

type ScheduledJob = {
  path: string;
  utcHour: number;
  utcMinute: number;
  /** Restrict to specific UTC weekdays (0=Sun..6=Sat). Omit to fire every day. */
  daysOfWeekUtc?: number[];
  /** Restrict to a specific UTC day-of-month (1-28, keep <=28 so it always exists). Omit for daily/weekly jobs. */
  dayOfMonthUtc?: number;
};

// Mirrors the exact schedule in .github/workflows/*.yml. vs-eligibility-backfill is
// deliberately NOT included - it's a manual-only admin tool (see its own route doc comment);
// its backlog-clearing already happens automatically as a phase inside outreach-send below.
const JOBS: ScheduledJob[] = [
  { path: "/api/cron/lp-lifecycle", utcHour: 14, utcMinute: 0 }, // lp-lifecycle-daily.yml
  { path: "/api/cron/vs-lifecycle", utcHour: 14, utcMinute: 30 }, // vs-lifecycle-daily.yml
  { path: "/api/cron/outreach-send", utcHour: 15, utcMinute: 0 }, // outreach-daily.yml
  { path: "/api/cron/vs-outreach-send", utcHour: 16, utcMinute: 0 }, // vs-outreach-daily.yml
  { path: "/api/cron/indexnow-submit", utcHour: 12, utcMinute: 0 }, // indexnow-daily.yml
  // db-heartbeat.yml runs every 3 days; a read-only `SELECT now()` has no meaningful cost, so
  // this runs it daily instead - strictly more margin against Supabase auto-pause, not less.
  { path: "/api/cron/supabase-heartbeat", utcHour: 6, utcMinute: 0 },
  // Content engine (see src/lib/content-engine/**) - VenueSprocket 3x/week (Mon/Wed/Fri),
  // LeaguePour 2x/week (Tue/Thu). Never generates an article body itself: each run either
  // publishes one already-written, already-passing queued article, or queues the next topic's
  // brief/outline with no body. runContentEngine() also enforces the weekly cap and topic-backlog
  // exhaustion, so this schedule is a ceiling, not a guarantee - a run can no-op and that's
  // expected, not a failure.
  { path: "/api/cron/content-engine-vs", utcHour: 13, utcMinute: 0, daysOfWeekUtc: [1, 3, 5] },
  { path: "/api/cron/content-engine-lp", utcHour: 13, utcMinute: 30, daysOfWeekUtc: [2, 4] },
  // Monthly content decay/refresh pass for both brands - see refresh.ts.
  { path: "/api/cron/content-refresh", utcHour: 5, utcMinute: 0, dayOfMonthUtc: 1 },
];

const TICK_MS = 5 * 60 * 1000;
const WINDOW_MINUTES = 5; // fire if now falls within [target, target + WINDOW_MINUTES)
const firedToday = new Map<string, string>(); // job path -> UTC date string ("YYYY-MM-DD") last fired
let started = false;

// Status is ALSO persisted to AppSetting (not just kept in this module's own memory) - Next's
// standalone output bundles each route somewhat independently, so a route handler importing
// this module via a different path (e.g. the "@/" alias vs. instrumentation.ts's relative
// import) is not guaranteed to share this module's in-memory state even within the same
// process (confirmed live: register() ran successfully and presumably called
// startInProcessScheduler(), but a status route reading via a separate import saw started as
// still false). The scheduler's own tick loop below is unaffected by this - it's a pure
// observability concern - but external routes need a shared source of truth to report on it,
// and Postgres already proved reliable for that (see instrumentation.ts's own entered/error
// markers).
async function persistStatus(key: string, value: string): Promise<void> {
  try {
    const { setSetting } = await import("./app-settings");
    await setSetting(key, value);
  } catch (err) {
    console.error(`[scheduler] failed to persist ${key}`, err);
  }
}

function utcDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isDue(job: ScheduledJob, now: Date): boolean {
  const today = utcDateString(now);
  if (firedToday.get(job.path) === today) return false;
  if (job.daysOfWeekUtc && !job.daysOfWeekUtc.includes(now.getUTCDay())) return false;
  if (job.dayOfMonthUtc && now.getUTCDate() !== job.dayOfMonthUtc) return false;
  const minutesNow = now.getUTCHours() * 60 + now.getUTCMinutes();
  const minutesTarget = job.utcHour * 60 + job.utcMinute;
  return minutesNow >= minutesTarget && minutesNow < minutesTarget + WINDOW_MINUTES;
}

async function attemptFetch(url: string, secret: string): Promise<{ ok: boolean; summary: string }> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const body = await res.json().catch(() => null);
  const ok = res.ok && body?.ok !== false;
  return { ok, summary: `HTTP ${res.status} ${JSON.stringify(body)}`.slice(0, 500) };
}

async function runJob(loopbackBase: string, publicBase: string, secret: string, job: ScheduledJob): Promise<void> {
  let outcome = "";
  try {
    const { ok, summary } = await attemptFetch(`${loopbackBase}${job.path}`, secret);
    outcome = `loopback: ${summary}`;
    if (ok) {
      console.log(`[scheduler] ${job.path} ok via loopback`, summary);
      await persistStatus(`scheduler_last_run${job.path.replace(/\//g, "_")}`, `${new Date().toISOString()} ${outcome}`);
      return;
    }
    console.warn(`[scheduler] ${job.path} loopback returned non-ok, trying public domain`, summary);
  } catch (err) {
    outcome = `loopback threw: ${err instanceof Error ? err.message : String(err)}`.slice(0, 500);
    console.warn(`[scheduler] ${job.path} loopback failed, trying public domain`, err);
  }

  try {
    const { ok, summary } = await attemptFetch(`${publicBase}${job.path}`, secret);
    outcome += ` | public: ${summary}`;
    if (ok) {
      console.log(`[scheduler] ${job.path} ok via public domain`, summary);
    } else {
      console.warn(`[scheduler] ${job.path} public domain also returned non-ok`, summary);
    }
  } catch (err) {
    outcome += ` | public threw: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[scheduler] ${job.path} failed on both loopback and public domain`, err);
  }
  await persistStatus(`scheduler_last_run${job.path.replace(/\//g, "_")}`, `${new Date().toISOString()} ${outcome}`.slice(0, 900));
}

async function tick(loopbackBase: string, publicBase: string, secret: string): Promise<void> {
  const now = new Date();
  await persistStatus("scheduler_last_tick", now.toISOString());
  for (const job of JOBS) {
    if (!isDue(job, now)) continue;
    firedToday.set(job.path, utcDateString(now));
    await runJob(loopbackBase, publicBase, secret, job);
  }
}

export function startInProcessScheduler(): void {
  // Never in the edge runtime - see instrumentation.ts. No timers, no fetches, no status writes.
  if (process.env.NEXT_RUNTIME === "edge") return;
  if (started) return;
  started = true;
  void persistStatus("scheduler_started_at", new Date().toISOString());

  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    console.warn("[scheduler] CRON_SECRET not set - in-process job scheduler disabled");
    return;
  }
  const port = process.env.PORT?.trim() || "3000";
  const loopbackBase = `http://127.0.0.1:${port}`;
  const publicBase = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") || "https://leaguepour.com";

  // Staggered first tick so this never competes with the server's own startup work.
  setTimeout(() => void tick(loopbackBase, publicBase, secret), 30_000);
  setInterval(() => void tick(loopbackBase, publicBase, secret), TICK_MS);
  setTimeout(() => void publishAuthoredOnBoot(), 60_000);
  console.log(`[scheduler] in-process cron scheduler started (${JOBS.length} jobs, ${TICK_MS / 60000}min tick)`);
}

/**
 * Repo-authored guide bodies (content-engine/authored) only ever arrive with a deploy, so publish
 * any that are ready once per boot instead of waiting for the next Mon/Wed/Fri (VS) or Tue/Thu (LP)
 * slot. publishAuthoredNow() runs the normal engine step with publishOnly - same quality gates,
 * weekly cap, and kill switch, and it never queues a new topic - so a boot with nothing ready is a
 * no-op.
 */
async function publishAuthoredOnBoot(): Promise<void> {
  try {
    const { publishAuthoredNow } = await import("./content-engine/publish");
    for (const brand of ["VS", "LP"] as const) {
      const outcomes = await publishAuthoredNow(brand);
      const summary = outcomes
        .map((o) => (o.status === "skipped" ? `skipped (${o.reason})` : `${o.status}: ${o.title}`))
        .join("; ");
      console.log(`[scheduler] boot publish ${brand}: ${summary}`);
      await persistStatus(`content_engine_boot_publish_${brand}`, `${new Date().toISOString()} ${summary}`.slice(0, 900));
    }
  } catch (err) {
    console.error("[scheduler] boot publish failed", err);
  }
}
