"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  DE_MAX_ENTRANTS,
  DE_MIN_ENTRANTS,
  buildDoubleElimination,
  decodeBracketState,
  describeSource,
  emptyPicks,
  encodeBracketState,
  resolveBracket,
  setMatchWinner,
  type DeBracket,
  type DeMatch,
  type DeMatchState,
  type DePick,
  type DeResult,
  type DeRound,
} from "@/lib/double-elimination";
import { NamesInput, ShuffleButton, ToolPrintButton, parseNames } from "./tool-ui";

const SHARE_PREFIX = "#bracket=";
const SAMPLE_ENTRANTS = Array.from({ length: 8 }, (_, i) => `Team ${i + 1}`);
const toolButton =
  "rounded-lg border border-lp-border-strong bg-lp-bg px-4 py-2 text-sm font-semibold text-lp-text hover:border-lp-accent print:hidden";

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/** A shared link's bracket lives in the #fragment. Remounts when a different link is opened. */
export function DoubleEliminationGenerator() {
  const hash = useSyncExternalStore(subscribeToHash, () => window.location.hash, () => "");
  return <Generator key={hash} hash={hash} />;
}

function Generator({ hash }: { hash: string }) {
  const shared = useMemo(() => (hash.startsWith(SHARE_PREFIX) ? decodeBracketState(hash.slice(SHARE_PREFIX.length)) : null), [hash]);
  const [text, setText] = useState(() => (shared?.names ?? SAMPLE_ENTRANTS).join("\n"));
  const [savedPicks, setPicks] = useState<DePick[]>(() => shared?.picks ?? []);
  const [shareStatus, setShareStatus] = useState<{ url: string; copied: boolean } | null>(null);

  const entrants = useMemo(() => parseNames(text), [text]);
  const names = useMemo(() => entrants.map((e) => e.name), [entrants]);
  const tooMany = text.split(/\r?\n/).filter((l) => l.trim()).length > DE_MAX_ENTRANTS;
  const bracket = useMemo(() => (entrants.length >= DE_MIN_ENTRANTS ? buildDoubleElimination(entrants.length) : null), [entrants.length]);
  const picks = useMemo(
    () => (!bracket ? [] : savedPicks.length === bracket.matches.length ? savedPicks : emptyPicks(bracket)),
    [bracket, savedPicks],
  );
  const result = useMemo(() => (bracket ? resolveBracket(bracket, picks) : null), [bracket, picks]);

  const changeText = (next: string, keepResults: boolean) => {
    // Renaming keeps results; a different field size or a new draw is a different bracket.
    if (!keepResults || parseNames(next).length !== entrants.length) setPicks([]);
    setText(next);
    setShareStatus(null);
  };

  const pick = (matchId: number, side: 1 | 2) => {
    if (!bracket) return;
    setPicks(setMatchWinner(bracket, picks, matchId, side));
    setShareStatus(null);
  };

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}${SHARE_PREFIX}${encodeBracketState(names, picks)}`;
    let copied = false;
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch {
      // Clipboard can be blocked; the link is shown below to copy by hand.
    }
    setShareStatus({ url, copied });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-3 print:hidden">
        {hash.startsWith(SHARE_PREFIX) && !shared ? (
          <p role="alert" className="text-sm font-medium text-lp-warning">
            This share link is incomplete or invalid, so sample names are shown instead. Ask for the full link.
          </p>
        ) : null}
        <NamesInput value={text} onChange={(v) => changeText(v, true)} />
        {tooMany ? (
          <p role="alert" className="text-sm font-medium text-lp-warning">
            Only the first {DE_MAX_ENTRANTS} names are used.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <ShuffleButton value={text} onChange={(v) => changeText(v, false)} />
          <ToolPrintButton />
          <button type="button" onClick={() => setPicks([])} className={toolButton}>
            Clear results
          </button>
          {bracket ? (
            <button type="button" onClick={share} className={toolButton}>
              Copy share link
            </button>
          ) : null}
        </div>
        {shareStatus ? (
          <div aria-live="polite" className="rounded-xl border border-lp-border bg-lp-surface/50 p-3 text-xs leading-relaxed text-lp-text-soft">
            <p className="font-semibold text-lp-text">{shareStatus.copied ? "Link copied." : "Copy this link:"}</p>
            <input
              readOnly
              aria-label="Share link"
              value={shareStatus.url}
              onFocus={(e) => e.currentTarget.select()}
              className="mt-2 w-full rounded-lg border border-lp-border bg-lp-bg px-2 py-1.5 font-mono text-xs text-lp-text"
            />
            <p className="mt-2">Anyone who gets this link can read every name in it and see the results, so only share names you&apos;re comfortable sharing. LeaguePour doesn&apos;t save the bracket.</p>
          </div>
        ) : null}
      </div>

      <div className="min-w-0">
        {bracket && result ? (
          <BracketView bracket={bracket} result={result} names={names} onPick={pick} />
        ) : (
          <p className="rounded-xl border border-lp-border bg-lp-surface/50 px-4 py-3 text-sm text-lp-text-soft">
            Add at least {DE_MIN_ENTRANTS} names to build a double elimination bracket.
          </p>
        )}
      </div>
    </div>
  );
}

function BracketView({
  bracket,
  result,
  names,
  onPick,
}: {
  bracket: DeBracket;
  result: DeResult;
  names: string[];
  onPick: (matchId: number, side: 1 | 2) => void;
}) {
  const n = bracket.entrantCount;
  const stillIn = result.losses.filter((l) => l < 2).length;
  const sections: { title: string; rounds: DeRound[] }[] = [
    { title: "Winners bracket", rounds: bracket.rounds.filter((r) => r.bracket === "winners") },
    { title: "Losers bracket", rounds: bracket.rounds.filter((r) => r.bracket === "losers") },
    { title: "Grand final", rounds: bracket.rounds.filter((r) => r.bracket === "final") },
  ];

  return (
    <div className="space-y-7">
      <div className="rounded-xl border border-lp-border bg-lp-surface/50 px-4 py-3 text-sm leading-relaxed text-lp-text-soft">
        <p>
          {n} entrants: {2 * n - 2} matches, or {2 * n - 1} if the grand final needs a reset.
          {bracket.byes.length > 0 ? ` ${bracket.byes.length} first-round ${bracket.byes.length === 1 ? "bye" : "byes"}.` : ""}
        </p>
        <p className="print:hidden">Tap the winner of each match to move everyone to their next match. Tap again to undo.</p>
        <p aria-live="polite">
          {result.decided} of {result.required} results entered · {stillIn} still in
        </p>
        {result.champion !== null ? (
          <p className="mt-2 font-display text-xl font-bold text-lp-text">
            Champion: {names[result.champion]}
            <span className="ml-2 font-sans text-sm font-medium text-lp-text-soft">Runner-up: {names[result.runnerUp!]}</span>
          </p>
        ) : null}
      </div>

      {bracket.byes.length > 0 ? (
        <p className="text-sm text-lp-text-soft">
          <span className="font-semibold text-lp-text">Byes to winners round 2:</span>{" "}
          {bracket.byes.map((i) => names[i]).join(", ")}
        </p>
      ) : null}

      {sections.map((section) => (
        <section key={section.title} aria-label={section.title}>
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
            <h2 className="font-display text-xl font-bold text-lp-text">{section.title}</h2>
            {section.rounds.length > 1 ? (
              <p className="text-xs font-medium text-lp-muted print:hidden">Scroll sideways for all {section.rounds.length} rounds →</p>
            ) : null}
          </div>
          {/* Keyboard-focusable so the sideways scroll works without a pointer. */}
          <div
            tabIndex={0}
            role="group"
            aria-label={`${section.title} rounds, scrollable`}
            className="overflow-x-auto rounded-xl border border-lp-border bg-lp-surface/30 p-3 outline-none focus-visible:border-lp-accent print:overflow-visible print:border-0 print:bg-transparent print:p-0"
          >
            <div className="flex w-max items-start gap-3 print:block print:w-auto">
              {section.rounds.map((round) => (
                <div key={round.key} className="w-56 shrink-0 print:mb-4 print:w-auto">
                  <h3 className="lp-kicker mb-2 break-after-avoid">{round.label}</h3>
                  <ul className="space-y-2 print:grid print:grid-cols-2 print:gap-2 print:space-y-0">
                    {round.matches.map((match) => (
                      <MatchCard key={match.id} match={match} state={result.states[match.id - 1]} bracket={bracket} names={names} onPick={onPick} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function MatchCard({
  match,
  state,
  bracket,
  names,
  onPick,
}: {
  match: DeMatch;
  state: DeMatchState;
  bracket: DeBracket;
  names: string[];
  onPick: (matchId: number, side: 1 | 2) => void;
}) {
  const playable = state.needed && state.a !== null && state.b !== null;
  const sides = [
    { side: 1 as const, entrant: state.a, source: match.a },
    { side: 2 as const, entrant: state.b, source: match.b },
  ];
  return (
    <li className={`break-inside-avoid rounded-lg border border-lp-border bg-lp-bg p-1.5 ${state.needed ? "" : "opacity-60"}`}>
      <p className="px-1.5 pb-1 text-[0.6875rem] font-semibold text-lp-muted">
        M{match.id}
        {match.isReset ? (state.needed ? " · reset required" : ` · only if the losers-bracket champion wins M${bracket.grandFinalId}`) : ""}
      </p>
      {sides.map(({ side, entrant, source }) => {
        const label = entrant !== null ? names[entrant] : describeSource(source, names);
        const won = state.side === side;
        const lost = state.side !== 0 && !won;
        return (
          <button
            key={side}
            type="button"
            disabled={!playable}
            aria-pressed={won}
            title={label}
            onClick={() => onPick(match.id, side)}
            className={`flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left text-sm disabled:cursor-default print:min-h-7 ${
              won ? "bg-lp-accent/15 font-bold text-lp-text" : lost ? "text-lp-muted line-through" : entrant !== null ? "font-medium text-lp-text" : "text-lp-muted"
            } ${playable ? "hover:bg-lp-surface" : ""}`}
          >
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {won ? <span aria-hidden className="shrink-0 text-lp-accent">✓</span> : null}
          </button>
        );
      })}
    </li>
  );
}
