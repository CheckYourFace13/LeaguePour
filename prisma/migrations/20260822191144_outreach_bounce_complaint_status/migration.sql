-- Adds BOUNCED/COMPLAINED states so a hard bounce or spam complaint (from either outreach lane -
-- OutreachStatus is shared by status and vsStatus) permanently suppresses future cold email to
-- that address, the same way NOT_INTERESTED (unsubscribe) already does - both send queries only
-- ever select NOT_CONTACTED (LP) or null (VS), so any other status value is automatically
-- excluded once set.
ALTER TYPE "leaguepour_lp"."OutreachStatus" ADD VALUE IF NOT EXISTS 'BOUNCED';
ALTER TYPE "leaguepour_lp"."OutreachStatus" ADD VALUE IF NOT EXISTS 'COMPLAINED';
