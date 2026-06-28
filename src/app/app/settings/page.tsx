import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function saveVsSettings(formData: FormData) {
  "use server";
  const session = await auth();
  const { resolvePrimaryVenueAccess } = await import("@/lib/venue-permissions");
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) return;

  const depositPct = Math.min(100, Math.max(0, Number(formData.get("defaultDepositPct")) || 25));

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

export default async function VsSettingsPage() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/login");

  const [venue, vsConfig] = await Promise.all([
    prisma.venue.findUnique({
      where: { id: access.venueId },
      select: { name: true, slug: true, venueType: true, city: true, state: true, websiteUrl: true, phone: true },
    }),
    prisma.venueVsConfig.findUnique({ where: { venueId: access.venueId } }),
  ]);

  const inquiryUrl = `${process.env.NEXTAUTH_URL ?? "https://leaguepour.com"}/v/${venue?.slug ?? ""}/inquire`;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[var(--vs-text)]">Settings</h1>
        <p className="mt-1 text-[var(--vs-muted)]">VenueSprocket configuration for {venue?.name}</p>
      </div>

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
            <p className="mt-1 text-xs text-[var(--vs-muted)]">Used as the suggested deposit when building proposals.</p>
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
