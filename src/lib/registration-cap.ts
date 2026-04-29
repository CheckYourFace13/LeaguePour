import { RegistrationStatus } from "@/generated/prisma/enums";

/** Registrations that reserve a spot toward participantCap. */
export const CAP_COUNT_STATUSES: RegistrationStatus[] = ["CONFIRMED", "PENDING_PAYMENT"];

export function registrationsTowardCap(competitionId: string) {
  return {
    competitionId,
    status: { in: CAP_COUNT_STATUSES },
  } as const;
}
