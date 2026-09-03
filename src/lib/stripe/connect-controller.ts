import type Stripe from "stripe";

/**
 * Managed Risk - business decision confirmed 2026-09-03, deployed while zero real connected
 * accounts existed (verified live immediately before this change; Q's Wine Bar/Rachel had not
 * yet clicked Connect Stripe). Stripe's own live account-creation validation conclusively
 * proved this is the ONLY combination that gives Stripe-managed negative-balance liability:
 *   - losses.payments="stripe" + stripe_dashboard.type="express" is REJECTED outright by
 *     Stripe ("the Connect application must control losses") - Managed Risk is categorically
 *     impossible with the Express dashboard.
 *   - losses.payments="stripe" + stripe_dashboard.type="full" requires fees.payer="account"
 *     (Stripe also rejects fees.payer="application" there) - confirmed live,
 *     managedRiskConfirmed:true, before this was trusted for production use.
 * This is the standard GA `controller` parameter on POST /v1/accounts - no preview/beta API.
 * requirement_collection stays "stripe" (Stripe-hosted onboarding, unchanged).
 *
 * - losses.payments: "stripe" - Stripe, not LeaguePour, is liable for negative balances.
 * - fees.payer: "account" - the connected venue pays its own Stripe processing fees.
 * - stripe_dashboard.type: "full" - venues get the full Stripe Dashboard (not Express) -
 *   PERMANENT per account per Stripe (changing it requires creating a new Account object), and
 *   a materially different interface than the streamlined Express flow. LeaguePour's own UI
 *   never surfaces this distinction to venues - see venue/profile's Connect Stripe copy.
 */
export const CONNECT_ACCOUNT_CONTROLLER: Stripe.AccountCreateParams.Controller = {
  fees: { payer: "account" },
  losses: { payments: "stripe" },
  requirement_collection: "stripe",
  stripe_dashboard: { type: "full" },
};
