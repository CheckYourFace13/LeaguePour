import type { CompetitionKind } from "@/generated/prisma/enums";

export type DiscoveryGame = {
  slug: string;
  kind: CompetitionKind;
  label: string;
  pluralLabel: string;
  patronHeadline: string;
  softwarePath: string;
  softwareSoftwarePath: string;
  findPath: string;
};

export const DISCOVERY_GAMES: DiscoveryGame[] = [
  {
    slug: "darts",
    kind: "DARTS",
    label: "Dart league",
    pluralLabel: "Dart leagues",
    patronHeadline: "Find dart leagues near you",
    softwarePath: "/dart-league-software",
    softwareSoftwarePath: "/software/dart-league-software",
    findPath: "/find/dart-leagues",
  },
  {
    slug: "cornhole",
    kind: "CORNHOLE",
    label: "Cornhole tournament",
    pluralLabel: "Cornhole tournaments",
    patronHeadline: "Find cornhole tournaments near you",
    softwarePath: "/cornhole-tournament-software",
    softwareSoftwarePath: "/software/cornhole-tournament-software",
    findPath: "/find/cornhole-tournaments",
  },
  {
    slug: "trivia",
    kind: "TRIVIA",
    label: "Trivia night",
    pluralLabel: "Trivia nights",
    patronHeadline: "Find trivia nights near you",
    softwarePath: "/bar-trivia-software",
    softwareSoftwarePath: "/software/trivia-night-signup-software",
    findPath: "/find/trivia-nights",
  },
  {
    slug: "euchre",
    kind: "EUCHRE",
    label: "Euchre league",
    pluralLabel: "Euchre leagues",
    patronHeadline: "Find euchre leagues near you",
    softwarePath: "/euchre-tournament-software",
    softwareSoftwarePath: "/software/euchre-tournament-software",
    findPath: "/find/euchre-leagues",
  },
  {
    slug: "pool",
    kind: "POOL",
    label: "Pool tournament",
    pluralLabel: "Pool tournaments",
    patronHeadline: "Find pool tournaments near you",
    softwarePath: "/pool-league-management",
    softwareSoftwarePath: "/software/pool-tournament-software",
    findPath: "/find/pool-tournaments",
  },
  {
    slug: "poker",
    kind: "POKER",
    label: "Poker night",
    pluralLabel: "Poker nights",
    patronHeadline: "Find poker nights near you",
    softwarePath: "/poker-tournament-software",
    softwareSoftwarePath: "/software/poker-tournament-software",
    findPath: "/find/poker-nights",
  },
  {
    slug: "shuffleboard",
    kind: "SHUFFLEBOARD",
    label: "Shuffleboard league",
    pluralLabel: "Shuffleboard leagues",
    patronHeadline: "Find shuffleboard leagues near you",
    softwarePath: "/shuffleboard-league-software",
    softwareSoftwarePath: "/software/shuffleboard-league-software",
    findPath: "/find/shuffleboard-leagues",
  },
];

export function getDiscoveryGameBySlug(slug: string): DiscoveryGame | null {
  return DISCOVERY_GAMES.find((g) => g.slug === slug) ?? null;
}

export function getAllDiscoveryGameSlugs(): string[] {
  return DISCOVERY_GAMES.map((g) => g.slug);
}

export function getDiscoveryGameByKind(kind: CompetitionKind): DiscoveryGame | null {
  return DISCOVERY_GAMES.find((g) => g.kind === kind) ?? null;
}
