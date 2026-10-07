import type { AuthoredBody } from "./types";

export const lpEntryFeePricingStrategy: AuthoredBody = {
  description:
    "How to set an entry fee for a bar league or tournament: what the fee should cover, how to work backward from prizes and costs, and the mistakes that empty a bracket.",
  faq: [
    {
      q: "How much should a bar charge to enter a dart or cornhole tournament?",
      a: "Work backward from what the fee needs to cover - any prize pool, costs like a bracket sheet or equipment, and what you want to keep - then check it against what your regulars will actually pay. A free or low-fee event is often the right first step to build a field.",
    },
    {
      q: "Should the whole entry fee go to the prize pool?",
      a: "Not necessarily. Some venues return most of it as prizes to attract competitive players; others keep it low and treat the event as a traffic driver paid for by food and drink sales. Be clear and consistent about which model you use.",
    },
    {
      q: "Are paid-entry competitions with cash prizes legal?",
      a: "It depends on your state and the game. Rules for prize competitions, and especially for poker, vary widely. Check your local and state rules before offering cash prizes funded by entry fees.",
    },
  ],
  bodyHtml: `
<p>An entry fee does more than raise money. It tells players how serious the event is, it cuts down on no-shows, and it shapes who signs up. Price it too high and the casual regulars who fill a Tuesday night stay home; price it at zero and half the bracket doesn't show. Here's how to land on a number that works.</p>

<h2>Decide what the fee is for</h2>
<p>Before picking a number, decide which of these jobs the fee is doing. Most bar competitions do one or two of them, not all four:</p>
<ul>
<li><strong>Commitment.</strong> Even a small paid entry makes people far more likely to show up than a free signup. If no-shows are your problem, a modest fee fixes more than a bigger one.</li>
<li><strong>Prize pool.</strong> Competitive players come for something to win. If you're trying to attract them, most of the fee should go back out as prizes.</li>
<li><strong>Covering costs.</strong> Boards, bags, tips for a host, printed brackets, a trophy.</li>
<li><strong>Revenue.</strong> Some venues keep part of the fee. That's fine if it's clear, but for most bars the real revenue is the food and drink a full room buys over a long night.</li>
</ul>

<h2>Work backward from the prize and the field</h2>
<p>If there's a prize pool, start there. Suppose you want a $200 payout for a cornhole tournament and expect 16 teams. That's $12.50 per team just for the pool. Add a few dollars for costs and you're at roughly $15 per team.</p>
<p>Then check it against the field you'll realistically get. If you've only ever drawn 10 teams, a $200 pool needs $20 per team - and a $20 fee may shrink the field further. In that case, either lower the pool and say it scales with entries ("80% of entries go to the prize pool") or grow the field first with a cheaper event.</p>

<h2>Leagues and one-night tournaments price differently</h2>
<p>A <strong>one-night tournament</strong> is a single purchase decision. Players compare it to what else they'd spend on a night out, so a round number they don't have to think about works best.</p>
<p>A <strong>league</strong> runs for weeks. You can charge per week, or once for the season. A season fee locks players in (they've paid, so they show up), while weekly fees are easier for casual players to say yes to. Many venues charge a season fee for teams and allow paid weekly subs for individuals who fill in.</p>

<h2>Account for the fees on paid entries</h2>
<p>If you collect entry fees online, know exactly what you receive. With LeaguePour, for example, the venue keeps the entry fee minus a 5% platform fee, and the player pays a $1.50 service fee on top of the entry price at checkout. On a $10 entry, that's:</p>
<ul>
<li>Player pays: $10.00 + $1.50 = $11.50</li>
<li>Venue receives: $10.00 − $0.50 = $9.50</li>
</ul>
<p>Twenty players at that price is $190 to the venue. If you've promised a $200 pool, you're short - so do this math before you announce the prize, not after.</p>

<h2>Free events have a place</h2>
<p>A free event (entry fee $0) is the right call when you're starting a new night and need to prove there's a crowd, or when the goal is purely traffic. The trade-off is attendance: free signups no-show more. Two ways to soften that:</p>
<ul>
<li>Cap the field and keep a waitlist, so a no-show slot gets filled.</li>
<li>Run a free first night, then move to a small paid entry once you have regulars.</li>
</ul>
<p>Our guide to <a href="/guides/managing-no-shows-and-forfeits">managing no-shows and forfeits</a> covers what to do on the night when people don't turn up.</p>

<h2>Mistakes that empty a bracket</h2>
<ul>
<li><strong>Pricing for the players you wish you had.</strong> A fee set for a competitive crowd scares off the regulars you actually have.</li>
<li><strong>Changing the fee mid-season.</strong> If week four costs more than week one, expect complaints and dropouts.</li>
<li><strong>A vague prize.</strong> "Prizes for the winners" sounds like a gift card. "$150 to first place, $50 to second" sounds like a tournament.</li>
<li><strong>Cash at the door only.</strong> It slows check-in, it's easy to lose track of, and it gives people a reason not to commit until the night. Taking payment at signup means the commitment happens when they sign up.</li>
<li><strong>Ignoring the rules.</strong> Paid-entry competitions with cash prizes are regulated differently by state and by game - poker especially. Check before you announce a cash pool.</li>
</ul>

<h2>A quick pricing worksheet</h2>
<ol>
<li>Expected entries (be conservative): ____</li>
<li>Prize pool, if any: $____</li>
<li>Costs per event: $____</li>
<li>Minimum fee = (prize pool + costs) ÷ expected entries = $____</li>
<li>Round to a number your regulars won't hesitate at, and adjust the pool if the rounding goes down.</li>
</ol>
<p>For more on picking a format to go with the price, see <a href="/guides/round-robin-vs-single-elimination">round robin vs. single elimination</a>.</p>

<h2>Where LeaguePour fits</h2>
<p>In LeaguePour you set an entry fee (or $0) on each competition, players pay when they register from their phone, and the money is paid out to your own bank account through Stripe Connect. See <a href="/pricing">pricing</a> for how the plans and fees work.</p>
`.trim(),
};
