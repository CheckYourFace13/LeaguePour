import type Stripe from "stripe";

/**
 * Managed Risk controller configuration for every new LeaguePour/VenueSprocket connected
 * account - standard GA `controller` parameter on POST /v1/accounts, no preview API required.
 * The legacy `type: "express"` shorthand is deprecated by Stripe and maps to fixed,
 * non-configurable defaults (fees.payer=application_express, losses.payments=application) -
 * explicit `controller` is the only way to change this while keeping Express-dashboard,
 * Stripe-hosted onboarding.
 *
 * fees.payer: "account" (venue pays its own processing) + losses.payments: "stripe" is NOT a
 * valid combination for stripe_dashboard.type: "express" - confirmed live via Stripe's own
 * account-creation validation error: "When stripe_dashboard[type]=express, your platform must
 * collect fees and be liable for negative balances or refunds and chargebacks." Stripe requires
 * fee-collection and loss-liability to move together for Express accounts. The combination
 * below - Stripe bears losses, platform (not the venue) remains the fee payer - is what that
 * constraint actually allows:
 *
 * - fees.payer: "application" - LeaguePour remains billed for Connect processing/account fees
 *   (unchanged from before this pass) - required by Stripe to pair with losses.payments=stripe
 *   for Express accounts.
 * - losses.payments: "stripe" - Stripe (not LeaguePour) is liable for negative balances - this
 *   is the actual change from before.
 * - requirement_collection: "stripe" - unchanged; Stripe collects/verifies KYC.
 * - stripe_dashboard.type: "express" - unchanged; venues keep the Express Dashboard.
 */
export const MANAGED_RISK_CONTROLLER: Stripe.AccountCreateParams.Controller = {
  fees: { payer: "application" },
  losses: { payments: "stripe" },
  requirement_collection: "stripe",
  stripe_dashboard: { type: "express" },
};
