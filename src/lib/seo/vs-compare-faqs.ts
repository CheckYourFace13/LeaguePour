/**
 * Buyer FAQs for the /compare/[slug] pages. Rules (October 2026 review):
 * - Only questions a venue would really ask when choosing between the two.
 * - VenueSprocket-side answers must match src/lib/content-engine/facts.ts.
 * - Competitor-side statements stay at the level already on the page (who the product is aimed
 *   at) - no competitor pricing or feature specifics we haven't verified.
 * Rendered visibly and as FAQPage JSON-LD from the same array, so the two always match.
 */
export type CompareFaq = { q: string; a: string };

const NOT_BUILT =
  "VenueSprocket doesn't have room-by-room calendars or capacities, seating charts or floor plans, calendar sync, POS integrations, itemized menu-package builders, or automated follow-up emails to customers.";

const HOW_TO_START =
  "Start on the free plan - it gets your public inquiry page and lead dashboard live without a credit card or a sales call. Add proposals, e-signature contracts, Stripe deposits, and BEOs when you're ready to run a booking end to end.";

export const VS_COMPARE_FAQS: Record<string, CompareFaq[]> = {
  tripleseat: [
    {
      q: "Is VenueSprocket a replacement for Tripleseat?",
      a: "For an independent restaurant, bar, or brewery where one person handles events, it covers the core booking workflow: inquiry, proposal, contract, deposit, and BEO. For a venue with a dedicated event sales team, many concurrent bookings, or multiple departments, an enterprise platform like Tripleseat is built for that scale and VenueSprocket is not.",
    },
    { q: "What does VenueSprocket not do that larger event platforms do?", a: NOT_BUILT },
    {
      q: "Does VenueSprocket take a percentage of deposits?",
      a: "No. Deposits are charged directly on your own connected Stripe account and VenueSprocket takes no percentage; Stripe's standard processing fee applies. You pay a flat monthly plan fee.",
    },
    { q: "How do I try VenueSprocket?", a: HOW_TO_START },
  ],
  "perfect-venue": [
    {
      q: "How is VenueSprocket different from Perfect Venue?",
      a: "Both are aimed at restaurants and bars booking private events, and both cover inquiry through BEO. VenueSprocket deliberately keeps a narrower feature set with a free starting plan. The honest way to choose is to run one real inquiry through each and see which your team actually keeps up with.",
    },
    { q: "What should I check before choosing either one?", a: `${NOT_BUILT} If any of those matter to you, confirm the other tool includes them on its current plans before you decide.` },
    { q: "How do I try VenueSprocket?", a: HOW_TO_START },
  ],
  "planning-pod": [
    {
      q: "When is Planning Pod the better choice?",
      a: "When you need a full event-planning toolkit - seating charts, floor plans, budgeting, and vendor management - or you plan events for clients across many venues. VenueSprocket doesn't have those tools.",
    },
    {
      q: "When is VenueSprocket the better choice?",
      a: "When you're a single restaurant, bar, brewery, or event space and what you need is the booking workflow itself: a public inquiry page, a proposal with a room fee and food and beverage minimum, a typed e-signature contract, a Stripe deposit, and a BEO.",
    },
    { q: "What does VenueSprocket not do?", a: NOT_BUILT },
  ],
  caterease: [
    {
      q: "Does VenueSprocket handle catering production?",
      a: "No. VenueSprocket has no catering production sheets, kitchen workflow tools, or recipe and dietary tracking. Its BEO has free-text sections for food, beverage, allergies, staffing, and timeline that you fill in per event.",
    },
    {
      q: "Who should stay with catering-focused software?",
      a: "Catering companies and operations where kitchen production is as important as the booking - off-premise catering, multiple simultaneous events, or detailed dietary and production tracking.",
    },
    {
      q: "Who is VenueSprocket a better fit for?",
      a: "Venues hosting private events in their own space - restaurants, bars, breweries, taprooms - that need inquiries, proposals, contracts, deposits, and a BEO without catering-production complexity.",
    },
    { q: "How do I try VenueSprocket?", a: HOW_TO_START },
  ],
  "event-temple": [
    {
      q: "Is VenueSprocket suitable for hotels?",
      a: "Generally not. VenueSprocket has no hotel property-management integrations, guest-room blocks, or group sales tools. It's built for independent restaurants, bars, breweries, taprooms, and standalone event spaces.",
    },
    {
      q: "What does an independent venue get from VenueSprocket?",
      a: "A public inquiry page, a lead pipeline, proposals with a room fee and food and beverage minimum, typed e-signature contracts, Stripe deposits paid to your own account, and BEOs with a print-ready view.",
    },
    { q: "What does VenueSprocket not do?", a: NOT_BUILT },
  ],
  honeybook: [
    {
      q: "Can I run a venue's private events on HoneyBook?",
      a: "HoneyBook is designed for independent service businesses such as photographers and planners, so it handles proposals, contracts, and payments well but isn't built around venue documents like a Banquet Event Order. If a BEO for your kitchen and bar staff matters, that's the gap to look at.",
    },
    {
      q: "What does VenueSprocket do that's specific to venues?",
      a: "Proposals built around a room fee and a food and beverage minimum, a BEO that starts from the event record with sections for food, beverage, setup, staffing, AV, allergies, and timeline, and a public inquiry page that asks for event type, date, guest count, and budget.",
    },
    {
      q: "Does VenueSprocket send automated follow-up emails to clients?",
      a: "No. Customers get transactional emails only - inquiry confirmation, proposal link, contract link, deposit receipt. Reminder emails about untouched leads, unsigned contracts, and unpaid deposits go to your venue, not the customer.",
    },
  ],
  "google-forms": [
    {
      q: "When are Google Forms and a spreadsheet enough?",
      a: "When you host only a couple of private events a month and one person handles every step. The manual process starts to cost you when inquiries sit unanswered, deposits need chasing, or the details in the contract and the event sheet stop matching.",
    },
    {
      q: "What actually changes if I switch?",
      a: "An inquiry becomes a lead automatically instead of a spreadsheet row, the proposal, contract, and BEO are built from the same event record instead of retyped, the customer signs and pays the deposit online, and your venue gets a reminder email when a lead, contract, or deposit is still waiting.",
    },
    {
      q: "Can I keep my existing inquiry form?",
      a: "You'd replace it with your VenueSprocket inquiry page link, since that's what creates the lead. You can link to that page from the same button or menu item your current form uses.",
    },
  ],
  "email-pdf": [
    {
      q: "Is it worth changing if email and PDFs are working?",
      a: "If you book fewer than one private event a month, probably not yet. It becomes worth it when customers stall at 'print, sign, scan, and send back', when deposits arrive by check days later, or when you can't tell at a glance which inquiries still need a reply.",
    },
    {
      q: "Do my customers need to install or sign up for anything?",
      a: "No. They open a proposal link, accept it, type their name to sign the contract, and pay the deposit through Stripe - all from a phone browser, without creating an account.",
    },
    {
      q: "Does VenueSprocket email the customer a PDF of the signed contract?",
      a: "No. The signed contract, with the typed signature and timestamp, stays attached to the event in your dashboard. The BEO has a print-ready view you can save as a PDF from your browser.",
    },
  ],
};
