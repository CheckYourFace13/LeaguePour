/**
 * Shared write path for OperationalFailure - see its doc comment in schema.prisma. Never throws
 * (a failed failure-log write must not itself break the caller's own error handling) and never
 * accepts a raw Error/stack trace - callers pass a short human summary and optional plain-text
 * detail, both of which end up directly in the admin panel.
 */
import { prisma } from "@/lib/db";

export type OperationalFailureCategory =
  | "email-send"
  | "tournament-start"
  | "lp-checkout"
  | "lp-refund"
  | "connect-onboarding"
  | "vs-deposit-checkout"
  | "vs-contract-sign";

export async function logOperationalFailure(opts: {
  category: OperationalFailureCategory;
  summary: string;
  venueId?: string | null;
  detail?: string | null;
  retryable?: boolean;
}): Promise<void> {
  try {
    await prisma.operationalFailure.create({
      data: {
        category: opts.category,
        summary: opts.summary.slice(0, 500),
        venueId: opts.venueId ?? null,
        detail: opts.detail ? opts.detail.slice(0, 2000) : null,
        retryable: opts.retryable ?? false,
      },
    });
  } catch (err) {
    console.error("[operational-failure] failed to log failure", opts.category, err);
  }
}
