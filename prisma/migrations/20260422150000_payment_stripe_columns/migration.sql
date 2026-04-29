-- Stripe-backed payment metadata (LeaguePour Payment model)
ALTER TABLE "leaguepour_lp"."Payment" ADD COLUMN "providerCheckoutSessionId" TEXT;
ALTER TABLE "leaguepour_lp"."Payment" ADD COLUMN "providerPaymentIntentId" TEXT;
ALTER TABLE "leaguepour_lp"."Payment" ADD COLUMN "providerCustomerId" TEXT;
ALTER TABLE "leaguepour_lp"."Payment" ADD COLUMN "paidAt" TIMESTAMP(3);
ALTER TABLE "leaguepour_lp"."Payment" ADD COLUMN "refundedAt" TIMESTAMP(3);
ALTER TABLE "leaguepour_lp"."Payment" ADD COLUMN "lastWebhookEventId" TEXT;

CREATE UNIQUE INDEX "Payment_providerCheckoutSessionId_key" ON "leaguepour_lp"."Payment"("providerCheckoutSessionId");
CREATE UNIQUE INDEX "Payment_providerPaymentIntentId_key" ON "leaguepour_lp"."Payment"("providerPaymentIntentId");
