/** Marketing visuals in /public/marketing */

export const marketingImages = {
  /**
   * A real, cropped screenshot of the actual /demo page's standings/results panel (sample data,
   * clearly labeled). Replaced an AI-generated composite graphic that showed a fabricated
   * "Championship Bracket" and "Team Sign Up" card UI that doesn't match the real app - see the
   * visual-truth-audit commit for context. The exact same image file was previously also
   * duplicated under two other unused names (leaguepour-hero-tournament.png,
   * leaguepour-bracket-tools.png); those dead entries were removed rather than replaced.
   */
  realVenueNights: {
    src: "/marketing/lp-public-standings.webp",
    alt: "A real LeaguePour public competition page showing live standings (3-1-0 points system) and recent match results for a sample venue.",
    width: 848,
    height: 780,
  },
} as const;
