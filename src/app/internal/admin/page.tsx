import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { requireOwnerSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import {
  createPromoCodeAction,
  deleteCompetitionAction,
  deleteVenueAction,
  disableVenueAction,
  markRegistrationCompAction,
  refundPaymentPlaceholderAction,
  togglePromoCodeAction,
  unpublishCompetitionAction,
} from "./actions";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function paramValue(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

function sectionTitle(title: string, count: number) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2 className="font-display text-2xl font-extrabold text-lp-text">{title}</h2>
      <span className="rounded-md border border-lp-border-strong px-2.5 py-1 text-sm font-semibold text-lp-text-soft">
        {count}
      </span>
    </div>
  );
}

export default async function InternalAdminPage({ searchParams }: AdminPageProps) {
  const session = await requireOwnerSession();
  const params = searchParams ? await searchParams : {};
  const q = paramValue(params.q).trim();
  const promoErr = paramValue(params.promoErr).trim();
  const whereText = q
    ? {
        contains: q,
        mode: "insensitive" as const,
      }
    : undefined;

  const [venues, users, competitions, registrations, payments, promoCodes] = await Promise.all([
    prisma.venue.findMany({
      where: whereText
        ? {
            OR: [{ name: whereText }, { slug: whereText }, { city: whereText }, { formattedAddress: whereText }],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.user.findMany({
      where: whereText ? { OR: [{ email: whereText }, { name: whereText }] } : undefined,
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.competition.findMany({
      where: whereText ? { OR: [{ title: whereText }, { slug: whereText }, { venue: { name: whereText } }] } : undefined,
      include: { venue: { select: { id: true, name: true, slug: true, isDisabled: true } } },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.competitionRegistration.findMany({
      where: whereText
        ? {
            OR: [{ competition: { title: whereText } }, { user: { email: whereText } }, { id: whereText }],
          }
        : undefined,
      include: {
        user: { select: { id: true, email: true, name: true } },
        competition: { select: { id: true, title: true } },
        payment: { select: { id: true, status: true, amountCents: true, currency: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.payment.findMany({
      where: whereText
        ? {
            OR: [
              { id: whereText },
              { providerCheckoutSessionId: whereText },
              { providerPaymentIntentId: whereText },
              { registration: { user: { email: whereText } } },
            ],
          }
        : undefined,
      include: {
        registration: {
          select: {
            id: true,
            status: true,
            competition: { select: { title: true } },
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.promoCode.findMany({
      where: whereText ? { OR: [{ code: whereText }, { venue: { name: whereText } }] } : undefined,
      include: { venue: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6">
      <Card className="space-y-4">
        <div>
          <p className="lp-kicker">Internal back office</p>
          <h1 className="lp-page-title mt-2 text-4xl md:text-5xl">LeaguePour Admin</h1>
          <p className="mt-2 text-base text-lp-text-soft">
            Signed in as {session.user.email}. Owner-only operational view for pre-launch control.
          </p>
        </div>
        <form method="get" className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="w-full md:max-w-md">
            <Label htmlFor="q">Search venues, users, competitions, registrations, payments</Label>
            <Input id="q" name="q" defaultValue={q} placeholder="Search by name, email, id, slug..." />
          </div>
          <Button type="submit">Search</Button>
          {q ? (
            <Button variant="secondary" asChild>
              <a href="/internal/admin">Clear</a>
            </Button>
          ) : null}
        </form>
      </Card>

      <Card className="space-y-4">
        {sectionTitle("Promo / Discount Codes", promoCodes.length)}
        <form action={createPromoCodeAction} className="grid gap-3 rounded-md border border-lp-border p-4 md:grid-cols-6">
          <div className="md:col-span-2">
            <Label htmlFor="promo-code">Code</Label>
            <Input id="promo-code" name="code" placeholder="SUMMER25" required />
          </div>
          <div>
            <Label htmlFor="promo-type">Type</Label>
            <select
              id="promo-type"
              name="discountType"
              className="min-h-[3.25rem] w-full rounded-[10px] border border-lp-border-strong bg-lp-bg px-3 text-base"
              defaultValue="PERCENT"
            >
              <option value="PERCENT">Percent</option>
              <option value="FLAT">Flat ($ cents)</option>
            </select>
          </div>
          <div>
            <Label htmlFor="promo-amount">Amount</Label>
            <Input id="promo-amount" name="amount" type="number" min={1} required />
          </div>
          <div>
            <Label htmlFor="promo-limit">Usage limit</Label>
            <Input id="promo-limit" name="usageLimit" type="number" min={1} placeholder="Optional" />
          </div>
          <div>
            <Label htmlFor="promo-expire">Expiration date</Label>
            <Input id="promo-expire" name="expiresAt" type="datetime-local" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="promo-venue">Venue ID (optional, blank = global)</Label>
            <Input id="promo-venue" name="venueId" placeholder="cuid..." />
          </div>
          <div className="flex items-center gap-2">
            <input id="promo-active" type="checkbox" name="isActive" value="true" defaultChecked />
            <Label htmlFor="promo-active">Active</Label>
          </div>
          <div className="md:col-span-6">
            <Button type="submit">Create promo code</Button>
          </div>
        </form>
        {promoErr ? <p className="text-sm text-red-700">{promoErr}</p> : null}
        <div className="space-y-2">
          {promoCodes.map((promo) => (
            <div key={promo.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-lp-border p-3">
              <div className="text-sm">
                <p className="font-bold text-lp-text">{promo.code}</p>
                <p className="text-lp-text-soft">
                  {promo.discountType === "PERCENT" ? `${promo.amount}%` : `${(promo.amount / 100).toFixed(2)} USD`} ·{" "}
                  used {promo.usedCount}
                  {promo.usageLimit ? ` / ${promo.usageLimit}` : ""} ·{" "}
                  {promo.expiresAt ? `expires ${promo.expiresAt.toLocaleString()}` : "no expiration"} ·{" "}
                  {promo.venue ? `venue: ${promo.venue.name}` : "global"}
                </p>
              </div>
              <form action={togglePromoCodeAction} className="flex gap-2">
                <input type="hidden" name="promoCodeId" value={promo.id} />
                <input type="hidden" name="isActive" value={promo.isActive ? "false" : "true"} />
                <Button type="submit" variant="secondary">
                  {promo.isActive ? "Deactivate" : "Activate"}
                </Button>
              </form>
            </div>
          ))}
          {promoCodes.length === 0 ? <p className="text-sm text-lp-text-soft">No promo codes found.</p> : null}
        </div>
      </Card>

      <Card className="space-y-4">
        {sectionTitle("Venues", venues.length)}
        <div className="space-y-2">
          {venues.map((venue) => (
            <div key={venue.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-lp-border p-3">
              <div className="text-sm">
                <p className="font-bold text-lp-text">
                  {venue.name} {venue.isDisabled ? <span className="text-red-700">(disabled)</span> : null}
                </p>
                <p className="text-lp-text-soft">
                  {venue.slug} · {venue.city ?? "no city"} · {venue.id}
                </p>
              </div>
              <div className="flex gap-2">
                <form action={disableVenueAction}>
                  <input type="hidden" name="venueId" value={venue.id} />
                  <input type="hidden" name="disable" value={venue.isDisabled ? "false" : "true"} />
                  <Button type="submit" variant="secondary">
                    {venue.isDisabled ? "Enable" : "Disable"}
                  </Button>
                </form>
                <form action={deleteVenueAction}>
                  <input type="hidden" name="venueId" value={venue.id} />
                  <ConfirmActionButton
                    label="Delete"
                    prompt={`Delete venue "${venue.name}"? This removes competitions and related records.`}
                    className="inline-flex min-h-[3.25rem] items-center rounded-[10px] border border-red-300 bg-red-50 px-4 text-base font-bold text-red-700 hover:bg-red-100"
                  />
                </form>
              </div>
            </div>
          ))}
          {venues.length === 0 ? <p className="text-sm text-lp-text-soft">No venues found.</p> : null}
        </div>
      </Card>

      <Card className="space-y-4">
        {sectionTitle("Users", users.length)}
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="rounded-md border border-lp-border p-3 text-sm">
              <p className="font-bold text-lp-text">{user.name ?? "Unnamed user"}</p>
              <p className="text-lp-text-soft">
                {user.email} · {user.id}
              </p>
            </div>
          ))}
          {users.length === 0 ? <p className="text-sm text-lp-text-soft">No users found.</p> : null}
        </div>
      </Card>

      <Card className="space-y-4">
        {sectionTitle("Competitions", competitions.length)}
        <div className="space-y-2">
          {competitions.map((competition) => (
            <div key={competition.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-lp-border p-3">
              <div className="text-sm">
                <p className="font-bold text-lp-text">{competition.title}</p>
                <p className="text-lp-text-soft">
                  {competition.status} · {competition.venue.name} · {competition.id}
                </p>
              </div>
              <div className="flex gap-2">
                <form action={unpublishCompetitionAction}>
                  <input type="hidden" name="competitionId" value={competition.id} />
                  <Button type="submit" variant="secondary">
                    Unpublish
                  </Button>
                </form>
                <form action={deleteCompetitionAction}>
                  <input type="hidden" name="competitionId" value={competition.id} />
                  <ConfirmActionButton
                    label="Delete"
                    prompt={`Delete competition "${competition.title}"?`}
                    className="inline-flex min-h-[3.25rem] items-center rounded-[10px] border border-red-300 bg-red-50 px-4 text-base font-bold text-red-700 hover:bg-red-100"
                  />
                </form>
              </div>
            </div>
          ))}
          {competitions.length === 0 ? <p className="text-sm text-lp-text-soft">No competitions found.</p> : null}
        </div>
      </Card>

      <Card className="space-y-4">
        {sectionTitle("Registrations", registrations.length)}
        <div className="space-y-2">
          {registrations.map((reg) => (
            <div key={reg.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-lp-border p-3">
              <div className="text-sm">
                <p className="font-bold text-lp-text">{reg.competition.title}</p>
                <p className="text-lp-text-soft">
                  {reg.user.email} · reg: {reg.status} · payment: {reg.payment?.status ?? "none"} · {reg.id}
                </p>
              </div>
              <form action={markRegistrationCompAction}>
                <input type="hidden" name="registrationId" value={reg.id} />
                <Button type="submit" variant="secondary">
                  Comp (placeholder)
                </Button>
              </form>
            </div>
          ))}
          {registrations.length === 0 ? <p className="text-sm text-lp-text-soft">No registrations found.</p> : null}
        </div>
      </Card>

      <Card className="space-y-4">
        {sectionTitle("Payments", payments.length)}
        <div className="space-y-2">
          {payments.map((payment) => (
            <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-lp-border p-3">
              <div className="text-sm">
                <p className="font-bold text-lp-text">
                  ${(payment.amountCents / 100).toFixed(2)} {payment.currency}
                </p>
                <p className="text-lp-text-soft">
                  status: {payment.status} · reg: {payment.registration?.status ?? "none"} ·{" "}
                  {payment.registration?.user.email ?? "unknown user"} · {payment.id}
                </p>
              </div>
              <form action={refundPaymentPlaceholderAction}>
                <input type="hidden" name="paymentId" value={payment.id} />
                <ConfirmActionButton
                  label="Refund (placeholder)"
                  prompt={`Mark payment ${payment.id} as refunded?`}
                  className="inline-flex min-h-[3.25rem] items-center rounded-[10px] border border-lp-border-strong bg-lp-surface px-4 text-base font-bold text-lp-text-soft hover:bg-lp-surface-2"
                  disabled={payment.status === "REFUNDED"}
                />
              </form>
            </div>
          ))}
          {payments.length === 0 ? <p className="text-sm text-lp-text-soft">No payments found.</p> : null}
        </div>
      </Card>
    </main>
  );
}
