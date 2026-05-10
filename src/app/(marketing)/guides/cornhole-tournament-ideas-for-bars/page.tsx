import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cornhole Tournament Ideas for Bars | LeaguePour Guide",
  description:
    "Cornhole tournament ideas for bars: bracket formats, team sizes, prize structures, sponsorship, seasonal themes, and promotion tips that actually fill your patio.",
  alternates: { canonical: "/guides/cornhole-tournament-ideas-for-bars" },
  keywords: [
    "cornhole tournament ideas for bars",
    "bar cornhole tournament",
    "cornhole bracket format",
    "cornhole tournament prizes",
    "how to run a cornhole tournament",
    "bar cornhole league",
  ],
  openGraph: {
    title: "Cornhole Tournament Ideas for Bars | LeaguePour Guide",
    description:
      "Bracket formats, prize ideas, seasonal themes, and promotion tips for bar cornhole tournaments.",
    url: "/guides/cornhole-tournament-ideas-for-bars",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Cornhole Tournament Ideas for Bars",
      description:
        "A practical guide to running cornhole tournaments and leagues at bars, covering formats, prizes, sponsorship, seasonal themes, and promotion strategies.",
      author: { "@type": "Organization", name: "LeaguePour" },
      publisher: {
        "@type": "Organization",
        name: "LeaguePour",
        logo: { "@type": "ImageObject", url: "https://leaguepour.com/logo.png" },
      },
      url: "https://leaguepour.com/guides/cornhole-tournament-ideas-for-bars",
      datePublished: "2026-05-10",
      dateModified: "2026-05-10",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the best cornhole format for a bar tournament?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Double-elimination is the most popular format for bar cornhole tournaments. It gives every team a second chance before elimination, which keeps people around longer and drinking more. Single elimination works for smaller events (8 teams or fewer) where speed matters. Round-robin is best for weekly leagues where social atmosphere beats competition stakes.",
          },
        },
        {
          "@type": "Question",
          name: "How many boards do I need to run a cornhole tournament?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Plan for one pair of boards per four teams in the bracket. If you're running 16 teams, four board pairs let you run four matches at once. Most bars with a patio can fit two to four board pairs comfortably. Always have at least one backup board in case of damage during the event.",
          },
        },
        {
          "@type": "Question",
          name: "What prizes work best for a bar cornhole tournament?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Bar tab credits are the most popular prize because the money stays in your venue. Cash prizes work for larger buy-in events. Gift cards, custom cornhole bags for the winning team, or a season trophy are strong options. Sponsor prizes from local businesses add perceived value at no cost to you.",
          },
        },
        {
          "@type": "Question",
          name: "How long does a 16-team cornhole tournament take?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A 16-team single-elimination tournament takes about 3 hours with two board pairs. Double-elimination takes 4–5 hours. Running multiple boards simultaneously cuts time significantly. Block 30 minutes before start time for check-in and bracket seeding.",
          },
        },
      ],
    },
  ],
};

export default function CornholeTournamentIdeas() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">
          <Link href="/guides" className="hover:underline">Guides</Link> / Cornhole
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Cornhole Tournament Ideas for Bars
        </h1>
        <p className="mt-5 text-lg text-lp-muted">
          Cornhole is the perfect bar event: it's simple enough that anyone can play, competitive
          enough that it draws a crowd, and social enough that teams stick around for hours. Here's
          how to run a cornhole tournament or league that fills your patio and has players booking
          their spot for next time before they leave.
        </p>

        <div className="mt-10 space-y-10 text-lp-text leading-relaxed">

          <section>
            <h2 className="font-display text-2xl font-bold">1. Choosing the right bracket format</h2>
            <p className="mt-4">
              The format you choose determines how long people stay and how intense the competition feels.
            </p>
            <p className="mt-4">
              <strong>Double elimination</strong> is the gold standard for bar tournaments. Every team
              gets at least two games before they're out — which means a 7:00 PM arrival doesn't turn
              into a 7:45 PM departure after a first-round loss. Teams that lose early drop to the loser's
              bracket, and the whole event creates more matches, more play time, and more bar spend per
              team. If you only run one format, make it double-elimination.
            </p>
            <p className="mt-4">
              <strong>Single elimination</strong> is faster and easier to manage. Good for smaller events
              (8 teams or fewer) or for championship rounds at the end of a season. The downside is that
              losing teams leave early, which takes paying customers out of your venue.
            </p>
            <p className="mt-4">
              <strong>Round-robin leagues</strong> work best for recurring weekly events. Every team plays
              every other team over the course of a season. No one gets eliminated, which creates a
              consistently full venue each night. This is the format to use if you want to build a
              regular cornhole league rather than a one-time event.
            </p>
            <p className="mt-4">
              <strong>Pool play into bracket</strong> is a hybrid that works well for 12–24 team events.
              Teams are split into groups of 4 and play within their group first, then the top teams from
              each group advance to a single-elimination bracket. This format is logistically more complex
              but creates very exciting late-round matches.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">2. Team sizes and formats</h2>
            <p className="mt-4">
              Most bar cornhole tournaments run 2v2 (doubles), which is the standard format. Two players
              per team, one at each end of the boards. This keeps team sign-up simple and courts small
              enough to fit more games at once.
            </p>
            <p className="mt-4">
              <strong>Singles</strong> tournaments attract more competitive players but draw a smaller
              crowd. Good for a specialty event or a monthly "champion's bracket" to give serious players
              a place to compete.
            </p>
            <p className="mt-4">
              <strong>4v4 team formats</strong> are increasingly popular and create a party atmosphere.
              Each player throws in rotation, which gives spectators more to watch and creates natural
              team bonding moments. Harder to run logistically but excellent for fundraiser events or
              corporate group nights.
            </p>
            <p className="mt-4">
              Cap your team count based on available boards and time. A comfortable maximum with two
              board pairs is 16 teams for a double-elimination bracket finishing in one evening. With
              four board pairs, you can run 32 teams comfortably.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">3. Prize ideas that keep money at your bar</h2>
            <p className="mt-4">
              The best prizes for bar events are prizes that encourage more spending at your venue.
            </p>
            <p className="mt-4">
              <strong>Bar tab credits</strong> are the most effective prize. A $100 bar tab for the
              winning team costs you less than $100 in revenue (since you're not paying wholesale cost
              plus labor for $100 of prizes), and the prize money stays in your bar. Players who win
              a tab bring friends to help them spend it.
            </p>
            <p className="mt-4">
              <strong>Custom cornhole bags</strong> engraved or embroidered with your bar's name are
              a walking advertisement every time the winning team plays. These cost $30–$60 per set and
              are memorable enough that players talk about them.
            </p>
            <p className="mt-4">
              <strong>Season trophies</strong> that live on your bar wall create permanent recognition.
              A plaque with each season champion's team name builds a historical record that regulars
              actually read. The cost is minimal; the engagement is ongoing.
            </p>
            <p className="mt-4">
              <strong>Local sponsor prizes</strong> — gift cards to nearby restaurants, free rounds at
              a neighboring bar, sporting goods store credits — add perceived value at no cost to you.
              Local sponsors often participate in exchange for a mention at the event and a tag on your
              social media post.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">4. Seasonal themes and special events</h2>
            <p className="mt-4">
              A themed cornhole tournament gives people a reason to invite friends who might not show
              up for a regular league night. Themes create social media content, encourage costume
              participation, and make the event feel like a destination.
            </p>
            <p className="mt-4">
              <strong>Summer kickoff tournament</strong> — held in late May or early June when patio
              season starts. Double-down by offering a summer league series immediately after, while
              players are energized and already signed up.
            </p>
            <p className="mt-4">
              <strong>Charity fundraiser format</strong> — a portion of entry fees goes to a local
              charity. This motivates signups from people who want to support the cause and gives you
              press-worthy content for local media and community boards.
            </p>
            <p className="mt-4">
              <strong>College rivalry weekend</strong> — if your area has competing college fan bases,
              a rivalry weekend event with teams representing different schools can generate serious
              buzz. Custom boards in school colors are a nice touch.
            </p>
            <p className="mt-4">
              <strong>Holiday throwdown</strong> — a December holiday tournament with ugly sweater
              rules, festive drinks specials, and a themed prize (a cornhole set, a stocking full of
              bar swag) draws people who wouldn't normally sign up for a league.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">5. Sponsorship and partnerships</h2>
            <p className="mt-4">
              Local sponsors can fund your prize pool, cover the cost of custom boards, and even pay
              for branded event promotion — in exchange for visibility at your event.
            </p>
            <p className="mt-4">
              Approach local businesses that share your demographic: sporting goods stores, beer
              distributors, food delivery services, and fitness gyms are natural fits. Offer a sponsor
              package that includes: logo on the event flyer, a mention at the event, a table or banner
              at the venue, and a tag in your social media posts.
            </p>
            <p className="mt-4">
              Beer brand sponsorships are particularly natural for bar cornhole events. A regional
              craft brewery may provide kegs at cost, branded cups, or signage in exchange for being
              the "official beer" of your league. Reach out to your distributor rep first — they often
              have cooperative marketing budgets for exactly this purpose.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">6. Promotion tips that actually work</h2>
            <p className="mt-4">
              Start promoting at least three weeks before the event. Post your event details across
              all social channels with clear registration information and a deadline. Use a signup link
              (not just "DM us") — friction in the registration process costs you teams.
            </p>
            <p className="mt-4">
              Physical signage still converts. A banner near your patio entrance, a table card at the
              bar, and a chalk sign on the sidewalk reach people who never see your social posts.
            </p>
            <p className="mt-4">
              If you're running an ongoing league, the easiest new-season promotion is an email to
              everyone who signed up for the previous season. People who've already played once are
              four to five times more likely to register again than cold contacts.
            </p>
            <p className="mt-4">
              Highlight a moment from your last event when promoting the next one. A photo of the
              winning team with the trophy, a video of a game-winning bag slide into the hole — these
              perform dramatically better on social media than text-only announcements.
            </p>
          </section>

        </div>

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-2xl font-bold">Manage your cornhole tournament with LeaguePour</h2>
          <p className="mt-2 text-lp-muted">
            Online team signup, entry fees collected automatically, bracket management, and player
            notifications — all in one place so you focus on the event, not the spreadsheet.
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
                q: "What is the best cornhole format for a bar tournament?",
                a: "Double-elimination is the most popular format. It gives every team a second chance before elimination, keeps people around longer, and creates more bar spend per team. Single elimination works for smaller events; round-robin is best for ongoing weekly leagues.",
              },
              {
                q: "How many boards do I need to run a cornhole tournament?",
                a: "Plan for one pair of boards per four teams. If you're running 16 teams, four board pairs let you run four matches at once. Most bars with a patio can fit two to four board pairs comfortably.",
              },
              {
                q: "What prizes work best for a bar cornhole tournament?",
                a: "Bar tab credits are the most effective because the money stays in your venue. Custom cornhole bags, season trophies, and local sponsor prizes all add value at low cost. Avoid cash prizes if you can — they don't benefit your bar.",
              },
              {
                q: "How long does a 16-team cornhole tournament take?",
                a: "A 16-team single-elimination tournament takes about 3 hours with two board pairs. Double-elimination takes 4–5 hours. Block 30 minutes before start time for check-in and bracket seeding.",
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
          <Link href="/cornhole-tournament-software" className="font-semibold text-lp-accent hover:underline">Cornhole tournament software →</Link>
          <Link href="/guides/bar-competition-ideas" className="font-semibold text-lp-accent hover:underline">25 bar competition ideas →</Link>
        </div>
      </div>
    </>
  );
}
