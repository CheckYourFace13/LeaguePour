-- Automatic content engine: topics are queued and published automatically, but article bodies
-- are never machine-generated - see src/lib/content-engine/**. Purely additive - two new enum
-- types and one new table, no existing table touched.
CREATE TYPE "leaguepour_lp"."ContentBrand" AS ENUM ('LP', 'VS');
CREATE TYPE "leaguepour_lp"."GuideStatus" AS ENUM ('NEEDS_CONTENT', 'PUBLISHED');

CREATE TABLE "leaguepour_lp"."Guide" (
    "id" TEXT NOT NULL,
    "brand" "leaguepour_lp"."ContentBrand" NOT NULL,
    "slug" TEXT NOT NULL,
    "topicKey" TEXT NOT NULL,
    "status" "leaguepour_lp"."GuideStatus" NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "faq" JSONB,
    "searchIntent" TEXT,
    "outline" JSONB,
    "relatedPages" JSONB,
    "suggestedCta" TEXT,
    "priorityScore" INTEGER NOT NULL DEFAULT 0,
    "rejectReason" TEXT,
    "datePublished" TIMESTAMP(3),
    "dateModified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Guide_brand_slug_key" ON "leaguepour_lp"."Guide"("brand", "slug");
CREATE UNIQUE INDEX "Guide_brand_topicKey_key" ON "leaguepour_lp"."Guide"("brand", "topicKey");
CREATE INDEX "Guide_brand_status_idx" ON "leaguepour_lp"."Guide"("brand", "status");
