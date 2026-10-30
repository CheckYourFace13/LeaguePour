/**
 * "Title | Brand" when that fits in about 60 characters, otherwise the title alone - long article
 * titles already carry the search intent, and a trailing brand just gets truncated in results.
 * 60 is a practical target, not a hard limit.
 */
export function brandedTitle(title: string, brand: string, max = 60): string {
  const full = `${title} | ${brand}`;
  return full.length <= max ? full : title;
}
