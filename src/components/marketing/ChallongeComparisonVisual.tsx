import { Building2, Megaphone, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

const blocks = [
  {
    icon: Trophy,
    title: "Challonge-style tools organize brackets",
    body: "Challonge is strong for general tournament brackets - seeding, matchups, and progression for all kinds of competitions. If brackets are the whole job, dedicated bracket tools do that well.",
    accent: "border-lp-border bg-white",
  },
  {
    icon: Building2,
    title: "LeaguePour helps venues fill the room",
    body: "LeaguePour is built specifically for bars, breweries, restaurants, taprooms, and local venues running real game nights, not hobby brackets in isolation.",
    accent: "border-lp-accent/30 bg-gradient-to-br from-lp-accent/10 to-white",
  },
  {
    icon: Megaphone,
    title: "Brackets plus the rest of venue night",
    body: "Brackets are important, but venues also need signups, payments, QR codes, discovery, sponsor promotion, and repeat-player marketing - all in one place.",
    accent: "border-lp-accent-2/50 bg-gradient-to-br from-lp-accent-2/25 to-white",
  },
] as const;

export function ChallongeComparisonVisual() {
  return (
    <section className="border-y border-lp-border bg-lp-surface/30" aria-labelledby="challonge-visual-compare">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-18">
        <h2 id="challonge-visual-compare" className="font-display text-2xl font-bold md:text-3xl">
          Two different jobs - both matter
        </h2>
        <p className="mt-3 max-w-3xl text-lp-muted leading-relaxed">
          A fair comparison: Challonge excels at bracket organization. LeaguePour is venue-first software for the full
          game night - signups through repeat visits.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {blocks.map(({ icon: Icon, title, body, accent }) => (
            <Card key={title} className={`p-6 ${accent}`}>
              <Icon className="size-7 text-lp-accent" aria-hidden />
              <h3 className="mt-4 font-display text-lg font-bold text-lp-text">{title}</h3>
              <p className="mt-2 text-sm text-lp-muted leading-relaxed">{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
