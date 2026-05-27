/** LeaguePour — brand voice & reusable marketing copy (Phase 1 + 4). */

export const brand = {
  name: "LeaguePour",
  tagline: "Run competitions. Grow repeat traffic.",
  positioning: "Participation competitions for venues.",
  pillars: [
    "Bold, modern, nightlife-friendly",
    "Simple for players, guided for operators",
    "Premium without corporate stiffness",
  ],
  audience: {
    venues: "Owners, managers, and hosts running brackets, leagues, and buy-in nights.",
    players: "People who pay to play, come back, and want clear rules and deadlines.",
  },
} as const;

export const cta = {
  /** Primary venue acquisition — same label everywhere for clarity */
  startVenue: "Start hosting events",
  viewPricing: "See pricing",
  browseEvents: "Find events",
  joinPlayer: "Find events",
  signup: "Sign up",
  login: "Log in",
  buildCompetition: "New competition",
  register: "Join this competition",
  venueDashboard: "Venue home",
  playerDashboard: "Player home",
  /** @deprecated use startVenue */
  trial: "Start hosting events",
} as const;
