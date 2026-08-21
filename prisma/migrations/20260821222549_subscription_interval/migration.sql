-- Tracks billing interval (monthly vs annual) per subscription, so MRR can divide annual
-- prices by 12 instead of assuming every active subscriber pays the monthly rate. Null for
-- subscriptions created before this was tracked - MRR falls back to a monthly assumption for
-- those specifically, not for every subscriber.
ALTER TABLE "leaguepour_lp"."Venue" ADD COLUMN IF NOT EXISTS "subscriptionInterval" TEXT;
ALTER TABLE "leaguepour_lp"."VenueVsConfig" ADD COLUMN IF NOT EXISTS "vsSubscriptionInterval" TEXT;
