-- Fixes a P0 revenue defect: VenueSprocket subscriptions were writing their Stripe
-- subscription id/status/period-end into Venue.subscriptionId etc, the same fields
-- LeaguePour's subscription uses. A venue with both an active LP and an active VS
-- subscription would have one silently overwrite the other's tracked state whenever
-- either product's webhook fired. These new columns give VenueSprocket its own
-- subscription-tracking slot, independent of LeaguePour's.
ALTER TABLE "leaguepour_lp"."VenueVsConfig" ADD COLUMN IF NOT EXISTS "vsSubscriptionId" TEXT;
ALTER TABLE "leaguepour_lp"."VenueVsConfig" ADD COLUMN IF NOT EXISTS "vsSubscriptionStatus" TEXT;
ALTER TABLE "leaguepour_lp"."VenueVsConfig" ADD COLUMN IF NOT EXISTS "vsSubscriptionPeriodEnd" TIMESTAMP(3);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'VenueVsConfig_vsSubscriptionId_key'
  ) THEN
    ALTER TABLE "leaguepour_lp"."VenueVsConfig" ADD CONSTRAINT "VenueVsConfig_vsSubscriptionId_key" UNIQUE ("vsSubscriptionId");
  END IF;
END $$;
