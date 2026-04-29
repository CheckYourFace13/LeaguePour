import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact LeaguePour for product questions, billing, or migration.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 md:px-6 md:py-20">
      <h1 className="font-display text-4xl font-bold">Contact</h1>
      <p className="mt-4 text-lp-muted">Setup, billing, or migration — we read every note.</p>
      <ContactForm />
    </div>
  );
}
