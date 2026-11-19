import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Integrations | VenueSprocket" },
  description:
    "What VenueSprocket connects to today: website inquiry form, Google/Outlook/Apple calendar sync, Stripe deposits, CSV export and signed webhooks for Zapier, Make or your CRM. POS integrations are clearly marked as not available yet.",
  alternates: { canonical: "https://venuesprocket.com/integrations" },
};

type Item = { name: string; body: string; where?: string };

const working: Item[] = [
  {
    name: "Inquiry form on your website",
    body: "Embed the inquiry form directly on your own page, or add a “Check availability” button. Works with WordPress, Squarespace, Wix and most site builders. Website inquiries are labelled so you can see which channel brings bookings.",
    where: "Settings → Option 1 / Option 2 under your public inquiry page",
  },
  {
    name: "Google Calendar, Outlook and Apple Calendar",
    body: "Subscribe to a private calendar link and your private events show up in your team's calendar, with holds, confirmed and cancelled events clearly marked. Refresh timing is set by each calendar app (Google: usually within 8–24 hours; Outlook: every few hours). One-way, from VenueSprocket to your calendar. Single events can also be downloaded as .ics files.",
    where: "Settings → Calendar sync",
  },
  {
    name: "Stripe deposits",
    body: "Guests pay deposits by card through Stripe Checkout, paid to your own connected Stripe account. Deposit status updates automatically when Stripe confirms payment.",
    where: "Event → Proposal → Deposit (Pro plan)",
  },
  {
    name: "Webhooks (Zapier, Make, n8n, your CRM)",
    body: "Send every new inquiry, as it arrives, to any HTTPS endpoint, such as a Zapier “Catch Hook”, a Make or n8n scenario, a CRM, Slack via automation, or your own server. Requests are signed. Note that Zapier's webhook trigger requires a paid Zapier plan.",
    where: "Settings → Webhook for new inquiries",
  },
  {
    name: "CSV export (Excel, Google Sheets, other CRMs)",
    body: "Download your leads, customers and events at any time. Your data stays yours.",
    where: "Settings → Export your data",
  },
  {
    name: "Email from your own inbox",
    body: "Reply templates (date available, need details, date unavailable) open as prefilled drafts in your own email app, so replies come from your real address.",
    where: "Leads → open a lead → Reply by email",
  },
];

const notYet: Item[] = [
  {
    name: "Toast POS",
    body: "Not connected. Toast requires an approved partner integration before any app can access restaurant data. We are preparing an application; nothing is live and no partnership exists today.",
  },
  {
    name: "Square and Clover",
    body: "Not connected. Both require an app review before an integration can be offered to venues. Tell us if you use one of them, since demand decides the order.",
  },
  {
    name: "Two-way Google or Outlook calendar sync",
    body: "Not available. Today's calendar sync is one-way (VenueSprocket → your calendar), which avoids double-booking from edits that can't be traced.",
  },
  {
    name: "Zapier app directory listing",
    body: "Not listed yet. The webhook above works with Zapier today, through Zapier's own Webhooks trigger.",
  },
];

const samplePayload = `{
  "id": "evt_7d0c5c1e-...",
  "type": "lead.created",
  "created_at": "2026-11-20T18:04:11.000Z",
  "data": {
    "lead": {
      "id": "cm...",
      "status": "NEW",
      "source": "website_embed",
      "event_type": "BIRTHDAY",
      "preferred_date": "2026-12-12",
      "guest_count": 40,
      "budget_range": "$1,000 – $2,500",
      "customer_name": "Sample Guest",
      "customer_email": "guest@example.com",
      "customer_phone": null,
      "notes": "Back room if possible",
      "created_at": "2026-11-20T18:04:10.000Z",
      "dashboard_url": "https://leaguepour.com/app/leads/cm..."
    }
  }
}`;

const verifySample = `// Node.js: verify a VenueSprocket webhook
import { createHmac, timingSafeEqual } from "node:crypto";

function verify(rawBody, header, secret) {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const expected = createHmac("sha256", secret).update(parts.t + "." + rawBody).digest("hex");
  const fresh = Math.abs(Date.now() / 1000 - Number(parts.t)) < 300; // reject replays > 5 min
  return fresh && timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
}`;

export default function VsIntegrationsPage() {
  return (
    <div className="vs-section px-4 md:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-vs-muted">Integrations</p>
          <h1 className="vs-page-title mt-3 text-4xl md:text-5xl">Fits into the way your venue already works</h1>
          <p className="vs-page-sub mx-auto mt-4 max-w-2xl text-center">
            Everything under &ldquo;Working today&rdquo; is live. Anything not built or approved is listed separately and
            marked. We don&apos;t show partner logos or claim partnerships we don&apos;t have.
          </p>
        </div>

        <section aria-labelledby="working">
          <h2 id="working" className="font-display text-2xl font-bold text-vs-text">Working today</h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {working.map((i) => (
              <li key={i.name} className="rounded-2xl border border-vs-border bg-vs-surface p-5">
                <p className="flex items-center gap-2 font-semibold text-vs-text">
                  <span aria-hidden className="text-vs-accent">✓</span>
                  {i.name}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-vs-text-soft">{i.body}</p>
                {i.where ? <p className="mt-2 text-xs font-semibold text-vs-muted">Where: {i.where}</p> : null}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="planned" className="mt-14">
          <h2 id="planned" className="font-display text-2xl font-bold text-vs-text">Not available yet</h2>
          <p className="mt-2 text-sm text-vs-muted">Not built or not approved. Please don&apos;t plan around these yet.</p>
          <ul className="mt-5 space-y-3">
            {notYet.map((i) => (
              <li key={i.name} className="rounded-2xl border border-dashed border-vs-border p-5">
                <p className="font-semibold text-vs-text">
                  {i.name}{" "}
                  <span className="ml-2 rounded-full bg-vs-surface-2 px-2 py-0.5 text-xs font-semibold text-vs-muted">
                    Not available
                  </span>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-vs-text-soft">{i.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-vs-muted">
            Using a POS or tool we don&apos;t support?{" "}
            <Link href="/contact" className="font-semibold text-vs-accent hover:underline">
              Tell us which one
            </Link>
            .
          </p>
        </section>

        <section id="webhooks" aria-labelledby="webhooks-title" className="mt-14 scroll-mt-24 rounded-2xl border border-vs-border bg-vs-surface p-6">
          <h2 id="webhooks-title" className="font-display text-2xl font-bold text-vs-text">Webhook reference</h2>
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-vs-text-soft">
            <li>
              <span className="font-semibold">Events:</span> <code>lead.created</code> (each new inquiry) and{" "}
              <code>webhook.test</code> (the Send test event button).
            </li>
            <li>
              <span className="font-semibold">Request:</span> <code>POST</code>, JSON body, HTTPS only, standard port. Your
              endpoint should answer with any 2xx status within 5 seconds.
            </li>
            <li>
              <span className="font-semibold">Retries:</span> one retry after a timeout, a 5xx or a 429 response. Use the{" "}
              <code>id</code> field to ignore duplicates.
            </li>
            <li>
              <span className="font-semibold">Headers:</span> <code>VenueSprocket-Event</code> and{" "}
              <code>VenueSprocket-Signature: t=&lt;unix seconds&gt;,v1=&lt;hex&gt;</code>, where <code>v1</code> is the
              HMAC-SHA256 of <code>t + &quot;.&quot; + raw body</code> using your signing secret.
            </li>
            <li>
              <span className="font-semibold">Privacy:</span> the payload contains the guest&apos;s contact details. Only point
              it at systems you control and are allowed to store guest data in.
            </li>
          </ul>
          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-vs-muted">Sample payload (fictional data)</p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-vs-bg px-4 py-3 text-xs leading-relaxed text-vs-text-soft">
            {samplePayload}
          </pre>
          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-vs-muted">Verifying the signature</p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-vs-bg px-4 py-3 text-xs leading-relaxed text-vs-text-soft">
            {verifySample}
          </pre>
        </section>

        <section className="mt-14 rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-6">
          <h2 className="font-display text-xl font-bold text-vs-text">Also running leagues, trivia or tournaments?</h2>
          <p className="mt-2 text-sm leading-relaxed text-vs-text-soft">
            LeaguePour is our separate product for public competitions, with QR signup, entry fees and a TV scoreboard.
            Same venue login, separate plan.
          </p>
          <Link href="/leaguepour" className="mt-3 inline-flex text-sm font-semibold text-vs-accent hover:underline">
            About LeaguePour →
          </Link>
        </section>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link
            href="/start"
            className="inline-flex min-h-12 items-center rounded-xl bg-vs-accent px-6 font-bold text-white hover:bg-vs-accent-hover"
          >
            Get started
          </Link>
          <Link
            href="/pricing"
            className="inline-flex min-h-12 items-center rounded-xl border border-vs-border-strong px-6 font-semibold text-vs-text"
          >
            See pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
