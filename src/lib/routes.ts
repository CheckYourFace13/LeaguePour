export const marketingRoutes = {
  home: "/",
  howItWorks: "/how-it-works",
  features: "/features",
  forVenues: "/for-venues",
  forPlayers: "/for-players",
  pricing: "/pricing",
  faq: "/faq",
  contact: "/contact",
  terms: "/legal/terms",
  privacy: "/legal/privacy",
} as const;

export const venueAppRoutes = {
  dashboard: "/venue/dashboard",
  competitions: "/venue/competitions",
  createCompetition: "/venue/competitions/new",
  registrations: "/venue/registrations",
  teams: "/venue/teams",
  standings: "/venue/standings",
  marketing: "/venue/marketing",
  audience: "/venue/audience",
  messages: "/venue/messages",
  campaignsNew: "/venue/campaigns/new",
  settings: "/venue/settings",
  profile: "/venue/profile",
  staff: "/venue/staff",
} as const;

export const playerAppRoutes = {
  dashboard: "/player/dashboard",
  competitions: "/player/competitions",
  discover: "/player/discover",
  venues: "/player/venues",
  preferences: "/player/preferences",
  payments: "/player/payments",
  settings: "/player/settings",
} as const;
