import { verifyCalendarToken } from "@/lib/integrations/calendar-token";
import { buildVenueCalendar } from "@/lib/integrations/vs-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Private iCalendar feed for a VenueSprocket venue, subscribed from Google Calendar, Outlook or
 * Apple Calendar. The secret token in the URL is the only credential (calendar apps can't sign
 * in); owners can reset it from /app/settings, which makes every old URL return 404.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const token = file.replace(/\.ics$/i, "");
  const venueId = await verifyCalendarToken(token);
  if (!venueId) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

  const cal = await buildVenueCalendar(venueId);
  if (!cal) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

  return new Response(cal.ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="venuesprocket-events.ics"',
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
    },
  });
}
