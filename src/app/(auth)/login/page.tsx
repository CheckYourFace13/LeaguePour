import type { Metadata } from "next";
import { headers } from "next/headers";
import { VS_HOST } from "@/lib/vs-routing";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// /login is host-gate-exempt (renders on both domains, see middleware.ts) but previously always
// inherited the root layout's LeaguePour title/description - a VenueSprocket customer logging in
// saw LP branding in their browser tab. Server-side host check (not a query param) so this is
// correct on a direct visit/bookmark too, not only when arriving via a link that set ?from=vs.
export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host")?.split(":")[0]?.toLowerCase();
  // Absolute, not a plain string: the root layout's title template ("%s | LeaguePour") would
  // otherwise still apply on top of this, producing "Log in | VenueSprocket | LeaguePour" -
  // confirmed live.
  if (host === VS_HOST) {
    return { title: { absolute: "Log in | VenueSprocket" }, description: "Log in to your VenueSprocket account." };
  }
  return { title: { absolute: "Log in | LeaguePour" }, description: "Log in to your LeaguePour account." };
}

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const callbackParam = resolvedSearchParams.callbackUrl;
  const callbackUrl = Array.isArray(callbackParam) ? callbackParam[0] ?? null : callbackParam ?? null;
  const registered = resolvedSearchParams.registered !== undefined;
  const reset = resolvedSearchParams.reset !== undefined;

  return (
    <LoginForm callbackUrl={callbackUrl} registered={registered} reset={reset} />
  );
}
