-- Purely additive. Records when a VS deposit refund was confirmed by Stripe - see
-- VsPayment.refundedAt's doc comment in schema.prisma and src/lib/actions/vs-deposit-refund.ts.
ALTER TABLE "leaguepour_lp"."VsPayment" ADD COLUMN IF NOT EXISTS "refundedAt" TIMESTAMP(3);
