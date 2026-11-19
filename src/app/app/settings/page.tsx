import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { VS_HOST } from "@/lib/vs-routing";
import { calendarTokenFor, resetCalendarToken } from "@/lib/integrations/calendar-token";
import {
  deleteWebhookConfig,
  deliverWebhook,
  getWebhookConfig,
  saveWebhookConfig,
  validateWebhookUrl,
} from "@/lib/integrations/webhooks";
import { CopyField } from "@/components/venuesprocket/copy-field";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { InquiryButtonSnippet } from "@/components/venuesprocket/inquiry-button-snippet";
import { VsBillingPanel } from "@/components/venuesprocket/vs-billing-panel";

async function saveVsSettings(formData: FormData) {
  "use server";
  const session = await auth();
  const { resolvePrimaryVenueAccess } = await import("@/lib/venue-permissions");
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) return;

  // Blank or invalid keeps the 25% default; an explicit 0 means "no deposit by default".
  const rawPct = String(formData.get("defaultDepositPct") ?? "").trim();
  const parsedPct = Number(rawPct);
  const depositPct = rawPct === "" || !Number.isFinite(parsedPct) ? 25 : Math.min(100, Math.max(0, Math.round(parsedPct)));

  await prisma.venueVsConfig.upsert({
    where: { venueId: access.venueId },
    create: {
      venueId: access.venueId,
      publicEmail: String(formData.get("publicEmail") || "") || null,
      publicPhone: String(formData.get("publicPhone") || "") || null,
      defaultDepositPct: depositPct,
      contractTemplate: String(formData.get("contractTemplate") || "") || null,
    },
    update: {
      publicEmail: String(formData.get("publicEmail") || "") || null,
      publicPhone: String(formData.get("publicPhone") || "") || null,
      defaultDepositPct: depositPct,
      contractTemplate: String(formData.get("contractTemplate") || "") || null,
    },
  });

  revalidatePath("/app/settings");
}

async function requireIntegrationAdmin() {
  const access = await resolvePrimaryVenueAccess(await auth());
  if (!access) redirect("/login");
  if (!venueStaffCanCreateAndPublish(access.role)) redirect("/app/settings?notice=owner-only#integrations");
  return access;
}

async function resetCalendarLinkAction() {
  "use server";
  const access = await requireIntegrationAdmin();
  await resetCalendarToken(access.venueId);
  revalidatePath("/app/settings");
  redirect("/app/settings?notice=calendar-reset#calendar");
}

async function saveWebhookAction(formData: FormData) {
  "use server";
  const access = await requireIntegrationAdmin();
  const url = String(formData.get("webhookUrl") ?? "").trim();
  const problem = validateWebhookUrl(url);
  if (problem) redirect(`/app/settings?notice=webhook-invalid&reason=${webhookProblemCode(problem)}#integrations`);
  await saveWebhookConfig(access.venueId, url);
  revalidatePath("/app/settings");
  redirect("/app/settings?notice=webhook-saved#integrations");
}

async function rotateWebhookSecretAction() {
  "use server";
  const access = await requireIntegrationAdmin();
  const existing = await getWebhookConfig(access.venueId);
  if (existing) await saveWebhookConfig(access.venueId, existing.url, false);
  revalidatePath("/app/settings");
  redirect("/app/settings?notice=webhook-rotated#integrations");
}

async function removeWebhookAction() {
  "use server";
  const access = await requireIntegrationAdmin();
  await deleteWebhookConfig(access.venueId);
  revalidatePath("/app/settings");
  redirect("/app/settings?notice=webhook-removed#integrations");
}

async function testWebhookAction() {
  "use server";
  const access = await requireIntegrationAdmin();
  const config = await getWebhookConfig(access.venueId);
  if (!config) redirect("/app/settings#integrations");
  const result = await deliverWebhook(
    config,
    "webhook.test",
    { message: "Test event from VenueSprocket. No lead was created.", venue_id: access.venueId },
    { retry: false },
  );
  const code = result.status
    ? `http-${result.status}`
    : /private or reserved/.test(result.error ?? "")
      ? "blocked"
      : /ENOTFOUND|EAI_AGAIN/.test(result.error ?? "")
        ? "dns"
        : /Timed out/.test(result.error ?? "")
          ? "timeout"
          : "connect";
  redirect(`/app/settings?notice=${result.ok ? "webhook-test-ok" : "webhook-test-failed"}&reason=${code}#integrations`);
}

// Reasons travel in the URL as fixed codes and are rendered from this table, so a crafted link
// can't put arbitrary text on the settings page.
const WEBHOOK_PROBLEMS: Record<string, string> = {
  "not-https": "it must start with https://",
  credentials: "remove the username/password from the URL",
  port: "use the standard HTTPS port (443)",
  private: "that address or hostname is private",
  "too-long": "that URL is too long",
  invalid: "enter a full public URL starting with https://",
  blocked: "the hostname points to a private or reserved address",
  dns: "the hostname could not be found",
  timeout: "no answer within 5 seconds",
  connect: "the connection failed",
};

function webhookProblemCode(problem: string): string {
  if (/must use https/.test(problem)) return "not-https";
  if (/username/.test(problem)) return "credentials";
  if (/port/.test(problem)) return "port";
  if (/private|reserved|public hostname/.test(problem)) return "private";
  if (/too long/.test(problem)) return "too-long";
  return "invalid";
}

function reasonText(code: string | undefined): string | null {
  if (!code) return null;
  const http = code.match(/^http-(\d{3})$/);
  if (http) return `HTTP ${http[1]}`;
  return WEBHOOK_PROBLEMS[code] ?? null;
}

const NOTICES: Record<string, { text: string; ok: boolean }> = {
  "calendar-reset": { text: "Calendar link reset. Old links stop working; subscribe again with the new one.", ok: true },
  "webhook-saved": { text: "Webhook saved. New inquiries will be sent to it.", ok: true },
  "webhook-rotated": { text: "Signing secret replaced. Update it wherever you verify signatures.", ok: true },
  "webhook-removed": { text: "Webhook removed.", ok: true },
  "webhook-invalid": { text: "That webhook URL can't be used", ok: false },
  "webhook-test-ok": { text: "Test event delivered", ok: true },
  "webhook-test-failed": { text: "Test event was not accepted", ok: false },
  "owner-only": { text: "Only owners and managers can change integrations or export data.", ok: false },
};

export default async function VsSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; reason?: string }>;
}) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");
  const sp = await searchParams;
  const notice = sp.notice ? NOTICES[sp.notice] : undefined;
  const canAdmin = venueStaffCanCreateAndPublish(access.role);

  const [venue, vsConfig] = await Promise.all([
    prisma.venue.findUnique({
      where: { id: access.venueId },
      select: { name: true, slug: true, venueType: true, city: true, state: true, websiteUrl: true, phone: true },
    }),
    prisma.venueVsConfig.findUnique({ where: { venueId: access.venueId } }),
  ]);
  const [calendarToken, webhook] = canAdmin
    ? await Promise.all([calendarTokenFor(access.venueId), getWebhookConfig(access.venueId)])
    : [null, null];
  const calendarUrl = calendarToken ? `https://${VS_HOST}/api/vs-calendar/${calendarToken}.ics` : null;

  // This is the link a VenueSprocket venue is told to share with their customers - it must be on
  // the venuesprocket.com domain (the page itself is host-exempt and renders fine on either
  // domain, but showing a leaguepour.com URL here would be confusing/wrong-branded for a VS
  // venue to hand out). Found via whole-business audit: this previously always used
  // NEXTAUTH_URL, which resolves to the unified leaguepour.com app origin.
  const inquiryUrl = `https://${VS_HOST}/v/${venue?.slug ?? ""}/inquire`;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[var(--vs-text)]">Settings</h1>
        <p className="mt-1 text-[var(--vs-muted)]">VenueSprocket configuration for {venue?.name}</p>
      </div>

      {notice ? (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${notice.ok ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}
        >
          {notice.text}
          {reasonText(sp.reason) ? `: ${reasonText(sp.reason)}` : notice.ok ? "" : "."}
        </div>
      ) : null}

      <VsBillingPanel venueId={access.venueId} />

      {/* Inquiry page link */}
      <div className="rounded-xl border border-[var(--vs-border-strong)] bg-[var(--vs-surface-2)] p-5">
        <p className="text-sm font-semibold text-[var(--vs-text)] mb-1">Your public inquiry page</p>
        <p className="text-xs text-[var(--vs-muted)] mb-3">Share this link with customers or add it to your website.</p>
        <code className="block rounded-lg bg-[var(--vs-bg)] px-3 py-2 text-xs text-[var(--vs-muted)] break-all mb-3">
          {inquiryUrl}
        </code>
        <a
          href={inquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-lg border border-[var(--vs-accent)] px-4 py-2 text-sm font-semibold text-[var(--vs-accent)] hover:bg-[var(--vs-surface)]"
        >
          Preview inquiry page ↗
        </a>
      </div>

      <InquiryButtonSnippet inquiryUrl={inquiryUrl} venueName={venue?.name ?? undefined} />

      {/* Calendar sync */}
      <div id="calendar" className="scroll-mt-24 rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-5">
        <p className="text-sm font-semibold text-[var(--vs-text)] mb-1">Calendar sync (Google, Outlook, Apple)</p>
        {calendarUrl ? (
          <>
            <p className="text-xs text-[var(--vs-muted)] mb-3">
              Subscribe once and your private events appear in the calendar your team already uses. Pending events are
              marked &ldquo;Hold:&rdquo;, confirmed events show plainly, and cancelled ones are marked. Covers the last 90
              days and the next 18 months. Guest names are included, never emails or phone numbers.
            </p>
            <CopyField value={calendarUrl} label="Copy calendar link" />
            <ul className="mt-3 space-y-1 text-xs text-[var(--vs-muted)] list-disc pl-5">
              <li>
                <span className="font-semibold">Google Calendar:</span> Other calendars → + → From URL → paste. Google
                refreshes subscribed calendars on its own schedule, usually within 8–24 hours.
              </li>
              <li>
                <span className="font-semibold">Outlook:</span> Add calendar → Subscribe from web → paste. Outlook
                usually refreshes every few hours.
              </li>
              <li>
                <span className="font-semibold">Apple Calendar:</span> File → New Calendar Subscription → paste.
              </li>
            </ul>
            <p className="mt-3 text-xs text-[var(--vs-muted)]">
              One-way: changes made in your calendar don&apos;t flow back into VenueSprocket. Treat the link like a
              password; anyone who has it can see your event schedule.
            </p>
            <form action={resetCalendarLinkAction} className="mt-3">
              <button type="submit" className="text-xs font-semibold text-[var(--vs-accent)] hover:underline">
                Reset link (the old link stops working)
              </button>
            </form>
          </>
        ) : (
          <p className="text-xs text-[var(--vs-muted)]">Ask an owner or manager to set up calendar sync.</p>
        )}
      </div>

      {/* Exports + webhook */}
      <div id="integrations" className="scroll-mt-24 space-y-5 rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-5">
        <div>
          <p className="text-sm font-semibold text-[var(--vs-text)] mb-1">Export your data (CSV)</p>
          <p className="text-xs text-[var(--vs-muted)] mb-3">
            Opens in Excel, Numbers or Google Sheets. Your data is always yours to take with you.
          </p>
          {canAdmin ? (
            <div className="flex flex-wrap gap-2">
              {[
                ["leads", "Leads"],
                ["customers", "Customers"],
                ["events", "Events"],
              ].map(([k, label]) => (
                <a
                  key={k}
                  href={`/app/export/${k}`}
                  className="inline-flex rounded-lg border border-[var(--vs-border-strong)] px-3 py-1.5 text-sm font-semibold text-[var(--vs-text)] hover:border-[var(--vs-accent)]"
                >
                  {label} CSV
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--vs-muted)]">
              Exports contain guest contact details, so only owners and managers can download them.
            </p>
          )}
        </div>

        <div className="border-t border-[var(--vs-border)] pt-5">
          <p className="text-sm font-semibold text-[var(--vs-text)] mb-1">Webhook for new inquiries</p>
          <p className="text-xs text-[var(--vs-muted)] mb-3">
            Send each new inquiry to Zapier (&ldquo;Catch Hook&rdquo;), Make, n8n, your CRM or your own server as it
            arrives. Requests are signed so you can check they came from VenueSprocket.{" "}
            <a
              href={`https://${VS_HOST}/integrations#webhooks`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--vs-accent)] hover:underline"
            >
              Payload and signature docs ↗
            </a>
          </p>
          {!canAdmin ? (
            <p className="text-xs text-[var(--vs-muted)]">Ask an owner or manager to set up a webhook.</p>
          ) : (
            <>
              <form action={saveWebhookAction} className="flex flex-col gap-2 sm:flex-row">
                <label htmlFor="webhookUrl" className="sr-only">
                  Webhook URL
                </label>
                <input
                  id="webhookUrl"
                  name="webhookUrl"
                  type="url"
                  required
                  defaultValue={webhook?.url ?? ""}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2.5 text-sm focus:border-[var(--vs-accent)] focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-[var(--vs-accent)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)]"
                >
                  {webhook ? "Update" : "Save webhook"}
                </button>
              </form>
              {webhook ? (
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-[var(--vs-text)] mb-1">Signing secret</p>
                    <CopyField value={webhook.secret} label="Copy secret" mask />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <form action={testWebhookAction}>
                      <button type="submit" className="text-sm font-semibold text-[var(--vs-accent)] hover:underline">
                        Send test event
                      </button>
                    </form>
                    <form action={rotateWebhookSecretAction}>
                      <button type="submit" className="text-sm font-semibold text-[var(--vs-muted)] hover:underline">
                        Replace secret
                      </button>
                    </form>
                    <form action={removeWebhookAction}>
                      <button type="submit" className="text-sm font-semibold text-red-600 hover:underline">
                        Remove webhook
                      </button>
                    </form>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* VS Config form */}
      <form action={saveVsSettings}>
        <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-6 space-y-5">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--vs-muted)]">Event contact info</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--vs-text)] mb-1">Public email for events</label>
              <input
                type="email"
                name="publicEmail"
                defaultValue={vsConfig?.publicEmail ?? venue?.phone ?? ""}
                className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2.5 text-sm focus:border-[var(--vs-accent)] focus:outline-none"
                placeholder="events@yourvenue.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--vs-text)] mb-1">Public phone for events</label>
              <input
                type="tel"
                name="publicPhone"
                defaultValue={vsConfig?.publicPhone ?? venue?.phone ?? ""}
                className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2.5 text-sm focus:border-[var(--vs-accent)] focus:outline-none"
                placeholder="(555) 000-0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--vs-text)] mb-1">
              Default deposit % (of total)
            </label>
            <input
              type="number"
              name="defaultDepositPct"
              min="0"
              max="100"
              defaultValue={vsConfig?.defaultDepositPct ?? 25}
              className="w-32 rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2.5 text-sm focus:border-[var(--vs-accent)] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[var(--vs-muted)]">
              Applied to the room fee + food &amp; beverage minimum when you leave a proposal&apos;s deposit blank. An amount
              you type on the proposal (including 0) always wins. Deposits are on the Pro plan.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--vs-text)] mb-1">
              Additional contract terms (appended to default contract)
            </label>
            <textarea
              name="contractTemplate"
              rows={6}
              defaultValue={vsConfig?.contractTemplate ?? ""}
              className="w-full rounded-lg border border-[var(--vs-border)] bg-[var(--vs-bg)] px-3 py-2.5 text-sm font-mono focus:border-[var(--vs-accent)] focus:outline-none"
              placeholder="Add any additional venue-specific contract terms here..."
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="rounded-lg bg-[var(--vs-accent)] px-6 py-2.5 text-sm font-bold text-white hover:bg-[var(--vs-accent-hover)]"
          >
            Save settings
          </button>
        </div>
      </form>

      {/* Venue info (read-only from LP) */}
      <div className="rounded-xl border border-[var(--vs-border)] bg-[var(--vs-surface)] p-6">
        <p className="text-sm font-bold uppercase tracking-widest text-[var(--vs-muted)] mb-4">Venue profile</p>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div><p className="text-xs text-[var(--vs-muted)]">Name</p><p className="font-medium">{venue?.name}</p></div>
          <div><p className="text-xs text-[var(--vs-muted)]">Type</p><p className="font-medium">{venue?.venueType}</p></div>
          <div><p className="text-xs text-[var(--vs-muted)]">Location</p><p className="font-medium">{[venue?.city, venue?.state].filter(Boolean).join(", ") || "—"}</p></div>
          <div><p className="text-xs text-[var(--vs-muted)]">Website</p><p className="font-medium">{venue?.websiteUrl || "—"}</p></div>
        </div>
        <p className="mt-4 text-xs text-[var(--vs-muted)]">
          To update your venue profile, go to{" "}
          <a href="/venue/profile" className="text-[var(--vs-accent)] hover:underline">LeaguePour venue settings</a>.
        </p>
      </div>
    </div>
  );
}
