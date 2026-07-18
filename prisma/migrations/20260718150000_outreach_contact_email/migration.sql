-- Harvested outreach emails (Google Places provides no email addresses)
ALTER TABLE "leaguepour_lp"."OutreachContact" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "leaguepour_lp"."OutreachContact" ADD COLUMN IF NOT EXISTS "emailCheckedAt" TIMESTAMP(3);
