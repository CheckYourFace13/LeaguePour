"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VenueError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <p className="lp-kicker">Venue app</p>
      <h1 className="lp-page-title mt-4 text-2xl md:text-3xl">Could not load this screen</h1>
      <p className="mt-4 text-base text-lp-muted leading-relaxed">
        Try again. If it keeps failing, refresh or return to the dashboard.
      </p>
      <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Button type="button" size="lg" className="w-full sm:w-auto" onClick={reset}>
          Try again
        </Button>
        <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
          <Link href="/venue/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
