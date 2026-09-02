import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildBreadcrumbJsonLd, safeJsonLd } from "@/lib/seo/json-ld-builders";

export const metadata: Metadata = {
  title: { absolute: "How to Increase Bar Traffic on Slow Nights | LeaguePour" },
  description:
    "A practical guide to filling slow weeknights at your bar with a recurring anchor event - why one-off promotions don't stick, how to pick a format, and how to build it into a habit.",
  alternates: { canonical: "/guides/how-to-increase-bar-traffic-on-slow-nights" },
  keywords: [
    "how to increase bar traffic",
    "slow night bar promotion",
    "bar weeknight traffic",
    "fill slow bar nights",
    "bar promotion ideas",
    "weekday bar traffic",
  ],
  openGraph: {
    title: "How to Increase Bar Traffic on Slow Nights | LeaguePour",
    description:
      "Why recurring anchor events outperform one-off promotions, and how to build a slow night into a full one.",
    url: "/guides/how-to-increase-bar-traffic-on-slow-nights",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: "How to Increase Bar Traffic on Slow Nights", path: "/guides/how-to-increase-bar-traffic-on-slow-nights" },
    ]),
    {
      "@type": "Article",
      headline: "How to Increase Bar Traffic on Slow Nights",
      description:
        "A practical guide to filling slow weeknights at a bar with a recurring anchor event instead of scattered one-off promotions.",
      author: { "@type": "Organization", name: "LeaguePour" },
      publisher: {
        "@type": "Organization",
        name: "LeaguePour",
        logo: { "@type": "ImageObject", url: "https://leaguepour.com/logo.png" },
      },
      url: "https://leaguepour.com/guides/how-to-increase-bar-traffic-on-slow-nights",
      datePublished: "2026-08-19",
      dateModified: "2026-08-19",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Why don't one-off drink specials fix a slow night?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A drink special gives someone a reason to come in once, but nothing to come back for specifically. Customers who show up for a discount tend to be price-driven and don't build loyalty to your bar over a competitor's. A recurring event gives people a standing reason to return to the same place on the same night, which is what actually builds a regular crowd.",
          },
        },
        {
          "@type": "Question",
          name: "How long should I run a new weeknight event before judging it?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Give a new recurring event at least 6-8 weeks before deciding whether it's working. The first two or three weeks are almost always the smallest - it takes time for word to spread and for players to build a habit around a specific night. Judging attendance after one or two weeks usually leads to killing something that would have worked.",
          },
        },
        {
          "@type": "Question",
          name: "What's the easiest recurring event to start with?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Trivia night and a dart or cornhole league are the two easiest starting points for most bars. Trivia only requires a host, questions, and a sound system - no special equipment. A dart or cornhole league works if you already have a board or boards and just need to formalize a schedule and entry fee structure.",
          },
        },
      ],
    },
  ],
};

export default function IncreaseBarTrafficGuide() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">
          <Link href="/guides" className="hover:underline">Guides</Link> / Operations
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          How to Increase Bar Traffic on Slow Nights
        </h1>
        <p className="mt-5 text-lg text-lp-muted">
          Every bar has a night that doesn't work as hard as the rest of the week. The fix usually
          isn't a bigger discount - it's giving people a specific, recurring reason to be there on
          that specific night. Here's how to build one.
        </p>

        <div className="mt-10 space-y-10 text-lp-text leading-relaxed">

          <section>
            <h2 className="font-display text-2xl font-bold">1. Why scattered promotions don't fix a slow night</h2>
            <p className="mt-4">
              The instinct when a night is slow is to discount something - half-off apps, a drink
              special, happy hour extended an extra two hours. These can nudge a single night's
              numbers, but they rarely fix a pattern, because they don't give anyone a reason to plan
              around your bar specifically. A discount competes on price; a great discount down the
              street beats yours next week.
            </p>
            <p className="mt-4">
              What actually changes a slow night into a busy one is habit. If someone has a standing
              plan - "Tuesday is trivia at our bar" - that's a commitment that survives a slightly
              better happy hour elsewhere. Recurring competitions and league nights are the most
              reliable way to build that habit because they create a specific appointment, a team or
              social group to show up with, and a reason to keep coming back (standings, a season, a
              rivalry with another team).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">2. Pick one anchor night, not five small promotions</h2>
            <p className="mt-4">
              It's tempting to try something different every night of the week, but that spreads your
              promotional effort thin and gives nobody a single night to build a habit around. Pick
              your worst night - often a Tuesday or Wednesday - and commit to one strong recurring
              event on that night specifically. Get that one night working before you try to fix a
              second one.
            </p>
            <p className="mt-4">
              Matching the format to your space and existing crowd matters more than picking the
              "best" idea in the abstract. A patio with room to spread out supports cornhole. A quiet
              back room with good acoustics supports trivia. A bar that already has dart boards or
              pool tables sitting mostly unused on a Tuesday has a built-in head start - formalize what
              your regulars are already doing casually. See our{" "}
              <Link href="/guides/bar-competition-ideas" className="text-lp-accent hover:underline">
                full list of bar competition ideas
              </Link>{" "}
              for more format options.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">3. Make it easy to join and hard to forget</h2>
            <p className="mt-4">
              Lower the friction to show up the first time. Online signup that takes under two minutes
              beats a paper sign-up sheet that only regulars who happen to be standing at the bar ever
              see. A QR code on tables, at the door, and in your social posts lets anyone who hears
              about the event register from their phone without asking a bartender for a pen.
            </p>
            <p className="mt-4">
              After someone signs up once, the goal is to make them impossible to forget about. A
              confirmation email or text with the date and time, plus a reminder the day before,
              dramatically cuts no-shows compared to relying on people to remember on their own.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">4. Give people a reason to keep coming back, not just once</h2>
            <p className="mt-4">
              A single fun night is nice; a season is what actually fixes a slow Tuesday for good.
              Running your event as a multi-week league or season with tracked standings gives players
              a reason to return week after week to defend their spot, not just to try something new
              once. Even a lightweight 6-8 week season with a simple prize for the top finishers is
              enough to create that pull.
            </p>
            <p className="mt-4">
              Entry fees, handled the right way, reinforce this same commitment - a team that's paid
              to be in a season shows up at a much higher rate than a free drop-in event. See our
              guide on{" "}
              <Link href="/guides/how-to-collect-entry-fees-at-your-bar" className="text-lp-accent hover:underline">
                collecting entry fees the right way
              </Link>{" "}
              if you're setting this up for the first time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">5. Be consistent before you judge results</h2>
            <p className="mt-4">
              The most common mistake is killing a new recurring night too early. The first two or
              three weeks of any new event are almost always the smallest - word of mouth takes time,
              and players need to build a habit around a specific night before they'll prioritize it
              over other plans. Commit to running it the same night, same time, for at least 6-8 weeks
              before deciding whether it's working.
            </p>
            <p className="mt-4">
              Keep the format identical from week to week during that trial period. Changing the game,
              the time, or the rules every week makes it impossible for anyone to build the habit
              you're trying to create.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">6. Track what's actually working</h2>
            <p className="mt-4">
              You don't need complicated analytics to know if a slow night is turning around - track
              headcount and how many players are repeat attendees week over week. A night where the
              same 20 people show up every week and slowly grows by word of mouth is working, even if
              the total number isn't huge yet. A night where you get 30 new people once and never see
              them again isn't building the habit you need.
            </p>
          </section>

        </div>

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-2xl font-bold">Build your recurring night with LeaguePour</h2>
          <p className="mt-2 text-lp-muted">
            Online signup, QR codes, entry fees, standings, and player reminders for dart leagues,
            trivia nights, cornhole tournaments, and more - the tools to turn a slow night into a
            standing weekly habit.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events - free</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/for-venues">See how it works for venues</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold">Frequently asked questions</h2>
          <div className="mt-5 space-y-4">
            {[
              {
                q: "Why don't one-off drink specials fix a slow night?",
                a: "A discount gives someone a reason to visit once but nothing specific to come back for. A recurring event gives people a standing reason to return to your bar on the same night, which is what actually builds a regular crowd.",
              },
              {
                q: "How long should I run a new weeknight event before judging it?",
                a: "At least 6-8 weeks. The first two or three weeks are almost always the smallest as word spreads and players build a habit - judging too early usually kills something that would have worked.",
              },
              {
                q: "What's the easiest recurring event to start with?",
                a: "Trivia night and a dart or cornhole league are the easiest starting points. Trivia only needs a host and a sound system; a dart or cornhole league works well if you already have the boards and just need a schedule and entry fee structure.",
              },
            ].map((f) => (
              <details key={f.q} className="rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold text-lp-text [&::-webkit-details-marker]:hidden">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm text-lp-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/guides" className="font-semibold text-lp-accent hover:underline">← All guides</Link>
          <Link href="/for-venues" className="font-semibold text-lp-accent hover:underline">For venues →</Link>
          <Link href="/guides/bar-competition-ideas" className="font-semibold text-lp-accent hover:underline">25 bar competition ideas →</Link>
        </div>
      </div>
    </>
  );
}
