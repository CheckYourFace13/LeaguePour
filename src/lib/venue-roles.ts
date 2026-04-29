/** @deprecated Prefer `@/lib/venue-access-policy` or `@/lib/venue-permissions` explicitly. */
export {
  venueRoleLabel,
  venueStaffCanAssignOwner,
  venueStaffCanAssignRole,
  venueStaffCanCreateAndPublish,
  venueStaffCanEditCompetitionResults,
  venueStaffCanManageStaff,
} from "./venue-access-policy";

export { resolvePrimaryVenueAccess } from "./venue-permissions";
