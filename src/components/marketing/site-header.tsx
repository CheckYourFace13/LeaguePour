"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown, Menu, X } from "lucide-react";
import { marketingRoutes, playerAppRoutes, venueAppRoutes } from "@/lib/routes";
import { cta } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const baseNav = [
  { href: marketingRoutes.features, label: "Features" },
  { href: marketingRoutes.forVenues, label: "For venues" },
  { href: marketingRoutes.forPlayers, label: "For players" },
  { href: marketingRoutes.pricing, label: "Pricing" },
  { href: marketingRoutes.faq, label: "FAQ" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);
  const { data: session, status } = useSession();

  const hasVenue = (session?.venueAccess?.length ?? 0) > 0;
  const hasPlayer = session?.hasPlayerProfile;
  const nav = hasPlayer
    ? [{ href: playerAppRoutes.discover, label: "Discover" }, ...baseNav]
    : [...baseNav];

  return (
    <header className="sticky top-0 z-50 border-b border-lp-border-strong/80 bg-lp-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6 md:py-5">
        <Link href="/" className="font-display text-[1.45rem] font-extrabold tracking-tight md:text-[1.65rem]">
          League<span className="text-lp-accent">Pour</span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[10px] px-3.5 py-2.5 text-base font-bold text-lp-text-soft transition hover:bg-lp-surface-2 hover:text-lp-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {status === "authenticated" ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDashOpen((v) => !v)}
                className="inline-flex min-h-[3.25rem] items-center gap-1.5 rounded-[10px] px-5 text-base font-bold text-lp-text transition hover:bg-lp-surface-2"
                aria-expanded={dashOpen}
                aria-haspopup="true"
              >
                Account <ChevronDown className="size-4 opacity-70" />
              </button>
              {dashOpen ? (
                <div className="absolute right-0 mt-2 min-w-[240px] rounded-[10px] border border-lp-border-strong bg-lp-surface py-1 shadow-xl shadow-blue-300/60">
                  {hasVenue ? (
                    <Link
                      href={venueAppRoutes.dashboard}
                      className="block min-h-[3.25rem] px-4 py-3 text-base font-semibold hover:bg-lp-surface-2"
                      onClick={() => setDashOpen(false)}
                    >
                      {cta.venueDashboard}
                    </Link>
                  ) : null}
                  {hasPlayer ? (
                    <Link
                      href={playerAppRoutes.dashboard}
                      className="block min-h-[3.25rem] px-4 py-3 text-base font-semibold hover:bg-lp-surface-2"
                      onClick={() => setDashOpen(false)}
                    >
                      {cta.playerDashboard}
                    </Link>
                  ) : null}
                  {!hasVenue && !hasPlayer ? (
                    <Link
                      href="/signup"
                      className="block min-h-[3.25rem] px-4 py-3 text-base font-semibold hover:bg-lp-surface-2"
                      onClick={() => setDashOpen(false)}
                    >
                      Finish signup
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-[3.25rem] items-center rounded-[10px] px-3.5 text-base font-bold text-lp-text-soft hover:text-lp-text"
            >
              {cta.login}
            </Link>
          )}
          <Button asChild size="md">
            <Link href="/signup">{cta.signup}</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex size-[3.25rem] shrink-0 items-center justify-center rounded-[10px] border border-lp-border-strong bg-lp-surface text-lp-text md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-lp-border-strong/80 bg-lp-bg px-4 py-5 md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[10px] px-3 py-3.5 text-[1.0625rem] font-bold text-lp-text"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {status === "authenticated" ? (
            <>
              {hasVenue ? (
                <Link
                  href={venueAppRoutes.dashboard}
                  className="rounded-[10px] px-3 py-3.5 text-[1.0625rem] font-bold text-lp-accent"
                  onClick={() => setOpen(false)}
                >
                  {cta.venueDashboard}
                </Link>
              ) : null}
              {hasPlayer ? (
                <Link
                  href={playerAppRoutes.dashboard}
                  className="rounded-[10px] px-3 py-3.5 text-[1.0625rem] font-bold text-lp-accent"
                  onClick={() => setOpen(false)}
                >
                  {cta.playerDashboard}
                </Link>
              ) : null}
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-[10px] px-3 py-3.5 text-[1.0625rem] font-bold text-lp-text-soft"
              onClick={() => setOpen(false)}
            >
              {cta.login}
            </Link>
          )}
          <Button asChild className="mt-2 w-full" size="lg">
            <Link href="/signup" onClick={() => setOpen(false)}>
              {cta.signup}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
