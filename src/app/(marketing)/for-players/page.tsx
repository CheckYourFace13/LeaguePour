import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "For Players | LeaguePour Competition Signup",
  description:
    "Join venue competitions on LeaguePour: signup for trivia, dart league, cornhole tournament, and team registration with clear rules and secure entry fees.",
  alternates: { canonical: "/for-players" },
  openGraph: {
    title: "LeaguePour for Players",
    description: "One account to join venue competitions and manage signup alerts.",
    url: "/for-players",
  },
};

export default function ForPlayersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <h1 className="font-display text-4xl font-bold">For players</h1>
      <p className="mt-4 text-lg text-lp-muted">One login. Clear rules. You control alerts.</p>
      <ul className="mt-10 space-y-3 text-lp-muted">
        <li>· Every venue, one profile</li>
        <li>· Secure card pay on paid events</li>
        <li>· Follow rooms you care about</li>
        <li>· Email & SMS preferences</li>
      </ul>
      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/signup/player">Join as player</Link>
        </Button>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/pricing">See venue plans</Link>
        </Button>
      </div>
      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/features" className="font-semibold text-lp-accent hover:underline">
          View platform features
        </Link>
        <Link href="/how-it-works" className="font-semibold text-lp-accent hover:underline">
          How signup works
        </Link>
      </div>
    </div>
  );
}
