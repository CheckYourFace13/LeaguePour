/**
 * First-party daily acquisition counters (aggregated; no IP, user agent or user id is stored).
 * Marketing-site sessions per brand and per source come from the AcquisitionCapture beacon
 * (one per browser session). GA4 stays the richer source, but it is not readable from here, so
 * these counters are what the dashboard and daily report can show as real numbers.
 *
 * Zero vs missing: a day before `trackingSince()` has NO data (shown as "-"); a tracked day with
 * no rows is a real 0.
 */
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/app-settings";
import { chicagoDay, type AcqBrand } from "./program";

const DDL = `CREATE TABLE IF NOT EXISTS "leaguepour_lp"."AcquisitionDaily" (
  "day" TEXT NOT NULL, "brand" TEXT NOT NULL, "metric" TEXT NOT NULL, "dim" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "AcquisitionDaily_pkey" PRIMARY KEY ("day", "brand", "metric", "dim"))`;

const TRACKING_SINCE_KEY = "acq_visit_tracking_since";

let ensured = false;
export async function ensureDailyTable(): Promise<void> {
  if (ensured) return;
  await prisma.$executeRawUnsafe(DDL);
  ensured = true;
}

/** Source label for a session: utm_source, else external referrer host, else "direct". */
export function sourceLabel(input: { source?: string | null; referrerHost?: string | null }): string {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 40);
  if (input.source && clean(input.source)) return clean(input.source);
  if (input.referrerHost && clean(input.referrerHost)) return `ref:${clean(input.referrerHost)}`;
  return "direct";
}

/** Atomic increment of one counter (and records the first tracked day once). */
export async function incrementDaily(brand: AcqBrand, metric: string, dim: string, now = new Date()): Promise<void> {
  await ensureDailyTable();
  const day = chicagoDay(now);
  await prisma.$executeRaw`
    INSERT INTO "leaguepour_lp"."AcquisitionDaily" ("day", "brand", "metric", "dim", "count")
    VALUES (${day}, ${brand}, ${metric}, ${dim}, 1)
    ON CONFLICT ("day", "brand", "metric", "dim") DO UPDATE SET "count" = "AcquisitionDaily"."count" + 1`;
  if ((await getSetting(TRACKING_SINCE_KEY, "")) === "") {
    await prisma.appSetting.createMany({ data: [{ key: TRACKING_SINCE_KEY, value: day }], skipDuplicates: true });
  }
}

export async function trackingSince(): Promise<string | null> {
  const v = await getSetting(TRACKING_SINCE_KEY, "");
  return v || null;
}

/** Test helper / owner reset: forget the tracking start (counters themselves are kept). */
export async function resetTrackingSince(): Promise<void> {
  await prisma.appSetting.deleteMany({ where: { key: TRACKING_SINCE_KEY } });
}

export type DailyRow = { day: string; brand: string; metric: string; dim: string; count: number };

export async function dailyRows(fromDay: string): Promise<DailyRow[]> {
  await ensureDailyTable();
  return prisma.acquisitionDaily.findMany({ where: { day: { gte: fromDay } } });
}

/** The last `n` Chicago days, newest first (YYYY-MM-DD). */
export function lastDays(n: number, now = new Date()): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(chicagoDay(new Date(now.getTime() - i * 24 * 60 * 60 * 1000)));
  return [...new Set(out)];
}
