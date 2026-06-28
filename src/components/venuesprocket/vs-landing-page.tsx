import Link from "next/link";
import type { VsLandingData } from "@/lib/seo/vs-landing-data";

export function VsLandingPage({ data }: { data: VsLandingData }) {
  return (
    <div className="vs-section px-4 md:px-6">
      <div className="mx-auto max-w-4xl">

        {/* Hero */}
        <div className="mb-16">
          <p className="vs-kicker mb-3">{data.kicker}</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-5">
            {data.hero}
          </h1>
          <p className="text-vs-text-soft text-xl leading-relaxed mb-8 max-w-3xl">
            {data.heroSub}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/start"
              className="inline-flex rounded-xl bg-vs-accent px-7 py-4 text-lg font-bold text-white hover:bg-vs-accent-hover transition-colors"
            >
              Start Free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex rounded-xl border border-vs-border-strong bg-vs-bg px-7 py-4 text-lg font-bold text-vs-text hover:border-vs-accent transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>

        {/* Why */}
        <div className="mb-16 rounded-2xl border border-vs-border bg-vs-surface-2 p-8">
          <div className="flex items-start gap-4">
            <span className="text-4xl shrink-0">{data.icon}</span>
            <p className="text-vs-text-soft leading-relaxed text-lg">{data.why}</p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold text-vs-text mb-8">
            What {data.title} includes
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {data.features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-vs-border bg-vs-surface p-6"
              >
                <h3 className="font-semibold text-vs-text mb-2">{f.title}</h3>
                <p className="text-sm text-vs-text-soft leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Use cases */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold text-vs-text mb-5">
            Built for venues like yours
          </h2>
          <ul className="space-y-3">
            {data.useCases.map((u) => (
              <li key={u} className="flex items-start gap-3 text-vs-text-soft">
                <span className="mt-1 text-vs-accent font-bold shrink-0">✓</span>
                {u}
              </li>
            ))}
          </ul>
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold text-vs-text mb-6">
            Common questions
          </h2>
          <div className="space-y-4">
            {data.faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-vs-border bg-vs-surface p-6"
              >
                <p className="font-semibold text-vs-text mb-2">{faq.q}</p>
                <p className="text-sm text-vs-text-soft leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center rounded-2xl border border-vs-border-strong bg-vs-surface p-10">
          <h2 className="font-display text-2xl font-bold text-vs-text mb-3">
            {data.cta}
          </h2>
          <p className="text-vs-text-soft mb-6">{data.ctaSub}</p>
          <Link
            href="/start"
            className="inline-flex rounded-xl bg-vs-accent px-8 py-4 text-lg font-bold text-white hover:bg-vs-accent-hover transition-colors"
          >
            Get Started Free
          </Link>
        </div>

        {/* Comparison links */}
        <div className="mt-12">
          <p className="text-sm text-vs-muted text-center mb-4">
            How does VenueSprocket compare?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "vs Tripleseat", slug: "tripleseat" },
              { label: "vs Perfect Venue", slug: "perfect-venue" },
              { label: "vs Planning Pod", slug: "planning-pod" },
              { label: "vs HoneyBook", slug: "honeybook" },
            ].map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="rounded-lg border border-vs-border bg-vs-bg px-3 py-1.5 text-xs font-semibold text-vs-muted hover:border-vs-accent hover:text-vs-accent transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
