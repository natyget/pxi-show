#!/usr/bin/env python3
"""voice_check.py <video-or-dir> [--audio-json F] [--vo-dir DIR]
Every voice file in audio.json under vo/ must have a sidecar whose sha256 matches the wav and whose settings
match engine/tools/voice_lock.json. Anything else was made another way: FAIL. Exit 1 on any FAIL."""
import argparse, hashlib, json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
ap = argparse.ArgumentParser(); ap.add_argument("target", nargs="?"); ap.add_argument("--audio-json"); ap.add_argument("--vo-dir")
a = ap.parse_args()
lock = json.loads((ROOT / "engine/tools/voice_lock.json").read_text())
aj = Path(a.audio_json) if a.audio_json else ROOT / "studio/anim/src/audio.json"
pub = Path(a.vo_dir).parent if a.vo_dir else ROOT / "studio/anim/public"
lines = json.loads(aj.read_text())["lines"]
dh = {k: hashlib.sha256(v.encode()).hexdigest() for k, v in lock["characters"].items()}
nosidecar, bad, ok = [], [], 0
for k, v in sorted(lines.items()):
    f = v.get("file", "")
    if not f.startswith("vo/"): continue
    wav = pub / f; side = wav.with_suffix(".json")
    if not side.exists() or not wav.exists(): nosidecar.append(k); continue
    s = json.loads(side.read_text()); why = []
    if hashlib.sha256(wav.read_bytes()).hexdigest() != s.get("wav_sha256"): why.append("wav changed after it was made")
    if s.get("model") != lock["model"]: why.append("model")
    for p, want in lock["packages"].items():
        if s.get("versions", {}).get(p) != want: why.append(f"{p} version")
    if s.get("seed") != lock["seed"]: why.append("seed")
    if s.get("character") not in dh or s.get("description_sha256") != dh[s.get("character")]: why.append("description")
    if s.get("treatment") != lock["treatment"]: why.append("treatment")
    if len(s.get("note", "")) < 8: why.append("no acting note")
    if why: bad.append((k, why))
    else: ok += 1
for k, why in bad: print(f"FAIL {k}: {', '.join(why)}")
if nosidecar:
    print(f"FAIL {len(nosidecar)} voice file(s) made without voice.sh (no sidecar): " + ", ".join(nosidecar))
print(f"voice_check: {ok} ok, {len(bad)} mismatched, {len(nosidecar)} without sidecar")
sys.exit(1 if bad or nosidecar else 0)
