import type { Brand } from "../types";
import type { AuthoredBody } from "./types";
import { vsDepositPolicy } from "./vs-deposit-policy";
import { vsProposalStructure } from "./vs-proposal-structure";
import { vsCancellationPolicyExamples } from "./vs-cancellation-policy-examples";
import { lpEntryFeePricingStrategy } from "./lp-entry-fee-pricing-strategy";
import { lpCheckinProcess } from "./lp-checkin-process";

/**
 * Article bodies written in the repo for topics the engine has queued (see topics.ts). The engine
 * copies a body into its queued NEEDS_CONTENT row (publish.ts syncAuthoredBodies), then publishes
 * it only if every quality-gate check passes and the brand's weekly cap allows - one per run.
 * To add one: write it against facts.ts, key it by the topic's topicKey, and run
 * scripts/check-authored-guides.ts to see the gate result before committing.
 */
export const AUTHORED_BODIES: Record<Brand, Record<string, AuthoredBody>> = {
  VS: {
    "vs-deposit-policy": vsDepositPolicy,
    "vs-proposal-structure": vsProposalStructure,
    "vs-cancellation-policy-examples": vsCancellationPolicyExamples,
  },
  LP: {
    "lp-entry-fee-pricing-strategy": lpEntryFeePricingStrategy,
    "lp-checkin-process": lpCheckinProcess,
  },
};
