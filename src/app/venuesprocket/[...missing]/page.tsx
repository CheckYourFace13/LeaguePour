import { notFound } from "next/navigation";

// Unknown venuesprocket.com paths are rewritten here by middleware.ts (same host, no redirect), so
// they get a real 404 with VenueSprocket branding (venuesprocket/not-found.tsx inside the VS
// layout) instead of falling through to leaguepour.com. Every real VS route is more specific than
// this catch-all, so it only ever matches paths that don't exist.
export default function VsUnknownPath() {
  notFound();
}
