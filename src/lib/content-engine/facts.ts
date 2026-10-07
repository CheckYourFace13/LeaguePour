/**
 * Curated, hand-verified list of what each product actually does today. This is the single
 * source of truth whoever writes an article body is grounded on, and the deterministic quality
 * gate checks claims against (see FORBIDDEN_CLAIM_PATTERNS below) - if a feature isn't listed
 * here, an article must not claim the product does it. Keep this in sync with reality by hand.
 *
 * Sourced from the September 26 2026 code-vs-marketing audit (see memory) - every line here was
 * independently verified against the actual implementation, not against existing marketing copy.
 */
import type { Brand } from "./types";

export const PRODUCT_FACTS: Record<Brand, string[]> = {
  LP: [
    "Venues create competitions in these formats: Single elimination, Round robin, or Custom (manual, for any other format).",
    "Single elimination and Round robin brackets/schedules are generated automatically when a competition is published or Start Tournament is pressed.",
    "Double elimination, Swiss, ladder, season, points, pool play, and best-of series are NOT auto-generated - these are roadmap/planned only. Custom format lets a venue run them manually today.",
    "Standings use a standard 3 win / 1 tie / 0 loss point system, recomputed automatically from entered match scores, tiebroken by total wins.",
    "Players register from their phone via a public competition page - solo, captain-led team, or roster invite. No app download required.",
    "Venues connect Stripe Connect; entry fees are collected via Stripe Checkout and paid out directly to the venue's own bank account, minus a platform fee set in venue settings.",
    "Free events (entry fee $0) are supported, no payment required.",
    "Every venue and every competition gets a public page with QR code registration.",
    "Staff enter scores from the venue dashboard; standings update automatically on the public page.",
    "Email campaigns to a venue's opted-in player audience are real and functional (in-app draft + send).",
    "SMS is NOT a working send channel - campaign sending only supports email today; any SMS-related copy must not claim SMS delivery works.",
    "There is no plan-based limit on staff accounts - unlimited staff on every plan.",
    "The only plan-based limit anywhere in the product is the number of concurrently-active competitions (STARTER=2, GROWTH=9, PRO=19, ELITE=unlimited).",
    "Multi-location support does not exist - no code path for it.",
    "There is NO waitlist: when a competition reaches its participant cap, signup simply closes (\"This event is full\"). Nothing notifies anyone when a spot opens.",
    "There is NO check-in feature - no attendance field. The registration list (confirmed/paid) can be printed or pulled up and used as a check-in sheet.",
    "Bracket seeding is registration order (oldest first). Automatic seeding from standings, and placement-based scoring (e.g. poker finish positions -> season points), are roadmap only.",
    "Players pay a $1.50 service fee on top of the entry fee; the venue receives the entry fee minus a 5% platform fee.",
    "Games supported: trivia, darts, cornhole, euchre, pool, poker (where legal), shuffleboard, music bingo.",
  ],
  VS: [
    "VenueSprocket manages private events end-to-end: inquiry -> lead pipeline -> proposal -> e-signature contract -> Stripe deposit -> BEO (Banquet Event Order).",
    "The public inquiry form is free to set up and requires no setup wizard.",
    "Leads move through a Kanban-style pipeline: New -> Contacted -> Proposal Sent -> Contract Sent -> Booked -> BEO Ready -> Completed.",
    "Proposals are built from the event record with a room fee, a food & beverage minimum, and a deposit amount (there is NO itemized menu/package line-item entry in the UI) and sent as a secure link the customer accepts in one click.",
    "Contracts use a typed e-signature (name typed + checkbox acceptance) recorded with timestamp and IP - not DocuSign, no PDF auto-emailed on signature.",
    "Deposits are collected through Stripe Checkout (a direct charge on the venue's own connected Stripe account) immediately after contract signing.",
    "BEOs auto-fill basic fields from the linked event/lead/customer/room (event name, date, time, guest count, contact info, room name) - food, beverage, staffing, AV, and timeline fields are filled in manually by the venue.",
    "There is a simplified, mobile-friendly, print-ready BEO view for day-of staff reference (requires venue login - not a separate staff-only role).",
    "Automatic reminders are real but go to the VENUE, not the customer: a daily job emails the venue (once per item) about untouched leads, pending proposals, unsigned contracts, unpaid deposits, upcoming events needing a BEO, and completed events worth a rebooking follow-up. There are NO automated follow-up emails or sequences sent to customers.",
    "Customers receive transactional emails only: inquiry confirmation, proposal-ready link, contract-ready link, deposit receipt, and refund notice.",
    "The deposit is a fixed dollar amount entered on each proposal. Only the deposit is collected online - there is no balance, installment, or final-payment tracking.",
    "There is no calendar view - events are shown as a list. There are no room-by-room calendars, capacities, or room scheduling.",
    "VenueSprocket takes $0 platform fee on deposits (direct charge on the venue's own Stripe account); Stripe's standard processing fee applies.",
    "The customer directory auto-creates a record from every inquiry, showing name, email, phone, company, and how many past events they've booked. There is NO tagging, notes, or marketing-opt-in UI anywhere - do not claim CRM tagging/segmentation features.",
    "There is no dedicated reporting/analytics page - only simple dashboard counters (new leads, proposals sent, contracts signed, pending deposits) and payment totals (collected/pending) on the Payments page. Do not claim advanced reporting, revenue charts, or breakdowns.",
    "Multi-room/multi-space event support does not exist in the UI - the EventSpace data model exists but has no create/manage screen anywhere.",
    "There is no plan-based staff-count limit enforced anywhere in the code.",
    "VenueSprocket is a separate product from LeaguePour with its own subscription; an active subscriber to either gets 50% off the other. LeaguePour is not included with any VenueSprocket plan.",
    "Built for restaurants, breweries, bars, taprooms, banquet rooms, and event spaces - private events like birthday parties, corporate events, holiday parties, rehearsal dinners, private dining.",
  ],
};

/**
 * Deterministic (no LLM) product-accuracy check: a body matching any of these patterns is
 * claiming something not in PRODUCT_FACTS - the exact false-claim patterns found and corrected in
 * the September 26 2026 audit (Swiss format, SMS delivery, CRM tags, multi-location/reporting,
 * signed-contract PDF auto-email). Case-insensitive. This is necessarily a denylist, not a
 * complete accuracy proof - whoever writes the body is still responsible for only using
 * PRODUCT_FACTS, this just catches the specific claims already known to be wrong.
 */
export const FORBIDDEN_CLAIM_PATTERNS: Record<Brand, RegExp[]> = {
  LP: [
    /swiss format/i,
    /\bsms\b.{0,20}(alert|campaign|notif|delivery|sent|sends|message)/i,
    /(alert|campaign|notif|delivery|sent|sends|message).{0,20}\bsms\b/i,
    /(staff|account).{0,15}limit/i,
    /multi-?location/i,
    /(auto|automatic(ally)?).{0,15}waitlist|waitlist.{0,40}notif/i,
    /(seeded|seeding).{0,30}(standings|season)/i,
  ],
  VS: [
    /tag(ging|s)?\b.{0,25}(customer|segment|filter)/i,
    /(customer|segment|filter).{0,25}tag(ging|s)?\b/i,
    /marketing opt-?in/i,
    /(auto|automatic).{0,20}(email|send).{0,20}(pdf|signed contract)/i,
    /(pdf|signed contract).{0,20}(auto|automatic).{0,20}(email|send)/i,
    /multi-?(room|location|space)/i,
    /(revenue|analytics).{0,20}(chart|dashboard|report)/i,
    /(staff|account).{0,15}limit/i,
    /automated follow-?up (email|sequence)s? (to|for) (the )?(customer|client|guest)/i,
    /calendar view/i,
    /room (scheduling|management)/i,
  ],
};
