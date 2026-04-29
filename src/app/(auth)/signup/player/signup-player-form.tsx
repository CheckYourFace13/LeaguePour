"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export function SignupPlayerForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      accountType: "player" as const,
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      homeCity: String(fd.get("homeCity")),
    };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error ?? "Could not create account");
      return;
    }
    await signIn("credentials", { email: body.email, password: body.password, redirect: false });
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md p-6 md:p-8">
      <h1 className="lp-page-title text-2xl md:text-3xl">Player signup</h1>
      <p className="mt-3 text-base text-lp-muted leading-relaxed">One account for every venue running on LeaguePour.</p>
      {msg ? (
        <p className="mt-4 rounded-[10px] border border-lp-warning/40 bg-lp-warning/10 px-4 py-3 text-sm">{msg}</p>
      ) : null}
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" className="mt-1.5" required autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="homeCity">Home city</Label>
          <Input id="homeCity" name="homeCity" className="mt-1.5" placeholder="Indianapolis, IN" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" className="mt-1.5" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" className="mt-1.5" required minLength={8} autoComplete="new-password" />
        </div>
        <Button type="submit" className="w-full" size="lg">
          Create player account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-lp-muted">
        <Link className="text-lp-accent hover:underline" href="/signup">
          ← Other account types
        </Link>
      </p>
    </Card>
  );
}
