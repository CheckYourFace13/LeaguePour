import { matchEditorialPage, toRecommendedLinks } from "@/lib/affiliate-registry";

/** Disabled until a CJ or Impact row is approved for leaguepour or venuesprocket. */
export function editorialAdvertiserLinks(opts: {
  website?: "leaguepour" | "venuesprocket";
  categories?: string[];
  text?: string;
  productNames?: string[];
}) {
  return toRecommendedLinks(
    matchEditorialPage({
      website: opts.website ?? "leaguepour",
      categories: opts.categories,
      text: opts.text,
      productNames: opts.productNames,
    }),
  );
}
