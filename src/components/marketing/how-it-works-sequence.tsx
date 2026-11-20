import Image from "next/image";

export type HowStep = {
  title: string;
  body: string;
  img: { src: string; alt: string; width: number; height: number };
  /** Numbered callouts on key controls: x/y are % of the image (from the recorded element boxes). */
  marks?: { x: number; y: number; label: string }[];
  /** Phone screenshots render narrower. */
  phone?: boolean;
};

/**
 * Visual "How it works" sequence built from real screenshots of the demo flows. Callout numbers
 * are decorative (aria-hidden); the same information is in the ordered list under each image, so
 * screen-reader and keyboard users get every annotation as text.
 */
export function HowItWorksSequence({ steps, accent = "lp" }: { steps: HowStep[]; accent?: "lp" | "vs" }) {
  const dot = accent === "vs" ? "bg-[#b87333] ring-white" : "bg-lp-accent ring-white";
  const num = accent === "vs" ? "text-[#9a5f28] bg-[#b87333]/12" : "text-lp-accent bg-lp-accent/12";
  return (
    <ol className="space-y-16 md:space-y-20">
      {steps.map((s, i) => (
        <li key={s.title} className="grid items-center gap-6 md:grid-cols-12 md:gap-10">
          <div className={`md:col-span-5 ${i % 2 === 1 ? "md:order-2" : ""}`}>
            <span className={`inline-flex size-9 items-center justify-center rounded-full text-sm font-bold ${num}`}>{i + 1}</span>
            <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">{s.title}</h3>
            <p className="mt-3 text-base leading-relaxed opacity-85">{s.body}</p>
            {s.marks?.length ? (
              <ol className="mt-4 space-y-2 text-sm">
                {s.marks.map((m, j) => (
                  <li key={m.label} className="flex gap-2.5">
                    <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${dot.split(" ")[0]}`} aria-hidden>
                      {j + 1}
                    </span>
                    <span>{m.label}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
          <div className={`md:col-span-7 ${i % 2 === 1 ? "md:order-1" : ""}`}>
            <div className={`relative mx-auto overflow-hidden border border-black/10 bg-white shadow-xl ${s.phone ? "max-w-[300px] rounded-[2rem] border-[6px] border-neutral-900" : "rounded-xl"}`}>
              <Image src={s.img.src} alt={s.img.alt} width={s.img.width} height={s.img.height} className="h-auto w-full" sizes={s.phone ? "300px" : "(min-width: 768px) 640px, 100vw"} />
              {s.marks?.map((m, j) => (
                <span
                  key={m.label}
                  aria-hidden
                  className={`absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg ring-2 ${dot}`}
                  style={{ left: `${m.x}%`, top: `${m.y}%` }}
                >
                  {j + 1}
                </span>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
