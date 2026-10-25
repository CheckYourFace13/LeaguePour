"use server";

import { auth } from "@/auth";
import {
  BracketKind,
  CompetitionKind,
  CompetitionStatus,
  RegistrationFormat,
  ScheduleKind,
} from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { withActiveCompetitionSlot } from "@/lib/entitlements/lp-capacity";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
import { pingIndexNow } from "@/lib/seo/indexnow";
import { getPublicSiteUrl } from "@/lib/site-url";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 48);
}

function parseEnum<T extends string>(val: string | null, allowed: readonly T[], fallback: T): T {
  if (!val) return fallback;
  return (allowed.includes(val as T) ? val : fallback) as T;
}

const kinds = Object.values(CompetitionKind);
const brackets = Object.values(BracketKind);
const schedules = Object.values(ScheduleKind);
const formats = Object.values(RegistrationFormat);

export async function createCompetitionAction(formData: FormData) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanCreateAndPublish(access.role)) redirect("/venue/competitions?notice=read-only");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/venue/competitions/new?error=title");

  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug) slug = slugify(title);
  const taken = await prisma.competition.findUnique({
    where: { venueId_slug: { venueId: access.venueId, slug } },
  });
  if (taken) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;

  const kind = parseEnum(String(formData.get("kind")), kinds, CompetitionKind.CUSTOM);
  const description = String(formData.get("description") ?? "").trim() || "See public page for format and rules.";
  const signupOpenAt = new Date(String(formData.get("signupOpenAt")));
  const signupCloseAt = new Date(String(formData.get("signupCloseAt")));
  const startAt = new Date(String(formData.get("startAt")));
  const endAt = new Date(String(formData.get("endAt")));
  if ([signupOpenAt, signupCloseAt, startAt, endAt].some((d) => Number.isNaN(d.getTime()))) {
    redirect("/venue/competitions/new?error=dates");
  }

  const entryDollars = Number(String(formData.get("entryFee") ?? "0"));
  const entryFeeCents = Math.max(0, Math.round(entryDollars * 100));

  const teamFormat = parseEnum(String(formData.get("teamFormat")), formats, RegistrationFormat.SOLO);
  const teamSizeRaw = String(formData.get("teamSize") ?? "").trim();
  const teamSize = teamSizeRaw ? Math.min(20, Math.max(1, Number(teamSizeRaw))) : null;
  const captainRequired = formData.get("captainRequired") === "on";
  const participantCapRaw = String(formData.get("participantCap") ?? "").trim();
  const participantCap = participantCapRaw ? Math.max(1, Number(participantCapRaw)) : null;
  const waitlistEnabled = formData.get("waitlistEnabled") === "on";
  const rules = String(formData.get("rules") ?? "").trim() || "House rules posted night-of.";
  const waiverText = String(formData.get("waiverText") ?? "").trim() || null;
  const scheduleKind = parseEnum(String(formData.get("scheduleKind")), schedules, ScheduleKind.ONE_TIME);
  const bracketKind = parseEnum(String(formData.get("bracketKind")), brackets, BracketKind.ROUND_ROBIN);
  const recurringRule = String(formData.get("recurringRule") ?? "").trim() || null;
  const prizeSummary = String(formData.get("prizeSummary") ?? "").trim() || "Prizes TBA";
  const payoutNotes = String(formData.get("payoutNotes") ?? "").trim() || null;

  const publish = formData.get("publishNow") === "on";
  const status = publish ? CompetitionStatus.SIGNUP_OPEN : CompetitionStatus.DRAFT;

  const data = {
    venueId: access.venueId,
    title,
    slug,
    kind,
    description,
    signupOpenAt,
    signupCloseAt,
    startAt,
    endAt,
    entryFeeCents,
    teamFormat,
    teamSize,
    captainRequired,
    participantCap,
    waitlistEnabled,
    rules,
    waiverText,
    scheduleKind,
    bracketKind,
    recurringRule,
    status,
    publishedAt: publish ? new Date() : null,
    prizeStructure: {
      create: {
        summary: prizeSummary,
        payoutNotes,
      },
    },
  } satisfies Prisma.CompetitionUncheckedCreateInput;

  // Drafts are always free to create. Publishing takes an active slot - checked and created under
  // one per-venue lock (see lp-capacity.ts) so simultaneous publishes can't overshoot the limit.
  // At capacity, the work isn't thrown away: it's saved as a draft the venue can publish once a
  // slot frees up or after upgrading.
  let comp: { id: string; slug: string };
  let published = false;
  if (publish) {
    const result = await withActiveCompetitionSlot(access.venueId, {}, (tx) =>
      tx.competition.create({ data, select: { id: true, slug: true } }),
    );
    if (result.ok) {
      comp = result.value;
      published = true;
    } else {
      comp = await prisma.competition.create({
        data: { ...data, status: CompetitionStatus.DRAFT, publishedAt: null },
        select: { id: true, slug: true },
      });
    }
  } else {
    comp = await prisma.competition.create({ data, select: { id: true, slug: true } });
  }

  revalidatePath("/venue/dashboard");
  revalidatePath("/venue/competitions");
  if (published) pingIndexNow(`${getPublicSiteUrl()}/c/${access.slug}/${comp.slug}`);
  const suffix = published ? "&published=1" : publish ? "&notice=at-capacity" : "";
  redirect(`/venue/competitions/${comp.id}?created=1${suffix}`);
}
