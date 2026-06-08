import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | LeaguePour",
  description:
    "LeaguePour terms of service for venues and players: acceptable use, payments, refunds, and responsibilities.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <h1 className="font-display text-4xl font-bold">Terms of Service</h1>
      <p className="mt-4 text-sm text-lp-muted">Last updated: April 23, 2026</p>
      <div className="prose prose-invert mt-10 max-w-none space-y-6 text-sm text-lp-muted leading-relaxed">
        <p>
          These terms govern use of LeaguePour at leaguepour.com. By creating an account or using the service, you
          agree to these terms.
        </p>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-lp-text">What LeaguePour provides</h2>
          <p>
            LeaguePour is software for participation-based competitions at bars, breweries, restaurants, and venues.
            Features include public signup pages, team registration, Stripe Connect entry fees, standings, and player
            messaging tools. LeaguePour is not a gambling operator and does not run events on your behalf.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-lp-text">Venue responsibilities</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Publish accurate event details, fees, rules, and refund policies</li>
            <li>Follow local laws for games of skill, alcohol service, age restrictions, and poker where legal</li>
            <li>Honor player marketing opt-outs and data preferences</li>
            <li>Pay prizes and run events as described on your signup page</li>
            <li>Maintain a valid Stripe Connect account for paid entry fees</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-lp-text">Player responsibilities</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Provide accurate registration information</li>
            <li>Pay listed entry fees when required for your registration to be confirmed</li>
            <li>Follow venue rules and staff instructions at events</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-lp-text">Payments and refunds</h2>
          <p>
            Entry fees are processed by Stripe. LeaguePour charges a platform fee on paid registrations as shown in
            venue settings. Refunds are issued by the venue through Stripe. Disputes about event outcomes or prizes are
            between players and the venue; LeaguePour provides software only.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-lp-text">Subscriptions</h2>
          <p>
            Venues may subscribe to paid plans for additional features and event limits. Billing is handled through
            Stripe. Cancel or change plans from your venue settings or Stripe billing portal.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-lp-text">Acceptable use</h2>
          <p>
            Do not use LeaguePour for illegal gambling promotion, fake events, harassment, spam, or content that violates
            applicable law. We may suspend accounts that abuse the platform or harm other users.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-lp-text">Disclaimer</h2>
          <p>
            LeaguePour is provided as-is. We do not guarantee uninterrupted service. Venues are solely responsible for
            their events, payouts, and compliance. To the extent permitted by law, LeaguePour is not liable for indirect
            or consequential damages arising from use of the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-lp-text">Contact</h2>
          <p>
            Questions about these terms:{" "}
            <a href="mailto:hello@leaguepour.com" className="text-lp-accent hover:underline">
              hello@leaguepour.com
            </a>
            . See our{" "}
            <Link href="/legal/privacy" className="text-lp-accent hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
