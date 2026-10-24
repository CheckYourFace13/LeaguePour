import type { Metadata } from "next";
import Link from "next/link";
import { DISCOVERY_GAMES } from "@/lib/seo/discovery-games";
import { getAllFindSlugs } from "@/lib/seo/render-find-page";

// /find was a 404 while /find/<game> pages worked. This is a plain public entry point to those
// existing discovery pages - no login, no new data. Noindex (it's a navigation hub with no content
// of its own); the game pages it links to make their own index decision from live listings.
export const metadata: Metadata = {
  title: { absolute: "Find bar leagues and game nights | LeaguePour" },
  description: "Browse public dart leagues, cornhole tournaments, trivia nights, and other bar competitions by game.",
  alternates: { canonical: "/find" },
  robots: { index: false, follow: true },
  openGraph: {
    siteName: "LeaguePour",
    images: [{ url: "/opengraph-image", alt: "LeaguePour - venue competition software for bars" }],
    title: "Find bar leagues and game nights",
    description: "Browse public bar competitions by game.",
    url: "/find",
  },
};

export default function FindIndexPage() {
  const live = new Set(getAllFindSlugs().map((s) => `/find/${s}`));
  const games = DISCOVERY_GAMES.filter((g) => live.has(g.findPath));
  return (
    <div className="lp-section mx-auto max-w-4xl px-4 md:px-6">
      <h1 className="lp-page-title text-4xl md:text-5xl">Find a game night</h1>
      <p className="lp-page-sub mt-4 max-w-2xl text-lg text-lp-text-soft">
        Pick a game to see public leagues and tournaments from venues on LeaguePour. No account needed
        to browse - you only sign up when you register for something.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {games.map((g) => (
          <li key={g.slug}>
            <Link
              href={g.findPath}
              className="block rounded-2xl border border-lp-border bg-lp-surface/50 p-5 transition-colors hover:border-lp-accent"
            >
              <p className="font-display text-xl font-bold text-lp-text">{g.pluralLabel}</p>
              <p className="mt-1 text-sm text-lp-text-soft">{g.patronHeadline}</p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm text-lp-muted">
        Running events at your venue?{" "}
        <Link href="/signup/venue" className="font-semibold text-lp-accent hover:underline">
          Create a free venue account
        </Link>
      </p>
    </div>
  );
}
