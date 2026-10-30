import Link from "next/link";
import { Button } from "@/components/ui/button";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import { toolMetadata } from "@/components/marketing/tools/tool-page";

export const metadata = toolMetadata({
  path: "/tools",
  title: "Free Bracket & Standings Tools for Bar Leagues | LeaguePour",
  ogTitle: "Free bracket, round robin, and standings tools",
  description:
    "Free tools for bar leagues and tournaments: a single elimination bracket generator, a round robin schedule generator, and a standings calculator. No signup, printable.",
});

const tools = [
  {
    href: "/tools/single-elimination-bracket-generator",
    title: "Single elimination bracket generator",
    body: "Paste 2 to 64 teams and get the full bracket, with byes placed automatically and every later round mapped out.",
    best: "One-night tournaments",
  },
  {
    href: "/tools/round-robin-schedule-generator",
    title: "Round robin schedule generator",
    body: "Everyone plays everyone once. Get every round and matchup, with a rotating night off when the count is odd.",
    best: "Weekly leagues",
  },
  {
    href: "/tools/standings-calculator",
    title: "Standings calculator",
    body: "Enter scores and get a ranked table: wins, losses, ties, score difference, and points (3 for a win, 1 for a tie).",
    best: "Checking the table",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "LeaguePour", item: "https://leaguepour.com" },
        { "@type": "ListItem", position: 2, name: "Free tools", item: "https://leaguepour.com/tools" },
      ],
    },
    {
      "@type": "ItemList",
      name: "Free LeaguePour tools",
      itemListElement: tools.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.title, url: `https://leaguepour.com${t.href}` })),
    },
  ],
};

export default function LpToolsPage() {
  return (
    <div className="lp-section mx-auto max-w-5xl px-4 md:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <p className="lp-kicker">Free tools · no signup</p>
      <h1 className="lp-page-title mt-2 text-4xl md:text-5xl">Free bracket and league tools</h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-lp-text-soft">
        Build a bracket, schedule a league, or work out the standings in your browser. They use the
        same rules LeaguePour runs live, they print cleanly, and they don&apos;t save or send anything.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.href} href={t.href} className="group flex flex-col rounded-2xl border border-lp-border bg-lp-surface/50 p-6 transition-colors hover:border-lp-accent">
            <p className="lp-kicker">{t.best}</p>
            <h2 className="mt-2 font-display text-xl font-bold text-lp-text group-hover:text-lp-accent">{t.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-lp-text-soft">{t.body}</p>
            <span className="mt-4 text-sm font-semibold text-lp-accent">Open the tool →</span>
          </Link>
        ))}
      </div>

      <div className="mt-14 max-w-3xl">
        <h2 className="font-display text-2xl font-bold text-lp-text">Which format should you use?</h2>
        <p className="mt-3 leading-relaxed text-lp-text-soft">
          A <strong className="text-lp-text">single elimination bracket</strong> needs the fewest matches -
          one fewer than the number of entrants - so it fits a big field into one night. A{" "}
          <strong className="text-lp-text">round robin</strong> gives everyone the same number of games and
          suits a weekly league, but the match count grows quickly: 8 teams is 28 matches. Our guide to{" "}
          <Link href="/guides/round-robin-vs-single-elimination" className="font-semibold text-lp-accent hover:underline">round robin vs. single elimination</Link>{" "}
          walks through the choice.
        </p>
      </div>

      <div className="mt-12 rounded-2xl border-2 border-lp-accent/30 bg-lp-surface/60 p-7">
        <p className="font-display text-xl font-bold text-lp-text">Run it live with LeaguePour</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-lp-text-soft">
          These tools are calculators - nothing is saved. LeaguePour runs the real thing: QR code
          signup, entry fees, brackets and schedules generated from actual registrations, staff score
          entry, and standings on a public page.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/signup/venue">Set up your venue</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
