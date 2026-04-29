"use server";

import { auth } from "@/auth";
import {
  BracketKind,
  CompetitionKind,
  CompetitionStatus,
  RegistrationFormat,
  ScheduleKind,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess, venueStaffCanCreateAndPublish } from "@/lib/venue-permissions";
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

  const comp = await prisma.competition.create({
    data: {
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
    },
  });

  revalidatePath("/venue/dashboard");
  revalidatePath("/venue/competitions");
  redirect(`/venue/competitions/${comp.id}`);
}
