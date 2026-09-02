/**
 * Derives a real, venue-owner-facing Stripe Connect status from Stripe's own account/capability
 * state - not just "does a stripeAccountId exist" (that was the bug: a stripeAccountId existing
 * says nothing about whether the account can actually take payments, is stuck needing more
 * info, or has been restricted). See docs.stripe.com/api/accounts/object for the underlying
 * fields (`charges_enabled`, `payouts_enabled`, `details_submitted`, `requirements`).
 */

export type ConnectStatus =
  | "not_connected"
  | "setup_started"
  | "action_required"
  | "under_review"
  | "restricted"
  | "ready";

export type ConnectAccountLike = {
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  requirements?: {
    currently_due?: string[] | null;
    pending_verification?: string[] | null;
    disabled_reason?: string | null;
  } | null;
};

export function deriveConnectStatus(account: ConnectAccountLike | null): ConnectStatus {
  if (!account) return "not_connected";
  const req = account.requirements;
  const disabledReason = req?.disabled_reason ?? null;

  // "rejected.*" is Stripe's terminal state (fraud, terms of service, listed, etc.) - distinct
  // from "requirements.past_due", which just means more info is needed and is recoverable.
  if (disabledReason && disabledReason.startsWith("rejected.")) return "restricted";
  if (account.charges_enabled && account.payouts_enabled) return "ready";
  if (disabledReason === "requirements.past_due" || (req?.currently_due?.length ?? 0) > 0) {
    return "action_required";
  }
  if (!account.details_submitted) return "setup_started";
  return "under_review";
}

export const CONNECT_STATUS_COPY: Record<
  ConnectStatus,
  { label: string; message: string; tone: "neutral" | "warning" | "danger" | "success"; cta: string | null }
> = {
  not_connected: {
    label: "Not connected",
    message: "Connect Stripe to start accepting entry fees.",
    tone: "neutral",
    cta: "Connect Stripe",
  },
  setup_started: {
    label: "Setup started",
    message: "You started Stripe setup but haven't finished. Continue where you left off.",
    tone: "warning",
    cta: "Continue Stripe setup",
  },
  action_required: {
    label: "Action required",
    message: "Stripe needs a little more information before you can accept payments.",
    tone: "warning",
    cta: "Continue Stripe setup",
  },
  under_review: {
    label: "Under review",
    message: "Stripe is reviewing your information. Paid registration will become available when your account is approved.",
    tone: "neutral",
    cta: null,
  },
  restricted: {
    label: "Restricted",
    message: "Stripe has restricted this account. Contact support for help resolving this.",
    tone: "danger",
    cta: null,
  },
  ready: {
    label: "Ready",
    message: "Charges and payouts are enabled - you're all set to accept entry fees.",
    tone: "success",
    cta: null,
  },
};
