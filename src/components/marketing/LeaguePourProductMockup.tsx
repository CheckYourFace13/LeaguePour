import { cn } from "@/lib/utils";

type LeaguePourProductMockupProps = {
  className?: string;
  /** Tighter layout for feature bands */
  compact?: boolean;
};

function MockCard({
  title,
  className,
  children,
  accent = "default",
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
  accent?: "default" | "yellow" | "navy";
}) {
  const accentStyles = {
    default: "border-lp-border bg-white/95",
    yellow: "border-lp-accent-2/60 bg-gradient-to-br from-lp-accent-2/30 to-white",
    navy: "border-lp-accent/30 bg-gradient-to-br from-lp-accent/10 to-white",
  } as const;

  return (
    <div
      className={cn(
        "rounded-2xl border shadow-lg shadow-lp-accent/10 backdrop-blur-sm",
        accentStyles[accent],
        className,
      )}
    >
      <p className="border-b border-lp-border/60 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-lp-accent">
        {title}
      </p>
      <div className="p-3">{children}</div>
    </div>
  );
}

function BracketPreview() {
  return (
    <svg viewBox="0 0 160 88" className="h-auto w-full" aria-hidden>
      <rect x="0" y="8" width="52" height="18" rx="4" fill="#e9f1ff" stroke="#b8cdf8" />
      <text x="6" y="20" fill="#0a1a3f" fontSize="7" fontWeight="600">
        High Fives
      </text>
      <rect x="0" y="34" width="52" height="18" rx="4" fill="#e9f1ff" stroke="#b8cdf8" />
      <text x="6" y="46" fill="#0a1a3f" fontSize="7" fontWeight="600">
        Pool Sharks
      </text>
      <rect x="0" y="60" width="52" height="18" rx="4" fill="#e9f1ff" stroke="#b8cdf8" />
      <text x="6" y="72" fill="#0a1a3f" fontSize="7" fontWeight="600">
        Brew Crew
      </text>
      <rect x="108" y="34" width="52" height="18" rx="4" fill="#ffe042" stroke="#0057d9" strokeWidth="1.5" />
      <text x="114" y="46" fill="#0a1a3f" fontSize="7" fontWeight="700">
        Final
      </text>
      <path d="M52 17 H72 V43 H88" stroke="#0057d9" strokeWidth="1.5" fill="none" />
      <path d="M52 43 H88" stroke="#0057d9" strokeWidth="1.5" fill="none" />
      <path d="M52 69 H72 V43" stroke="#0057d9" strokeWidth="1.5" fill="none" />
      <path d="M88 43 H108" stroke="#0057d9" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function QrPlaceholder() {
  return (
    <svg viewBox="0 0 64 64" className="mx-auto size-16" aria-hidden>
      <rect width="64" height="64" rx="6" fill="#fff" stroke="#b8cdf8" />
      <rect x="8" y="8" width="16" height="16" rx="2" fill="#0a1a3f" />
      <rect x="40" y="8" width="16" height="16" rx="2" fill="#0a1a3f" />
      <rect x="8" y="40" width="16" height="16" rx="2" fill="#0a1a3f" />
      <rect x="28" y="28" width="8" height="8" fill="#0057d9" />
      <rect x="40" y="40" width="8" height="8" fill="#0057d9" />
      <rect x="52" y="28" width="4" height="4" fill="#0a1a3f" />
      <rect x="44" y="52" width="6" height="6" fill="#0a1a3f" />
    </svg>
  );
}

function MarketingBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg className="absolute -left-8 -top-8 size-40 opacity-30" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill="#0057d9" />
      </svg>
      <svg className="absolute -bottom-10 -right-6 size-48 opacity-40" viewBox="0 0 200 200">
        <rect x="20" y="20" width="160" height="160" rx="36" fill="#ffe042" transform="rotate(12 100 100)" />
      </svg>
      <div className="absolute left-1/3 top-1/2 size-24 rounded-full bg-lp-accent/10 blur-2xl" />
      <div className="absolute bottom-1/4 left-1/4 size-32 rounded-full bg-lp-accent-2/20 blur-3xl" />
    </div>
  );
}

export function LeaguePourProductMockup({ className, compact = false }: LeaguePourProductMockupProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-lp-border bg-gradient-to-br from-lp-bg-elevated via-white to-lp-surface-2",
        compact ? "min-h-[320px] p-4 md:min-h-[380px] md:p-5" : "min-h-[420px] p-5 md:min-h-[520px] md:p-6",
        className,
      )}
      role="img"
      aria-label="LeaguePour product preview with tournament bracket, standings, team signup, QR code, upcoming event, and game night specials"
    >
      <MarketingBackdrop />

      <div
        className={cn(
          "relative grid gap-3",
          compact ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-12 md:grid-rows-6 md:gap-4",
        )}
      >
        <MockCard
          title="Tournament Preview"
          accent="navy"
          className={cn(compact ? "col-span-2" : "md:col-span-5 md:row-span-3 md:col-start-1 md:row-start-1")}
        >
          <BracketPreview />
          <p className="mt-2 text-[11px] font-semibold text-lp-muted">Single elimination · 8 teams</p>
        </MockCard>

        <MockCard
          title="Live Standings"
          className={cn(compact ? "" : "md:col-span-4 md:row-span-2 md:col-start-6 md:row-start-1")}
        >
          <table className="w-full text-left text-[10px]">
            <thead>
              <tr className="text-lp-muted">
                <th className="pb-1 font-bold">#</th>
                <th className="pb-1 font-bold">Team</th>
                <th className="pb-1 font-bold">W</th>
                <th className="pb-1 font-bold">PTS</th>
              </tr>
            </thead>
            <tbody className="font-semibold text-lp-text">
              <tr>
                <td className="py-0.5 text-lp-accent">1</td>
                <td>High Fives</td>
                <td>4</td>
                <td>12</td>
              </tr>
              <tr>
                <td className="py-0.5">2</td>
                <td>Pool Sharks</td>
                <td>3</td>
                <td>9</td>
              </tr>
              <tr>
                <td className="py-0.5">3</td>
                <td>Brew Crew</td>
                <td>2</td>
                <td>6</td>
              </tr>
            </tbody>
          </table>
        </MockCard>

        <MockCard
          title="Team Sign Up"
          className={cn(compact ? "" : "md:col-span-3 md:row-span-2 md:col-start-10 md:row-start-1")}
        >
          <div className="space-y-1.5">
            <div className="h-5 rounded-md border border-lp-border bg-lp-bg-elevated px-2 text-[10px] leading-5 text-lp-muted">
              Team name
            </div>
            <div className="h-5 rounded-md border border-lp-border bg-lp-bg-elevated px-2 text-[10px] leading-5 text-lp-text">
              Brew Crew
            </div>
            <div className="mt-2 rounded-lg bg-lp-accent px-2 py-1.5 text-center text-[10px] font-bold text-white">
              Sign up team
            </div>
          </div>
        </MockCard>

        <MockCard
          title="Scan to Sign Up"
          className={cn(compact ? "" : "md:col-span-3 md:row-span-2 md:col-start-1 md:row-start-4")}
        >
          <QrPlaceholder />
          <p className="mt-1 text-center text-[10px] font-semibold text-lp-accent">QR Signup</p>
        </MockCard>

        <MockCard
          title="Upcoming Event"
          accent="navy"
          className={cn(compact ? "col-span-2 md:col-span-1" : "md:col-span-4 md:row-span-2 md:col-start-4 md:row-start-4")}
        >
          <p className="text-xs font-bold text-lp-text">Wednesday Darts League</p>
          <p className="mt-1 text-[10px] text-lp-muted">7:00 PM · The Blue Line Taproom</p>
          <p className="mt-2 inline-flex rounded-full bg-lp-success/15 px-2 py-0.5 text-[9px] font-bold uppercase text-lp-success">
            Open signup
          </p>
        </MockCard>

        <MockCard
          title="Game Night Specials"
          accent="yellow"
          className={cn(compact ? "col-span-2" : "md:col-span-5 md:row-span-2 md:col-start-8 md:row-start-3")}
        >
          <p className="text-xs font-bold text-lp-text">League night deals</p>
          <ul className="mt-2 space-y-1 text-[10px] font-semibold text-lp-text-soft">
            <li>$5 LP Lager</li>
            <li>$6 select cocktails</li>
            <li>Free popcorn for registered teams</li>
          </ul>
        </MockCard>
      </div>

      {!compact ? (
        <div className="relative mt-4 flex flex-wrap gap-2">
          {["Staff Score Entry", "Venue Hub", "Repeat-Player Campaigns"].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-lp-accent/25 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-lp-accent"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
