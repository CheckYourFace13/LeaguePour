import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bar Game History | How Your Favorite Bar Games Came to Be | LeaguePour",
  description:
    "The real history behind the games your bar runs every week - darts, cornhole, billiards, trivia, and shuffleboard. Where they started, how they spread, and why they stuck.",
  alternates: { canonical: "/history" },
  keywords: [
    "bar game history",
    "history of darts",
    "history of cornhole",
    "history of billiards",
    "pub trivia history",
    "shuffleboard history",
  ],
  openGraph: {
    title: "Bar Game History | How Your Favorite Bar Games Came to Be | LeaguePour",
    description:
      "The real history behind darts, cornhole, billiards, trivia, and shuffleboard - where they came from and why they're still packing bars.",
    url: "/history",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Bar Game History | LeaguePour",
  description:
    "Articles on the origins and history of popular bar and pub games, including darts, cornhole, billiards, trivia, and shuffleboard.",
  url: "https://leaguepour.com/history",
  publisher: {
    "@type": "Organization",
    name: "LeaguePour",
    url: "https://leaguepour.com",
  },
};

const articles = [
  {
    href: "/history/darts",
    kicker: "Darts",
    title: "From English pubs to world sport",
    summary:
      "How a medieval pastime became a televised world championship - and why the number layout on your dartboard is the work of one carpenter in 1896.",
  },
  {
    href: "/history/cornhole",
    kicker: "Cornhole",
    title: "The origin of America's backyard game",
    summary:
      "Ohio says they invented it. Wisconsin disagrees. German immigrants may have had something to do with it. The real story of how cornhole went from rural pastime to tailgate staple to bar league staple.",
  },
  {
    href: "/history/billiards",
    kicker: "Billiards & Pool",
    title: "From kings to corner bars",
    summary:
      "A French lawn game that moved indoors in the 15th century, picked up by royalty, and eventually landed in every dive bar in America - with a detour through horse-racing betting pools along the way.",
  },
  {
    href: "/history/trivia",
    kicker: "Pub Trivia",
    title: "How quiz night conquered the bar",
    summary:
      "British pub culture in the 1970s gave us the pub quiz. By the 1990s it had crossed the Atlantic. The story of how a low-tech night out became one of the most reliably profitable bar events on the calendar.",
  },
  {
    href: "/history/shuffleboard",
    kicker: "Shuffleboard",
    title: "Five centuries at the table",
    summary:
      "Henry VIII banned it. Tudor tavern-keepers kept running it anyway. How a 15th-century English pastime eventually ended up as a table in your bar's back room.",
  },
];

export default function HistoryHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Bar game history</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          How your favorite bar games came to be
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          Every game on your bar menu has a story. Some started in medieval England, some in 19th-century
          rural America, some in a British pub on a slow Tuesday night. These are those stories.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {articles.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group rounded-xl border border-lp-border bg-lp-surface/40 p-6 transition-colors hover:border-lp-accent/40"
            >
              <p className="lp-kicker text-lp-accent">{a.kicker}</p>
              <h2 className="mt-2 font-display text-xl font-bold text-lp-text group-hover:text-lp-accent transition-colors">
                {a.title}
              </h2>
              <p className="mt-3 text-sm text-lp-muted leading-relaxed">{a.summary}</p>
              <p className="mt-4 text-sm font-semibold text-lp-accent">Read the history →</p>
            </Link>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <p className="lp-kicker text-lp-accent">Also useful</p>
          <h2 className="mt-2 font-display text-xl font-bold">Looking for official rules?</h2>
          <p className="mt-2 text-lp-muted">
            We maintain a resource page that links directly to official rules from the governing bodies -
            no paraphrasing, just the real sources.
          </p>
          <Link
            href="/rules"
            className="mt-4 inline-block text-sm font-semibold text-lp-accent hover:underline"
          >
            Official bar game rules →
          </Link>
        </div>
      </div>
    </>
  );
}
