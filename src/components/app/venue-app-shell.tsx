"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  LayoutGrid,
  Mail,
  Megaphone,
  Menu,
  Settings,
  Trophy,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { venueAppRoutes } from "@/lib/routes";
import { venueRoleLabel } from "@/lib/venue-access-policy";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: venueAppRoutes.dashboard, label: "Dashboard", icon: LayoutGrid },
  { href: venueAppRoutes.competitions, label: "Competitions", icon: Trophy },
  { href: venueAppRoutes.registrations, label: "Registrations", icon: Users },
  { href: venueAppRoutes.teams, label: "Teams / players", icon: Users },
  { href: venueAppRoutes.standings, label: "Standings / brackets", icon: BarChart3 },
  { href: venueAppRoutes.marketing, label: "Marketing", icon: Megaphone },
  { href: venueAppRoutes.audience, label: "Audience / CRM", icon: Users },
  { href: venueAppRoutes.messages, label: "Messages", icon: Mail },
  { href: venueAppRoutes.staff, label: "Staff", icon: UserCog, requiresStaffAdmin: true },
  { href: venueAppRoutes.profile, label: "Venue profile", icon: Settings },
  { href: venueAppRoutes.settings, label: "Settings", icon: Settings },
] as const;

export function VenueAppShell({
  venueSlug,
  venueName,
  staffRole,
  canManageStaff,
  children,
}: {
  venueSlug: string;
  venueName: string;
  staffRole: string;
  canManageStaff: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = navItems.filter((item) => !("requiresStaffAdmin" in item) || !item.requiresStaffAdmin || canManageStaff);

  return (
    <div className="min-h-full bg-lp-bg">
      <div className="flex min-h-full">
        <aside className="hidden w-[17rem] shrink-0 flex-col border-r border-lp-border-strong bg-lp-surface md:flex">
          <div className="border-b border-lp-border-strong px-5 py-5">
            <Link href={venueAppRoutes.dashboard} className="font-display text-[1.45rem] font-extrabold tracking-tight">
              League<span className="text-lp-accent">Pour</span>
            </Link>
            <p className="mt-2 truncate text-base font-semibold text-lp-text-soft">{venueName}</p>
            <p className="mt-1 text-[0.78rem] font-bold uppercase tracking-wide text-lp-accent/90">
              {venueRoleLabel(staffRole)}
            </p>
            <Link
              href={`/v/${venueSlug}`}
              className="mt-3 inline-flex min-h-11 items-center text-base font-bold text-lp-accent hover:underline"
            >
              View public venue page
            </Link>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-[10px] px-3 py-2.5 text-base font-bold transition",
                    active
                      ? "bg-lp-accent/16 text-lp-text"
                      : "text-lp-muted hover:bg-lp-surface-2 hover:text-lp-text",
                  )}
                >
                  <item.icon className="size-5 shrink-0 opacity-90" strokeWidth={2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-lp-border-strong p-3">
            <Button
              variant="ghost"
              className="h-12 w-full justify-start text-base text-lp-text-soft"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Log out
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-lp-border-strong bg-lp-surface px-4 py-3.5 backdrop-blur md:hidden">
            <div className="min-w-0">
              <p className="lp-kicker">Venue</p>
              <p className="truncate text-[1.0625rem] font-bold text-lp-text">{venueName}</p>
              <p className="text-[0.78rem] font-bold text-lp-accent/90">{venueRoleLabel(staffRole)}</p>
            </div>
            <button
              type="button"
              className="inline-flex size-[3.2rem] shrink-0 items-center justify-center rounded-[10px] border border-lp-border-strong bg-lp-surface"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-6" />
            </button>
          </header>

          {open ? (
            <div className="fixed inset-0 z-50 bg-lp-bg p-5 md:hidden">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold">Menu</span>
                <button
                  type="button"
                  className="inline-flex size-12 items-center justify-center rounded-[10px] border border-lp-border"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  <X className="size-6" />
                </button>
              </div>
              <nav className="mt-8 flex flex-col gap-0.5">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-[10px] px-3 py-3.5 text-[1.0625rem] font-bold text-lp-text"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href={`/v/${venueSlug}`}
                  className="rounded-[10px] px-3 py-3.5 text-[1.0625rem] font-bold text-lp-accent"
                  onClick={() => setOpen(false)}
                >
                  Public venue page
                </Link>
                <button
                  type="button"
                  className="rounded-[10px] px-3 py-3.5 text-left text-[1.0625rem] font-bold text-lp-text-soft"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Log out
                </button>
              </nav>
            </div>
          ) : null}

          <div className="flex-1 px-4 py-8 md:px-10 md:py-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
