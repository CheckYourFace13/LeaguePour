-- Automated prospect discovery: one row per Google place ID checked. Additive only; the same DDL
-- runs idempotently at runtime (src/lib/acquisition/discover.ts).
CREATE TABLE IF NOT EXISTS "leaguepour_lp"."AcquisitionDiscovery" (
    "placeId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "brandHint" TEXT NOT NULL,
    "organizer" BOOLEAN NOT NULL DEFAULT false,
    "website" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "detail" TEXT,
    "prospectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedAt" TIMESTAMP(3),
    CONSTRAINT "AcquisitionDiscovery_pkey" PRIMARY KEY ("placeId")
);
CREATE INDEX IF NOT EXISTS "AcquisitionDiscovery_status_idx" ON "leaguepour_lp"."AcquisitionDiscovery"("status");
