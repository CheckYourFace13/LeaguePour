import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { resolveSelectedPlan, signupBrandFromHost } from "@/lib/signup-plans";
import { SignupVenueForm } from "@/components/auth/signup-venue-form";

// Per-request: brand comes from the Host header and the signed-in state from the session.
export const dynamic = "force-dynamic";

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

export default async function SignupVenuePage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const host = (await headers()).get("host");
  // Brand from the trustworthy host, not a query flag a link can drop - a direct visit to
  // venuesprocket.com/signup/venue is VenueSprocket with or without ?from=vs.
  const brand = signupBrandFromHost(host, one(params.from));
  const plan = resolveSelectedPlan(brand, one(params.plan), one(params.interval));

  // Already signed in as a venue owner/staff: never offer a second signup.
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (access) {
    if (!plan) redirect(brand === "vs" ? "/app/dashboard" : "/venue/dashboard");
    const venue = await prisma.venue.findUnique({ where: { id: access.venueId }, select: { name: true } });
    return (
      <SignupVenueForm
        brand={brand}
        plan={plan}
        signedInVenueName={venue?.name ?? "your venue"}
        checkoutFailed={one(params.checkout) === "failed"}
      />
    );
  }

  return <SignupVenueForm brand={brand} plan={plan} signedInVenueName={null} checkoutFailed={false} />;
}
