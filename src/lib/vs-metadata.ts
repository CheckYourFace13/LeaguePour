import type { Metadata } from "next";
import { VS_HOST } from "@/lib/vs-routing";

/**
 * Brand-identity metadata every VenueSprocket-rendered route must set explicitly. The root
 * layout (src/app/layout.tsx) is LeaguePour's and defines applicationName, keywords, OG/Twitter
 * defaults, and a "/" canonical against leaguepour.com - Next merges those into every page that
 * doesn't override them, so without this VS pages shipped application-name="LeaguePour", LP's
 * bar-trivia/dart-league keywords, and (on auth/app pages) a leaguepour.com canonical.
 *
 * Spread first, then a page's own fields: `{ ...vsBrandMetadata, title: ..., robots: ... }`.
 * Pages that need a canonical set their own `alternates`; `alternates: null` here clears the
 * root layout's LP-pointing "/" canonical for the private (noindex) VS routes that don't.
 */
export const vsBrandMetadata: Metadata = {
  metadataBase: new URL(`https://${VS_HOST}`),
  applicationName: "VenueSprocket",
  keywords: [
    "private event management software",
    "private event booking",
    "banquet event order",
    "BEO software",
    "event contract software",
    "event deposit software",
    "restaurant private events",
    "VenueSprocket",
  ],
  alternates: null,
  openGraph: {
    siteName: "VenueSprocket",
    title: "VenueSprocket",
    description: "Private event management for restaurants, breweries, bars, taprooms, and event spaces.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VenueSprocket",
    description: "Private event management for restaurants, breweries, bars, taprooms, and event spaces.",
  },
};
