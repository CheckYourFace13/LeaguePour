import Link from "next/link";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { RegistrationStatus } from "@/generated/prisma/enums";
import { formatDate, formatMoney } from "@/lib/utils";
import {
  resolvePrimaryVenueAccess,
  venueRoleLabel,
  venueStaffCanCreateAndPublish,
  venueStaffCanManageStaff,
} from "@/lib/venue-permissions";
import { venueAppRoutes } from "@/lib/routes";
import { redirect } from "next/navigation";

export default async function VenueDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  const { notice } = await searchParams;
  const canCreate = venueStaffCanCreateAndPublish(access.role);
  const canManageStaff = venueStaffCanManageStaff(access.role);

  const venueSlugRow = await prisma.venue.findUnique({
    where: { id: access.venueId },
    select: { slug: true },
  });
  const venueSlug = venueSlugRow?.slug ?? "";

  const [openCount, regCount, campaignDrafts, pendingPayments, upcoming] = await Promise.all([
    prisma.competition.count({
      where: { venueId: access.venueId, status: { in: ["SIGNUP_OPEN", "PUBLISHED"] } },
    }),
    prisma.competitionRegistration.count({
      where: { competition: { venueId: access.venueId } },
    }),
    prisma.messageCampaign.count({
      where: { venueId: access.venueId, status: "DRAFT" },
    }),
    prisma.competitionRegistration.count({
      where: {
        competition: { venueId: access.venueId },
        status: RegistrationStatus.PENDING_PAYMENT,
      },
    }),
    prisma.competition.findMany({
      where: { venueId: access.venueId, signupCloseAt: { gte: new Date() } },
      orderBy: { signupCloseAt: "asc" },
      take: 4,
      include: { prizeStructure: true, _count: { select: { registrations: true } } },
    }),
  ]);

  return (
    <div className="space-y-10 md:space-y-12">
      {notice === "staff-forbidden" ? (
        <div className="rounded-[10px] border border-lp-border bg-lp-surface/60 px-4 py-3 text-sm text-lp-text">
          Staff management is limited to owners and managers.
        </div>
      ) : null}
      {!canCreate ? (
        <div className="rounded-[10px] border border-lp-border bg-lp-surface/40 px-4 py-3 text-sm text-lp-text">
          <span className="font-semibold">You are signed in as {venueRoleLabel(access.role)}.</span>{" "}
          Owners and managers publish events and campaigns; you can still review everything here and update scores where
          your venue allows.
        </div>
      ) : null}
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Dashboard</h1>
        <p className="mt-3 max-w-xl text-base text-lp-muted md:text-lg">Signups, unpaid checkouts, closing windows.</p>
      </div>

      <div className="rounded-2xl border border-lp-border bg-lp-surface/40 p-5 md:p-6">
        <p className="lp-kicker">Jump to</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
            <Link href={venueAppRoutes.competitions}>Competitions</Link>
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
            <Link href={venueAppRoutes.registrations}>Registrations</Link>
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
            <Link href={venueAppRoutes.messages}>Messages</Link>
          </Button>
          {canManageStaff ? (
            <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
              <Link href={venueAppRoutes.staff}>Staff</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        <Card>
          <p className="lp-kicker">Open signups</p>
          <p className="mt-3 font-display text-3xl font-extrabold tabular-nums tracking-tight text-lp-text md:text-4xl">
            {openCount}
          </p>
        </Card>
        <Card>
          <p className="lp-kicker">Registrations</p>
          <p className="mt-3 font-display text-3xl font-extrabold tabular-nums tracking-tight text-lp-text md:text-4xl">
            {regCount}
          </p>
        </Card>
        <Card>
          <p className="lp-kicker">Awaiting checkout</p>
          <p className="mt-3 font-display text-3xl font-extrabold tabular-nums tracking-tight text-lp-text md:text-4xl">
            {pendingPayments}
          </p>
          <p className="mt-2 text-sm text-lp-muted">Started pay but not finished, or still confirming.</p>
        </Card>
        <Card>
          <p className="lp-kicker">Campaign drafts</p>
          <p className="mt-3 font-display text-3xl font-extrabold tabular-nums tracking-tight text-lp-text md:text-4xl">
            {campaignDrafts}
          </p>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="lp-page-title text-xl md:text-2xl">Signup windows closing</h2>
        {canCreate ? (
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href={venueAppRoutes.createCompetition}>New competition</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {upcoming.length === 0 ? (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>No signup deadlines ahead</CardTitle>
              <CardDescription>
                When a competition has a future signup close, it lands here so nothing slips past the bar.
              </CardDescription>
            </CardHeader>
            <div className="flex flex-col gap-3 px-6 pb-6 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href={venueAppRoutes.competitions}>Browse competitions</Link>
              </Button>
              {canCreate ? (
                <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
                  <Link href={venueAppRoutes.createCompetition}>Build a new one</Link>
                </Button>
              ) : null}
            </div>
          </Card>
        ) : (
          upcoming.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <CardHeader className="p-0">
                  <CardTitle>{c.title}</CardTitle>
                  <CardDescription>
                    Signup closes {formatDate(c.signupCloseAt)} · {c._count.registrations} registered
                    {c.participantCap ? ` · cap ${c.participantCap}` : ""}
                  </CardDescription>
                </CardHeader>
                <Badge variant={c.status === "SIGNUP_OPEN" ? "success" : "muted"} className="shrink-0">
                  {c.status.replaceAll("_", " ")}
                </Badge>
              </div>
              <p className="mt-4 text-base text-lp-muted">
                Listed entry {formatMoney(c.entryFeeCents, c.entryFeeCurrency)}
                {c.entryFeeCents > 0 ? " — shown on the public signup page." : ""}
                {c.prizeStructure ? ` · ${c.prizeStructure.summary}` : ""}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button variant="secondary" asChild>
                  <Link href={`${venueAppRoutes.competitions}/${c.id}`}>Manage competition</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href={`/c/${venueSlug}/${c.slug}`}>Public page</Link>
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
