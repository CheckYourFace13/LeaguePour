import { auth } from "@/auth";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { buildVenueCalendar } from "@/lib/integrations/vs-calendar";
import { fileStem } from "@/lib/integrations/ics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One private event as an .ics file ("Add to calendar") for the signed-in venue's staff. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await resolvePrimaryVenueAccess(await auth());
  if (!access) return new Response("Unauthorized", { status: 401 });

  const cal = await buildVenueCalendar(access.venueId, { eventId: id });
  if (!cal || cal.count === 0) return new Response("Not found", { status: 404 });

  return new Response(cal.ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileStem(`event-${id}`)}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
