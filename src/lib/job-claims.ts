/**
 * Cross-instance claims for scheduled jobs. Production can run several Node instances of this app
 * at once (each with its own in-process scheduler - see scheduler.ts), and an in-memory "already
 * fired today" flag only covers one instance. A claim is a row in AppSetting keyed by job + slot
 * (UTC date): inserting it is atomic in Postgres (primary-key uniqueness), so exactly one instance
 * wins a given slot no matter how many try at once. No schema change - AppSetting already exists.
 *
 * Lifecycle:
 *  - claim: insert {state: "running", owner}. A unique-violation means another instance has it.
 *  - finish: the route responded (ok or not) - the job ran, so it is not retried this slot.
 *  - release: the request never got a response (both loopback and public fetch threw), so the job
 *    did not run - the owner deletes its own claim and a later tick/instance may retry in-window.
 *  - crash while running: the claim stays "running" and the slot is skipped (fail-safe: no
 *    duplicate run). It is visible in AppSetting for review and pruned after CLAIM_RETENTION_DAYS.
 */
import { prisma } from "@/lib/db";

const PREFIX = "job_claim:";
const CLAIM_RETENTION_DAYS = 14;

export function claimKey(job: string, slot: string): string {
  return `${PREFIX}${job}:${slot}`;
}

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; message?: string; cause?: { code?: string } } | null;
  return e?.code === "P2002" || e?.cause?.code === "23505" || /Unique constraint|duplicate key/i.test(e?.message ?? "");
}

/** True if this owner now holds the slot. Throws on database errors (callers must not run the job then). */
export async function claimScheduledRun(job: string, slot: string, owner: string): Promise<boolean> {
  try {
    await prisma.appSetting.create({
      data: { key: claimKey(job, slot), value: JSON.stringify({ state: "running", owner, at: new Date().toISOString() }) },
    });
    return true;
  } catch (err) {
    if (isUniqueViolation(err)) return false;
    throw err;
  }
}

/** Marks the owner's claim finished. Only the owner's own "running" claim is updated. */
export async function finishScheduledRun(job: string, slot: string, owner: string, outcome: string): Promise<void> {
  await prisma.appSetting.updateMany({
    where: { key: claimKey(job, slot), value: { contains: `"owner":${JSON.stringify(owner)}` } },
    data: { value: JSON.stringify({ state: "done", owner, at: new Date().toISOString(), outcome: outcome.slice(0, 300) }) },
  });
}

/** Deletes the owner's claim so the slot can be retried. Never touches another owner's claim. */
export async function releaseScheduledRun(job: string, slot: string, owner: string): Promise<void> {
  await prisma.appSetting.deleteMany({
    where: { key: claimKey(job, slot), value: { contains: `"owner":${JSON.stringify(owner)}` } },
  });
}

/** Removes claims older than the retention window. Safe to call from any instance. */
export async function pruneScheduledClaims(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - CLAIM_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const { count } = await prisma.appSetting.deleteMany({
    where: { key: { startsWith: PREFIX }, updatedAt: { lt: cutoff } },
  });
  return count;
}

/**
 * Route-level execution claim for scheduler-triggered runs. The scheduler's own claim (above) only
 * stops two instances from CALLING a job; it can't tell whether a call whose response was lost (a
 * timeout, or a 502/503/504 from the hosting edge) actually executed. So the route claims the slot
 * itself, atomically, before doing any work, and that claim is never released: a retry for the same
 * slot - after a lost response, from any instance - gets "already executed" instead of re-running
 * side effects. A crash mid-run leaves the slot claimed (skipped, not duplicated).
 *
 * Only applies when the request is authenticated with CRON_SECRET and carries a slot (header
 * x-scheduler-slot or ?scheduler_slot=YYYY-MM-DD, sent by scheduler.ts). Manual runs and the
 * GitHub workflows send no slot and behave exactly as before.
 */
export const SCHEDULER_SLOT_HEADER = "x-scheduler-slot";
export const SCHEDULER_SLOT_PARAM = "scheduler_slot";

export function withScheduledSlot(job: string, handler: (request: Request) => Promise<Response>) {
  return async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const slot = (request.headers.get(SCHEDULER_SLOT_HEADER) ?? url.searchParams.get(SCHEDULER_SLOT_PARAM) ?? "").trim();
    if (!slot) return handler(request);

    const secret = process.env.CRON_SECRET?.trim();
    const given = url.searchParams.get("secret") ?? request.headers.get("authorization")?.replace("Bearer ", "");
    // Unauthenticated: never create a claim (that would let anyone block a job) - the handler's own
    // auth check rejects it.
    if (!secret || given !== secret) return handler(request);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(slot)) {
      return Response.json({ ok: false, error: "Invalid scheduler slot." }, { status: 400 });
    }

    const execJob = `exec:${job}`;
    const owner = `${process.pid}-${Math.random().toString(36).slice(2, 10)}`;
    if (!(await claimScheduledRun(execJob, slot, owner))) {
      return Response.json({ ok: true, skipped: `Already executed for scheduler slot ${slot}.` });
    }
    try {
      const res = await handler(request);
      await finishScheduledRun(execJob, slot, owner, `HTTP ${res.status}`).catch(() => {});
      return res;
    } catch (err) {
      await finishScheduledRun(execJob, slot, owner, `threw: ${err instanceof Error ? err.message : String(err)}`).catch(() => {});
      throw err;
    }
  };
}
