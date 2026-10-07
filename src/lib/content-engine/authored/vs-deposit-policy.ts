import type { AuthoredBody } from "./types";

export const vsDepositPolicy: AuthoredBody = {
  description:
    "How to set a private event deposit that protects your venue: how much to ask for, when it becomes non-refundable, and sample policy wording you can adapt.",
  faq: [
    {
      q: "How much deposit should a restaurant or bar ask for on a private event?",
      a: "There's no single right number. Many venues ask for a fixed amount on small events and a percentage of the estimated total on larger ones, and the deposit should at least cover the cost of turning away other business for that date.",
    },
    {
      q: "Should a private event deposit be non-refundable?",
      a: "A common approach is refundable until a set number of days before the event, then non-refundable. State rules on non-refundable deposits differ, so have an attorney review the wording in your contract.",
    },
    {
      q: "Is the deposit applied to the final bill?",
      a: "Usually, yes - and the contract should say so explicitly, so the host understands the deposit is part of what they'll pay, not an extra fee.",
    },
  ],
  bodyHtml: `
<p>A deposit does two jobs. It turns a maybe into a commitment, and it compensates you if the date you held falls through after you stopped offering it to anyone else. A good deposit policy does both without scaring off the customer at the moment they're about to say yes. This guide covers how to size the deposit, when it should stop being refundable, and how to write the policy so nobody is surprised.</p>

<h2>Start from what the date is worth to you</h2>
<p>The most useful way to size a deposit is to ask what you lose if this booking cancels late. For a back room on a Tuesday, the answer might be a few hundred dollars of regular business you'd have done anyway. For a full buyout on a Saturday in December, it can be most of a night's revenue plus the parties you turned away in the weeks before.</p>
<p>That gives you a floor. A deposit below the cost of a late cancellation doesn't protect you; it just makes the booking feel more official. Work it out per space and per day type:</p>
<ul>
<li><strong>Slow-night private room:</strong> the deposit mostly signals commitment. A modest fixed amount is often enough.</li>
<li><strong>Weekend or holiday-season room:</strong> you're displacing walk-in business and other inquiries. The deposit should cover a meaningful share of that.</li>
<li><strong>Full buyout:</strong> you're closing to the public. The deposit should be large enough that a late cancellation doesn't wipe out the night.</li>
</ul>

<h2>Fixed amount, percentage, or both</h2>
<p>A <strong>fixed deposit</strong> (say, $250 to hold a room) is easy to explain and easy to collect. It works when most of your events are a similar size.</p>
<p>A <strong>percentage deposit</strong> (say, 25% of the estimated total) scales with the booking. A $900 dinner and a $6,000 holiday party aren't asked for the same commitment, which feels fair to the host and protects you more on big events.</p>
<p>Many venues combine the two: <em>"25% of the estimated total or $250, whichever is greater."</em> That keeps small bookings from being nearly free to cancel while large ones stay proportional. If you want to sanity-check the numbers, the <a href="/tools/event-deposit-calculator">event deposit calculator</a> shows the deposit, the remaining balance, and what card processing takes out of it.</p>

<h2>Decide when it stops being refundable</h2>
<p>The refund window matters more than the amount. A deposit that's refundable until the day before the event protects almost nothing; one that's non-refundable from the moment it's paid can lose you bookings from hosts who are still confirming details.</p>
<p>A common structure is a single cutoff:</p>
<ul>
<li><strong>Refundable</strong> if the host cancels more than a set number of days before the event (often 30 for larger events, 14 for smaller ones).</li>
<li><strong>Non-refundable</strong> after that, because that's roughly when you can no longer rebook the date.</li>
</ul>
<p>Pick the cutoff by asking how far ahead you typically fill that space. If your Saturday room books six weeks out, a 14-day refund window means a late cancellation almost certainly costs you the night.</p>
<p>Whatever you choose, have an attorney review the wording. Rules on non-refundable deposits and what you can keep differ by state, and the label you use ("deposit," "booking fee," "retainer") can matter.</p>

<h2>Say what happens on a reschedule</h2>
<p>Hosts reschedule far more often than they cancel outright, and an unclear policy here is where most disputes start. Decide in advance:</p>
<ul>
<li>Does the deposit transfer to a new date? Many venues allow one transfer within a set period (for example, six months).</li>
<li>Does a reschedule inside the non-refundable window count as a cancellation, or as a transfer?</li>
<li>If the new date is in a higher-priced period, is the difference due?</li>
</ul>
<p>Writing this down protects goodwill. "Your deposit can move to any date in the next six months" is a policy a host can live with even when plans change.</p>

<h2>Make the deposit part of the bill, not an extra</h2>
<p>State plainly that the deposit is applied to the final bill. Hosts who think a deposit is an extra fee feel nickel-and-dimed and push back on everything else. Put the math on the proposal: estimated total, deposit due now, balance remaining, and when the balance is due.</p>

<h2>Sample deposit policy you can adapt</h2>
<p>This is a starting point to adapt with your own numbers and have reviewed - not legal language for every state:</p>
<ol>
<li>A deposit of 25% of the estimated event total, or $250, whichever is greater, is due when the contract is signed. The date is not reserved until the deposit is paid.</li>
<li>The deposit is applied to the final bill.</li>
<li>If the event is cancelled more than 30 days before the event date, the deposit is refunded in full.</li>
<li>If the event is cancelled 30 days or fewer before the event date, the deposit is non-refundable.</li>
<li>The event may be rescheduled once, to a date within six months of the original date, and the deposit will transfer to the new date, subject to availability.</li>
<li>The remaining balance is due at the end of the event.</li>
</ol>

<h2>Common mistakes</h2>
<ul>
<li><strong>Holding the date before the deposit lands.</strong> A verbal yes isn't a booking. Say in the proposal that the date is held only once the deposit is paid.</li>
<li><strong>Different terms for different hosts.</strong> If the manager gives a regular a looser policy, the next host who hears about it will ask for the same. Use one policy and note exceptions in writing.</li>
<li><strong>Collecting by check or app transfer with no receipt.</strong> When a dispute comes up months later, you want a dated record of what was paid and against which contract.</li>
<li><strong>Burying the policy.</strong> The refund cutoff should be on the proposal and in the contract, not only in a terms page the host never opens.</li>
</ul>

<h2>Where VenueSprocket fits</h2>
<p>In VenueSprocket you set the deposit amount on each proposal, put your cancellation and reschedule terms in your contract text, and the customer pays the deposit through Stripe right after signing - directly to your own Stripe account, with no percentage taken by VenueSprocket. See how that works on the <a href="/event-deposit-software">event deposit software</a> page, or start from the <a href="/templates">contract checklist</a> if you're rewriting your terms first.</p>
`.trim(),
};
