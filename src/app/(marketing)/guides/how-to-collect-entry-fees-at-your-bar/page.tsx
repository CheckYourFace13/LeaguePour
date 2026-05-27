import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How to Collect Entry Fees at Your Bar (The Right Way) | LeaguePour",
  description:
    "Learn why cash entry fees create problems, how online payments via Stripe work for bar competitions, legal considerations, how to communicate fees to players, and how to handle refunds.",
  alternates: { canonical: "/guides/how-to-collect-entry-fees-at-your-bar" },
  keywords: [
    "how to collect entry fees at a bar",
    "bar competition entry fees",
    "bar tournament payment collection",
    "Stripe entry fees bar league",
    "bar league registration fees",
    "refund policy bar tournament",
  ],
  openGraph: {
    title: "How to Collect Entry Fees at Your Bar (The Right Way) | LeaguePour",
    description:
      "Cash is a headache. Learn how online payments solve entry fee collection for bar leagues and tournaments.",
    url: "/guides/how-to-collect-entry-fees-at-your-bar",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "How to Collect Entry Fees at Your Bar (The Right Way)",
      description:
        "A practical guide to collecting entry fees for bar leagues and tournaments — covering cash problems, legal considerations, online payments via Stripe, player communication, and refund policies.",
      author: { "@type": "Organization", name: "LeaguePour" },
      publisher: {
        "@type": "Organization",
        name: "LeaguePour",
        logo: { "@type": "ImageObject", url: "https://leaguepour.com/logo.png" },
      },
      url: "https://leaguepour.com/guides/how-to-collect-entry-fees-at-your-bar",
      datePublished: "2026-05-10",
      dateModified: "2026-05-10",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is it legal to charge entry fees for bar competitions?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "In most US states, charging entry fees for skill-based competitions (darts, cornhole, trivia, pool) is legal because the outcome is determined primarily by skill rather than chance. Games of pure chance (lotteries, certain card games) have different rules. If you're awarding significant cash prizes, consult a local attorney familiar with gaming and entertainment law. Many bars run entry-fee competitions for years without issue — but knowing your state's rules protects you.",
          },
        },
        {
          "@type": "Question",
          name: "What percentage does Stripe take on entry fees?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Stripe charges 2.9% + $0.30 per transaction for standard card payments in the US. For a $20 entry fee, Stripe's cut is about $0.88. LeaguePour adds a 5% platform fee plus $1.50 per player service fee on top of Stripe's processing fee. These are charged to the player or absorbed by the venue, depending on how you configure your event.",
          },
        },
        {
          "@type": "Question",
          name: "What should my refund policy be for bar league entry fees?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A common and fair policy: full refund if canceled 7 or more days before the event, 50% refund within 3–7 days, no refund within 3 days unless you cancel the event entirely. Always publish the refund policy on the signup page before players pay — surprises create bad reviews. If you cancel the event, refund everyone immediately.",
          },
        },
      ],
    },
  ],
};

export default function CollectEntryFeesGuide() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">
          <Link href="/guides" className="hover:underline">Guides</Link> / Operations
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          How to Collect Entry Fees at Your Bar (The Right Way)
        </h1>
        <p className="mt-5 text-lg text-lp-muted">
          Entry fees are one of the best ways to fund your prize pool, create player commitment, and
          add a revenue stream on top of bar sales. But collecting them the wrong way creates
          headaches for you and friction for your players. Here's how to do it right.
        </p>

        <div className="mt-10 space-y-10 text-lp-text leading-relaxed">

          <section>
            <h2 className="font-display text-2xl font-bold">1. Why cash entry fees are a problem</h2>
            <p className="mt-4">
              Most bar competitions start with cash collection — someone shows up on league night,
              passes an envelope around, and hopes everyone remembered to bring exact change. It seems
              simple. In practice, it creates a cascade of small problems that compound over a season.
            </p>
            <p className="mt-4">
              Cash creates accounting chaos. Who collected it? How much came in? Did everyone pay?
              What happens when the person holding the envelope doesn't show up? These questions
              consume mental energy that should go into running a great event.
            </p>
            <p className="mt-4">
              Cash reduces commitment. When there's no upfront payment, players treat a league signup
              like a casual RSVP. They show up when it's convenient and skip when it's not. Teams
              that have paid $25 upfront almost never no-show. Teams that haven't paid skip at a rate
              of 20–40%, especially as the season progresses.
            </p>
            <p className="mt-4">
              Cash creates disputes. Someone claims they paid; you don't have a record. Someone says
              they're good for it next week — and next week never comes. At the end of the season,
              your prize pool is $40 short and you're not sure who owes it.
            </p>
            <p className="mt-4">
              None of this means you can never use cash — for a small one-night event with 6 teams you
              already know, cash is fine. But for any recurring league or larger tournament, an online
              payment system is worth the setup time from day one.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">2. Legal considerations for entry fees</h2>
            <p className="mt-4">
              In most US states, charging entry fees for skill-based competitions is legal. Darts,
              cornhole, pool, trivia, and shuffleboard are all skill-based games where the winner is
              determined by ability rather than chance. This distinction matters legally — games of
              pure chance fall under gambling regulations; skill games generally don't.
            </p>
            <p className="mt-4">
              That said, state laws vary, and some states have stricter definitions of what counts as
              a game of skill. If you're planning large events with significant cash prizes — more than
              a few hundred dollars — it's worth a brief consultation with a local attorney who
              understands entertainment or gaming law. Most bars running weekly dart leagues or trivia
              nights with modest prize pools operate without issue, but knowing your state's position
              protects you if someone complains.
            </p>
            <p className="mt-4">
              Poker is a special case. Even though poker involves significant skill, it's regulated
              as gambling in most jurisdictions when real money is at stake. "Social" poker games where
              the host doesn't take a rake (a cut of the pot) are generally treated differently than
              commercial games. If you want to run paid poker tournaments, consult a local attorney
              before collecting fees.
            </p>
            <p className="mt-4">
              Keep records of all entry fees collected and how they were distributed. This isn't just
              good accounting — it's documentation that you ran the event as advertised if anyone
              ever questions it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">3. How online payments work for bar events</h2>
            <p className="mt-4">
              Stripe is the payment processor behind most online entry fee collection tools, including
              LeaguePour. It connects to your bank account and deposits collected entry fees directly —
              typically within 2 business days of the transaction. You don't hold player money; it
              flows directly to you.
            </p>
            <p className="mt-4">
              The player experience is straightforward: they visit your event's signup page, enter their
              payment information, and receive a confirmation email. The entire process takes under 2
              minutes. No app download, no account creation (on Stripe's end), no friction.
            </p>
            <p className="mt-4">
              Stripe charges 2.9% + $0.30 per transaction for standard card payments. On a $20 entry
              fee, that's about $0.88. For a 16-team event at $20 per team, Stripe's fee is roughly
              $14 on $320 in entry fees — less than 5%. Platform fees from tools like LeaguePour sit
              on top of this.
            </p>
            <p className="mt-4">
              You can pass processing fees to players (common in the tournament world — players see
              a line item for "processing fee" at checkout) or absorb them yourself and treat them as
              a cost of running the event. Absorbing the fee is cleaner from the player's perspective
              and is the better choice for regular league players who might get annoyed by nickel-and-diming.
              Passing fees to players makes sense for large one-time events where the total is significant.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">4. Communicating fees to players</h2>
            <p className="mt-4">
              Transparency upfront eliminates complaints later. State the entry fee clearly on every
              piece of promotion — the social media post, the signup page, the flyer. Never bury it
              in the fine print or reveal it only at checkout.
            </p>
            <p className="mt-4">
              Explain what the fee covers. "The $20 entry fee funds the prize pool, with first place
              winning a $150 bar tab and second place winning a $75 bar tab" is much more compelling
              than just "$20 entry fee." Players who understand where the money goes are more likely
              to pay without hesitation.
            </p>
            <p className="mt-4">
              If you're collecting fees in-person on the first night, tell players in advance. A
              reminder message ("Don't forget — $20 cash or card at the door before we start") prevents
              the awkward scramble of people who didn't know and need to find an ATM. Better yet,
              require online payment before the first night so you arrive knowing who's in and who's not.
            </p>
            <p className="mt-4">
              For season-long leagues, clearly communicate the total season cost versus a per-night
              cost. "It's $80 for the season, which is $10 per night for 8 nights" makes the value
              obvious. Some players balk at "80 dollars" and don't do the per-night math themselves.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">5. Setting a refund policy</h2>
            <p className="mt-4">
              A clear, published refund policy prevents complaints and sets expectations before
              anyone pays. Here's a framework that's fair to both sides:
            </p>
            <ul className="mt-4 space-y-2 pl-4 list-disc">
              <li><strong>7+ days before the event:</strong> Full refund, no questions asked.</li>
              <li><strong>3–7 days before:</strong> 50% refund. You've likely declined other registrations to hold the spot.</li>
              <li><strong>Within 3 days:</strong> No refund. You've finalized the bracket, ordered prizes, and staffed the event.</li>
              <li><strong>Event canceled by you:</strong> Full refund to everyone, immediately. No exceptions.</li>
            </ul>
            <p className="mt-4">
              Publish this policy on the signup page before players enter their payment information.
              A surprise refund policy revealed after the fact always feels like a trap, even if it's
              completely reasonable. Transparency builds trust — and trust is what converts a first-timer
              into a weekly regular.
            </p>
            <p className="mt-4">
              For unexpected situations — a player is hospitalized, a family emergency — use your
              discretion. Making an exception for a genuine hardship and issuing a full refund costs
              you one entry fee and earns you a loyal customer for years. Rigidly enforcing the policy
              when everyone can see it's an extraordinary situation creates the opposite outcome.
            </p>
          </section>

        </div>

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-2xl font-bold">Collect entry fees the easy way with LeaguePour</h2>
          <p className="mt-2 text-lp-muted">
            LeaguePour handles online signup and Stripe entry fee collection for your bar leagues
            and tournaments. Funds go directly to your bank account. No spreadsheets, no cash envelopes.
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
                q: "Is it legal to charge entry fees for bar competitions?",
                a: "In most US states, skill-based competitions (darts, cornhole, trivia, pool) can legally charge entry fees. Games of pure chance have different rules. For large cash prizes or poker, consult a local attorney. Most bars run entry-fee competitions without issue.",
              },
              {
                q: "What percentage does Stripe take on entry fees?",
                a: "Stripe charges 2.9% + $0.30 per transaction for standard US card payments. On a $20 entry fee, that's about $0.88. LeaguePour adds a 5% platform fee plus $1.50 per player service fee on top of Stripe's processing fee.",
              },
              {
                q: "What should my refund policy be for bar league entry fees?",
                a: "A common and fair policy: full refund 7+ days before the event, 50% refund within 3–7 days, no refund within 3 days unless you cancel the event. Always publish the policy on the signup page before players pay.",
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
          <Link href="/guides/bar-competition-ideas" className="font-semibold text-lp-accent hover:underline">25 bar competition ideas →</Link>
        </div>
      </div>
    </>
  );
}
