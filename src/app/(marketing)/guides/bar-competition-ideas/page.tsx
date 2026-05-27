import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "25 Bar Competition Ideas That Fill Seats | LeaguePour",
  description:
    "25 bar competition ideas across darts, cornhole, trivia, pool, poker, shuffleboard, and more - with notes on what makes each one work and how to get started.",
  alternates: { canonical: "/guides/bar-competition-ideas" },
  keywords: [
    "bar competition ideas",
    "bar event ideas",
    "bar tournament ideas",
    "bar league ideas",
    "bar games for competitions",
    "fun bar event ideas",
  ],
  openGraph: {
    title: "25 Bar Competition Ideas That Fill Seats | LeaguePour",
    description:
      "25 competition formats across darts, cornhole, trivia, pool, poker, shuffleboard, and more.",
    url: "/guides/bar-competition-ideas",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "25 Bar Competition Ideas That Fill Seats",
      description:
        "A comprehensive list of bar competition and event ideas across multiple game formats, with notes on what makes each one work for bar owners.",
      author: { "@type": "Organization", name: "LeaguePour" },
      publisher: {
        "@type": "Organization",
        name: "LeaguePour",
        logo: { "@type": "ImageObject", url: "https://leaguepour.com/logo.png" },
      },
      url: "https://leaguepour.com/guides/bar-competition-ideas",
      datePublished: "2026-05-10",
      dateModified: "2026-05-10",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What bar competition ideas work best for slow weeknights?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Dart leagues, trivia nights, and pool leagues are the most reliable weeknight traffic drivers because they create recurring commitment - teams show up on the same night every week. Cornhole and shuffleboard work better as weekend or seasonal events. Trivia nights in particular consistently fill Tuesday, Wednesday, and Thursday evenings for bars that run them well.",
          },
        },
        {
          "@type": "Question",
          name: "How do I choose the right competition for my bar?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Match the competition to the space and your existing crowd. Dart leagues need boards (obvious) but also enough floor space to not feel cramped during a league night. Cornhole needs a patio or large indoor space. Trivia works almost anywhere with enough seating and a sound system. Start with whatever your regulars already play on their own - you're formalizing something they want to do, not introducing something foreign.",
          },
        },
        {
          "@type": "Question",
          name: "Do bar competitions need to charge entry fees?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Entry fees are strongly recommended for any recurring league or tournament. Teams that have paid upfront show up at dramatically higher rates than teams that haven't committed financially. Entry fees also fund your prize pool, which makes the event feel more competitive and worth attending. Even a small fee ($5–$10 per player) is enough to create commitment without pricing people out.",
          },
        },
      ],
    },
  ],
};

const competitions = [
  {
    n: 1,
    title: "Weekly Dart League (501 or Cricket)",
    category: "Darts",
    body: "The gold standard for bar leagues. A recurring commitment night that fills the same seats every week. 501 double-out for competitive crowds; Cricket for casual groups. Run round-robin for maximum bar time and social atmosphere.",
  },
  {
    n: 2,
    title: "One-Night Dart Tournament",
    category: "Darts",
    body: "A single-night single-elimination bracket for 8–32 players. Fast-paced, high energy, easy to run. Great for special occasions, birthday parties, or a bridge event between league seasons.",
  },
  {
    n: 3,
    title: "Cornhole Doubles League",
    category: "Cornhole",
    body: "Team cornhole, 2v2, running weekly or bi-weekly over a 6–10 week season. Extremely social - the waiting-your-turn time is just as valuable for the bar as the playing time. Best run on a patio in spring and summer.",
  },
  {
    n: 4,
    title: "Cornhole One-Day Bracket Tournament",
    category: "Cornhole",
    body: "A 16-or-32 team double-elimination tournament run over one afternoon or evening. Excellent for charity fundraisers, seasonal kickoff events, or sponsorship-backed events with local business prizes.",
  },
  {
    n: 5,
    title: "Bar Trivia Night",
    category: "Trivia",
    body: "Teams of 2–6 answer questions across 5–6 rounds. The most reliable weeknight seat-filler in the industry. Runs best Tuesday through Thursday. Needs a confident host and a decent sound system.",
  },
  {
    n: 6,
    title: "Themed Trivia Night (Decade, Movie, TV)",
    category: "Trivia",
    body: "A one-off or monthly variation on regular trivia with a specific theme: 90s music, The Office, Marvel, or a local history night. Draws new audiences who share the niche and generates the most social media shares of any bar event.",
  },
  {
    n: 7,
    title: "Bar Pool League (8-ball or 9-ball)",
    category: "Pool",
    body: "Weekly team or singles pool league for bars with at least two tables. 8-ball is more accessible; 9-ball attracts more competitive players. A classic - pool leagues run in bars that have offered nothing else for decades.",
  },
  {
    n: 8,
    title: "Pool Tournament (Single Elimination)",
    category: "Pool",
    body: "A one-night bracket pool tournament. 16 players, single elimination. Quick to run, easy to score. Pairs well with a drink special and works as an offseason event for pool league regulars.",
  },
  {
    n: 9,
    title: "Shuffleboard League",
    category: "Shuffleboard",
    body: "For bars with a shuffleboard table, a weekly doubles league creates a dedicated recurring crowd. Shuffleboard is underused as a league format - the players who love it really love it, and they tell their friends.",
  },
  {
    n: 10,
    title: "Shuffleboard Singles Tournament",
    category: "Shuffleboard",
    body: "A faster format for bars that want to run a competition without the multi-week league commitment. 8–16 players, bracket format, done in one evening. Good entry point if you're not sure whether your crowd will support a full season.",
  },
  {
    n: 11,
    title: "Texas Hold'em Poker Tournament",
    category: "Poker",
    body: "Structured buy-in, tournament-style poker with eliminations. Draws a dedicated, alcohol-consuming crowd that stays for hours. Check your state's gaming regulations before charging real-money entry fees; many bars run 'free' tournaments with prize certificates redeemable at the bar.",
  },
  {
    n: 12,
    title: "Poker League (Weekly Standings)",
    category: "Poker",
    body: "Monthly or quarterly standings tracked across weekly poker nights. Players accumulate points based on finish position. Season champions get a prize and bragging rights. Creates recurring attendance without the full commitment of a season-long event.",
  },
  {
    n: 13,
    title: "Euchre Tournament",
    category: "Cards",
    body: "A Midwest staple. Euchre tournaments are beloved by a passionate, dedicated fanbase. 4-player teams, quick rounds, extremely social. If your bar is in euchre country, this will fill a room faster than almost anything else.",
  },
  {
    n: 14,
    title: "Cribbage League",
    category: "Cards",
    body: "A niche but fiercely loyal audience. Weekly cribbage leagues attract older regulars and veterans who are often the highest-per-visit spenders in your bar. A cribbage board on the wall is all you need to start the conversation.",
  },
  {
    n: 15,
    title: "Music Bingo Night",
    category: "Music",
    body: "Standard bingo but with song clips instead of numbers. A host plays 15–30 seconds of a song; players mark their card if they recognize it. Extremely popular with groups in their 30s–50s. Easy to theme by decade or genre.",
  },
  {
    n: 16,
    title: "Karaoke Competition",
    category: "Music",
    body: "A judged karaoke tournament where the crowd votes on the best performance each round. Works best as a monthly special event rather than a weekly league. High energy, very social, and generates the most organic video content of any bar event.",
  },
  {
    n: 17,
    title: "Spikeball Tournament",
    category: "Outdoor",
    body: "If you have outdoor space, Spikeball (roundnet) draws a younger crowd and creates a festival atmosphere. 2v2 teams, quick rounds, doubles as a watch-while-you-drink spectator event. Best in spring and early summer.",
  },
  {
    n: 18,
    title: "Bocce League",
    category: "Outdoor",
    body: "For bars with a bocce court or outdoor space, a summer bocce league is a relaxed, social format that pairs naturally with afternoon drink specials. Popular with groups that want to compete without intense physical effort.",
  },
  {
    n: 19,
    title: "Pong Tournament (Beer Pong or Ping Pong)",
    category: "Table Games",
    body: "Ping pong tournaments work for bars with tables and draw a competitive, younger demographic. Beer pong in a structured bracket format (non-alcoholic option available for inclusivity) is a reliable Friday or Saturday night event.",
  },
  {
    n: 20,
    title: "Foosball Tournament",
    category: "Table Games",
    body: "If you have a foosball table, a singles or doubles tournament runs in 2–3 hours and requires almost no logistics. A bracket drawn on a chalkboard and a small prize is all you need. Good as a spontaneous 'flash event' that you announce same-week.",
  },
  {
    n: 21,
    title: "Axe Throwing League",
    category: "Specialty",
    body: "If you have an axe throwing venue nearby or space to partner with a mobile axe operator, a league format draws a unique crowd that doesn't overlap with your typical bar demographic. Entry fees and spectator interest are both high.",
  },
  {
    n: 22,
    title: "Trivia + Darts Double-Feature Night",
    category: "Hybrid",
    body: "Two events, one night: trivia first (7–9 PM), then open dart competition after (9–11 PM). Keeps the same crowd for an extended evening and rewards players who come early with both competitions. Bonus bar spend per head.",
  },
  {
    n: 23,
    title: "Bar Olympics Night",
    category: "Hybrid",
    body: "Teams cycle through 4–6 short bar game stations (darts, cornhole, pool, trivia, flip cup) and accumulate points across all events. The winning team takes all at the end of the night. Works as a monthly or quarterly special event.",
  },
  {
    n: 24,
    title: "Charity Fundraiser Tournament",
    category: "Fundraiser",
    body: "Any game format with a portion of entry fees going to a local charity. Motivates signups from people who want to support the cause, generates press coverage, and creates social media content that non-regulars are happy to share.",
  },
  {
    n: 25,
    title: "Fantasy Sports Draft Night",
    category: "Sports",
    body: "Host the draft party for a local fantasy sports league at your bar - provide the space, screens, and draft-night specials. Regulars bring their entire fantasy league, some of whom are new to your bar. Works for football, basketball, baseball, and golf.",
  },
];

const categoryColors: Record<string, string> = {
  Darts: "bg-blue-500/15 text-blue-400",
  Cornhole: "bg-green-500/15 text-green-400",
  Trivia: "bg-purple-500/15 text-purple-400",
  Pool: "bg-orange-500/15 text-orange-400",
  Shuffleboard: "bg-teal-500/15 text-teal-400",
  Poker: "bg-red-500/15 text-red-400",
  Cards: "bg-yellow-500/15 text-yellow-500",
  Music: "bg-pink-500/15 text-pink-400",
  Outdoor: "bg-lime-500/15 text-lime-400",
  "Table Games": "bg-cyan-500/15 text-cyan-400",
  Specialty: "bg-violet-500/15 text-violet-400",
  Hybrid: "bg-amber-500/15 text-amber-400",
  Fundraiser: "bg-rose-500/15 text-rose-400",
  Sports: "bg-sky-500/15 text-sky-400",
};

export default function BarCompetitionIdeas() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">
          <Link href="/guides" className="hover:underline">Guides</Link> / Ideas
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          25 Bar Competition Ideas<br />
          <span className="text-lp-accent">That Fill Seats</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          The right competition format can turn a slow Tuesday into your busiest night of the week.
          Here are 25 proven bar competition ideas across every format - with notes on what makes
          each one work, who it draws, and when to run it.
        </p>

        <div className="mt-12 space-y-4">
          {competitions.map((c) => (
            <div key={c.n} className="rounded-xl border border-lp-border bg-lp-surface/40 p-5">
              <div className="flex items-start gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lp-accent/20 text-sm font-bold text-lp-accent">
                  {c.n}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-lp-text">{c.title}</h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColors[c.category] ?? "bg-lp-accent/15 text-lp-accent"}`}>
                      {c.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-lp-muted">{c.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to run your first competition?</h2>
          <p className="mt-2 text-lp-muted">
            LeaguePour handles online signup, entry fees, standings, and player communications for
            any of these formats - so you can focus on the event itself.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events - free</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold">Frequently asked questions</h2>
          <div className="mt-5 space-y-4">
            {[
              {
                q: "What bar competition ideas work best for slow weeknights?",
                a: "Dart leagues, trivia nights, and pool leagues are the most reliable weeknight traffic drivers because they create recurring commitment. Trivia nights in particular consistently fill Tuesday through Thursday evenings for bars that run them well.",
              },
              {
                q: "How do I choose the right competition for my bar?",
                a: "Match the competition to your space and existing crowd. Start with whatever your regulars already play on their own - you're formalizing something they want to do, not introducing something foreign. Trivia works almost anywhere with enough seating; cornhole needs outdoor space; darts needs boards.",
              },
              {
                q: "Do bar competitions need to charge entry fees?",
                a: "Entry fees are strongly recommended for any recurring league or tournament. Teams that have paid upfront show up at dramatically higher rates. Even a small fee ($5–$10 per player) creates commitment without pricing people out.",
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
          <Link href="/guides/how-to-run-a-dart-league-at-your-bar" className="font-semibold text-lp-accent hover:underline">How to run a dart league →</Link>
          <Link href="/guides/cornhole-tournament-ideas-for-bars" className="font-semibold text-lp-accent hover:underline">Cornhole tournament ideas →</Link>
        </div>
      </div>
    </>
  );
}
