// shots/*.png -> public/marketing/how-it-works/*.webp + src/lib/how-it-works-media.ts (sizes + control positions)
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const S = process.env.SCRATCH;
const R = process.env.REPO_ROOT ?? process.cwd();
const outDir = path.join(R, "public/marketing/how-it-works");
fs.mkdirSync(outDir, { recursive: true });
const media = {};
for (const f of fs.readdirSync(path.join(S, "shots")).filter((f) => f.endsWith(".png")).sort()) {
  const name = f.replace(/\.png$/, "");
  const meta = JSON.parse(fs.readFileSync(path.join(S, "shots", name + ".json"), "utf8"));
  const phone = meta.vp.width < 600;
  // desktop: 1920x1080 source -> 1600x900; phone: 780x1688 -> 600x1298
  const w = phone ? 600 : 1600;
  const h = Math.round((w * meta.vp.height) / meta.vp.width);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", path.join(S, "shots", f), "-vf", `scale=${w}:${h}:flags=lanczos`, "-c:v", "libwebp", "-quality", "80", "-compression_level", "6", path.join(outDir, name + ".webp")]);
  media[name] = { src: `/marketing/how-it-works/${name}.webp`, width: w, height: h, boxes: meta.boxes };
  console.log(name, (fs.statSync(path.join(outDir, name + ".webp")).size / 1024).toFixed(0) + "KB");
}
const ts = `// GENERATED from the demo recording run (real screenshots + the recorded positions of key controls,
// as % of the image). Regenerate with the recording pipeline rather than editing by hand.
export type HiwMedia = { src: string; width: number; height: number; boxes: Record<string, { x: number; y: number }> };

export const HIW_MEDIA: Record<string, HiwMedia> = ${JSON.stringify(media, null, 2)};
`;
fs.writeFileSync(path.join(R, "src/lib/how-it-works-media.ts"), ts);
