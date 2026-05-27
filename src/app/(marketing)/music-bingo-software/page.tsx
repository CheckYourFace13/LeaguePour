import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Music Bingo Software for Bars | LeaguePour",
  description:
    "Run music bingo nights at your bar with LeaguePour. Online team registration, entry fees via Stripe, and player notifications - all in one platform built for bars.",
  alternates: { canonical: "/music-bingo-software" },
  keywords: [
    "music bingo software",
    "music bingo night management",
    "bar music bingo",
    "music bingo registration",
    "music bingo app for bars",
    "bar music bingo platform",
  ],
  openGraph: {
    title: "Music Bingo Software for Bars | LeaguePour",
    description:
      "Run music bingo nights at your bar - online registration, entry fees, and player notifications. No spreadsheets.",
    url: "/music-bingo-software",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "LeaguePour - Music Bingo Software",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://leaguepour.com/music-bingo-software",
      description:
        "Music bingo night management software for bars. Run recurring music bingo events with team registration, entry fees, and player communications.",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "29",
        highPrice: "299",
        priceCurrency: "USD",
        offerCount: "4",
      },
      keywords: "music bingo software, bar music bingo, music bingo night management",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is music bingo?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Music bingo (also called song bingo) works like traditional bingo, but song titles replace numbers on the cards. A host plays 15–30 seconds of each song, and players mark off the song if they recognize it. The first player or team to mark off a row, column, or full card and call 'bingo' wins. It's played in rounds, with each round using a different bingo card and playlist.",
          },
        },
        {
          "@type": "Question",
          name: "How do players register for music bingo night?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Players visit your venue's public LeaguePour page, select the music bingo night, pay the entry fee (if any) via Stripe Checkout, and receive a confirmation email. No app download required. You see a confirmed attendance list in your dashboard before the event.",
          },
        },
        {
          "@type": "Question",
          name: "What music bingo themes work best for bars?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Decade-themed nights (80s, 90s, 2000s) are consistently the most popular because they tap into nostalgia and create a shared experience for the room. Genre nights (country, hip-hop, classic rock) work well for bars with a specific demographic. Holiday-themed music bingo (Christmas hits, Halloween spooky songs) drives strong attendance for seasonal events.",
          },
        },
        {
          "@type": "Question",
          name: "Can LeaguePour handle recurring weekly music bingo nights?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Create a recurring music bingo event with a set night, registration window, optional entry fee, and team size limits. Players can register for a single night or a full series. Registered players receive email reminders before each event.",
          },
        },
      ],
    },
  ],
};

const features = [
  {
    title: "Online registration",
    body: "Solo players or teams register from their phone before music bingo night. Know your headcount in advance and cap attendance at your venue's seating limit.",
  },
  {
    title: "Entry fees via Stripe",
    body: "Collect registration fees automatically. Funds deposit directly to your venue's bank account within 2 business days - no cash handling, no manual reconciliation.",
  },
  {
    title: "Recurring event management",
    body: "Create a weekly or monthly music bingo series. Re-use your event template, update the theme, and re-open registration for each night with one click.",
  },
  {
    title: "Player email notifications",
    body: "Send reminders before each music bingo night, theme announcements, and results - directly from your LeaguePour dashboard to everyone who's registered.",
  },
  {
    title: "Waitlists",
    body: "Cap attendance at your fire-code limit. Players who miss the cutoff go on a waitlist and get notified automatically if a spot opens before the event.",
  },
  {
    title: "Venue public page",
    body: "Your branded LeaguePour venue page lists all upcoming music bingo nights with registration links. Shareable, mobile-friendly, and always current.",
  },
];

export default function MusicBingoSoftwarePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Music bingo software</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Run music bingo nights at your bar.<br />
          <span className="text-lp-accent">No spreadsheets.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          LeaguePour handles music bingo registration, optional entry fees, player notifications,
          and recurring event management - all in one platform built for bars that want to fill seats
          on a consistent night without the logistics headache.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup/venue">Start your music bingo night</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Everything you need to run music bingo</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-lp-border bg-lp-surface/40 p-5">
                <h3 className="font-semibold text-lp-text">{f.title}</h3>
                <p className="mt-2 text-sm text-lp-muted leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 rounded-2xl bg-lp-surface/40 border border-lp-border p-8">
          <h2 className="font-display text-2xl font-bold">How it works for music bingo nights</h2>
          <ol className="mt-6 space-y-5">
            {[
              {
                n: 1,
                title: "Create your music bingo event",
                body: "Set the theme, date, team size, max players, optional entry fee, and registration window. Choose a recurring schedule if you're running a weekly night.",
              },
              {
                n: 2,
                title: "Share the registration link",
                body: "Post it on social, your bar's website, or display a QR code at the bar. Players register and confirm their spot before the night - no walk-in surprises.",
              },
              {
                n: 3,
                title: "Run the event",
                body: "Check in registered players, run your rounds, and announce winners. The registration list in your dashboard is your check-in sheet.",
              },
              {
                n: 4,
                title: "Build the next night",
                body: "Email all registered players about the next event. Return registration is dramatically higher from players who've already attended - use that momentum.",
              },
            ].map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lp-accent/20 text-sm font-bold text-lp-accent">
                  {s.n}
                </span>
                <div>
                  <p className="font-semibold text-lp-text">{s.title}</p>
                  <p className="mt-1 text-sm text-lp-muted leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Why music bingo works for bars</h2>
          <div className="mt-5 space-y-4 text-lp-text leading-relaxed">
            <p>
              Music bingo draws the widest demographic range of any bar competition format. Unlike darts
              or pool, it requires no physical skill - just a knowledge of music, which means customers
              who would never sign up for a dart league are genuinely excited to participate. This is one
              of the few formats that routinely brings in birthday groups, bachelorette parties, and
              corporate teams alongside your regular bar crowd.
            </p>
            <p>
              The format is inherently social. Bingo rounds create natural high-energy moments - near
              misses, last-second wins, arguments about whether that actually was a Taylor Swift song
              - that spill across tables and create a room-wide energy. Spectators become participants,
              and participants become regulars.
            </p>
            <p>
              Theme nights are the secret weapon. A "90s Pop" music bingo night is a social media post
              that practically writes itself. People tag friends, share the flyer, and drag their whole
              group. A well-chosen theme can double your normal attendance on a first-run event.
            </p>
            <p>
              You don't need a professional music bingo service to get started. A curated Spotify
              playlist, a laptop, a Bluetooth speaker, and printed bingo cards (available in templates
              online) is enough to run your first night. LeaguePour handles the registration and payment
              logistics so you can focus on making the event feel great.
            </p>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-6 space-y-4">
            {[
              {
                q: "What is music bingo?",
                a: "Music bingo works like traditional bingo, but song titles replace numbers on the cards. A host plays 15–30 seconds of each song, and players mark off the song if they recognize it. First to complete a row or full card wins.",
              },
              {
                q: "How do players register for music bingo night?",
                a: "Players visit your venue's public LeaguePour page, select the event, pay the entry fee via Stripe, and receive a confirmation email. No app download required.",
              },
              {
                q: "What music bingo themes work best for bars?",
                a: "Decade nights (80s, 90s, 2000s) are the most popular. Genre nights (country, hip-hop, classic rock) work well for bars with a specific demographic. Holiday-themed events drive strong seasonal attendance.",
              },
              {
                q: "Can LeaguePour handle recurring weekly music bingo nights?",
                a: "Yes. Create a recurring event series, update the theme for each night, and re-open registration with one click. Registered players receive email reminders before each event.",
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

        <div className="mt-16 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to launch your music bingo night?</h2>
          <p className="mt-2 text-lp-muted">Set up in minutes. Free to start, no credit card required.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/bar-trivia-software" className="font-semibold text-lp-accent hover:underline">Bar trivia software →</Link>
          <Link href="/dart-league-software" className="font-semibold text-lp-accent hover:underline">Dart league software →</Link>
          <Link href="/cornhole-tournament-software" className="font-semibold text-lp-accent hover:underline">Cornhole tournament software →</Link>
        </div>
      </div>
    </>
  );
}
