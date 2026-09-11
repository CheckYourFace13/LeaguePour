import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { VS_HOST } from "@/lib/vs-routing";

export async function generateMetadata(): Promise<Metadata> {
  // /signup/venue, /forgot-password, and /reset-password are all plain client components with
  // no metadata export of their own (client components can't export one), so the server-rendered
  // <title> for all three fell through to the root layout's default LP title on every request -
  // found via the cross-brand audit checking venuesprocket.com/signup?from=vs's actual HTML
  // (not just its post-hydration tab title, which a separate useEffect already corrects). Fixing
  // it once here covers every page under this layout instead of adding metadata per page.
  const host = (await headers()).get("host")?.split(":")[0]?.toLowerCase();
  const isVs = host === VS_HOST;
  return {
    title: { absolute: isVs ? "VenueSprocket" : "LeaguePour" },
    robots: { index: false, follow: false },
  };
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // /login, /signup/venue, /signup/player, /forgot-password, /reset-password are all
  // host-gate-exempt (see middleware.ts's hostGateExemptPrefixes) so this same layout renders on
  // both venuesprocket.com and leaguepour.com - it previously always showed the LeaguePour logo
  // and linked back to leaguepour.com regardless, so every VenueSprocket signup/login/reset was
  // wrongly LP-branded. Read the incoming Host header directly (no brand cookie/header exists
  // from middleware to rely on) rather than trusting a query param, since a visitor can land here
  // straight from a bookmark or password manager with no ?from=vs at all.
  const host = (await headers()).get("host")?.split(":")[0]?.toLowerCase();
  const isVs = host === VS_HOST;

  return (
    <div className="flex min-h-full flex-col bg-lp-bg">
      <header className="border-b border-lp-border bg-lp-bg/90 px-4 py-4 backdrop-blur-md md:px-6 md:py-5">
        {isVs ? (
          <Link href="https://venuesprocket.com" className="font-display text-xl font-bold tracking-tight">
            Venue<span className="text-lp-accent">Sprocket</span>
          </Link>
        ) : (
          <Link href="/" className="font-display text-xl font-bold tracking-tight">
            League<span className="text-lp-accent">Pour</span>
          </Link>
        )}
      </header>
      <div className="lp-hero-wash flex flex-1 flex-col items-center justify-center px-4 py-12 md:py-16">
        {children}
      </div>
    </div>
  );
}
