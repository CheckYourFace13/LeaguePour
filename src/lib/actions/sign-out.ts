"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Server Action that clears the NextAuth session directly, WITHOUT calling NextAuth's own
 * signOut() (from @auth/core, re-exported by src/auth.ts) at all.
 *
 * Traced all the way down: @auth/core's createActionURL() (used internally by every NextAuth
 * action - signin, signout, csrf, session, callback) resolves its base URL from
 * `process.env.AUTH_URL ?? process.env.NEXTAUTH_URL` FIRST, unconditionally, before ever
 * consulting the request's own Host header - `trustHost: true` (src/auth.ts) only enables the
 * header-based fallback for when AUTH_URL/NEXTAUTH_URL is unset, which it isn't here. So every
 * internal NextAuth action always targets a single fixed origin (leaguepour.com) no matter which
 * brand's domain actually received the request. That's true for the next-auth/react client
 * signOut() helper, NextAuth's own built-in /api/auth/signout confirmation page, AND the
 * server-side signOut() re-exported from src/auth.ts (confirmed live, in that order, each time
 * tracing one level deeper into the actual mechanism) - there is no per-call-site fix for this;
 * it's unconditional library behavior gated on an env var this sandbox cannot safely change
 * (Hostinger panel access - see the final report's OWNER ACTIONS).
 *
 * So: skip NextAuth's action machinery for sign-out entirely. Delete the session cookie
 * (both the secure and non-secure name variants - Hostinger's proxy can present either, same
 * reason middleware.ts probes both) directly, then redirect("/") - a plain Next.js relative
 * redirect, unrelated to NextAuth/AUTH_URL, which correctly resolves against whichever host
 * actually received this request.
 */
export async function signOutAction() {
  const cookieStore = await cookies();
  // Explicit path: "/" because the original cookies (@auth/core's defaultCookies()) were set with
  // path: "/" - a deletion must match that attribute or the browser won't actually clear it.
  for (const name of ["authjs.session-token", "__Secure-authjs.session-token"]) {
    cookieStore.delete({ name, path: "/" });
  }
  redirect("/");
}
