import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Free Banquet Event Order (BEO) Template | VenueSprocket" },
  description:
    "A free, copyable Banquet Event Order template with realistic field names, a filled-out example, required vs. optional fields, and a pre-event checklist.",
  alternates: { canonical: "https://venuesprocket.com/guides/beo-template" },
  openGraph: {
    title: "Free Banquet Event Order (BEO) Template",
    description:
      "A copyable BEO template with an example filled-out version and a pre-event checklist.",
    url: "https://venuesprocket.com/guides/beo-template",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "VenueSprocket", item: "https://venuesprocket.com" },
        { "@type": "ListItem", position: 2, name: "Guides", item: "https://venuesprocket.com/guides" },
        { "@type": "ListItem", position: 3, name: "BEO Template", item: "https://venuesprocket.com/guides/beo-template" },
      ],
    },
    {
      "@type": "Article",
      headline: "Free Banquet Event Order (BEO) Template",
      description:
        "A copyable Banquet Event Order template with realistic field names, an example filled-out version, and a pre-event checklist.",
      author: { "@type": "Organization", name: "VenueSprocket" },
      publisher: { "@type": "Organization", name: "VenueSprocket", url: "https://venuesprocket.com" },
      url: "https://venuesprocket.com/guides/beo-template",
      datePublished: "2026-08-19",
      dateModified: "2026-08-19",
    },
  ],
};

type Field = { label: string; required: boolean; note?: string };

const sections: { title: string; fields: Field[] }[] = [
  {
    title: "Event basics",
    fields: [
      { label: "Event name", required: true },
      { label: "Event date", required: true },
      { label: "Venue open / setup start time", required: true },
      { label: "Guest arrival time", required: true },
      { label: "Event end / teardown complete time", required: true },
      { label: "Room or space assigned", required: true },
      { label: "Guest count (confirmed)", required: true },
      { label: "Guest count (guaranteed minimum, if applicable)", required: false },
    ],
  },
  {
    title: "Contact information",
    fields: [
      { label: "Client / host name", required: true },
      { label: "Client phone number", required: true },
      { label: "Client email", required: true },
      { label: "On-site day-of contact (if different from client)", required: false },
      { label: "Internal event manager / coordinator", required: true },
    ],
  },
  {
    title: "Food & beverage",
    fields: [
      { label: "Menu / package selected", required: true },
      { label: "Beverage package or bar setup (open bar, cash bar, drink tickets, beer/wine only)", required: true },
      { label: "Food and beverage minimum (if applicable)", required: false },
      { label: "Allergies / dietary restrictions", required: true, note: "Mark 'none reported' rather than leaving blank" },
      { label: "Cake / dessert service details", required: false },
      { label: "Course timing (when each course should be served)", required: false },
    ],
  },
  {
    title: "Room setup & AV",
    fields: [
      { label: "Table layout (rounds, banquet-style, cocktail rounds, etc.)", required: true },
      { label: "Seating chart or assigned seating notes", required: false },
      { label: "AV equipment needed (mic, speaker, projector, screen)", required: false },
      { label: "Decor restrictions (candles, confetti, adhesives on walls)", required: false },
      { label: "Vendor access (DJ, photographer, florist) - arrival time and load-in notes", required: false },
    ],
  },
  {
    title: "Staffing",
    fields: [
      { label: "Servers / bartenders assigned to this event", required: true },
      { label: "Manager on duty", required: true },
      { label: "Kitchen lead for this event", required: false },
    ],
  },
  {
    title: "Payment status & internal notes",
    fields: [
      { label: "Deposit paid (amount, date)", required: true },
      { label: "Balance due and due date", required: true },
      { label: "Internal notes (VIP flags, past issues, manager reminders)", required: false, note: "Staff-only - never shown to the customer" },
    ],
  },
];

export default function BeoTemplateGuide() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-8 text-sm text-vs-muted">
            <Link href="/guides" className="hover:text-vs-accent">Guides</Link>
            {" / "}
            <span className="text-vs-text-soft font-medium">BEO Template</span>
          </nav>

          <p className="vs-kicker mb-3">Free template</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-6">
            Banquet Event Order (BEO) Template
          </h1>
          <p className="text-vs-text-soft text-lg leading-relaxed mb-10">
            A BEO doesn't need to be complicated to be useful - it needs to have every field your
            staff will actually look for on event day. Copy the fields below into a document, spreadsheet,
            or your own template, fill them in per event, and hand it to whoever is running the room.
            New to BEOs? Start with{" "}
            <Link href="/guides/what-is-a-beo" className="text-vs-accent hover:underline">
              What Is a BEO?
            </Link>
          </p>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-4">The template</h2>
            <p className="text-vs-text-soft leading-relaxed mb-6">
              Fields marked <span className="font-semibold text-vs-accent">Required</span> should be
              filled in for every event, no exceptions - staff will look for these first. Fields marked{" "}
              <span className="font-semibold text-vs-muted">Optional</span> apply when relevant to the
              specific event.
            </p>
            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.title} className="rounded-2xl border border-vs-border bg-vs-surface p-6">
                  <h3 className="font-display text-lg font-bold text-vs-text mb-4">{section.title}</h3>
                  <ul className="space-y-2.5">
                    {section.fields.map((f) => (
                      <li key={f.label} className="flex items-start gap-3 text-sm">
                        <span
                          className={
                            f.required
                              ? "mt-0.5 shrink-0 rounded-full bg-vs-accent/15 px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-vs-accent"
                              : "mt-0.5 shrink-0 rounded-full bg-vs-muted/15 px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-vs-muted"
                          }
                        >
                          {f.required ? "Required" : "Optional"}
                        </span>
                        <span className="text-vs-text-soft">
                          {f.label}
                          {f.note ? <span className="block text-xs text-vs-muted mt-0.5">{f.note}</span> : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-4">Example: filled-out BEO</h2>
            <p className="text-vs-text-soft leading-relaxed mb-5">
              Here's what a completed BEO looks like for a taproom birthday buyout, using the template
              above:
            </p>
            <div className="rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-6 font-mono text-sm text-vs-text-soft leading-relaxed whitespace-pre-wrap">
{`EVENT: Marino 40th Birthday Buyout
DATE: Saturday, October 17
SETUP START: 5:00 PM | GUEST ARRIVAL: 7:00 PM | EVENT END: 11:00 PM
ROOM: Taproom back patio (full buyout)
GUEST COUNT: 45 confirmed

CLIENT: Dana Marino | (555) 019-2244 | dana.marino@email.com
DAY-OF CONTACT: same as client
EVENT MANAGER: James (assistant manager)

MENU: Taco bar package + 2 shareable appetizer trays
BAR: Open bar, beer/wine/well only, 4-hour limit (cuts off 11:00 PM)
F&B MINIMUM: $1,800
ALLERGIES: One guest - tree nut allergy, kitchen notified
CAKE: Client bringing own cake, staff to hold in walk-in until 8:30 PM cut

SETUP: Patio in lounge configuration, 6 cocktail rounds + bar seating
AV: Client bringing bluetooth speaker, staff to confirm patio speaker pairing
DECOR: No confetti (patio policy) - balloons and banner OK
VENDORS: none

STAFF: Priya + Marcus (bar), Deshawn (floor)
MANAGER ON DUTY: James
KITCHEN LEAD: Ana

DEPOSIT: $400 paid 9/12 via Stripe
BALANCE DUE: $1,400 (F&B minimum less deposit), due night of event
INTERNAL NOTES: Repeat customer (hosted anniversary party in June) - comp a round of
shots for the host if bar hits minimum before 10 PM.`}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-4">Pre-event checklist</h2>
            <p className="text-vs-text-soft leading-relaxed mb-5">
              Run through this before finalizing and distributing the BEO:
            </p>
            <ul className="space-y-2.5">
              {[
                "Guest count reconfirmed with the client within the last week",
                "Menu and bar package match what's in the signed contract - no last-minute changes missed",
                "Allergies and dietary restrictions confirmed with the kitchen directly, not just noted on paper",
                "Room setup matches what the client walked through or approved",
                "AV/equipment tested if the event depends on it (mic, speaker, screen)",
                "Staffing assigned and confirmed - not just scheduled, but told what this specific event needs",
                "Deposit and balance-due amounts match your records exactly",
                "BEO distributed to every team involved (kitchen, bar, floor, management) - not just the manager",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-vs-text-soft">
                  <span className="mt-0.5 text-vs-accent font-bold shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-14 rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-8">
            <h2 className="font-display text-xl font-bold text-vs-text mb-3">
              Skip the manual template
            </h2>
            <p className="text-vs-text-soft mb-5">
              VenueSprocket's BEO builder generates a BEO like the one above automatically from the
              event details you've already entered - food, beverage, staffing, AV, and timeline
              sections included, with PDF export and a mobile view your staff can pull up on event day.
            </p>
            <Link
              href="/beo-software"
              className="inline-flex rounded-xl bg-vs-accent px-6 py-3 text-base font-bold text-white hover:bg-vs-accent-hover transition-colors"
            >
              See BEO software →
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 text-sm">
            <Link href="/guides" className="font-semibold text-vs-accent hover:underline">← All guides</Link>
            <Link href="/guides/what-is-a-beo" className="font-semibold text-vs-accent hover:underline">What is a BEO? →</Link>
            <Link href="/guides/beo-vs-contract" className="font-semibold text-vs-accent hover:underline">BEO vs. contract →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
