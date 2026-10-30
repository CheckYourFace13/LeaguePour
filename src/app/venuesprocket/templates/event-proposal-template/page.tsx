import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import { proposalChecklist } from "@/lib/seo/vs-templates-data";
import {
  Checklist,
  TemplateBreadcrumb,
  TemplateDownloads,
  TemplateFaqs,
  TemplateFooterLinks,
  TemplateText,
  faqJsonLd,
  templateJsonLd,
  type TemplateFaq,
} from "@/components/venuesprocket/template-parts";
import { PrintButton } from "@/components/venuesprocket/tools/print-button";

const URL = "https://venuesprocket.com/templates/event-proposal-template";
const DESCRIPTION =
  "A free private event proposal template for restaurants, bars, and event spaces: a copy-and-fill proposal, a filled-in example, and a checklist of what to include.";

export const metadata: Metadata = {
  title: { absolute: "Free Private Event Proposal Template | VenueSprocket" },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { siteName: "VenueSprocket", images: [{ url: "/venuesprocket/opengraph-image", alt: "VenueSprocket - private event management software" }], title: "Private event proposal template", description: DESCRIPTION, url: URL },
};

const BLANK = `PRIVATE EVENT PROPOSAL

Prepared for:      [Host name]  ·  [Phone]  ·  [Email]
Prepared by:       [Venue name]  ·  [Your name]  ·  [Date sent]

THE EVENT
Event:             [Occasion, e.g. "Rivera 40th birthday"]
Date:              [Day, date]
Time:              [Arrival time] to [End time]
Space:             [Room or area]  ·  [Private room / full buyout]
Guests:            [Expected count]  ·  Final count due [date]

PRICING
Room fee:                          $[amount]
Food & beverage minimum:           $[amount]  (before tax and service charge)
Service charge / gratuity:         [__]%
Sales tax:                         [__]%
Estimated total:                   $[amount]  (estimate - final bill depends on what is ordered)

TO RESERVE THE DATE
Deposit due at signing:            $[amount]  (applied to your final bill)
Balance due:                       [At the end of the event / __ days before]

KEY TERMS
Cancellation:      [One sentence, e.g. "Deposit refundable until 30 days before the event."]
Rescheduling:      [One sentence, e.g. "One date change within 6 months, subject to availability."]
Full terms are in the event contract.

This proposal is valid until [date]. The date is not held until the deposit is paid.
Next step: reply to accept, sign the contract, and pay the deposit.`;

const EXAMPLE = `PRIVATE EVENT PROPOSAL

Prepared for:      Sam Rivera  ·  [Guest phone]  ·  [Guest email]
Prepared by:       The Juniper Room  ·  Alex, events  ·  March 3

THE EVENT
Event:             Rivera 40th birthday
Date:              Saturday, April 18
Time:              6:30 PM to 10:30 PM
Space:             Back dining room  ·  Private room
Guests:            35 expected  ·  Final count due April 11

PRICING
Room fee:                          $200
Food & beverage minimum:           $1,750  (before tax and service charge)
Service charge / gratuity:         20%
Sales tax:                         8%
Estimated total:                   $2,440  (estimate - final bill depends on what is ordered)

TO RESERVE THE DATE
Deposit due at signing:            $500  (applied to your final bill)
Balance due:                       At the end of the event

KEY TERMS
Cancellation:      Deposit refundable until 30 days before the event.
Rescheduling:      One date change within 6 months, subject to availability.
Full terms are in the event contract.

This proposal is valid until March 10. The date is not held until the deposit is paid.
Next step: reply to accept, sign the contract, and pay the deposit.`;

const FAQS: TemplateFaq[] = [
  {
    q: "Should the food and beverage minimum include tax and service charge?",
    a: "Either works, but say which on the proposal. Most venues set the minimum before tax and service charge, which means the host's final bill will be higher than the minimum - stating that up front avoids the most common end-of-night surprise.",
  },
  {
    q: "Is a proposal the same as a contract?",
    a: "No. The proposal sets out the event and the price so the host can say yes. The contract is what they sign, with the full cancellation, payment, and house-rule terms. This template points to the contract rather than replacing it.",
  },
  {
    q: "How long should a proposal stay valid?",
    a: "Long enough for the host to decide, short enough that you aren't holding a date indefinitely - many venues use about a week. Put the expiry date on the proposal and say the date isn't held until the deposit is paid.",
  },
];

function withFaq(ld: ReturnType<typeof templateJsonLd>) {
  return { ...ld, "@graph": [...ld["@graph"], faqJsonLd(FAQS)] };
}

export default function ProposalTemplatePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            withFaq(templateJsonLd({ url: URL, name: "Proposal template", headline: "Private Event Proposal Template", description: DESCRIPTION })),
          ),
        }}
      />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <TemplateBreadcrumb label="Proposal template" />
          <p className="vs-kicker mb-3 print:hidden">Free template · no email required</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-5">Private event proposal template</h1>
          <p className="mb-8 text-lg leading-relaxed text-vs-text-soft print:hidden">
            A proposal has one job: let the host say yes without a follow-up call. This one fits on a
            page, shows how the price is built, and ends with a single next step. Copy it into a
            document or email, replace the brackets, and send it.
          </p>

          <section className="mb-12">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-vs-text">The template</h2>
              <PrintButton />
            </div>
            <TemplateDownloads file="venuesprocket-event-proposal-template" docxKb={38} pdfKb={6} />
            <TemplateText>{BLANK}</TemplateText>
          </section>

          <section className="mb-12 print:hidden">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-3">Filled-in example</h2>
            <p className="mb-4 text-sm leading-relaxed text-vs-text-soft">
              A fictional venue and host. The estimated total is the room fee plus the minimum, with
              service charge and tax on the minimum: $200 + $1,750 + $350 + $140 = $2,440.
            </p>
            <TemplateText>{EXAMPLE}</TemplateText>
          </section>

          <section className="mb-12 print:hidden">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-3">How to fill it in</h2>
            <ul className="space-y-3 leading-relaxed text-vs-text-soft">
              <li><strong className="text-vs-text">Restate the event first.</strong> If the room, date, or end time differs from what the host asked for, say so at the top - not in the fine print.</li>
              <li><strong className="text-vs-text">Say whether the minimum is before tax and service charge.</strong> It&apos;s the most common source of a surprised host at the end of the night. The <Link href="/tools/food-beverage-minimum-calculator" className="text-vs-accent hover:underline">F&amp;B minimum calculator</Link> shows the full bill for a given headcount.</li>
              <li><strong className="text-vs-text">Label the total as an estimate.</strong> The final bill depends on what the group orders.</li>
              <li><strong className="text-vs-text">Put the key terms on the proposal.</strong> One sentence each on cancellation and rescheduling, so the host doesn&apos;t meet them for the first time in the contract. See <Link href="/guides/event-cancellation-policy-examples-for-restaurants-and-venues" className="text-vs-accent hover:underline">cancellation policy examples</Link>.</li>
              <li><strong className="text-vs-text">Give it an expiry date.</strong> It tells the host the date isn&apos;t held indefinitely, and gives you a clean reason to follow up.</li>
            </ul>
          </section>

          <TemplateFaqs faqs={FAQS} />

          <section className="rounded-2xl border border-vs-border-strong bg-vs-surface p-6 md:p-8 print:hidden">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-2">Proposal checklist</h2>
            <p className="mb-6 text-sm leading-relaxed text-vs-text-soft">Run through this before you send.</p>
            <Checklist data={proposalChecklist} />
          </section>

          <p className="mt-10 text-sm leading-relaxed text-vs-text-soft print:hidden">
            In VenueSprocket, a proposal carries the room fee, food and beverage minimum, and deposit,
            and the host accepts it from a link on their phone -{" "}
            <Link href="/guides/how-to-structure-a-private-event-proposal-that-gets-signed-faster" className="text-vs-accent hover:underline">
              more on structuring a proposal that gets signed
            </Link>.
          </p>

          <TemplateFooterLinks />
        </div>
      </div>
    </>
  );
}
