import type { Metadata } from "next";
import Link from "next/link";
import { applyManagedMetadata } from "@/lib/gravyblock-managed";
import { Button } from "@/components/ui/button";
import { DemoCta, DemoVideo } from "@/components/marketing/demo-video";
import { HowItWorksSequence, type HowStep } from "@/components/marketing/how-it-works-sequence";
import { HIW_MEDIA } from "@/lib/how-it-works-media";
import { videoJsonLd } from "@/lib/demo-videos";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import { LP_FREE_ACTIVE_COMPETITIONS } from "@/lib/entitlements/lp-capacity";
import { PLATFORM_FEE_BPS, PLAYER_SERVICE_FEE_CENTS } from "@/lib/stripe/connect-fees";
import { formatUsdCents } from "@/lib/pricing";

export async function generateMetadata(): Promise<Metadata> {
  return applyManagedMetadata("/how-it-works", {
    title: { absolute: "How LeaguePour Works: Demo Video and Step-by-Step" },
    description:
      "Watch a 90-second recorded demo of LeaguePour, then follow the real steps: free bracket generator, venue signup, publishing a competition with a QR code, score entry and the live scoreboard.",
    alternates: { canonical: "/how-it-works" },
    openGraph: {
      siteName: "LeaguePour",
      images: [{ url: "/opengraph-image", alt: "LeaguePour - venue competition software for bars" }],
      title: "How LeaguePour Works: Demo Video and Step-by-Step",
      description: "A recorded walkthrough from the free bracket tool to a live scoreboard.",
      url: "/how-it-works",
    },
  });
}

const m = (key: string) => HIW_MEDIA[key];
const img = (key: string, alt: string) => ({ src: m(key).src, width: m(key).width, height: m(key).height, alt });
const mark = (key: string, box: string, label: string) => {
  const b = m(key)?.boxes?.[box];
  return b && b.y >= 3 && b.y <= 97 ? [{ x: b.x, y: b.y, label }] : [];
};

// Every step is a real screen from the recorded demo flow (local server, disposable demo data).
// Product truth: src/lib/content-engine/facts.ts - no waitlists, no check-in, no SMS sending, and
// double elimination exists only as the free planning tool, not as a live competition format.
const steps: HowStep[] = [
  {
    title: "Plan the night with a free bracket tool",
    body: "No account needed. Type team or player names into the double elimination, single elimination or round robin generator. Tap a winner to advance them; in double elimination the loser drops to the losers bracket. Print it or copy a share link (anyone with the link can see the names).",
    img: img("lp-01-free-tool", "The free double elimination bracket generator with eight team names entered and the winners bracket built"),
    marks: [
      ...mark("lp-01-free-tool", "teams", "One team or player per line - the bracket rebuilds as you type"),
      ...mark("lp-01-free-tool", "winners", "Winners bracket; the losers bracket and grand final are below"),
      ...mark("lp-01-free-tool", "share", "Copy share link or Print"),
    ],
  },
  {
    title: "Create your venue account",
    body: "Four fields: your name, email, a password and your venue's name. No card. Location and venue type are optional and can wait.",
    img: img("lp-02-signup", "The LeaguePour venue signup form with name, email, password and venue name fields"),
  },
  {
    title: "Build the competition",
    body: "Name it, pick the game, then choose the format. Single elimination and round robin generate the bracket or schedule for you; Custom lets you track anything else by hand. Set the entry fee ($0 works without Stripe), a player cap, and publish - or save a private draft.",
    img: img("lp-04-builder-format", "The competition builder's format section with Single elimination selected"),
    marks: [
      ...mark("lp-04-builder-format", "format", "Bracket / standings style: round robin, single elimination or Custom"),
      ...mark("lp-04-builder-format", "schedule", "One night, or a recurring league"),
    ],
  },
  {
    title: "Share the signup page and QR code",
    body: "Publishing gives the event its own public page and a QR code for table tents or the bar TV. Signup closes automatically at your cap.",
    img: img("lp-06-qr", "A published competition page showing the signup QR code and the player registration buttons"),
    marks: [
      ...mark("lp-06-qr", "qr", "QR code - Download QR for print"),
      ...mark("lp-06-qr", "register", "Players create a free account or log in to register"),
    ],
  },
  {
    title: "Players register from their phone",
    body: "Nothing to download. Players use one free LeaguePour account at any venue; paid entries go through Stripe Checkout on your connected Stripe account.",
    img: img("lp-07-public-mobile", "The public competition page on a phone"),
    phone: true,
  },
  {
    title: "Start the tournament and enter scores",
    body: "Press Start Tournament and Round 1 (or the full round robin schedule) is generated from your registrations, with byes for odd fields. Enter each score; when a round is done, press Advance and the winners move on.",
    img: img("lp-08-score-entry", "Venue score entry for Round 1 with home and away score fields and a Save match button"),
    marks: [
      ...mark("lp-08-score-entry", "home", "Home and away scores for each match"),
      ...mark("lp-08-score-entry", "save", "Save match - standings and the bracket update"),
    ],
  },
  {
    title: "Everyone follows along",
    body: "Results show on the public page and on a live scoreboard you can put full-screen on a TV behind the bar.",
    img: img("lp-09-scoreboard", "The public live scoreboard showing Round 1 match results"),
  },
];

const FEE_PCT = PLATFORM_FEE_BPS / 100;
const SERVICE_FEE = formatUsdCents(PLAYER_SERVICE_FEE_CENTS);

// Answers must match the visible text exactly (the FAQPage schema is generated from this array).
const faqs = [
  {
    q: "How do I start?",
    a: "Try a free bracket tool with no account, or create a venue account (name, email, password, venue name) and build your first competition. Most of the builder has defaults, so only the title is required.",
  },
  {
    q: "What does it cost?",
    a: `A new venue can run ${LP_FREE_ACTIVE_COMPETITIONS} active competition at a time free, with every feature. Paid plans start at $29/month and differ only in how many competitions you run at once. Free ($0) events have no fees; paid entries carry a ${FEE_PCT}% platform fee and a ${SERVICE_FEE} player service fee, plus Stripe's own processing fee.`,
  },
  {
    q: "Do players need accounts?",
    a: "Yes, to register: one free LeaguePour player account works at every venue. Viewing the public event page, standings and the live scoreboard needs no login. The free bracket tools need no account at all.",
  },
  {
    q: "Is a download required?",
    a: "No. LeaguePour runs in the browser for venues and players, on a phone or a computer. There is no app to install.",
  },
  {
    q: "How do sharing and setup work?",
    a: "Publishing gives each competition a public page and a QR code to print or show on a TV, plus a venue page listing everything you have running. Connect Stripe only if you want to charge entry fees.",
  },
  {
    q: "Can I run a double elimination tournament?",
    a: "You can plan and track one with the free double elimination bracket generator (print it or share a link). Live competitions in the venue app support single elimination, round robin and Custom.",
  },
];

export default function HowItWorksPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(videoJsonLd("lp-main", "https://leaguepour.com", "2026-11-19")) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />

      <section id="demo" className="lp-hero-wash scroll-mt-20 border-b border-lp-border">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
          <p className="text-xs font-bold uppercase tracking-wider text-lp-muted">How it works</p>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">From free bracket to live standings</h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-lp-text-soft">
            Watch the real thing first: a recorded session with demo data, start to finish. Then follow the same steps below.
          </p>
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <DemoVideo id="lp-main" priorityPoster />
            <aside className="rounded-2xl border border-lp-border bg-white p-5 shadow-sm">
              <p className="font-display text-xl font-bold">Ready to try it?</p>
              <ul className="mt-3 space-y-2 text-sm text-lp-text-soft">
                <li>✓ First active competition free, every feature</li>
                <li>✓ No card, no download, no sales call</li>
                <li>✓ $0 events need no Stripe setup</li>
              </ul>
              <DemoCta
                video="lp-main"
                cta="signup_venue"
                href="/signup/venue"
                className="mt-5 flex min-h-12 w-full items-center justify-center rounded-[10px] bg-lp-accent-2 px-4 text-base font-bold text-lp-text hover:brightness-95"
              >
                Start free - create your venue
              </DemoCta>
              <DemoCta
                video="lp-main"
                cta="free_tool"
                href="/tools/double-elimination-bracket-generator"
                className="mt-3 flex min-h-12 w-full items-center justify-center rounded-[10px] border border-lp-border px-4 text-sm font-semibold text-lp-text hover:border-lp-accent"
              >
                Try the free bracket tool (no account)
              </DemoCta>
              <p className="mt-4 text-xs text-lp-muted">
                Paid plans from $29/mo only if you run more than one competition at once.{" "}
                <Link href="/pricing" className="font-semibold text-lp-accent hover:underline">
                  Plans and fees
                </Link>
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Step by step</p>
        <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">The same steps, one screen at a time</h2>
        <p className="mt-3 max-w-2xl text-lp-muted">Real screens from the demo above. Numbered markers point to the controls you&apos;ll use.</p>
        <div className="mt-12">
          <HowItWorksSequence steps={steps} />
        </div>
      </section>

      <section className="border-y border-lp-border bg-lp-surface/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:px-6 md:py-16">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Free vs. paid, plainly</h2>
            <ul className="mt-4 space-y-3 text-lp-text-soft">
              <li>
                <strong className="text-lp-text">Always free:</strong> the bracket generators, round robin scheduler and standings calculator - no account.
              </li>
              <li>
                <strong className="text-lp-text">Free venue account:</strong> {LP_FREE_ACTIVE_COMPETITIONS} active competition at a time with every feature. Drafts and finished events don&apos;t count.
              </li>
              <li>
                <strong className="text-lp-text">Paid plans ($29-$299/mo):</strong> the same features, more competitions running at once.
              </li>
              <li>
                <strong className="text-lp-text">Entry fees:</strong> none on $0 events. Paid entries: {FEE_PCT}% platform fee + {SERVICE_FEE} player service fee, plus Stripe processing.
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">The 25-second version</h2>
            <DemoVideo id="lp-intro" className="mt-4" showTranscript />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-16">
        <h2 className="font-display text-3xl font-bold">Questions</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4">
              <summary className="cursor-pointer font-semibold text-lp-text">{f.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-lp-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup/venue">Start hosting events - free</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">Explore the demo league</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-lp-muted">
          Signing up to play instead?{" "}
          <Link href="/for-players" className="font-semibold text-lp-accent hover:underline">
            How it works for players
          </Link>
          {" · "}
          <Link href="/find" className="font-semibold text-lp-accent hover:underline">
            Find a game night
          </Link>
          {" · "}
          <Link href="/features/tournaments" className="font-semibold text-lp-accent hover:underline">
            Tournament formats
          </Link>
        </p>
      </section>
    </div>
  );
}
