import { matchEditorialPage, toRecommendedLinks } from "@/lib/affiliate-registry";

/**
 * Disabled until a CJ or Impact row is approved for leaguepour or venuesprocket. The website is
 * required: a VenueSprocket page must never fall back to LeaguePour's links or PID.
 */
export function editorialAdvertiserLinks(opts: {
  website: "leaguepour" | "venuesprocket";
  categories?: string[];
  text?: string;
  productNames?: string[];
}) {
  return toRecommendedLinks(
    matchEditorialPage({
      website: opts.website,
      categories: opts.categories,
      text: opts.text,
      productNames: opts.productNames,
    }),
    opts.website,
  );
}
