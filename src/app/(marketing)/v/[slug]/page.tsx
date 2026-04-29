import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { cta } from "@/lib/brand";
import { buildQrDataUrl } from "@/lib/qr";
import { getPublicSiteUrl } from "@/lib/site-url";
import { formatDate, formatMoney } from "@/lib/utils";
import { VenueFollowForm } from "./venue-follow-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const venue = await prisma.venue.findUnique({ where: { slug } });
  if (!venue) return { title: "Venue" };
  const city = venue.city?.trim();
  const cityTitle = city ? ` — ${city}` : "";
  const cityIntent = city ? `${city} bar competitions, trivia tournaments, and dart league signups.` : "Venue competitions and signup.";
  const base = getPublicSiteUrl();
  const pageUrl = `${base}/v/${venue.slug}`;
  return {
    title: `${venue.name}${cityTitle} | LeaguePour`,
    description: `${venue.name} (${venue.venueType}). ${cityIntent}`,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${venue.name}${cityTitle} | LeaguePour`,
      description: (venue.description || `${venue.name} on LeaguePour.`).slice(0, 160),
      type: "website",
      url: pageUrl,
    },
    twitter: {
      title: `${venue.name}${cityTitle} | LeaguePour`,
      description: `${venue.name} competitions, schedules, and signup links.`,
    },
  };
}

export default async function PublicVenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  const venue = await prisma.venue.findUnique({
    where: { slug },
    include: {
      competitions: {
        where: { status: { in: ["SIGNUP_OPEN", "PUBLISHED", "IN_PROGRESS"] } },
        orderBy: { startAt: "asc" },
        take: 20,
      },
    },
  });
  if (!venue) notFound();

  const isAuthedPlayer = Boolean(session?.user && session.hasPlayerProfile);
  const followRow =
    isAuthedPlayer && session?.user?.id
      ? await prisma.venueFollow.findUnique({
          where: { userId_venueId: { userId: session.user.id, venueId: venue.id } },
        })
      : null;
  const base = getPublicSiteUrl();
  const publicUrl = `${base}/v/${venue.slug}`;
  const qr = await buildQrDataUrl(publicUrl);

  const localBusinessJson = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": publicUrl,
    name: venue.name,
    description: (venue.description || `${venue.name} on LeaguePour.`).slice(0, 300),
    url: publicUrl,
    telephone: venue.phone ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.formattedAddress ?? venue.addressLine1 ?? undefined,
      addressLocality: venue.city ?? undefined,
      addressRegion: venue.state ?? undefined,
      postalCode: venue.postalCode ?? undefined,
      addressCountry: venue.country ?? "US",
    },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJson) }} />
      <p className="lp-kicker">Venue</p>
      <h1 className="lp-page-title mt-3 text-4xl md:text-5xl">{venue.name}</h1>
      <p className="mt-4 text-lg leading-relaxed text-lp-muted md:text-xl">{venue.description}</p>
      <p className="mt-3 text-base text-lp-muted">
        {[venue.formattedAddress ?? venue.addressLine1, venue.city, venue.state].filter(Boolean).join(" · ")}
      </p>
      {venue.city ? (
        <p className="mt-2 text-sm text-lp-muted">
          Looking for {venue.city} bar game nights, trivia tournaments, dart league signup, or cornhole tournament
          registration? Start here.
        </p>
      ) : null}
      {venue.websiteUrl || venue.instagramUrl || venue.facebookUrl || venue.xUrl || venue.tiktokUrl ? (
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {venue.websiteUrl ? (
            <a href={venue.websiteUrl} target="_blank" rel="noreferrer" className="font-semibold text-lp-accent hover:underline">
              Website
            </a>
          ) : null}
          {venue.instagramUrl ? (
            <a href={venue.instagramUrl} target="_blank" rel="noreferrer" className="font-semibold text-lp-accent hover:underline">
              Instagram
            </a>
          ) : null}
          {venue.facebookUrl ? (
            <a href={venue.facebookUrl} target="_blank" rel="noreferrer" className="font-semibold text-lp-accent hover:underline">
              Facebook
            </a>
          ) : null}
          {venue.xUrl ? (
            <a href={venue.xUrl} target="_blank" rel="noreferrer" className="font-semibold text-lp-accent hover:underline">
              X
            </a>
          ) : null}
          {venue.tiktokUrl ? (
            <a href={venue.tiktokUrl} target="_blank" rel="noreferrer" className="font-semibold text-lp-accent hover:underline">
              TikTok
            </a>
          ) : null}
        </div>
      ) : null}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <VenueFollowForm
          venueId={venue.id}
          venueSlug={venue.slug}
          isFollowing={Boolean(followRow)}
          isAuthedPlayer={isAuthedPlayer}
        />
        <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
          <Link href="/signup/player">{cta.joinPlayer}</Link>
        </Button>
        <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
          <Link href="/player/discover">{cta.browseEvents}</Link>
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <Link href="/for-players" className="font-semibold text-lp-accent hover:underline">
          How players join competitions
        </Link>
        <Link href="/pricing" className="font-semibold text-lp-accent hover:underline">
          LeaguePour platform pricing
        </Link>
      </div>

      <Card className="mt-8 space-y-3 p-5">
        <p className="lp-kicker text-lp-accent">QR</p>
        <p className="text-sm font-medium text-lp-text">Scan to open this venue page.</p>
        <div className="flex flex-wrap items-center gap-4">
          <img src={qr} alt="" className="h-28 w-28 rounded-lg border border-lp-border-strong bg-white p-2 shadow-md shadow-black/25" />
          <Button variant="primary" size="lg" asChild>
            <a href={qr} download={`${venue.slug}-leaguepour-qr.png`}>
              Download QR
            </a>
          </Button>
        </div>
      </Card>

      <h2 className="lp-page-title mt-14 text-2xl md:text-3xl">Competitions</h2>
      <p className="mt-2 text-sm text-lp-muted">
        Active and upcoming events at {venue.name}. Each event page includes schedule, format, entry fee, and signup.
      </p>
      {venue.competitions.length === 0 ? (
        <Card className="mt-6 p-5 md:p-6">
          <p className="text-sm text-lp-muted">
            No open signups right now. Follow this venue to get updates when the next league, trivia, or tournament
            opens.
          </p>
        </Card>
      ) : (
        <ul className="mt-6 space-y-4">
          {venue.competitions.map((c) => (
            <li key={c.id}>
              <Card className="p-5 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-display text-xl font-bold tracking-tight text-lp-text">{c.title}</p>
                    <p className="mt-2 text-base text-lp-muted">
                      Starts {formatDate(c.startAt)} · Signup closes {formatDate(c.signupCloseAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="accent">{c.kind.replaceAll("_", " ")}</Badge>
                    <Badge variant="muted">{formatMoney(c.entryFeeCents, c.entryFeeCurrency)}</Badge>
                  </div>
                </div>
                <Button className="mt-5 w-full sm:w-auto" variant="secondary" asChild>
                  <Link href={`/c/${venue.slug}/${c.slug}`}>View event</Link>
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
