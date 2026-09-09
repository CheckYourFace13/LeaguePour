import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { BeoPrintButton } from "@/components/venuesprocket/beo-print-button";

// Deliberately its own top-level route, NOT under src/app/app/** - every route under /app/**
// shares the VenueSprocket dashboard shell (sidebar nav etc.), which is wrong for a print-ready
// document. The previous location (src/app/app/beos/[id]/print) inherited that shell AND
// rendered its own nested <html>/<head>/<body> from inside it, which is invalid in the App
// Router (only the root layout may render those) - combined with an onClick handler placed
// directly in a Server Component, every real request to it threw a hard server error. Found via
// whole-business audit (production-tested, not just code review).
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const beo = await prisma.vsBeo.findFirst({
    where: { id },
    select: { privateEvent: { select: { eventName: true } } },
  });
  return {
    title: { absolute: beo ? `BEO — ${beo.privateEvent.eventName}` : "BEO" },
    robots: { index: false, follow: false },
  };
}

export default async function BeoPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const beo = await prisma.vsBeo.findFirst({
    where: { id, privateEvent: { venueId: access.venueId } },
    include: {
      privateEvent: {
        include: {
          lead: true,
          vsCustomer: true,
          eventSpace: true,
          venue: { select: { name: true } },
        },
      },
    },
  });
  if (!beo) notFound();

  const event = beo.privateEvent;
  const contact = beo.contactInfo as { name?: string; email?: string; phone?: string } | null;

  function Row({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
      <tr>
        <td className="pr-4 py-1.5 text-xs font-bold uppercase text-gray-500 whitespace-nowrap w-40 align-top">{label}</td>
        <td className="py-1.5 text-sm text-gray-800 whitespace-pre-wrap">{value}</td>
      </tr>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", color: "#111", background: "#fff", padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <style>{`
        @media print { .no-print { display: none !important; } }
        h1 { font-size: 1.5rem; font-weight: 800; margin: 0 0 0.25rem; }
        h2 { font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 0.25rem; margin: 1.5rem 0 0.75rem; }
        table { width: 100%; border-collapse: collapse; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem; }
        .grid2 .item label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; color: #888; }
        .grid2 .item p { font-size: 0.875rem; font-weight: 600; margin: 0; }
        .badge { display: inline-block; background: #e8f5e9; color: #1a5f3f; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 999px; }
      `}</style>

      <div className="no-print" style={{ marginBottom: "1rem" }}>
        <BeoPrintButton />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: "0.75rem", color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {event.venue.name}
          </p>
          <h1>{event.eventName}</h1>
          <p style={{ color: "#555", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
            Banquet Event Order
          </p>
        </div>
        <span className="badge">{beo.status}</span>
      </div>

      <h2>Event details</h2>
      <div className="grid2">
        <div className="item"><label>Date</label><p>{event.eventDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p></div>
        <div className="item"><label>Time</label><p>{event.startTime} – {event.endTime}</p></div>
        <div className="item"><label>Event type</label><p>{event.eventType.replace(/_/g, " ")}</p></div>
        <div className="item"><label>Est. guests</label><p>{event.guestCountEstimated ?? "TBD"}</p></div>
        {event.setupTime && <div className="item"><label>Setup time</label><p>{event.setupTime}</p></div>}
        {event.eventSpace && <div className="item"><label>Room</label><p>{event.eventSpace.name}</p></div>}
      </div>

      <h2>Contact</h2>
      <table>
        <tbody>
          <Row label="Name" value={contact?.name} />
          <Row label="Email" value={contact?.email} />
          <Row label="Phone" value={contact?.phone} />
        </tbody>
      </table>

      <h2>Food & beverage</h2>
      <table>
        <tbody>
          <Row label="Food" value={beo.foodDetails} />
          <Row label="Beverage" value={beo.beverageDetails} />
          <Row label="Allergies" value={beo.allergies} />
        </tbody>
      </table>

      <h2>Setup & logistics</h2>
      <table>
        <tbody>
          <Row label="Room setup" value={beo.roomSetup} />
          <Row label="Staffing" value={beo.staffingNotes} />
          <Row label="AV / tech" value={beo.avNeeds} />
        </tbody>
      </table>

      {(beo.specialInstructions || beo.internalNotes) && (
        <>
          <h2>Notes</h2>
          <table>
            <tbody>
              <Row label="Special instructions" value={beo.specialInstructions} />
              <Row label="Internal notes" value={beo.internalNotes} />
            </tbody>
          </table>
        </>
      )}

      <p style={{ marginTop: "2rem", fontSize: "0.7rem", color: "#aaa" }}>
        Generated by VenueSprocket · {new Date().toLocaleString()}
        {beo.finalizedAt && ` · Finalized ${beo.finalizedAt.toLocaleString()}`}
      </p>
    </div>
  );
}
