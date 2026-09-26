/**
 * Curated, hand-verified list of what each product actually does today. This is the single
 * source of truth the generator is grounded on and the quality gate checks claims against - if a
 * feature isn't listed here, the article must not claim the product does it. Keep this in sync
 * with reality by hand; do not let the generator infer facts on its own.
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
    "Games supported: trivia, darts, cornhole, euchre, pool, poker (where legal), shuffleboard, music bingo.",
  ],
  VS: [
    "VenueSprocket manages private events end-to-end: inquiry -> lead pipeline -> proposal -> e-signature contract -> Stripe deposit -> BEO (Banquet Event Order).",
    "The public inquiry form is free to set up and requires no setup wizard.",
    "Leads move through a Kanban-style pipeline: New -> Contacted -> Proposal Sent -> Contract Sent -> Booked -> BEO Ready -> Completed.",
    "Proposals are built from the event record with line items (packages, room fees, minimums, deposit amount) and sent as a secure link the customer accepts in one click.",
    "Contracts use a typed e-signature (name typed + checkbox acceptance) recorded with timestamp and IP - not DocuSign, no PDF auto-emailed on signature.",
    "Deposits are collected through Stripe Checkout (a direct charge on the venue's own connected Stripe account) immediately after contract signing.",
    "BEOs auto-fill basic fields from the linked event/lead/customer/room (event name, date, time, guest count, contact info, room name) - food, beverage, staffing, AV, and timeline fields are filled in manually by the venue.",
    "There is a simplified, mobile-friendly, print-ready BEO view for day-of staff reference (requires venue login - not a separate staff-only role).",
    "Automated follow-up is real: stale leads, pending proposals, pending contracts, and unpaid deposits all get automatic reminder emails via a daily job; post-event follow-up is also automated.",
    "The customer directory auto-creates a record from every inquiry, showing name, email, phone, company, and how many past events they've booked. There is NO tagging, notes, or marketing-opt-in UI anywhere - do not claim CRM tagging/segmentation features.",
    "There is no dedicated reporting/analytics page - only simple dashboard counters (new leads, proposals sent, contracts signed, pending deposits) and payment totals (collected/pending) on the Payments page. Do not claim advanced reporting, revenue charts, or breakdowns.",
    "Multi-room/multi-space event support does not exist in the UI - the EventSpace data model exists but has no create/manage screen anywhere.",
    "There is no plan-based staff-count limit enforced anywhere in the code.",
    "VenueSprocket is a separate product from LeaguePour with its own subscription; an active subscriber to either gets 50% off the other. LeaguePour is not included with any VenueSprocket plan.",
    "Built for restaurants, breweries, bars, taprooms, banquet rooms, and event spaces - private events like birthday parties, corporate events, holiday parties, rehearsal dinners, private dining.",
  ],
};
