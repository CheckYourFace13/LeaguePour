// Assemble recorded clips + voiceover into the final MP4, plus cues (WebVTT/SRT), transcript and poster.
// usage: node assemble.mjs <videoId>
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const S = process.env.SCRATCH;
const vid = process.argv[2];
const scripts = JSON.parse(fs.readFileSync(path.join(S, "rec", "scripts.json"), "utf8"));
const plan = JSON.parse(fs.readFileSync(path.join(S, "rec", "plan.json"), "utf8"))[vid];
const spec = scripts[vid];
const WORK = path.join(S, "build", vid);
fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(WORK, { recursive: true });
const FPS = 30, W = 1920, H = 1080, LEAD = 0.35, TAIL = 0.5;

const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: ["ignore", "inherit", "inherit"] });
const probe = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

/** sentence spans inside a narration wav, from its silences */
function sentenceSpans(wav, n) {
  const dur = probe(wav);
  if (n <= 1) return [[0, dur]];
  const r = spawnSync("ffmpeg", ["-hide_banner", "-i", wav, "-af", "silencedetect=noise=-40dB:d=0.12", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const sil = [];
  const re = /silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g;
  let m;
  while ((m = re.exec(r))) sil.push([Number(m[1]), Number(m[2])]);
  const inner = sil.filter(([a, b]) => a > 0.15 && b < dur - 0.1).sort((x, y) => (y[1] - y[0]) - (x[1] - x[0])).slice(0, n - 1).sort((x, y) => x[0] - y[0]);
  if (inner.length < n - 1) return null;
  const spans = [];
  let t = 0;
  for (const [a, b] of inner) { spans.push([t, a]); t = b; }
  spans.push([t, dur]);
  return spans;
}

function wrap2(text, max = 44) {
  if (text.length <= max) return text;
  const words = text.split(" ");
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" "), b = words.slice(i).join(" ");
    const score = Math.max(a.length, b.length);
    if (!best || score < best.score) best = { score, t: `${a}\n${b}` };
  }
  return best.t;
}

/** split a long sentence into cue-sized chunks (<= ~84 chars, 2 lines) */
function chunks(sentence) {
  if (sentence.length <= 84) return [sentence];
  const parts = sentence.split(/(?<=,)\s+/);
  const out = [];
  let cur = "";
  for (const p of parts) {
    if ((cur + " " + p).trim().length > 84 && cur) { out.push(cur.trim()); cur = p; } else cur = (cur + " " + p).trim();
  }
  if (cur) out.push(cur.trim());
  return out.flatMap((c) => (c.length > 88 ? [c.slice(0, c.lastIndexOf(" ", c.length / 2)), c.slice(c.lastIndexOf(" ", c.length / 2) + 1)] : [c]));
}


const BRAND = plan.brand === "vs" ? { c0: "0x1d1612", c1: "0x3a2a1e" } : { c0: "0x0a1a3f", c1: "0x0057d9" };
const FONT = "C\\:/Windows/Fonts/segoeuib.ttf";
const FONT2 = "C\\:/Windows/Fonts/segoeui.ttf";
function masks() {
  const m1 = path.join(WORK, "m_screen.png"), m2 = path.join(WORK, "m_bezel.png");
  if (!fs.existsSync(m1)) {
    const rr = (w, h, r) => `geq=lum='if(gt(abs(X-${w}/2),${w}/2-${r})*gt(abs(Y-${h}/2),${h}/2-${r}),if(lte(hypot(abs(X-${w}/2)-(${w}/2-${r}),abs(Y-${h}/2)-(${h}/2-${r})),${r}),255,0),255)'`;
    ff(["-f", "lavfi", "-i", "color=black:s=444x960", "-frames:v", "1", "-vf", `format=gray,${rr(444, 960, 40)}`, m1]);
    ff(["-f", "lavfi", "-i", "color=black:s=476x992", "-frames:v", "1", "-vf", `format=gray,${rr(476, 992, 56)}`, m2]);
  }
  return [m1, m2];
}
function phoneComposite(src, out, label = [], dur) {
  const [m1, m2] = masks();
  const esc = (t) => t.replace(/\\/g, "").replace(/:/g, "\\:").replace(/'/g, "\u2019").replace(/,/g, "\\,");
  let txt = "";
  if (label[0]) txt += `,drawtext=fontfile='${FONT}':text='${esc(label[0])}':fontcolor=white:fontsize=64:x=170:y=430`;
  if (label[1]) txt += `,drawtext=fontfile='${FONT2}':text='${esc(label[1])}':fontcolor=white@0.85:fontsize=38:x=172:y=525`;
  const fc = `[0:v]scale=444:960:flags=lanczos,fps=${FPS},format=rgba[sc];[3:v]format=gray[ma];[sc][ma]alphamerge[scr];` +
    `color=c=0x0b0b0d:s=476x992,format=rgba[bz0];[4:v]format=gray[mb];[bz0][mb]alphamerge[bz];` +
    `[1:v][bz]overlay=x=1140:y=44[b1];[b1][scr]overlay=x=1156:y=60${txt},format=yuv420p[v]`;
  ff(["-i", src, "-f", "lavfi", "-t", String(dur), "-i", `gradients=s=${W}x${H}:c0=${BRAND.c0}:c1=${BRAND.c1}:x0=0:y0=0:x1=${W}:y1=${H}:speed=0.0001:r=${FPS}`,
    "-f", "lavfi", "-i", "anullsrc", "-loop", "1", "-i", m1, "-loop", "1", "-i", m2,
    "-filter_complex", fc, "-map", "[v]", "-t", String(dur), "-c:v", "libx264", "-crf", "14", "-preset", "fast", out]);
}
function normalize(src, out) {
  ff(["-i", src, "-vf", `fps=${FPS},scale=${W}:${H}:flags=lanczos,format=yuv420p`, "-an", "-c:v", "libx264", "-crf", "14", "-preset", "fast", out]);
}
/** One clip file per segment: phone composites and multi-clip segments are built here. */
function prepClip(p, id) {
  const parts = p.clips ?? [{ clip: p.clip, phone: p.phone, label: p.label, from: undefined }];
  const files = parts.map((c, i) => {
    const src = path.join(S, "clips", c.clip);
    const o = path.join(WORK, `${id}_part${i}.mp4`);
    if (c.phone) phoneComposite(src, o, c.label ?? [], probe(src));
    else normalize(src, o);
    return o;
  });
  if (files.length === 1) return files[0];
  const lst = path.join(WORK, `${id}_parts.txt`);
  fs.writeFileSync(lst, files.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"));
  const o = path.join(WORK, `${id}_joined.mp4`);
  ff(["-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", o]);
  return o;
}

const cues = [];
const segFiles = [];
let tCursor = 0;
for (const seg of spec.segments) {
  const p = plan.segments.find((s) => s.id === seg.id);
  if (!p) throw new Error("plan missing " + seg.id);
  const wav = path.join(S, "vo", `${vid}__${seg.id}.wav`);
  const n = probe(wav);
  const clip = prepClip(p, seg.id);
  const from = p.fromEnd ? Math.max(0, probe(clip) - p.fromEnd) : (p.from ?? 0);
  const rawDur = probe(clip) - from;
  const need = n + LEAD + TAIL;
  const maxExtra = p.maxExtra ?? plan.maxExtra ?? 3;
  // over-long action: speed up (max 1.6x) rather than cut, then trim whatever is still over
  const speed = rawDur > need + maxExtra ? Math.min(p.maxSpeed ?? plan.maxSpeed ?? 1.6, rawDur / (need + maxExtra)) : 1;
  const cdur = rawDur / speed;
  const L = Math.max(need, Math.min(cdur, need + maxExtra));
  const out = path.join(WORK, `${seg.id}.mp4`);
  let vf = `trim=start=${from},setpts=(PTS-STARTPTS)/${speed.toFixed(4)},fps=${FPS},scale=${W}:${H}:flags=lanczos,tpad=stop_mode=clone:stop_duration=${Math.max(0, L - cdur + 0.1).toFixed(3)},trim=duration=${L}`;
  if (p.zoom) {
    // restrained zoom toward a region: z goes 1 -> Z over 0.7s at t0 and back at t1 (smoothstep)
    const { x, y, z = 1.3, t0 = 0.5, t1 = L - 0.6 } = p.zoom; // x,y = focus point in 0..1
    const e = (a) => `(${a})*(${a})*(3-2*(${a}))`;
    const up = `clip((t-${t0})/0.7,0,1)`, down = `clip((t-${t1})/0.7,0,1)`;
    const Z = `(1+(${z}-1)*(${e(up)}-${e(down)}))`;
    vf += `,scale=w='trunc(${W}*${Z}/2)*2':h='trunc(${H}*${Z}/2)*2':eval=frame:flags=bicubic,crop=w=${W}:h=${H}:x='clip(${x}*iw-${W}/2,0,iw-${W})':y='clip(${y}*ih-${H}/2,0,ih-${H})'`;
  }
  if (p.fadeIn) vf += `,fade=t=in:st=0:d=0.5`;
  if (p.fadeOut) vf += `,fade=t=out:st=${(L - 0.6).toFixed(3)}:d=0.6`;
  vf += ",format=yuv420p";
  const af = `adelay=${Math.round(LEAD * 1000)}|${Math.round(LEAD * 1000)},aformat=sample_rates=48000:channel_layouts=stereo,apad,atrim=duration=${L}`;
  ff(["-i", clip, "-i", wav, "-filter_complex", `[0:v]${vf}[v];[1:a]${af}[a]`, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "14", "-preset", "fast", "-c:a", "pcm_s16le", "-t", String(L), out.replace(/\.mp4$/, ".mkv")]);
  segFiles.push(out.replace(/\.mp4$/, ".mkv"));

  // cues
  const capS = seg.cap.split(/(?<=[.?!:;])\s+/).filter(Boolean);
  const spans = sentenceSpans(wav, capS.length) ?? (() => {
    const tot = capS.reduce((a, s) => a + s.length, 0);
    let t = 0;
    return capS.map((s) => { const d = (n * s.length) / tot; const r = [t, t + d]; t += d; return r; });
  })();
  capS.forEach((sentence, i) => {
    const [a, b] = spans[i];
    const cs = chunks(sentence.replace(/[:;]$/, sentence.endsWith(":") ? ":" : ";"));
    const tot = cs.reduce((x, c) => x + c.length, 0);
    let t = a;
    for (const c of cs) {
      const d = ((b - a) * c.length) / tot;
      cues.push({ start: +(tCursor + LEAD + t).toFixed(3), end: +(tCursor + LEAD + t + d).toFixed(3), text: wrap2(c) });
      t += d;
    }
  });
  console.log(seg.id, "narr", n.toFixed(2), "clip", rawDur.toFixed(2), "speed", speed.toFixed(2), "-> seg", L.toFixed(2));
  tCursor += L;
}
// extend each cue slightly (readability), never overlapping the next
for (let i = 0; i < cues.length; i++) {
  const next = i + 1 < cues.length ? cues[i + 1].start : tCursor;
  cues[i].end = +Math.min(next - 0.04, cues[i].end + 0.35).toFixed(3);
}

// concat segments -> final encode with loudness normalization
const list = path.join(WORK, "list.txt");
fs.writeFileSync(list, segFiles.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"));
const joined = path.join(WORK, "joined.mkv");
ff(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", joined]);
const final = path.join(S, "final", `${vid}.mp4`);
fs.mkdirSync(path.dirname(final), { recursive: true });
ff(["-i", joined, "-c:v", "libx264", "-profile:v", "high", "-level", "4.1", "-preset", "slow", "-crf", String(plan.crf ?? 25), "-maxrate", "4M", "-bufsize", "8M", "-pix_fmt", "yuv420p", "-g", "60",
  "-af", "loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
  "-metadata", `title=${plan.title}`, final]);

// poster
const poster = path.join(S, "final", `${vid}-poster.webp`);
ff(["-ss", String(plan.posterAt ?? 1.5), "-i", final, "-frames:v", "1", "-vf", "scale=1280:720:flags=lanczos", "-c:v", "libwebp", "-quality", "82", poster]);

const fmt = (t, sep) => {
  const ms = Math.round(t * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}${sep}${String(ms % 1000).padStart(3, "0")}`;
};
fs.writeFileSync(path.join(S, "final", `${vid}.vtt`), "WEBVTT\n\n" + cues.map((c, i) => `${i + 1}\n${fmt(c.start, ".")} --> ${fmt(c.end, ".")}\n${c.text}\n`).join("\n"));
fs.writeFileSync(path.join(S, "final", `${vid}.srt`), cues.map((c, i) => `${i + 1}\n${fmt(c.start, ",")} --> ${fmt(c.end, ",")}\n${c.text}\n`).join("\n"));
const transcript = spec.segments.map((s) => s.cap);
fs.writeFileSync(path.join(S, "final", `${vid}.json`), JSON.stringify({ duration: +probe(final).toFixed(2), width: W, height: H, cues, transcript }, null, 1));
console.log("final", final, (fs.statSync(final).size / 1e6).toFixed(2), "MB", probe(final).toFixed(2), "s");
