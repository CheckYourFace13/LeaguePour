import type Stripe from "stripe";

/**
 * Managed Risk controller configuration for every new LeaguePour/VenueSprocket connected
 * account - Stripe-confirmed correct shape (2026-09), standard GA `controller` parameter on
 * POST /v1/accounts, no preview API required. The legacy `type: "express"` shorthand is
 * deprecated by Stripe and maps to fixed, non-configurable defaults
 * (fees.payer=application_express, losses.payments=application) - explicit `controller` is the
 * only way to get Stripe-managed risk while keeping Express-dashboard, Stripe-hosted onboarding.
 *
 * - fees.payer: "account" - the connected venue pays its own Stripe processing fees (not
 *   LeaguePour). Our application_fee_amount on each direct charge is unaffected by this - it's
 *   still transferred to the platform regardless of who pays the underlying Stripe fee.
 * - losses.payments: "stripe" - Stripe (not LeaguePour) is liable for negative balances.
 * - requirement_collection: "stripe" - unchanged from before; Stripe collects/verifies KYC.
 * - stripe_dashboard.type: "express" - unchanged from before; venues keep the Express Dashboard.
 */
export const MANAGED_RISK_CONTROLLER: Stripe.AccountCreateParams.Controller = {
  fees: { payer: "account" },
  losses: { payments: "stripe" },
  requirement_collection: "stripe",
  stripe_dashboard: { type: "express" },
};
