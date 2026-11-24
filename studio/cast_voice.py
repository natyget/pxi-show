#!/usr/bin/env python3
"""A line in a cast member's own voice (Nio, Maya, Theo...), made the one approved way (studio/cast_voice.json).

  bash studio/setup_cast_voice.sh                       once per machine (a few minutes, a 4 GB model)
  ~/.pxi-voice/bin/python studio/cast_voice.py jobs.json --out videos/<slug>/vo

jobs.json: [{"key": "nio_01", "character": "nio", "line": "So I built PXI.", "note": "Quick and easy, a little pleased with himself."}]
Every line needs an acting note: a line without one comes out flat. PXI is sent to the model as "pixie".
Writes <key>.wav (48 kHz mono, -16 LUFS, clean) and <key>.json (what made it). The narrator is a different tool
(studio/voice.py)."""
import argparse, hashlib, json, os, re, subprocess, sys, time, importlib.metadata as md
from pathlib import Path
LOCK = json.loads((Path(__file__).with_name("cast_voice.json")).read_text())
def die(msg): print("REFUSED: " + msg, file=sys.stderr); sys.exit(2)

def check_stack():
    for pkg, want in LOCK["packages"].items():
        try: got = md.version(pkg)
        except md.PackageNotFoundError: die(f"{pkg} is not installed. Run: bash studio/setup_cast_voice.sh")
        if got != want: die(f"{pkg} is {got}, approved is {want}. Run: bash studio/setup_cast_voice.sh (never pip install -U)")

def clean_jobs(jobs):
    out, seen = [], set()
    for j in jobs:
        key, ch = j.get("key", ""), j.get("character", "")
        if not re.fullmatch(r"[A-Za-z0-9_\-]+", key): die(f"bad key {key!r}")
        if key in seen: die(f"duplicate key {key}")
        seen.add(key)
        if ch in LOCK["refused_characters"]: die(f"{key}: {LOCK['refused_characters'][ch]}")
        if ch not in LOCK["characters"]: die(f"{key}: character must be one of {', '.join(LOCK['characters'])}, got {ch!r}")
        line, note = (j.get("line") or "").strip(), (j.get("note") or "").strip()
        if len(note) < 8: die(f"{key}: a line with no acting note is refused (flat is a defect)")
        if not line: die(f"{key}: empty line")
        out.append(dict(key=key, character=ch, line=line, note=note, text=re.sub(r"\bPXI\b", "pixie", line, flags=re.I)))
    return out

def treat(raw, dst):
    t = LOCK["treatment"]; l = t["loudnorm"]
    trim = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03"
    pre = f"{trim},areverse,{trim},areverse"
    ln = f"loudnorm=I={l['I']}:TP={l['TP']}:LRA={l['LRA']}"
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(raw), "-af", f"{pre},{ln}:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
    s = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
    two = (f"{ln}:measured_I={s['input_i']}:measured_TP={s['input_tp']}:measured_LRA={s['input_lra']}:"
           f"measured_thresh={s['input_thresh']}:offset={s['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", f"{pre},{two}", "-ac", str(t["channels"]), "-ar", str(t["sample_rate"]), str(dst)], check=True)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("jobs"); ap.add_argument("--out", default="vo"); a = ap.parse_args()
    check_stack()
    jobs = clean_jobs(json.loads(Path(a.jobs).read_text()))
    out = Path(a.out).resolve(); out.mkdir(parents=True, exist_ok=True)
    import torch, soundfile as sf
    from qwen_tts import Qwen3TTSModel
    torch.set_num_threads(os.cpu_count() or 4)
    ld = LOCK["load"]; t0 = time.time()
    m = Qwen3TTSModel.from_pretrained(LOCK["model"], device_map=ld["device_map"], dtype=getattr(torch, ld["dtype"]), attn_implementation=ld["attn_implementation"])
    print(f"model loaded in {time.time()-t0:.0f}s", flush=True)
    for j in jobs:
        t1 = time.time(); desc = LOCK["characters"][j["character"]]
        torch.manual_seed(LOCK["seed"])
        wavs, sr = m.generate_voice_design(text=j["text"], instruct=desc + " " + j["note"], language=LOCK["language"])
        raw = out / f"{j['key']}.raw.wav"; sf.write(str(raw), wavs[0], sr)
        dst = out / f"{j['key']}.wav"; treat(raw, dst); raw.unlink()
        dur = sf.info(str(dst)).duration
        (out / f"{j['key']}.json").write_text(json.dumps(dict(key=j["key"], character=j["character"], line=j["line"], note=j["note"], text_sent=j["text"],
            model=LOCK["model"], seed=LOCK["seed"], dur=round(dur, 2), wav_sha256=hashlib.sha256(dst.read_bytes()).hexdigest()), indent=2, ensure_ascii=False) + "\n")
        print(f"{j['key']}: {dur:.2f}s, made in {time.time()-t1:.0f}s", flush=True)

if __name__ == "__main__":
    main()
