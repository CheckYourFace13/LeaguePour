"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwnerSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { findEmailOnWebsite, isPlausibleEmail } from "@/lib/outreach-email";
import { OWNER_SETTABLE, type ProspectStatus } from "@/lib/acquisition/program";
import { draftProblems } from "@/lib/acquisition/drafts";
import { ensureAcquisitionTable, importProspects, sendApprovedProspect } from "@/lib/acquisition/store";
import { parseProspectFile } from "@/lib/acquisition/prospects.data";
import { AUTO_QUALIFY_KEY, DAILY_REPORT_KEY, setAutomationSwitch } from "@/lib/acquisition/automation";

const PATH = "/internal/acquisition";

function back(params: Record<string, string>): never {
  const q = new URLSearchParams(params);
  redirect(`${PATH}?${q.toString()}`);
}

function str(fd: FormData, k: string): string {
  const v = fd.get(k);
  return typeof v === "string" ? v : "";
}

/**
 * Imports the researched list from an uploaded JSON file (kept out of the public repo, in the
 * owner's private/acquisition folder). Idempotent: already-imported prospects are skipped.
 */
export async function importProspectsAction(fd: FormData) {
  await requireOwnerSession();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) back({ error: "Choose the prospect JSON file first." });
  if (file.size > 2_000_000) back({ error: "File too large (max 2 MB)." });
  const { seeds, error } = parseProspectFile(await file.text());
  if (error) back({ error: `Import failed: ${error}` });
  const r = await importProspects(seeds);
  revalidatePath(PATH);
  back({
    notice: `Imported ${r.created} (queued ${r.queued}, suppressed ${r.suppressed}); ${r.alreadyImported} already imported${r.invalid.length ? `; ${r.invalid.length} invalid rows skipped: ${r.invalid.slice(0, 3).join("; ")}` : ""}.`,
  });
}

/** Approve one prospect. Approval never sends; Send is a separate click. */
export async function approveProspectAction(fd: FormData) {
  await requireOwnerSession();
  await ensureAcquisitionTable();
  const id = str(fd, "id");
  const p = await prisma.acquisitionProspect.findUnique({ where: { id }, select: { status: true, email: true, draftSubject: true, draftBody: true } });
  if (!p || p.status !== "QUEUED") back({ error: "Only queued prospects can be approved." });
  const problems = draftProblems({ subject: p.draftSubject, body: p.draftBody });
  if (problems.length) back({ error: `Draft blocked: ${problems.join("; ")}` });
  await prisma.acquisitionProspect.update({ where: { id }, data: { status: "APPROVED", approvedAt: new Date() } });
  revalidatePath(PATH);
  back({ notice: p.email ? "Approved. Press Send when you're ready." : "Approved. No email on file: contact them through the route shown." });
}

export async function sendProspectAction(fd: FormData) {
  await requireOwnerSession();
  const r = await sendApprovedProspect(str(fd, "id"));
  revalidatePath(PATH);
  back(r.ok ? { notice: "Sent." } : { error: r.error ?? "Send failed." });
}

export async function setProspectStatusAction(fd: FormData) {
  await requireOwnerSession();
  await ensureAcquisitionTable();
  const id = str(fd, "id");
  const status = str(fd, "status") as ProspectStatus;
  if (!OWNER_SETTABLE.includes(status)) back({ error: "That status can't be set by hand." });
  const p = await prisma.acquisitionProspect.findUnique({ where: { id }, select: { status: true } });
  if (!p) back({ error: "Prospect not found." });
  if (["UNSUBSCRIBED", "BOUNCED", "COMPLAINED"].includes(p.status)) back({ error: "Opted-out prospects can't be changed." });
  if (status === "QUEUED" && !["APPROVED", "SKIPPED"].includes(p.status)) back({ error: "Only approved or skipped prospects can go back to the queue." });
  await prisma.acquisitionProspect.update({
    where: { id },
    data: {
      status,
      ...(status === "QUEUED" ? { approvedAt: null } : {}),
      ...(["REPLIED", "POSITIVE"].includes(status) || (status === "NOT_INTERESTED" && p.status !== "QUEUED") ? { repliedAt: new Date() } : {}),
    },
  });
  revalidatePath(PATH);
  back({ notice: `Marked ${status.toLowerCase().replace("_", " ")}.` });
}

export async function saveDraftAction(fd: FormData) {
  await requireOwnerSession();
  await ensureAcquisitionTable();
  const id = str(fd, "id");
  const subject = str(fd, "subject").trim().slice(0, 200);
  const body = str(fd, "body").replace(/\r\n/g, "\n").trim().slice(0, 6000);
  const notes = str(fd, "notes").trim().slice(0, 2000);
  const emailRaw = str(fd, "email").trim().toLowerCase();
  if (!subject || !body) back({ error: "Subject and body are required." });
  if (emailRaw && !isPlausibleEmail(emailRaw)) back({ error: "That email address doesn't look valid." });
  const problems = draftProblems({ subject, body });
  if (problems.length) back({ error: `Draft not saved: ${problems.join("; ")}` });
  const p = await prisma.acquisitionProspect.findUnique({ where: { id }, select: { status: true } });
  if (!p || !["QUEUED", "APPROVED", "SKIPPED"].includes(p.status)) back({ error: "Only unsent prospects can be edited." });
  await prisma.acquisitionProspect.update({
    where: { id },
    data: { draftSubject: subject, draftBody: body, notes: notes || null, email: emailRaw || null, contactRoute: emailRaw ? "email" : undefined },
  });
  revalidatePath(PATH);
  back({ notice: "Draft saved.", open: id });
}

/** Looks for an address the business publishes on its own website (same scanner as the outreach list). */
export async function findPublicEmailAction(fd: FormData) {
  await requireOwnerSession();
  await ensureAcquisitionTable();
  const id = str(fd, "id");
  const p = await prisma.acquisitionProspect.findUnique({ where: { id }, select: { website: true, email: true, status: true } });
  if (!p?.website) back({ error: "No website on file." });
  if (p.email) back({ notice: "Already has an email." });
  const email = await findEmailOnWebsite(p.website).catch(() => null);
  if (!email) back({ error: "No published email found on their site. Use their contact form or phone." });
  await prisma.acquisitionProspect.update({
    where: { id },
    data: { email, contactRoute: "email", notes: `Email found on their website ${new Date().toISOString().slice(0, 10)}` },
  });
  revalidatePath(PATH);
  back({ notice: `Found ${email} on their website. Check it before approving.` });
}

/** Owner kill switches for the daily qualification pass and the daily report. */
export async function toggleAutomationAction(fd: FormData) {
  await requireOwnerSession();
  const key = str(fd, "key") === "qualify" ? AUTO_QUALIFY_KEY : str(fd, "key") === "report" ? DAILY_REPORT_KEY : null;
  if (!key) back({ error: "Unknown switch." });
  const on = str(fd, "on") === "true";
  await setAutomationSwitch(key, on);
  revalidatePath(PATH);
  back({ notice: `${key === AUTO_QUALIFY_KEY ? "Daily qualification" : "Daily report"} turned ${on ? "on" : "off"}.` });
}
