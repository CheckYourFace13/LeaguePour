import { CompetitionKind } from "@/generated/prisma/enums";

/** Event types shown on the player preferences form (server actions + UI must stay in sync). */
export const PREFERENCE_EVENT_TYPES: CompetitionKind[] = [
  CompetitionKind.DARTS,
  CompetitionKind.CORNHOLE,
  CompetitionKind.TRIVIA,
  CompetitionKind.EUCHRE,
  CompetitionKind.POOL,
  CompetitionKind.POKER,
  CompetitionKind.SHUFFLEBOARD,
  CompetitionKind.CUSTOM,
];
