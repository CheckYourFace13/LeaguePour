import Image from "next/image";
import type { SignupBrand } from "@/lib/signup-plans";
import { HIW_MEDIA } from "@/lib/how-it-works-media";

/**
 * Short "what you get / what happens next" panel shown beside the venue signup form. Every line is
 * product truth as of Nov 2026 - LP: lp-capacity.ts (1 free active competition) and connect-fees.ts;
 * VS: entitlements/vs.ts (Free = inquiry page + leads, Starter = proposals, Pro = contracts,
 * deposits, BEOs). Check those before editing.
 */
const copy: Record<SignupBrand, { kicker: string; title: string; steps: string[]; free: string; img: { key: string; alt: string }; demoHref: string }> = {
  lp: {
    kicker: "What happens next",
    title: "Your first competition, live tonight",
    steps: [
      "Create a competition: pick the game, format, date and entry fee ($0 is fine).",
      "Publish to get a public signup page and QR code. Players register from their phone.",
      "Press Start Tournament, enter scores, and the bracket and standings update for everyone.",
    ],
    free: "Free: one active competition at a time, with every feature. No card. Paid plans from $29/mo only if you run more at once.",
    img: {
      key: "lp-06-qr",
      alt: "A published LeaguePour competition page with its signup QR code and the player registration buttons",
    },
    demoHref: "/how-it-works#demo",
  },
  vs: {
    kicker: "What happens next",
    title: "Your inquiry page goes live right away",
    steps: [
      "Share your inquiry link, or put the form on your website.",
      "Each inquiry lands in your dashboard as a lead with date, guest count and contact details.",
      "Upgrade when you want proposals (Starter) or contracts, deposits and BEOs (Pro).",
    ],
    free: "Free: your inquiry page and lead inbox. No card. Starter $29/mo, Pro $79/mo.",
    img: {
      key: "vs-01-dashboard",
      alt: "A new VenueSprocket dashboard showing the venue's live inquiry page link and where to put the form on your website",
    },
    demoHref: "/how-it-works#demo",
  },
};

export function SignupWhatNext({ brand }: { brand: SignupBrand }) {
  const c = copy[brand];
  const isVs = brand === "vs";
  return (
    <aside aria-labelledby="signup-what-next" className="w-full max-w-md lg:max-w-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-lp-muted">{c.kicker}</p>
      <h2 id="signup-what-next" className="mt-1 font-display text-2xl font-bold text-lp-text">
        {c.title}
      </h2>
      <ol className="mt-4 space-y-3">
        {c.steps.map((s, i) => (
          <li key={s} className="flex gap-3 text-sm text-lp-text-soft">
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isVs ? "bg-[#b87333]/15 text-[#9a5f28]" : "bg-lp-accent/15 text-lp-accent"}`}
              aria-hidden
            >
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 rounded-[10px] border border-lp-border bg-white/80 px-3 py-2 text-sm text-lp-text">{c.free}</p>
      <a href={c.demoHref} className="group mt-4 block overflow-hidden rounded-xl border border-lp-border bg-white shadow-sm">
        {HIW_MEDIA[c.img.key] ? (
          <Image
            src={HIW_MEDIA[c.img.key].src}
            alt={c.img.alt}
            width={HIW_MEDIA[c.img.key].width}
            height={HIW_MEDIA[c.img.key].height}
            className="h-auto w-full"
            sizes="(min-width: 1024px) 384px, 100vw"
          />
        ) : null}
        <span className="block px-3 py-2 text-sm font-semibold text-lp-accent group-hover:underline">
          ▶ Watch the demo first
        </span>
      </a>
    </aside>
  );
}
