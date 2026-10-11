"use client";

import { useMemo, useState } from "react";
import { buildRoundRobinSchedule } from "@/lib/tournament";
import { NamesInput, SAMPLE_NAMES, ShuffleButton, ToolPrintButton, parseNames } from "./tool-ui";

/**
 * Full round-robin schedule from the same circle-method function LeaguePour runs live
 * (buildRoundRobinSchedule in src/lib/tournament.ts): everyone plays everyone once, home/away
 * alternates by round, and with an odd count one entrant sits out each round.
 */
export function RoundRobinScheduler() {
  const [text, setText] = useState(SAMPLE_NAMES.slice(0, 5).join("\n"));
  const entrants = useMemo(() => parseNames(text), [text]);
  const { rounds, totalMatches } = useMemo(
    () => (entrants.length >= 2 ? buildRoundRobinSchedule(entrants) : { rounds: [], totalMatches: 0 }),
    [entrants],
  );
  const odd = entrants.length % 2 === 1;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_1fr]">
      <div className="space-y-3">
        <NamesInput value={text} onChange={setText} />
        <div className="flex flex-wrap gap-2">
          <ShuffleButton value={text} onChange={setText} />
          <ToolPrintButton />
        </div>
      </div>

      <div>
        {rounds.length === 0 ? (
          <p className="text-sm text-lp-muted">Add at least two names to build a schedule.</p>
        ) : (
          <>
            <div className="mb-5 rounded-xl border border-lp-border bg-lp-surface/50 px-4 py-3 text-sm leading-relaxed text-lp-text-soft">
              <p>
                {entrants.length} entrants → {rounds.length} {rounds.length === 1 ? "round" : "rounds"}, {totalMatches} total{" "}
                {totalMatches === 1 ? "match" : "matches"}. Everyone plays everyone once.
              </p>
              {odd && <p>Odd number of entrants: one sits out each round, and everyone sits out exactly once.</p>}
            </div>
            <div className="space-y-6">
              {rounds.map((matches, i) => {
                const playing = new Set(matches.flatMap((m) => [m.home.id, m.away.id]));
                const sitsOut = entrants.find((e) => !playing.has(e.id));
                return (
                  <section key={i} className="break-inside-avoid">
                    <h3 className="lp-kicker mb-3">Round {i + 1}</h3>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {matches.map((m) => (
                        <li
                          key={`${m.home.id}-${m.away.id}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-lp-border bg-lp-bg px-4 py-3 text-sm"
                        >
                          <span className="min-w-0 flex-1 truncate font-semibold text-lp-text">{m.home.name}</span>
                          <span className="shrink-0 text-xs text-lp-muted">vs</span>
                          <span className="min-w-0 flex-1 truncate text-right font-semibold text-lp-text">{m.away.name}</span>
                        </li>
                      ))}
                    </ul>
                    {sitsOut && <p className="mt-2 text-xs text-lp-muted">Sits out: {sitsOut.name}</p>}
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
