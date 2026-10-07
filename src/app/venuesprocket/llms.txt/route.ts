// venuesprocket.com/llms.txt rewrites here (see vs-routing.ts). A concise, factual summary for
// LLM-based crawlers and assistants - keep it in sync with src/lib/content-engine/facts.ts, and
// never list a feature here that isn't in the product today.
const BODY = `# VenueSprocket

> VenueSprocket is private event management software for independent restaurants, breweries, bars, taprooms, banquet rooms, and event spaces. It covers the booking workflow from first inquiry to event day: public inquiry form, lead pipeline, proposal, typed e-signature contract, Stripe deposit, and Banquet Event Order (BEO).

Key facts:
- Customers never need an account: they submit an inquiry, accept a proposal from a secure link, sign the contract, and pay the deposit on their phone.
- Proposals carry a room fee, a food & beverage minimum, and a deposit amount. There is no itemized menu-package builder.
- Deposits are collected with Stripe Checkout directly on the venue's own Stripe account. VenueSprocket takes no percentage; Stripe's standard processing fee applies. Only the deposit is collected online.
- Reminder emails go to the venue (untouched leads, unsigned contracts, unpaid deposits, upcoming BEOs). Customers receive transactional emails only - no automated follow-up sequences.
- BEOs start from the event record and have a mobile-friendly, print-ready view. There are no room-by-room calendars, calendar sync, or POS integrations.
- Pricing: a free plan (inquiry form + lead dashboard) and paid monthly plans. See https://venuesprocket.com/pricing for current plans.

Related product:
- LeaguePour (https://leaguepour.com) is a separate companion product, with its own subscription, for bar leagues, tournaments, and trivia nights. It is not included in any VenueSprocket plan. An active subscriber to either product gets 50% off the other.

## Product
- [Features](https://venuesprocket.com/features): what VenueSprocket does today
- [Pricing](https://venuesprocket.com/pricing): plans and what each includes
- [Sample workflow](https://venuesprocket.com/demo): a fictional booking from inquiry to BEO
- [FAQ](https://venuesprocket.com/faq): straight answers, including what the product doesn't do
- [Compare](https://venuesprocket.com/compare): comparisons with other private event tools

## Guides and free resources
- [Guides](https://venuesprocket.com/guides): practical guides for running private events
- [Templates](https://venuesprocket.com/templates): BEO template, proposal and contract checklists
- [Free tools](https://venuesprocket.com/tools): food & beverage minimum and event deposit calculators
- [What is a BEO?](https://venuesprocket.com/guides/what-is-a-beo)

## Company
- [About](https://venuesprocket.com/about)
- [Contact](https://venuesprocket.com/contact)
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
