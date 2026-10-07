import type { AuthoredBody } from "./types";

export const vsProposalStructure: AuthoredBody = {
  description:
    "How to structure a private event proposal so hosts can say yes without a follow-up call: what to include, what order to put it in, and what slows signatures down.",
  faq: [
    {
      q: "What should a private event proposal include?",
      a: "The event basics (date, times, space, guest count), the pricing structure (room fee, food and beverage minimum, service charge and tax treatment), the deposit and when it's due, how long the proposal is valid, and a single clear next step.",
    },
    {
      q: "Should I send a menu with the proposal?",
      a: "Send menu options separately or as an attachment, but keep the proposal itself focused on the commitment: the space, the date, the minimum, and the deposit. Menu decisions can be finalized later and recorded on the BEO.",
    },
    {
      q: "How long should a proposal be valid?",
      a: "Long enough for the host to check with their group, short enough that you aren't holding a popular date indefinitely. Many venues use 5 to 7 days and release the date after that.",
    },
  ],
  bodyHtml: `
<p>Most proposals don't lose bookings because the price is wrong. They lose them because the host can't tell what they're agreeing to, has to email back with three questions, and books the venue that answered faster. A proposal that gets signed quickly is one the host can understand in a minute and act on in two.</p>

<h2>Lead with the event, not the menu</h2>
<p>The first thing the host wants to confirm is that you understood the request. Open with the facts they gave you, restated:</p>
<ul>
<li>Event name and occasion</li>
<li>Date, arrival time, and end time</li>
<li>The room or area, and whether it's a full buyout</li>
<li>Expected guest count</li>
</ul>
<p>If any of these differ from what they asked for (a different room, an earlier end time), call it out here rather than hoping they notice. Surprises discovered later are what turn a booking into a dispute.</p>

<h2>Show the pricing structure, then the total</h2>
<p>Hosts compare proposals from two or three venues. Make yours easy to compare by showing how the price is built before you show the number:</p>
<ul>
<li><strong>Room or buyout fee</strong>, if you charge one.</li>
<li><strong>Food and beverage minimum</strong> - and say whether it's before or after tax and service charge. If you're not sure where to set it, the <a href="/tools/food-beverage-minimum-calculator">F&amp;B minimum calculator</a> shows the projected spend and shortfall for a given headcount.</li>
<li><strong>Service charge or auto-gratuity</strong>, as a percentage.</li>
<li><strong>Tax</strong>, and what it applies to.</li>
<li><strong>Estimated total</strong>, clearly labeled as an estimate.</li>
</ul>
<p>"Estimated" matters. Final spend depends on headcount and what the group orders. Labeling it honestly up front avoids the "you said it would be $2,000" conversation at the end of the night.</p>

<h2>Make the commitment one clear step</h2>
<p>After the pricing, the proposal should answer one question: what do I do next? Give the host a single path:</p>
<ol>
<li>Accept the proposal.</li>
<li>Sign the contract.</li>
<li>Pay the deposit to lock the date.</li>
</ol>
<p>State the deposit amount, that it's applied to the final bill, and when the remaining balance is due. Then say how long the proposal is valid and that the date isn't held until the deposit is paid. A deadline isn't pushy; it tells the host you have other inquiries for the date, which is usually true.</p>

<h2>Keep the menu out of the critical path</h2>
<p>It's tempting to include every menu option, the drink packages, and the decor policy in the proposal. Resist it. Every choice you put in front of the host before they commit is another reason to delay.</p>
<p>A better pattern: the proposal secures the space, the date, the minimum, and the deposit. Menu selections, the final headcount, and setup details get confirmed afterward and go onto the Banquet Event Order. (If you don't use one yet, <a href="/guides/what-is-a-beo">here's what a BEO is</a>.) The host books faster, and you're not rewriting the proposal every time they change their mind about appetizers.</p>

<h2>What slows signatures down</h2>
<ul>
<li><strong>Attachments that need a printer.</strong> A host reading on their phone at lunch won't print, sign, and scan a PDF. If signing takes a desk, it waits until they're at one.</li>
<li><strong>Unexplained line items.</strong> "Room fee: $300" with no context invites a negotiation. "Room fee (back patio, 4 hours, includes setup)" usually doesn't.</li>
<li><strong>Missing policy details.</strong> If the cancellation and reschedule terms only appear in the contract, the host meets them for the first time when they're about to sign - and stops to ask questions. Mention the key terms in the proposal.</li>
<li><strong>Slow replies.</strong> Send the proposal the same day as the inquiry when you can. The host who's waiting is also waiting on someone else's proposal.</li>
</ul>

<h2>A proposal outline you can copy</h2>
<ol>
<li><strong>Header:</strong> event name, host name, date.</li>
<li><strong>The event:</strong> arrival and end times, room or buyout, guest count.</li>
<li><strong>Pricing:</strong> room fee, F&amp;B minimum (pre-tax), service charge %, tax, estimated total.</li>
<li><strong>Deposit:</strong> amount, due at signing, applied to the final bill; balance due date.</li>
<li><strong>Key terms:</strong> one sentence each on cancellation and rescheduling, with a note that full terms are in the contract.</li>
<li><strong>Validity:</strong> "This proposal is valid for 7 days. The date is reserved once the deposit is paid."</li>
<li><strong>Next step:</strong> one button or link to accept.</li>
</ol>
<p>For a full checklist of what each document should contain, see the <a href="/templates">proposal and contract checklists</a>, or look at a <a href="/guides/sample-proposal-and-contract">sample proposal and contract</a> side by side.</p>

<h2>Where VenueSprocket fits</h2>
<p>A VenueSprocket proposal carries the room fee, the food and beverage minimum, and the deposit, and shows the host an estimated total on a page that works on a phone. They accept with one tap, sign the contract from the same flow, and pay the deposit through Stripe. Menu and setup details go in the event notes and onto the BEO afterward. Walk through it on the <a href="/demo">sample workflow</a>.</p>
`.trim(),
};
