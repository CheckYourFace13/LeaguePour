-- Small key/value settings store for instant-toggle flags (e.g. the VenueSprocket outreach
-- kill switch) that shouldn't require a code deploy to flip.
CREATE TABLE IF NOT EXISTS "leaguepour_lp"."AppSetting" (
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);
