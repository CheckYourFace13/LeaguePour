import { MarketingImage } from "@/components/marketing/marketing-image";
import { marketingImages } from "@/lib/marketing-images";

type MarketingVisualBandProps = {
  title: string;
  copy: string;
  imageKey: keyof typeof marketingImages;
  imagePosition?: "left" | "right";
  badges?: { label: string; variant: "live" | "designed" | "roadmap" }[];
};

const badgeStyles = {
  live: "border-green-500/40 bg-green-500/10 text-green-300",
  designed: "border-lp-accent/40 bg-lp-accent/10 text-lp-accent",
  roadmap: "border-lp-muted/30 bg-lp-surface text-lp-muted",
} as const;

const badgePrefix = {
  live: "Live: ",
  designed: "Designed for: ",
  roadmap: "Planned/Roadmap: ",
} as const;

export function MarketingVisualBand({
  title,
  copy,
  imageKey,
  imagePosition = "right",
  badges,
}: MarketingVisualBandProps) {
  const image = marketingImages[imageKey];
  const textBlock = (
    <div className={imagePosition === "left" ? "md:order-2" : ""}>
      <h2 className="font-display text-3xl font-bold md:text-4xl">{title}</h2>
      <p className="mt-4 text-lp-muted leading-relaxed">{copy}</p>
      {badges && badges.length > 0 ? (
        <div className="mt-6 flex flex-col gap-2">
          {badges.map((badge) => (
            <span
              key={badge.label}
              className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold leading-snug ${badgeStyles[badge.variant]}`}
            >
              {badgePrefix[badge.variant]}
              {badge.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
  const imageBlock = (
    <div className={imagePosition === "left" ? "md:order-1" : ""}>
      <MarketingImage {...image} />
    </div>
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        {textBlock}
        {imageBlock}
      </div>
    </section>
  );
}

export const tournamentVisualBadges = [
  { label: "signups, payments, QR codes, staff score entry, standings, venue hubs", variant: "live" as const },
  {
    label: "single elimination, double elimination, round robin, ladder, season, points",
    variant: "designed" as const,
  },
  {
    label: "auto-generated brackets, Swiss, pool play into playoffs, drag-and-drop seeding, auto station assignment",
    variant: "roadmap" as const,
  },
];
