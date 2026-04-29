import { PaymentStatus, RegistrationStatus } from "@/generated/prisma/enums";

export type PaymentSlice = { status: PaymentStatus; provider: string };

const LEGACY_NOTE =
  "Legacy test record in LeaguePour — not a live Stripe charge. Contact the venue if this looks wrong.";

function isLegacyPlaceholderProcessor(provider: string | null | undefined): boolean {
  if (!provider) return false;
  return provider === "leaguepour_placeholder" || provider === "placeholder";
}

function isStripeProvider(provider: string | null | undefined): boolean {
  return provider === "stripe";
}

/** Canonical UI states for registration ↔ payment. */
export type RegistrationPaymentUiStatus =
  | "unpaid"
  | "payment_pending"
  | "payment_not_required"
  | "paid"
  | "refunded"
  | "paid_placeholder"
  | "refunded_placeholder";

export type RegistrationPaymentPresentation = {
  ui: RegistrationPaymentUiStatus;
  shortLabel: string;
  description: string;
  badgeVariant: "default" | "accent" | "success" | "muted";
};

export function deriveRegistrationPaymentUiStatus(args: {
  entryFeeCents: number;
  registrationStatus: RegistrationStatus;
  payment: PaymentSlice | null;
}): RegistrationPaymentUiStatus {
  const { entryFeeCents, registrationStatus, payment } = args;

  if (entryFeeCents <= 0) {
    return "payment_not_required";
  }

  if (registrationStatus === RegistrationStatus.CANCELLED) {
    if (payment?.status === PaymentStatus.REFUNDED) {
      return isLegacyPlaceholderProcessor(payment.provider) ? "refunded_placeholder" : "refunded";
    }
    if (payment?.status === PaymentStatus.SUCCEEDED) {
      return isLegacyPlaceholderProcessor(payment.provider) ? "paid_placeholder" : "paid";
    }
    if (payment?.status === PaymentStatus.PENDING) return "payment_pending";
    return "unpaid";
  }

  if (registrationStatus === RegistrationStatus.PENDING_PAYMENT) {
    if (payment?.status === PaymentStatus.PENDING) return "payment_pending";
    if (payment?.status === PaymentStatus.FAILED) return "unpaid";
    return "unpaid";
  }

  if (registrationStatus === RegistrationStatus.WAITLIST) {
    if (payment?.status === PaymentStatus.PENDING) return "payment_pending";
    if (payment?.status === PaymentStatus.SUCCEEDED) {
      return isLegacyPlaceholderProcessor(payment.provider) ? "paid_placeholder" : "paid";
    }
    return "unpaid";
  }

  if (registrationStatus === RegistrationStatus.CONFIRMED) {
    if (payment?.status === PaymentStatus.REFUNDED) {
      return isLegacyPlaceholderProcessor(payment.provider) ? "refunded_placeholder" : "refunded";
    }
    if (payment?.status === PaymentStatus.SUCCEEDED) {
      return isLegacyPlaceholderProcessor(payment.provider) ? "paid_placeholder" : "paid";
    }
    if (payment?.status === PaymentStatus.PENDING) return "payment_pending";
    return "unpaid";
  }

  return "unpaid";
}

export function presentRegistrationPayment(args: {
  entryFeeCents: number;
  registrationStatus: RegistrationStatus;
  payment: PaymentSlice | null;
}): RegistrationPaymentPresentation {
  const ui = deriveRegistrationPaymentUiStatus(args);
  const stripe = isStripeProvider(args.payment?.provider);

  switch (ui) {
    case "payment_not_required":
      return {
        ui,
        shortLabel: "No payment",
        description: "This competition has no entry fee — no payment step.",
        badgeVariant: "muted",
      };
    case "payment_pending":
      return {
        ui,
        shortLabel: "Payment pending",
        description: stripe
          ? "Checkout not finished yet, or Stripe is still confirming the payment. You can resume checkout from your pay link."
          : isLegacyPlaceholderProcessor(args.payment?.provider)
            ? `Entry fee not completed. ${LEGACY_NOTE}`
            : "Entry fee is on file but payment is not complete yet.",
        badgeVariant: "accent",
      };
    case "unpaid":
      return {
        ui,
        shortLabel: "Unpaid",
        description: stripe
          ? "Stripe does not show a completed payment for this registration yet."
          : isLegacyPlaceholderProcessor(args.payment?.provider)
            ? `Payment not complete. ${LEGACY_NOTE}`
            : "Payment is not complete for this registration.",
        badgeVariant: "default",
      };
    case "paid":
      return {
        ui,
        shortLabel: "Paid",
        description: stripe
          ? "Payment succeeded via Stripe — your entry is confirmed in LeaguePour."
          : "Payment marked succeeded.",
        badgeVariant: "success",
      };
    case "refunded":
      return {
        ui,
        shortLabel: "Refunded",
        description: stripe
          ? "This payment was refunded through Stripe — the registration is cancelled in LeaguePour."
          : "Payment marked refunded.",
        badgeVariant: "muted",
      };
    case "paid_placeholder":
      return {
        ui,
        shortLabel: "Paid (legacy)",
        description: `Paid in legacy test data only. ${LEGACY_NOTE}`,
        badgeVariant: "success",
      };
    case "refunded_placeholder":
      return {
        ui,
        shortLabel: "Refunded (legacy)",
        description: `Refunded in legacy test data — no Stripe money movement. ${LEGACY_NOTE}`,
        badgeVariant: "muted",
      };
    default:
      return {
        ui: "unpaid",
        shortLabel: "Unpaid",
        description: stripe ? "Awaiting Stripe payment." : "Payment status could not be determined.",
        badgeVariant: "default",
      };
  }
}

export type RegistrationWithPaymentSlice = {
  status: RegistrationStatus;
  payment: PaymentSlice | null;
};

export function presentRegistrationPaymentFromRow(
  reg: RegistrationWithPaymentSlice,
  entryFeeCents: number,
): RegistrationPaymentPresentation {
  return presentRegistrationPayment({
    entryFeeCents,
    registrationStatus: reg.status,
    payment: reg.payment,
  });
}
