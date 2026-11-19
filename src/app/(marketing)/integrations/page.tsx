import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { absolute: "Integrations | LeaguePour" },
  description:
    "What LeaguePour connects to today: Stripe entry fees, QR signup, TV scoreboards, website embeds, calendar files and CSV exports. Plus what's planned, clearly labelled.",
  alternates: { canonical: "/integrations" },
  openGraph: {
    siteName: "LeaguePour",
    title: "LeaguePour integrations",
    description: "Working integrations and export options for venue leagues and tournaments.",
    url: "/integrations",
    images: [{ url: "/opengraph-image", alt: "LeaguePour - venue competition software for bars" }],
  },
};

type Item = { name: string; body: string; where?: string };

const working: Item[] = [
  {
    name: "Stripe (entry fees and payouts)",
    body: "Players pay entry fees through Stripe Checkout; money goes to the venue's own Stripe account through Stripe Connect. Registrations are confirmed from Stripe's payment notifications.",
    where: "Venue profile → Stripe Connect",
  },
  {
    name: "QR code signup",
    body: "Every competition has a signup QR code to print for tables, the bar or posters. Players scan with their phone camera. No app to download.",
    where: "Competition page → Share & display",
  },
  {
    name: "TV scoreboard (any smart TV or streaming-stick browser)",
    body: "A big-screen standings and results page that refreshes every 30 seconds and shows the signup QR. Open the TV link in the TV's browser, or cast a laptop tab.",
    where: "Competition page → Share & display → TV scoreboard",
  },
  {
    name: "Website embed",
    body: "Paste one snippet into WordPress, Squarespace, Wix or any site builder to list your upcoming competitions with signup links.",
    where: "Venue dashboard → Embed your events on your website",
  },
  {
    name: "Calendar files (Google, Apple, Outlook)",
    body: "Each public competition page has an Add to calendar link, so players can save the date in the calendar they already use.",
    where: "Public competition page",
  },
  {
    name: "CSV export (Excel, Google Sheets)",
    body: "Download registrations (with payment status), standings and match results for your records, payouts or end-of-season awards.",
    where: "Competition page → Share & display → Export CSV",
  },
  {
    name: "Email",
    body: "Signup confirmations and venue campaigns are sent by LeaguePour to players who opted in. No separate email tool is needed.",
  },
];

const notYet: Item[] = [
  {
    name: "POS systems (Toast, Square, Clover)",
    body: "Not connected. Each POS requires a partner review before any app can read or write venue data. If linking tabs or tracking league-night sales would help you, tell us which POS you use. Demand decides which one we apply for first.",
  },
  {
    name: "Zapier app",
    body: "Not listed in Zapier's app directory yet. For now, use the CSV exports.",
  },
  {
    name: "Live calendar subscription for players",
    body: "Players can add a single competition to their calendar today; an always-updating league schedule feed is planned.",
  },
];

export default function LeaguePourIntegrationsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <p className="lp-kicker">Integrations</p>
      <h1 className="lp-page-title mt-3 text-4xl md:text-5xl">Works with the tools your bar already uses</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-lp-muted">
        Everything in the first list works today. Anything not built yet is listed separately and marked as not
        available. We don&apos;t show partner logos or claim partnerships we don&apos;t have.
      </p>

      <section aria-labelledby="working" className="mt-12">
        <h2 id="working" className="font-display text-2xl font-bold text-lp-text">
          Working today
        </h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {working.map((i) => (
            <li key={i.name} className="rounded-2xl border border-lp-border bg-lp-surface/50 p-5">
              <p className="flex items-center gap-2 font-semibold text-lp-text">
                <span aria-hidden className="text-lp-accent">✓</span>
                {i.name}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-lp-muted">{i.body}</p>
              {i.where ? <p className="mt-2 text-xs font-semibold text-lp-muted">Where: {i.where}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="planned" className="mt-14">
        <h2 id="planned" className="font-display text-2xl font-bold text-lp-text">
          Not available yet
        </h2>
        <p className="mt-2 text-sm text-lp-muted">Not built or not approved. Please don&apos;t plan around these yet.</p>
        <ul className="mt-5 space-y-3">
          {notYet.map((i) => (
            <li key={i.name} className="rounded-2xl border border-dashed border-lp-border p-5">
              <p className="font-semibold text-lp-text">
                {i.name} <span className="ml-2 rounded-full bg-lp-surface px-2 py-0.5 text-xs font-semibold text-lp-muted">Not available</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-lp-muted">{i.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-lp-muted">
          Want one of these? <Link href="/contact" className="font-semibold text-lp-accent hover:underline">Tell us what you use</Link>.
        </p>
      </section>

      <section aria-labelledby="private-events" className="mt-14 rounded-2xl border border-lp-border bg-lp-surface/40 p-6">
        <h2 id="private-events" className="font-display text-xl font-bold text-lp-text">
          Also booking private events?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-lp-muted">
          VenueSprocket is our separate product for private-event inquiries, proposals, contracts and deposits. It has
          its own plans, uses the same venue login, and offers calendar sync, CSV exports and a webhook for new inquiries.
        </p>
        <a
          href="https://venuesprocket.com/integrations"
          className="mt-3 inline-flex text-sm font-semibold text-lp-accent hover:underline"
        >
          See VenueSprocket integrations ↗
        </a>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/signup/venue">Create a venue account</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/pricing">See pricing</Link>
        </Button>
      </div>
    </div>
  );
}
