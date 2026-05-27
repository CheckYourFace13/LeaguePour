import { LeaguePourProductMockup } from "@/components/marketing/LeaguePourProductMockup";

type StatusGroup = {
  label: string;
  variant: "live" | "designed" | "roadmap";
  items: string[];
};

export const tournamentStatusGroups: StatusGroup[] = [
  {
    label: "Live",
    variant: "live",
    items: ["Signups", "Payments", "QR codes", "Staff score entry", "Standings", "Venue hubs"],
  },
  {
    label: "Designed for",
    variant: "designed",
    items: [
      "Single elimination",
      "Double elimination",
      "Round robin",
      "Ladder",
      "Season",
      "Points",
    ],
  },
  {
    label: "Roadmap",
    variant: "roadmap",
    items: [
      "Auto-generated bracket trees",
      "Swiss",
      "Pool play into playoffs",
      "Drag-and-drop seeding",
      "Station assignment",
      "Public queue display",
    ],
  },
];

const groupStyles = {
  live: "border-green-500/35 bg-green-500/8",
  designed: "border-lp-accent/35 bg-lp-accent/8",
  roadmap: "border-lp-border bg-lp-surface/50",
} as const;

const chipStyles = {
  live: "border-green-500/30 bg-white text-green-800",
  designed: "border-lp-accent/30 bg-white text-lp-accent",
  roadmap: "border-lp-border bg-white text-lp-muted",
} as const;

function StatusBadges({ groups }: { groups: StatusGroup[] }) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.label} className={`rounded-xl border p-4 ${groupStyles[group.variant]}`}>
          <p className="text-xs font-bold uppercase tracking-wider text-lp-text">{group.label}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span
                key={item}
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${chipStyles[group.variant]}`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type TournamentVisualBandProps = {
  title: string;
  copy: string;
};

export function TournamentVisualBand({ title, copy }: TournamentVisualBandProps) {
  return (
    <section className="border-y border-lp-border bg-gradient-to-b from-lp-bg-elevated/80 to-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">{title}</h2>
            <p className="mt-4 text-lg text-lp-muted leading-relaxed">{copy}</p>
            <div className="mt-8">
              <StatusBadges groups={tournamentStatusGroups} />
            </div>
          </div>
          <LeaguePourProductMockup compact />
        </div>
      </div>
    </section>
  );
}
