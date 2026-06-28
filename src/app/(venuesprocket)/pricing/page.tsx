import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — VenueSprocket",
  description:
    "VenueSprocket pricing: start free with an inquiry form. Upgrade to Pro for contracts, deposits, BEOs, and customer CRM. Affordable plans for restaurants, bars, and breweries.",
  alternates: { canonical: "https://venuesprocket.com/pricing" },
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    tagline: "Start today, no card required",
    cta: "Start Free",
    ctaHref: "/start",
    highlight: false,
    features: [
      "Public inquiry form for your venue",
      "Up to 10 leads/month",
      "Basic lead dashboard",
      "Event calendar view",
      "Simple customer records",
      "Email notifications",
    ],
    notIncluded: ["Proposals", "Contracts", "Stripe deposits", "BEO builder", "Marketing pages"],
  },
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    tagline: "For venues getting started with private events",
    cta: "Start Starter",
    ctaHref: "/start?plan=starter",
    highlight: false,
    features: [
      "Everything in Free",
      "Unlimited inquiries",
      "Lead pipeline",
      "Public event booking page",
      "Basic email follow-up templates",
      "Basic proposal builder",
      "Customer records",
    ],
    notIncluded: ["Contracts", "Stripe deposits", "BEO builder", "Marketing pages"],
  },
  {
    name: "Pro",
    price: "$79",
    period: "/mo",
    tagline: "Full private event management",
    cta: "Start Pro",
    ctaHref: "/start?plan=pro",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Everything in Starter",
      "Proposal builder with line items",
      "Online contract with typed e-signature",
      "Stripe deposit collection",
      "BEO builder with PDF export",
      "Customer CRM with tags",
      "Automated inquiry follow-up",
      "Mobile BEO day-of view",
      "Payment tracking",
    ],
    notIncluded: ["SEO marketing pages", "Advanced automations"],
  },
  {
    name: "Growth",
    price: "$149",
    period: "/mo",
    tagline: "For venues that want leads AND management",
    cta: "Start Growth",
    ctaHref: "/start?plan=growth",
    highlight: false,
    features: [
      "Everything in Pro",
      "SEO marketing pages (birthday, corporate, holiday, etc.)",
      "Seasonal campaign pages",
      "Advanced follow-up automations",
      "LeaguePour module connection",
      "Reporting and revenue tracking",
      "Multi-room support",
      "Up to 5 staff users",
    ],
  },
  {
    name: "Multi-Location",
    price: "Custom",
    period: "",
    tagline: "For restaurant groups, brewery groups, and multi-location venues",
    cta: "Contact Us",
    ctaHref: "/contact",
    highlight: false,
    features: [
      "Everything in Growth",
      "Multiple locations",
      "Advanced permissions",
      "Consolidated reporting",
      "Dedicated onboarding",
      "Priority support",
    ],
  },
];

const faqs = [
  {
    q: "Is the free plan really free?",
    a: "Yes. The free plan gives you a working inquiry form and lead dashboard with no credit card required. You can collect up to 10 leads per month and see how the platform works before upgrading.",
  },
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Yes. Plans are monthly. Upgrade when you need contracts, deposits, and BEOs. Downgrade if your needs change. No lock-in.",
  },
  {
    q: "Does VenueSprocket take a cut of my event revenue?",
    a: "No. VenueSprocket does not take a percentage of your events. You pay a flat monthly plan fee. Stripe processes your deposits and charges their standard payment processing fee (typically 2.9% + 30 cents per transaction), which goes to Stripe, not VenueSprocket.",
  },
  {
    q: "Is LeaguePour included?",
    a: "LeaguePour module access is included in the Growth plan. You can also use LeaguePour separately at leaguepour.com — it has its own pricing for bar league and competition management.",
  },
  {
    q: "What if I just want to try it?",
    a: "Start with the free plan today. No setup call, no onboarding wizard. Your inquiry form can be live in under ten minutes.",
  },
];

export default function VsPricingPage() {
  return (
    <div className="vs-section px-4 md:px-6">
      <div className="mx-auto max-w-6xl">

        {/* Hero */}
        <div className="text-center mb-16">
          <p className="vs-kicker mb-3">Pricing</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-4">
            Start free. Upgrade when you need it.
          </h1>
          <p className="vs-page-sub mx-auto text-center max-w-2xl">
            The free plan gets your inquiry form live immediately. Upgrade to Pro for contracts,
            deposits, and BEOs. Growth adds marketing pages that help you generate leads.
          </p>
        </div>

        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-20">
          {plans.map((p) => (
            <div
              key={p.name}
              className={[
                "relative flex flex-col rounded-2xl border p-6",
                p.highlight
                  ? "vs-feature-ring border-vs-accent bg-vs-surface"
                  : "border-vs-border bg-vs-surface",
              ].join(" ")}
            >
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-vs-accent px-3 py-1 text-xs font-bold text-white">
                  {p.badge}
                </div>
              )}
              <p className="text-sm font-bold uppercase tracking-widest text-vs-muted mb-1">
                {p.name}
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-3xl font-extrabold text-vs-text">{p.price}</span>
                <span className="text-vs-muted text-sm">{p.period}</span>
              </div>
              <p className="text-xs text-vs-muted mb-5 leading-snug">{p.tagline}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-vs-text-soft">
                    <span className="mt-0.5 text-vs-accent font-bold shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={p.ctaHref}
                className={[
                  "mt-auto block rounded-lg px-4 py-3 text-center text-sm font-bold transition-colors",
                  p.highlight
                    ? "bg-vs-accent text-white hover:bg-vs-accent-hover"
                    : "border border-vs-border-strong bg-vs-bg text-vs-text hover:border-vs-accent hover:text-vs-accent",
                ].join(" ")}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Value pitch */}
        <div className="mb-20 rounded-2xl border border-vs-border bg-vs-surface-2 p-8 text-center max-w-3xl mx-auto">
          <p className="font-display text-2xl font-bold text-vs-text mb-3">
            If VenueSprocket helps you book one extra party, it pays for itself.
          </p>
          <p className="text-vs-text-soft">
            A single birthday party or corporate event booked at $500 to $3,000+ covers
            your monthly Pro plan many times over. The inquiry form is free to start.
          </p>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-vs-text text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-vs-border bg-vs-surface p-6">
                <p className="font-semibold text-vs-text mb-2">{faq.q}</p>
                <p className="text-sm text-vs-text-soft leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/start"
              className="inline-flex rounded-xl bg-vs-accent px-8 py-4 text-lg font-bold text-white hover:bg-vs-accent-hover transition-colors"
            >
              Start Free Today
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
