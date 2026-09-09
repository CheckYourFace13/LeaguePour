import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { VS_HOST } from "@/lib/vs-routing";
import InquirePageClient from "./inquiry-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const venue = await prisma.venue.findUnique({
    where: { slug, isDisabled: false },
    select: { name: true, city: true, state: true },
  });
  if (!venue) return {};
  return {
    // Absolute, not a plain string: the root layout's title template ("%s | LeaguePour") would
    // otherwise apply here too, so a VenueSprocket private-event inquiry page's browser tab said
    // "...| LeaguePour" - found via whole-business audit, on the exact page a VS venue's own
    // customers land on.
    title: { absolute: `Book a Private Event at ${venue.name}` },
    description: `Submit a private event inquiry to ${venue.name}${venue.city ? ` in ${venue.city}` : ""}. Birthday parties, corporate events, holiday parties, and more.`,
    robots: { index: true, follow: true },
    // getPublicSiteUrl() always resolves to leaguepour.com regardless of which host actually
    // served the request - this page is always VenueSprocket-branded content ("Powered by
    // VenueSprocket" in the footer), so its canonical must point at venuesprocket.com, not
    // whichever domain the visitor happened to arrive from.
    alternates: { canonical: `https://${VS_HOST}/v/${slug}/inquire` },
  };
}

export default async function InquireServerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const venue = await prisma.venue.findUnique({
    where: { slug, isDisabled: false },
    select: { id: true, name: true, city: true, state: true },
  });
  if (!venue) notFound();

  return (
    <InquirePageClient
      venueId={venue.id}
      venueName={venue.name}
      venueCity={venue.city}
    />
  );
}
