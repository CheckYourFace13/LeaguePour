import Link from "next/link";
import { Card } from "@/components/ui/card";
import { FieldHelp } from "@/components/forms/field-help";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { marketingRoutes, venueAppRoutes } from "@/lib/routes";
import { resolvePrimaryVenueAccess, venueStaffCanManageStaff } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";

export default async function VenueSettingsPage() {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  const showStaff = venueStaffCanManageStaff(access.role);
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Settings</h1>
        <p className="mt-2 text-lp-muted">Core controls for profile, staff, and competition defaults.</p>
      </div>
      <FieldHelp title="Quick setup">
        <p>Connect Stripe, lock your venue profile, then launch events from competitions.</p>
      </FieldHelp>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="space-y-3 p-5">
          <p className="lp-kicker">Public presence</p>
          <p className="text-sm text-lp-muted">Name, slug, and copy players see before they sign up.</p>
          <Button asChild size="lg" className="w-full">
            <Link href={venueAppRoutes.profile}>Venue profile</Link>
          </Button>
        </Card>
        <Card className="space-y-3 p-5">
          <p className="lp-kicker">Competitions</p>
          <p className="text-sm text-lp-muted">Listed fees, caps, and waiver text are set per event in the builder.</p>
          <Button asChild variant="secondary" size="lg" className="w-full">
            <Link href={venueAppRoutes.competitions}>View competitions</Link>
          </Button>
        </Card>
        {showStaff ? (
          <Card className="space-y-3 p-5 sm:col-span-2">
            <p className="lp-kicker">Staff</p>
            <p className="text-sm text-lp-muted">Owners and managers can add venue staff by email (account must exist).</p>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
              <Link href={venueAppRoutes.staff}>Manage staff</Link>
            </Button>
          </Card>
        ) : null}
      </div>
      <Card className="space-y-3 p-5">
        <p className="lp-kicker">Help</p>
        <p className="text-sm text-lp-muted">Need migration help or billing support?</p>
        <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
          <Link href={marketingRoutes.contact}>Contact</Link>
        </Button>
      </Card>
    </div>
  );
}
