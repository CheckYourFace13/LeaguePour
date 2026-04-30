"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password !== confirm) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not reset password.");
      return;
    }
    window.location.assign("/login?reset=1");
  }

  return (
    <Card className="w-full max-w-md p-6 md:p-8">
      <h1 className="lp-page-title text-2xl md:text-3xl">Set new password</h1>
      <p className="mt-3 text-base text-lp-muted leading-relaxed">Choose a password at least 8 characters.</p>
      {error ? (
        <p className="mt-4 rounded-[10px] border border-lp-warning/40 bg-lp-warning/10 px-4 py-3 text-sm text-lp-text">
          {error}
        </p>
      ) : null}
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" required minLength={8} className="mt-1.5" autoComplete="new-password" />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" name="confirm" type="password" required minLength={8} className="mt-1.5" autoComplete="new-password" />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Saving…" : "Update password"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-lp-muted">
        <Link className="font-semibold text-lp-accent hover:underline" href="/login">
          Back to log in
        </Link>
      </p>
    </Card>
  );
}
