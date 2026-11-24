#!/usr/bin/env python3
"""Narrator voice with a timestamp for every word (Kokoro, voice am_michael, 1.05x).
Reads the ```voice block of script.md: one line per voice line, optional "|| <gap seconds>" at the end.
Writes vo_raw.wav (24 kHz) and words.json / words.js (for the scene). Run from the video's folder:
  python ../../studio/voice.py script.md
Setup once: bash ../../studio/setup.sh"""
import json, re, sys
import numpy as np, soundfile as sf
from kokoro import KPipeline
SR = 24000
SHOW = {"I.D.K.s": "idks", "I.D.K.": "idk", "Pixie": "PXI", "P.M": "pm", "P.M.": "pm", "A.M.": "am", "O.M.W.": "omw"}
text = open(sys.argv[1]).read()
block = re.search(r"```voice\n(.*?)```", text, re.S).group(1)
LINES = []
for raw in block.strip().splitlines():
    line, _, gap = raw.partition("||")
    LINES.append((line.strip(), float(gap) if gap.strip() else 0.35))
p = KPipeline(lang_code="a")
out, words, lines, t0 = [np.zeros(int(0.25 * SR), dtype=np.float32)], [], [], 0.25
for i, (txt, gap) in enumerate(LINES):
    chunks = list(p(txt, voice="am_michael", speed=1.05))
    a = np.concatenate([c.audio.numpy() for c in chunks]); off = 0.0
    for c in chunks:
        for t in c.tokens:
            if t.start_ts is None or not any(ch.isalnum() for ch in t.text): continue
            words.append({"w": SHOW.get(t.text, t.text), "s": round(t0 + off + t.start_ts, 3), "e": round(t0 + off + t.end_ts, 3), "line": i})
        off += len(c.audio) / SR
    lines.append({"i": i, "s": round(t0, 3), "e": round(t0 + len(a) / SR, 3), "text": txt})
    out += [a, np.zeros(int(gap * SR), dtype=np.float32)]; t0 += len(a) / SR + gap
audio = np.concatenate(out); sf.write("vo_raw.wav", audio, SR)
d = {"duration": round(len(audio) / SR, 3), "lines": lines, "words": words}
json.dump(d, open("words.json", "w"), indent=1); open("words.js", "w").write("window.VO=" + json.dumps(d) + ";")
print("duration", d["duration"]); [print(l["i"], l["s"], l["e"], l["text"]) for l in lines]
