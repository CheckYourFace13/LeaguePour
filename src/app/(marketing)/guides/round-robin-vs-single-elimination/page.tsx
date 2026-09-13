import { safeJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/json-ld-builders";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { absolute: "Round Robin vs. Single Elimination for Bars | LeaguePour Guide" },
  description:
    "Round robin vs single elimination for bar tournaments: which keeps players (and their tabs) in the room longer, how long each takes to run, and how to pick between them.",
  alternates: { canonical: "/guides/round-robin-vs-single-elimination" },
  keywords: [
    "round robin vs single elimination",
    "bar tournament format",
    "single elimination bracket bar",
    "round robin league format",
    "tournament format for bars",
  ],
  openGraph: {
    title: "Round Robin vs. Single Elimination for Bars | LeaguePour Guide",
    description:
      "Which tournament format actually keeps a bar full - round robin or single elimination - and how to choose.",
    url: "/guides/round-robin-vs-single-elimination",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: "Round Robin vs. Single Elimination", path: "/guides/round-robin-vs-single-elimination" },
    ]),
    {
      "@type": "Article",
      headline: "Round Robin vs. Single Elimination: Which Format Is Right for Your Bar",
      description:
        "A practical comparison of round robin and single elimination tournament formats for bars, covering bar time, competitiveness, scheduling, and how to choose.",
      author: { "@type": "Organization", name: "LeaguePour" },
      publisher: {
        "@type": "Organization",
        name: "LeaguePour",
        logo: { "@type": "ImageObject", url: "https://leaguepour.com/logo.png" },
      },
      url: "https://leaguepour.com/guides/round-robin-vs-single-elimination",
      datePublished: "2026-09-13",
      dateModified: "2026-09-13",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Which format keeps people in my bar longer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Round robin, by a wide margin. Every team plays every other team, so nobody is eliminated early - a team that loses its first match is still playing (and drinking) three matches later. Single elimination sends roughly half your field home after round one.",
          },
        },
        {
          "@type": "Question",
          name: "Which format is faster to run in one night?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Single elimination. An 8-team single-elimination bracket needs 7 total matches; an 8-team round robin needs 28. Round robin works best as a multi-week season rather than a single-night event once you're past 6-8 teams.",
          },
        },
        {
          "@type": "Question",
          name: "Can LeaguePour generate both formats automatically?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Select Single elimination or Round robin when you create a competition, and LeaguePour generates the bracket or full schedule automatically once registrations close, with standings updating as scores are entered.",
          },
        },
        {
          "@type": "Question",
          name: "What about double elimination?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Double elimination is a common request for bar cornhole and darts, but it isn't an automatically-generated format in LeaguePour yet. Run it today using the Custom format, where you add each match manually and track the winners/losers brackets yourself.",
          },
        },
      ],
    },
  ],
};

export default function RoundRobinVsSingleEliminationGuide() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">
          <Link href="/guides" className="hover:underline">Guides</Link> / Tournament formats
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Round Robin vs. Single Elimination for Bars
        </h1>
        <p className="mt-5 text-lg text-lp-muted">
          The format you pick decides how long people stay, how competitive the night feels, and how
          much work it is to run. Here&apos;s the real trade-off between the two most common bar
          tournament formats, and how to decide which one fits your night.
        </p>

        <div className="mt-10 space-y-10 text-lp-text leading-relaxed">

          <section>
            <h2 className="font-display text-2xl font-bold">1. The core trade-off: bar time vs. speed</h2>
            <p className="mt-4">
              <strong>Round robin</strong> means every team plays every other team over the course of
              the event or season. Nobody is eliminated. A team that loses its first two matches is
              still on the schedule for the rest of the night - and still ordering drinks. This is
              the format that maximizes time in your venue, which is exactly why it&apos;s the
              standard for recurring weekly leagues.
            </p>
            <p className="mt-4">
              <strong>Single elimination</strong> means one loss and you&apos;re out. It&apos;s the
              classic bracket: 16 teams in, 8 after round one, 4 after round two, and so on to a
              champion. It&apos;s fast and easy for spectators to follow, but it sends roughly half
              your field home after the very first round - which is the opposite of what a bar
              actually wants on a weeknight.
            </p>
            <p className="mt-4">
              Neither format is objectively better - they solve different problems. The question is
              what you&apos;re optimizing for: a full room for as long as possible, or a decisive
              result in one evening.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">2. How long each one actually takes</h2>
            <p className="mt-4">
              Single elimination scales cleanly: an 8-team bracket is 7 total matches, a 16-team
              bracket is 15, a 32-team bracket is 31. Match count grows only slightly faster than team
              count, which is why single elimination is the right choice for a one-night event with a
              real headcount - 16 or 32 teams, done in an evening.
            </p>
            <p className="mt-4">
              Round robin scales much faster: an 8-team round robin is 28 matches (every team plays
              every other team once); a 12-team round robin is 66 matches. Past 6-8 teams, a true
              round robin in a single night stops being realistic - this is why round robin works best
              as a multi-week season (a handful of matches per team per week) rather than a
              one-night tournament for anything beyond a small group.
            </p>
            <p className="mt-4">
              A common middle ground for medium-sized one-night events: run round robin within small
              pools of 4 teams (3 matches per pool), then send the pool winners into a short single-elimination
              bracket for the final rounds. You get round-robin fairness early and single-elimination
              drama at the end, without the full combinatorial explosion of a large round robin.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">3. Which one fits which event</h2>
            <p className="mt-4">
              <strong>Use round robin for:</strong> weekly leagues and seasons where the goal is
              recurring attendance over weeks, not a single decisive night. It&apos;s also the better
              choice for casual or mixed-skill groups, since one bad match doesn&apos;t end anyone&apos;s
              night.
            </p>
            <p className="mt-4">
              <strong>Use single elimination for:</strong> one-night tournaments with a real headcount
              (16-32 teams), championship rounds at the end of a round-robin season, or any event where
              you need a clean winner by closing time. It&apos;s also simply easier to run - the
              bracket tells you exactly who plays whom next, with no standings math required.
            </p>
            <p className="mt-4">
              If you&apos;re not sure, default to round robin for anything you intend to repeat weekly,
              and single elimination for a one-off special event. Most bars end up running both: a
              round-robin season for the regular crowd, and a single-elimination bracket for the
              occasional big one-night tournament.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">4. What LeaguePour automates today</h2>
            <p className="mt-4">
              Single elimination and round robin are both live, automatically-generated formats in
              LeaguePour. Pick the format when you create a competition; once registrations close,
              press Start Tournament and LeaguePour builds the bracket (with byes handled for odd
              team counts) or the full round-robin schedule for you. Standings update automatically as
              scores are entered - no spreadsheet, no manual bracket math.
            </p>
            <p className="mt-4">
              Double elimination - a common ask for competitive darts and cornhole nights, where every
              team gets a second chance in a losers&apos; bracket before elimination - isn&apos;t an
              auto-generated format yet. Run it today with the Custom format, adding each match
              manually and tracking the winners/losers brackets yourself; note the format in your
              event&apos;s house rules so players know what to expect.
            </p>
          </section>

        </div>

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-2xl font-bold">Run either format with LeaguePour</h2>
          <p className="mt-2 text-lp-muted">
            Pick single elimination or round robin when you create your competition and LeaguePour
            builds the bracket or schedule automatically, with standings that update as scores come
            in.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events - free</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/features/tournaments">See tournament features</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold">Frequently asked questions</h2>
          <div className="mt-5 space-y-4">
            {[
              {
                q: "Which format keeps people in my bar longer?",
                a: "Round robin, by a wide margin. Every team plays every other team, so nobody is eliminated early. Single elimination sends roughly half your field home after round one.",
              },
              {
                q: "Which format is faster to run in one night?",
                a: "Single elimination - an 8-team bracket is 7 matches, versus 28 for an 8-team round robin. Round robin works best as a multi-week season past 6-8 teams.",
              },
              {
                q: "Can LeaguePour generate both formats automatically?",
                a: "Yes. Select Single elimination or Round robin when creating a competition, and LeaguePour generates the bracket or schedule automatically, with standings updating as scores are entered.",
              },
              {
                q: "What about double elimination?",
                a: "It isn't auto-generated in LeaguePour yet. Run it today with the Custom format, tracking the winners/losers brackets manually.",
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
          <Link href="/guides/how-standings-and-points-work" className="font-semibold text-lp-accent hover:underline">How standings and points work →</Link>
          <Link href="/features/tournaments" className="font-semibold text-lp-accent hover:underline">Tournament features →</Link>
        </div>
      </div>
    </>
  );
}
