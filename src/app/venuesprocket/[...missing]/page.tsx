import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { vsBrandMetadata } from "@/lib/vs-metadata";

// Same as not-found.tsx: the page segment's own metadata is what the client applies after
// hydration, so without this the 404 fell back to the layout title.
export const metadata: Metadata = {
  ...vsBrandMetadata,
  title: { absolute: "Page not found | VenueSprocket" },
  robots: { index: false, follow: false },
};

// Unknown venuesprocket.com paths are rewritten here by middleware.ts (same host, no redirect), so
// they get a real 404 with VenueSprocket branding (venuesprocket/not-found.tsx inside the VS
// layout) instead of falling through to leaguepour.com. Every real VS route is more specific than
// this catch-all, so it only ever matches paths that don't exist.
export default function VsUnknownPath() {
  notFound();
}
