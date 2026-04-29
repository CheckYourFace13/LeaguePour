import Link from "next/link";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldHelp } from "@/components/forms/field-help";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/db";
import { StaffRole } from "@/generated/prisma/enums";
import { venueRoleLabel, venueStaffCanAssignOwner, venueStaffCanManageStaff } from "@/lib/venue-access-policy";
import { venueAppRoutes } from "@/lib/routes";
import { resolvePrimaryVenueAccess } from "@/lib/venue-permissions";
import { redirect } from "next/navigation";
import { addVenueStaffByEmailFormAction, removeVenueStaffFormAction, updateVenueStaffRoleFormAction } from "./actions";

const notices: Record<string, string> = {
  added: "Staff member added.",
  updated: "Role updated.",
  removed: "Staff access removed.",
  forbidden: "You need owner or manager access to change staff.",
  invalid: "Check the email and role you entered.",
  "no-user": "No LeaguePour account exists for that email yet — they must sign up first.",
  exists: "That person is already on this venue’s staff list.",
  self: "You cannot change or remove your own row from this screen — ask another owner.",
  "last-owner": "This venue needs at least one owner. Add another owner before changing this one.",
  missing: "That staff row was not found.",
};

export default async function VenueStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const session = await auth();
  const access = await resolvePrimaryVenueAccess(session);
  if (!access) redirect("/signup/venue");
  if (!venueStaffCanManageStaff(access.role)) redirect("/venue/dashboard?notice=staff-forbidden");

  const { notice } = await searchParams;

  const staffRows = await prisma.venueStaff.findMany({
    where: { venueId: access.venueId },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="lp-page-title text-3xl md:text-4xl">Staff</h1>
        <p className="mt-2 text-base text-lp-muted md:text-lg">
          Your role: <span className="font-semibold text-lp-text">{venueRoleLabel(access.role)}</span>
          <span className="mt-2 block max-w-2xl text-sm leading-relaxed md:text-base">
            Add teammates who already have LeaguePour accounts, tune roles, and keep at least one owner. No invite email
            is sent yet — they must sign up first, then you add their email here.
          </span>
        </p>
      </div>

      {notice && notices[notice] ? (
        <div
          className={
            notice === "forbidden" || notice === "self" || notice === "last-owner"
              ? "rounded-[10px] border border-lp-border bg-lp-surface/60 px-4 py-3 text-sm text-lp-text"
              : "rounded-[10px] border border-lp-accent/35 bg-lp-accent/10 px-4 py-3 text-sm font-medium text-lp-text"
          }
        >
          {notices[notice]}
        </div>
      ) : null}

      <FieldHelp title="How adding staff works">
        <p>
          Enter the email on an <span className="font-semibold text-lp-text">existing</span> LeaguePour account — they
          show up here with the role you pick. No automated invite email yet.
        </p>
      </FieldHelp>

      <Card className="space-y-4 p-5 md:p-6">
        <p className="lp-kicker">Add staff</p>
        <p className="text-sm text-lp-muted">
          Managers add coordinators (and other managers). Only owners can grant the owner role.
        </p>
        <form action={addVenueStaffByEmailFormAction} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="staff-email">Email (must already have an account)</Label>
            <Input
              id="staff-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1.5 min-h-12 text-base"
              placeholder="teammate@example.com"
            />
          </div>
          <div>
            <Label htmlFor="staff-role">Role</Label>
            <select
              id="staff-role"
              name="role"
              className="mt-1.5 flex w-full min-h-12 rounded-[10px] border border-lp-border bg-lp-bg/80 px-4 text-base text-lp-text outline-none focus:border-lp-accent/60 focus:ring-2 focus:ring-lp-accent/25"
              defaultValue={StaffRole.COORDINATOR}
            >
              <option value={StaffRole.COORDINATOR}>Coordinator</option>
              <option value={StaffRole.MANAGER}>Manager</option>
              {venueStaffCanAssignOwner(access.role) ? <option value={StaffRole.OWNER}>Owner</option> : null}
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Add to venue
            </Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-lp-border bg-lp-surface-2/80 px-4 py-3 text-xs font-bold uppercase tracking-wider text-lp-muted">
          Current team
        </div>
        <ul className="divide-y divide-lp-border">
          {staffRows.map((row) => {
            const self = row.userId === session!.user!.id;
            const canEditThis =
              !self &&
              venueStaffCanManageStaff(access.role) &&
              !(row.role === StaffRole.OWNER && access.role === StaffRole.MANAGER);

            return (
              <li key={row.id} className="flex flex-col gap-4 px-4 py-5 md:flex-row md:items-end md:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-lp-text">
                    {row.user.name ?? "User"}
                    {self ? (
                      <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-lp-accent">You</span>
                    ) : null}
                  </p>
                  <p className="text-sm text-lp-muted">{row.user.email}</p>
                  <p className="mt-2 text-xs text-lp-muted">Added {row.createdAt.toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {canEditThis ? (
                    <form action={updateVenueStaffRoleFormAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input type="hidden" name="userId" value={row.userId} />
                      <select
                        name="role"
                        defaultValue={row.role}
                        className="min-h-12 rounded-[10px] border border-lp-border bg-lp-bg/80 px-3 text-base text-lp-text outline-none focus:border-lp-accent/60 focus:ring-2 focus:ring-lp-accent/25"
                      >
                        <option value={StaffRole.COORDINATOR}>Coordinator</option>
                        <option value={StaffRole.MANAGER}>Manager</option>
                        {venueStaffCanAssignOwner(access.role) ? <option value={StaffRole.OWNER}>Owner</option> : null}
                      </select>
                      <Button type="submit" variant="secondary" size="lg">
                        Save role
                      </Button>
                    </form>
                  ) : (
                    <Badge variant="accent">{venueRoleLabel(row.role)}</Badge>
                  )}
                  {canEditThis ? (
                    <form action={removeVenueStaffFormAction} className="sm:ml-2">
                      <input type="hidden" name="userId" value={row.userId} />
                      <Button type="submit" variant="ghost" size="lg" className="text-lp-muted hover:text-lp-text">
                        Remove access
                      </Button>
                    </form>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="flex flex-col gap-2 text-sm text-lp-muted sm:flex-row sm:flex-wrap sm:gap-4">
        <Link href={venueAppRoutes.dashboard} className="font-semibold text-lp-accent hover:underline">
          ← Dashboard
        </Link>
        <Link href={venueAppRoutes.competitions} className="font-semibold text-lp-accent hover:underline">
          Competitions
        </Link>
        <Link href={venueAppRoutes.messages} className="font-semibold text-lp-accent hover:underline">
          Messages
        </Link>
      </div>
    </div>
  );
}
