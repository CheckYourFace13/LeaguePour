import { safeJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/json-ld-builders";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { absolute: "Managing No-Shows and Forfeits in Bar Leagues | LeaguePour Guide" },
  description:
    "A practical forfeit policy for bar leagues: how to define a no-show, what counts as fair notice, how entry fees reduce no-shows, and how to keep the schedule fair when a team doesn't come.",
  alternates: { canonical: "/guides/managing-no-shows-and-forfeits" },
  keywords: [
    "bar league no shows",
    "tournament forfeit policy",
    "league forfeit rules",
    "how to handle no shows league",
    "bar league attendance policy",
  ],
  openGraph: {
    title: "Managing No-Shows and Forfeits in Bar Leagues | LeaguePour Guide",
    description: "A fair, written forfeit policy that protects the teams who actually show up.",
    url: "/guides/managing-no-shows-and-forfeits",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: "Managing No-Shows and Forfeits", path: "/guides/managing-no-shows-and-forfeits" },
    ]),
    {
      "@type": "Article",
      headline: "Managing No-Shows and Forfeits in Bar Leagues",
      description:
        "A practical, fair forfeit policy for bar leagues covering no-show rules, notice periods, entry fees as a deterrent, and repeat-offender handling.",
      author: { "@type": "Organization", name: "LeaguePour" },
      publisher: {
        "@type": "Organization",
        name: "LeaguePour",
        logo: { "@type": "ImageObject", url: "https://leaguepour.com/logo.png" },
      },
      url: "https://leaguepour.com/guides/managing-no-shows-and-forfeits",
      datePublished: "2026-09-13",
      dateModified: "2026-09-13",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What's a fair forfeit policy for a bar league?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A common, fair structure: a team that gives 24+ hours notice gets a reschedule if the calendar allows it; a team that no-shows without notice takes a loss; two no-call no-shows in a season results in removal from the league to protect the teams that do show up.",
          },
        },
        {
          "@type": "Question",
          name: "Do entry fees actually reduce no-shows?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, significantly. Teams that have paid upfront show up at dramatically higher rates than teams that signed up for free - people are far more likely to skip something they haven't committed money to. Collecting fees online before the season starts is more effective than collecting cash on the first night.",
          },
        },
        {
          "@type": "Question",
          name: "How much notice should count as a fair cancellation?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "24 hours is the standard minimum for a bar league - enough time to notify the opposing team and adjust the schedule if needed. Same-day cancellations and no-call no-shows are the cases a forfeit policy needs to cover, since there's no time to react.",
          },
        },
        {
          "@type": "Question",
          name: "Should a forfeit count as a loss in the standings?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes - a forfeit should be scored as a loss for the no-show team, and typically a standard win for the opposing team, so standings stay accurate and the team that showed up isn't penalized for someone else's absence.",
          },
        },
      ],
    },
  ],
};

export default function NoShowsAndForfeitsGuide() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">
          <Link href="/guides" className="hover:underline">Guides</Link> / Operations
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Managing No-Shows and Forfeits
        </h1>
        <p className="mt-5 text-lg text-lp-muted">
          One no-show can throw off a whole night&apos;s schedule and leave an opposing team standing
          around with nothing to do. A written forfeit policy - set before the season starts, not
          improvised on the spot - keeps this rare and fair when it happens.
        </p>

        <div className="mt-10 space-y-10 text-lp-text leading-relaxed">

          <section>
            <h2 className="font-display text-2xl font-bold">1. Write the policy before the season starts</h2>
            <p className="mt-4">
              The worst time to decide a forfeit policy is in the moment, in front of both teams, with
              everyone waiting. Publish a simple written policy before the first night so nobody can
              argue it was made up on the spot to favor one side. Send it to every team captain and
              post it alongside your other league rules.
            </p>
            <p className="mt-4">
              A policy that works for most bar leagues: 24+ hours notice gets a reschedule if the
              calendar allows it; a no-call no-show is scored as a loss; two no-call no-shows in a
              season results in removal from the league. Keep it to a few sentences - a forfeit policy
              nobody reads because it&apos;s three pages long doesn&apos;t help anyone.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">2. Define what actually counts as a no-show</h2>
            <p className="mt-4">
              Set a grace period and stick to it - 10 to 15 minutes past the scheduled start time is
              standard. A team that&apos;s 5 minutes late because of traffic isn&apos;t a no-show; a team that
              never texts and never shows by 15 minutes past start time is. Announce the grace period
              in your rules so nobody&apos;s guessing on league night whether it&apos;s been &quot;long enough&quot; yet.
            </p>
            <p className="mt-4">
              Distinguish a no-call no-show from a team that gives advance notice they can&apos;t make it.
              A team that texts you two days ahead to say they&apos;ll be short a player isn&apos;t the problem
              your policy needs to solve - the problem is teams that simply don&apos;t show and don&apos;t say
              anything, leaving the other team and your schedule hanging.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">3. Entry fees are your best prevention tool</h2>
            <p className="mt-4">
              The single most effective way to reduce no-shows isn&apos;t a stricter penalty - it&apos;s
              collecting entry fees upfront before the season starts. Teams that have paid show up at
              dramatically higher rates than teams that signed up for free, because there&apos;s now a real
              cost to skipping. A free signup is a loose plan; a paid signup is a commitment.
            </p>
            <p className="mt-4">
              Collecting online before the first night (rather than cash at the door) reinforces this
              further - the payment happens when someone&apos;s excited to join, not on a random Tuesday
              when they&apos;d rather stay home. See our guide on{" "}
              <Link href="/guides/how-to-collect-entry-fees-at-your-bar" className="text-lp-accent hover:underline">
                collecting entry fees the right way
              </Link>{" "}
              for the full breakdown.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">4. Score forfeits fairly in the standings</h2>
            <p className="mt-4">
              A forfeit should count as a real result, not a scheduling footnote. Score it as a loss
              for the no-show team and a standard win for the team that showed up - if your league
              awards points for wins, the opposing team should get full win credit, not a discounted
              &quot;forfeit win&quot; that undercounts their effort to show up on time.
            </p>
            <p className="mt-4">
              Record it the same way you&apos;d record any other match result so your standings stay
              accurate and auditable. A team that benefited from a forfeit shouldn&apos;t have to explain an
              asterisk next to their record at the end of the season.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">5. Handle repeat offenders before they sour the league</h2>
            <p className="mt-4">
              One no-show happens to almost every team over a season - a scheduling conflict, an
              emergency, a bad week. Two no-call no-shows in the same season is a pattern, not bad
              luck, and it&apos;s fair to remove that team from the league at that point. Letting it slide
              a third and fourth time signals to every other team that showing up isn&apos;t actually
              required, which erodes the whole league faster than losing one team ever would.
            </p>
            <p className="mt-4">
              Communicate this consequence privately and directly when it happens, referencing the
              policy you published at the start of the season - not as a surprise punishment, but as
              the rule everyone already agreed to. This keeps the conversation about the policy, not
              about a personal judgment call you&apos;re making up in the moment.
            </p>
          </section>

        </div>

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-2xl font-bold">Run your league with LeaguePour</h2>
          <p className="mt-2 text-lp-muted">
            Online entry fees collected before the season starts, automatic standings, and player
            reminders - the tools that make no-shows the exception instead of the norm.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events - free</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/guides/how-to-collect-entry-fees-at-your-bar">Entry fee guide</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-bold">Frequently asked questions</h2>
          <div className="mt-5 space-y-4">
            {[
              {
                q: "What's a fair forfeit policy for a bar league?",
                a: "24+ hours notice gets a reschedule if the calendar allows it; a no-call no-show is scored as a loss; two no-call no-shows in a season results in removal from the league.",
              },
              {
                q: "Do entry fees actually reduce no-shows?",
                a: "Yes, significantly. Teams that have paid upfront show up at much higher rates than free signups. Collecting online before the season starts works better than cash at the door.",
              },
              {
                q: "How much notice should count as a fair cancellation?",
                a: "24 hours is the standard minimum - enough time to notify the opposing team and adjust the schedule. Same-day cancellations and no-call no-shows are what a forfeit policy needs to cover.",
              },
              {
                q: "Should a forfeit count as a loss in the standings?",
                a: "Yes - score it as a loss for the no-show team and a standard win for the opposing team, so standings stay accurate.",
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
          <Link href="/guides/how-to-collect-entry-fees-at-your-bar" className="font-semibold text-lp-accent hover:underline">How to collect entry fees →</Link>
          <Link href="/guides/how-to-run-a-dart-league-at-your-bar" className="font-semibold text-lp-accent hover:underline">How to run a dart league →</Link>
        </div>
      </div>
    </>
  );
}
