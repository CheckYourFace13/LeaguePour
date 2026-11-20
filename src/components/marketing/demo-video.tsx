"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { DEMO_VIDEOS, type DemoVideoId } from "@/lib/demo-videos";

/**
 * Recorded product demo with a Play Demo control, captions (WebVTT, on by default), native
 * keyboard-accessible controls, and a transcript. preload="none" + a poster keeps it off the
 * critical path: nothing but the poster downloads until the visitor presses play.
 *
 * Analytics (GA4 via trackEvent, no personal data): demo_video_play, demo_video_progress
 * (25/50/75), demo_video_complete (>= 90% watched or ended) - each once per page view - and
 * demo_cta_click from <DemoCta>, which reports whether the visitor had watched first.
 */
const watched = new Map<DemoVideoId, number>();

export function DemoVideo({
  id,
  className = "",
  accent = "lp",
  showTranscript = true,
  priorityPoster = false,
}: {
  id: DemoVideoId;
  className?: string;
  accent?: "lp" | "vs";
  showTranscript?: boolean;
  priorityPoster?: boolean;
}) {
  const v = DEMO_VIDEOS[id];
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const fired = useRef(new Set<string>());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const once = (key: string, fn: () => void) => {
      if (fired.current.has(key)) return;
      fired.current.add(key);
      fn();
    };
    const onPlay = () => {
      setStarted(true);
      once("play", () => trackEvent("demo_video_play", { video: id, product: v.product }));
    };
    const onTime = () => {
      if (!el.duration || !Number.isFinite(el.duration)) return;
      const pct = (el.currentTime / el.duration) * 100;
      watched.set(id, Math.max(watched.get(id) ?? 0, pct));
      for (const mark of [25, 50, 75]) {
        if (pct >= mark) once(`p${mark}`, () => trackEvent("demo_video_progress", { video: id, product: v.product, percent: mark }));
      }
      if (pct >= 90) once("complete", () => trackEvent("demo_video_complete", { video: id, product: v.product }));
    };
    const onEnded = () => once("complete", () => trackEvent("demo_video_complete", { video: id, product: v.product }));
    el.addEventListener("play", onPlay);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, [id, v.product]);

  function play() {
    setStarted(true);
    const el = ref.current;
    if (!el) return;
    void el.play().catch(() => {
      /* autoplay policy or decode failure: native controls remain usable */
    });
    // Controls render on the next frame; move keyboard focus to the player once they exist.
    requestAnimationFrame(() => el.focus());
  }

  const ring = accent === "vs" ? "focus-visible:ring-[#b87333]" : "focus-visible:ring-lp-accent";
  const btn = accent === "vs" ? "bg-[#b87333] hover:bg-[#9a5f28]" : "bg-lp-accent hover:bg-lp-accent-hover";

  return (
    <figure className={className}>
      <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-black shadow-xl" style={{ aspectRatio: `${v.width} / ${v.height}` }}>
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full"
          controls={started}
          preload="none"
          playsInline
          poster={v.poster}
          aria-label={`${v.title} (${v.durationLabel}, with captions)`}
          aria-describedby={showTranscript ? `${id}-transcript` : undefined}
        >
          <source src={v.mp4} type="video/mp4" />
          <track kind="captions" src={v.captions} srcLang="en" label="English captions" default />
          Your browser can&apos;t play this video. <a href={v.mp4}>Download the MP4</a> or read the transcript below.
        </video>
        {!started ? (
          <button
            type="button"
            onClick={play}
            className={`group absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/45 via-black/10 to-transparent outline-none focus-visible:ring-4 focus-visible:ring-inset ${ring}`}
            aria-label={`Play demo: ${v.title}, ${v.durationLabel}, captions on`}
          >
            <span
              className={`flex items-center gap-3 rounded-full px-6 py-3.5 text-lg font-bold text-white shadow-2xl transition-transform motion-safe:group-hover:scale-105 ${btn}`}
            >
              <svg aria-hidden viewBox="0 0 24 24" className="size-6 fill-current">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
              Play demo
              <span className="text-sm font-semibold opacity-90">{v.durationLabel}</span>
            </span>
          </button>
        ) : null}
        {/* Poster preload hint for the hero placement; the <video poster> itself loads lazily otherwise. */}
        {priorityPoster ? <link rel="preload" as="image" href={v.poster} /> : null}
      </div>
      <figcaption className="mt-2 text-sm text-lp-muted">
        {v.caption} Real screen recording with demo data; captions on by default.
      </figcaption>
      {showTranscript ? (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer font-semibold text-lp-text">Read the transcript</summary>
          <div id={`${id}-transcript`} className="mt-2 space-y-2 text-lp-text-soft">
            {v.transcript.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </details>
      ) : null}
    </figure>
  );
}

/** A CTA link placed next to a demo video; reports whether the visitor watched first. */
export function DemoCta({
  video,
  href,
  cta,
  className,
  children,
}: {
  video: DemoVideoId;
  href: string;
  cta: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        const pct = Math.round(watched.get(video) ?? 0);
        trackEvent("demo_cta_click", { video, cta, product: DEMO_VIDEOS[video].product, watched_percent: pct, watched: pct >= 25 });
      }}
    >
      {children}
    </a>
  );
}
