import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { VsAppShell } from "@/components/venuesprocket/vs-app-shell";

export const dynamic = "force-dynamic";
export const metadata = {
  // Absolute, not a plain string: without this every /app/* page (this whole VS dashboard)
  // inherited the root layout's default title verbatim ("LeaguePour | Venue Competitions & Entry
  // Fees") since none of these pages set their own - found via whole-business audit, live on
  // /app/dashboard, /app/settings, etc. A page under here can still set a more specific title via
  // its own generateMetadata/metadata export; this is just the non-LP-branded fallback.
  title: { absolute: "VenueSprocket" },
  robots: { index: false, follow: false },
};

export default async function VsAppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/app/dashboard");

  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue?reason=vs");

  const venue = await prisma.venue.findUnique({
    where: { id: access.venueId },
    select: { name: true, slug: true },
  });
  if (!venue) redirect("/signup/venue");

  // Ensure VenueVsConfig exists
  await prisma.venueVsConfig.upsert({
    where: { venueId: access.venueId },
    create: { venueId: access.venueId },
    update: {},
  });

  return (
    <VsAppShell venueName={venue.name}>
      {children}
    </VsAppShell>
  );
}
