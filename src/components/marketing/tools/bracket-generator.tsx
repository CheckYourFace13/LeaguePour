"use client";

import { useMemo, useState } from "react";
import {
  buildSingleEliminationRound1,
  describeBracket,
  pairNextRound,
  roundName,
  singleEliminationRoundCount,
  type BracketPairing,
  type Participant,
} from "@/lib/tournament";
import { NamesInput, SAMPLE_NAMES, ShuffleButton, ToolPrintButton, parseNames } from "./tool-ui";

type Round = { name: string; matches: (BracketPairing & { matchNo: number | null })[] };

/**
 * Builds the whole bracket with the same functions LeaguePour runs live (src/lib/tournament.ts):
 * byes go to the first entrants listed, everyone else is paired in order, and later rounds pair
 * winners in bracket order. Later rounds show "Winner of Match N" because nothing has been played.
 */
function buildBracket(entrants: Participant[]): Round[] {
  const totalRounds = singleEliminationRoundCount(entrants.length);
  const rounds: Round[] = [];
  let matchNo = 0;
  let current = buildSingleEliminationRound1(entrants).pairings;

  for (let r = 0; r < totalRounds; r++) {
    const matches = current.map((p) => ({ ...p, matchNo: p.away ? ++matchNo : null }));
    rounds.push({ name: `Round ${r + 1} · ${roundName(totalRounds - 1 - r)}`, matches });
    if (r === totalRounds - 1) break;
    const advancing: Participant[] = matches.map((m) =>
      m.away ? { id: `w${m.matchNo}`, name: `Winner of Match ${m.matchNo}` } : m.home,
    );
    current = pairNextRound(advancing);
  }
  return rounds;
}

export function BracketGenerator() {
  const [text, setText] = useState(SAMPLE_NAMES.join("\n"));
  const entrants = useMemo(() => parseNames(text), [text]);
  const rounds = useMemo(() => (entrants.length >= 2 ? buildBracket(entrants) : []), [entrants]);
  const summary = describeBracket("SINGLE_ELIMINATION", entrants.length);

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
        <div className="mb-5 rounded-xl border border-lp-border bg-lp-surface/50 px-4 py-3 text-sm leading-relaxed text-lp-text-soft">
          {summary.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        {rounds.length === 0 ? (
          <p className="text-sm text-lp-muted">Add at least two names to build a bracket.</p>
        ) : (
          <div className="space-y-7">
            {rounds.map((round) => (
              <section key={round.name} className="break-inside-avoid">
                <h3 className="lp-kicker mb-3">{round.name}</h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {round.matches.map((m) => (
                    <li
                      key={m.slot}
                      className="flex items-center justify-between gap-3 rounded-xl border border-lp-border bg-lp-bg px-4 py-3 text-sm"
                    >
                      {m.away ? (
                        <>
                          <span className="min-w-0 flex-1 truncate font-semibold text-lp-text">{m.home.name}</span>
                          <span className="shrink-0 text-xs text-lp-muted">M{m.matchNo} · vs</span>
                          <span className="min-w-0 flex-1 truncate text-right font-semibold text-lp-text">{m.away.name}</span>
                        </>
                      ) : (
                        <>
                          <span className="min-w-0 flex-1 truncate font-semibold text-lp-text">{m.home.name}</span>
                          <span className="shrink-0 text-xs font-semibold text-lp-accent">Bye - advances</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
