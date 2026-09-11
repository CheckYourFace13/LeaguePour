import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { VS_HOST } from "@/lib/vs-routing";
import { SignupPlayerForm } from "./signup-player-form";

export const metadata: Metadata = {
  title: { absolute: "Player sign up | LeaguePour" },
};

export default async function SignupPlayerPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  // Found via the /about cross-brand audit: "player" isn't a VenueSprocket concept at all, but
  // this page has no host check (unlike /signup/venue, which already branches its content on
  // ?from=vs) - venuesprocket.com/signup/player rendered 100% LeaguePour-branded copy ("Player
  // signup", LP title, LP tokens) at a VS URL. Not reachable from any VS nav link, but a direct
  // URL/bookmark/crawler visit would still see it. VS has exactly one real signup path.
  const host = (await headers()).get("host")?.split(":")[0]?.toLowerCase();
  if (host === VS_HOST) redirect("/signup/venue?from=vs");

  const sp = await searchParams;
  // "/" alone isn't enough - "//evil.com" also starts with "/" and browsers resolve it as
  // protocol-relative to an external origin (open redirect). Same check already used correctly
  // in src/app/(auth)/login/login-form.tsx's safePostLoginPath.
  const redirectTo =
    sp.callbackUrl && sp.callbackUrl.startsWith("/") && !sp.callbackUrl.startsWith("//")
      ? sp.callbackUrl
      : "/player/dashboard";
  return <SignupPlayerForm redirectTo={redirectTo} />;
}
