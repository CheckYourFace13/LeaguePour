import { prisma } from "@/lib/db";
import { getPublicSiteUrl } from "@/lib/site-url";
import { buildIcsCalendar, fileStem } from "@/lib/integrations/ics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public "Add to calendar" file for a LeaguePour competition. Only data already on the public
 * signup page (title, dates, venue, link). Drafts, archived events and disabled venues 404.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ venueSlug: string; competitionSlug: string }> },
) {
  const { venueSlug, competitionSlug } = await params;
  const comp = await prisma.competition.findFirst({
    where: {
      slug: competitionSlug,
      venue: { slug: venueSlug, isDisabled: false },
      status: { notIn: ["DRAFT", "ARCHIVED"] },
    },
    select: {
      id: true,
      title: true,
      startAt: true,
      endAt: true,
      recurringRule: true,
      updatedAt: true,
      venue: { select: { name: true, addressLine1: true, city: true, state: true } },
    },
  });
  if (!comp) return new Response("Not found", { status: 404 });

  const url = `${getPublicSiteUrl()}/c/${venueSlug}/${competitionSlug}`;
  const location = [comp.venue.name, comp.venue.addressLine1, [comp.venue.city, comp.venue.state].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join(", ");
  const end = comp.endAt > comp.startAt ? comp.endAt : new Date(comp.startAt.getTime() + 3 * 3600_000);
  const description = [
    comp.recurringRule ? `Schedule: ${comp.recurringRule}` : null,
    `Details and signup: ${url}`,
  ]
    .filter(Boolean)
    .join("\n");

  const ics = buildIcsCalendar({
    prodId: "-//LeaguePour//Competitions//EN",
    name: comp.title,
    events: [
      {
        uid: `lp-competition-${comp.id}@leaguepour.com`,
        summary: `${comp.title} at ${comp.venue.name}`,
        description,
        location,
        url,
        start: comp.startAt,
        end,
        lastModified: comp.updatedAt,
      },
    ],
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileStem(comp.title)}.ics"`,
      "Cache-Control": "public, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  });
}
