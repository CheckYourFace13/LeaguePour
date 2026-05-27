"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Types ──────────────────────────────────────────────────────────────────

export type StandingRow = {
  id: string;
  rank: number | null;
  points: number;
  teamId: string | null;
  playerUserId: string | null;
  team: { name: string } | null;
};

export type MatchRow = {
  id: string;
  round: number;
  label: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { name: string } | null;
  awayTeam: { name: string } | null;
};

export type RegistrationRow = {
  id: string;
  user: { name: string | null };
};

export type CompData = {
  id: string;
  title: string;
  status: string;
  kind: string;
  venue: { name: string; city: string | null; state: string | null };
  standings: StandingRow[];
  matches: MatchRow[];
  registrations: RegistrationRow[];
};

export type SoloPlayer = { id: string; name: string | null };

export type ScoreboardClientProps = {
  comp: CompData;
  soloPlayers: SoloPlayer[];
  venueSlug: string;
  competitionSlug: string;
  qrDataUrl: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusLabel(status: string): string {
  switch (status) {
    case "SIGNUP_OPEN":
    case "PUBLISHED":
      return "Signup open";
    case "IN_PROGRESS":
      return "Live";
    case "COMPLETED":
      return "Complete";
    default:
      return status.replaceAll("_", " ");
  }
}

function statusVariant(status: string): "accent" | "success" | "muted" {
  switch (status) {
    case "IN_PROGRESS":
      return "success";
    case "SIGNUP_OPEN":
    case "PUBLISHED":
      return "accent";
    default:
      return "muted";
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ScoreboardClient({
  comp,
  soloPlayers,
  venueSlug,
  competitionSlug,
  qrDataUrl,
}: ScoreboardClientProps) {
  const router = useRouter();
  const [tvMode, setTvMode] = useState(false);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, 30_000);
    return () => clearInterval(id);
  }, [router]);

  const enterTv = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Fullscreen may be denied by browser; still enable TV mode
    }
    setTvMode(true);
  }, []);

  const exitTv = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
    setTvMode(false);
  }, []);

  // Sync state when user presses ESC to exit fullscreen natively
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setTvMode(false);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const soloMap = new Map(soloPlayers.map((p) => [p.id, p.name]));

  const roundGroups = new Map<number, MatchRow[]>();
  for (const m of comp.matches) {
    const arr = roundGroups.get(m.round) ?? [];
    arr.push(m);
    roundGroups.set(m.round, arr);
  }

  const signupPath = `/c/${venueSlug}/${competitionSlug}`;
  const canSignup = comp.status === "SIGNUP_OPEN" || comp.status === "PUBLISHED";
  const cityLabel = [comp.venue.city, comp.venue.state].filter(Boolean).join(", ");

  // TV-mode font scale helpers
  const tvSectionTitle = tvMode
    ? "text-3xl md:text-4xl"
    : "text-xl md:text-2xl";
  const tvBody = tvMode ? "text-xl md:text-2xl" : "text-base";
  const tvSmall = tvMode ? "text-lg" : "text-sm";
  const tvScore = tvMode ? "text-2xl md:text-3xl" : "text-base";

  return (
    <div
      className={[
        "min-h-screen px-4 py-10 md:px-8 md:py-14 transition-colors",
        tvMode ? "bg-[#080c18]" : "bg-lp-bg",
      ].join(" ")}
    >
      <div className="mx-auto max-w-4xl space-y-10">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <p
              className={[
                "font-semibold text-lp-accent",
                tvMode ? "text-xl" : "text-sm",
              ].join(" ")}
            >
              {comp.venue.name}
              {cityLabel ? ` | ${cityLabel}` : ""}
            </p>
            <h1
              className={[
                "font-display mt-2 font-bold leading-tight text-lp-text",
                tvMode ? "text-5xl md:text-7xl" : "text-4xl md:text-5xl",
              ].join(" ")}
            >
              {comp.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Badge variant={statusVariant(comp.status)}>
                {statusLabel(comp.status)}
              </Badge>
              {canSignup && (
                <Button size="md" variant="secondary" asChild>
                  <Link href={signupPath}>Sign up</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 pt-1">
            {!tvMode ? (
              <Button size="md" variant="ghost" onClick={enterTv}>
                TV Mode
              </Button>
            ) : (
              <Button size="md" variant="secondary" onClick={exitTv}>
                Exit TV mode
              </Button>
            )}
          </div>
        </div>

        {/* ── Standings ──────────────────────────────────────────────── */}
        {comp.standings.length > 0 && (
          <section>
            <h2
              className={[
                "font-display mb-4 font-bold text-lp-text",
                tvSectionTitle,
              ].join(" ")}
            >
              Standings
            </h2>
            <div className="overflow-x-auto rounded-xl border border-lp-border bg-lp-surface">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-lp-border">
                    <th
                      className={[
                        "px-4 py-3 text-left font-bold uppercase tracking-wider text-lp-muted",
                        tvSmall,
                      ].join(" ")}
                    >
                      Rank
                    </th>
                    <th
                      className={[
                        "px-4 py-3 text-left font-bold uppercase tracking-wider text-lp-muted",
                        tvSmall,
                      ].join(" ")}
                    >
                      Player / Team
                    </th>
                    <th
                      className={[
                        "px-4 py-3 text-right font-bold uppercase tracking-wider text-lp-muted",
                        tvSmall,
                      ].join(" ")}
                    >
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comp.standings.map((s) => {
                    const displayName = s.team
                      ? s.team.name
                      : s.playerUserId
                      ? (soloMap.get(s.playerUserId) ?? "-")
                      : "-";
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-lp-border/50 last:border-0"
                      >
                        <td
                          className={[
                            "px-4 py-3 font-bold tabular-nums text-lp-accent",
                            tvBody,
                          ].join(" ")}
                        >
                          {s.rank ?? "-"}
                        </td>
                        <td
                          className={[
                            "px-4 py-3 font-semibold text-lp-text",
                            tvBody,
                          ].join(" ")}
                        >
                          {displayName}
                        </td>
                        <td
                          className={[
                            "px-4 py-3 text-right font-bold tabular-nums text-lp-text",
                            tvBody,
                          ].join(" ")}
                        >
                          {s.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Match Results ──────────────────────────────────────────── */}
        {comp.matches.length > 0 && (
          <section>
            <h2
              className={[
                "font-display mb-4 font-bold text-lp-text",
                tvSectionTitle,
              ].join(" ")}
            >
              Match Results
            </h2>
            <div className="space-y-6">
              {Array.from(roundGroups.entries())
                .sort(([a], [b]) => a - b)
                .map(([round, matches]) => (
                  <div key={round}>
                    <p
                      className={[
                        "mb-2 font-bold uppercase tracking-wider text-lp-muted",
                        tvSmall,
                      ].join(" ")}
                    >
                      {matches[0]?.label ? matches[0].label : `Round ${round}`}
                    </p>
                    <div className="space-y-2">
                      {matches.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between rounded-lg border border-lp-border bg-lp-surface px-4 py-3"
                        >
                          <span
                            className={[
                              "font-semibold text-lp-text",
                              tvBody,
                            ].join(" ")}
                          >
                            {m.homeTeam?.name ?? "TBD"}
                          </span>
                          <span
                            className={[
                              "mx-4 font-bold tabular-nums text-lp-accent",
                              tvScore,
                            ].join(" ")}
                          >
                            {m.homeScore ?? 0}&nbsp;–&nbsp;{m.awayScore ?? 0}
                          </span>
                          <span
                            className={[
                              "font-semibold text-lp-text",
                              tvBody,
                            ].join(" ")}
                          >
                            {m.awayTeam?.name ?? "TBD"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ── Registered Players ─────────────────────────────────────── */}
        <section>
          <h2
            className={[
              "font-display mb-1 font-bold text-lp-text",
              tvSectionTitle,
            ].join(" ")}
          >
            Registered Players
          </h2>
          <p className={["mb-4 text-lp-muted", tvSmall].join(" ")}>
            {comp.registrations.length} player
            {comp.registrations.length !== 1 ? "s" : ""} registered
          </p>
          {comp.registrations.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {comp.registrations.map((reg) => (
                <li
                  key={reg.id}
                  className={[
                    "rounded-lg border border-lp-border bg-lp-surface px-3 py-2 font-semibold text-lp-text",
                    tvBody,
                  ].join(" ")}
                >
                  {reg.user.name ?? "-"}
                </li>
              ))}
            </ul>
          ) : (
            <p className={["text-lp-muted", tvBody].join(" ")}>
              No confirmed registrations yet.
            </p>
          )}
        </section>

        {/* ── Footer / QR ────────────────────────────────────────────── */}
        <footer className="border-t border-lp-border pt-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <img
              src={qrDataUrl}
              alt="QR code to register"
              className="h-36 w-36 shrink-0 rounded-lg border border-lp-border bg-lp-bg p-1"
            />
            <div className="text-center sm:text-left">
              <p
                className={[
                  "font-bold text-lp-text",
                  tvMode ? "text-2xl" : "text-lg",
                ].join(" ")}
              >
                Scan to register at leaguepour.com
              </p>
              <p className={["mt-1 text-lp-muted", tvSmall].join(" ")}>
                {comp.venue.name} | LeaguePour competition platform
              </p>
              <p
                className={[
                  "mt-2 font-bold text-lp-accent",
                  tvSmall,
                ].join(" ")}
              >
                LeaguePour
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
