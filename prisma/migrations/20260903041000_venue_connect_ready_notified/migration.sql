-- Purely additive. Doubles as the owner-notification dedup key for the account.updated webhook
-- - see Venue.stripeConnectReadyNotifiedAt's doc comment in schema.prisma.
ALTER TABLE "leaguepour_lp"."Venue" ADD COLUMN IF NOT EXISTS "stripeConnectReadyNotifiedAt" TIMESTAMP(3);
