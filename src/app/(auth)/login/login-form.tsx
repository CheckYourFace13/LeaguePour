"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

function safePostLoginPath(callbackUrl: string | null): string {
  if (!callbackUrl) return "/";
  const v = callbackUrl.trim();
  if (!v) return "/";
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  try {
    const u = new URL(v);
    if (u.origin === window.location.origin) return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    // ignore
  }
  return "/";
}

function readCallbackCookie(): string | null {
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const cookie of cookies) {
    const [rawName, ...rawValue] = cookie.split("=");
    if (rawName?.trim() !== "lp_callback") continue;
    const value = rawValue.join("=").trim();
    if (!value) return null;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return null;
}

function clearCallbackCookie() {
  document.cookie = "lp_callback=; Max-Age=0; Path=/; SameSite=Lax";
}

type LoginFormProps = {
  callbackUrl: string | null;
  registered: boolean;
  reset: boolean;
};

export function LoginForm({ callbackUrl, registered, reset }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function waitForSession(maxAttempts = 6): Promise<boolean> {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const res = await fetch("/api/auth/session", { method: "GET", cache: "no-store", credentials: "same-origin" });
        if (res.ok) {
          const payload = (await res.json()) as { user?: { id?: string } } | null;
          if (payload?.user?.id) return true;
        }
      } catch {
        // Ignore transient network errors and retry.
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    return false;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    let res:
      | {
          error?: string;
          ok?: boolean;
        }
      | undefined;
    try {
      res = await signIn("credentials", { email, password, redirect: false });
    } catch {
      setLoading(false);
      setError("Sign in failed. Please try again.");
      return;
    }
    if (!res || res.error || res.ok === false) {
      setLoading(false);
      setError("Email or password did not match.");
      return;
    }
    const hasSession = await waitForSession();
    if (!hasSession) {
      setLoading(false);
      setError("Sign in succeeded, but session could not be established. Please try again.");
      return;
    }
    const cookieCallback = readCallbackCookie();
    const target = safePostLoginPath(callbackUrl ?? cookieCallback);
    if (target !== "/") {
      clearCallbackCookie();
      window.location.replace(target);
      return;
    }
    clearCallbackCookie();
    window.location.replace("/api/auth/post-login");
  }

  return (
    <Card className="w-full max-w-md p-6 md:p-8">
      <h1 className="lp-page-title text-2xl md:text-3xl">Log in</h1>
      <p className="mt-3 text-base text-lp-muted leading-relaxed">Venue staff and players use the same login.</p>
      {registered ? (
        <p className="mt-4 rounded-[10px] border border-lp-success/40 bg-lp-success/10 px-4 py-3 text-sm text-lp-text">
          Account created. Sign in with the password you chose.
        </p>
      ) : null}
      {reset ? (
        <p className="mt-4 rounded-[10px] border border-lp-success/40 bg-lp-success/10 px-4 py-3 text-sm text-lp-text">
          Password updated. Sign in with your new password.
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-[10px] border border-lp-warning/40 bg-lp-warning/10 px-4 py-3 text-sm text-lp-text">
          {error}
        </p>
      ) : null}
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required className="mt-1.5" autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required className="mt-1.5" autoComplete="current-password" />
        </div>
        <div className="text-right">
          <Link className="text-sm font-semibold text-lp-accent hover:underline" href="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Signing in…" : "Log in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-lp-muted">
        New here?{" "}
        <Link className="font-semibold text-lp-accent hover:underline" href="/signup">
          Create account
        </Link>
      </p>
    </Card>
  );
}
