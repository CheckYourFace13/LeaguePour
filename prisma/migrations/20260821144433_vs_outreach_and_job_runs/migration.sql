-- Adds VenueSprocket outreach tracking to the existing OutreachContact table (one row per
-- business serves both cold-outreach campaigns, so cross-brand suppression is a single-row
-- check rather than a join), plus a durable JobRun log so scheduled-job health is queryable
-- instead of living only in console logs.
ALTER TABLE "leaguepour_lp"."OutreachContact" ADD COLUMN IF NOT EXISTS "vsEligible" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "leaguepour_lp"."OutreachContact" ADD COLUMN IF NOT EXISTS "vsEligibilityNote" TEXT;
ALTER TABLE "leaguepour_lp"."OutreachContact" ADD COLUMN IF NOT EXISTS "vsStatus" TEXT;
ALTER TABLE "leaguepour_lp"."OutreachContact" ADD COLUMN IF NOT EXISTS "vsEmailSentAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "leaguepour_lp"."JobRun" (
  "id" TEXT NOT NULL,
  "job" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "detail" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  CONSTRAINT "JobRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "JobRun_job_startedAt_idx" ON "leaguepour_lp"."JobRun" ("job", "startedAt");
