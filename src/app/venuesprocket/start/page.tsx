import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Start Free — VenueSprocket",
  description:
    "Start VenueSprocket for free. Get your venue's private event inquiry page live in under ten minutes. No credit card required.",
  alternates: { canonical: "https://venuesprocket.com/start" },
};

const steps = [
  { n: "1", title: "Create your venue profile", body: "Name, location, event types, and basic capacity. Takes about three minutes." },
  { n: "2", title: "Publish your inquiry page", body: "Your public booking page goes live immediately. Share the link or embed it on your website." },
  { n: "3", title: "Receive your first lead", body: "Customers submit inquiries and they land in your dashboard automatically." },
  { n: "4", title: "Upgrade when you're ready", body: "Upgrade to Pro when you need contracts, deposits, and BEOs. No pressure." },
];

const plans = [
  { key: "free", name: "Free", price: "$0", highlight: false, features: ["Inquiry form", "Up to 10 leads/mo", "Lead dashboard", "Email notifications"] },
  { key: "pro", name: "Pro", price: "$79/mo", highlight: true, features: ["Everything in Free", "Unlimited inquiries", "Proposals", "Contracts + e-signature", "Stripe deposits", "BEO builder", "Customer CRM"] },
  { key: "growth", name: "Growth", price: "$149/mo", highlight: false, features: ["Everything in Pro", "SEO marketing pages", "LeaguePour module", "Advanced automations", "Multi-room support"] },
];

export default async function VsStartPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;

  // Build the signup URL — always goes to the shared venue signup, tagged for VS context
  const signupHref = plan && plan !== "free"
    ? `/signup/venue?from=vs&plan=${plan}`
    : `/signup/venue?from=vs`;

  const selectedPlan = plans.find((p) => p.key === plan);
  const selectedLabel = selectedPlan?.name ?? null;

  return (
    <div className="vs-section px-4 md:px-6">
      <div className="mx-auto max-w-3xl">

        {/* Hero */}
        <div className="text-center mb-14">
          <p className="vs-kicker mb-3">Get started</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-4">
            {selectedLabel ? `Start ${selectedLabel} — ${selectedPlan!.price}` : "Start free. Be live today."}
          </h1>
          <p className="vs-page-sub mx-auto text-center max-w-2xl">
            {selectedLabel
              ? "Create your account and go straight to checkout. Cancel anytime."
              : "Your venue's private event inquiry page can be live in under ten minutes. No credit card required to start."}
          </p>
        </div>

        {/* Sign up CTA */}
        <div className="mb-14 rounded-2xl border-2 border-vs-accent/40 bg-vs-surface p-10 text-center">
          <p className="text-vs-muted text-sm mb-3 font-semibold uppercase tracking-widest">Step one</p>
          <h2 className="font-display text-2xl font-bold text-vs-text mb-4">
            {selectedLabel ? `Create your ${selectedLabel} account` : "Create your free account"}
          </h2>
          <p className="text-vs-text-soft mb-6">
            {selectedLabel
              ? "Create your account — you'll be taken to checkout immediately after."
              : "Sign up with your email. No credit card. No onboarding call required."}
          </p>
          <Link
            href={signupHref}
            className="inline-flex rounded-xl bg-vs-accent px-10 py-4 text-xl font-bold text-white hover:bg-vs-accent-hover transition-colors"
          >
            {selectedLabel ? `Create Account & Checkout →` : "Create Free Account →"}
          </Link>
          <p className="mt-4 text-xs text-vs-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-vs-accent hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {/* How it works */}
        <div className="mb-14">
          <h2 className="font-display text-2xl font-bold text-vs-text text-center mb-8">
            How it works
          </h2>
          <div className="space-y-4">
            {steps.map((s) => (
              <div key={s.n} className="flex gap-4 rounded-xl border border-vs-border bg-vs-surface p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vs-accent text-sm font-bold text-white">
                  {s.n}
                </div>
                <div>
                  <p className="font-semibold text-vs-text">{s.title}</p>
                  <p className="mt-1 text-sm text-vs-text-soft">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plans at a glance */}
        <div className="mb-14">
          <h2 className="font-display text-2xl font-bold text-vs-text text-center mb-6">
            Plans at a glance
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={[
                  "rounded-2xl border p-6",
                  p.highlight
                    ? "border-vs-accent/50 bg-vs-surface-2 ring-2 ring-vs-accent/20"
                    : "border-vs-border bg-vs-surface",
                ].join(" ")}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-vs-muted mb-1">{p.name}</p>
                <p className="font-display text-2xl font-extrabold text-vs-text mb-4">{p.price}</p>
                <ul className="space-y-2 mb-4">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-vs-text-soft">
                      <span className="text-vs-accent font-bold shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.key === "free" ? `/signup/venue?from=vs` : `/start?plan=${p.key}`}
                  className={[
                    "block w-full rounded-lg py-2.5 text-center text-sm font-bold transition-colors",
                    p.highlight
                      ? "bg-vs-accent text-white hover:bg-vs-accent-hover"
                      : "border border-vs-border-strong text-vs-text hover:border-vs-accent hover:text-vs-accent",
                  ].join(" ")}
                >
                  Start {p.name}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center mt-4">
            <Link href="/pricing" className="text-sm font-semibold text-vs-accent hover:underline">
              See full pricing →
            </Link>
          </p>
        </div>

        {/* Value pitch */}
        <div className="text-center rounded-2xl border border-vs-border bg-vs-surface-2 p-8">
          <p className="font-display text-xl font-bold text-vs-text mb-2">
            If VenueSprocket helps you book one extra party, it pays for itself.
          </p>
          <p className="text-vs-text-soft text-sm">
            Start free. Upgrade when you're ready to send contracts, collect deposits, and build BEOs.
          </p>
        </div>

      </div>
    </div>
  );
}
