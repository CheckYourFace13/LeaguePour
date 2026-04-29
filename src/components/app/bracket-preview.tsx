/**
 * Lightweight read-only bracket visualization for venue standings (Phase 2).
 * Not a full bracket editor — shows structure + scores when present.
 */
type BracketMatch = {
  id: string;
  label: string | null;
  homeName: string;
  awayName: string;
  homeScore: number | null;
  awayScore: number | null;
  completed: boolean;
};

export function BracketPreview({ title, matches }: { title: string; matches: BracketMatch[] }) {
  if (matches.length === 0) return null;

  return (
    <div className="rounded-2xl border border-lp-border bg-lp-bg/50 p-4 md:p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-lp-muted">{title}</p>
      <div className="mt-4 flex flex-col gap-3">
        {matches.map((m) => (
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
                  <span className="mx-1">—</span>
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
        ))}
      </div>
    </div>
  );
}
