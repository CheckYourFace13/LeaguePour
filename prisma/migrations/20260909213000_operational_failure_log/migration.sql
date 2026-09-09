-- Purely additive. New table only - see OperationalFailure's doc comment in schema.prisma.
CREATE TABLE IF NOT EXISTS "leaguepour_lp"."OperationalFailure" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "venueId" TEXT,
    "detail" TEXT,
    "retryable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationalFailure_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "OperationalFailure_category_createdAt_idx" ON "leaguepour_lp"."OperationalFailure"("category", "createdAt");
