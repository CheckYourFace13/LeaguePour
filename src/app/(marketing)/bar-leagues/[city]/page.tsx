import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { OUTREACH_CITIES } from "@/lib/outreach-cities";

type CityData = { name: string; state: string; country: "US" | "CA" };

function buildCities(): Record<string, CityData> {
  const slugCount = new Map<string, number>();
  for (const c of OUTREACH_CITIES) {
    const base = c.city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    slugCount.set(base, (slugCount.get(base) ?? 0) + 1);
  }

  const map: Record<string, CityData> = {};
  const seen = new Set<string>();

  for (const c of OUTREACH_CITIES) {
    const key = `${c.city}|${c.state}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const base = c.city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const needsDisambig = (slugCount.get(base) ?? 0) > 1;
    let slug = needsDisambig ? `${base}-${c.state.toLowerCase()}` : base;
    if (c.city === 'Portland' && c.state === 'OR') slug = 'portland';

    map[slug] = { name: c.city, state: c.state, country: c.country };
  }
  return map;
}

const CITIES = buildCities();

export async function generateStaticParams() {
  return Object.keys(CITIES).map((city) => ({ city }));
}

function getBarsDescription(data: CityData): string {
  return data.country === "CA"
    ? `${data.name}, ${data.state} bars and pubs`
    : `${data.name}'s bars and venues`;
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const data = CITIES[city];
  if (!data) return {};
  const bars = getBarsDescription(data);
  return {
    title: `Bar Leagues & Tournaments in ${data.name} | LeaguePour`,
    description: `Find dart leagues, cornhole tournaments, trivia nights, and pool leagues at ${bars}. Join or run competitions on LeaguePour.`,
    alternates: { canonical: `/bar-leagues/${city}` },
    openGraph: {
      title: `Bar Leagues & Tournaments in ${data.name} | LeaguePour`,
      description: `Dart leagues, cornhole, trivia, and pool leagues at ${bars}.`,
      url: `/bar-leagues/${city}`,
    },
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const data = CITIES[city];
  if (!data) notFound();
  const bars = getBarsDescription(data);

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
          Dart leagues, cornhole tournaments, trivia nights, and pool leagues at {bars}.
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
            LeaguePour helps {bars} run dart leagues, cornhole tournaments, trivia nights, and more
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
