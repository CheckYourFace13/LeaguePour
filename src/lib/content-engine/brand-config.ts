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
  weeklyCap: number;
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
    weeklyCap: 2,
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
    weeklyCap: 3,
  },
};
