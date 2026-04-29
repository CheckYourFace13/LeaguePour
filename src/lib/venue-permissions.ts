import type { Session } from "next-auth";
import { prisma } from "@/lib/db";
import { primaryVenueAccess } from "@/lib/session-venue";

/** Venue + role from the database (avoids JWT role drift for server actions and RSC). */
export async function resolvePrimaryVenueAccess(session: Session | null) {
  const pv = primaryVenueAccess(session);
  if (!pv || !session?.user?.id) return null;
  const row = await prisma.venueStaff.findUnique({
    where: { venueId_userId: { venueId: pv.venueId, userId: session.user.id } },
    select: { role: true },
  });
  if (!row) return null;
  return { venueId: pv.venueId, slug: pv.slug, role: row.role };
}

export {
  venueRoleLabel,
  venueStaffCanAssignOwner,
  venueStaffCanAssignRole,
  venueStaffCanCreateAndPublish,
  venueStaffCanEditCompetitionResults,
  venueStaffCanManageStaff,
} from "./venue-access-policy";
