import type { AuthoredBody } from "./types";

export const vsCancellationPolicyExamples: AuthoredBody = {
  description:
    "Four example cancellation policies for restaurants, bars, and event spaces - from a simple single cutoff to a tiered schedule - with notes on when each one fits.",
  faq: [
    {
      q: "What is a fair cancellation policy for a private event?",
      a: "One that matches how far ahead you can realistically rebook the space. If a room usually books four weeks out, cancellations inside four weeks are the ones that cost you, so that's where the policy should start to bite.",
    },
    {
      q: "Can a venue keep the deposit if the customer cancels?",
      a: "Many venues do once a stated cutoff has passed, but what's enforceable depends on your contract wording and your state's rules. Have an attorney review your policy.",
    },
    {
      q: "Should the policy be different if the venue cancels?",
      a: "Yes. If you have to cancel - a closure, an emergency, a facilities problem - the usual expectation is a full refund of everything the host has paid. Say so in the contract.",
    },
  ],
  bodyHtml: `
<p>A cancellation policy is easier to enforce, and easier to accept, when it's specific. "Deposits are non-refundable" invites an argument the first time someone cancels for a good reason. A policy with clear dates and clear amounts gives everyone - including the staff member who has to explain it - something to point to. Below are four example structures, when each one fits, and how to choose.</p>
<p><em>These are examples to adapt, not legal language. Rules on deposits, refunds, and what you can keep differ by state; have an attorney review the final wording in your contract.</em></p>

<h2>Example 1: Single cutoff</h2>
<p>Best for: smaller private rooms, weekday events, venues that want something simple to explain.</p>
<ol>
<li>The deposit is fully refundable if the event is cancelled more than 14 days before the event date.</li>
<li>Within 14 days of the event, the deposit is non-refundable.</li>
<li>The deposit is applied to the final bill.</li>
</ol>
<p>Why it works: one date, one rule. Staff can explain it in a sentence. The weakness is that it treats a cancellation 15 days out the same as one 60 days out, which is generous to the host on big events.</p>

<h2>Example 2: Tiered schedule</h2>
<p>Best for: buyouts, larger parties, and weekend or holiday-season dates that are hard to rebook late.</p>
<ol>
<li>More than 60 days before the event: deposit refunded in full.</li>
<li>30 to 60 days before: 50% of the deposit refunded.</li>
<li>Fewer than 30 days before: deposit non-refundable.</li>
<li>Fewer than 7 days before: the host is responsible for 50% of the food and beverage minimum, less the deposit already paid.</li>
</ol>
<p>Why it works: the cost to the host rises as the cost to you rises. The last tier matters for buyouts, where a deposit alone may not cover a night you closed to the public. Spell out the math with an example in the contract so there's no confusion about "less the deposit already paid."</p>

<h2>Example 3: Reschedule-first</h2>
<p>Best for: venues that value repeat customers and would rather keep the booking than keep the money.</p>
<ol>
<li>The deposit is non-refundable, but it can be transferred once to a new date within six months of the original date, subject to availability.</li>
<li>Requests to reschedule must be made at least 14 days before the original date.</li>
<li>If no new date is booked within six months, the deposit is forfeited.</li>
</ol>
<p>Why it works: hosts rarely want to lose the money and rarely want to fight about it either. Offering a transfer turns most cancellations into a later booking. Make sure the transfer window and the "once" are clear, or a single deposit can follow a host through a year of reschedules.</p>

<h2>Example 4: Guest-count changes</h2>
<p>Best for: any venue using a food and beverage minimum. This one sits alongside your cancellation terms rather than replacing them.</p>
<ol>
<li>The final guest count is due 7 days before the event.</li>
<li>The food and beverage minimum does not decrease if the final count is lower than the estimate.</li>
<li>If the final count drops by more than a third, the venue may move the event to a smaller space where available, with a correspondingly lower minimum.</li>
</ol>
<p>Why it works: a party that shrinks from 60 to 25 is a partial cancellation in everything but name. Without this clause, the host may expect the minimum to shrink with the headcount. The third point gives you a goodwill option without obligating you to it.</p>

<h2>How to choose</h2>
<ul>
<li><strong>Start from your rebooking window.</strong> How far out does this space usually fill? Cancellations inside that window are the ones that cost you, so that's where the policy should start to bite.</li>
<li><strong>Match the policy to the size of the booking.</strong> A single cutoff is fine for a weeknight dinner. A Saturday buyout deserves a tiered schedule.</li>
<li><strong>Decide if you'd rather keep the booking or the money.</strong> If repeat business matters more, lead with a reschedule option.</li>
<li><strong>Cover the venue-cancels case.</strong> If you have to cancel, the expected answer is a full refund of everything paid. Saying so builds trust in the rest of the policy.</li>
</ul>

<h2>Make the policy hard to miss</h2>
<p>The best-written policy fails if the host first reads it when they're asking for their money back. Put a one-line summary on the proposal ("Fully refundable until 30 days before the event"), the full terms in the contract, and have the host sign the contract before the deposit is collected. The <a href="/templates">contract checklist</a> covers the other terms worth including, and the <a href="/guides/private-event-deposit-policies-that-protect-your-venue">deposit policy guide</a> walks through sizing the deposit itself.</p>

<h2>Where VenueSprocket fits</h2>
<p>VenueSprocket puts your own contract text - including your cancellation terms - into every contract, the customer signs it with a typed signature that's recorded with a timestamp, and the deposit is paid right after signing. If a cancellation qualifies for a refund, an owner or manager can refund the deposit through Stripe from the Payments screen. See <a href="/event-contract-software">how contracts work</a>.</p>
`.trim(),
};
