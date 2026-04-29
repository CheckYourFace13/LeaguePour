-- Connect marketplace snapshot on entry-fee payments (audit + admin clarity)
ALTER TABLE "leaguepour_lp"."Payment" ADD COLUMN "stripeApplicationFeeCents" INTEGER;
ALTER TABLE "leaguepour_lp"."Payment" ADD COLUMN "stripeConnectDestinationId" TEXT;
ALTER TABLE "leaguepour_lp"."Payment" ADD COLUMN "platformFeeBpsSnapshot" INTEGER;
