import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "LeaguePour terms of service.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <h1 className="font-display text-4xl font-bold">Terms of Service</h1>
      <p className="mt-4 text-sm text-lp-muted">Last updated: April 23, 2026</p>
      <div className="prose prose-invert mt-10 max-w-none space-y-4 text-sm text-lp-muted leading-relaxed">
        <p>
          LeaguePour is a software platform for participation-based competitions. Venues use LeaguePour
          to publish events, collect entry fees, and communicate with players.
        </p>
        <p>
          By using LeaguePour, you agree to follow applicable local laws regarding games of skill,
          games of chance, alcohol service, and data privacy. Venues are responsible for their own
          promotions, payouts, and age restrictions.
        </p>
        <p>
          Production operators should publish counsel-approved terms covering refunds, disputes, and
          liability limitations before opening to the public.
        </p>
      </div>
    </div>
  );
}
