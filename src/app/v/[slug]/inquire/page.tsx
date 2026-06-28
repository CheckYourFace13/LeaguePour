import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
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
    title: `Book a Private Event at ${venue.name}`,
    description: `Submit a private event inquiry to ${venue.name}${venue.city ? ` in ${venue.city}` : ""}. Birthday parties, corporate events, holiday parties, and more.`,
    robots: { index: true, follow: true },
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
