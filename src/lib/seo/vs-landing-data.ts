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
  relatedLinks?: { slug: string; label: string }[];
  guideLinks?: { href: string; label: string }[];
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
        body: "Customers sign from their phone — no DocuSign required. Typed signature, checkbox, timestamp, and IP recorded.",
      },
      {
        title: "Stripe deposit collection",
        body: "After signing, the deposit is paid through Stripe immediately. No checks, no chasing. You see the money; the lead moves to Booked.",
      },
      {
        title: "BEO generation",
        body: "BEOs start from the same event details you already entered, with a print-ready view your team can work from on event day instead of digging through email.",
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
    relatedLinks: [
      { slug: "beo-software", label: "BEO software" },
      { slug: "event-contract-software", label: "Event contract software" },
      { slug: "event-deposit-software", label: "Event deposit software" },
    ],
    guideLinks: [
      { href: "/guides/private-event-inquiry-form-template", label: "Inquiry form template" },
      { href: "/guides/what-is-a-beo", label: "What is a BEO?" },
    ],
  },

  "beo-software": {
    slug: "beo-software",
    title: "BEO Software for Venues",
    metaTitle: "BEO Software for Restaurants, Bars & Event Venues — VenueSprocket",
    metaDescription:
      "Create Banquet Event Orders (BEOs) without starting from scratch. VenueSprocket starts each BEO from your event record and gives you a mobile-friendly, print-ready view for event day.",
    kicker: "BEO builder",
    hero: "Build BEOs in minutes, not hours",
    heroSub:
      "VenueSprocket starts a Banquet Event Order from the event details you already have on file - name, date, time, guest count, room, and contact info carry over automatically. No starting from a blank Word document. Open it on a phone or print it for the kitchen on event day.",
    icon: "📑",
    why: "Most venues build BEOs from scratch for every event — a Word document with copy-pasted details, printed and left in the kitchen, then lost or wrong when something changes. VenueSprocket starts the BEO from the same event record used for the inquiry, proposal, and contract, so the basics are already filled in.",
    features: [
      {
        title: "Starts from your event record",
        body: "The BEO carries over event name, date, time, guest count, room, and contact info from the details you already entered when the event was created. No re-keying the basics.",
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
        title: "Print-ready view",
        body: "Open any BEO in a clean, print-ready layout - print it or save it as a PDF from your browser to hand to the kitchen or your event team.",
      },
      {
        title: "Mobile-friendly BEO view",
        body: "Anyone logged in to your venue account can pull up the BEO on a phone during the event - no hunting for the printed copy. (There's no separate staff-only login; most venues print it for the kitchen too.)",
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
        a: "Yes. Any field on the BEO can be edited, and you can reprint the updated version at any time.",
      },
      {
        q: "Does BEO creation require a paid plan?",
        a: "BEO creation is included in the Pro plan and above. The free plan includes lead capture and the basic dashboard.",
      },
    ],
    cta: "Start building BEOs",
    ctaSub: "Generate your first BEO from an existing event in minutes.",
    relatedLinks: [
      { slug: "event-contract-software", label: "Event contract software" },
      { slug: "event-deposit-software", label: "Event deposit software" },
      { slug: "private-event-booking-software", label: "Private event booking software" },
    ],
    guideLinks: [
      { href: "/guides/what-is-a-beo", label: "What is a BEO?" },
      { href: "/guides/beo-template", label: "BEO template" },
      { href: "/guides/beo-vs-contract", label: "BEO vs. contract" },
    ],
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
        title: "Signed record on the event",
        body: "The signed contract - signer name, typed signature, and timestamp - stays attached to the event in your dashboard, and the customer goes straight to the deposit step.",
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
    relatedLinks: [
      { slug: "event-deposit-software", label: "Event deposit software" },
      { slug: "beo-software", label: "BEO software" },
      { slug: "private-event-booking-software", label: "Private event booking software" },
    ],
    guideLinks: [
      { href: "/guides/beo-vs-contract", label: "BEO vs. contract" },
    ],
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
        body: "You set the deposit amount when you build the proposal, so customers know exactly what they owe before signing.",
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
        title: "Deposit receipt email",
        body: "Customers get a receipt email once the deposit goes through, and the payment shows as paid in your dashboard as soon as Stripe confirms it.",
      },
      {
        title: "Deposit status by event",
        body: "Each event shows whether its deposit is pending, paid, or refunded, and the Payments page totals what's collected and what's still outstanding.",
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
        a: "Not today. VenueSprocket collects the deposit online; the remaining balance is settled however you normally take final payment (at the event, invoice, or your POS).",
      },
    ],
    cta: "Start collecting deposits online",
    ctaSub: "Connect Stripe and receive your first deposit in the same session.",
    relatedLinks: [
      { slug: "event-contract-software", label: "Event contract software" },
      { slug: "beo-software", label: "BEO software" },
      { slug: "private-event-booking-software", label: "Private event booking software" },
    ],
  },

  "venue-marketing-software": {
    slug: "venue-marketing-software",
    title: "Venue Marketing Software",
    metaTitle: "Venue Marketing Software — Get More Private Event Inquiries — VenueSprocket",
    metaDescription:
      "VenueSprocket gives your venue a public inquiry page so customers can request birthday parties, corporate events, and private rooms in your city - and every inquiry lands straight in your pipeline.",
    kicker: "Venue marketing",
    hero: "Turn every inquiry into a lead, automatically",
    heroSub:
      "VenueSprocket gives your venue a public inquiry page covering every event type you host — birthday parties, corporate events, holiday parties, private dining — so a customer can request their event in minutes, and it lands straight in your dashboard.",
    icon: "📣",
    why: "Most event management platforms help you manage leads you already have. VenueSprocket makes it effortless to capture the leads you're already getting - one page you can share anywhere (your website, socials, Google Business Profile) instead of a phone tag or a buried contact form - with an instant confirmation email to the customer and a reminder to you if an inquiry sits unanswered.",
    features: [
      {
        title: "One inquiry page, every event type",
        body: "Your venue gets a single public page covering birthday parties, corporate events, holiday parties, rehearsal dinners, and more - customers pick their event type and submit the details.",
      },
      {
        title: "Share it anywhere",
        body: "Link your inquiry page from your website, socials, or Google Business Profile - no separate page to build or maintain per event type.",
      },
      {
        title: "Every submission becomes a lead instantly",
        body: "Inquiries land directly in your VenueSprocket dashboard - no email to miss, no message to lose track of.",
      },
      {
        title: "Untouched-lead reminders",
        body: "If an inquiry sits untouched for a couple of days, VenueSprocket emails your venue a reminder so fewer leads fall through the cracks.",
      },
      {
        title: "Instant customer confirmation",
        body: "The moment someone submits an inquiry, they get a confirmation email so they know their request was received.",
      },
    ],
    useCases: [
      "Restaurants that want birthday party and corporate event inquiries",
      "Breweries and bars adding private event programming",
      "Venues that want one place to send all their private-event traffic",
      "Venues that want leads to come to them, not just manage the ones they already have",
    ],
    faqs: [
      {
        q: "Do I need to build a page myself?",
        a: "No. Every venue gets a public inquiry page automatically - add your venue details and share the link.",
      },
      {
        q: "What plan includes the inquiry page?",
        a: "The public inquiry page and lead pipeline are included on every VenueSprocket plan.",
      },
      {
        q: "Can customers request different types of events on the same page?",
        a: "Yes. One inquiry page covers every event type you accept - birthday parties, corporate events, holiday parties, rehearsal dinners, and more.",
      },
    ],
    cta: "Start capturing inquiries",
    ctaSub: "Your inquiry page is included on every plan.",
    relatedLinks: [
      { slug: "private-event-booking-software", label: "Private event booking software" },
      { slug: "restaurant-event-management-software", label: "Restaurant event management" },
      { slug: "bar-event-management-software", label: "Bar event management" },
    ],
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
        title: "Proposals with room fees and minimums",
        body: "Send a proposal with your room fee, food and beverage minimum, and deposit - the customer sees the estimated total and accepts online. Menu details go in the event notes and the BEO.",
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
        a: "Partly. A VenueSprocket proposal carries a room fee, a food and beverage minimum, and the deposit amount, which covers how most private dining rooms price. There's no itemized menu-package builder; menu choices go in the event notes and on the BEO.",
      },
      {
        q: "Is LeaguePour included?",
        a: "No. LeaguePour is a separate product with its own subscription at leaguepour.com. Active VenueSprocket subscribers get 50% off it.",
      },
    ],
    cta: "Start managing restaurant events",
    ctaSub: "Your inquiry form can be live today.",
    relatedLinks: [
      { slug: "beo-software", label: "BEO software" },
      { slug: "event-contract-software", label: "Event contract software" },
      { slug: "event-deposit-software", label: "Event deposit software" },
    ],
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
      "VenueSprocket helps craft breweries and taprooms capture private event inquiries, send proposals with room fees and beverage minimums, get contracts signed, collect deposits, and build BEOs for every event.",
    icon: "🍺",
    why: "Taproom buyouts, birthday parties, corporate tastings, and rehearsal dinner events are high-value for breweries — and often managed through Instagram DMs, email, and handshake deals. VenueSprocket gives breweries a professional, fast private event workflow that doesn't require enterprise software or a dedicated event planner.",
    features: [
      {
        title: "Taproom inquiry form",
        body: "A public booking page for brewery buyouts, birthday parties, corporate tastings, rehearsal dinners, and private events. Customers submit, you get the lead instantly.",
      },
      {
        title: "Room fees and beverage minimums",
        body: "Quote a room or buyout fee and a food and beverage minimum, and collect the deposit online. Record the tasting flights, kegs, or food pairings you've agreed on in the event notes and BEO.",
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
        a: "A proposal carries a room fee, a food and beverage minimum, and a deposit - there's no itemized package builder. Most taprooms set the minimum to cover the tasting or keg package and spell out what's included in the event notes and on the BEO.",
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
    relatedLinks: [
      { slug: "beo-software", label: "BEO software" },
      { slug: "event-contract-software", label: "Event contract software" },
      { slug: "event-deposit-software", label: "Event deposit software" },
    ],
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
      "VenueSprocket helps bars capture private event inquiries, send proposals, get contracts signed, and collect deposits. Pair it with LeaguePour, a separate companion product, to fill slow Tuesday and Wednesday nights with dart leagues, trivia, and bar game competitions.",
    icon: "🍸",
    why: "Bars are uniquely positioned to run both private events (birthday buyouts, corporate happy hours, bachelorette parties) and recurring public events (dart leagues, trivia, cornhole). Most bar software handles one or the other. VenueSprocket handles private events; LeaguePour, a separate companion product, handles leagues and game nights - and both work from the same venue login.",
    features: [
      {
        title: "Private party inquiry form",
        body: "A public booking page for birthday buyouts, bachelorette parties, corporate happy hours, and private bar events. Customers submit, you get the lead.",
      },
      {
        title: "Buyout and minimum-spend proposals",
        body: "Quote a room or buyout fee and a food and drink minimum, set the deposit, and send one link. Customers see a clean estimated total and accept online.",
      },
      {
        title: "Contract and deposit",
        body: "Get the booking signed and deposited from the customer's phone. No checks, no paperwork, no back-and-forth.",
      },
      {
        title: "BEO for event night",
        body: "Put the details for the night - guest count, what's included, arrival time, special instructions - on one BEO you can print or pull up on a phone, instead of digging through email.",
      },
      {
        title: "LeaguePour for bar leagues",
        body: "Run dart leagues, cornhole, trivia nights, pool leagues, poker nights, and bar game competitions through LeaguePour, a separate companion product available at a discount. Players sign up online, pay entry fees, and come back every week.",
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
        a: "Yes, if you use both products. VenueSprocket manages your private events; LeaguePour - a separate subscription - manages leagues and game nights. Both work from the same venue login, and an active subscriber to either gets 50% off the other.",
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
    relatedLinks: [
      { slug: "event-contract-software", label: "Event contract software" },
      { slug: "event-deposit-software", label: "Event deposit software" },
      { slug: "private-event-booking-software", label: "Private event booking software" },
    ],
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
      "Private buyouts, birthday parties, beer tastings, corporate events — VenueSprocket captures the inquiry, manages the booking, and gives your staff a clean BEO for event day. LeaguePour, a separate companion product, can fill the rest of your calendar with recurring leagues and game nights.",
    icon: "🏠",
    why: "Taprooms with great spaces are underusing them when events are managed through text messages and word of mouth. VenueSprocket gives taprooms a professional booking system that feels easy for the customer and takes almost no time to set up for the venue.",
    features: [
      {
        title: "Taproom booking page",
        body: "A public inquiry page for your taproom — private buyouts, beer tastings, birthday parties, corporate events, and more. No app needed for customers.",
      },
      {
        title: "Beverage minimums",
        body: "Quote a buyout fee and a beverage minimum on the proposal, and note the beer package or tasting flights you've agreed on in the event details and BEO.",
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
    relatedLinks: [
      { slug: "beo-software", label: "BEO software" },
      { slug: "event-contract-software", label: "Event contract software" },
      { slug: "venue-marketing-software", label: "Venue marketing software" },
    ],
  },

  "banquet-hall-software": {
    slug: "banquet-hall-software",
    title: "Banquet Hall Software",
    metaTitle: "Banquet Hall Software — Private Events, BEOs & Deposits — VenueSprocket",
    metaDescription:
      "VenueSprocket helps banquet halls and event spaces manage private event inquiries, proposals, contracts, deposits, and BEOs without enterprise-priced software.",
    kicker: "For banquet halls & event spaces",
    hero: "Run your banquet hall without enterprise software prices",
    heroSub:
      "VenueSprocket gives banquet halls and event spaces a complete private event workflow — inquiry page, proposal, contract, deposit, and BEO — at a price that works for independently owned venues.",
    icon: "🏛️",
    why: "Most banquet hall software is priced for hotel chains and large catering companies. Independent banquet halls and event spaces need the same core tools — inquiry management, proposals, signed contracts, deposits, and BEOs — without paying enterprise prices or dealing with enterprise complexity.",
    features: [
      {
        title: "Public event inquiry page",
        body: "Capture birthday parties, weddings, corporate events, quinceañeras, anniversaries, and other private events through a public booking form. Leads go directly to your dashboard.",
      },
      {
        title: "Detailed proposals",
        body: "Build proposals with a room fee, a food and beverage minimum, and the deposit - customers see the estimated total and accept online.",
      },
      {
        title: "Contract signing",
        body: "Customers sign your banquet contract online from their phone. Timestamp, IP, and typed signature recorded.",
      },
      {
        title: "Deposit collection through Stripe",
        body: "Collect deposits online right after contract signing. No checks, no in-person payment required to lock in the date.",
      },
      {
        title: "BEO for every event",
        body: "Start a Banquet Event Order from the event record, fill in food, beverage, setup, timeline, and staffing, and print it for your kitchen and event staff.",
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
        a: "Not as separate spaces today - VenueSprocket doesn't have room-by-room calendars or capacity settings. Many venues name the room in the event details and BEO, and set a room fee and minimum spend on each proposal.",
      },
      {
        q: "How does VenueSprocket compare to event software designed for large venues?",
        a: "VenueSprocket is specifically designed for small and midsize independently owned venues. It covers the core workflow at a price point that makes sense for venues that don't have dedicated event sales teams.",
      },
    ],
    cta: "Start managing banquet hall events",
    ctaSub: "Free plan available. Pro plan adds contracts, deposits, and BEOs.",
    relatedLinks: [
      { slug: "beo-software", label: "BEO software" },
      { slug: "event-contract-software", label: "Event contract software" },
      { slug: "event-deposit-software", label: "Event deposit software" },
    ],
  },
};
