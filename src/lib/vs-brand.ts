/**
 * VenueSprocket brand constants.
 * Keep separate from LeaguePour's brand.ts — these two products share
 * infrastructure but have distinct identities.
 */

export const vsBrand = {
  name: "VenueSprocket",
  tagline: "Book more private events. Run them better.",
  subheadline:
    "VenueSprocket helps restaurants, breweries, bars, taprooms, and event spaces capture inquiries, send proposals, sign contracts, collect deposits, and create BEOs.",
  domain: "venuesprocket.com",
  email: "hello@venuesprocket.com",

  cta: {
    startFree: "Start Free",
    seeHowItWorks: "See How It Works",
    bookDemo: "Book a Demo",
    addLeaguePour: "Add LeaguePour for Game Nights",
    getStarted: "Get Started",
    viewPricing: "View Pricing",
    talkToUs: "Talk to Us",
  },

  // Short descriptions for cross-promotion on LeaguePour
  crossPromo: {
    fromLeaguePour:
      "Manage private events, BEOs, contracts, and deposits with VenueSprocket.",
    fromLeaguePourCta: "Book a private event here",
    leaguePourCard:
      "Fill slow nights with LeaguePour — leagues, tournaments, trivia, and game nights.",
  },

  venueTypes: [
    "Restaurants",
    "Breweries",
    "Bars",
    "Taprooms",
    "Event Spaces",
    "Banquet Halls",
  ] as const,

  eventTypes: [
    "Birthday Party",
    "Corporate Event",
    "Rehearsal Dinner",
    "Bridal Shower",
    "Holiday Party",
    "Fundraiser",
    "Private Room",
    "Other",
  ] as const,

  pipelineStages: [
    "New Inquiry",
    "Contacted",
    "Proposal Sent",
    "Contract Sent",
    "Deposit Pending",
    "Booked",
    "Final Details Needed",
    "BEO Ready",
    "Completed",
    "Lost",
  ] as const,

  competitors: [
    {
      slug: "tripleseat",
      name: "Tripleseat",
      category: "Enterprise event management",
    },
    {
      slug: "perfect-venue",
      name: "Perfect Venue",
      category: "Restaurant event management",
    },
    {
      slug: "planning-pod",
      name: "Planning Pod",
      category: "Event planning software",
    },
    {
      slug: "caterease",
      name: "Caterease",
      category: "Catering event management",
    },
    {
      slug: "event-temple",
      name: "Event Temple",
      category: "Venue management software",
    },
    {
      slug: "honeybook",
      name: "HoneyBook",
      category: "Client management for creatives",
    },
    {
      slug: "google-forms",
      name: "Google Forms + Spreadsheets",
      category: "Manual event management",
    },
    {
      slug: "email-pdf",
      name: "Email and PDF Planning",
      category: "Manual workflows",
    },
  ],
} as const;

export type VsEventType = (typeof vsBrand.eventTypes)[number];
export type VsVenueType = (typeof vsBrand.venueTypes)[number];
export type VsPipelineStage = (typeof vsBrand.pipelineStages)[number];
