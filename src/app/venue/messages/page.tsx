import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldHelp } from "@/components/forms/field-help";
import { prisma } from "@/lib/db";
import { CampaignStatus } from "@/generated/prisma/enums";
import { campaignAudienceSummary } from "@/lib/campaign-audience-meta";
import { venueAppRoutes } from "@/lib/routes";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";
import { sendDraftCampaignFormAction } from "./actions";

function noticeBanner(notice?: string, count?: string) {
  if (notice === "sent") {
    return `Campaign marked sent · ${count ?? "0"} in-app notifications logged (external email/SMS not wired yet).`;
  }
  if (notice === "no-recipients") {
    return "No recipients matched this campaign’s audience rules — nothing was sent.";
  }
  if (notice === "not-draft") return "That campaign is not in draft status anymore.";
  if (notice === "missing") return "Missing campaign id.";
  if (notice === "read-only") {
    return "Sending campaigns requires an owner or manager. You can still read copy and audience notes below.";
  }
  if (notice === "forbidden") {
    return "That action requires an owner or manager at this venue.";
  }
  return null;
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; count?: string }>;
}) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");

  const sp = await searchParams;
  const banner = noticeBanner(sp.notice, sp.count);
  const canSend = venueStaffCanCreateAndPublish(access.role);

  const campaigns = await prisma.messageCampaign.findMany({
    where: { venueId: access.venueId },
    orderBy: { updatedAt: "desc" },
    take: 30,
    include: { competition: { select: { title: true } } },
  });

  return (
    <div className="space-y-8 md:space-y-10">
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Messages</h1>
        <p className="mt-3 max-w-xl text-base text-lp-muted md:text-lg">
          Drafts and audiences here. Sends log in-app for now; connect email/SMS when you are ready.
        </p>
      </div>
      {canSend ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={venueAppRoutes.campaignsNew}>New campaign draft</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
            <Link href={venueAppRoutes.marketing}>Marketing hub</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-[10px] border border-lp-border bg-lp-surface/40 px-4 py-3 text-sm text-lp-text">
          <span className="font-semibold">View-only for campaigns.</span> Owners and managers queue sends; you can read
          copy and audiences below. Head to competitions if you are helping run the room tonight.
        </div>
      )}
      <FieldHelp title="Audience rules (real)">
        <p>
          Competition → confirmed registrants. All followers → everyone following this venue. Saved segment → audience
          tags from CRM. Player communication preferences still filter who is skipped on send.
        </p>
      </FieldHelp>

      {banner ? (
        <div
          className={
            sp.notice === "read-only" || sp.notice === "forbidden"
              ? "rounded-[10px] border border-lp-border bg-lp-surface/60 px-4 py-3 text-sm text-lp-text"
              : "rounded-[10px] border border-lp-accent/35 bg-lp-accent/10 px-4 py-3 text-sm font-medium text-lp-text"
          }
        >
          {banner}
        </div>
      ) : null}

      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="Start a draft anytime — audience rules are real; delivery is in-app until providers are connected."
          action={
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              {canSend ? (
                <Button asChild size="lg">
                  <Link href={venueAppRoutes.campaignsNew}>New campaign draft</Link>
                </Button>
              ) : null}
              <Button asChild variant="secondary" size="lg">
                <Link href={venueAppRoutes.marketing}>Marketing hub</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href={venueAppRoutes.dashboard}>Dashboard</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="space-y-4">
          {campaigns.map((c) => (
            <li key={c.id}>
              <Card className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="font-display text-lg font-bold text-lp-text">{c.name}</p>
                  <p className="text-sm text-lp-muted">
                    {c.channel} · {c.status.replaceAll("_", " ")} · {campaignAudienceSummary(c)}
                  </p>
                  {c.subject ? <p className="text-base font-medium text-lp-text-soft">{c.subject}</p> : null}
                  <p className="line-clamp-3 text-sm text-lp-muted">{c.body}</p>
                  {c.sentAt ? (
                    <p className="text-xs text-lp-muted">Sent {c.sentAt.toISOString().slice(0, 16).replace("T", " ")} UTC</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  {c.status === CampaignStatus.DRAFT ? (
                    canSend ? (
                      <>
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
                          <Link href={`/venue/campaigns/${c.id}/edit`}>Edit draft</Link>
                        </Button>
                        <form action={sendDraftCampaignFormAction} className="w-full sm:w-auto">
                          <input type="hidden" name="campaignId" value={c.id} />
                          <Button type="submit" size="lg" className="w-full">
                            Send now (in-app)
                          </Button>
                        </form>
                      </>
                    ) : (
                      <p className="max-w-[220px] text-right text-xs text-lp-muted">
                        Only owners or managers can queue sends.
                      </p>
                    )
                  ) : (
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto" disabled>
                      Sent
                    </Button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <p className="text-center text-sm text-lp-muted">
        <Link href={venueAppRoutes.marketing} className="font-semibold text-lp-accent hover:underline">
          Marketing hub
        </Link>
        {" · "}
        <Link href={venueAppRoutes.competitions} className="font-semibold text-lp-accent hover:underline">
          Competitions
        </Link>
        {" · "}
        <Link href={venueAppRoutes.dashboard} className="font-semibold text-lp-accent hover:underline">
          Dashboard
        </Link>
      </p>
    </div>
  );
}
