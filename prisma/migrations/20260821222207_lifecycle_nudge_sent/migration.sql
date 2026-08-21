-- Dedup record so a lifecycle nudge email fires at most once per subject.
CREATE TABLE IF NOT EXISTS "leaguepour_lp"."LifecycleNudgeSent" (
  "key" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LifecycleNudgeSent_pkey" PRIMARY KEY ("key")
);
