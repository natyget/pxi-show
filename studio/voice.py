#!/usr/bin/env python3
"""Narrator voice with a timestamp for every word (Kokoro, voice am_michael, 1.05x).
Reads the ```voice block of script.md, one line per voice line. Run from the video's folder:
  python ../../studio/voice.py script.md
In a voice line:
  /            where the caption breaks ("Thirty minutes ago, / nobody knew / what to do tonight."). A line with
               no slash is broken for you at its commas, in groups of two or three words; the breaks are printed
  Lys{Leece}   the caption shows Lys, the voice says Leece (for a name the voice gets wrong; one word each)
  || 0.4       at the end of a line: the pause after it, in seconds (0.35 if left out)
Writes vo_raw.wav (24 kHz) and words.json / words.js for the scene: every word with its start, end, line and
caption group. Then run hear.py: it prints what a stranger hears. Setup once: bash ../../studio/setup.sh"""
import json, re, sys
import numpy as np, soundfile as sf
from kokoro import KPipeline
SR = 24000
SHOW = {"I.D.K.s": "idks", "I.D.K.": "idk", "Pixie": "PXI", "P.M": "pm", "P.M.": "pm", "A.M.": "am", "O.M.W.": "omw"}
SAY = re.compile(r"(\S+?)\{([^{}\s]+)\}")
alnum = lambda s: sum(ch.isalnum() for ch in s)
text = open(sys.argv[1]).read()
block = re.search(r"```voice\n(.*?)```", text, re.S).group(1)
LINES = []
for raw in block.strip().splitlines():
    line, _, gap = raw.partition("||")
    show = {m.group(2): m.group(1) for m in SAY.finditer(line)}  # what the voice says -> what the caption shows
    segs = [SAY.sub(lambda m: m.group(2), s).strip() for s in line.split(" / ")]
    LINES.append((" ".join(s for s in segs if s), [alnum(s) for s in segs if s] if len(segs) > 1 else None, show, float(gap) if gap.strip() else 0.35))
p = KPipeline(lang_code="a")
out, words, lines, t0 = [np.zeros(int(0.25 * SR), dtype=np.float32)], [], [], 0.25
for i, (txt, cuts, show, gap) in enumerate(LINES):
    chunks = list(p(txt, voice="am_michael", speed=1.05))
    a = np.concatenate([c.audio.numpy() for c in chunks]); off = 0.0; lw = []; seen = 0; g = 0; edge = cuts[0] if cuts else None; brk = False
    for c in chunks:
        for t in c.tokens:
            if not any(ch.isalnum() for ch in t.text):
                brk = brk or any(ch in ",.?!:;" for ch in t.text); continue  # punctuation: a place the caption may break
            if cuts:  # the script's own breaks: a new group once the letters before this word fill the last one
                while g < len(cuts) - 1 and seen >= edge: g += 1; edge += cuts[g]
            elif lw and brk: g += 1  # no breaks in the script: g counts clauses for now, split below
            brk = False; seen += alnum(t.text)
            if t.start_ts is None: continue
            key = t.text.strip(".,?!:;'\"")
            lw.append({"w": show.get(key, SHOW.get(t.text, t.text)), "s": round(t0 + off + t.start_ts, 3), "e": round(t0 + off + t.end_ts, 3), "line": i, "g": g})
        off += len(c.audio) / SR
    if not cuts:  # each clause in even groups of two or three words; a one-word clause joins the next when they fit in three
        clauses = [[w for w in lw if w["g"] == k] for k in sorted(set(w["g"] for w in lw))]; merged = []
        for c in clauses:
            if merged and len(merged[-1]) == 1 and len(c) <= 2: merged[-1] = merged[-1] + c
            else: merged.append(c)
        g = 0
        for c in merged:
            k = -(-len(c) // 3); sizes = [len(c) // k + (1 if j < len(c) % k else 0) for j in range(k)]; j = 0
            for n in sizes:
                for w in c[j:j + n]: w["g"] = g
                j += n; g += 1
    ids = sorted(set(w["g"] for w in lw))
    for w in lw: w["g"] = ids.index(w["g"])
    groups = [sum(1 for w in lw if w["g"] == k) for k in range(len(ids))]
    words += lw; lines.append({"i": i, "s": round(t0, 3), "e": round(t0 + len(a) / SR, 3), "text": txt, "groups": groups})
    out += [a, np.zeros(int(gap * SR), dtype=np.float32)]; t0 += len(a) / SR + gap
audio = np.concatenate(out); sf.write("vo_raw.wav", audio, SR)
d = {"duration": round(len(audio) / SR, 3), "lines": lines, "words": words}
json.dump(d, open("words.json", "w"), indent=1); open("words.js", "w").write("window.VO=" + json.dumps(d) + ";")
print("duration", d["duration"])
for l in lines:
    lw = [w for w in words if w["line"] == l["i"]]
    print(l["i"], l["s"], l["e"], " / ".join(" ".join(w["w"] for w in lw if w["g"] == k) for k in range(len(l["groups"]))))
