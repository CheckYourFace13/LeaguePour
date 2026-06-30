import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | VenueSprocket",
  description: "How VenueSprocket collects, uses, and protects your data.",
  alternates: { canonical: "https://venuesprocket.com/legal/privacy" },
};

export default function VsPrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <h1 className="font-display text-4xl font-extrabold text-[var(--vs-text)]">Privacy Policy</h1>
      <p className="mt-3 text-sm text-[var(--vs-muted)]">Last updated: June 29, 2026</p>

      <div className="mt-10 space-y-8 text-sm text-[var(--vs-text-soft)] leading-relaxed">

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">What we collect</h2>
          <p><strong className="text-[var(--vs-text)]">Venue accounts:</strong> When you create a VenueSprocket account,
          we collect your name, business name, email address, and billing information.</p>
          <p><strong className="text-[var(--vs-text)]">Event customers:</strong> When a customer submits an inquiry
          through your venue's inquiry page, we collect the information they provide (name, email, phone, event details).
          This data belongs to you as the venue and is used only to deliver the service.</p>
          <p><strong className="text-[var(--vs-text)]">Usage data:</strong> We collect standard server logs and
          anonymized analytics to improve the platform. We do not sell this data.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">How we use your data</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>To operate and deliver VenueSprocket features to you</li>
            <li>To send transactional emails (new lead notifications, contract alerts, billing receipts)</li>
            <li>To process subscription payments via Stripe</li>
            <li>To respond to support requests</li>
            <li>To improve the platform through anonymized usage analytics</li>
          </ul>
          <p>We do not use your customers' inquiry data for advertising or sell it to third parties.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">Data sharing</h2>
          <p>We share data only with:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong className="text-[var(--vs-text)]">Stripe</strong> — for payment processing</li>
            <li><strong className="text-[var(--vs-text)]">Resend</strong> — for transactional email delivery</li>
            <li><strong className="text-[var(--vs-text)]">Supabase</strong> — for secure database hosting</li>
            <li>Law enforcement when required by valid legal process</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">Data retention</h2>
          <p>
            We retain your account data for as long as your account is active. If you cancel your account, we will
            delete your data within 90 days upon written request. Customer inquiry data submitted through your venue
            pages is retained as long as your account is active and deleted with your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">Cookies</h2>
          <p>
            VenueSprocket uses cookies only for essential functions: keeping you logged in to your venue dashboard.
            We do not use third-party advertising cookies or tracking pixels.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data at any time by{" "}
            <Link href="/contact" className="text-[var(--vs-accent)] hover:underline font-semibold">
              contacting us
            </Link>
            . We will respond within 30 days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">Security</h2>
          <p>
            All data is encrypted in transit (TLS) and at rest. We use Supabase for database hosting with role-based
            access controls. No payment card data is stored on VenueSprocket servers — all card processing is handled
            by Stripe.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[var(--vs-text)]">Questions</h2>
          <p>
            Privacy questions?{" "}
            <Link href="/contact" className="text-[var(--vs-accent)] hover:underline font-semibold">
              Contact us
            </Link>
            .
          </p>
        </section>

      </div>
    </div>
  );
}
