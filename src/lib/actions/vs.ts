"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";

// ── helpers ──────────────────────────────────────────────────────────────────

async function requireVenueAccess() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) throw new Error("Unauthorized");
  return access;
}

async function ensureVsConfig(venueId: string) {
  return prisma.venueVsConfig.upsert({
    where: { venueId },
    create: { venueId },
    update: {},
  });
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── leads ─────────────────────────────────────────────────────────────────────

export async function createPrivateEventLeadPublic(formData: FormData) {
  const venueId = String(formData.get("venueId"));
  if (!venueId) return { error: "Invalid venue" };

  const customerName = String(formData.get("customerName") || "").trim();
  const customerEmail = String(formData.get("customerEmail") || "").trim();
  if (!customerName || !customerEmail) return { error: "Name and email are required" };

  await prisma.privateEventLead.create({
    data: {
      venueId,
      customerName,
      customerEmail,
      customerPhone: String(formData.get("customerPhone") || "") || null,
      eventType: (String(formData.get("eventType")) as never) || "OTHER",
      preferredDate: formData.get("preferredDate")
        ? new Date(String(formData.get("preferredDate")))
        : null,
      guestCount: formData.get("guestCount") ? Number(formData.get("guestCount")) : null,
      budgetRange: String(formData.get("budgetRange") || "") || null,
      notes: String(formData.get("notes") || "") || null,
      source: "inquiry_form",
    },
  });

  return { ok: true };
}

export async function updateLeadStatus(leadId: string, status: string) {
  const access = await requireVenueAccess();
  await prisma.privateEventLead.updateMany({
    where: { id: leadId, venueId: access.venueId },
    data: { status: status as never },
  });
  revalidatePath("/app/leads");
  revalidatePath(`/app/leads/${leadId}`);
}

export async function createEventFromLead(leadId: string) {
  const access = await requireVenueAccess();
  const lead = await prisma.privateEventLead.findFirst({
    where: { id: leadId, venueId: access.venueId },
  });
  if (!lead) throw new Error("Lead not found");

  const event = await prisma.privateEvent.create({
    data: {
      venueId: access.venueId,
      leadId,
      eventName: `${lead.customerName} — ${lead.eventType.replace(/_/g, " ")}`,
      eventType: lead.eventType,
      eventDate: lead.preferredDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      startTime: lead.startTime ?? "18:00",
      endTime: lead.endTime ?? "22:00",
      guestCountEstimated: lead.guestCount,
      status: "INQUIRY",
    },
  });

  await prisma.privateEventLead.update({
    where: { id: leadId },
    data: { status: "BOOKED" },
  });

  revalidatePath("/app/leads");
  revalidatePath("/app/events");
  redirect(`/app/events/${event.id}`);
}

// ── proposals ─────────────────────────────────────────────────────────────────

export async function createProposal(eventId: string, formData: FormData) {
  const access = await requireVenueAccess();
  const event = await prisma.privateEvent.findFirst({
    where: { id: eventId, venueId: access.venueId },
  });
  if (!event) throw new Error("Event not found");

  const depositAmount = Math.round(Number(formData.get("depositAmount") || 0) * 100);
  const roomFee = Math.round(Number(formData.get("roomFee") || 0) * 100);
  const minimumSpend = Math.round(Number(formData.get("minimumSpend") || 0) * 100);

  const lineItems: { description: string; qty: number; unitCents: number }[] = [];
  const descriptions = formData.getAll("itemDesc");
  const qtys = formData.getAll("itemQty");
  const prices = formData.getAll("itemPrice");
  for (let i = 0; i < descriptions.length; i++) {
    const desc = String(descriptions[i]).trim();
    if (desc) {
      lineItems.push({
        description: desc,
        qty: Number(qtys[i]) || 1,
        unitCents: Math.round(Number(prices[i]) * 100) || 0,
      });
    }
  }

  const totalAmount =
    roomFee + minimumSpend + lineItems.reduce((s, li) => s + li.qty * li.unitCents, 0);

  const proposal = await prisma.vsProposal.create({
    data: {
      privateEventId: eventId,
      depositAmount,
      roomFee,
      minimumSpend,
      totalAmount,
      lineItems,
      status: "DRAFT",
    },
  });

  await prisma.privateEvent.update({
    where: { id: eventId },
    data: { status: "PROPOSAL_OUT" },
  });

  revalidatePath(`/app/events/${eventId}`);
  redirect(`/app/proposals/${proposal.id}`);
}

export async function sendProposal(proposalId: string) {
  const access = await requireVenueAccess();
  const proposal = await prisma.vsProposal.findFirst({
    where: { id: proposalId, privateEvent: { venueId: access.venueId } },
    include: { privateEvent: true },
  });
  if (!proposal) throw new Error("Not found");

  await prisma.vsProposal.update({
    where: { id: proposalId },
    data: { status: "SENT" },
  });

  revalidatePath(`/app/proposals/${proposalId}`);
  revalidatePath(`/app/events/${proposal.privateEventId}`);
}

export async function acceptProposal(token: string) {
  const proposal = await prisma.vsProposal.findUnique({ where: { publicToken: token } });
  if (!proposal || proposal.status === "ACCEPTED") return { error: "Not found" };

  await prisma.vsProposal.update({
    where: { id: proposal.id },
    data: { status: "ACCEPTED", acceptedAt: new Date(), viewedAt: proposal.viewedAt ?? new Date() },
  });

  await prisma.privateEvent.update({
    where: { id: proposal.privateEventId },
    data: { status: "CONTRACT_OUT" },
  });

  return { ok: true, proposalId: proposal.id, eventId: proposal.privateEventId };
}

export async function markProposalViewed(token: string) {
  const proposal = await prisma.vsProposal.findUnique({ where: { publicToken: token } });
  if (!proposal || proposal.viewedAt) return;
  await prisma.vsProposal.update({
    where: { id: proposal.id },
    data: { viewedAt: new Date() },
  });
}

// ── contracts ─────────────────────────────────────────────────────────────────

export async function createContract(eventId: string, proposalId?: string) {
  const access = await requireVenueAccess();
  const event = await prisma.privateEvent.findFirst({
    where: { id: eventId, venueId: access.venueId },
    include: { lead: true, vsCustomer: true },
  });
  if (!event) throw new Error("Event not found");

  const vsConfig = await ensureVsConfig(access.venueId);

  const defaultContract = `PRIVATE EVENT AGREEMENT

This agreement is between ${event.lead?.customerName ?? "the client"} ("Client") and the venue ("Venue") for the following event:

Event: ${event.eventName}
Date: ${event.eventDate.toLocaleDateString()}
Time: ${event.startTime} – ${event.endTime}
Estimated Guests: ${event.guestCountEstimated ?? "TBD"}

DEPOSIT
A non-refundable deposit is due within 48 hours of signing. The deposit amount is specified in the associated proposal. The date is not reserved until the deposit is received.

CANCELLATION
Cancellations made more than 30 days before the event: deposit retained, no additional charge.
Cancellations within 30 days: deposit retained plus 50% of estimated total.
Cancellations within 7 days: deposit retained plus 75% of estimated total.

FINAL GUEST COUNT
A final guest count is required 5 business days before the event. The venue will prepare for that number. The Client is responsible for payment based on the final count.

FOOD & BEVERAGE
Outside food and beverage is not permitted unless pre-approved in writing by the Venue. All food and beverage must be purchased through the Venue.

LIABILITY
The Venue is not responsible for lost, stolen, or damaged personal property. The Client assumes responsibility for the conduct of all guests.

By signing this agreement, the Client confirms they have read, understood, and agreed to these terms.

${vsConfig.contractTemplate ?? ""}`;

  const contract = await prisma.vsContract.create({
    data: {
      privateEventId: eventId,
      proposalId: proposalId ?? null,
      contractText: defaultContract,
      status: "DRAFT",
    },
  });

  await prisma.privateEvent.update({
    where: { id: eventId },
    data: { status: "CONTRACT_OUT" },
  });

  revalidatePath(`/app/events/${eventId}`);
  redirect(`/app/contracts/${contract.id}`);
}

export async function sendContract(contractId: string) {
  const access = await requireVenueAccess();
  const contract = await prisma.vsContract.findFirst({
    where: { id: contractId, privateEvent: { venueId: access.venueId } },
  });
  if (!contract) throw new Error("Not found");

  await prisma.vsContract.update({
    where: { id: contractId },
    data: { status: "SENT" },
  });

  revalidatePath(`/app/contracts/${contractId}`);
}

export async function signContract(token: string, formData: FormData) {
  const contract = await prisma.vsContract.findUnique({
    where: { publicToken: token },
    include: { privateEvent: true },
  });
  if (!contract || contract.status === "SIGNED") return { error: "Not found or already signed" };

  const signerName = String(formData.get("signerName") || "").trim();
  const signerEmail = String(formData.get("signerEmail") || "").trim();
  const typedSignature = String(formData.get("typedSignature") || "").trim();
  const agreed = formData.get("agreed") === "on";

  if (!signerName || !typedSignature || !agreed) {
    return { error: "All fields are required and you must agree to the terms." };
  }

  await prisma.vsContract.update({
    where: { id: contract.id },
    data: {
      status: "SIGNED",
      signerName,
      signerEmail,
      typedSignature,
      signedAt: new Date(),
    },
  });

  await prisma.privateEvent.update({
    where: { id: contract.privateEventId },
    data: { status: "DEPOSIT_DUE" },
  });

  return { ok: true, eventId: contract.privateEventId };
}

// ── BEO ───────────────────────────────────────────────────────────────────────

export async function createBeo(eventId: string) {
  const access = await requireVenueAccess();
  const event = await prisma.privateEvent.findFirst({
    where: { id: eventId, venueId: access.venueId },
    include: { lead: true, vsCustomer: true, eventSpace: true },
  });
  if (!event) throw new Error("Event not found");

  const beo = await prisma.vsBeo.create({
    data: {
      privateEventId: eventId,
      eventSummary: `${event.eventName} | ${event.eventDate.toLocaleDateString()} | ${event.startTime}–${event.endTime} | ${event.guestCountEstimated ?? "?"} guests`,
      contactInfo: {
        name: event.lead?.customerName ?? event.vsCustomer?.name ?? "",
        email: event.lead?.customerEmail ?? event.vsCustomer?.email ?? "",
        phone: event.lead?.customerPhone ?? event.vsCustomer?.phone ?? "",
      },
      roomSetup: event.eventSpace?.name ? `Room: ${event.eventSpace.name}` : null,
      status: "DRAFT",
    },
  });

  await prisma.privateEvent.update({
    where: { id: eventId },
    data: { status: "BEO_DRAFT" },
  });

  revalidatePath(`/app/events/${eventId}`);
  redirect(`/app/beos/${beo.id}`);
}

export async function saveBeo(beoId: string, formData: FormData) {
  const access = await requireVenueAccess();
  const beo = await prisma.vsBeo.findFirst({
    where: { id: beoId, privateEvent: { venueId: access.venueId } },
  });
  if (!beo) throw new Error("Not found");

  await prisma.vsBeo.update({
    where: { id: beoId },
    data: {
      foodDetails: String(formData.get("foodDetails") || "") || null,
      beverageDetails: String(formData.get("beverageDetails") || "") || null,
      roomSetup: String(formData.get("roomSetup") || "") || null,
      staffingNotes: String(formData.get("staffingNotes") || "") || null,
      avNeeds: String(formData.get("avNeeds") || "") || null,
      allergies: String(formData.get("allergies") || "") || null,
      specialInstructions: String(formData.get("specialInstructions") || "") || null,
      internalNotes: String(formData.get("internalNotes") || "") || null,
      status: formData.get("status") === "FINAL" ? "FINAL" : "NEEDS_REVIEW",
      finalizedAt: formData.get("status") === "FINAL" ? new Date() : null,
    },
  });

  revalidatePath(`/app/beos/${beoId}`);
}

// ── customers ─────────────────────────────────────────────────────────────────

export async function upsertVsCustomer(venueId: string, data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}) {
  return prisma.vsCustomer.upsert({
    where: { venueId_email: { venueId, email: data.email } },
    create: { venueId, ...data },
    update: { name: data.name, phone: data.phone, company: data.company },
  });
}
