import { auth } from "@/auth";
import { VenueAppShell } from "@/components/app/venue-app-shell";
import { prisma } from "@/lib/db";
import { primaryVenueAccess } from "@/lib/session-venue";
import { resolvePrimaryVenueAccess, venueStaffCanManageStaff } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function VenueLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/venue/dashboard");
  const pv = primaryVenueAccess(session);
  if (!pv) redirect("/signup/venue?reason=venue");
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue?reason=venue");
  const venue = await prisma.venue.findUnique({ where: { id: access.venueId } });
  if (!venue) redirect("/signup/venue");
  return (
    <VenueAppShell
      venueSlug={venue.slug}
      venueName={venue.name}
      staffRole={access.role}
      canManageStaff={venueStaffCanManageStaff(access.role)}
    >
      {children}
    </VenueAppShell>
  );
}
