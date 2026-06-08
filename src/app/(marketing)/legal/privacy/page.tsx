import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | LeaguePour",
  description:
    "LeaguePour privacy policy: what data we collect, how we use it, player marketing preferences, and how to contact us.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-4 text-sm text-lp-muted">Last updated: April 23, 2026</p>
      <div className="prose prose-invert mt-10 max-w-none space-y-6 text-sm text-lp-muted leading-relaxed">
        <p>
          LeaguePour ("we", "us") operates leaguepour.com and provides software for bars and venues to run
          participation-based competitions. This policy explains what information we collect and how we use it.
        </p>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-lp-text">Information we collect</h2>
          <p>
            <strong className="text-lp-text">Account data:</strong> name, email address, and password hash when you
            create a venue or player account.
          </p>
          <p>
            <strong className="text-lp-text">Venue data:</strong> business name, address, Stripe Connect account
            status, competition details, and staff roles you assign.
          </p>
          <p>
            <strong className="text-lp-text">Registration and payment data:</strong> competition signups, team
            memberships, and payment status from Stripe. We do not store full card numbers.
          </p>
          <p>
            <strong className="text-lp-text">Usage data:</strong> standard server logs, page views, and analytics
            through Google Analytics (GA4) to understand how the site is used.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-lp-text">How we use information</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Operate competition signup, payments, standings, and venue dashboards</li>
            <li>Send transactional emails (registration confirmations, password resets)</li>
            <li>Let venues message players who opted in to marketing</li>
            <li>Improve the product and fix errors</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-lp-text">Player marketing preferences</h2>
          <p>
            Players control email and SMS preferences per venue. Venues must honor opt-outs. LeaguePour logs campaign
            sends in-app; external email and SMS delivery depends on connected providers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-lp-text">Third-party services</h2>
          <p>
            We use Stripe for payments, hosting providers for infrastructure, and Google Analytics for site analytics.
            Each provider has its own privacy policy. Payment processing is handled by Stripe; venues connect their own
            Stripe accounts for entry fees.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-lp-text">Cookies and advertising</h2>
          <p>
            LeaguePour uses cookies for authentication and analytics. Google AdSense may serve ads on public pages using
            cookies per Google&apos;s policies. You can manage ad personalization through Google&apos;s ad settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-lp-text">Data retention and deletion</h2>
          <p>
            We retain account and competition data while your account is active. You may request account deletion by
            contacting us. Some records may be kept where required for payments, fraud prevention, or legal compliance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-lp-text">Contact</h2>
          <p>
            Privacy questions:{" "}
            <a href="mailto:hello@leaguepour.com" className="text-lp-accent hover:underline">
              hello@leaguepour.com
            </a>
            . See also our{" "}
            <Link href="/legal/terms" className="text-lp-accent hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </section>

        <p className="text-xs">
          Venues operating in regulated industries (poker where legal, alcohol service, etc.) are responsible for local
          compliance. We recommend counsel review for GDPR, CCPA, or other regional requirements before scaling.
        </p>
      </div>
    </div>
  );
}
