import type { Metadata } from "next";
import Link from "next/link";
import { DemoCta, DemoVideo } from "@/components/marketing/demo-video";
import { HowItWorksSequence, type HowStep } from "@/components/marketing/how-it-works-sequence";
import { HIW_MEDIA } from "@/lib/how-it-works-media";
import { videoJsonLd } from "@/lib/demo-videos";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";

export const metadata: Metadata = {
  title: { absolute: "How VenueSprocket Works: Demo Video and Step-by-Step" },
  description:
    "Watch a recorded demo of VenueSprocket: a guest's private event inquiry becomes a lead, a proposal, a signed contract with a Stripe deposit, and a printable BEO. Plans and free access explained.",
  alternates: { canonical: "https://venuesprocket.com/how-it-works" },
  openGraph: {
    siteName: "VenueSprocket",
    title: "How VenueSprocket Works: Demo Video and Step-by-Step",
    description: "A recorded walkthrough of a sample brewery booking, from inquiry to BEO.",
    url: "https://venuesprocket.com/how-it-works",
    images: ["/venuesprocket/opengraph-image"],
  },
};

const m = (key: string) => HIW_MEDIA[key];
const img = (key: string, alt: string) => ({ src: m(key).src, width: m(key).width, height: m(key).height, alt });
const mark = (key: string, box: string, label: string) => {
  const b = m(key)?.boxes?.[box];
  return b && b.y >= 3 && b.y <= 97 ? [{ x: b.x, y: b.y, label }] : [];
};

// Real screens from the recorded demo (local server, fictional brewery and guest). Product truth:
// entitlements/vs.ts - Free: inquiry page + leads; Starter: pipeline + proposals; Pro: deposits,
// contracts, BEOs, follow-up reminders. Proposals are room fee + F&B minimum + deposit only (no
// line items); BEOs have no timeline editor; there is no calendar view or multi-room setup.
const steps: HowStep[] = [
  {
    title: "Your inquiry page is live at signup",
    body: "Create a free account with your name, email, a password and your venue's name. The dashboard shows your inquiry link right away; Settings has copy-paste code to put the form, or a booking button, on your website.",
    img: img("vs-01-dashboard", "A new VenueSprocket dashboard with the venue's live inquiry page link"),
    marks: [
      ...mark("vs-01-dashboard", "link", "Your public inquiry page link"),
      ...mark("vs-01-dashboard", "share", "Put the form on your website (Settings)"),
    ],
  },
  {
    title: "A guest sends an inquiry from their phone",
    body: "Name, email, event type, date, guest count, budget and notes. Guests never create an account.",
    img: img("vs-02-inquiry-mobile", "The private event inquiry form on a phone, filled in for a rehearsal dinner for 40 guests"),
    phone: true,
  },
  {
    title: "It lands as a lead",
    body: "Every submission appears in your dashboard with the date, guest count and contact details. Reply by email from the lead, or convert it to an event.",
    img: img("vs-03-lead", "A lead detail page showing the guest's contact info and event details"),
    marks: [
      ...mark("vs-03-lead", "details", "Event details from the inquiry"),
      ...mark("vs-03-lead", "convert", "Convert to event, then build the proposal (Starter)"),
    ],
  },
  {
    title: "Build and send the proposal",
    body: "A proposal is a room fee, a food and beverage minimum, and a deposit (or your default deposit percentage). Send it as a secure link.",
    img: img("vs-04-proposal-builder", "The event workflow with room fee, food and beverage minimum and deposit fields filled in"),
    marks: [
      ...mark("vs-04-proposal-builder", "room", "Room fee"),
      ...mark("vs-04-proposal-builder", "min", "Food and beverage minimum"),
      ...mark("vs-04-proposal-builder", "deposit", "Deposit amount (Pro)"),
      ...mark("vs-04-proposal-builder", "create", "Create proposal, then Send to customer"),
    ],
  },
  {
    title: "The guest accepts online",
    body: "The guest opens the link on any device, reviews the totals and accepts. You see the status change on the event.",
    img: img("vs-05-proposal-mobile", "The guest's proposal page on a phone with the Accept this proposal button"),
    phone: true,
  },
  {
    title: "Contract, e-signature and deposit",
    body: "Generate the contract from the same event, activate it, and the guest signs with a typed signature (time, IP and browser are recorded). They can then pay the deposit through Stripe on your connected account.",
    img: img("vs-06-sign-mobile", "The contract signing form on a phone with a typed signature"),
    phone: true,
  },
  {
    title: "Hand your team the BEO",
    body: "Start a Banquet Event Order from the event: name, date, times, guest count and contact carry over. Add room setup, food, beverage, staffing, AV, allergies and internal notes, then print it.",
    img: img("vs-07-beo", "The BEO editor with event summary, room setup and food details"),
    marks: [
      ...mark("vs-07-beo", "room", "Room setup and layout"),
      ...mark("vs-07-beo", "food", "Food, beverage, staffing and AV sections"),
    ],
  },
];

// Answers must match the visible text exactly (the FAQPage schema is generated from this array).
const faqs = [
  {
    q: "How do I start?",
    a: "Create a free account with your name, email, a password and your venue's name. Your inquiry page is live immediately; share the link, or embed the form or a booking button on your website from Settings.",
  },
  {
    q: "What does it cost?",
    a: "Free covers your inquiry page and lead inbox, with no limit on inquiries. Starter ($29/month) adds the lead pipeline and proposals. Pro ($79/month) adds deposits, contracts with e-signature, BEOs and follow-up reminders. No card is needed for Free.",
  },
  {
    q: "Do my customers need accounts?",
    a: "No. Guests submit inquiries, review and accept proposals, sign contracts and pay deposits from links, without an account.",
  },
  {
    q: "Is a download required?",
    a: "No. VenueSprocket runs in the browser for you and your guests, on a phone or a computer.",
  },
  {
    q: "How do sharing and setup work?",
    a: "Your inquiry page has its own link from the moment you sign up. To collect deposits, connect your Stripe account; payouts follow Stripe's schedule. There is no onboarding call or setup wizard.",
  },
];

export default function VsHowItWorksPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div className="text-vs-text">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(videoJsonLd("vs-main", "https://venuesprocket.com", "2026-11-19")) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />

      <section id="demo" className="vs-hero-wash scroll-mt-20 border-b border-vs-border px-4 md:px-6">
        <div className="mx-auto max-w-6xl py-10 md:py-16">
          <p className="vs-kicker">How it works</p>
          <h1 className="vs-page-title mt-2 text-4xl md:text-5xl">From first inquiry to event-day sheet</h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-vs-text-soft">
            A recorded session with a sample brewery and a fictional guest - the real screens, start to finish. The steps are
            below the video.
          </p>
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <DemoVideo id="vs-main" accent="vs" priorityPoster />
            <aside className="rounded-2xl border border-vs-border bg-vs-surface p-5 shadow-sm">
              <p className="font-display text-xl font-bold">Start with the free plan</p>
              <ul className="mt-3 space-y-2 text-sm text-vs-text-soft">
                <li>✓ Inquiry page live at signup</li>
                <li>✓ Lead inbox and email notifications</li>
                <li>✓ No card, no download, no onboarding call</li>
              </ul>
              <DemoCta
                video="vs-main"
                cta="signup_venue"
                href="/signup/venue"
                className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-vs-accent px-4 text-base font-bold text-white hover:bg-vs-accent-hover"
              >
                Start free
              </DemoCta>
              <DemoCta
                video="vs-main"
                cta="pricing"
                href="/pricing"
                className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl border border-vs-border-strong px-4 text-sm font-semibold text-vs-text hover:border-vs-accent"
              >
                Compare plans
              </DemoCta>
              <p className="mt-4 text-xs text-vs-muted">
                Proposals start on Starter ($29/mo). Contracts, deposits and BEOs are on Pro ($79/mo).
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <p className="vs-kicker">Step by step</p>
        <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">One booking, one screen at a time</h2>
        <p className="mt-3 max-w-2xl text-vs-muted">Real screens from the demo above. Numbered markers point to the controls you&apos;ll use.</p>
        <div className="mt-12">
          <HowItWorksSequence steps={steps} accent="vs" />
        </div>
      </section>

      <section className="border-y border-vs-border bg-vs-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:px-6 md:py-16">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">What each plan includes</h2>
            <ul className="mt-4 space-y-3 text-vs-text-soft">
              <li>
                <strong className="text-vs-text">Free:</strong> inquiry page, unlimited inquiries, lead dashboard, customer records, lead notifications.
              </li>
              <li>
                <strong className="text-vs-text">Starter, $29/mo:</strong> + lead pipeline and the proposal builder.
              </li>
              <li>
                <strong className="text-vs-text">Pro, $79/mo:</strong> + deposits, contracts with e-signature, BEOs and follow-up reminders.
              </li>
              <li>
                <strong className="text-vs-text">Deposits:</strong> charged through Stripe on your connected account, at Stripe&apos;s rates.
              </li>
            </ul>
            <p className="mt-4 text-sm text-vs-muted">
              The demo venue is on Pro so every step can be shown. Anything a guest does with a document you already sent
              keeps working on any plan.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">The 25-second version</h2>
            <DemoVideo id="vs-intro" accent="vs" className="mt-4" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-16">
        <h2 className="font-display text-3xl font-bold">Questions</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-xl border border-vs-border bg-vs-surface px-5 py-4">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-vs-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup/venue" className="rounded-xl bg-vs-accent px-6 py-3.5 text-center font-bold text-white hover:bg-vs-accent-hover">
            Start free
          </Link>
          <Link href="/demo" className="rounded-xl border border-vs-border-strong bg-vs-surface px-6 py-3.5 text-center font-bold hover:border-vs-accent">
            Read the sample workflow
          </Link>
        </div>
        <p className="mt-6 text-sm text-vs-muted">
          More: <Link href="/features" className="font-semibold text-vs-accent hover:underline">Features</Link>
          {" · "}
          <Link href="/templates" className="font-semibold text-vs-accent hover:underline">Free templates</Link>
          {" · "}
          <Link href="/faq" className="font-semibold text-vs-accent hover:underline">FAQ</Link>
        </p>
      </section>
    </div>
  );
}
