// leaguepour.com/llms.txt - a concise, factual summary for LLM-based crawlers and assistants.
// Keep it in sync with src/lib/content-engine/facts.ts; never list a feature or format here that
// isn't live today. (venuesprocket.com/llms.txt is served by src/app/venuesprocket/llms.txt.)
const BODY = `# LeaguePour

> LeaguePour is software for bars and venues to run recurring competitions and game nights - trivia, darts, cornhole, pool, euchre, poker (where legal), shuffleboard, and music bingo - with online player signup, Stripe entry fees, schedules, scores, and standings.

Key facts:
- Live formats: Single elimination and Round robin (brackets/schedules generated automatically), plus Custom for running any other format manually. Double elimination, Swiss, ladder, season/points races, and pool play are not automated today.
- Players register from their phone through a public competition page or QR code - solo, captain-led team, or roster invite. No app download.
- Entry fees are collected with Stripe Checkout through Stripe Connect and paid out to the venue's own bank account, minus a platform fee. Free ($0) events are supported.
- Staff enter scores from the venue dashboard; standings (3 points win / 1 tie / 0 loss) update automatically, with a fullscreen scoreboard view for a bar TV.
- Email campaigns to a venue's opted-in player audience. SMS sending is not available.
- Plans differ by the number of concurrently active competitions; staff accounts are unlimited. See https://leaguepour.com/pricing.

Related product:
- VenueSprocket (https://venuesprocket.com) is a separate companion product, with its own subscription, for private event management (inquiries, proposals, contracts, deposits, BEOs). An active subscriber to either product gets 50% off the other.

## Product
- [How it works](https://leaguepour.com/how-it-works)
- [Features](https://leaguepour.com/features)
- [Pricing](https://leaguepour.com/pricing)
- [FAQ](https://leaguepour.com/faq)
- [For venues](https://leaguepour.com/for-venues)
- [For players](https://leaguepour.com/for-players)

## Guides
- [Guides](https://leaguepour.com/guides): running leagues, tournaments, and game nights at a bar
- [How to run a dart league at your bar](https://leaguepour.com/guides/how-to-run-a-dart-league-at-your-bar)
- [Round robin vs. single elimination](https://leaguepour.com/guides/round-robin-vs-single-elimination)
- [How standings and points work](https://leaguepour.com/guides/how-standings-and-points-work)

## Company
- [About](https://leaguepour.com/about)
- [Contact](https://leaguepour.com/contact)
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
