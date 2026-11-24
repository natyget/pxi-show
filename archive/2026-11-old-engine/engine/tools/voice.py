#!/usr/bin/env python3
"""Make voice lines the one approved way (bible/characters.md "How a voice line is made").
Run through voice.sh (which uses the pinned venv):  voice.sh jobs.json [--out DIR] [--audio-json FILE]
jobs.json: [{"key","character":"nio"|"maya","line","note"}, ...]
Default out is studio/anim/public/vo and the envelope is merged into studio/anim/src/audio.json.
With --out elsewhere, audio.json is left alone unless --audio-json is given."""
import argparse, hashlib, json, os, re, subprocess, sys, time, importlib.metadata as md
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
LOCK = json.loads((ROOT / "engine/tools/voice_lock.json").read_text())
def die(msg): print("REFUSED: " + msg, file=sys.stderr); sys.exit(2)
def sha(b): return hashlib.sha256(b).hexdigest()

def verify_lock():
    chars = (ROOT / "bible/characters.md").read_text()
    quoted = {l[2:].strip() for l in chars.splitlines() if l.startswith("> ")}
    for name, desc in LOCK["characters"].items():
        if desc not in quoted:
            die(f"the {name} description in voice_lock.json no longer matches bible/characters.md. "
                "A voice changes only on a dated founder note; fix the lock or the bible, do not bypass.")
    for pkg, want in LOCK["packages"].items():
        try: got = md.version(pkg)
        except md.PackageNotFoundError: die(f"{pkg} is not installed. Run: bash engine/setup.sh voice")
        if got != want: die(f"{pkg} is {got}, approved is {want}. Run: bash engine/setup.sh voice (never pip install -U)")

def clean_jobs(jobs):
    out, seen = [], set()
    for j in jobs:
        key, ch = j.get("key", ""), j.get("character", "")
        if not re.fullmatch(r"[A-Za-z0-9_\-]+", key): die(f"bad key {key!r}")
        if key in seen: die(f"duplicate key {key}")
        seen.add(key)
        if ch in LOCK["refused_characters"]: die(f"{key}: {LOCK['refused_characters'][ch]}")
        if ch not in LOCK["characters"]: die(f"{key}: character must be nio or maya, got {ch!r}")
        line, note = (j.get("line") or "").strip(), (j.get("note") or "").strip()
        if len(note) < 8: die(f"{key}: a line with no acting note is refused (flat is a defect)")
        if not line: die(f"{key}: empty line")
        if re.search(r"\b(a+i+g+h+t|i+g+h+t)\b", line + " " + note, re.I) or re.search(r"\bna{2,}h+\b|\bnah{2,}\b", line + " " + note, re.I):
            die(f"{key}: no 'aight', 'ight' or drawn-out 'nah'")
        text = re.sub(r"\bPXI\b", "pixie", line, flags=re.I)
        out.append(dict(key=key, character=ch, line=line, note=note, text=text))
    return out

def run(cmd): return subprocess.run(cmd, check=True, capture_output=True, text=True)
def lufs(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    return float(m[-1])

def treat(raw, dst):
    t = LOCK["treatment"]; l = t["loudnorm"]
    trim = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03"
    pre = f"{trim},areverse,{trim},areverse"
    ln = f"loudnorm=I={l['I']}:TP={l['TP']}:LRA={l['LRA']}"
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(raw), "-af", f"{pre},{ln}:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
    s = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
    two = (f"{ln}:measured_I={s['input_i']}:measured_TP={s['input_tp']}:measured_LRA={s['input_lra']}:"
           f"measured_thresh={s['input_thresh']}:offset={s['target_offset']}:linear=true")
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", f"{pre},{two}", "-ac", str(t["channels"]), "-ar", str(t["sample_rate"]), str(dst)])

def envelope(path, fps):
    import numpy as np, soundfile as sf
    a, sr = sf.read(str(path)); a = a if a.ndim == 1 else a.mean(1)
    hop = sr // fps; n = int(np.ceil(len(a) / hop))
    e = np.array([np.sqrt(np.mean(a[i*hop:(i+1)*hop] ** 2) + 1e-12) for i in range(n)])
    e = np.clip(e / (np.percentile(e, 90) + 1e-9), 0, 1); e[e < 0.15] = 0
    return [round(float(x), 3) for x in e], len(a) / sr

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("jobs"); ap.add_argument("--out"); ap.add_argument("--audio-json")
    ap.add_argument("--keep-raw", action="store_true")
    a = ap.parse_args()
    verify_lock()
    jobs = clean_jobs(json.loads(Path(a.jobs).read_text()))
    default_out = ROOT / "studio/anim/public/vo"
    out = Path(a.out).resolve() if a.out else default_out
    out.mkdir(parents=True, exist_ok=True)
    aj = Path(a.audio_json) if a.audio_json else (ROOT / "studio/anim/src/audio.json" if not a.out else None)
    import torch, soundfile as sf
    from qwen_tts import Qwen3TTSModel
    torch.set_num_threads(os.cpu_count() or 4)
    ld = LOCK["load"]
    t0 = time.time()
    m = Qwen3TTSModel.from_pretrained(LOCK["model"], device_map=ld["device_map"], dtype=getattr(torch, ld["dtype"]), attn_implementation=ld["attn_implementation"])
    print(f"model loaded in {time.time()-t0:.0f}s", flush=True)
    lines = {}
    for j in jobs:
        t1 = time.time()
        desc = LOCK["characters"][j["character"]]
        torch.manual_seed(LOCK["seed"])
        wavs, sr = m.generate_voice_design(text=j["text"], instruct=desc + " " + j["note"], language=LOCK["language"])
        raw = out / f"{j['key']}.raw.wav"; sf.write(str(raw), wavs[0], sr)
        dst = out / f"{j['key']}.wav"; treat(raw, dst)
        if not a.keep_raw: raw.unlink()
        env, dur = envelope(dst, LOCK["envelope_fps"])
        side = dict(key=j["key"], model=LOCK["model"], versions={p: md.version(p) for p in ("qwen-tts", "transformers", "torch")},
                    seed=LOCK["seed"], language=LOCK["language"], load=ld, character=j["character"],
                    description_sha256=sha(desc.encode()), note=j["note"], line=j["line"], text_sent=j["text"],
                    treatment=LOCK["treatment"], lufs=round(lufs(dst), 2), dur=round(dur, 2), wav_sha256=sha(dst.read_bytes()))
        (out / f"{j['key']}.json").write_text(json.dumps(side, indent=2, ensure_ascii=False) + "\n")
        lines[j["key"]] = {"file": f"vo/{j['key']}.wav", "dur": round(dur, 2), "env": env}
        print(f"{j['key']}: {dur:.2f}s, {side['lufs']} LUFS, made in {time.time()-t1:.0f}s", flush=True)
    if aj:
        d = json.loads(aj.read_text()); d["lines"].update(lines); aj.write_text(json.dumps(d))
        print(f"merged {len(lines)} line(s) into {aj}")
main()
