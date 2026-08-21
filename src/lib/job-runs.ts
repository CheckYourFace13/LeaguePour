/**
 * Durable run history for scheduled jobs. Every cron/background job should call
 * runJob() around its actual work so "is this job healthy" is a query against JobRun
 * instead of a grep through console logs - and so a stalled/never-finished run is
 * detectable (finishedAt stays null) instead of silently vanishing.
 */
import { prisma } from "@/lib/db";

export type JobStatus = "success" | "partial" | "failure" | "skipped";

/** Runs `fn`, recording a JobRun row for it. Re-throws whatever `fn` throws after recording failure. */
export async function runJob<T>(
  job: string,
  fn: () => Promise<{ status: JobStatus; detail?: string; result: T }>,
): Promise<T> {
  const run = await prisma.jobRun.create({ data: { job, status: "running" } });
  try {
    const { status, detail, result } = await fn();
    await prisma.jobRun.update({
      where: { id: run.id },
      data: { status, detail, finishedAt: new Date() },
    });
    return result;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    await prisma.jobRun.update({
      where: { id: run.id },
      data: { status: "failure", detail, finishedAt: new Date() },
    });
    throw err;
  }
}

export async function getLatestJobRun(job: string) {
  return prisma.jobRun.findFirst({
    where: { job },
    orderBy: { startedAt: "desc" },
  });
}

/** Most recent run per job, for the owner dashboard's system-health section. */
export async function getLatestJobRuns(jobs: string[]) {
  const rows = await Promise.all(jobs.map((job) => getLatestJobRun(job)));
  return Object.fromEntries(jobs.map((job, i) => [job, rows[i]]));
}

/** True if `job`'s most recent run finished more than `hours` ago (or never ran) - a stall signal. */
export async function isJobStale(job: string, hours: number): Promise<boolean> {
  const latest = await getLatestJobRun(job);
  if (!latest) return true;
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return latest.startedAt.getTime() < cutoff;
}
