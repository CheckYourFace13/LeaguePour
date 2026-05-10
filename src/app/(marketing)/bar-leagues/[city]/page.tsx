import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

const CITIES: Record<string, { name: string; state: string; bars: string }> = {
  chicago: { name: "Chicago", state: "IL", bars: "Chicago's bar scene" },
  nashville: { name: "Nashville", state: "TN", bars: "Nashville's honky-tonks and bars" },
  austin: { name: "Austin", state: "TX", bars: "Austin's bars and venues" },
  denver: { name: "Denver", state: "CO", bars: "Denver's craft bar scene" },
  dallas: { name: "Dallas", state: "TX", bars: "Dallas bars and taprooms" },
  houston: { name: "Houston", state: "TX", bars: "Houston's bar scene" },
  phoenix: { name: "Phoenix", state: "AZ", bars: "Phoenix bars and venues" },
  philadelphia: { name: "Philadelphia", state: "PA", bars: "Philly's neighborhood bars" },
  portland: { name: "Portland", state: "OR", bars: "Portland's craft bar scene" },
  seattle: { name: "Seattle", state: "WA", bars: "Seattle's bar scene" },
  atlanta: { name: "Atlanta", state: "GA", bars: "Atlanta bars and venues" },
  miami: { name: "Miami", state: "FL", bars: "Miami bars and venues" },
  boston: { name: "Boston", state: "MA", bars: "Boston's bar scene" },
  "las-vegas": { name: "Las Vegas", state: "NV", bars: "Las Vegas bars and venues" },
  "new-orleans": { name: "New Orleans", state: "LA", bars: "New Orleans' iconic bars" },
  pittsburgh: { name: "Pittsburgh", state: "PA", bars: "Pittsburgh's neighborhood bars" },
  "kansas-city": { name: "Kansas City", state: "MO", bars: "Kansas City's bar scene" },
  minneapolis: { name: "Minneapolis", state: "MN", bars: "Minneapolis bars and venues" },
  columbus: { name: "Columbus", state: "OH", bars: "Columbus bars and venues" },
  indianapolis: { name: "Indianapolis", state: "IN", bars: "Indianapolis bars and venues" },
  "st-louis": { name: "St. Louis", state: "MO", bars: "St. Louis bars and venues" },
  milwaukee: { name: "Milwaukee", state: "WI", bars: "Milwaukee's bar scene" },
  charlotte: { name: "Charlotte", state: "NC", bars: "Charlotte bars and venues" },
  "san-antonio": { name: "San Antonio", state: "TX", bars: "San Antonio bars and venues" },
  detroit: { name: "Detroit", state: "MI", bars: "Detroit bars and venues" },
};

export async function generateStaticParams() {
  return Object.keys(CITIES).map((city) => ({ city }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const data = CITIES[city];
  if (!data) return {};
  return {
    title: `Bar Leagues & Tournaments in ${data.name} | LeaguePour`,
    description: `Find dart leagues, cornhole tournaments, trivia nights, and pool leagues at ${data.bars}. Join or run competitions on LeaguePour.`,
    alternates: { canonical: `/bar-leagues/${city}` },
    openGraph: {
      title: `Bar Leagues & Tournaments in ${data.name} | LeaguePour`,
      description: `Dart leagues, cornhole, trivia, and pool leagues at ${data.bars}.`,
      url: `/bar-leagues/${city}`,
    },
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const data = CITIES[city];
  if (!data) notFound();

  let venues: { id: string; name: string; slug: string; _count: { competitions: number } }[] = [];
  try {
    venues = await prisma.venue.findMany({
      where: {
        isDisabled: false,
        OR: [
          { city: { contains: data.name, mode: "insensitive" } },
          { state: { equals: data.state, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { competitions: true } },
      },
      take: 20,
    });
  } catch {
    venues = [];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Bar Leagues and Tournaments in ${data.name}`,
    description: `Dart leagues, cornhole tournaments, trivia nights, and pool leagues at bars in ${data.name}, ${data.state}.`,
    url: `https://leaguepour.com/bar-leagues/${city}`,
  };

  const sports = [
    { name: "Dart leagues", href: "/dart-league-software" },
    { name: "Cornhole tournaments", href: "/cornhole-tournament-software" },
    { name: "Trivia nights", href: "/bar-trivia-software" },
    { name: "Pool leagues", href: "/pool-league-management" },
    { name: "Shuffleboard", href: "/shuffleboard-league-software" },
    { name: "Poker nights", href: "/poker-tournament-software" },
    { name: "Music bingo", href: "/music-bingo-software" },
    { name: "Euchre leagues", href: "/euchre-tournament-software" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Bar leagues near you</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Bar leagues & tournaments<br />
          <span className="text-lp-accent">in {data.name}</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          Dart leagues, cornhole tournaments, trivia nights, and pool leagues at {data.bars}.
          Find a competition to join — or run your own on LeaguePour.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup/player">Find competitions to join</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/signup/venue">Run events at your bar</Link>
          </Button>
        </div>

        {venues.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold">Venues running competitions in {data.name}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {venues.map((v) => (
                <Link
                  key={v.id}
                  href={`/v/${v.slug}`}
                  className="rounded-xl border border-lp-border bg-lp-surface/40 p-5 hover:border-lp-accent transition-colors"
                >
                  <p className="font-semibold text-lp-text">{v.name}</p>
                  <p className="mt-1 text-sm text-lp-muted">{v._count.competitions} competition{v._count.competitions !== 1 ? "s" : ""}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {venues.length === 0 && (
          <div className="mt-16 rounded-2xl border border-lp-border bg-lp-surface/40 p-8 text-center">
            <h2 className="font-display text-xl font-bold">No venues listed yet in {data.name}</h2>
            <p className="mt-2 text-lp-muted">Be the first bar in {data.name} on LeaguePour — set up in minutes.</p>
            <div className="mt-6">
              <Button asChild size="lg">
                <Link href="/signup/venue">Add your {data.name} venue</Link>
              </Button>
            </div>
          </div>
        )}

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Types of bar competitions in {data.name}</h2>
          <p className="mt-2 text-lp-muted">LeaguePour venues run all kinds of events.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {sports.map((s) => (
              <Link
                key={s.name}
                href={s.href}
                className="rounded-full border border-lp-border bg-lp-surface/40 px-4 py-2 text-sm font-semibold text-lp-text hover:border-lp-accent hover:text-lp-accent transition-colors"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-20 rounded-2xl bg-lp-surface/40 border border-lp-border p-8">
          <h2 className="font-display text-2xl font-bold">Own a bar in {data.name}?</h2>
          <p className="mt-3 text-lp-muted leading-relaxed">
            LeaguePour helps {data.bars} run dart leagues, cornhole tournaments, trivia nights, and more
            — with online signup, entry fees via Stripe, standings, and player marketing built in.
            Set up your first competition in under 10 minutes.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/venue">Get started free</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/for-venues">Learn how it works</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          {Object.entries(CITIES).filter(([k]) => k !== city).slice(0, 8).map(([k, v]) => (
            <Link key={k} href={`/bar-leagues/${k}`} className="font-semibold text-lp-accent hover:underline">
              {v.name} →
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
