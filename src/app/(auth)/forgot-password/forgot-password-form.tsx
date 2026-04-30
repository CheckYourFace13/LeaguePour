"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Something went wrong. Try again.");
      return;
    }
    setDone(true);
  }

  return (
    <Card className="w-full max-w-md p-6 md:p-8">
      <h1 className="lp-page-title text-2xl md:text-3xl">Forgot password</h1>
      <p className="mt-3 text-base text-lp-muted leading-relaxed">
        Enter your email. If an account exists, we will send a reset link (when email is configured).
      </p>
      {error ? (
        <p className="mt-4 rounded-[10px] border border-lp-warning/40 bg-lp-warning/10 px-4 py-3 text-sm text-lp-text">
          {error}
        </p>
      ) : null}
      {done ? (
        <p className="mt-6 rounded-[10px] border border-lp-success/40 bg-lp-success/10 px-4 py-3 text-sm text-lp-text">
          If that email is on file, check your inbox for a reset link. You can close this tab.
        </p>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required className="mt-1.5" autoComplete="email" />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-lp-muted">
        <Link className="font-semibold text-lp-accent hover:underline" href="/login">
          Back to log in
        </Link>
      </p>
    </Card>
  );
}
