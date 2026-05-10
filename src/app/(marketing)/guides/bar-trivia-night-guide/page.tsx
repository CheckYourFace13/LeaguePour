import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How to Run Trivia Night at Your Bar | LeaguePour Guide",
  description:
    "A complete guide to running trivia night at your bar. Hosting tips, theme ideas, team sizes, scoring systems, prizes, and how to keep a full room of regulars coming back every week.",
  alternates: { canonical: "/guides/bar-trivia-night-guide" },
  keywords: [
    "how to run trivia night at a bar",
    "bar trivia night guide",
    "trivia night hosting tips",
    "bar trivia scoring system",
    "trivia night prizes",
    "trivia night theme ideas",
  ],
  openGraph: {
    title: "How to Run Trivia Night at Your Bar | LeaguePour Guide",
    description:
      "Hosting tips, themes, scoring, prizes, and the secrets to keeping a full room of trivia regulars.",
    url: "/guides/bar-trivia-night-guide",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "How to Run Trivia Night at Your Bar",
      description:
        "A complete guide to hosting trivia nights at bars, covering question formats, scoring, prizes, theme ideas, and strategies for building a loyal weekly following.",
      author: { "@type": "Organization", name: "LeaguePour" },
      publisher: {
        "@type": "Organization",
        name: "LeaguePour",
        logo: { "@type": "ImageObject", url: "https://leaguepour.com/logo.png" },
      },
      url: "https://leaguepour.com/guides/bar-trivia-night-guide",
      datePublished: "2026-05-10",
      dateModified: "2026-05-10",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How many questions should a bar trivia night have?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Most successful bar trivia nights run 5–6 rounds of 8–10 questions each, for a total of 40–60 questions. This takes about 2 hours including scoring breaks, which is the ideal length — long enough to feel complete, short enough that teams don't lose energy toward the end.",
          },
        },
        {
          "@type": "Question",
          name: "What is the best team size for bar trivia?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Teams of 2–6 players hit the sweet spot for bar trivia. Smaller teams create more intense competition. Larger teams (6–10) are more social and work well for casual nights. Setting a maximum of 6 keeps the competition feeling fair and prevents one super-team from dominating every week.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need a trivia host or can I run it myself?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A dedicated host makes a dramatic difference in the energy of the room. If you can't afford a professional trivia company, a charismatic regular or a staff member with a strong personality can host effectively with practice. The host's job is as much entertainment as question-reading — energy, humor, and quick banter with the crowd matter as much as the questions themselves.",
          },
        },
        {
          "@type": "Question",
          name: "What prizes should I offer at trivia night?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Bar tab credits for first and second place are the most effective — the money stays in your venue and winners bring friends to help spend it. A 'last place' prize (often a small consolation like a round of shots) creates a running gag that regulars love and keeps the mood light for teams that aren't winning.",
          },
        },
        {
          "@type": "Question",
          name: "How do I stop teams from cheating at trivia night?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Announce a no-phones policy at the start of each round and have your host call it out humorously if they see someone looking at their phone. Written answer sheets that are collected at the end of each round — before answers are revealed — eliminate the most common cheating method. Most trivia regulars are honest; the cheaters are usually first-timers who don't come back anyway.",
          },
        },
      ],
    },
  ],
};

export default function BarTriviaNightGuide() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">
          <Link href="/guides" className="hover:underline">Guides</Link> / Trivia
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          How to Run Trivia Night at Your Bar
        </h1>
        <p className="mt-5 text-lg text-lp-muted">
          A well-run trivia night is one of the most reliable weekly events in hospitality. Teams
          commit to the same night every week, they bring guests, and they stay for two or three
          hours minimum. Here's how to build a trivia night that becomes the event your regulars
          plan their week around.
        </p>

        <div className="mt-10 space-y-10 text-lp-text leading-relaxed">

          <section>
            <h2 className="font-display text-2xl font-bold">1. Pick your hosting approach</h2>
            <p className="mt-4">
              Your first decision is whether to host yourself, hire a trivia company, or use a
              subscription question service. Each has trade-offs.
            </p>
            <p className="mt-4">
              <strong>Professional trivia companies</strong> provide a host, questions, scoring
              software, and typically a leaderboard display. The best ones bring energy, handle disputes,
              and have years of question writing experience. The cost is usually $150–$350 per night,
              which is easily recovered if you're pulling in 8–12 extra tables. Ask for references and
              watch a night in person before committing.
            </p>
            <p className="mt-4">
              <strong>Subscription question services</strong> provide weekly question sets (usually
              in a structured PDF or digital format) that you or a staff member delivers yourself.
              These cost $30–$80 per month and give you editorial control over the difficulty and
              categories. You need a strong, confident host personality to make this work — the questions
              are secondary to the energy in the room.
            </p>
            <p className="mt-4">
              <strong>In-house hosting</strong> is the most work but the most flexible. You write the
              questions or curate them from free sources, a charismatic staff member or regular hosts,
              and you own the entire relationship with the players. This takes more time to ramp up but
              produces the most loyal regulars because the night feels unique to your bar.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">2. Structure the question format</h2>
            <p className="mt-4">
              The sweet spot for a bar trivia night is 5–6 rounds of 8–10 questions each, running
              about 2 hours total. This is long enough to feel satisfying but short enough that teams
              stay energized all the way to the final score reveal.
            </p>
            <p className="mt-4">
              Vary difficulty within each round — start easy to get teams engaged, build to a hard
              question or two in the middle, and end each round on a memorable question. Teams that
              answer the last question correctly feel like they ended the round strong, which keeps
              morale high even if they're not leading overall.
            </p>
            <p className="mt-4">
              Include a mix of categories: general knowledge, current events, pop culture, science,
              history, sports, and local knowledge. One round of local or regional trivia ("What year
              did this bar open?", "What street is the city's oldest market on?") creates the most
              discussion at tables and is unique to your venue.
            </p>
            <p className="mt-4">
              A visual or audio round (show a movie still, play a song clip, show a logo) adds variety
              and gives different players a chance to shine. These rounds are disproportionately popular
              and are worth the extra setup time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">3. Set team sizes and rules</h2>
            <p className="mt-4">
              Teams of 2–6 players hit the sweet spot for competitive bar trivia. Smaller teams create
              more intense individual competition. Larger teams are more social and work well for casual
              nights. Setting a maximum of 6 prevents one deep group from dominating and discouraging
              the smaller teams that are your weekly regulars.
            </p>
            <p className="mt-4">
              Allow walk-ins and let teams form at the bar if they're short a member or two. Being
              welcoming to incomplete teams and solo players who want to join a group builds community
              and gets you more paid seats.
            </p>
            <p className="mt-4">
              Enforce a no-phone policy during answer writing. Announce it humorously at the start of
              each round — "phones away, brains on" — and have the host call it out lightly if someone
              is obviously searching. Collect answer sheets before revealing answers to eliminate the
              most common cheating method.
            </p>
            <p className="mt-4">
              Charge a small entry fee ($3–$5 per person is standard) to fund the prize pool and create
              commitment. Teams that have paid are more likely to show up and less likely to leave at
              halftime. Collect online before the event if possible — it simplifies cash handling and
              gives you a headcount for seating.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">4. Build an irresistible theme calendar</h2>
            <p className="mt-4">
              A standing weekly trivia night builds a loyal base. Monthly themed nights spike attendance
              and bring in new players who wouldn't come for a regular night.
            </p>
            <p className="mt-4">
              <strong>Decade nights</strong> — "90s Only," "All 80s Trivia" — are perennial favorites.
              The category restriction makes questions feel more curated and lets players who lived through
              that decade feel like experts for one night.
            </p>
            <p className="mt-4">
              <strong>Movie or TV-specific nights</strong> — "The Office Trivia," "Marvel Universe
              Trivia," "Seinfeld Night" — draw superfan groups who plan their attendance around it.
              These are your highest-share posts on social media.
            </p>
            <p className="mt-4">
              <strong>Sports trivia</strong> timed around major events (Super Bowl week, March Madness,
              World Cup) taps into existing hype. Run these as standalone events, not replacements for
              your regular trivia night.
            </p>
            <p className="mt-4">
              <strong>Charity trivia nights</strong> where a portion of the entry fee goes to a local
              cause generate press coverage and motivate people to bring non-regulars. Even a $1 per
              player donation creates a meaningful total that you can announce at the end of the night.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">5. Scoring systems that keep everyone engaged</h2>
            <p className="mt-4">
              Standard scoring — one point per correct answer — is simple and works fine. But a few
              variations dramatically improve engagement.
            </p>
            <p className="mt-4">
              <strong>Wager questions</strong> (also called "all-or-nothing" or "double-or-nothing")
              appear once per round. Teams wager points they've already earned, and a correct answer
              doubles the wager while a wrong answer loses it. These create genuine tension and are
              often the most memorable moment of the night.
            </p>
            <p className="mt-4">
              <strong>Point multipliers</strong> on the hardest question in each round give catching-up
              teams a path back into contention. A question worth 3 points instead of 1 keeps teams that
              are behind still invested.
            </p>
            <p className="mt-4">
              <strong>A running leaderboard</strong> displayed on a TV or announced after each round
              keeps teams tracking their position. The moment a mid-table team realizes they're one
              strong round from first is the moment they order another round of drinks.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">6. Prizes and keeping regulars coming back</h2>
            <p className="mt-4">
              Bar tab credits for first and second place keep prize money in your venue and give winners
              a reason to stay and celebrate. A "last place" consolation prize — a free shot round, a
              small gift card — creates a running joke that regulars love and makes losing feel less bad.
            </p>
            <p className="mt-4">
              Seasonal leaderboards — tracking cumulative points across a month or quarter — give
              regulars a long-term reason to keep coming back each week. A quarterly champion gets
              their name on a plaque or a photo on the wall.
            </p>
            <p className="mt-4">
              Send a post-event email with the scores and a teaser for next week's theme. This is the
              single most effective thing you can do to build weekly attendance — teams want to know
              how they finished relative to everyone else, and the teaser gives them a reason to
              already be looking forward to next week. Collect emails at registration or through
              an online signup tool so you actually have the addresses to send to.
            </p>
          </section>

        </div>

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-2xl font-bold">Run your trivia night with LeaguePour</h2>
          <p className="mt-2 text-lp-muted">
            Online team registration, entry fee collection, and post-event email blasts — all in one
            platform built for bar competitions. Set up your first trivia night in minutes.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/venue">Create your venue — free</Link>
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
                q: "How many questions should a bar trivia night have?",
                a: "Most successful bar trivia nights run 5–6 rounds of 8–10 questions each, for about 40–60 questions total. This takes about 2 hours including scoring breaks — the ideal length for sustained energy and bar spend.",
              },
              {
                q: "What is the best team size for bar trivia?",
                a: "Teams of 2–6 players hit the sweet spot. Setting a maximum of 6 keeps competition fair and prevents one super-team from dominating every week. Allow incomplete teams to recruit at the bar — it builds community.",
              },
              {
                q: "Do I need a trivia host or can I run it myself?",
                a: "A dedicated host makes a dramatic difference. If you can't hire a professional, a charismatic staff member or regular can host effectively. The host's energy, humor, and crowd banter matter as much as the questions themselves.",
              },
              {
                q: "What prizes should I offer at trivia night?",
                a: "Bar tab credits for first and second place are most effective — the prize money stays in your venue. A 'last place' consolation prize creates a running gag regulars love. Quarterly leaderboards give regulars a long-term reason to keep coming back.",
              },
              {
                q: "How do I stop teams from cheating at trivia night?",
                a: "Announce a no-phones policy at the start of each round and collect answer sheets before revealing answers. Most trivia regulars are honest — the cheaters are usually first-timers who don't come back.",
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
          <Link href="/bar-trivia-software" className="font-semibold text-lp-accent hover:underline">Bar trivia software →</Link>
          <Link href="/guides/how-to-collect-entry-fees-at-your-bar" className="font-semibold text-lp-accent hover:underline">How to collect entry fees →</Link>
        </div>
      </div>
    </>
  );
}
