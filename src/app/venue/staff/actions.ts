"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { StaffRole } from "@/generated/prisma/enums";
import { resolvePrimaryVenueAccess, venueStaffCanAssignRole, venueStaffCanManageStaff } from "@/lib/venue-permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseRole(v: string): StaffRole | null {
  if (v === StaffRole.OWNER || v === StaffRole.MANAGER || v === StaffRole.COORDINATOR) return v;
  return null;
}

export async function addVenueStaffByEmailFormAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const roleRaw = String(formData.get("role") ?? "");
  const newRole = parseRole(roleRaw);
  if (!email || !newRole) redirect("/venue/staff?notice=invalid");

  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanManageStaff(access.role)) redirect("/venue/staff?notice=forbidden");
  if (!venueStaffCanAssignRole(access.role, newRole)) redirect("/venue/staff?notice=forbidden");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) redirect("/venue/staff?notice=no-user");

  const existing = await prisma.venueStaff.findUnique({
    where: { venueId_userId: { venueId: access.venueId, userId: user.id } },
  });
  if (existing) redirect("/venue/staff?notice=exists");

  await prisma.venueStaff.create({
    data: { venueId: access.venueId, userId: user.id, role: newRole },
  });

  revalidatePath("/venue/staff");
  revalidatePath("/venue/dashboard");
  redirect("/venue/staff?notice=added");
}

export async function updateVenueStaffRoleFormAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const roleRaw = String(formData.get("role") ?? "");
  const newRole = parseRole(roleRaw);
  if (!userId || !newRole) redirect("/venue/staff?notice=invalid");

  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) redirect("/login?callbackUrl=/venue/staff");
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanManageStaff(access.role)) redirect("/venue/staff?notice=forbidden");
  if (!venueStaffCanAssignRole(access.role, newRole)) redirect("/venue/staff?notice=forbidden");
  if (userId === uid) redirect("/venue/staff?notice=self");

  const target = await prisma.venueStaff.findUnique({
    where: { venueId_userId: { venueId: access.venueId, userId } },
  });
  if (!target) redirect("/venue/staff?notice=missing");

  if (target.role === StaffRole.OWNER && access.role === StaffRole.MANAGER) {
    redirect("/venue/staff?notice=forbidden");
  }

  if (target.role === StaffRole.OWNER && newRole !== StaffRole.OWNER) {
    const owners = await prisma.venueStaff.count({
      where: { venueId: access.venueId, role: StaffRole.OWNER },
    });
    if (owners <= 1) redirect("/venue/staff?notice=last-owner");
  }

  await prisma.venueStaff.update({
    where: { venueId_userId: { venueId: access.venueId, userId } },
    data: { role: newRole },
  });

  revalidatePath("/venue/staff");
  redirect("/venue/staff?notice=updated");
}

export async function removeVenueStaffFormAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  if (!userId) redirect("/venue/staff?notice=invalid");

  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) redirect("/login?callbackUrl=/venue/staff");
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanManageStaff(access.role)) redirect("/venue/staff?notice=forbidden");
  if (userId === uid) redirect("/venue/staff?notice=self");

  const target = await prisma.venueStaff.findUnique({
    where: { venueId_userId: { venueId: access.venueId, userId } },
  });
  if (!target) redirect("/venue/staff?notice=missing");

  if (target.role === StaffRole.OWNER && access.role === StaffRole.MANAGER) {
    redirect("/venue/staff?notice=forbidden");
  }

  if (target.role === StaffRole.OWNER) {
    const owners = await prisma.venueStaff.count({
      where: { venueId: access.venueId, role: StaffRole.OWNER },
    });
    if (owners <= 1) redirect("/venue/staff?notice=last-owner");
  }

  await prisma.venueStaff.delete({
    where: { venueId_userId: { venueId: access.venueId, userId } },
  });

  revalidatePath("/venue/staff");
  revalidatePath("/venue/dashboard");
  redirect("/venue/staff?notice=removed");
}
