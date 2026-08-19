import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { absolute: "History of Pub Trivia | How Quiz Night Conquered the Bar | LeaguePour" },
  description:
    "How pub trivia went from a British pub format in the 1970s to one of the most profitable recurring bar events in the world - the real history of quiz night.",
  alternates: { canonical: "/history/trivia" },
  keywords: [
    "history of pub trivia",
    "pub quiz history",
    "quiz night history",
    "origin of pub trivia",
    "bar trivia history",
    "Sharon Burns Tom Porter pub quiz",
  ],
  openGraph: {
    title: "History of Pub Trivia | How Quiz Night Conquered the Bar | LeaguePour",
    description:
      "The real history of pub trivia - from 1970s Britain through Trivial Pursuit to packed bar nights every Tuesday across America.",
    url: "/history/trivia",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "History of Pub Trivia: How Quiz Night Conquered the Bar",
  description:
    "The history of pub trivia from its 1970s British origins through Sharon Burns and Tom Porter's popularization of the format, the influence of Trivial Pursuit, and the spread of trivia nights to American bars.",
  url: "https://leaguepour.com/history/trivia",
  publisher: {
    "@type": "Organization",
    name: "LeaguePour",
    url: "https://leaguepour.com",
  },
  datePublished: "2025-05-10",
  author: {
    "@type": "Organization",
    name: "LeaguePour",
  },
  mainEntityOfPage: "https://leaguepour.com/history/trivia",
};

export default function TriviaHistoryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <Link href="/history" className="text-sm text-lp-muted hover:text-lp-accent">
          ← Bar game history
        </Link>

        <p className="lp-kicker mt-6 text-lp-accent">Pub Trivia</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          How quiz night conquered the bar
        </h1>
        <p className="mt-5 text-lg text-lp-muted">
          Pub trivia is one of the few bar events that requires no equipment, no physical skill, and
          no special setup - and it still manages to fill rooms every week. That's not an accident.
          It took decades to develop the format that makes it work.
        </p>

        <div className="mt-12 space-y-8 text-lp-text leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-bold">British pub culture in the 1970s</h2>
            <p className="mt-4">
              Organized quiz nights in British pubs trace back to the 1970s, when a combination of
              licensing law restrictions and the natural social culture of British pubs created fertile
              ground for structured entertainment. Pubs needed to give customers a reason to stay, and
              a quiz - cheap to run, endlessly renewable, and social in a way that solo entertainment
              wasn't - fit perfectly.
            </p>
            <p className="mt-4">
              The format that emerged was simple: a quizmaster reads questions in rounds, teams write
              down answers, sheets are collected and scored, winners are announced. No technology
              required. The only infrastructure you need is someone who can write questions and speak
              into a microphone.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Sharon Burns and Tom Porter</h2>
            <p className="mt-4">
              Among the figures most often credited with popularizing the pub quiz format in Britain
              are Sharon Burns and Tom Porter. In the late 1970s, Burns and Porter began running
              organized quiz nights at pubs in the Midlands and subsequently established a business
              around quizmastering and question supply. Their company, Brain of Britain, helped
              formalize the format and supply pubs that wanted to run quizzes but didn't have
              someone internally capable of writing and running them.
            </p>
            <p className="mt-4">
              The model they helped establish - a professional quizmaster as a service, provided to
              pubs on a recurring basis - is essentially the same model that bar trivia hosting
              companies use today. The pub provides the space and the drinks; the trivia company
              provides the questions, the host, and the structure.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Trivial Pursuit and the trivia moment (1981)</h2>
            <p className="mt-4">
              In 1981, two Canadian journalists - Scott Abbott and Chris Haney - released Trivial
              Pursuit. The board game became one of the best-selling games in history, particularly
              during its 1984 peak when it sold 20 million copies in North America alone. It did
              something important: it established that adults would enthusiastically engage with
              trivia as entertainment, not just as education.
            </p>
            <p className="mt-4">
              Trivial Pursuit didn't create pub trivia, but it created a cultural moment that made
              trivia legible as a mainstream activity. People who played the game at home were
              primed to enjoy the pub quiz format. The game also generated a specific vocabulary
              around trivia - categories, pie pieces, the competitive dynamic of knowing things
              your friends don't - that translated directly to the bar environment.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Crossing to America</h2>
            <p className="mt-4">
              Pub trivia arrived in the United States gradually through the 1980s and 1990s, often
              carried by British expatriates who opened pubs or worked in the bar industry and simply
              brought the format with them. British-style pubs in American cities - particularly in
              college towns and urban centers - were often the first venues to run regular quiz nights.
            </p>
            <p className="mt-4">
              The format adapted as it spread. American trivia tended to be louder, more hosted,
              with more audience interaction and a stronger entertainment emphasis compared to the
              more austere British model. Categories shifted toward American pop culture, sports,
              and film. The physical answer sheet remained, but the atmosphere changed.
            </p>
            <p className="mt-4">
              By the late 1990s and early 2000s, dedicated trivia hosting companies began appearing
              in the US, running quiz nights at multiple venues on a circuit. A host might do three
              or four different bars on different nights of the week, carrying their question sets
              and equipment with them. That model scaled well and became the dominant way trivia
              nights were delivered in American bars.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Why trivia nights work</h2>
            <p className="mt-4">
              The economics of a trivia night are hard to argue with from a bar owner's perspective.
              Teams of four to eight people show up with reservation-like reliability, stay for two
              to three hours, and order multiple rounds. The competitive element of the quiz creates
              a social experience that keeps people engaged - they can't really drift off to their
              phones when they're supposed to be answering questions.
            </p>
            <p className="mt-4">
              Trivia also ages into a venue's programming in a way few other events do. A bar that
              runs trivia every Tuesday develops a Tuesday trivia crowd - regulars who come not just
              for the quiz but because their friends are there. That recurring social obligation
              is what bar owners are actually selling, and trivia formats are unusually good at
              generating it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">The format today</h2>
            <p className="mt-4">
              Digital tablets, apps, and online answer submission have entered the trivia market,
              though many venues still run pen-and-paper formats because they work and customers
              like them. Themed trivia nights - 1980s music, Game of Thrones, horror films - have
              become common as venues look for a competitive edge in crowded markets.
            </p>
            <p className="mt-4">
              The underlying format, though, hasn't changed much since those 1970s British pubs.
              A quizmaster asks questions. Teams write down answers. You find out who knew the
              most. The game rewards people who read broadly and pay attention to the world, which
              turns out to be a significant portion of any bar's customer base on any given night.
            </p>
          </section>
        </div>

        <div className="mt-10 rounded-xl border border-lp-border bg-lp-surface/40 p-5 text-sm text-lp-muted">
          <p className="font-semibold text-lp-text">Sources</p>
          <ul className="mt-3 space-y-1">
            <li>
              <a
                href="https://en.wikipedia.org/wiki/Pub_quiz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                Wikipedia - Pub quiz
              </a>
            </li>
            <li>
              <a
                href="https://en.wikipedia.org/wiki/Trivial_Pursuit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lp-accent hover:underline"
              >
                Wikipedia - Trivial Pursuit
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-14 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-xl font-bold">Run trivia nights at your bar</h2>
          <p className="mt-2 text-lp-muted">
            LeaguePour handles team signup, entry fees, standings, and communications for bar trivia
            leagues and tournaments. One platform for your whole bar program.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/bar-trivia-software">See trivia features</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/history/darts" className="font-semibold text-lp-accent hover:underline">
            History of darts →
          </Link>
          <Link href="/history/billiards" className="font-semibold text-lp-accent hover:underline">
            History of billiards & pool →
          </Link>
          <Link href="/rules" className="font-semibold text-lp-accent hover:underline">
            Official trivia & game rules →
          </Link>
        </div>
      </div>
    </>
  );
}
