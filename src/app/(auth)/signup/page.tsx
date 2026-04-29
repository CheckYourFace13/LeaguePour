import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SignupHubPage() {
  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="text-center">
        <h1 className="lp-page-title text-3xl md:text-4xl">Sign up</h1>
        <p className="mt-3 text-base text-lp-muted">Venue or player — pick one.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="flex flex-col p-6 md:p-7">
          <p className="lp-kicker">Venue</p>
          <p className="mt-3 font-display text-xl font-bold tracking-tight text-lp-text md:text-2xl">Run the room</p>
          <p className="mt-3 flex-1 text-base text-lp-muted">Signups, entry fees, brackets.</p>
          <Button className="mt-8 w-full" size="lg" asChild>
            <Link href="/signup/venue">Create venue</Link>
          </Button>
        </Card>
        <Card className="flex flex-col p-6 md:p-7">
          <p className="lp-kicker">Player</p>
          <p className="mt-3 font-display text-xl font-bold tracking-tight text-lp-text md:text-2xl">Play</p>
          <p className="mt-3 flex-1 text-base text-lp-muted">One profile for every venue.</p>
          <Button className="mt-8 w-full" size="lg" variant="secondary" asChild>
            <Link href="/signup/player">Join as player</Link>
          </Button>
        </Card>
      </div>
      <p className="text-center text-sm text-lp-muted">
        Already have an account?{" "}
        <Link className="font-semibold text-lp-accent hover:underline" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}
