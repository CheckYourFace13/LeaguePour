import Link from "next/link";
import { VsMarkSvg } from "@/components/venuesprocket/vs-logo";

const cols = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/start", label: "Start Free" },
      { href: "/leaguepour", label: "LeaguePour" },
    ],
  },
  {
    title: "Software",
    links: [
      { href: "/private-event-booking-software", label: "Private Event Booking" },
      { href: "/beo-software", label: "BEO Builder" },
      { href: "/event-contract-software", label: "Contracts" },
      { href: "/event-deposit-software", label: "Deposits" },
      { href: "/venue-marketing-software", label: "Inquiry Page" },
    ],
  },
  {
    title: "Venue Types",
    links: [
      { href: "/restaurant-event-management-software", label: "Restaurants" },
      { href: "/brewery-event-management-software", label: "Breweries" },
      { href: "/bar-event-management-software", label: "Bars" },
      { href: "/taproom-event-management-software", label: "Taprooms" },
      { href: "/banquet-hall-software", label: "Banquet Halls" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/demo", label: "Sample workflow" },
      { href: "/faq", label: "FAQ" },
      { href: "/guides", label: "Guides" },
      { href: "/templates", label: "Free templates" },
      { href: "/tools", label: "Free calculators" },
    ],
  },
  {
    title: "Compare",
    links: [
      { href: "/compare", label: "All comparisons" },
      { href: "/compare/tripleseat", label: "vs Tripleseat" },
      { href: "/compare/perfect-venue", label: "vs Perfect Venue" },
      { href: "/compare/planning-pod", label: "vs Planning Pod" },
      { href: "/compare/event-temple", label: "vs Event Temple" },
      { href: "/compare/honeybook", label: "vs HoneyBook" },
      { href: "/compare/google-forms", label: "vs Google Forms" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/privacy", label: "Privacy" },
    ],
  },
];

export function VsFooter() {
  return (
    <footer className="mt-auto border-t border-vs-border bg-vs-surface-2">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        {/* Brand */}
        <div className="mb-10 flex items-start gap-4">
          <VsMarkSvg size={40} />
          <div>
            <p className="font-display text-2xl font-extrabold tracking-tight text-vs-text leading-none">
              Venue<span className="text-vs-accent">Sprocket</span>
            </p>
            <p className="mt-2 max-w-sm text-sm text-vs-text-soft leading-relaxed">
              Simple private event management for restaurants, breweries, bars, taprooms, and event spaces.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-vs-muted">Run leagues too?</span>
              <Link href="/leaguepour" className="text-sm font-semibold text-vs-accent hover:underline">
                See LeaguePour, our companion product →
              </Link>
            </div>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {cols.map((c) => (
            <div key={c.title}>
              <p className="vs-kicker mb-4">{c.title}</p>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm font-medium text-vs-text-soft hover:text-vs-accent transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-vs-border py-6 text-center text-sm text-vs-muted">
        Copyright {new Date().getFullYear()} VenueSprocket. All rights reserved.
      </div>
    </footer>
  );
}
