#!/usr/bin/env python3
"""Small original sound effects, made from sine and noise (nothing sampled, no music), mixed with the voice.
cues.json: {"duration": 36.4, "cues": [["tap", 11.07, 0.22], ["pop", 7.25, 0.14], ["tick", 2.5, 0.16], ["whir", 0.6, 0.1, 1.65], ["shutter", 30.95, 0.2]]}
  python ../../studio/sfx.py cues.json vo_raw.wav   -> mix.wav at -14 LUFS"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
SR = 48000; rng = np.random.default_rng(3)
def tick(f=2400, d=0.035): t = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * f * t) * np.exp(-t * 90)
def pop(f0=520, f1=900, d=0.09): t = np.arange(int(d * SR)) / SR; f = np.linspace(f0, f1, len(t)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40)
def tap(): t = np.arange(int(0.05 * SR)) / SR; return rng.standard_normal(len(t)) * np.exp(-t * 160) * 0.6 + np.sin(2 * np.pi * 180 * t) * np.exp(-t * 60)
def whir(d): t = np.arange(int(d * SR)) / SR; f = np.linspace(900, 2600, len(t)) + 80 * np.sin(2 * np.pi * 13 * t); env = np.minimum(1, t / .06) * np.minimum(1, (d - t) / .08); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * .5 + rng.standard_normal(len(t)) * .25) * env
def shutter(): t = np.arange(int(0.12 * SR)) / SR; nz = rng.standard_normal(len(t)); return nz * (np.exp(-t * 90) + 0.7 * np.exp(-np.maximum(t - .05, 0) * 120) * (t > .05))
spec = json.load(open(sys.argv[1])); out = np.zeros(int(spec["duration"] * SR))
for c in spec["cues"]:
    kind, t, g = c[0], c[1], c[2]; sig = whir(c[3]) if kind == "whir" else {"tick": tick, "pop": pop, "tap": tap, "shutter": shutter}[kind]()
    i = int(t * SR); j = min(len(out), i + len(sig)); out[i:j] += sig[: j - i] * g
sf.write("sfx.wav", out.astype(np.float32), SR)
d = spec["duration"]
f = (f"[0:a]aresample=48000,highpass=f=70,acompressor=threshold=-18dB:ratio=2.5:attack=5:release=80,apad=whole_dur={d}[v];"
     "[v][1:a]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=9[m]")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", sys.argv[2], "-i", "sfx.wav", "-filter_complex", f, "-map", "[m]", "-ar", "48000", "-ac", "2", "mix_pre.wav"], check=True)
# loudnorm in one pass lands a little low: measure, then trim to -14 LUFS under a limiter
import re
out = subprocess.run(["ffmpeg", "-i", "mix_pre.wav", "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", out)[-1])
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "mix_pre.wav", "-af", f"volume={-14 - I:.2f}dB,alimiter=limit=0.76:level=false", "mix.wav"], check=True)
os.remove("mix_pre.wav")
# a sharp tap or tick can slip past the limiter: measure the true peak and bring the whole mix down if it is over -3 dB (the AAC encode adds about 1.5 dB on sharp sounds)
out = subprocess.run(["ffmpeg", "-i", "mix.wav", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
pk = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", out)[-1])
if pk > -3.0:
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "mix.wav", "-af", f"volume={-3.0 - pk:.2f}dB", "mix_t.wav"], check=True); os.replace("mix_t.wav", "mix.wav")
print(f"mix.wav written (was {I} LUFS, trimmed to -14; peak {pk} dB" + (", lowered to -3)" if pk > -3.0 else ")"))
