import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";

const URL = "https://venuesprocket.com/demo";

export const metadata: Metadata = {
  title: { absolute: "Sample Workflow Demo — Inquiry to BEO | VenueSprocket" },
  description:
    "Walk through a sample private event booking in VenueSprocket: inquiry, lead, proposal, e-signature contract, Stripe deposit, and BEO. Fictional venue and customer, no login required.",
  alternates: { canonical: URL },
  openGraph: {
    siteName: "VenueSprocket",
    title: "VenueSprocket sample workflow: inquiry to BEO",
    description: "A fictional booking walked through every step VenueSprocket handles today.",
    url: URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "VenueSprocket", item: "https://venuesprocket.com" },
    { "@type": "ListItem", position: 2, name: "Sample workflow", item: URL },
  ],
};

// Fictional sample data only - no real venue, customer, or numbers from any account. Each panel
// mirrors the fields the real screens show today (inquiry form, proposal, contract, deposit, BEO).
const SAMPLE_VENUE = "Copper Lantern Brewing";
const SAMPLE_CUSTOMER = "Jordan Reyes";

function SampleBadge() {
  return (
    <span className="rounded-full bg-vs-accent/15 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-vs-accent">
      Sample
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-vs-border/60 py-2 text-sm last:border-0">
      <span className="text-vs-muted">{label}</span>
      <span className="text-right font-medium text-vs-text">{value}</span>
    </div>
  );
}

function Step({
  n,
  title,
  who,
  children,
  explain,
}: {
  n: number;
  title: string;
  who: string;
  children: React.ReactNode;
  explain: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-start">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vs-accent text-sm font-bold text-white">
            {n}
          </span>
          <div>
            <h2 className="font-display text-xl font-bold text-vs-text">{title}</h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-vs-muted">{who}</p>
          </div>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-vs-text-soft">{explain}</div>
      </div>
      <div className="rounded-2xl border border-vs-border-strong bg-vs-surface p-5">{children}</div>
    </section>
  );
}

export default function VsDemoPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 max-w-3xl">
            <p className="vs-kicker mb-3">Sample workflow - fictional venue and customer</p>
            <h1 className="vs-page-title text-4xl md:text-5xl mb-5">
              One private event, from inquiry to BEO
            </h1>
            <p className="text-vs-text-soft text-lg leading-relaxed">
              Follow a made-up birthday buyout at a made-up brewery through every step VenueSprocket
              handles today. Nothing on this page is a working form or a real account - it&apos;s a
              preview of what you and your customer would see.
            </p>
          </div>

          <div className="space-y-14">
            <Step
              n={1}
              title="The customer sends an inquiry"
              who="Customer · public inquiry page"
              explain={
                <>
                  <p>
                    Your venue&apos;s inquiry page lives at a link you can put on your website,
                    Instagram bio, or Google Business Profile. The customer fills it out on their phone
                    - no account needed.
                  </p>
                  <p>
                    They get a confirmation email right away; you get a notification and a new lead in
                    your pipeline.
                  </p>
                </>
              }
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-vs-text">Book a private event at {SAMPLE_VENUE}</p>
                <SampleBadge />
              </div>
              <Row label="Name" value={SAMPLE_CUSTOMER} />
              <Row label="Event type" value="Birthday party" />
              <Row label="Preferred date" value="Saturday, March 14" />
              <Row label="Guest count" value="40" />
              <Row label="Budget range" value="$1,500 – $2,500" />
              <Row label="Notes" value="40th birthday, would love the mezzanine" />
            </Step>

            <Step
              n={2}
              title="It lands in your pipeline"
              who="Venue · lead pipeline"
              explain={
                <>
                  <p>
                    Each inquiry becomes a lead with a stage. You move it forward as you work it:
                    contacted, proposal sent, contract sent, deposit pending, booked.
                  </p>
                  <p>
                    If a new lead sits untouched for a couple of days, VenueSprocket emails you a
                    reminder. (Reminders go to your venue - VenueSprocket doesn&apos;t send automatic
                    follow-ups to the customer.)
                  </p>
                </>
              }
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-vs-text">Leads</p>
                <SampleBadge />
              </div>
              <ol className="space-y-2 text-sm">
                {["New Inquiry", "Contacted", "Proposal Sent", "Contract Sent", "Deposit Pending", "Booked"].map((stage, i) => (
                  <li
                    key={stage}
                    className={
                      i === 0
                        ? "flex items-center justify-between rounded-lg bg-vs-accent/10 px-3 py-2 font-semibold text-vs-text"
                        : "flex items-center justify-between rounded-lg px-3 py-2 text-vs-muted"
                    }
                  >
                    <span>{stage}</span>
                    {i === 0 && <span className="text-xs">{SAMPLE_CUSTOMER} · Birthday · 40 guests</span>}
                  </li>
                ))}
              </ol>
            </Step>

            <Step
              n={3}
              title="You send a proposal"
              who="Venue creates · customer accepts"
              explain={
                <>
                  <p>
                    Turn the lead into an event, then create a proposal with a room fee, a food and
                    beverage minimum, and the deposit amount. VenueSprocket emails the customer a
                    secure link.
                  </p>
                  <p>
                    They review the estimated total and accept with one tap. Menu and bar details
                    you&apos;ve agreed on go in the event notes and on the BEO.
                  </p>
                </>
              }
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-vs-text">Proposal · {SAMPLE_CUSTOMER} 40th</p>
                <SampleBadge />
              </div>
              <Row label="Room fee" value="$250.00" />
              <Row label="Food & beverage minimum" value="$1,600.00" />
              <Row label="Estimated total" value="$1,850.00" />
              <Row label="Deposit to reserve date" value="$400.00" />
              <span
                aria-disabled="true"
                className="mt-4 block cursor-default select-none rounded-xl bg-vs-accent/40 py-3 text-center text-sm font-bold text-white"
              >
                Accept this proposal (preview only)
              </span>
            </Step>

            <Step
              n={4}
              title="The customer signs the contract"
              who="Customer · secure signing link"
              explain={
                <>
                  <p>
                    Once the proposal is accepted, you send a contract built from the same event
                    details plus your venue&apos;s own contract text (cancellation policy, minimums,
                    house rules).
                  </p>
                  <p>
                    The customer types their name and checks a confirmation box. VenueSprocket records
                    the typed signature, timestamp, IP address, and device with the contract.
                  </p>
                </>
              }
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-vs-text">Contract · {SAMPLE_VENUE}</p>
                <SampleBadge />
              </div>
              <p className="mb-4 text-xs leading-relaxed text-vs-muted">
                Deposit of $400.00 is due at signing to reserve the date. Deposits are refundable
                until 30 days before the event; after that they are non-refundable but may be applied
                to a rescheduled date within 6 months… <span className="italic">(sample terms - your
                venue writes its own)</span>
              </p>
              <div className="rounded-xl border border-vs-border bg-vs-bg p-4">
                <p className="text-[0.6875rem] font-bold uppercase tracking-widest text-vs-muted">Typed signature</p>
                <p className="mt-1 font-display text-2xl italic text-vs-text">{SAMPLE_CUSTOMER}</p>
                <p className="mt-1 text-xs text-vs-muted">Timestamp, IP, and device recorded on real signatures</p>
              </div>
            </Step>

            <Step
              n={5}
              title="The deposit is paid"
              who="Customer · Stripe Checkout"
              explain={
                <>
                  <p>
                    Right after signing, the customer pays the deposit through Stripe Checkout. The
                    money goes straight to your venue&apos;s own Stripe account - VenueSprocket takes no
                    percentage; Stripe&apos;s standard processing fee applies.
                  </p>
                  <p>
                    The customer gets a receipt email, and the deposit shows as paid in your dashboard
                    once Stripe confirms it. The remaining balance is settled however you normally take
                    final payment.
                  </p>
                </>
              }
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-vs-text">Payments</p>
                <SampleBadge />
              </div>
              <Row label="Event" value={`${SAMPLE_CUSTOMER} 40th · Mar 14`} />
              <Row label="Deposit" value="$400.00" />
              <Row label="Status" value="Paid" />
              <p className="mt-3 text-xs text-vs-muted">No real payment is processed on this page.</p>
            </Step>

            <Step
              n={6}
              title="Your team works from the BEO"
              who="Venue · Banquet Event Order"
              explain={
                <>
                  <p>
                    The BEO starts from the event record - name, date, times, guest count, and contact
                    details carry over. You fill in food, beverage, setup, staffing, AV, allergies, and
                    the timeline.
                  </p>
                  <p>
                    Open it on a phone during the event or print it for the kitchen and bar. Internal
                    notes stay internal.
                  </p>
                </>
              }
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-vs-text">BEO · {SAMPLE_CUSTOMER} 40th</p>
                <SampleBadge />
              </div>
              <Row label="Date / time" value="Sat Mar 14 · 6:00–10:00 PM" />
              <Row label="Guests" value="40" />
              <Row label="Setup" value="Mezzanine, 5 high-tops + lounge" />
              <Row label="Food" value="Taco bar, served 7:00 PM" />
              <Row label="Beverage" value="Beer & wine, tab up to the minimum" />
              <Row label="Allergies" value="1 guest - shellfish" />
              <Row label="Internal note" value="Cake arrives 5:30, hold in walk-in" />
            </Step>
          </div>

          <div className="mt-16 rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-8">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-3">Try it with your own venue</h2>
            <p className="text-vs-text-soft mb-6 max-w-2xl">
              The free plan gets your inquiry page live without a credit card. Want to see the exact
              customer-facing proposal and contract screens first? Open the sample documents.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/start" className="rounded-xl bg-vs-accent px-6 py-3 text-center font-bold text-white hover:bg-vs-accent-hover transition-colors">
                Start free
              </Link>
              <Link href="/guides/sample-proposal-and-contract" className="rounded-xl border border-vs-border-strong bg-vs-bg px-6 py-3 text-center font-bold text-vs-text hover:border-vs-accent transition-colors">
                Sample proposal &amp; contract
              </Link>
              <Link href="/faq" className="rounded-xl border border-vs-border-strong bg-vs-bg px-6 py-3 text-center font-bold text-vs-text hover:border-vs-accent transition-colors">
                Read the FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
