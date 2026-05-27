import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How to Run a Dart League at Your Bar | LeaguePour Guide",
  description:
    "A complete guide to starting and running a dart league at your bar. Covers formats (501, Cricket, round-robin), entry fees, scheduling, promotion, disputes, and building a loyal player base.",
  alternates: { canonical: "/guides/how-to-run-a-dart-league-at-your-bar" },
  keywords: [
    "how to run a dart league at a bar",
    "bar dart league guide",
    "dart league format",
    "starting a dart league",
    "dart league entry fees",
    "dart league promotion",
  ],
  openGraph: {
    title: "How to Run a Dart League at Your Bar | LeaguePour Guide",
    description:
      "Everything you need to start and sustain a dart league — formats, fees, scheduling, and keeping players coming back.",
    url: "/guides/how-to-run-a-dart-league-at-your-bar",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "How to Run a Dart League at Your Bar",
      description:
        "A complete guide to starting and running a dart league at your bar, covering formats, entry fees, scheduling, promotion, and player retention.",
      author: { "@type": "Organization", name: "LeaguePour" },
      publisher: {
        "@type": "Organization",
        name: "LeaguePour",
        logo: { "@type": "ImageObject", url: "https://leaguepour.com/logo.png" },
      },
      url: "https://leaguepour.com/guides/how-to-run-a-dart-league-at-your-bar",
      datePublished: "2026-05-10",
      dateModified: "2026-05-10",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What dart format is best for a bar league?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "501 double-out is the most popular bar dart format because rounds are fast and the finish requires skill. Cricket works well for casual leagues where players of mixed skill levels compete. Round-robin scheduling keeps everyone playing even after early losses and is ideal for building a social atmosphere.",
          },
        },
        {
          "@type": "Question",
          name: "How much should I charge for a dart league entry fee?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Most bar dart leagues charge between $10 and $25 per player per season. Weekly leagues often collect a small nightly fee ($5–$10 per team) rather than a season-long payment. The fee should cover any prize payouts plus a small margin for house prizes like gift cards or bar tabs.",
          },
        },
        {
          "@type": "Question",
          name: "How many teams do I need to start a dart league?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Six to eight teams is a comfortable minimum for a round-robin format. You can start with four teams if you're testing the waters, but fewer than that makes scheduling awkward. Sixteen teams is a good upper limit for a single-night event.",
          },
        },
        {
          "@type": "Question",
          name: "How do I handle disputes in a dart league?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Publish a simple rulebook before the season starts. For common disputes (a dart touching a wire, a score disagreement), designate a league coordinator or bartender as the final call. Write 'house decision is final' into the rules upfront so there's no arguing precedent later.",
          },
        },
        {
          "@type": "Question",
          name: "How do I keep dart league players coming back season after season?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "End-of-season awards (MVP, most improved, best finisher) create a reason to attend. A short break between seasons with a signup reminder email keeps momentum. Some bars offer a small discount on the next season's fee for players who return — a $5 loyalty discount is enough to feel meaningful.",
          },
        },
      ],
    },
  ],
};

export default function DartLeagueGuide() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">
          <Link href="/guides" className="hover:underline">Guides</Link> / Dart leagues
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          How to Run a Dart League at Your Bar
        </h1>
        <p className="mt-5 text-lg text-lp-muted">
          A weekly dart league is one of the most reliable traffic drivers a bar can run. Players
          commit to a night, they bring friends, and they drink while they wait their turn. This guide
          covers everything you need to start, run, and grow a dart league that keeps your regulars
          locked in week after week.
        </p>

        <div className="mt-10 space-y-10 text-lp-text leading-relaxed">

          <section>
            <h2 className="font-display text-2xl font-bold">1. Choose your game format</h2>
            <p className="mt-4">
              The format sets the tone for the entire league, so pick one that matches your crowd before
              you do anything else.
            </p>
            <p className="mt-4">
              <strong>501 double-out</strong> is the standard competitive format. Both players (or teams)
              start at 501 points and take turns subtracting their score. You must finish on exactly zero
              by hitting a double. Rounds are usually short — 10 to 20 minutes — which keeps the bar
              moving and gives spectators something to watch. This is the format to use if you want
              your league to feel serious.
            </p>
            <p className="mt-4">
              <strong>Cricket</strong> opens and closes numbers 15 through 20 and the bullseye. It rewards
              strategy over raw scoring ability, which makes it friendlier for mixed-skill groups. If your
              crowd leans casual, Cricket tends to generate more conversation and laughter than 501.
            </p>
            <p className="mt-4">
              <strong>Round-robin scheduling</strong> is a format structure, not a game type — it means
              every team plays every other team over the course of the season. This is the most social
              format because no one gets eliminated early. Even a team that loses its first three matches
              stays in the bar for the rest of the season, which is exactly what you want.
            </p>
            <p className="mt-4">
              Single elimination brackets are faster to run but create dead nights for teams that lose
              early. Save elimination formats for one-night special events or playoff rounds at the end
              of a round-robin season.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">2. Set up your schedule</h2>
            <p className="mt-4">
              Pick one night per week and commit to it. Tuesday, Wednesday, and Thursday are the best
              nights for leagues because they fill seats on slow nights without competing with
              weekend crowds that already show up on their own.
            </p>
            <p className="mt-4">
              Block off two hours per league night. If you have eight teams in a round-robin, you'll
              run four matches simultaneously (or sequentially depending on your board count), with each
              match taking about 45 minutes for a best-of-three.
            </p>
            <p className="mt-4">
              Start times matter. 7:00 PM is late enough that players can get there after work, but early
              enough that matches finish before the bar gets loud with the late crowd. Post the schedule
              somewhere permanent — your website, a printed bracket on the wall, and a digital copy
              players can check from their phones.
            </p>
            <p className="mt-4">
              Build a forfeit policy into your schedule from day one. A team that doesn't show gets a
              loss. A team that gives 24 hours notice gets a reschedule if there's time. No-call no-shows
              should result in removal from the league after two occurrences — you need to protect the
              experience for teams that do show up.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">3. Set entry fees and prizes</h2>
            <p className="mt-4">
              Entry fees serve two purposes: they fund the prize pool and they create commitment. Teams
              that have paid are far more likely to show up than teams that signed up for free.
            </p>
            <p className="mt-4">
              For a season-long league (8–10 weeks), a fee of $15–$25 per player is standard. Collect
              everything upfront before the first night. Cash creates accounting headaches — someone
              forgets, you forget, a player pays for a teammate who never comes back. Collecting fees
              online through a tool like LeaguePour means the money is there before anyone touches a dart.
            </p>
            <p className="mt-4">
              Split the prize pool roughly 60/30/10 between first, second, and third place. For smaller
              leagues, even just a winner's tab credit ($50–$75 at your bar) is enough to make the
              championship feel meaningful. Trophies and plaques are cheap to print and they live on
              the bar wall as permanent advertising for your league.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">4. Promote the league before it starts</h2>
            <p className="mt-4">
              Your existing customers are your easiest recruit. Post a sign near your dart boards six
              weeks before the start date. Print a simple flyer with the format, night, and a QR code
              linking to the signup page. Mention it to regulars at the bar.
            </p>
            <p className="mt-4">
              Post about it on your bar's social media pages with a shot of the boards and a clear call
              to action. Facebook and Nextdoor both work well for neighborhood bar events — people share
              them with friends who live nearby. A short Instagram video of a dart finish can get surprising
              organic reach.
            </p>
            <p className="mt-4">
              If you want to grow beyond your existing regulars, local dart associations sometimes maintain
              mailing lists of active players looking for leagues. A quick message to the regional
              coordinator can fill spots faster than any social media post.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">5. Handle disputes before they happen</h2>
            <p className="mt-4">
              Write a simple rulebook — one page is enough. Cover the game format, scoring rules, what
              happens if a dart falls out of the board, how to handle a thrown dart that misses the board
              entirely, and who the final authority is in a dispute.
            </p>
            <p className="mt-4">
              Designate a league coordinator. This can be a bartender, a regular who volunteers for the
              role, or yourself. The coordinator's job is to make the call and end the argument — not to
              deliberate for 20 minutes while everyone else waits. "House decision is final" needs to be
              in the rules so there's never a question about whether the call can be appealed.
            </p>
            <p className="mt-4">
              Post the rulebook on your venue's page, print a copy near the boards, and send it to every
              team captain before the first night. A dispute is nearly always the result of one player
              not knowing the rules — prevention is much easier than resolution.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">6. Build a loyal regular player base</h2>
            <p className="mt-4">
              The best dart league advertisement is a full bar of people having a good time. Make the
              experience social: celebrate good finishes, post standings on your TV or near the bar,
              and keep a simple leaderboard visible throughout the season.
            </p>
            <p className="mt-4">
              End-of-season awards matter more than you'd expect. An MVP award, a "most improved" award,
              and a "best finish of the season" award (maybe a framed photo of an incredible checkout)
              cost almost nothing to produce but give players something to shoot for beyond just winning.
            </p>
            <p className="mt-4">
              At the end of each season, email every registered player with details about the next one.
              Re-enrollment is always easier than new recruitment. A small loyalty discount ($5 off for
              returning teams) is often enough to lock in repeat signups before you've even announced
              the next season publicly.
            </p>
            <p className="mt-4">
              Consider running an off-season one-night tournament to bridge the gap between seasons.
              It keeps players connected to your bar and gives you a fresh round of entry fees without
              the full commitment of a multi-week league.
            </p>
          </section>

        </div>

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-2xl font-bold">Run your dart league with LeaguePour</h2>
          <p className="mt-2 text-lp-muted">
            Online signup, Stripe entry fees, standings, and email notifications — everything in one
            place so you can focus on running a great league instead of managing a spreadsheet.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events — free</Link>
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
                q: "What dart format is best for a bar league?",
                a: "501 double-out is the most popular bar format because rounds are fast and the finish requires skill. Cricket is friendlier for mixed-skill groups. Round-robin scheduling keeps everyone playing and socializing even after losses.",
              },
              {
                q: "How much should I charge for a dart league entry fee?",
                a: "Most bar dart leagues charge $10–$25 per player per season. Weekly leagues often collect $5–$10 per team per night. The fee should cover prize payouts plus a small margin for house prizes like gift cards or bar tabs.",
              },
              {
                q: "How many teams do I need to start a dart league?",
                a: "Six to eight teams is a comfortable minimum for a round-robin format. You can start with four teams if testing the waters, but fewer makes scheduling awkward. Sixteen teams is a good upper limit for a single-night event.",
              },
              {
                q: "How do I handle disputes in a dart league?",
                a: "Publish a simple rulebook before the season starts. Designate a coordinator as the final call. Write 'house decision is final' into the rules upfront so there's no arguing precedent later.",
              },
              {
                q: "How do I keep dart league players coming back?",
                a: "End-of-season awards, a short break with a signup reminder email, and a small loyalty discount on the next season's fee are the most reliable retention tools. Off-season one-night tournaments also keep players connected between seasons.",
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
          <Link href="/dart-league-software" className="font-semibold text-lp-accent hover:underline">Dart league software →</Link>
          <Link href="/guides/bar-competition-ideas" className="font-semibold text-lp-accent hover:underline">25 bar competition ideas →</Link>
        </div>
      </div>
    </>
  );
}
