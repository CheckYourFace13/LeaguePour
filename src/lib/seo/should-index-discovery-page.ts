export type ShouldIndexDiscoveryInput = {
  venueCount: number;
  competitionCount: number;
  /** Substantial on-page copy, FAQs, comparisons, and internal links (not an empty shell). */
  hasEditorialContent?: boolean;
};

/**
 * Page-level indexing for discovery/GEO pages.
 * Thin city+game shells with no data stay noindex,follow (not blocked in robots.txt).
 */
export function shouldIndexDiscoveryPage(input: ShouldIndexDiscoveryInput): boolean {
  if (input.venueCount >= 1 || input.competitionCount >= 1) return true;
  if (input.hasEditorialContent) return true;
  return false;
}

export function discoveryRobots(
  input: ShouldIndexDiscoveryInput,
): { index: boolean; follow: boolean } {
  const index = shouldIndexDiscoveryPage(input);
  return { index, follow: true };
}
