/**
 * VenueSprocket comparison page data.
 * Each entry populates the /compare/[slug] template.
 *
 * Rules:
 * - No false claims about competitors.
 * - No claims that VenueSprocket is cheaper without verifying current prices.
 * - Position VS as simpler, faster, more affordable for small/midsize venues.
 */

export type FeatureRow = {
  feature: string;
  vs: "yes" | "no" | "partial" | string;
  competitor: "yes" | "no" | "partial" | string;
};

export type VsCompareData = {
  slug: string;
  competitorName: string;
  competitorCategory: string;
  competitorBestFor: string;
  summary: string;
  competitorSummary: string;
  vsSummary: string;
  featureRows: FeatureRow[];
  vsBestFor: string[];
  competitorBestFor2: string[];
  cta: string;
};

const YES = "yes" as const;
const NO = "no" as const;
const PARTIAL = "partial" as const;

export const VS_COMPARE_DATA: Record<string, VsCompareData> = {
  tripleseat: {
    slug: "tripleseat",
    competitorName: "Tripleseat",
    competitorCategory: "Enterprise event management platform",
    competitorBestFor:
      "Hotels, large restaurants, multi-department catering operations, and enterprise hospitality groups with dedicated event sales teams.",
    summary:
      "Tripleseat is a well-established, feature-rich event management platform used by many mid-to-large hospitality organizations. VenueSprocket is built for smaller venues that need to get started quickly without enterprise pricing, onboarding complexity, or features built for hotel sales teams.",
    competitorSummary:
      "Tripleseat is a comprehensive event management platform with a large feature set covering leads, proposals, BEOs, contracts, and event calendar management. It's well-suited for venues with dedicated event sales staff who need a robust system.",
    vsSummary:
      "VenueSprocket is designed to get a small restaurant, brewery, bar, taproom, or event space up and running with private event management in one afternoon — not one week. It focuses on the core workflow: inquiry, proposal, contract, deposit, and BEO.",
    featureRows: [
      { feature: "Public inquiry form", vs: YES, competitor: YES },
      { feature: "Lead pipeline", vs: YES, competitor: YES },
      { feature: "Proposal builder", vs: YES, competitor: YES },
      { feature: "E-signature contracts", vs: YES, competitor: YES },
      { feature: "Stripe deposit collection", vs: YES, competitor: YES },
      { feature: "BEO builder", vs: YES, competitor: YES },
      { feature: "PDF export (BEO/proposal/contract)", vs: YES, competitor: YES },
      { feature: "Customer CRM", vs: YES, competitor: YES },
      { feature: "Public event & game-night tools (LeaguePour)", vs: YES, competitor: NO },
      { feature: "Automated follow-up emails", vs: YES, competitor: YES },
      { feature: "Free starting plan", vs: YES, competitor: NO },
      { feature: "Setup in one afternoon", vs: YES, competitor: PARTIAL },
      { feature: "Built for small/midsize venues", vs: YES, competitor: PARTIAL },
    ],
    vsBestFor: [
      "Restaurants, breweries, bars, taprooms, and small event spaces",
      "Venues that need to start quickly without a long onboarding",
      "Venues that also want public event tools to fill slow nights",
      "Venues that want a free starting plan",
      "Venues where the owner or one staff member runs events",
    ],
    competitorBestFor2: [
      "Hotels and large restaurants with dedicated event sales teams",
      "Multi-department hospitality groups",
      "Venues with complex event operations and many concurrent bookings",
      "Organizations that need deep CRM and enterprise reporting",
    ],
    cta: "Start free with VenueSprocket",
  },

  "perfect-venue": {
    slug: "perfect-venue",
    competitorName: "Perfect Venue",
    competitorCategory: "Restaurant event management software",
    competitorBestFor:
      "Restaurants and bars with active private dining programs that want a purpose-built event management system.",
    summary:
      "Perfect Venue is a solid private event management tool focused on restaurants and bars. VenueSprocket covers a similar workflow and adds the LeaguePour public events module, which helps venues fill slow nights with leagues and game nights.",
    competitorSummary:
      "Perfect Venue is built specifically for restaurant and bar event management. It covers the core workflow from inquiry to BEO and is well-regarded by restaurants that need a clean, focused private event tool.",
    vsSummary:
      "VenueSprocket covers the same core private event workflow and adds the LeaguePour public events module, so the same venue can also run leagues and game nights to fill slow nights.",
    featureRows: [
      { feature: "Public inquiry form", vs: YES, competitor: YES },
      { feature: "Lead pipeline", vs: YES, competitor: YES },
      { feature: "Proposal builder", vs: YES, competitor: YES },
      { feature: "E-signature contracts", vs: YES, competitor: YES },
      { feature: "Deposit collection", vs: YES, competitor: YES },
      { feature: "BEO builder", vs: YES, competitor: YES },
      { feature: "Customer CRM", vs: YES, competitor: YES },
      { feature: "Public event & league tools (LeaguePour)", vs: YES, competitor: NO },
      { feature: "Free starting plan", vs: YES, competitor: NO },
    ],
    vsBestFor: [
      "Restaurants, bars, breweries, and taprooms needing private event management",
      "Venues that also need public event tools like leagues and trivia nights",
      "Venues that want a simple free plan to start immediately",
    ],
    competitorBestFor2: [
      "Restaurants and bars that specifically want a purpose-built event management tool",
      "Venues familiar with or preferring Perfect Venue's existing interface",
    ],
    cta: "Try VenueSprocket free",
  },

  "planning-pod": {
    slug: "planning-pod",
    competitorName: "Planning Pod",
    competitorCategory: "Event planning and management software",
    competitorBestFor:
      "Event planners, venues, and caterers that manage many moving parts across multiple clients and need a comprehensive planning toolkit.",
    summary:
      "Planning Pod is a broad event planning platform with extensive features for planners and venues. VenueSprocket is more focused on the venue side — specifically private event booking, BEOs, contracts, and deposits.",
    competitorSummary:
      "Planning Pod covers a wide range of event management needs, including seating charts, floor plans, budgeting, and vendor management. It's a comprehensive tool for venues and event planners managing complex events.",
    vsSummary:
      "VenueSprocket is narrower and faster to start. It focuses on the private event booking workflow that most restaurants, bars, and breweries actually need: inquiry form, pipeline, proposal, contract, deposit, and BEO — without the full event-planning toolkit that's often overkill for a local venue.",
    featureRows: [
      { feature: "Public inquiry form", vs: YES, competitor: YES },
      { feature: "Lead pipeline", vs: YES, competitor: YES },
      { feature: "Proposal builder", vs: YES, competitor: YES },
      { feature: "E-signature contracts", vs: YES, competitor: YES },
      { feature: "Deposit collection", vs: YES, competitor: YES },
      { feature: "BEO builder", vs: YES, competitor: YES },
      { feature: "Customer CRM", vs: YES, competitor: YES },
      { feature: "Seating charts / floor plans", vs: NO, competitor: YES },
      { feature: "Public event & league tools (LeaguePour)", vs: YES, competitor: NO },
      { feature: "Free starting plan", vs: YES, competitor: PARTIAL },
      { feature: "Setup in one afternoon (small venues)", vs: YES, competitor: PARTIAL },
    ],
    vsBestFor: [
      "Restaurants, bars, and breweries that want simple private event management",
      "Venues that don't need seating charts or full event planning tools",
      "Venues that want a free plan to start immediately",
      "Venues that need public event tools alongside private events",
    ],
    competitorBestFor2: [
      "Venues and event planners that need seating charts and floor plans",
      "Complex multi-event operations with many vendors and moving parts",
      "Professional event planning businesses managing client events",
    ],
    cta: "Start free with VenueSprocket",
  },

  caterease: {
    slug: "caterease",
    competitorName: "Caterease",
    competitorCategory: "Catering and event management software",
    competitorBestFor:
      "Catering companies, hotels, and large food-service operations with complex catering workflows.",
    summary:
      "Caterease is a long-established catering and event management platform with deep features for complex catering operations. VenueSprocket is a simpler, faster-to-start alternative built specifically for local venues — restaurants, bars, breweries, and taprooms — that don't need full catering management software.",
    competitorSummary:
      "Caterease is a feature-rich catering and event management platform with decades of history. It covers catering-specific needs like production sheets, dietary tracking, and kitchen workflow alongside event management.",
    vsSummary:
      "VenueSprocket skips catering-specific complexity and focuses on what local venues need: capturing private event inquiries, sending proposals, signing contracts, collecting deposits, and generating BEOs.",
    featureRows: [
      { feature: "Public inquiry form", vs: YES, competitor: YES },
      { feature: "Lead pipeline", vs: YES, competitor: YES },
      { feature: "Proposal builder", vs: YES, competitor: YES },
      { feature: "E-signature contracts", vs: YES, competitor: YES },
      { feature: "Deposit collection", vs: YES, competitor: YES },
      { feature: "BEO builder", vs: YES, competitor: YES },
      { feature: "Catering production sheets", vs: NO, competitor: YES },
      { feature: "Kitchen workflow tools", vs: NO, competitor: YES },
      { feature: "Public event & league tools (LeaguePour)", vs: YES, competitor: NO },
      { feature: "Free starting plan", vs: YES, competitor: NO },
      { feature: "Modern web-first interface", vs: YES, competitor: PARTIAL },
    ],
    vsBestFor: [
      "Restaurants, bars, breweries, taprooms, and local event spaces",
      "Venues that want a fast setup without catering-specific workflows",
      "Venues that want a free plan to start immediately",
      "Smaller operations where one person manages events",
    ],
    competitorBestFor2: [
      "Catering companies with complex kitchen and production workflows",
      "Hotels and large catering operations with dietary and production tracking needs",
      "Operations where catering management is as important as event management",
    ],
    cta: "Try VenueSprocket free",
  },

  "event-temple": {
    slug: "event-temple",
    competitorName: "Event Temple",
    competitorCategory: "Venue management software",
    competitorBestFor:
      "Hotels, large event venues, and hospitality groups that need a hotel-property-focused venue management platform.",
    summary:
      "Event Temple is a venue management platform designed around hotel and hospitality property workflows. VenueSprocket is focused on the independent restaurant, bar, brewery, and taproom market — simpler to start and priced for small venues.",
    competitorSummary:
      "Event Temple provides venue management tools with a strong focus on hotel and property management integration. It covers group sales, event management, and CRM for the hotel and venue industry.",
    vsSummary:
      "VenueSprocket is built for local independent venues, not hotel property teams. It gets a small venue's private event booking page live quickly and manages the inquiry-to-BEO workflow — without hotel-specific complexity.",
    featureRows: [
      { feature: "Public inquiry form", vs: YES, competitor: YES },
      { feature: "Lead pipeline / CRM", vs: YES, competitor: YES },
      { feature: "Proposal builder", vs: YES, competitor: YES },
      { feature: "E-signature contracts", vs: YES, competitor: YES },
      { feature: "Deposit collection", vs: YES, competitor: YES },
      { feature: "BEO builder", vs: YES, competitor: YES },
      { feature: "Hotel property management integration", vs: NO, competitor: YES },
      { feature: "Public event & league tools (LeaguePour)", vs: YES, competitor: NO },
      { feature: "Free starting plan", vs: YES, competitor: NO },
      { feature: "Designed for independent local venues", vs: YES, competitor: PARTIAL },
    ],
    vsBestFor: [
      "Independent restaurants, bars, breweries, taprooms, and event spaces",
      "Venues that need simple, fast private event management",
      "Small venues where the owner manages their own events",
      "Venues that want a free plan to start immediately",
    ],
    competitorBestFor2: [
      "Hotels and branded hospitality properties",
      "Large venue groups with property management system needs",
      "Organizations that need hotel-specific integrations",
    ],
    cta: "Start free with VenueSprocket",
  },

  honeybook: {
    slug: "honeybook",
    competitorName: "HoneyBook",
    competitorCategory: "Client management platform for independent businesses",
    competitorBestFor:
      "Freelancers, photographers, wedding planners, and independent creative service businesses that need client management and invoicing.",
    summary:
      "HoneyBook is a client management and invoicing tool popular with creative service businesses — photographers, wedding planners, designers. VenueSprocket is purpose-built for hospitality venues — restaurants, bars, breweries — with venue-specific tools like BEOs, room management, and the LeaguePour public events module.",
    competitorSummary:
      "HoneyBook is a well-designed platform for independent service businesses. It handles proposals, contracts, invoices, and client communication in a clean interface. It's widely used by creative professionals.",
    vsSummary:
      "VenueSprocket is purpose-built for the venue and hospitality market. It understands the specific language of private event booking — BEOs, event spaces, room minimums, banquet menus, deposits — and includes tools specific to venues like staff day-of views and LeaguePour for public events.",
    featureRows: [
      { feature: "Proposals and contracts", vs: YES, competitor: YES },
      { feature: "Online payment collection", vs: YES, competitor: YES },
      { feature: "Client/customer CRM", vs: YES, competitor: YES },
      { feature: "Automated follow-up emails", vs: YES, competitor: YES },
      { feature: "BEO builder", vs: YES, competitor: NO },
      { feature: "Venue-specific inquiry form", vs: YES, competitor: PARTIAL },
      { feature: "Event space / room management", vs: YES, competitor: NO },
      { feature: "Public event & league tools (LeaguePour)", vs: YES, competitor: NO },
      { feature: "Staff day-of-event mobile view", vs: YES, competitor: NO },
      { feature: "Purpose-built for hospitality venues", vs: YES, competitor: NO },
      { feature: "Free starting plan", vs: YES, competitor: PARTIAL },
    ],
    vsBestFor: [
      "Restaurants, breweries, bars, taprooms, banquet halls, and event spaces",
      "Venues that need BEOs, room management, and venue-specific workflows",
      "Venues that want a free plan to start immediately",
      "Hospitality businesses that also want public event programming",
    ],
    competitorBestFor2: [
      "Photographers, wedding planners, and creative service professionals",
      "Independent freelancers who need client management and invoicing",
      "Non-hospitality service businesses that work project-to-project",
    ],
    cta: "Try VenueSprocket free",
  },

  "google-forms": {
    slug: "google-forms",
    competitorName: "Google Forms and Spreadsheets",
    competitorCategory: "Manual event management with free tools",
    competitorBestFor:
      "Venues just starting out that haven't outgrown basic tools yet, or venues that only handle a handful of events per year.",
    summary:
      "Many venues manage private events with Google Forms for inquiries, Google Sheets for tracking, and Word documents for proposals and BEOs. This works when volume is very low, but it doesn't scale — and it loses leads. VenueSprocket replaces the manual patchwork with a system built for venue private events.",
    competitorSummary:
      "Google Forms and Sheets are free tools that many venues use to manage their first few private events. They're flexible, familiar, and cost nothing to start. For very low-volume venues, they can work.",
    vsSummary:
      "VenueSprocket replaces the manual patchwork — Google Form for the inquiry, spreadsheet for tracking, Word doc for the proposal, PDF for the contract, another spreadsheet for deposits — with a single connected system. One inquiry becomes a lead, then a proposal, then a signed contract, then a deposit, then a BEO, without copying data between tools.",
    featureRows: [
      { feature: "Public inquiry form", vs: YES, competitor: YES },
      { feature: "Lead pipeline with stages", vs: YES, competitor: NO },
      { feature: "Proposal builder", vs: YES, competitor: NO },
      { feature: "E-signature contracts", vs: YES, competitor: NO },
      { feature: "Online deposit collection", vs: YES, competitor: NO },
      { feature: "BEO builder", vs: YES, competitor: NO },
      { feature: "Customer CRM", vs: YES, competitor: NO },
      { feature: "Automated follow-up", vs: YES, competitor: NO },
      { feature: "LeaguePour public event tools", vs: YES, competitor: NO },
      { feature: "Mobile-friendly staff view", vs: YES, competitor: PARTIAL },
      { feature: "Cost to start", vs: "Free plan", competitor: "Free (manual labor cost)" },
    ],
    vsBestFor: [
      "Venues ready to stop losing leads because inquiries fall through email",
      "Venues tired of building proposals and BEOs from scratch each time",
      "Venues that want to get deposits paid without chasing customers",
      "Venues doing more than 2-3 private events per month",
    ],
    competitorBestFor2: [
      "Venues doing fewer than 2-3 private events per month",
      "Venues just starting and not sure if private events will be consistent",
      "Venues where one person has the full manual process fully under control",
    ],
    cta: "Start free with VenueSprocket",
  },

  "email-pdf": {
    slug: "email-pdf",
    competitorName: "Email and PDF Planning",
    competitorCategory: "Manual event management",
    competitorBestFor:
      "Very small venues or those new to private events who haven't set up a formal system yet.",
    summary:
      "Managing private events through email threads and PDF documents is common for small venues, but it's slow, error-prone, and loses leads. VenueSprocket replaces email-and-PDF with a connected workflow from inquiry to BEO.",
    competitorSummary:
      "Email and PDFs are the default way many local venues manage private events — send a PDF menu, go back and forth over email, send a Word document contract, collect a check. It requires no software cost but has high manual cost in staff time and lost leads.",
    vsSummary:
      "VenueSprocket automates the workflow: the customer fills out a form, you get a notification, you send a proposal link, they accept online, they sign the contract from their phone, they pay the deposit through Stripe, and the BEO is auto-generated. No email threads, no manual documents, no chasing.",
    featureRows: [
      { feature: "Public inquiry form", vs: YES, competitor: "Manual" },
      { feature: "Lead pipeline", vs: YES, competitor: NO },
      { feature: "Proposal creation", vs: YES, competitor: "Manual PDF" },
      { feature: "E-signature contracts", vs: YES, competitor: "Manual PDF" },
      { feature: "Online deposit collection", vs: YES, competitor: "Check or manual Venmo" },
      { feature: "BEO generation", vs: YES, competitor: "Manual Word doc" },
      { feature: "Customer records", vs: YES, competitor: "Email thread" },
      { feature: "Automated follow-up", vs: YES, competitor: NO },
      { feature: "LeaguePour public event tools", vs: YES, competitor: NO },
      { feature: "Mobile-friendly customer experience", vs: YES, competitor: NO },
    ],
    vsBestFor: [
      "Any venue ready to stop losing leads and manual hours to email-and-PDF planning",
      "Venues doing 1+ private events per month",
      "Venues that want customers to pay deposits online instead of bringing a check",
    ],
    competitorBestFor2: [
      "Venues doing fewer than one private event per month",
      "Venues where one person can keep everything in their head",
    ],
    cta: "Start free and replace the email patchwork",
  },
};
