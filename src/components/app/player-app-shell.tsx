"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CreditCard, Heart, LayoutGrid, Menu, Search, Settings, Trophy, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { playerAppRoutes } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: playerAppRoutes.dashboard, label: "Dashboard", icon: LayoutGrid },
  { href: playerAppRoutes.competitions, label: "My competitions", icon: Trophy },
  { href: playerAppRoutes.discover, label: "Discover", icon: Search },
  { href: playerAppRoutes.venues, label: "Favorite venues", icon: Heart },
  { href: playerAppRoutes.preferences, label: "Preferences", icon: Settings },
  { href: playerAppRoutes.payments, label: "Payments", icon: CreditCard },
  { href: playerAppRoutes.settings, label: "Account", icon: Settings },
];

export function PlayerAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-full bg-lp-bg">
      <div className="flex min-h-full">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-lp-border bg-lp-surface/60 md:flex">
          <div className="border-b border-lp-border px-5 py-5">
            <Link href={playerAppRoutes.dashboard} className="font-display text-lg font-bold tracking-tight">
              League<span className="text-lp-accent">Pour</span>
            </Link>
            <p className="mt-2 text-sm font-medium text-lp-muted">Player</p>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 p-3">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-[10px] px-3 py-2.5 text-[15px] font-semibold transition",
                    active
                      ? "bg-lp-accent/15 text-lp-text"
                      : "text-lp-muted hover:bg-white/[0.05] hover:text-lp-text",
                  )}
                >
                  <item.icon className="size-[18px] shrink-0 opacity-90" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-lp-border p-3">
            <Button
              variant="ghost"
              className="h-12 w-full justify-start text-[15px] text-lp-muted"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Log out
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-lp-border bg-lp-bg/95 px-4 py-3.5 backdrop-blur md:hidden">
            <span className="font-display text-lg font-bold">Player</span>
            <button
              type="button"
              className="inline-flex size-12 items-center justify-center rounded-[10px] border border-lp-border bg-lp-surface"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-6" />
            </button>
          </header>
          {open ? (
            <div className="fixed inset-0 z-50 bg-lp-bg/98 p-5 md:hidden">
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
                    className="rounded-[10px] px-3 py-3.5 text-base font-semibold text-lp-text"
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  type="button"
                  className="rounded-[10px] px-3 py-3.5 text-left text-base font-semibold text-lp-muted"
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
