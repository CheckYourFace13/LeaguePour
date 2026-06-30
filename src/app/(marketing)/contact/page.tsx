import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact LeaguePour",
  description:
    "Contact LeaguePour for venue setup help, billing questions, player support, or migration from spreadsheets and paper signups.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 md:px-6 md:py-20">
      <h1 className="font-display text-4xl font-bold">Contact</h1>
      <p className="mt-4 text-lg text-lp-muted leading-relaxed">
        Questions about venue setup, Stripe Connect, player registration, or moving off spreadsheets? Send a note and we
        read every message.
      </p>

      <div className="mt-8 space-y-3 rounded-xl border border-lp-border bg-lp-surface/40 p-5 text-sm text-lp-muted">
        <p>
          <span className="font-semibold text-lp-text">Typical response time:</span> 1–2 business days.
        </p>
        <p>
          <span className="font-semibold text-lp-text">Venue setup help:</span> Include your bar name, city, and what
          you run (trivia, darts, cornhole, pool, etc.).
        </p>
        <p>
          <span className="font-semibold text-lp-text">Player questions:</span> Include the venue name and competition
          you are trying to join.
        </p>
      </div>

      <p className="mt-6 text-sm text-lp-muted">
        Legal and privacy requests: see our{" "}
        <Link href="/legal/privacy" className="font-semibold text-lp-accent hover:underline">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/legal/terms" className="font-semibold text-lp-accent hover:underline">
          Terms of Service
        </Link>
        .
      </p>

      <ContactForm />
    </div>
  );
}
