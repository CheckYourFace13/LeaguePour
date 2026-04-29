"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email or password did not match.");
      return;
    }
    if (callbackUrl) {
      router.push(callbackUrl);
      router.refresh();
      return;
    }
    const s = await getSession();
    if (s?.venueAccess?.length) router.push("/venue/dashboard");
    else if (s?.hasPlayerProfile) router.push("/player/dashboard");
    else router.push("/");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md p-6 md:p-8">
      <h1 className="lp-page-title text-2xl md:text-3xl">Log in</h1>
      <p className="mt-3 text-base text-lp-muted leading-relaxed">Venue staff and players use the same login.</p>
      {search.get("registered") ? (
        <p className="mt-4 rounded-[10px] border border-lp-success/40 bg-lp-success/10 px-4 py-3 text-sm text-lp-text">
          Account created. Sign in with the password you chose.
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
