import { StaffRole } from "@/generated/prisma/enums";

export function venueStaffCanCreateAndPublish(role: string | undefined): boolean {
  if (!role) return false;
  return role === StaffRole.OWNER || role === StaffRole.MANAGER;
}

export function venueStaffCanEditCompetitionResults(role: string | undefined): boolean {
  if (!role) return false;
  return role === StaffRole.OWNER || role === StaffRole.MANAGER || role === StaffRole.COORDINATOR;
}

export function venueStaffCanManageStaff(role: string | undefined): boolean {
  if (!role) return false;
  return role === StaffRole.OWNER || role === StaffRole.MANAGER;
}

export function venueStaffCanAssignOwner(actorRole: string | undefined): boolean {
  return actorRole === StaffRole.OWNER;
}

export function venueStaffCanAssignRole(actorRole: string | undefined, targetRole: StaffRole): boolean {
  if (!venueStaffCanManageStaff(actorRole)) return false;
  if (targetRole === StaffRole.OWNER) return actorRole === StaffRole.OWNER;
  return true;
}

export function venueRoleLabel(role: string | undefined): string {
  if (role === StaffRole.OWNER) return "Owner";
  if (role === StaffRole.MANAGER) return "Manager";
  if (role === StaffRole.COORDINATOR) return "Coordinator";
  return "Staff";
}
