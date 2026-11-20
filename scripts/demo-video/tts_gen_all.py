import json, os, sys, soundfile as sf
from kokoro_onnx import Kokoro
here = os.path.dirname(os.path.abspath(__file__))
k = Kokoro(os.path.join(here, "models/kokoro-v1.0.onnx"), os.path.join(here, "models/voices-v1.0.bin"))
scripts = json.load(open(sys.argv[1], encoding="utf-8"))
outdir = sys.argv[2]
only = sys.argv[3] if len(sys.argv) > 3 else None
os.makedirs(outdir, exist_ok=True)
durs = {}
for vid, spec in scripts.items():
    if only and vid != only:
        continue
    durs[vid] = {}
    for seg in spec["segments"]:
        samples, sr = k.create(seg["tts"], voice=spec["voice"], speed=spec.get("speed", 1.0), lang="en-us")
        out = os.path.join(outdir, f"{vid}__{seg['id']}.wav")
        sf.write(out, samples, sr)
        durs[vid][seg["id"]] = round(len(samples) / sr, 3)
        print(vid, seg["id"], durs[vid][seg["id"]], flush=True)
json.dump(durs, open(os.path.join(outdir, "durations.json" if not only else f"durations-{only}.json"), "w"), indent=1)
