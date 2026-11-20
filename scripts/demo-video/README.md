# Demo video pipeline (LeaguePour + VenueSprocket)

Produces the four explainer videos in `public/media/demo/`, their captions and transcripts
(`src/lib/demo-videos.data.ts`, served as WebVTT by `src/app/captions/[file]/route.ts`), and the
How It Works screenshots (`public/marketing/how-it-works/`, `src/lib/how-it-works-media.ts`).

Everything is a **real browser session** against a **local** production build and a **throwaway**
Postgres. Customers, venues and bookings are fictional (`example.com` addresses, "(Demo)" venues).
It never touches production: the recording browser maps leaguepour.com / venuesprocket.com
port 80 to the local server, refuses port 443, and blocks Google tag/ads requests.

## Tools (not in package.json - dev machine only)
- `playwright-core` + `pg` in a scratch folder (uses the installed Chrome; no browser download)
- ffmpeg 6+ (`gradients`, `silencedetect`, `loudnorm`, libx264, libwebp)
- Voiceover: [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0) via `pip install kokoro-onnx soundfile`
  and the `kokoro-v1.0.onnx` + `voices-v1.0.bin` model files. Runs offline; no paid API. Voices: `af_heart` (LP), `af_bella` (VS).

## Run
1. Throwaway DB: `initdb` + `pg_ctl -o "-p 55432"` in a scratch folder; `.env` `DATABASE_URL` -> `127.0.0.1:55432/lpdemo`,
   `NEXT_PUBLIC_APP_URL=http://localhost:3100` (keeps IndexNow pings off - they only fire for the real hostnames),
   no `VENUESPROCKET_HOST`/`LEAGUEPOUR_HOST` overrides. `npm run build`, then `next start -p 3100`.
2. `SCRATCH=<scratch dir>` for all scripts. `bash reset-db.sh` (drops and re-pushes the throwaway schema).
3. `python tts_gen_all.py scripts.json $SCRATCH/vo` - narration per segment (`scripts.json`: `cap` = captions, `tts` = spoken text;
   their sentence counts must match - captions are timed from the silences between sentences).
4. `node record-lp.mjs` then `node record-vs.mjs` (the VS script sets the demo venue to Pro in the throwaway DB so every step can be shown;
   the narration states which plan each step needs). Optional arg: comma-separated segment ids to re-record.
5. `node assemble.mjs lp-main` (and `lp-intro`, `vs-main`, `vs-intro`) - `plan.json` maps segments to clips, phone framing and speed caps (max 1.8x).
6. From the repo root: `node scripts/demo-video/publish-videos.mjs` and `node scripts/demo-video/publish-shots.mjs`, then rebuild.

Product claims in `scripts.json` must match `src/lib/content-engine/facts.ts`, `src/lib/entitlements/*` and `src/lib/stripe/connect-fees.ts`.
