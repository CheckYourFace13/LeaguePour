import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import { TemplateBreadcrumb, TemplateFooterLinks, templateJsonLd } from "@/components/venuesprocket/template-parts";
import { PrintButton } from "@/components/venuesprocket/tools/print-button";

const URL = "https://venuesprocket.com/templates/run-of-show-template";
const DESCRIPTION =
  "A free run-of-show template for private events at restaurants, bars, and event spaces: a printable timeline with owners for each step, plus a filled-in example for a four-hour party.";

export const metadata: Metadata = {
  title: { absolute: "Run of Show Template for Private Events (Free, Printable) | VenueSprocket" },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { siteName: "VenueSprocket", images: [{ url: "/venuesprocket/opengraph-image", alt: "VenueSprocket - private event management software" }], title: "Run of show template for private events", description: DESCRIPTION, url: URL },
};

type Row = { time: string; what: string; who: string; notes: string };

// Fictional example: a four-hour birthday party in a private room, guests arriving at 6:30 PM.
const example: Row[] = [
  { time: "4:30 PM", what: "Room reset and setup begins", who: "Floor lead", notes: "5 rounds of 8, gift table by the door" },
  { time: "5:30 PM", what: "Bar stocked, glassware polished", who: "Bartender", notes: "Beer, wine, 2 signature cocktails" },
  { time: "6:00 PM", what: "Pre-shift: walk through this sheet", who: "Manager", notes: "Flag the shellfish allergy at table 3" },
  { time: "6:15 PM", what: "Host arrives, confirm final count and timing", who: "Manager", notes: "Ask who cuts the cake" },
  { time: "6:30 PM", what: "Guests arrive, bar opens", who: "Bartender", notes: "" },
  { time: "6:45 PM", what: "Passed appetizers", who: "Kitchen / servers", notes: "Two rounds, 15 minutes apart" },
  { time: "7:30 PM", what: "Dinner served", who: "Kitchen / servers", notes: "Buffet opens table by table" },
  { time: "8:15 PM", what: "Toast", who: "Host", notes: "Mic check at 8:10" },
  { time: "8:30 PM", what: "Cake cut and served", who: "Servers", notes: "Cake is in the walk-in" },
  { time: "10:00 PM", what: "Last call", who: "Bartender", notes: "Tell the host first" },
  { time: "10:30 PM", what: "Event ends, present the final bill", who: "Manager", notes: "Deposit already applied" },
  { time: "11:00 PM", what: "Teardown complete, room back in service", who: "Floor lead", notes: "" },
];

const blank: Row[] = Array.from({ length: 12 }, () => ({ time: "", what: "", who: "", notes: "" }));

function Table({ rows, sample }: { rows: Row[]; sample?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-vs-border-strong print:rounded-none print:border-0">
      <table className="w-full min-w-[34rem] border-collapse text-sm">
        <thead>
          <tr className="bg-vs-surface-2 text-left text-xs font-bold uppercase tracking-wider text-vs-muted">
            <th className="border-b border-vs-border px-3 py-2 w-24">Time</th>
            <th className="border-b border-vs-border px-3 py-2">What happens</th>
            <th className="border-b border-vs-border px-3 py-2 w-36">Owner</th>
            <th className="border-b border-vs-border px-3 py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={sample ? "" : "h-10"}>
              <td className="border-b border-vs-border/70 px-3 py-2 font-semibold text-vs-text">{r.time}</td>
              <td className="border-b border-vs-border/70 px-3 py-2 text-vs-text-soft">{r.what}</td>
              <td className="border-b border-vs-border/70 px-3 py-2 text-vs-text-soft">{r.who}</td>
              <td className="border-b border-vs-border/70 px-3 py-2 text-vs-text-soft">{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RunOfShowTemplatePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(templateJsonLd({ url: URL, name: "Run of show template", headline: "Run of Show Template for Private Events", description: DESCRIPTION })),
        }}
      />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <TemplateBreadcrumb label="Run of show template" />
          <p className="vs-kicker mb-3 print:hidden">Free template · no email required</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-5">Run of show template</h1>
          <p className="mb-10 max-w-3xl text-lg leading-relaxed text-vs-text-soft print:hidden">
            A run of show is the event&apos;s timeline: what happens, when, and who owns it. It&apos;s the
            page your manager reads out at pre-shift and the one the host asks about most. Print the
            blank version, or start from the example and change the times.
          </p>

          <section className="mb-12">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-vs-text">Blank run of show</h2>
              <PrintButton />
            </div>
            <div className="mb-4 grid gap-3 text-sm text-vs-text-soft sm:grid-cols-2">
              {["Event", "Date", "Room / area", "Guest count", "Host and phone", "Manager on duty"].map((f) => (
                <div key={f} className="flex items-end gap-2">
                  <span className="shrink-0 font-semibold text-vs-text">{f}:</span>
                  <span className="h-5 flex-1 border-b border-vs-border-strong" />
                </div>
              ))}
            </div>
            <Table rows={blank} />
          </section>

          <section className="mb-12 print:hidden">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-3">Example: four-hour birthday party</h2>
            <p className="mb-4 text-sm leading-relaxed text-vs-text-soft">
              A fictional party of 40 in a private room, guests arriving at 6:30 PM. Notice that the
              sheet starts two hours before the first guest and ends after the last one leaves.
            </p>
            <Table rows={example} sample />
          </section>

          <section className="mb-4 max-w-3xl print:hidden">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-3">What makes a run of show work</h2>
            <ul className="space-y-3 leading-relaxed text-vs-text-soft">
              <li><strong className="text-vs-text">Work backward from guest arrival.</strong> Setup, bar stocking, and pre-shift each need a start time, not just &ldquo;before the event.&rdquo;</li>
              <li><strong className="text-vs-text">One owner per line.</strong> &ldquo;Staff&rdquo; means nobody. Name a role for every step, even the obvious ones.</li>
              <li><strong className="text-vs-text">Include the moments the host cares about.</strong> Toast, cake, a slideshow, a surprise entrance - confirm the times with the host when they arrive.</li>
              <li><strong className="text-vs-text">Write down last call and the hard end time.</strong> Tell the host about last call before you announce it to the room.</li>
              <li><strong className="text-vs-text">End with teardown.</strong> If the room goes back into service or another party follows, that time belongs on the sheet.</li>
            </ul>
            <p className="mt-6 leading-relaxed text-vs-text-soft">
              The run of show is the timeline section of a Banquet Event Order. If you want the rest of
              the document - menu, bar, setup, staffing, allergies - use the{" "}
              <Link href="/guides/beo-template" className="text-vs-accent hover:underline">BEO template</Link>.
              In VenueSprocket, the BEO includes a timeline section and a print-ready view.
            </p>
          </section>

          <TemplateFooterLinks />
        </div>
      </div>
    </>
  );
}
