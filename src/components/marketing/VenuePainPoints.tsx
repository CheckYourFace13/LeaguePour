import { Card } from "@/components/ui/card";

const painPointCards = [
  {
    title: "No more paper signup sheets",
    body: "Players register from their phone, and staff can see who is confirmed and who has paid.",
  },
  {
    title: "Less chasing payments",
    body: "Collect entry fees online with Stripe instead of handling cash, Venmo screenshots, or last-minute no-shows.",
  },
  {
    title: "More reasons to come back",
    body: "Use standings, event pages, QR codes, and campaigns to turn one game night into the next one.",
  },
  {
    title: "Promote the whole night",
    body: "Highlight prizes, sponsors, food specials, drink specials, and upcoming leagues around the competition.",
  },
] as const;

export function VenuePainPoints() {
  return (
    <section className="border-y border-lp-border bg-lp-surface/30" aria-labelledby="venue-pain-points">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <h2 id="venue-pain-points" className="font-display text-3xl font-bold md:text-4xl">
          Built around the problems venues already have
        </h2>
        <p className="mt-3 max-w-2xl text-lp-muted leading-relaxed">
          The everyday headaches of running league and tournament nights at a bar, brewery, or taproom - and
          what LeaguePour does about each.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {painPointCards.map((card) => (
            <Card key={card.title} className="p-6">
              <h3 className="font-display text-lg font-bold text-lp-text">{card.title}</h3>
              <p className="mt-2 text-sm text-lp-muted leading-relaxed">{card.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/** @deprecated Use VenuePainPoints */
export const VenuePainPointsSection = VenuePainPoints;
