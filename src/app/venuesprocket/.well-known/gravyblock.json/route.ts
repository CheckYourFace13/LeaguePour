import { VENUESPROCKET_BUSINESS_ID } from "@/lib/gravyblock-managed";

export const dynamic = "force-static";

/** Served as venuesprocket.com/.well-known/gravyblock.json (the host middleware rewrites unknown VS paths into this tree). */
export function GET() {
  return Response.json({ connector: "gravyblock-managed", version: 1, businessId: VENUESPROCKET_BUSINESS_ID });
}
