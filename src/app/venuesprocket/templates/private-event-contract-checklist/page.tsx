import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import { contractChecklist } from "@/lib/seo/vs-templates-data";
import { Checklist, TemplateBreadcrumb, TemplateFooterLinks, TemplateText, templateJsonLd } from "@/components/venuesprocket/template-parts";
import { PrintButton } from "@/components/venuesprocket/tools/print-button";

const URL = "https://venuesprocket.com/templates/private-event-contract-checklist";
const DESCRIPTION =
  "A free private event contract checklist for venues: every topic your contract should cover, plus sample deposit, cancellation, and guest-count wording to adapt with your attorney.";

export const metadata: Metadata = {
  title: { absolute: "Private Event Contract Checklist & Clauses | VenueSprocket" },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { siteName: "VenueSprocket", images: [{ url: "/venuesprocket/opengraph-image", alt: "VenueSprocket - private event management software" }], title: "Private event contract checklist", description: DESCRIPTION, url: URL },
};

const SAMPLE = `DEPOSIT
A deposit of $[amount] is due when this agreement is signed. The event date is not reserved
until the deposit is paid. The deposit is applied to the final bill.

FOOD & BEVERAGE MINIMUM
The Host agrees to a food and beverage minimum of $[amount], before tax and service charge.
If food and beverage purchases are less than the minimum, the difference will be added to
the final bill as a minimum shortfall.

GUEST COUNT
The final guest count is due [__] days before the event. The food and beverage minimum does
not decrease if the final count is lower than the estimate.

CANCELLATION BY THE HOST
If the Host cancels more than [__] days before the event, the deposit is refunded in full.
If the Host cancels [__] days or fewer before the event, the deposit is not refundable.

RESCHEDULING
The Host may reschedule once, to a date within [__] months of the original date, subject to
availability, and the deposit will transfer to the new date.

CANCELLATION BY THE VENUE
If the Venue must cancel the event for any reason, all amounts paid by the Host will be
refunded in full.

BALANCE
The remaining balance is due [at the end of the event / __ days before the event] by
[accepted payment methods].`;

export default function ContractChecklistPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(templateJsonLd({ url: URL, name: "Contract checklist", headline: "Private Event Contract Checklist", description: DESCRIPTION })),
        }}
      />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <TemplateBreadcrumb label="Contract checklist" />
          <p className="vs-kicker mb-3 print:hidden">Free checklist · no email required</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-5">Private event contract checklist</h1>
          <p className="mb-4 text-lg leading-relaxed text-vs-text-soft print:hidden">
            Most private event disputes come from something the contract never mentioned: a guest
            count that dropped, a reschedule, a deposit nobody defined. Use this checklist to review
            your own contract before the next booking.
          </p>
          <p className="mb-10 rounded-xl border border-vs-border bg-vs-surface-2 p-4 text-sm leading-relaxed text-vs-text-soft">
            This is a checklist of topics and example wording, not legal advice. Rules on deposits,
            refunds, and alcohol service differ by state - have an attorney draft or review the
            contract you actually use.
          </p>

          <section className="mb-12 rounded-2xl border border-vs-border-strong bg-vs-surface p-6 md:p-8 print:border-0 print:p-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-vs-text">The checklist</h2>
              <PrintButton />
            </div>
            <Checklist data={contractChecklist} />
          </section>

          <section className="mb-12">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-3">Sample wording to adapt</h2>
            <p className="mb-4 text-sm leading-relaxed text-vs-text-soft print:hidden">
              Plain-language starting points for the clauses that cause the most trouble. Fill in your
              own numbers, then have them reviewed.
            </p>
            <TemplateText>{SAMPLE}</TemplateText>
          </section>

          <section className="mb-4 print:hidden">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-3">Choosing your numbers</h2>
            <ul className="space-y-3 leading-relaxed text-vs-text-soft">
              <li><strong className="text-vs-text">Deposit size:</strong> see <Link href="/guides/private-event-deposit-policies-that-protect-your-venue" className="text-vs-accent hover:underline">deposit policies that protect your venue</Link>, or run it through the <Link href="/tools/event-deposit-calculator" className="text-vs-accent hover:underline">deposit calculator</Link>.</li>
              <li><strong className="text-vs-text">Cancellation window:</strong> compare a single cutoff, a tiered schedule, and a reschedule-first policy in <Link href="/guides/event-cancellation-policy-examples-for-restaurants-and-venues" className="text-vs-accent hover:underline">cancellation policy examples</Link>.</li>
              <li><strong className="text-vs-text">Contract vs. BEO:</strong> the contract is the agreement; the BEO is the operating plan. <Link href="/guides/beo-vs-contract" className="text-vs-accent hover:underline">Here&apos;s the difference</Link>.</li>
            </ul>
          </section>

          <p className="mt-8 text-sm leading-relaxed text-vs-text-soft print:hidden">
            In VenueSprocket, your own contract text goes into every contract, and the customer signs
            with a typed signature recorded with a timestamp before paying the deposit.{" "}
            <Link href="/event-contract-software" className="text-vs-accent hover:underline">How contracts work →</Link>
          </p>

          <TemplateFooterLinks />
        </div>
      </div>
    </>
  );
}
