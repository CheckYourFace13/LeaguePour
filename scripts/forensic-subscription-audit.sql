-- Forensic audit: classify every venue's currently-tracked LeaguePour subscription
-- (Venue.subscriptionId) as CERTAIN LP, CERTAIN VS, or AMBIGUOUS, using real usage-pattern
-- evidence rather than guessing. Read-only - does not modify anything.
--
-- Why this is needed: before the P0 fix (commit 6202ce8), both LeaguePour and VenueSprocket
-- subscriptions wrote to Venue.subscriptionId/billingPlan with no product tag, so a venue that
-- ever completed a VenueSprocket checkout may have its VS subscription's id/plan currently
-- sitting in what is nominally "LeaguePour's" field. Stripe metadata from before the fix can't
-- disambiguate this (both products wrote the same shape) - so this classifies by what the venue
-- actually DID with the product, which is the only remaining signal.
--
-- Run this from wherever you have psql (or any Postgres client) pointed at the real production
-- database - see the exact command block for how to do that safely without exposing credentials
-- in your terminal history.
--
-- Read the "classification" column:
--   CERTAIN_LP  - meaningful LeaguePour activity (published competitions/registrations), no
--                 meaningful VenueSprocket activity. The current Venue.subscriptionId is almost
--                 certainly a real LP subscription. No action needed.
--   CERTAIN_VS  - the reverse: meaningful VS activity (leads/proposals/contracts), no meaningful
--                 LP activity, AND VenueVsConfig.vsSubscriptionId is still null (meaning this
--                 venue has never gone through the post-fix VS checkout either). This is the
--                 shortlist worth a human look - the venue likely paid for VenueSprocket, and
--                 what's currently in Venue.subscriptionId/billingPlan may actually be that VS
--                 subscription, mislabeled as LP.
--   AMBIGUOUS   - meaningful activity on BOTH sides, or an active paid subscription with
--                 meaningful activity on NEITHER side. Cannot be safely classified from usage
--                 alone - needs a manual look at the actual Stripe subscription (dashboard or
--                 API) to see what price/plan it's actually billing.
--   FREE_OR_UNPAID - no active subscription at all. Not part of this audit's concern.

WITH lp_activity AS (
  SELECT v.id AS "venueId",
         count(DISTINCT c.id) AS competitions,
         count(DISTINCT r.id) AS registrations
  FROM "leaguepour_lp"."Venue" v
  LEFT JOIN "leaguepour_lp"."Competition" c ON c."venueId" = v.id
  LEFT JOIN "leaguepour_lp"."CompetitionRegistration" r ON r."competitionId" = c.id
  GROUP BY v.id
),
vs_activity AS (
  SELECT v.id AS "venueId",
         count(DISTINCT l.id) AS leads,
         count(DISTINCT p.id) AS proposals,
         count(DISTINCT ct.id) AS contracts
  FROM "leaguepour_lp"."Venue" v
  LEFT JOIN "leaguepour_lp"."PrivateEventLead" l ON l."venueId" = v.id
  LEFT JOIN "leaguepour_lp"."PrivateEvent" pe ON pe."venueId" = v.id
  LEFT JOIN "leaguepour_lp"."VsProposal" p ON p."privateEventId" = pe.id
  LEFT JOIN "leaguepour_lp"."VsContract" ct ON ct."privateEventId" = pe.id
  GROUP BY v.id
)
SELECT
  v.id AS "venueId",
  v.name AS "venueName",
  v."billingPlan",
  v."subscriptionStatus",
  v."subscriptionId",
  v."createdAt" AS "venueCreatedAt",
  vc."vsPlan",
  vc."vsSubscriptionId",
  vc."vsSubscriptionStatus",
  la.competitions AS "lpCompetitions",
  la.registrations AS "lpRegistrations",
  va.leads AS "vsLeads",
  va.proposals AS "vsProposals",
  va.contracts AS "vsContracts",
  CASE
    WHEN v."subscriptionStatus" NOT IN ('active', 'trialing') THEN 'FREE_OR_UNPAID'
    WHEN (la.competitions > 0 OR la.registrations > 0) AND (va.leads = 0 AND va.proposals = 0 AND va.contracts = 0) THEN 'CERTAIN_LP'
    WHEN (va.leads > 0 OR va.proposals > 0 OR va.contracts > 0) AND (la.competitions = 0 AND la.registrations = 0) AND vc."vsSubscriptionId" IS NULL THEN 'CERTAIN_VS'
    ELSE 'AMBIGUOUS'
  END AS classification
FROM "leaguepour_lp"."Venue" v
LEFT JOIN "leaguepour_lp"."VenueVsConfig" vc ON vc."venueId" = v.id
LEFT JOIN lp_activity la ON la."venueId" = v.id
LEFT JOIN vs_activity va ON va."venueId" = v.id
WHERE v."subscriptionStatus" IN ('active', 'trialing')
ORDER BY classification, v."createdAt" DESC;
