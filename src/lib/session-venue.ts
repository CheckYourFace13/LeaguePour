import type { Session } from "next-auth";

export function primaryVenueAccess(session: Session | null) {
  return session?.venueAccess?.[0] ?? null;
}
