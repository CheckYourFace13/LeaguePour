import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "LeaguePour privacy policy.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-4 text-sm text-lp-muted">Last updated: April 23, 2026</p>
      <div className="prose prose-invert mt-10 max-w-none space-y-4 text-sm text-lp-muted leading-relaxed">
        <p>
          LeaguePour stores venue and player account data to provide competition signup, payment, and
          communication features. We process only the data needed to operate the service.
        </p>
        <p>
          Players control promotional preferences by channel and can opt out. Venue operators are required
          to honor these preferences when messaging.
        </p>
        <p>
          For production launch, we recommend counsel review for regional requirements including GDPR,
          CCPA, and any venue-specific compliance obligations.
        </p>
      </div>
    </div>
  );
}
