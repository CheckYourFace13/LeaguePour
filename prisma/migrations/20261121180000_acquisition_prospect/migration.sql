-- 30-day acquisition program: researched prospects + owner approval queue. Purely additive.
-- The same DDL runs idempotently at runtime from src/lib/acquisition/store.ts.
CREATE TABLE IF NOT EXISTS "leaguepour_lp"."AcquisitionProspect" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "website" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "sourceNote" TEXT NOT NULL,
    "relevance" TEXT NOT NULL,
    "useCase" TEXT NOT NULL,
    "offer" TEXT NOT NULL,
    "contactRoute" TEXT NOT NULL,
    "contactValue" TEXT,
    "email" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "suppressReason" TEXT,
    "draftSubject" TEXT NOT NULL,
    "draftBody" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "outreachContactId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "resendId" TEXT,
    "sendError" TEXT,
    "repliedAt" TIMESTAMP(3),
    "firstVisitAt" TIMESTAMP(3),
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "signedUpVenueId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AcquisitionProspect_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AcquisitionProspect_dedupeKey_key" ON "leaguepour_lp"."AcquisitionProspect"("dedupeKey");
CREATE UNIQUE INDEX IF NOT EXISTS "AcquisitionProspect_token_key" ON "leaguepour_lp"."AcquisitionProspect"("token");
CREATE INDEX IF NOT EXISTS "AcquisitionProspect_brand_status_idx" ON "leaguepour_lp"."AcquisitionProspect"("brand", "status");
CREATE INDEX IF NOT EXISTS "AcquisitionProspect_email_idx" ON "leaguepour_lp"."AcquisitionProspect"("email");
