// Cuts short outreach/social clips from the approved demo videos (public/media/demo) with a
// matching WebVTT caption file. Same footage and narration as the published YouTube videos.
//   node scripts/acquisition-clips.mjs   (needs ffmpeg on PATH)
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const CLIPS = [
  { id: "lp-clip-free-bracket-tool", src: "lp-main", start: 6.0, end: 21.3, youtube: "https://www.youtube.com/watch?v=MgynmsguBLc&t=6s" },
  { id: "lp-clip-run-the-night", src: "lp-main", start: 59.7, end: 75.2, youtube: "https://www.youtube.com/watch?v=MgynmsguBLc&t=59s" },
  { id: "vs-clip-inquiry-to-lead", src: "vs-main", start: 11.5, end: 36.4, youtube: "https://www.youtube.com/watch?v=Q_q8CLHZ6Lw&t=11s" },
];

const data = readFileSync("src/lib/demo-videos.data.ts", "utf8");
function cuesFor(id) {
  const i = data.indexOf(`"${id}": {`);
  if (i < 0) throw new Error(`no data for ${id}`);
  const j = data.indexOf('"transcript"', i);
  const seg = data.slice(i, j);
  const re = /"start": ([\d.]+),\s*"end": ([\d.]+),\s*"text": "((?:[^"\\]|\\.)*)"/g;
  const out = [];
  let m;
  while ((m = re.exec(seg))) out.push({ start: +m[1], end: +m[2], text: JSON.parse(`"${m[3]}"`) });
  return out;
}
const ts = (s) => {
  const ms = Math.max(0, Math.round(s * 1000));
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const mi = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const se = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${mi}:${se}.${String(ms % 1000).padStart(3, "0")}`;
};

mkdirSync("docs/acquisition/clips", { recursive: true });
for (const c of CLIPS) {
  const cues = cuesFor(c.src).filter((q) => q.start >= c.start - 0.05 && q.end <= c.end + 0.05);
  const vtt = ["WEBVTT", "", ...cues.flatMap((q, k) => [String(k + 1), `${ts(q.start - c.start)} --> ${ts(q.end - c.start)}`, q.text, ""])].join("\n");
  writeFileSync(`docs/acquisition/clips/${c.id}.vtt`, vtt);
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-ss", String(c.start), "-to", String(c.end), "-i", `public/media/demo/${c.src}.mp4`,
    "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
    "-movflags", "+faststart", `docs/acquisition/clips/${c.id}.mp4`,
  ]);
  console.log(`${c.id}: ${(c.end - c.start).toFixed(1)}s, ${cues.length} cues, YouTube deep link ${c.youtube}`);
}
