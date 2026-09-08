import Link from "next/link";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { prisma } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/utils";
import { venueAppRoutes } from "@/lib/routes";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";
import { CompetitionStatus } from "@/generated/prisma/enums";
import { deleteCompetitionAction } from "./[id]/actions";

const noticeMessages: Record<string, { text: string; tone: "info" | "warn" }> = {
  "read-only": {
    text:
      "View-only for your role. Coordinators can update scores on a competition, but only owners or managers can create events, duplicate them, or send campaigns. Ask a manager if you need something published.",
    tone: "info",
  },
  saved: { text: "Competition saved.", tone: "info" },
  "draft-deleted": { text: "Draft deleted.", tone: "info" },
  duplicated: { text: "Duplicated as a new draft.", tone: "info" },
  "not-editable": {
    text: "That competition is already running or finished, so its core setup can no longer be edited here.",
    tone: "warn",
  },
  "not-deletable": {
    text: "Only draft competitions with zero registrations can be deleted. Published or active events need to be archived instead.",
    tone: "warn",
  },
};

function statusLabel(status: CompetitionStatus): string {
  switch (status) {
    case CompetitionStatus.DRAFT:
      return "Draft";
    case CompetitionStatus.PUBLISHED:
      return "Scheduled";
    case CompetitionStatus.SIGNUP_OPEN:
      return "Live - signup open";
    case CompetitionStatus.SIGNUP_CLOSED:
      return "Live - signup closed";
    case CompetitionStatus.IN_PROGRESS:
      return "In progress";
    case CompetitionStatus.COMPLETED:
      return "Completed";
    case CompetitionStatus.ARCHIVED:
      return "Archived";
    default:
      return status;
  }
}

export default async function VenueCompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  const { notice } = await searchParams;
  const canCreate = venueStaffCanCreateAndPublish(access.role);
  const noticeInfo = notice ? noticeMessages[notice] : null;

  const list = await prisma.competition.findMany({
    where: { venueId: access.venueId },
    orderBy: { startAt: "asc" },
    include: { _count: { select: { registrations: true } }, prizeStructure: true },
  });

  return (
    <div className="space-y-8">
      {noticeInfo ? (
        <div
          className={`rounded-[10px] border px-4 py-3 text-sm ${
            noticeInfo.tone === "warn"
              ? "border-lp-warning/40 bg-lp-warning/10 text-lp-text"
              : "border-lp-border bg-lp-surface/60 text-lp-text"
          }`}
        >
          {noticeInfo.text}
        </div>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="lp-page-title text-3xl md:text-4xl">Competitions</h1>
          <p className="mt-2 max-w-2xl text-base text-lp-muted md:text-lg">
            Public signup pages, caps, and listed entry fees. Players pay through Stripe Checkout; LeaguePour stores
            payment status from Stripe webhooks.
          </p>
        </div>
        {canCreate ? (
          <Button asChild size="lg">
            <Link href={venueAppRoutes.createCompetition}>Create competition</Link>
          </Button>
        ) : (
          <p className="text-sm text-lp-muted sm:max-w-xs sm:text-right">
            New events are created by an owner or manager at your venue.
          </p>
        )}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No competitions yet"
          description="Publish your first signup page - blind draws, leagues, or one-night brackets. Players discover you from your public venue profile."
          action={
            canCreate ? (
              <Button asChild size="lg">
                <Link href={venueAppRoutes.createCompetition}>Build your first</Link>
              </Button>
            ) : (
              <Button asChild variant="secondary" size="lg">
                <Link href={venueAppRoutes.dashboard}>Back to dashboard</Link>
              </Button>
            )
          }
        />
      ) : (
        <>
        <ul className="grid gap-4 md:grid-cols-2">
          {list.map((c) => {
            const isDraft = c.status === CompetitionStatus.DRAFT;
            const canDeleteDraft = isDraft && c._count.registrations === 0;
            return (
              <li key={c.id}>
                <Card className="h-full">
                  <div className="flex items-start justify-between gap-2">
                    <CardHeader className="p-0">
                      <CardTitle className="text-lg">{c.title}</CardTitle>
                      <CardDescription>
                        {c.kind.replaceAll("_", " ")}
                        {isDraft ? " | not published yet" : ` | ${formatDate(c.startAt)}`} |{" "}
                        {c._count.registrations} registered
                      </CardDescription>
                    </CardHeader>
                    <Badge variant={isDraft ? "muted" : "default"}>{statusLabel(c.status)}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-lp-muted">
                    Listed fee {formatMoney(c.entryFeeCents, c.entryFeeCurrency)}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {canCreate ? (
                      <Button asChild>
                        <Link href={`${venueAppRoutes.competitions}/${c.id}/edit`}>
                          {isDraft ? "Continue setup" : "Edit"}
                        </Link>
                      </Button>
                    ) : null}
                    <Button variant="secondary" asChild>
                      <Link href={`${venueAppRoutes.competitions}/${c.id}`}>Manage</Link>
                    </Button>
                    {!isDraft ? (
                      <Button variant="ghost" asChild>
                        <Link href={`/c/${access.slug}/${c.slug}`}>Public page</Link>
                      </Button>
                    ) : null}
                    <Button variant="ghost" asChild>
                      <Link href={venueAppRoutes.registrations}>Registrations</Link>
                    </Button>
                    {canCreate && canDeleteDraft ? (
                      <form action={deleteCompetitionAction} className="ml-auto">
                        <input type="hidden" name="competitionId" value={c.id} />
                        <ConfirmActionButton
                          label="Delete draft"
                          prompt={`Delete "${c.title}"? This permanently deletes this draft and cannot be undone.`}
                          className="text-sm font-semibold text-red-600 hover:underline"
                        />
                      </form>
                    ) : null}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
        <p className="text-center text-sm text-lp-muted">
          Checking players in?{" "}
          <Link href={venueAppRoutes.registrations} className="font-semibold text-lp-accent hover:underline">
            Open the registrations ledger
          </Link>
        </p>
        </>
      )}
    </div>
  );
}
