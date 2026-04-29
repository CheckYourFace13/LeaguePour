import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { RegistrationStatus } from "@/generated/prisma/enums";
import { presentRegistrationPaymentFromRow } from "@/lib/payment-display";
import { getPublicSiteUrl } from "@/lib/site-url";
import { registrationsTowardCap } from "@/lib/registration-cap";
import { buildQrDataUrl } from "@/lib/qr";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { cta } from "@/lib/brand";
import { RegistrationPanel } from "./registration-panel";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ venueSlug: string; competitionSlug: string }>;
}): Promise<Metadata> {
  const { venueSlug, competitionSlug } = await params;
  const comp = await prisma.competition.findFirst({
    where: { slug: competitionSlug, venue: { slug: venueSlug } },
    include: { venue: true },
  });
  if (!comp) return { title: "Competition" };
  const base = getPublicSiteUrl();
  const pageUrl = `${base}/c/${venueSlug}/${competitionSlug}`;
  const compType = comp.kind.replaceAll("_", " ").toLowerCase();
  const city = comp.venue.city?.trim();
  const titleParts = [comp.title, city ? `${city} ${compType}` : undefined, comp.venue.name, "LeaguePour"].filter(Boolean);
  const desc = (
    comp.description ||
    `${comp.title} at ${comp.venue.name}${city ? ` in ${city}` : ""}. Signup for this ${compType} competition.`
  ).slice(0, 160);
  return {
    title: titleParts.join(" | "),
    description: desc,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: titleParts.join(" | "),
      description: desc,
      type: "website",
      url: pageUrl,
    },
    twitter: {
      title: titleParts.join(" | "),
      description: desc,
    },
  };
}

export default async function PublicCompetitionPage({
  params,
}: {
  params: Promise<{ venueSlug: string; competitionSlug: string }>;
}) {
  const { venueSlug, competitionSlug } = await params;
  const session = await auth();

  const comp = await prisma.competition.findFirst({
    where: { slug: competitionSlug, venue: { slug: venueSlug } },
    include: {
      venue: true,
      prizeStructure: true,
    },
  });
  if (!comp) notFound();

  const filled = await prisma.competitionRegistration.count({
    where: registrationsTowardCap(comp.id),
  });

  const spots = comp.participantCap != null ? Math.max(0, comp.participantCap - filled) : null;

  const canRegister =
    (comp.status === "SIGNUP_OPEN" || comp.status === "PUBLISHED") && comp.signupCloseAt >= new Date();

  const isLoggedInPlayer = Boolean(session?.user && session.hasPlayerProfile);
  const myReg =
    isLoggedInPlayer && session?.user?.id
      ? await prisma.competitionRegistration.findFirst({
          where: { competitionId: comp.id, userId: session.user.id },
          select: {
            id: true,
            status: true,
            payment: { select: { status: true, provider: true } },
          },
        })
      : null;

  const alreadyRegistered = myReg?.status === RegistrationStatus.CONFIRMED;
  const pendingPaymentRegistrationId =
    myReg?.status === RegistrationStatus.PENDING_PAYMENT ? myReg.id : undefined;
  const registrationPaymentPresentation = myReg
    ? presentRegistrationPaymentFromRow(myReg, comp.entryFeeCents)
    : null;
  const publicUrl = `${getPublicSiteUrl()}/c/${venueSlug}/${competitionSlug}`;
  const qr = await buildQrDataUrl(publicUrl);
  const moreAtVenue = await prisma.competition.findMany({
    where: {
      venueId: comp.venueId,
      id: { not: comp.id },
      status: { in: ["SIGNUP_OPEN", "PUBLISHED", "IN_PROGRESS"] },
      signupCloseAt: { gte: new Date() },
    },
    orderBy: { startAt: "asc" },
    take: 3,
    select: {
      id: true,
      slug: true,
      title: true,
      kind: true,
      startAt: true,
      entryFeeCents: true,
      entryFeeCurrency: true,
    },
  });
  const compTypeLabel = comp.kind.replaceAll("_", " ");
  const cityLabel = [comp.venue.city, comp.venue.state].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "@id": publicUrl,
            name: comp.title,
            description: comp.description,
            url: publicUrl,
            startDate: comp.startAt.toISOString(),
            endDate: comp.endAt.toISOString(),
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            organizer: {
              "@type": "Organization",
              name: comp.venue.name,
              url: `${getPublicSiteUrl()}/v/${venueSlug}`,
            },
            location: {
              "@type": "Place",
              name: comp.venue.name,
              address: {
                "@type": "PostalAddress",
                streetAddress: comp.venue.formattedAddress ?? comp.venue.addressLine1 ?? undefined,
                addressLocality: comp.venue.city ?? undefined,
                addressRegion: comp.venue.state ?? undefined,
                postalCode: comp.venue.postalCode ?? undefined,
                addressCountry: comp.venue.country ?? "US",
              },
            },
            offers:
              comp.entryFeeCents > 0
                ? {
                    "@type": "Offer",
                    price: (comp.entryFeeCents / 100).toFixed(2),
                    priceCurrency: comp.entryFeeCurrency,
                    availability: "https://schema.org/InStock",
                    url: publicUrl,
                  }
                : undefined,
          }),
        }}
      />
      <p className="lp-kicker">{comp.venue.name}</p>
      <h1 className="lp-page-title mt-3 text-4xl md:text-5xl">{comp.title}</h1>
      {cityLabel ? (
        <p className="mt-2 text-sm text-lp-muted">
          {cityLabel} {compTypeLabel.toLowerCase()} signup and team registration.
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="accent">{compTypeLabel}</Badge>
        <Badge variant="muted">{comp.status.replaceAll("_", " ")}</Badge>
      </div>

      <Card className="mt-8 space-y-4 p-5 md:p-6">
        <p className="text-base leading-relaxed text-lp-muted md:text-lg">{comp.description}</p>
        <p className="text-sm text-lp-muted">
          Signup for this {compTypeLabel.toLowerCase()} at {comp.venue.name}
          {cityLabel ? ` in ${cityLabel}` : ""}. League, bracket, or tournament details are listed here.
        </p>
        <p className="font-display text-2xl font-bold tabular-nums text-lp-text md:text-3xl">
          {formatMoney(comp.entryFeeCents, comp.entryFeeCurrency)}{" "}
          {comp.entryFeeCents > 0 ? "listed entry" : "entry"}
        </p>
        {comp.entryFeeCents > 0 ? (
          <p className="text-sm leading-relaxed text-lp-muted">
            The venue sets this amount. Paid events use Stripe Checkout — you complete payment on Stripe’s secure page,
            and LeaguePour updates your registration when Stripe confirms success.
          </p>
        ) : null}
        <p className="text-base text-lp-muted">
          Signup closes <span className="font-semibold text-lp-text">{formatDateTime(comp.signupCloseAt)}</span>
        </p>
        <p className="text-base text-lp-muted">
          Starts <span className="font-semibold text-lp-text">{formatDateTime(comp.startAt)}</span>
        </p>
        {spots != null ? (
          <p className="text-base font-semibold text-lp-success">
            {filled} of {comp.participantCap} reserved · {spots} spots left
          </p>
        ) : (
          <p className="text-base text-lp-muted">{filled} signed up</p>
        )}
      </Card>

      {comp.prizeStructure ? (
        <Card className="mt-4 p-5 md:p-6">
          <p className="lp-kicker">Prizes</p>
          <p className="mt-2 text-base font-medium text-lp-text md:text-lg">{comp.prizeStructure.summary}</p>
        </Card>
      ) : null}

      <Card className="mt-4 p-5 md:p-6">
        <p className="lp-kicker">Share</p>
        <p className="mt-2 text-sm text-lp-muted">Post this QR at the bar for instant signup.</p>
        <div className="mt-4 flex items-center gap-4">
          <img src={qr} alt="Competition signup QR code" className="h-24 w-24 rounded border border-lp-border bg-lp-bg p-1" />
          <a href={qr} download={`${competitionSlug}-signup-qr.png`} className="text-sm font-semibold text-lp-accent hover:underline">
            Download QR
          </a>
        </div>
      </Card>

      {moreAtVenue.length > 0 ? (
        <Card className="mt-4 space-y-4 p-5 md:p-6">
          <p className="lp-kicker">More at this venue</p>
          <ul className="space-y-3">
            {moreAtVenue.map((nextComp) => (
              <li key={nextComp.id} className="rounded-[10px] border border-lp-border bg-lp-surface/40 px-4 py-3">
                <p className="font-semibold text-lp-text">{nextComp.title}</p>
                <p className="mt-1 text-sm text-lp-muted">
                  {nextComp.kind.replaceAll("_", " ")} · Starts {formatDateTime(nextComp.startAt)} ·{" "}
                  {formatMoney(nextComp.entryFeeCents, nextComp.entryFeeCurrency)}
                </p>
                <Link
                  href={`/c/${venueSlug}/${nextComp.slug}`}
                  className="mt-2 inline-flex text-sm font-semibold text-lp-accent hover:underline"
                >
                  Open signup
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <RegistrationPanel
        competitionId={comp.id}
        venueSlug={venueSlug}
        competitionSlug={competitionSlug}
        teamFormat={comp.teamFormat}
        waiverText={comp.waiverText}
        entryFeeCents={comp.entryFeeCents}
        entryFeeCurrency={comp.entryFeeCurrency}
        signupCloseAt={comp.signupCloseAt}
        competitionStatus={comp.status}
        canRegister={canRegister}
        isLoggedInPlayer={isLoggedInPlayer}
        alreadyRegistered={Boolean(alreadyRegistered)}
        pendingPaymentRegistrationId={pendingPaymentRegistrationId}
        registrationPaymentPresentation={registrationPaymentPresentation}
      />

      <div className="mt-10 flex flex-col gap-3 border-t border-lp-border pt-8 sm:flex-row">
        <Button variant="ghost" className="w-full sm:w-auto" asChild>
          <Link href={`/v/${venueSlug}`}>← {comp.venue.name}</Link>
        </Button>
        <Button variant="ghost" className="w-full sm:w-auto" asChild>
          <Link href="/player/discover">{cta.browseEvents}</Link>
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <Link href="/for-players" className="font-semibold text-lp-accent hover:underline">
          How to join as a player
        </Link>
        <Link href="/features" className="font-semibold text-lp-accent hover:underline">
          LeaguePour competition platform features
        </Link>
      </div>
    </div>
  );
}
