import { VS_HOST, LP_HOST } from "@/lib/vs-routing";
import type { Brand } from "./types";

export type BrandConfig = {
  brand: Brand;
  name: string;
  host: string;
  guidesBasePath: string;
  publisherLogoUrl: string;
  ctaHref: string;
  ctaLabel: string;
  /** Titles of existing hand-written static guides - never regenerate/duplicate these topics. */
  existingGuideTitles: string[];
  /** Relative paths (existing static guides + core product pages) a body is allowed to link to,
   * checked by quality-gate.ts's internal-link validation - in addition to any currently
   * PUBLISHED Guide slug, added dynamically by internalPathsForBrand() in publish.ts. */
  staticKnownPaths: string[];
  weeklyCap: number;
  /** Buffer of unfilled (bodyHtml null) NEEDS_CONTENT rows to keep queued at once. */
  queueBuffer: number;
};

export const BRANDS: Record<Brand, BrandConfig> = {
  LP: {
    brand: "LP",
    name: "LeaguePour",
    host: LP_HOST,
    guidesBasePath: "/guides",
    publisherLogoUrl: `https://${LP_HOST}/logos/leaguepour-icon.png`,
    ctaHref: "/signup/venue",
    ctaLabel: "Start hosting events - free",
    existingGuideTitles: [
      "25 Bar Competition Ideas That Fill Seats",
      "How to Run Trivia Night at Your Bar",
      "Cornhole Tournament Ideas for Bars",
      "How Standings and Points Systems Work",
      "How to Collect Entry Fees at Your Bar (The Right Way)",
      "How to Increase Bar Traffic on Slow Nights",
      "How to Run a Dart League at Your Bar",
      "How to Start a Pool League at Your Bar",
      "Managing No-Shows and Forfeits",
      "Round Robin vs. Single Elimination for Bars",
    ],
    staticKnownPaths: [
      "/", "/guides", "/pricing", "/demo", "/features", "/features/tournaments", "/for-venues", "/for-players",
      "/signup/venue", "/faq", "/how-it-works", "/contact",
      "/guides/bar-competition-ideas", "/guides/bar-trivia-night-guide", "/guides/cornhole-tournament-ideas-for-bars",
      "/guides/how-standings-and-points-work", "/guides/how-to-collect-entry-fees-at-your-bar",
      "/guides/how-to-increase-bar-traffic-on-slow-nights", "/guides/how-to-run-a-dart-league-at-your-bar",
      "/guides/how-to-start-a-pool-league", "/guides/managing-no-shows-and-forfeits",
      "/guides/round-robin-vs-single-elimination",
    ],
    weeklyCap: 2,
    queueBuffer: 5,
  },
  VS: {
    brand: "VS",
    name: "VenueSprocket",
    host: VS_HOST,
    guidesBasePath: "/guides",
    publisherLogoUrl: `https://${VS_HOST}/logos/venuesprocket-icon.png`,
    ctaHref: "/start",
    ctaLabel: "Start Free",
    existingGuideTitles: [
      "What Is a BEO? Banquet Event Order Explained",
      "BEO vs. Contract: What's the Difference?",
      "Private Event Inquiry Form Template",
      "Sample Proposal and Contract",
      "BEO Template",
    ],
    staticKnownPaths: [
      "/", "/guides", "/pricing", "/start", "/features", "/about", "/contact", "/leaguepour",
      "/guides/what-is-a-beo", "/guides/beo-template", "/guides/beo-vs-contract",
      "/guides/private-event-inquiry-form-template", "/guides/sample-proposal-and-contract",
    ],
    weeklyCap: 3,
    queueBuffer: 5,
  },
};
