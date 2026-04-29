-- Venue onboarding + Stripe Connect scaffolding
CREATE TYPE "leaguepour_lp"."BillingPlan" AS ENUM ('STARTER', 'STANDARD', 'PRO', 'MAX');

ALTER TABLE "leaguepour_lp"."Venue"
  ADD COLUMN "formattedAddress" TEXT,
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION,
  ADD COLUMN "googlePlaceId" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "websiteUrl" TEXT,
  ADD COLUMN "instagramUrl" TEXT,
  ADD COLUMN "facebookUrl" TEXT,
  ADD COLUMN "xUrl" TEXT,
  ADD COLUMN "tiktokUrl" TEXT,
  ADD COLUMN "billingPlan" "leaguepour_lp"."BillingPlan" NOT NULL DEFAULT 'STARTER',
  ADD COLUMN "platformFeeBps" INTEGER NOT NULL DEFAULT 900,
  ADD COLUMN "stripeAccountId" TEXT,
  ADD COLUMN "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "stripeDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "Venue_googlePlaceId_key" ON "leaguepour_lp"."Venue"("googlePlaceId");
CREATE UNIQUE INDEX "Venue_stripeAccountId_key" ON "leaguepour_lp"."Venue"("stripeAccountId");
