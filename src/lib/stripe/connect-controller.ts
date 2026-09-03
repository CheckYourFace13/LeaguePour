import type Stripe from "stripe";

/**
 * PENDING A BUSINESS DECISION - see the P0 Connect economics report. Stripe's own live
 * account-creation validation conclusively proved:
 *   - losses.payments="stripe" + stripe_dashboard.type="express" => REJECTED ("the Connect
 *     application must control losses").
 *   - losses.payments="stripe" is only achievable with stripe_dashboard.type="full" (confirmed
 *     live: {fees:{payer:"account"}, losses:{payments:"stripe"}, requirement_collection:
 *     "stripe", stripe_dashboard:{type:"full"}} - managedRiskConfirmed:true).
 * Switching every venue from Express to the full Stripe Dashboard is a real product/UX change
 * (a materially different, heavier interface than the streamlined Express flow venues get
 * today) and Stripe treats stripe_dashboard.type as PERMANENT per account - not something to
 * silently roll out. Reverted here to the explicit-controller equivalent of the original,
 * known-working `type: "express"` shorthand (platform bears losses, Express dashboard) so
 * production account creation keeps working while that decision is made - not the Managed Risk
 * end state, but not broken either. Update this the moment the dashboard-type decision is made.
 */
export const CONNECT_ACCOUNT_CONTROLLER: Stripe.AccountCreateParams.Controller = {
  // "application_express"/"application_custom" are read-only values Stripe reports back once
  // set - not valid inputs. "application" + stripe_dashboard.type: "express" produces the same
  // resulting fees.payer=application_express on the created account (this is what the legacy
  // `type: "express"` shorthand always set internally).
  fees: { payer: "application" },
  losses: { payments: "application" },
  requirement_collection: "stripe",
  stripe_dashboard: { type: "express" },
};
