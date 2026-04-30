import Link from "next/link";
import { marketingRoutes } from "@/lib/routes";

const cols = [
  {
    title: "Product",
    links: [
      { href: marketingRoutes.features, label: "Features" },
      { href: marketingRoutes.howItWorks, label: "How it works" },
      { href: marketingRoutes.pricing, label: "Pricing" },
      { href: marketingRoutes.faq, label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/signup/venue", label: "Create venue" },
      { href: "/contact", label: "Contact" },
      { href: marketingRoutes.terms, label: "Terms" },
      { href: marketingRoutes.privacy, label: "Privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-lp-border bg-lp-surface">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-4 md:px-6 md:py-16">
        <div className="md:col-span-2">
          <p className="font-display text-2xl font-bold tracking-tight">
            League<span className="text-lp-accent">Pour</span>
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-lp-muted">
            Competitions, signups, and entry fees for bars and venues — built for repeat nights.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="lp-kicker">{c.title}</p>
            <ul className="mt-5 space-y-1">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex min-h-11 items-center text-[15px] font-semibold text-lp-text-soft hover:text-lp-accent"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-lp-border/60 py-7 text-center text-sm text-lp-muted">
        © {new Date().getFullYear()} LeaguePour. All rights reserved.
      </div>
    </footer>
  );
}
