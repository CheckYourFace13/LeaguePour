/**
 * VenueSprocket private-event calendar: one builder shared by the subscription feed
 * (/api/vs-calendar/<token>.ics) and the single-event download (/app/events/<id>/calendar).
 *
 * Deliberately minimal personal data: the guest's name appears (staff need to know whose party it
 * is) but never their email or phone, because a subscribed calendar URL can be forwarded.
 */
import { prisma } from "@/lib/db";
import { buildIcsCalendar, eventTiming, type IcsEvent } from "@/lib/integrations/ics";

const STATUS_LABEL: Record<string, string> = {
  INQUIRY: "Inquiry",
  PROPOSAL_OUT: "Proposal sent",
  CONTRACT_OUT: "Contract sent",
  DEPOSIT_DUE: "Deposit due",
  CONFIRMED: "Confirmed",
  BEO_DRAFT: "Confirmed (BEO draft)",
  BEO_FINAL: "Confirmed (BEO final)",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const CONFIRMED_STATUSES = new Set(["CONFIRMED", "BEO_DRAFT", "BEO_FINAL", "IN_PROGRESS", "COMPLETED"]);

function appOrigin(): string {
  return (process.env.NEXTAUTH_URL ?? "https://leaguepour.com").replace(/\/$/, "");
}

export async function buildVenueCalendar(
  venueId: string,
  opts: { eventId?: string; now?: Date } = {},
): Promise<{ ics: string; venueName: string; count: number } | null> {
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { name: true, addressLine1: true, city: true, state: true, vsConfig: { select: { timezone: true } } },
  });
  if (!venue) return null;
  const tz = venue.vsConfig?.timezone || "America/Chicago";
  const now = opts.now ?? new Date();
  const from = new Date(now.getTime() - 90 * 86400_000);
  const until = new Date(now.getTime() + 548 * 86400_000);

  const events = await prisma.privateEvent.findMany({
    where: opts.eventId
      ? { id: opts.eventId, venueId }
      : { venueId, eventDate: { gte: from, lte: until } },
    orderBy: { eventDate: "asc" },
    take: 1000,
    select: {
      id: true,
      eventName: true,
      eventDate: true,
      startTime: true,
      endTime: true,
      status: true,
      guestCountEstimated: true,
      guestCountFinal: true,
      updatedAt: true,
      eventSpace: { select: { name: true } },
      lead: { select: { customerName: true } },
      vsCustomer: { select: { name: true } },
    },
  });

  const location = [venue.name, venue.addressLine1, [venue.city, venue.state].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join(", ");

  const icsEvents: IcsEvent[] = events.map((e) => {
    const ymd = e.eventDate.toISOString().slice(0, 10);
    const guests = e.guestCountFinal ?? e.guestCountEstimated;
    const who = e.lead?.customerName ?? e.vsCustomer?.name;
    const url = `${appOrigin()}/app/events/${e.id}`;
    const description = [
      `Status: ${STATUS_LABEL[e.status] ?? e.status}`,
      who ? `Host: ${who}` : null,
      guests ? `Guests: ${guests}` : null,
      e.eventSpace?.name ? `Space: ${e.eventSpace.name}` : null,
      `Open in VenueSprocket: ${url}`,
    ]
      .filter(Boolean)
      .join("\n");
    const prefix = e.status === "CANCELLED" ? "Cancelled: " : CONFIRMED_STATUSES.has(e.status) ? "" : "Hold: ";
    return {
      uid: `vs-event-${e.id}@venuesprocket.com`,
      summary: `${prefix}${e.eventName}${e.eventSpace?.name ? ` (${e.eventSpace.name})` : ""}`,
      description,
      location,
      url,
      status: e.status === "CANCELLED" ? "CANCELLED" : CONFIRMED_STATUSES.has(e.status) ? "CONFIRMED" : "TENTATIVE",
      lastModified: e.updatedAt,
      ...eventTiming(ymd, e.startTime, e.endTime, tz),
    };
  });

  return {
    ics: buildIcsCalendar({
      prodId: "-//VenueSprocket//Private Events//EN",
      name: `${venue.name} private events`,
      events: icsEvents,
      refreshHours: 1,
      now,
    }),
    venueName: venue.name,
    count: icsEvents.length,
  };
}
