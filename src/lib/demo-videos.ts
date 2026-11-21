/**
 * Recorded product demos (real browser sessions against a local server with disposable demo data).
 * The media lives in public/media/demo/; cues and durations come from demo-videos.data.ts, which
 * the recording pipeline generates from the same timings used to mix the voiceover - so captions
 * and transcripts can't drift from the audio. Regenerate that file rather than hand-editing cues.
 */
import { DEMO_VIDEO_DATA } from "./demo-videos.data";

export type DemoCue = { start: number; end: number; text: string };

export type DemoVideoId = "lp-main" | "lp-intro" | "vs-main" | "vs-intro";

export type DemoVideo = {
  id: DemoVideoId;
  product: "lp" | "vs";
  title: string;
  /** One sentence shown under the player. */
  caption: string;
  mp4: string;
  poster: string;
  captions: string;
  width: number;
  height: number;
  durationSeconds: number;
  durationLabel: string;
  cues: DemoCue[];
  transcript: string[];
  /** Public copy on the iScream Studio YouTube channel, when one exists (same file, unchanged). */
  youtubeUrl?: string;
};

const meta: Record<DemoVideoId, { product: "lp" | "vs"; title: string; caption: string; youtubeUrl?: string }> = {
  "lp-main": {
    product: "lp",
    title: "How LeaguePour works",
    caption: "From the free double elimination bracket tool to signup, a published event, score entry and the public scoreboard.",
    // Published 2026-11-21 on @iScreamStudioInc; byte-identical to public/media/demo/lp-main.mp4.
    youtubeUrl: "https://www.youtube.com/watch?v=MgynmsguBLc",
  },
  "lp-intro": {
    product: "lp",
    title: "LeaguePour in 25 seconds",
    caption: "The short version: free bracket tool, publish an event, enter scores.",
  },
  "vs-main": {
    product: "vs",
    title: "How VenueSprocket works",
    caption: "A sample brewery rehearsal dinner from inquiry to proposal, signed contract and BEO.",
    // Published 2026-11-21 on @iScreamStudioInc; byte-identical to public/media/demo/vs-main.mp4.
    youtubeUrl: "https://www.youtube.com/watch?v=Q_q8CLHZ6Lw",
  },
  "vs-intro": {
    product: "vs",
    title: "VenueSprocket in 25 seconds",
    caption: "The short version: inquiry, proposal, contract and deposit, BEO.",
  },
};

function label(s: number): string {
  const r = Math.round(s);
  return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, "0")}`;
}

export const DEMO_VIDEOS: Record<DemoVideoId, DemoVideo> = Object.fromEntries(
  (Object.keys(meta) as DemoVideoId[]).map((id) => {
    const d = DEMO_VIDEO_DATA[id];
    return [
      id,
      {
        id,
        ...meta[id],
        mp4: `/media/demo/${id}.mp4?v=${d.version}`,
        poster: `/media/demo/${id}-poster.webp?v=${d.version}`,
        captions: `/captions/${id}.vtt?v=${d.version}`,
        width: d.width,
        height: d.height,
        durationSeconds: d.duration,
        durationLabel: label(d.duration),
        cues: d.cues,
        transcript: d.transcript,
      },
    ];
  }),
) as Record<DemoVideoId, DemoVideo>;

function ts(t: number): string {
  const ms = Math.round(t * 1000);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
}

export function toWebVtt(cues: DemoCue[]): string {
  return `WEBVTT\n\n${cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join("\n")}`;
}

/** schema.org VideoObject for a demo (absolute URLs built by the caller's origin). */
export function videoJsonLd(id: DemoVideoId, origin: string, uploadDate: string) {
  const v = DEMO_VIDEOS[id];
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.title,
    description: v.caption,
    thumbnailUrl: [`${origin}${v.poster}`],
    contentUrl: `${origin}${v.mp4}`,
    uploadDate,
    duration: `PT${Math.floor(v.durationSeconds / 60)}M${Math.round(v.durationSeconds % 60)}S`,
    transcript: v.transcript.join(" "),
    ...(v.youtubeUrl ? { sameAs: [v.youtubeUrl] } : {}),
  };
}
