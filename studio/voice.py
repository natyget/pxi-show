#!/usr/bin/env python3
"""The voice of a video, with a timestamp for every word. Run from the video's folder:
  python ../../studio/voice.py script.md
Reads the ```voice block of script.md, one line per voice line. A plain line is the narrator. A block that opens
```voice quick is the quick narrator, for information (a city reel, a demo, a list): brighter, about 3.1 words a
second, short pauses. A block that opens ```voice is the story narrator, about 2.3 words a second (the founder,
Nov 24: that one is "better for stories not info"). A line that starts with a cast name is that person, in their
own voice (studio/cast_voice.py):
  nio: So I built Pixie. / You open it, / and tonight is just there. (Talking to a friend, quick and easy.) || 0.4
In a voice line:
  /            where the caption breaks ("Thirty minutes ago, / nobody knew / what to do tonight."). A line with
               no slash is broken for you at its commas, in groups of two or three words; the breaks are printed
  Lys{Leece}   the caption shows Lys, the voice says Leece (for a name the voice gets wrong; one word each)
  (a note)     cast lines only, at the end: how the line is said. A cast line with no note is refused
  || 0.4       at the end of a line: the pause after it, in seconds (left out: 0.35 in a story, 0.15 when quick)
Writes vo_raw.wav (24 kHz) and words.json / words.js for the scene: every word with its start, end, line and
caption group; a cast line also has "who" and its own file in vo/, which a shot's "says" uses to move the mouth
(look/rig.md). Cast lines already made with the same words and note are kept, not made again.
Then run hear.py: it prints what a stranger hears. Setup once: bash ../../studio/setup.sh (and
bash ../../studio/setup_cast_voice.sh when someone in the cast speaks)."""
import difflib, json, os, re, subprocess, sys
import numpy as np, soundfile as sf
SR = 24000
HERE = os.path.dirname(os.path.abspath(__file__))
CAST = json.load(open(os.path.join(HERE, "cast_voice.json")))["characters"]
# both Kokoro. quick is the sample the founder picked on Nov 24 ("voice b nice"): change it only on the founder's word
PACES = {"story": dict(voice="am_michael", speed=1.05, gap=0.35), "quick": dict(voice="am_puck", speed=1.27, gap=0.15)}
SHOW = {"I.D.K.s": "idks", "I.D.K.": "idk", "Pixie": "PXI", "P.M": "pm", "P.M.": "pm", "A.M.": "am", "O.M.W.": "omw"}
SAY = re.compile(r"(\S+?)\{([^{}\s]+)\}")
PUNCT = ",.?!:;"
alnum = lambda s: sum(ch.isalnum() for ch in s)
bare = lambda s: s.strip(PUNCT + "'\"")

LINES = []
BLOCK = re.search(r"```voice[ \t]*(\w*)[ \t]*\n(.*?)```", open(sys.argv[1]).read(), re.S)
if (BLOCK.group(1) or "story") not in PACES: sys.exit(f"the voice block opens ```voice or ```voice quick, not ```voice {BLOCK.group(1)}")
PACE = PACES[BLOCK.group(1) or "story"]
for raw in BLOCK.group(2).strip().splitlines():
    line, _, gap = raw.partition("||"); line = line.strip(); who = note = None
    m = re.match(r"([a-z][A-Za-z0-9]*):\s+", line)
    if m and m.group(1) in CAST:
        who = m.group(1); line = line[m.end():]
        n = re.search(r"\(([^()]*)\)\s*$", line)
        if not n: sys.exit(f"{who}'s line needs how it is said, in brackets at the end: {line}")
        note = n.group(1).strip(); line = re.sub(r"\bPixie\b", "PXI", line[:n.start()].strip())  # the cast's voices are given "PXI", as their approved lines were
    show = {k: m.group(1) for m in SAY.finditer(line) for k in (m.group(2), bare(m.group(2)))}  # what the voice says -> what the caption shows ("L.A." and "L.A" both find "LA")
    segs = [SAY.sub(lambda m: m.group(2), s).strip() for s in line.split(" / ")]
    LINES.append(dict(text=" ".join(s for s in segs if s), cuts=[alnum(s) for s in segs if s] if len(segs) > 1 else None, show=show,
                      gap=float(gap) if gap.strip() else PACE["gap"], who=who, note=note))

def group(lw, cuts):
    """Caption groups for one line's words. Each word carries n (its letters) and brk (punctuation came before it)."""
    g = seen = 0; edge = cuts[0] if cuts else None
    for k, w in enumerate(lw):
        if cuts:  # the script's own breaks: a new group once the letters before this word fill the last one
            while g < len(cuts) - 1 and seen >= edge: g += 1; edge += cuts[g]
        elif k and w["brk"]: g += 1  # no breaks in the script: g counts clauses for now, split below
        seen += w["n"]; w["g"] = g
    if not cuts:  # each clause in even groups of two or three words; a one-word clause joins the next when they fit in three
        merged = []
        for c in [[w for w in lw if w["g"] == k] for k in sorted(set(w["g"] for w in lw))]:
            if merged and len(merged[-1]) == 1 and len(c) <= 2: merged[-1] = merged[-1] + c
            else: merged.append(c)
        g = 0
        for c in merged:
            k = -(-len(c) // 3); j = 0
            for n in [len(c) // k + (1 if i < len(c) % k else 0) for i in range(k)]:
                for w in c[j:j + n]: w["g"] = g
                j += n; g += 1
    ids = sorted(set(w["g"] for w in lw))
    for w in lw: w["g"] = ids.index(w["g"]); del w["n"], w["brk"]
    return [sum(1 for w in lw if w["g"] == k) for k in range(len(ids))]

def narrator(L):
    """Kokoro: the audio and every word with its own start and end."""
    chunks = list(KOKORO(L["text"], voice=PACE["voice"], speed=PACE["speed"])); a = np.concatenate([c.audio.numpy() for c in chunks]); off = 0.0; lw = []; brk = False; lost = 0
    for c in chunks:
        for t in c.tokens:
            if not any(ch.isalnum() for ch in t.text): brk = brk or any(ch in PUNCT for ch in t.text); continue
            if t.start_ts is None: lost += alnum(t.text); continue
            lw.append({"w": L["show"].get(t.text, L["show"].get(bare(t.text), SHOW.get(t.text, t.text))), "s": off + t.start_ts, "e": off + t.end_ts, "n": alnum(t.text) + lost, "brk": brk}); brk = False; lost = 0
        off += len(c.audio) / SR
    return a, lw

def cast_audio(key):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join("vo", key + ".wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def cast_words(L, a):
    """A cast line has no word times of its own: Whisper hears where each word falls, and the script's words take those times."""
    a16 = np.interp(np.arange(0, len(a), SR / 16000), np.arange(len(a)), a).astype(np.float32)
    heard = [w for s in WHISPER.transcribe(a16, beam_size=5, word_timestamps=True)[0] for w in s.words]
    script = L["text"].split(); norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
    times = [None] * len(script)
    for blk in difflib.SequenceMatcher(None, [norm(w) for w in script], [norm(w.word) for w in heard]).get_matching_blocks():
        for k in range(blk.size): times[blk.a + k] = (heard[blk.b + k].start, heard[blk.b + k].end)
    dur = len(a) / SR; known = [(-1, (0.0, 0.0))] + [(i, t) for i, t in enumerate(times) if t] + [(len(script), (dur, dur))]
    for (i0, t0), (i1, t1) in zip(known, known[1:]):  # words Whisper heard differently share the gap between their neighbours
        n = i1 - i0 - 1
        for k in range(n): times[i0 + 1 + k] = (t0[1] + (t1[0] - t0[1]) * k / n, t0[1] + (t1[0] - t0[1]) * (k + 1) / n)
    return [{"w": L["show"].get(w, L["show"].get(bare(w), SHOW.get(bare(w), bare(w)))), "s": times[i][0], "e": times[i][1], "n": alnum(w), "brk": i > 0 and script[i - 1][-1] in PUNCT} for i, w in enumerate(script)]

# the cast's lines first (a different model, in its own environment), then the narrator's
jobs = []
for i, L in enumerate(LINES):
    if not L["who"]: continue
    L["key"] = f"line{i:02d}"; meta = os.path.join("vo", L["key"] + ".json")
    same = os.path.exists(meta) and (lambda j: (j["character"], j["line"], j["note"]) == (L["who"], L["text"], L["note"]))(json.load(open(meta)))
    if not same: jobs.append({"key": L["key"], "character": L["who"], "line": L["text"], "note": L["note"]})
if jobs:
    os.makedirs("vo", exist_ok=True); json.dump(jobs, open(os.path.join("vo", "jobs.json"), "w"), indent=1)
    py = os.path.join(os.environ.get("PXI_VOICE_VENV", os.path.expanduser("~/.pxi-voice")), "bin", "python")
    if not os.path.exists(py): sys.exit("the cast's voices are not set up on this machine: bash studio/setup_cast_voice.sh")
    subprocess.run([py, os.path.join(HERE, "cast_voice.py"), os.path.join("vo", "jobs.json"), "--out", "vo"], check=True)
if any(L["who"] for L in LINES):
    from faster_whisper import WhisperModel
    WHISPER = WhisperModel("small.en", device="cpu", compute_type="int8")
if any(not L["who"] for L in LINES):
    from kokoro import KPipeline
    KOKORO = KPipeline(lang_code="a")

out, words, lines, t0 = [np.zeros(int(0.25 * SR), dtype=np.float32)], [], [], 0.25
for i, L in enumerate(LINES):
    if L["who"]: a = cast_audio(L["key"]); lw = cast_words(L, a)
    else: a, lw = narrator(L)
    groups = group(lw, L["cuts"])
    for w in lw: w.update(s=round(t0 + w["s"], 3), e=round(t0 + w["e"], 3), line=i)
    words += lw; entry = {"i": i, "s": round(t0, 3), "e": round(t0 + len(a) / SR, 3), "text": L["text"], "groups": groups}
    if L["who"]: entry.update(who=L["who"], file=os.path.join("vo", L["key"] + ".wav"))
    lines.append(entry); out += [a, np.zeros(int(L["gap"] * SR), dtype=np.float32)]; t0 += len(a) / SR + L["gap"]
audio = np.concatenate(out); sf.write("vo_raw.wav", audio, SR)
d = {"duration": round(len(audio) / SR, 3), "lines": lines, "words": words}
json.dump(d, open("words.json", "w"), indent=1); open("words.js", "w").write("window.VO=" + json.dumps(d) + ";")
nar = [l for l in lines if "who" not in l]
if nar: print("narrator:", BLOCK.group(1) or "story", "at", round(sum(1 for w in words if "who" not in lines[w["line"]]) / sum(l["e"] - l["s"] for l in nar), 2), "words a second")
print("duration", d["duration"])
for l in lines:
    lw = [w for w in words if w["line"] == l["i"]]
    print(l["i"], l["s"], l["e"], (l["who"] + ": " if "who" in l else "") + " / ".join(" ".join(w["w"] for w in lw if w["g"] == k) for k in range(len(l["groups"]))))
