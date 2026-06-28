export type VsLandingData = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  hero: string;
  heroSub: string;
  icon: string;
  why: string;
  features: { title: string; body: string }[];
  useCases: string[];
  faqs: { q: string; a: string }[];
  cta: string;
  ctaSub: string;
};

export const VS_LANDING_DATA: Record<string, VsLandingData> = {
  "private-event-booking-software": {
    slug: "private-event-booking-software",
    title: "Private Event Booking Software",
    metaTitle: "Private Event Booking Software for Restaurants, Bars & Venues — VenueSprocket",
    metaDescription:
      "VenueSprocket makes private event booking simple. Capture inquiries, send proposals, sign contracts, collect deposits, and build BEOs — all in one place for restaurants, bars, and breweries.",
    kicker: "Private event booking",
    hero: "Stop losing private event leads to email and spreadsheets",
    heroSub:
      "VenueSprocket gives your venue a public inquiry page, a simple lead pipeline, and the tools to turn inquiries into signed contracts and paid deposits — without complicated software.",
    icon: "🎉",
    why: "Most venues manage private events through a mix of email threads, Google Forms, Word documents, and spreadsheets. Inquiries get lost. Proposals take too long. Contracts never get signed. Deposits are collected by check. VenueSprocket replaces all of that with a single connected workflow.",
    features: [
      {
        title: "Public inquiry form",
        body: "Your venue gets a public booking page customers can find and fill out in under two minutes. No app, no login, no friction. Event type, date, guest count, budget — captured automatically.",
      },
      {
        title: "Lead pipeline",
        body: "Every inquiry lands in your dashboard and moves through a simple pipeline: New → Contacted → Proposal Sent → Contract Sent → Booked → BEO Ready → Completed.",
      },
      {
        title: "Proposal builder",
        body: "Build and send a proposal in minutes. The customer gets a clean link they can view on their phone and accept with one click. Timestamps recorded automatically.",
      },
      {
        title: "Online contract signing",
        body: "Customers sign from their phone — no DocuSign required. Typed signature, checkbox, timestamp, and IP recorded. PDF sent automatically.",
      },
      {
        title: "Stripe deposit collection",
        body: "After signing, the deposit is paid through Stripe immediately. No checks, no chasing. You see the money; the lead moves to Booked.",
      },
      {
        title: "BEO generation",
        body: "BEOs are built from the same event details you already entered. Staff see everything they need on event day without digging through email.",
      },
    ],
    useCases: [
      "Restaurants with private dining rooms",
      "Bars and breweries running birthday parties and corporate happy hours",
      "Taprooms adding private event programming",
      "Small banquet rooms and event spaces",
      "Venues tired of losing leads through email",
    ],
    faqs: [
      {
        q: "Do customers need to create an account to submit an inquiry?",
        a: "No. The public inquiry form requires no login or account. Customers fill it out in under two minutes from their phone.",
      },
      {
        q: "Can I get started with a free plan?",
        a: "Yes. The free plan gets your inquiry form live immediately with no credit card required. Upgrade to Pro for contracts, deposits, and BEOs.",
      },
      {
        q: "Does VenueSprocket replace my current booking system?",
        a: "VenueSprocket is designed to replace the email-and-spreadsheet patchwork most small venues use. If you are on a more complex enterprise system, compare the features on our pricing page.",
      },
    ],
    cta: "Start free today",
    ctaSub: "Your inquiry form can be live in under ten minutes.",
  },

  "beo-software": {
    slug: "beo-software",
    title: "BEO Software for Venues",
    metaTitle: "BEO Software for Restaurants, Bars & Event Venues — VenueSprocket",
    metaDescription:
      "Create Banquet Event Orders (BEOs) without starting from scratch. VenueSprocket generates BEOs from your event details with PDF export and a mobile day-of-event view for staff.",
    kicker: "BEO builder",
    hero: "Build BEOs in minutes, not hours",
    heroSub:
      "VenueSprocket generates a Banquet Event Order from the details already in your event record. No starting from a blank Word document. Staff see what they need on event day, on their phone.",
    icon: "📑",
    why: "Most venues build BEOs from scratch for every event — a Word document with copy-pasted details, printed and left in the kitchen, then lost or wrong when something changes. VenueSprocket builds the BEO from the same event record used for the inquiry, proposal, and contract. Change something once — the BEO updates everywhere.",
    features: [
      {
        title: "Auto-generated from your event record",
        body: "The BEO pulls event name, date, time, guest count, room, contact info, packages, and notes from the details you already entered. No re-keying data.",
      },
      {
        title: "Food, beverage, staffing, AV sections",
        body: "Each BEO includes structured sections for food details, beverage selection, room setup, staffing notes, AV needs, allergies, and special instructions.",
      },
      {
        title: "Timeline builder",
        body: "Add a time-based event timeline — venue open, setup complete, guest arrival, service start, speeches, teardown — so staff know the sequence without asking.",
      },
      {
        title: "Internal notes",
        body: "Internal staff notes on the BEO stay internal. Customers never see them. Great for manager alerts, VIP notes, or reminders about specific setup details.",
      },
      {
        title: "PDF export",
        body: "Export and print any BEO as a clean PDF. Attach it to a folder, email it to your kitchen, or share it with your event team.",
      },
      {
        title: "Mobile day-of-event staff view",
        body: "Staff can pull up the BEO on their phone during the event. Clean, readable, no need to find the printed copy or dig through email.",
      },
    ],
    useCases: [
      "Restaurants managing private dining BEOs",
      "Bars and breweries running booked events",
      "Event venues that send BEOs to kitchen and bar staff",
      "Banquet rooms with detailed food and setup requirements",
      "Any venue replacing printed Word-document BEOs",
    ],
    faqs: [
      {
        q: "What does BEO stand for?",
        a: "BEO stands for Banquet Event Order. It is a document that summarizes every detail of an event — food, beverage, setup, staffing, timeline — so all staff know what to do.",
      },
      {
        q: "Can I edit the BEO after generating it?",
        a: "Yes. Any field on the BEO can be edited, and you can re-export a PDF with updated details at any time.",
      },
      {
        q: "Does BEO creation require a paid plan?",
        a: "BEO creation is included in the Pro plan and above. The free plan includes lead capture and the basic dashboard.",
      },
    ],
    cta: "Start building BEOs",
    ctaSub: "Generate your first BEO from an existing event in minutes.",
  },

  "event-contract-software": {
    slug: "event-contract-software",
    title: "Event Contract Software for Venues",
    metaTitle: "Event Contract Software — Sign Private Event Contracts Online — VenueSprocket",
    metaDescription:
      "Get private event contracts signed online without DocuSign. VenueSprocket includes typed e-signature contract signing built for restaurants, bars, and event venues.",
    kicker: "Event contracts",
    hero: "Get contracts signed from a phone, not a printer",
    heroSub:
      "VenueSprocket generates a contract from your event record, sends the customer a secure link, and records their typed signature with timestamp and IP address. No DocuSign subscription needed.",
    icon: "✍️",
    why: "Most small venues either skip contracts entirely, or send a PDF that customers have to print, sign, scan, and email back. That process loses bookings. VenueSprocket makes contract signing a one-tap step on the customer's phone — right after they accept the proposal.",
    features: [
      {
        title: "Contract generated from event data",
        body: "The contract is built from your event and proposal details — event name, date, guest count, deposit amount, cancellation policy — using your venue's contract template.",
      },
      {
        title: "Typed e-signature",
        body: "Customers type their name as a signature and check a confirmation box. No drawing, no image upload, no fuss. Works on any phone or computer.",
      },
      {
        title: "Timestamp and IP recording",
        body: "Every contract records the signer's name, email, typed signature, exact timestamp, IP address, and user agent — creating a legally meaningful record.",
      },
      {
        title: "PDF confirmation sent automatically",
        body: "After signing, the customer receives a PDF copy of the signed contract by email automatically. Your venue records stay up to date.",
      },
      {
        title: "Mobile-first signing experience",
        body: "The signing page is designed to work cleanly on a phone. Most customers sign within minutes of receiving the link.",
      },
      {
        title: "Integrated with your proposal workflow",
        body: "After the customer accepts the proposal, the contract is the next step. No switching tools, no copy-pasting details.",
      },
    ],
    useCases: [
      "Restaurants needing signed contracts for private dining",
      "Bars and breweries locking in birthday and corporate events",
      "Event venues with cancellation policy enforcement",
      "Any venue currently sending PDF contracts by email",
    ],
    faqs: [
      {
        q: "Is a typed e-signature legally enforceable?",
        a: "Typed signatures with recorded timestamps and IP addresses are widely used for business agreements. For specific legal requirements, consult an attorney familiar with your jurisdiction.",
      },
      {
        q: "Can I use my own contract template?",
        a: "Yes. VenueSprocket includes a default contract template and lets you customize the text to reflect your venue's terms, cancellation policy, and deposit requirements.",
      },
      {
        q: "Does the customer need an account to sign?",
        a: "No. Signing happens through a secure link. No login required.",
      },
    ],
    cta: "Start getting contracts signed",
    ctaSub: "First contract can be sent in under ten minutes.",
  },

  "event-deposit-software": {
    slug: "event-deposit-software",
    title: "Event Deposit Software for Venues",
    metaTitle: "Event Deposit & Payment Software for Private Events — VenueSprocket",
    metaDescription:
      "Collect private event deposits through Stripe without chasing checks. VenueSprocket makes deposit collection a one-step process after contract signing for restaurants, bars, and venues.",
    kicker: "Deposit collection",
    hero: "Collect deposits online. Stop chasing checks.",
    heroSub:
      "VenueSprocket connects Stripe to your event workflow. After a customer signs the contract, they pay the deposit immediately through a Stripe payment link. No invoices, no checks, no chasing.",
    icon: "💳",
    why: "Collecting a deposit by check is a full-stop in the booking flow. Customers say they'll drop it off and then don't come back. Requiring an in-person payment loses bookings. VenueSprocket makes deposit payment a single step that happens right after contract signing, from the customer's phone.",
    features: [
      {
        title: "Stripe payment integration",
        body: "Deposits are collected through Stripe — the same payment processor trusted by millions of businesses. Funds go directly to your connected Stripe account.",
      },
      {
        title: "Deposit set on the proposal",
        body: "The deposit amount is defined when you build the proposal — flat dollar amount or percentage. Customers know exactly what they owe before signing.",
      },
      {
        title: "One-click payment after signing",
        body: "After the customer signs the contract, they see the deposit payment step immediately. Most customers pay within the same session.",
      },
      {
        title: "Payment status in your dashboard",
        body: "Every event shows paid/unpaid deposit status in the dashboard. No more wondering who has paid and who hasn't.",
      },
      {
        title: "Stripe confirmation email",
        body: "Customers receive a Stripe payment confirmation automatically. Your internal event record updates to 'Deposit Paid' immediately.",
      },
      {
        title: "Payment tracking by event",
        body: "Each event has a payment history so you can track the deposit, any additional payments, and balances due.",
      },
    ],
    useCases: [
      "Restaurants requiring deposits for private dining reservations",
      "Bars and breweries collecting event deposits before locking a date",
      "Event venues that currently collect deposits by check",
      "Any venue losing bookings due to friction in the deposit process",
    ],
    faqs: [
      {
        q: "Does VenueSprocket take a cut of the deposit?",
        a: "No. VenueSprocket charges a flat monthly plan fee. Stripe charges their standard processing fee (typically 2.9% + $0.30 per transaction) directly. VenueSprocket takes no percentage of your event revenue.",
      },
      {
        q: "Do I need a Stripe account?",
        a: "Yes. You connect your Stripe account to VenueSprocket during setup. If you don't have one, Stripe is free to sign up and is required to collect online payments.",
      },
      {
        q: "Can I collect the full event payment through VenueSprocket?",
        a: "VenueSprocket supports deposit collection. Additional payment tracking is included so you can record balances due and final payments.",
      },
    ],
    cta: "Start collecting deposits online",
    ctaSub: "Connect Stripe and receive your first deposit in the same session.",
  },

  "venue-marketing-software": {
    slug: "venue-marketing-software",
    title: "Venue Marketing Software",
    metaTitle: "Venue Marketing Software — Get More Private Event Inquiries — VenueSprocket",
    metaDescription:
      "VenueSprocket creates SEO marketing pages for your venue so customers find you when searching for birthday parties, corporate events, and private rooms in your city.",
    kicker: "Venue marketing",
    hero: "Get more private event inquiries from search",
    heroSub:
      "VenueSprocket creates SEO-optimized marketing pages for your venue — birthday parties, corporate events, holiday parties, private dining — that rank in search and send inquiries directly to your dashboard.",
    icon: "📣",
    why: "Most event management platforms help you manage leads you already have. VenueSprocket also helps you get more leads. SEO marketing pages targeted at the events people actually search for in your city put your venue in front of people actively looking for a place to host — before they call competitors.",
    features: [
      {
        title: "Event type landing pages",
        body: "Your venue gets dedicated pages for birthday parties, corporate events, holiday parties, rehearsal dinners, and more — each optimized for the searches your customers actually do.",
      },
      {
        title: "City and neighborhood targeting",
        body: "Pages include local signals — your city, neighborhood, and nearby areas — so your venue shows up when someone searches 'private event venue in [city].'",
      },
      {
        title: "All pages feed your inquiry form",
        body: "Every marketing page has a clear CTA that links to your venue's inquiry form. Visitors become leads, automatically, without any extra setup.",
      },
      {
        title: "Seasonal campaign pages",
        body: "Holiday party season, summer events, New Year's Eve — seasonal pages let you capture high-intent search traffic when bookings spike.",
      },
      {
        title: "Automated lead follow-up",
        body: "Inquiries that come through marketing pages get automatic follow-up emails if the lead doesn't hear back. Fewer leads fall through the cracks.",
      },
      {
        title: "LeaguePour cross-promotion",
        body: "Marketing pages can reference your LeaguePour leagues and events, showing that your venue is active and has an established community.",
      },
    ],
    useCases: [
      "Restaurants that want birthday party and corporate event inquiries",
      "Breweries and bars adding private event programming",
      "Event venues competing for local search traffic",
      "Venues that want leads to come to them, not just manage the ones they already have",
    ],
    faqs: [
      {
        q: "Do I need to know SEO to use the marketing pages?",
        a: "No. VenueSprocket creates the pages for you with SEO structure built in. You add your venue details and publish.",
      },
      {
        q: "What plan includes marketing pages?",
        a: "SEO marketing pages are included in the Growth plan.",
      },
      {
        q: "Can I create pages for multiple event types?",
        a: "Yes. Growth plan venues can create pages for each event type they accept — birthday parties, corporate events, holiday parties, rehearsal dinners, and more.",
      },
    ],
    cta: "Start generating leads from search",
    ctaSub: "Marketing pages publish on the Growth plan.",
  },

  "restaurant-event-management-software": {
    slug: "restaurant-event-management-software",
    title: "Restaurant Event Management Software",
    metaTitle: "Restaurant Event Management Software — Private Dining & Events — VenueSprocket",
    metaDescription:
      "VenueSprocket helps restaurants manage private dining inquiries, send proposals, sign contracts, collect deposits, and create BEOs for birthday parties, corporate events, and private rooms.",
    kicker: "For restaurants",
    hero: "Manage restaurant private events without the spreadsheet mess",
    heroSub:
      "VenueSprocket is built for restaurants that want to book more private dining events, get contracts signed, collect deposits, and hand the kitchen a clean BEO — without expensive event management software.",
    icon: "🍽️",
    why: "Restaurant private events are high-value but hard to manage with email alone. An inquiry comes in on Tuesday, the manager responds Thursday, the customer goes with a competitor who replied faster. VenueSprocket gives restaurants a public inquiry page that captures the lead immediately and a pipeline to move it to a booked event quickly.",
    features: [
      {
        title: "Private dining inquiry form",
        body: "Your restaurant gets a public booking page for birthday dinners, corporate lunches, rehearsal dinners, holiday parties, and private room rentals. Customers submit the form — you get the lead.",
      },
      {
        title: "Lead pipeline",
        body: "Every inquiry goes into a simple pipeline. Staff move leads from New to Contacted to Proposal Sent to Booked. Nothing gets lost in email.",
      },
      {
        title: "Proposals with menu packages",
        body: "Build and send a proposal that includes your prix-fixe menus, beverage options, room fees, and food minimums. Customer accepts online.",
      },
      {
        title: "Contract and deposit",
        body: "Get the booking locked in with a signed contract and Stripe deposit — from the customer's phone, without chasing.",
      },
      {
        title: "Kitchen-ready BEO",
        body: "The BEO goes to your kitchen team with guest count, food and beverage details, course timing, allergies, and setup notes — generated from the same event record.",
      },
      {
        title: "LeaguePour for slow nights",
        body: "Add trivia nights, darts, or other recurring public events through LeaguePour to bring guests in on nights that are normally slow.",
      },
    ],
    useCases: [
      "Restaurants with private dining rooms",
      "Restaurants running birthday and anniversary dinners",
      "Restaurants hosting corporate lunches and team dinners",
      "Restaurants managing holiday party season",
      "Any restaurant replacing email-and-spreadsheet private event management",
    ],
    faqs: [
      {
        q: "Do I need to hire an event coordinator to use VenueSprocket?",
        a: "No. VenueSprocket is designed so a restaurant owner, manager, or front-of-house lead can run private event management without a dedicated coordinator.",
      },
      {
        q: "Can I add my restaurant's menus to proposals?",
        a: "Yes. The proposal builder lets you add menu packages, beverage options, room fees, and food minimums as line items.",
      },
      {
        q: "Is LeaguePour included?",
        a: "LeaguePour is included in the Growth plan. You can also use it separately at leaguepour.com.",
      },
    ],
    cta: "Start managing restaurant events",
    ctaSub: "Your inquiry form can be live today.",
  },

  "brewery-event-management-software": {
    slug: "brewery-event-management-software",
    title: "Brewery Event Management Software",
    metaTitle: "Brewery Event Management Software — Private Events & Taproom Bookings — VenueSprocket",
    metaDescription:
      "VenueSprocket helps breweries and taprooms book more private events, corporate tastings, birthday parties, and buyouts with inquiry forms, proposals, contracts, deposits, and BEOs.",
    kicker: "For breweries",
    hero: "Book more taproom events. Run them better.",
    heroSub:
      "VenueSprocket helps craft breweries and taprooms capture private event inquiries, send proposals with tasting packages, get contracts signed, collect deposits, and build BEOs for every event.",
    icon: "🍺",
    why: "Taproom buyouts, birthday parties, corporate tastings, and rehearsal dinner events are high-value for breweries — and often managed through Instagram DMs, email, and handshake deals. VenueSprocket gives breweries a professional, fast private event workflow that doesn't require enterprise software or a dedicated event planner.",
    features: [
      {
        title: "Taproom inquiry form",
        body: "A public booking page for brewery buyouts, birthday parties, corporate tastings, rehearsal dinners, and private events. Customers submit, you get the lead instantly.",
      },
      {
        title: "Tasting and beverage packages",
        body: "Build proposals with beer tasting flights, keg packages, beverage minimums, and food pairings as line items. Customers see exactly what they're booking.",
      },
      {
        title: "Contract and deposit",
        body: "Lock in the buyout with a signed contract and Stripe deposit. No checks. Customer signs and pays from their phone.",
      },
      {
        title: "BEO for taproom staff",
        body: "Your taproom staff get a BEO with the full event plan — guest count, beer selections, food, setup, timeline, and special notes — on their phone or printed.",
      },
      {
        title: "Marketing pages",
        body: "Get found when people search for 'brewery birthday party [city]' or 'taproom private event [city]' with SEO marketing pages for your location.",
      },
      {
        title: "LeaguePour for leagues and trivia",
        body: "Add dart leagues, trivia nights, cornhole, and other recurring events through LeaguePour to build a weekly regular crowd.",
      },
    ],
    useCases: [
      "Craft breweries offering taproom buyouts",
      "Taprooms booking birthday parties and corporate tastings",
      "Breweries managing rehearsal dinners and private parties",
      "Breweries adding structured event programming to fill slow weeknights",
    ],
    faqs: [
      {
        q: "Can I offer beer packages and tasting flights in the proposal?",
        a: "Yes. The proposal builder lets you add beverage packages, tasting packages, room fees, and minimums as line items.",
      },
      {
        q: "Does VenueSprocket work for small taprooms?",
        a: "Yes. VenueSprocket is built for small and midsize venues. The free plan lets you get started immediately.",
      },
      {
        q: "Can I use LeaguePour to run dart leagues at my brewery?",
        a: "Yes. LeaguePour is designed for exactly this — dart leagues, trivia, cornhole, and other recurring events at bars, breweries, and taprooms.",
      },
    ],
    cta: "Start booking taproom events",
    ctaSub: "Free to start. Upgrade for contracts, deposits, and BEOs.",
  },

  "bar-event-management-software": {
    slug: "bar-event-management-software",
    title: "Bar Event Management Software",
    metaTitle: "Bar Event Management Software — Private Parties & Game Nights — VenueSprocket",
    metaDescription:
      "VenueSprocket helps bars book private parties, birthday events, and corporate buyouts while LeaguePour fills slow nights with dart leagues, trivia, cornhole, and bar game competitions.",
    kicker: "For bars",
    hero: "Book private parties. Fill slow nights. Manage both from one place.",
    heroSub:
      "VenueSprocket helps bars capture private event inquiries, send proposals, get contracts signed, and collect deposits. Add LeaguePour to fill slow Tuesday and Wednesday nights with dart leagues, trivia, and bar game competitions.",
    icon: "🍸",
    why: "Bars are uniquely positioned to run both private events (birthday buyouts, corporate happy hours, bachelorette parties) and recurring public events (dart leagues, trivia, cornhole). Most bar software handles one or the other. VenueSprocket handles private events, and LeaguePour handles the public event programming — both connected in one platform.",
    features: [
      {
        title: "Private party inquiry form",
        body: "A public booking page for birthday buyouts, bachelorette parties, corporate happy hours, and private bar events. Customers submit, you get the lead.",
      },
      {
        title: "Bar package proposals",
        body: "Build proposals with bar tabs, drink packages, food and drink minimums, and venue fees. Customers see a clean quote and accept online.",
      },
      {
        title: "Contract and deposit",
        body: "Get the booking signed and deposited from the customer's phone. No checks, no paperwork, no back-and-forth.",
      },
      {
        title: "Event day staff view",
        body: "Staff see the event details for tonight — guest count, what's included, arrival time, bar tab limit, special instructions — without digging through email.",
      },
      {
        title: "LeaguePour for bar leagues",
        body: "Run dart leagues, cornhole, trivia nights, pool leagues, poker nights, and bar game competitions through LeaguePour. Players sign up online, pay entry fees, and come back every week.",
      },
      {
        title: "Combined revenue tracking",
        body: "See private event revenue and LeaguePour public event revenue side by side in your dashboard.",
      },
    ],
    useCases: [
      "Bars with private spaces for birthday parties and buyouts",
      "Sports bars booking corporate happy hours and group events",
      "Dive bars and neighborhood bars adding structured event programming",
      "Bars with dart boards, pool tables, or cornhole running recurring leagues",
      "Bars tired of managing events through Instagram and email",
    ],
    faqs: [
      {
        q: "Can I run both private events and public leagues from one account?",
        a: "Yes. VenueSprocket manages your private events. LeaguePour manages your public event programming. Both connect to the same venue account.",
      },
      {
        q: "How does LeaguePour work for bar dart leagues?",
        a: "You create a dart league, set the entry fee and schedule, and post a QR code at the bar. Players sign up online, pay entry fees through Stripe, and standings update each week.",
      },
      {
        q: "Do I need a full contract for every private party?",
        a: "That's your call. VenueSprocket includes contract tools, but you can use them selectively. Some bars use contracts only for full buyouts over a minimum spend.",
      },
    ],
    cta: "Start booking bar events",
    ctaSub: "Free plan gets your inquiry form live immediately.",
  },

  "taproom-event-management-software": {
    slug: "taproom-event-management-software",
    title: "Taproom Event Management Software",
    metaTitle: "Taproom Event Management Software — Bookings, Leagues & Events — VenueSprocket",
    metaDescription:
      "VenueSprocket helps taprooms book private events and buyouts while LeaguePour builds weekly traffic with dart leagues, trivia, cornhole, and recurring game nights.",
    kicker: "For taprooms",
    hero: "Taproom events, organized.",
    heroSub:
      "Private buyouts, birthday parties, beer tastings, corporate events — VenueSprocket captures the inquiry, manages the booking, and gives your staff a clean BEO for event day. Add LeaguePour to fill the rest of your calendar with recurring public events.",
    icon: "🏠",
    why: "Taprooms with great spaces are underusing them when events are managed through text messages and word of mouth. VenueSprocket gives taprooms a professional booking system that feels easy for the customer and takes almost no time to set up for the venue.",
    features: [
      {
        title: "Taproom booking page",
        body: "A public inquiry page for your taproom — private buyouts, beer tastings, birthday parties, corporate events, and more. No app needed for customers.",
      },
      {
        title: "Beer and beverage packages",
        body: "Include your taproom's beer packages, tasting flights, growler fills, and beverage minimums in proposals.",
      },
      {
        title: "Contract and deposit online",
        body: "Customers sign and pay a deposit from their phone right after accepting the proposal.",
      },
      {
        title: "Staff BEO for event day",
        body: "Your taproom staff get everything they need — beer selections, food, guest count, setup, timing, special requests — in one clean BEO.",
      },
      {
        title: "LeaguePour recurring events",
        body: "Add dart leagues, trivia nights, cornhole tournaments, and bar game competitions to bring the same customers back every week.",
      },
      {
        title: "Marketing pages for local search",
        body: "Get found when people search for 'taproom event space [city]' or 'private beer tasting [city].'",
      },
    ],
    useCases: [
      "Taprooms with private spaces for buyouts and tastings",
      "Taprooms adding birthday parties and corporate event programming",
      "Taprooms running weekly leagues and game nights",
      "Taprooms that want to make better use of their space on slow nights",
    ],
    faqs: [
      {
        q: "Is VenueSprocket designed for taprooms specifically?",
        a: "VenueSprocket is built for small and midsize hospitality venues including taprooms, breweries, restaurants, and bars. The features and language are designed around how these venues actually run events.",
      },
      {
        q: "Can LeaguePour run cornhole and bags leagues at my taproom?",
        a: "Yes. LeaguePour supports cornhole, bags, darts, trivia, pool, and other bar game competitions with QR signups, online entry fees, and live standings.",
      },
      {
        q: "What is the fastest way to get started?",
        a: "Sign up for free, add your taproom name and event types, and publish your inquiry page. The whole process takes about ten minutes.",
      },
    ],
    cta: "Start managing taproom events",
    ctaSub: "Your inquiry page can be live in ten minutes.",
  },

  "banquet-hall-software": {
    slug: "banquet-hall-software",
    title: "Banquet Hall Software",
    metaTitle: "Banquet Hall Software — Private Events, BEOs & Deposits — VenueSprocket",
    metaDescription:
      "VenueSprocket helps banquet halls and event spaces manage private event inquiries, proposals, contracts, deposits, BEOs, and room scheduling without enterprise-priced software.",
    kicker: "For banquet halls & event spaces",
    hero: "Run your banquet hall without enterprise software prices",
    heroSub:
      "VenueSprocket gives banquet halls and event spaces a complete private event workflow — inquiry page, proposal, contract, deposit, BEO, and marketing pages — at a price that works for independently owned venues.",
    icon: "🏛️",
    why: "Most banquet hall software is priced for hotel chains and large catering companies. Independent banquet halls and event spaces need the same core tools — inquiry management, proposals, signed contracts, deposits, and BEOs — without paying enterprise prices or dealing with enterprise complexity.",
    features: [
      {
        title: "Public event inquiry page",
        body: "Capture birthday parties, weddings, corporate events, quinceañeras, anniversaries, and other private events through a public booking form. Leads go directly to your dashboard.",
      },
      {
        title: "Multi-room and event space support",
        body: "Manage multiple rooms or event spaces within your venue. Each room can have its own capacity, room fee, and minimum spend.",
      },
      {
        title: "Detailed proposals",
        body: "Build proposals with room fees, food and beverage packages, catering options, add-ons, and total pricing. Customers accept online.",
      },
      {
        title: "Contract signing",
        body: "Customers sign your banquet contract online from their phone. Timestamp, IP, and typed signature recorded. PDF sent automatically.",
      },
      {
        title: "Deposit collection through Stripe",
        body: "Collect deposits online right after contract signing. No checks, no in-person payment required to lock in the date.",
      },
      {
        title: "BEO for every event",
        body: "Generate a complete Banquet Event Order from the event record — food, beverage, setup, timeline, staffing — and give it to your kitchen and event staff.",
      },
    ],
    useCases: [
      "Independent banquet halls and event rental spaces",
      "Social halls and community event centers",
      "Hotel event spaces that want simpler event management",
      "Venues managing weddings, quinceañeras, and large celebrations",
      "Any event space replacing paper-based or email-based event management",
    ],
    faqs: [
      {
        q: "Does VenueSprocket handle weddings and large events?",
        a: "VenueSprocket handles the private event booking workflow — inquiry, proposal, contract, deposit, BEO. For very complex wedding production needs, you may want dedicated wedding planning software alongside VenueSprocket.",
      },
      {
        q: "Can I manage multiple event spaces or rooms?",
        a: "Multi-room support is included in the Growth plan. The free and Pro plans support single-room setups.",
      },
      {
        q: "How does VenueSprocket compare to event software designed for large venues?",
        a: "VenueSprocket is specifically designed for small and midsize independently owned venues. It covers the core workflow at a price point that makes sense for venues that don't have dedicated event sales teams.",
      },
    ],
    cta: "Start managing banquet hall events",
    ctaSub: "Free plan available. Pro plan adds contracts, deposits, and BEOs.",
  },
};
