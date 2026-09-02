-- OutreachContact has zero indexes beyond @id and the placeId unique constraint, despite every
-- automated cron job (harvest, LP send, VS send, VS eligibility backfill) filtering repeatedly
-- on status/email/emailCheckedAt/vsEligible/vsStatus/vsEligibilityNote/website against a
-- multi-thousand-row table, several times a day. Purely additive, no data touched.
CREATE INDEX IF NOT EXISTS "OutreachContact_status_email_emailCheckedAt_idx"
  ON "leaguepour_lp"."OutreachContact" ("status", "email", "emailCheckedAt");

CREATE INDEX IF NOT EXISTS "OutreachContact_vsEligible_vsStatus_idx"
  ON "leaguepour_lp"."OutreachContact" ("vsEligible", "vsStatus");

CREATE INDEX IF NOT EXISTS "OutreachContact_website_emailCheckedAt_vsEligibilityNote_idx"
  ON "leaguepour_lp"."OutreachContact" ("website", "emailCheckedAt", "vsEligibilityNote");
