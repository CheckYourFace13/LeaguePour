import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Private Event Inquiry Form Template | VenueSprocket" },
  description:
    "The fields every private event inquiry form needs, a filled-out example, required vs. optional fields, and what to do in the first hour after a lead comes in.",
  alternates: { canonical: "https://venuesprocket.com/guides/private-event-inquiry-form-template" },
  openGraph: {
    title: "Private Event Inquiry Form Template",
    description:
      "A copyable inquiry form template with an example submission and a first-response checklist.",
    url: "https://venuesprocket.com/guides/private-event-inquiry-form-template",
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
        { "@type": "ListItem", position: 3, name: "Private Event Inquiry Form Template", item: "https://venuesprocket.com/guides/private-event-inquiry-form-template" },
      ],
    },
    {
      "@type": "Article",
      headline: "Private Event Inquiry Form Template",
      description:
        "The fields every private event inquiry form needs, a filled-out example, and what to do in the first hour after a lead comes in.",
      author: { "@type": "Organization", name: "VenueSprocket" },
      publisher: { "@type": "Organization", name: "VenueSprocket", url: "https://venuesprocket.com" },
      url: "https://venuesprocket.com/guides/private-event-inquiry-form-template",
      datePublished: "2026-08-19",
      dateModified: "2026-08-19",
    },
  ],
};

type Field = { label: string; required: boolean; note?: string };

const fields: Field[] = [
  { label: "Full name", required: true },
  { label: "Email address", required: true },
  { label: "Phone number", required: true, note: "Faster follow-up than email alone" },
  { label: "Event type", required: true, note: "Birthday, corporate event, holiday party, rehearsal dinner, buyout, other" },
  { label: "Preferred event date", required: true },
  { label: "Date flexibility", required: false, note: "'Exact date only' vs. 'flexible within a range' changes how you respond" },
  { label: "Estimated guest count", required: true },
  { label: "Preferred time / duration", required: false },
  { label: "Space or room preference", required: false, note: "Only if your venue has multiple spaces" },
  { label: "Budget range", required: false, note: "Optional, but helps you propose the right package first" },
  { label: "Catering / beverage needs", required: false },
  { label: "How did you hear about us?", required: false, note: "Useful for tracking what's actually generating leads" },
  { label: "Additional details / special requests", required: false },
];

export default function InquiryFormTemplateGuide() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-8 text-sm text-vs-muted">
            <Link href="/guides" className="hover:text-vs-accent">Guides</Link>
            {" / "}
            <span className="text-vs-text-soft font-medium">Inquiry Form Template</span>
          </nav>

          <p className="vs-kicker mb-3">Free template</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-6">
            Private Event Inquiry Form Template
          </h1>
          <p className="text-vs-text-soft text-lg leading-relaxed mb-10">
            The best inquiry form asks just enough to let you respond usefully - not so much that
            someone abandons it halfway through. Here's the field list that covers the essentials
            without becoming a wall of questions.
          </p>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-4">The template</h2>
            <p className="text-vs-text-soft leading-relaxed mb-6">
              Fields marked <span className="font-semibold text-vs-accent">Required</span> should
              always be collected - without them you can't send a useful first reply. Fields marked{" "}
              <span className="font-semibold text-vs-muted">Optional</span> add helpful context but
              shouldn't block a submission if left blank; every extra required field increases the
              chance someone gives up and calls a competitor instead.
            </p>
            <div className="rounded-2xl border border-vs-border bg-vs-surface p-6">
              <ul className="space-y-2.5">
                {fields.map((f) => (
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
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-4">Example: a filled-out inquiry</h2>
            <p className="text-vs-text-soft leading-relaxed mb-5">
              Here's what a completed inquiry looks like using the fields above, for a corporate
              holiday party lead:
            </p>
            <div className="rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-6 font-mono text-sm text-vs-text-soft leading-relaxed whitespace-pre-wrap">
{`NAME: Rachel Kim
EMAIL: rachel.kim@brightpath-consulting.com
PHONE: (555) 402-8871
EVENT TYPE: Corporate holiday party
PREFERRED DATE: December 12
DATE FLEXIBILITY: Could also do Dec 5 or Dec 19 if 12th isn't available
GUEST COUNT: ~35 people
PREFERRED TIME: Evening, 6-9 PM
SPACE PREFERENCE: Private room if available
BUDGET RANGE: $2,500-3,500 total
CATERING NEEDS: Heavy apps + open bar, one vegetarian guest
HEARD ABOUT US: Google search
ADDITIONAL DETAILS: This would be our first time using your venue - we've done
holiday parties at [competitor] the last two years and want to try somewhere new.`}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-4">
              What to do in the first hour after an inquiry comes in
            </h2>
            <p className="text-vs-text-soft leading-relaxed mb-5">
              Response speed matters more than response perfection - a fast, simple reply beats a
              slow, thorough one almost every time, since most people are inquiring at more than one
              venue at once.
            </p>
            <ul className="space-y-2.5">
              {[
                "Reply within an hour if possible, same business day at the latest - the venue that responds first often wins the booking regardless of price",
                "Confirm you received the inquiry and restate the key details back (date, guest count, event type) so the customer knows you actually read it",
                "If the requested date is unavailable, offer the nearest open alternatives immediately rather than just saying no",
                "Ask any qualifying questions you still need answered rather than waiting for a phone call",
                "Set a clear next step and timeline: 'I'll send a full proposal by tomorrow afternoon' beats leaving them wondering when they'll hear back",
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
              Skip the manual form and follow-up
            </h2>
            <p className="text-vs-text-soft mb-5">
              VenueSprocket gives your venue a public inquiry page with these fields built in - every
              submission lands in a lead pipeline automatically, with follow-up reminders so inquiries
              don't sit unanswered.
            </p>
            <Link
              href="/private-event-booking-software"
              className="inline-flex rounded-xl bg-vs-accent px-6 py-3 text-base font-bold text-white hover:bg-vs-accent-hover transition-colors"
            >
              See private event booking software →
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 text-sm">
            <Link href="/guides" className="font-semibold text-vs-accent hover:underline">← All guides</Link>
            <Link href="/private-event-booking-software" className="font-semibold text-vs-accent hover:underline">Private event booking software →</Link>
            <Link href="/guides/what-is-a-beo" className="font-semibold text-vs-accent hover:underline">What is a BEO? →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
