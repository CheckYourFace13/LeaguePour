-- Aggregated daily acquisition counters + per-contact qualification scan markers. Additive only.
-- The same DDL runs idempotently at runtime (src/lib/acquisition/daily.ts, qualify.ts).
CREATE TABLE IF NOT EXISTS "leaguepour_lp"."AcquisitionDaily" (
    "day" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "dim" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "AcquisitionDaily_pkey" PRIMARY KEY ("day", "brand", "metric", "dim")
);
CREATE TABLE IF NOT EXISTS "leaguepour_lp"."AcquisitionScan" (
    "contactId" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT NOT NULL,
    CONSTRAINT "AcquisitionScan_pkey" PRIMARY KEY ("contactId")
);
