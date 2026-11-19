import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { csvResponse, toCsv, ymd } from "@/lib/integrations/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMIT = 10_000;

/**
 * CSV exports of the signed-in venue's own VenueSprocket data (leads, customers, events), for
 * spreadsheets, accounting or moving into another CRM. Owners and managers only, because the
 * files contain guest contact details. Always scoped to the caller's venue.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const access = await resolvePrimaryVenueAccess(await auth());
  if (!access) return new Response("Unauthorized", { status: 401 });
  if (!venueStaffCanCreateAndPublish(access.role)) {
    return new Response("Only owners and managers can export data.", { status: 403 });
  }
  const venueId = access.venueId;
  const stamp = new Date().toISOString().slice(0, 10);

  if (kind === "leads") {
    const rows = await prisma.privateEventLead.findMany({
      where: { venueId },
      orderBy: { createdAt: "desc" },
      take: LIMIT,
    });
    return csvResponse(
      `venuesprocket-leads-${stamp}.csv`,
      toCsv(
        ["Received", "Status", "Name", "Email", "Phone", "Event type", "Preferred date", "Guests", "Budget", "Source", "Notes", "Lead ID"],
        rows.map((l) => [
          l.createdAt,
          l.status,
          l.customerName,
          l.customerEmail,
          l.customerPhone,
          l.eventType,
          ymd(l.preferredDate),
          l.guestCount,
          l.budgetRange,
          l.source,
          l.notes,
          l.id,
        ]),
      ),
    );
  }

  if (kind === "customers") {
    const rows = await prisma.vsCustomer.findMany({
      where: { venueId },
      orderBy: { createdAt: "desc" },
      take: LIMIT,
      include: { _count: { select: { privateEvents: true } } },
    });
    return csvResponse(
      `venuesprocket-customers-${stamp}.csv`,
      toCsv(
        ["Name", "Email", "Phone", "Company", "Tags", "Marketing opt-in", "Events", "Source", "Notes", "Created", "Customer ID"],
        rows.map((c) => [
          c.name,
          c.email,
          c.phone,
          c.company,
          c.tags.join("; "),
          c.marketingOptIn ? "yes" : "no",
          c._count.privateEvents,
          c.source,
          c.notes,
          c.createdAt,
          c.id,
        ]),
      ),
    );
  }

  if (kind === "events") {
    const rows = await prisma.privateEvent.findMany({
      where: { venueId },
      orderBy: { eventDate: "desc" },
      take: LIMIT,
      include: {
        eventSpace: { select: { name: true } },
        lead: { select: { customerName: true, customerEmail: true } },
        vsCustomer: { select: { name: true, email: true } },
        proposals: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, totalAmount: true } },
      },
    });
    return csvResponse(
      `venuesprocket-events-${stamp}.csv`,
      toCsv(
        ["Date", "Start", "End", "Event", "Type", "Status", "Space", "Guests (est.)", "Guests (final)", "Host", "Host email", "Latest proposal", "Proposal total", "Event ID"],
        rows.map((e) => [
          ymd(e.eventDate),
          e.startTime,
          e.endTime,
          e.eventName,
          e.eventType,
          e.status,
          e.eventSpace?.name,
          e.guestCountEstimated,
          e.guestCountFinal,
          e.lead?.customerName ?? e.vsCustomer?.name,
          e.lead?.customerEmail ?? e.vsCustomer?.email,
          e.proposals[0]?.status,
          e.proposals[0]?.totalAmount != null ? (e.proposals[0].totalAmount / 100).toFixed(2) : "",
          e.id,
        ]),
      ),
    );
  }

  return new Response("Not found", { status: 404 });
}
