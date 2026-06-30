import Link from "next/link";
import { VsLogo } from "@/components/venuesprocket/vs-logo";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/leaguepour", label: "LeaguePour" },
];

export function VsHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-vs-border bg-vs-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <VsLogo size={32} showWordmark={true} />
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-vs-text-soft hover:text-vs-accent transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="hidden text-sm font-semibold text-vs-text-soft hover:text-vs-accent transition-colors md:block"
          >
            Log in
          </Link>
          <Link
            href="/start"
            className="rounded-lg bg-vs-accent px-4 py-2 text-sm font-bold text-white hover:bg-vs-accent-hover transition-colors"
          >
            Start Free
          </Link>
        </div>
      </div>
    </header>
  );
}
