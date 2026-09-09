"use server";

import { signOut } from "@/auth";

/**
 * Server Action wrapper around NextAuth's server-side signOut(). Deliberately NOT using the
 * next-auth/react client signOut() helper (or a plain link to /api/auth/signout) here - both of
 * those build their request URL from a module-level `apiBaseUrl`/AUTH_URL constant baked in at
 * build/render time, which resolves to a single fixed origin (leaguepour.com) regardless of which
 * brand host the page is actually being viewed from. On venuesprocket.com that sent the sign-out
 * POST cross-origin to leaguepour.com instead: the CSRF cookie check failed (different domain's
 * CSRF cookie, since cookies never cross registrable domains), stranding the user on
 * leaguepour.com/login?error=MissingCSRF while their venuesprocket.com session remained silently
 * live. Found via whole-business audit, confirmed live with a disposable account (checked
 * /api/auth/session on venuesprocket.com directly after clicking Sign out).
 *
 * This server Action runs inside the real incoming request, so NextAuth's server signOut() reads
 * the actual Host header (respecting trustHost - see src/auth.ts), builds a same-origin action
 * URL, skips the CSRF round-trip entirely (it already has an authenticated server-side context),
 * and sets the cleared session cookie directly on this response - no cross-origin request, no
 * CSRF mismatch, no branded/unbranded interstitial page.
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
