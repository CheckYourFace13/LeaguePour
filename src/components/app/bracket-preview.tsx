/**
 * Lightweight read-only bracket visualization for venue standings (Phase 2).
 * Not a full bracket editor - shows structure + scores when present. Grouped by round so a
 * multi-round single-elimination bracket reads top-to-bottom instead of as one flat list.
 */
type BracketMatch = {
  id: string;
  round: number;
  label: string | null;
  homeName: string;
  awayName: string | null;
  homeScore: number | null;
  awayScore: number | null;
  completed: boolean;
};

export function BracketPreview({ title, matches }: { title: string; matches: BracketMatch[] }) {
  if (matches.length === 0) return null;

  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);

  return (
    <div className="rounded-2xl border border-lp-border bg-lp-bg/50 p-4 md:p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-lp-muted">{title}</p>
      <div className="mt-4 flex flex-col gap-6">
        {rounds.map((round) => (
          <div key={round} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-lp-muted">Round {round}</p>
            {matches
              .filter((m) => m.round === round)
              .map((m) =>
                m.awayName === null ? (
                  <div
                    key={m.id}
                    className="rounded-xl border border-lp-border bg-lp-surface/60 px-3 py-3 text-sm md:px-4"
                  >
                    <p className="truncate font-medium">{m.homeName} - bye, advances automatically</p>
                  </div>
                ) : (
                  <div
                    key={m.id}
                    className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border border-lp-border bg-lp-surface/60 px-3 py-3 text-sm md:gap-4 md:px-4"
                  >
                    <div className="min-w-0 text-left">
                      <p className="truncate font-medium">{m.homeName}</p>
                      {m.label ? <p className="text-xs text-lp-muted">{m.label}</p> : null}
                    </div>
                    <div className="shrink-0 text-center font-mono text-xs text-lp-muted tabular-nums">
                      {m.completed && m.homeScore != null && m.awayScore != null ? (
                        <span>
                          <span className="font-semibold text-lp-text">{m.homeScore}</span>
                          <span className="mx-1">-</span>
                          <span className="font-semibold text-lp-text">{m.awayScore}</span>
                        </span>
                      ) : (
                        <span className="text-lp-muted">vs</span>
                      )}
                    </div>
                    <div className="min-w-0 text-right">
                      <p className="truncate font-medium">{m.awayName}</p>
                    </div>
                  </div>
                ),
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
