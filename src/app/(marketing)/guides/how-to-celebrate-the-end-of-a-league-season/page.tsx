import { safeJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/json-ld-builders";
import type { Metadata } from "next";
import { applyManagedMetadata } from "@/lib/gravyblock-managed";
import Link from "next/link";
import { CjRecommendation } from "@/components/marketing/affiliate";

const PATH = "/guides/how-to-celebrate-the-end-of-a-league-season";
const TITLE = "How to Celebrate the End of a League Season";
const DESCRIPTION =
  "A player's guide to a season-end night your team will remember: low-cost local options, awards that include everyone, food and drink for every crowd, group outings, a simple budget, accessibility, and booking timelines.";

export async function generateMetadata(): Promise<Metadata> {
  return applyManagedMetadata(PATH, {
    title: { absolute: `${TITLE} | LeaguePour Guide` },
    description: DESCRIPTION,
    alternates: { canonical: PATH },
    keywords: [
      "end of season party ideas",
      "league banquet ideas",
      "team awards ideas",
      "bar league end of season",
      "season finale party",
    ],
    openGraph: {
      siteName: "LeaguePour",
      images: [{ url: "/opengraph-image", alt: "LeaguePour - venue competition software for bars" }],
      title: `${TITLE} | LeaguePour Guide`,
      description: "Awards, food, group outings, a budget, and a booking timeline for your season finale.",
      url: PATH,
    },
  });
}

const FAQS = [
  {
    q: "How much should an end-of-season party cost per person?",
    a: "Whatever your group agrees to before anything is booked. A night at your own venue with shared food is often the lowest-cost option; an outing like bowling or karting usually costs more per person. Set the number first, then pick the plan that fits it - not the other way around.",
  },
  {
    q: "What awards work for a bar league?",
    a: "A champion award plus a handful of lighter ones - most improved, best sportsmanship, perfect attendance, best team name, best comeback. Lighter awards mean more people go home with something, which is a big part of why they sign up again.",
  },
  {
    q: "How far ahead should we book a team outing?",
    a: "About three to four weeks for most group bookings, longer around the holidays. Poll the group for a date first, then book once you have a firm headcount, and confirm the final count a few days before.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: "Celebrating the End of a Season", path: PATH },
    ]),
    {
      "@type": "Article",
      headline: TITLE,
      description: DESCRIPTION,
      author: { "@type": "Organization", name: "LeaguePour" },
      publisher: {
        "@type": "Organization",
        name: "LeaguePour",
        logo: { "@type": "ImageObject", url: "https://leaguepour.com/logos/leaguepour-icon.png" },
      },
      url: `https://leaguepour.com${PATH}`,
      datePublished: "2026-10-15",
      dateModified: "2026-10-15",
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

export default function SeasonCelebrationGuide() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">
          <Link href="/guides" className="hover:underline">Guides</Link> / For players
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">{TITLE}</h1>
        <p className="mt-5 text-lg text-lp-muted">
          The last night of a season is the one people remember when the next signup opens. It
          doesn&apos;t need to be expensive or elaborate - it needs a plan everyone agreed to, a reason
          for every team to show up, and someone who handles the details. Here&apos;s how to put one
          together, whether you&apos;re a team captain or the person running the whole league.
        </p>

        <div className="mt-10 space-y-10 text-lp-text leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-bold">1. Decide who it&apos;s for and who&apos;s organizing</h2>
            <p className="mt-4">
              Start with one question: is this a celebration for your team, or for the whole league?
              A team night is easy to plan in a group chat. A league-wide night needs the venue on
              board and one person - often the league coordinator - to own the plan, because ten
              captains each assuming someone else booked the room is how finales fall apart.
            </p>
            <p className="mt-4">
              Pick the organizer before you pick the plan. Their job is small but specific: run the
              date poll, collect the headcount, book the space, and be the one contact the venue talks
              to.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">2. Start local: the venue where you play</h2>
            <p className="mt-4">
              The simplest finale is the last league night itself, turned into a party. Everyone
              already knows where it is, the staff know your group, and nobody has to arrange a
              second night out. Talk to the venue a few weeks ahead - many bars will set aside a
              section, run a food special, or let you bring your own trophies and decorations if you
              ask early.
            </p>
            <p className="mt-4">When you ask, cover the details that cause surprises later:</p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Is there a food and drink minimum for reserving a room or section?</li>
              <li>Is a deposit required, and when is the final headcount due?</li>
              <li>Can the group run one tab, or should everyone pay as they go?</li>
              <li>Is outside food (like a cake) allowed, and is there a cutting or plating fee?</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">3. Awards people actually talk about</h2>
            <p className="mt-4">
              The champion trophy is the headline, but lighter awards are what get the whole room
              involved. Aim for enough categories that most teams have a shot at something:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li><strong>Champion</strong> and <strong>runner-up</strong> - from the final standings.</li>
              <li><strong>Most improved</strong> - compare early-season results to late-season ones.</li>
              <li><strong>Iron team</strong> - never missed a night or forfeited a match.</li>
              <li><strong>Best sportsmanship</strong> - voted by the other teams, not the organizer.</li>
              <li><strong>Best team name</strong> and <strong>best comeback</strong> - pure fun, and cheap to give.</li>
            </ul>
            <p className="mt-4">
              Awards don&apos;t need to cost much. Printed certificates, a small trophy for the winners,
              and a photo of every team at the end of the night often mean more than gift cards.
              Announce the categories a few weeks early so teams have something to play for in the
              last stretch.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">4. Food and drink for the whole group</h2>
            <p className="mt-4">
              Shared platters, pizza, or a taco or slider bar keep costs predictable and let people
              eat when they want instead of waiting on individual orders. Ask the venue for a group
              price - many bars have one even if it isn&apos;t on the menu.
            </p>
            <p className="mt-4">
              Plan for everyone in the room, not just the drinkers. Make sure there are good
              non-alcoholic options beyond soda, ask about dietary needs when you collect the
              headcount (vegetarian, gluten-free, allergies), and sort out rides home before the
              night starts - designated drivers, rideshare, or a late start time that works with
              transit.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">5. Group activities and outings</h2>
            <p className="mt-4">
              If the night is at your usual venue, keep a game in it. A blind-draw doubles tournament
              (partners drawn from a hat, across teams) mixes up the room and gives weaker players a
              real chance to win something. A short trivia round about the season - who won week
              three, which team forfeited on the snow night - gets laughs from everyone who was there.
            </p>
            <p className="mt-4">
              If your group wants to go somewhere else, look for activities that work for mixed
              skill levels and group sizes: bowling, an escape room, a minor-league game, or a
              karting track. Ask about group rates and whether they take one booking for the whole
              party - splitting fifteen separate reservations is a headache.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">6. A simple budget</h2>
            <p className="mt-4">
              Agree on a per-person number before anything is booked, then work backwards. A quick
              way to sanity-check a plan:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Count the people who&apos;ve said yes, not the size of the roster.</li>
              <li>Add up the fixed costs - room minimum, deposit, awards, cake - and divide by that count.</li>
              <li>Add the per-person costs - food, activity tickets - on top.</li>
              <li>Leave room for tax and tip so nobody is surprised at the end.</li>
            </ul>
            <p className="mt-4">
              Some leagues set aside a small amount from each team over the season for the finale, so
              the party is already covered by the last night. If that isn&apos;t possible, keep a
              low-cost option on the table - a night at your own venue with shared food - so cost
              never decides who can come.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">7. Make it easy for everyone to come</h2>
            <p className="mt-4">
              Check the basics before you book: step-free entry and accessible restrooms, seating for
              people who can&apos;t stand all night, and a noise level where people can actually talk.
              Pick a start time that works for players with kids or early shifts, and post the plan
              somewhere everyone can see it - not just in one team&apos;s group chat.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">8. Booking timeline</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li><strong>4 weeks out:</strong> pick the organizer, poll for a date, agree on a per-person budget.</li>
              <li><strong>3 weeks out:</strong> book the space or outing, pay any deposit, and announce the award categories.</li>
              <li><strong>1 week out:</strong> lock the headcount, collect dietary needs, and order trophies or certificates.</li>
              <li><strong>2 days out:</strong> confirm the final count and timing with the venue.</li>
              <li><strong>On the night:</strong> one person keeps the run sheet - food, awards, photo, last call.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">9. A gift for the captain or the season MVP</h2>
            <p className="mt-4">
              Many teams chip in for a thank-you gift for the captain who organized every week, or for
              the player who carried the team. Something they&apos;ll do tends to land better than
              something they&apos;ll keep on a shelf - a night out, a class, or an experience they
              wouldn&apos;t book for themselves.
            </p>
            <CjRecommendation advertiserId="adrenaline-gift-certificate" website="leaguepour" anchor="Adrenaline gift certificates">
              Adrenaline sells experience gift certificates that, according to its site, can be put
              toward any experience it lists. Its experiences are concentrated in particular cities
              and regions, not available everywhere - look up what&apos;s near the person you&apos;re buying
              for before you choose this, and check the current terms on the certificate page.
            </CjRecommendation>
          </section>
        </div>

        <div className="mt-14">
          <h2 className="font-display text-xl font-bold">Frequently asked questions</h2>
          <div className="mt-5 space-y-4">
            {FAQS.map((f) => (
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
          <Link href="/for-players" className="font-semibold text-lp-accent hover:underline">LeaguePour for players →</Link>
        </div>
      </div>
    </>
  );
}
