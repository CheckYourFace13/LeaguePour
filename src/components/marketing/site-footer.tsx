import Link from "next/link";
import { marketingRoutes } from "@/lib/routes";
import { LpMarkSvg } from "@/components/lp-logo";

const cols = [
  {
    title: "Product",
    links: [
      { href: marketingRoutes.features, label: "Features" },
      { href: marketingRoutes.howItWorks, label: "How it works" },
      { href: marketingRoutes.pricing, label: "Pricing" },
      { href: marketingRoutes.faq, label: "FAQ" },
      { href: "/guides", label: "Guides" },
      { href: "/for-venues", label: "For venues" },
      { href: "/for-players", label: "For players" },
    ],
  },
  {
    title: "Games",
    links: [
      { href: "/bar-trivia-software", label: "Trivia" },
      { href: "/dart-league-software", label: "Darts" },
      { href: "/cornhole-tournament-software", label: "Cornhole" },
      { href: "/pool-league-management", label: "Pool" },
      { href: "/euchre-tournament-software", label: "Euchre" },
      { href: "/poker-tournament-software", label: "Poker" },
      { href: "/shuffleboard-league-software", label: "Shuffleboard" },
      { href: "/music-bingo-software", label: "Music bingo" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/signup/venue", label: "Start hosting events" },
      { href: "/contact", label: "Contact" },
      { href: "/rules", label: "Rules library" },
      { href: "/history", label: "Game history" },
      { href: marketingRoutes.terms, label: "Terms" },
      { href: marketingRoutes.privacy, label: "Privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-lp-border-strong bg-lp-surface">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-5 md:px-6 md:py-16">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <LpMarkSvg size={38} />
            <p className="font-display text-[2rem] font-extrabold tracking-tight">
              League<span className="text-lp-accent">Pour</span>
            </p>
          </div>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-lp-muted">
            by{" "}
            <a href="https://venuesprocket.com" className="hover:text-lp-accent transition-colors">
              VenueSprocket
            </a>
          </p>
          <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-lp-text-soft">
            Competitions, signups, and entry fees for bars and venues, built for repeat nights.
          </p>
          <div className="mt-6 rounded-xl border border-lp-border bg-lp-bg/60 px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-lp-muted mb-1">Our full platform</p>
            <a
              href="https://venuesprocket.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-lg font-extrabold tracking-tight text-lp-text hover:text-lp-accent"
            >
              VenueSprocket
            </a>
            <p className="mt-1 text-sm text-lp-text-soft">
              Private event management — leads, proposals, contracts, and BEOs for your venue.
            </p>
            <a
              href="https://venuesprocket.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex text-sm font-semibold text-lp-accent hover:underline"
            >
              Learn more →
            </a>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="lp-kicker">{c.title}</p>
            <ul className="mt-5 space-y-1">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                  className="inline-flex min-h-12 items-center text-base font-bold text-lp-text-soft hover:text-lp-accent"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-lp-border/70 py-7 text-center text-[0.9375rem] font-medium text-lp-text-soft">
        Copyright {new Date().getFullYear()}{" "}
        <a href="https://venuesprocket.com" className="hover:text-lp-accent transition-colors">VenueSprocket</a>
        {" "}— LeaguePour is a VenueSprocket product. All rights reserved.
      </div>
    </footer>
  );
}
