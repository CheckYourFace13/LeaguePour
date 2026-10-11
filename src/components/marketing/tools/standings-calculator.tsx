"use client";

import { useMemo, useRef, useState } from "react";
import { buildRoundRobinSchedule } from "@/lib/tournament";
import { NamesInput, SAMPLE_NAMES, ToolPrintButton, parseNames } from "./tool-ui";

type Result = { key: number; home: string; away: string; homeScore: string; awayScore: string };

// LeaguePour's standings rule: 3 points for a win, 1 for a tie, 0 for a loss.
const WIN = 3;
const TIE = 1;

export function StandingsCalculator() {
  const [text, setText] = useState(SAMPLE_NAMES.slice(0, 4).join("\n"));
  const teams = useMemo(() => parseNames(text), [text]);
  const [results, setResults] = useState<Result[]>([]);
  const keyRef = useRef(1);

  const names = teams.map((t) => t.name);
  const update = (key: number, patch: Partial<Result>) =>
    setResults((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const fillSchedule = () => {
    if (teams.length < 2) return;
    const { rounds } = buildRoundRobinSchedule(teams);
    setResults(rounds.flat().map((m) => ({ key: keyRef.current++, home: m.home.name, away: m.away.name, homeScore: "", awayScore: "" })));
  };

  const table = useMemo(() => {
    const rows = new Map(names.map((n) => [n, { name: n, played: 0, w: 0, l: 0, t: 0, pf: 0, pa: 0, pts: 0 }]));
    for (const r of results) {
      if (r.homeScore === "" || r.awayScore === "" || r.home === r.away) continue;
      const h = rows.get(r.home);
      const a = rows.get(r.away);
      const hs = Number(r.homeScore);
      const as = Number(r.awayScore);
      if (!h || !a || !Number.isFinite(hs) || !Number.isFinite(as)) continue;
      h.played++; a.played++;
      h.pf += hs; h.pa += as; a.pf += as; a.pa += hs;
      if (hs > as) { h.w++; a.l++; h.pts += WIN; }
      else if (as > hs) { a.w++; h.l++; a.pts += WIN; }
      else { h.t++; a.t++; h.pts += TIE; a.pts += TIE; }
    }
    return [...rows.values()].sort(
      (x, y) => y.pts - x.pts || y.w - x.w || y.pf - y.pa - (x.pf - x.pa) || x.name.localeCompare(y.name),
    );
  }, [names, results]);

  const selectCls = "min-w-0 flex-1 rounded-lg border border-lp-border-strong bg-lp-bg px-2 py-2 text-sm text-lp-text";
  const scoreCls = "w-16 rounded-lg border border-lp-border-strong bg-lp-bg px-2 py-2 text-center text-sm text-lp-text";

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <NamesInput value={text} onChange={setText} label="Teams or players (one per line)" />

        <div className="print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-lp-text">Results</h2>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={fillSchedule} className="rounded-lg border border-lp-border-strong bg-lp-bg px-3 py-2 text-sm font-semibold text-lp-text hover:border-lp-accent">
                Fill round robin fixtures
              </button>
              <button
                type="button"
                onClick={() => setResults((rs) => [...rs, { key: keyRef.current++, home: names[0] ?? "", away: names[1] ?? "", homeScore: "", awayScore: "" }])}
                disabled={names.length < 2}
                className="rounded-lg border border-lp-border-strong bg-lp-bg px-3 py-2 text-sm font-semibold text-lp-text hover:border-lp-accent disabled:opacity-50"
              >
                Add a result
              </button>
            </div>
          </div>
          {results.length === 0 ? (
            <p className="mt-4 text-sm text-lp-muted">
              Add results one at a time, or fill in every round robin fixture and type the scores.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {results.map((r) => (
                <li key={r.key} className="flex flex-wrap items-center gap-2">
                  <select aria-label="Home" value={r.home} onChange={(e) => update(r.key, { home: e.target.value })} className={selectCls}>
                    {names.map((n) => <option key={n}>{n}</option>)}
                  </select>
                  <input aria-label="Home score" type="number" inputMode="numeric" min="0" value={r.homeScore} onChange={(e) => update(r.key, { homeScore: e.target.value })} className={scoreCls} />
                  <span className="text-xs text-lp-muted">-</span>
                  <input aria-label="Away score" type="number" inputMode="numeric" min="0" value={r.awayScore} onChange={(e) => update(r.key, { awayScore: e.target.value })} className={scoreCls} />
                  <select aria-label="Away" value={r.away} onChange={(e) => update(r.key, { away: e.target.value })} className={selectCls}>
                    {names.map((n) => <option key={n}>{n}</option>)}
                  </select>
                  <button type="button" aria-label="Remove result" onClick={() => setResults((rs) => rs.filter((x) => x.key !== r.key))} className="rounded-lg px-2 py-2 text-sm text-lp-muted hover:text-lp-text">
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-lp-text">Standings</h2>
          <ToolPrintButton />
        </div>
        <div className="overflow-x-auto rounded-2xl border border-lp-border">
          <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-lp-border bg-lp-surface/60 text-xs font-bold uppercase tracking-wider text-lp-text-soft">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-3 py-3 text-center">P</th>
                <th className="px-3 py-3 text-center">W</th>
                <th className="px-3 py-3 text-center">L</th>
                <th className="px-3 py-3 text-center">T</th>
                <th className="px-3 py-3 text-center">+/-</th>
                <th className="px-4 py-3 text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => (
                <tr key={row.name} className={i % 2 === 1 ? "bg-lp-surface/30" : ""}>
                  <td className="px-4 py-3 font-semibold text-lp-accent">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-lp-text">{row.name}</td>
                  <td className="px-3 py-3 text-center text-lp-text-soft">{row.played}</td>
                  <td className="px-3 py-3 text-center text-lp-text-soft">{row.w}</td>
                  <td className="px-3 py-3 text-center text-lp-text-soft">{row.l}</td>
                  <td className="px-3 py-3 text-center text-lp-text-soft">{row.t}</td>
                  <td className="px-3 py-3 text-center text-lp-text-soft">{row.pf - row.pa > 0 ? "+" : ""}{row.pf - row.pa}</td>
                  <td className="px-4 py-3 text-center font-bold text-lp-text">{row.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-lp-muted">
          3 points for a win, 1 for a tie, 0 for a loss - the same rule LeaguePour uses. Sorted by
          points, then wins; this calculator also uses score difference (+/-) as a final tiebreak.
          Nothing is saved: refresh the page and it resets.
        </p>
      </div>
    </div>
  );
}
