import type { AuthoredBody } from "./types";

export const vsBreweryPrivateEvents: AuthoredBody = {
  description:
    "A practical playbook for brewery and taproom private events: space setup, food without a kitchen, alcohol rules, pricing models and a booking process that holds up.",
  faq: [
    {
      q: "How should a brewery price a private event?",
      a: "Most taprooms use a food and beverage minimum, a flat room or buyout fee, or drink packages or tickets per guest. A minimum works well when guests buy their own rounds; a buyout fee works when you close the taproom to the public. Many breweries combine a modest room fee with a beverage minimum.",
    },
    {
      q: "Can a brewery without a kitchen host private events?",
      a: "Yes. Many taprooms partner with food trucks or caterers, or let the host bring food where local rules allow. Put the food arrangement in the proposal so everyone knows who is responsible for food, service and cleanup.",
    },
    {
      q: "What should a brewery's private event deposit be?",
      a: "Enough that a late cancellation does not cost you a busy night, often a meaningful share of the minimum or buyout fee, collected when the contract is signed. Write down what happens to it at each notice period.",
    },
  ],
  bodyHtml: `
<p>Breweries and taprooms make natural private event spaces: a room people already like, beer they can't get elsewhere, and a relaxed feel that suits birthdays, team outings and rehearsal dinners. But a taproom isn't a restaurant, and the restaurant playbook doesn't map over cleanly. Here's what's different and how to set up private events so they're worth the trouble.</p>

<h2>Decide what you're actually selling</h2>
<p>Most taprooms offer some mix of three things:</p>
<ul>
<li><strong>Reserved area:</strong> a section, mezzanine or patio held for a group while the rest of the taproom stays open.</li>
<li><strong>Private room:</strong> a barrel room or back room with its own door, often with a minimum.</li>
<li><strong>Full buyout:</strong> the whole taproom closed to the public for a few hours.</li>
</ul>
<p>Write each option down with its capacity, the days it's available and the price model. Planners compare venues quickly, and a clear menu of options gets you to a yes faster than "it depends".</p>

<h2>Food when you don't have a kitchen</h2>
<p>Food is the biggest difference from a restaurant. Common approaches:</p>
<ul>
<li><strong>Food truck partners.</strong> Keep a short list of trucks that know your space and can handle a set count. Book the truck when the contract is signed, not the week before.</li>
<li><strong>Caterer list.</strong> A few caterers who have delivered to you before, with notes on setup and timing.</li>
<li><strong>Host brings food,</strong> where your license and local rules allow it. Say clearly who handles setup, serving and trash.</li>
</ul>
<p>Whatever you choose, spell it out in the proposal. "Food by host" or "food truck booked by venue, paid by host" stops a surprise on the day.</p>

<h2>Alcohol and licensing</h2>
<p>Your license sets the rules: whether guests can bring outside alcohol (usually not), how late you can serve, whether you can sell packaged beer to take home during the event, and how service has to work at a private party. Rules vary by state and municipality, so confirm yours before you write packages. Train staff on pacing and checking IDs at private events the same way you would on a busy Saturday.</p>

<h2>Pricing models that work in a taproom</h2>
<p><strong>Beverage minimum.</strong> The group commits to a total spend; guests buy rounds and the tab counts toward it. Simple, and it fits how taprooms already sell. Our <a href="/tools/food-beverage-minimum-calculator">F&amp;B minimum calculator</a> helps you set a number by comparing it to what that space earns on a normal night.</p>
<p><strong>Room or buyout fee.</strong> A flat fee for the space and time, best for buyouts when you're turning away regular customers. The <a href="/tools/room-rental-pricing-calculator">room rental pricing calculator</a> is a quick check.</p>
<p><strong>Drink tickets or packages.</strong> The host prepays a set number of pours per guest. This makes it easy for the host to budget, but you'll need clear rules on what a ticket covers.</p>
<p>Whichever you choose, take a deposit when the contract is signed, and write down what happens to it if they cancel. See <a href="/guides/private-event-deposit-policies-that-protect-your-venue">deposit policies that protect your venue</a> for wording.</p>

<h2>A booking process that holds up</h2>
<ol>
<li><strong>One inquiry form</strong> that asks for date, guest count, event type and budget.</li>
<li><strong>A same-day reply</strong> that confirms availability, names the space and gives the price model.</li>
<li><strong>A written proposal</strong> with the room fee, minimum and deposit amount.</li>
<li><strong>A signed agreement and deposit</strong> before you hold the date for certain.</li>
<li><strong>A one-page event sheet (a BEO)</strong> for the staff working that day: headcount, area, food arrangement, start and end times, special notes. Our <a href="/guides/what-is-a-beo">guide to BEOs</a> explains the format.</li>
</ol>

<h2>Where VenueSprocket fits</h2>
<p>VenueSprocket is built for this flow at restaurants, bars, breweries and taprooms. The free plan gives you an inquiry form you can embed on your site, unlimited inquiries, a lead dashboard and a customer record for every inquiry. Starter adds the lead pipeline and proposals with a room fee, F&amp;B minimum and deposit. Pro adds typed e-signature contracts, deposits collected through your own Stripe account, and a printable BEO for day-of staff. You can <a href="/start">start with the free inquiry form</a> and add the rest only if it saves you time.</p>
`,
};
