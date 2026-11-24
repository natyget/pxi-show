#!/usr/bin/env python3
"""The check before anything goes to the founder.
  python3 studio/check.py script <script.md|caption.md>        banned phrases (dont.md section 1). In a script only
                                                               the voice block is read: the notes around it are yours
  python3 studio/check.py video <file.mp4> [caption.md]        1080x1920, 30 fps, sound, -14 LUFS +-1.5, peak, length, caption words,
                                                               and that the scene and the app screens have not changed since it was rendered
  python3 studio/check.py find <videos/slug>                   the piece's search phrase (post.md, "Search phrase: ...") is said in
                                                               the first line and written in every caption and the title
Exit code 1 on any failure."""
import json, re, subprocess, sys
BANNED = [
    (r"morning after|next morning", "say scrapbook or album"), (r"screenshot|can'?t be faked|cannot be faked", "no ticket security claims"),
    (r"the ticket, the camera", "fake tagline"), (r"cheaper than|eventbrite|lower fees|fees? (than|vs)", "no fee talk"),
    (r"\bwelcome to\b|check out pxi|find us on the app store|like and follow|comment below|tag a friend|tag the one", "bait or ad copy"),
    (r"\bpart [123]\b", "whole releases only"),
    (r"the group album|lost and found|best night of|thank you for asking|clock with no hands|contacts back in|this can'?t be real|pics or it didn'?t happen|no pics of me|who is this|yeah,? what'?s up|i'?m just tired|they left", "stock line"),
    (r"\belbows?\b|\bevidence\b|\bproof\b|the actual guy", "retired joke"), (r"\b(you'?re|i'?m not being) the \w+ guy\b", "the X guy construction"),
    (r"\bliterally\b|\bvibes?\b|\bchaos\b|\bhonestly\b|here'?s the thing|\bi mean\b|(?<!did )\byou know\b|\babsolutely\b", "filler"),
    (r"late checkout|gala noir|velvet hour|\bkofi\b|\bzoe\b|\btess\b|\bnia\b|\bama\b", "made-up cool name"),
    (r"\bhold up\b|\bi?ght\b|\bnah{3,}\b", "not how Nio talks"),
]
def scan(path):
    bad = []; text = open(path).read(); block = re.search(r"```voice[^\n]*\n(.*?)```", text, re.S)
    first = text[:block.start(1)].count("\n") + 1 if block else 1
    for n, line in enumerate((block.group(1) if block else text).splitlines(), first):
        for pat, why in BANNED:
            m = re.search(pat, line, re.I)
            if m: bad.append(f"{path}:{n}: '{m.group(0)}' ({why})")
    return bad
def video(path):
    bad = []
    pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path], capture_output=True, text=True).stdout)
    v = [s for s in pr["streams"] if s["codec_type"] == "video"]; a = [s for s in pr["streams"] if s["codec_type"] == "audio"]
    dur = float(pr["format"]["duration"])
    if not v or (v[0]["width"], v[0]["height"]) != (1080, 1920): bad.append("not 1080x1920")
    if v and v[0]["r_frame_rate"] not in ("30/1", "30000/1001"): bad.append(f"frame rate {v[0]['r_frame_rate']}")
    if not a: bad.append("no sound")
    if not (15 <= dur <= 95): bad.append(f"length {dur:.1f}s outside 15-95")
    if a:
        out = subprocess.run(["ffmpeg", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
        I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", out)[-1]); pk = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", out)[-1])
        if abs(I + 14) > 1.5: bad.append(f"loudness {I} LUFS (want -14)")
        if pk > -1.0: bad.append(f"peak {pk} dBFS")
        print(f"{path}: {v[0]['width']}x{v[0]['height']} {dur:.1f}s {I} LUFS peak {pk} dB")
    import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import made
    stale = made.changed(path)
    if stale: bad.append("rendered before these changed, so render it again: " + ", ".join(stale[:6]))
    return bad
def find(folder):
    import os
    post = open(os.path.join(folder, "post.md")).read(); m = re.search(r"^Search phrase:\s*(.+)$", post, re.M | re.I)
    if not m: return ["post.md has no line \"Search phrase: ...\" (growth.md, Being found)"]
    phrase = m.group(1).strip().strip('"').lower(); want = phrase.split(); bad = []
    norm = lambda s: re.sub(r"[^a-z0-9 ]", " ", s.lower().replace("l.a.", "la").replace("new york city", "nyc").replace("new york", "nyc"))
    vo = json.load(open(os.path.join(folder, "words.json"))); first = norm(" ".join(w["w"] for w in vo["words"] if w["line"] <= 1)).split()
    missing = [w for w in want if w not in first]
    if missing: bad.append(f"the first lines never say: {' '.join(missing)} (the phrase is \"{phrase}\")")
    parts = re.split(r"\n\*\*(Instagram[^*]*|TikTok[^*]*|YouTube[^*]*|Alt text[^*]*)\*\*", post)
    for name, body in zip(parts[1::2], parts[2::2]):
        if norm(phrase).strip() not in " ".join(norm(name + " " + body).split()): bad.append(f"\"{phrase}\" is not written in: {name.split('(')[0].strip()}")
    return bad
mode, *args = sys.argv[1:]
bad = scan(args[0]) if mode == "script" else find(args[0]) if mode == "find" else video(args[0]) + (scan(args[1]) if len(args) > 1 else [])
print("\n".join(bad) if bad else "PASS"); sys.exit(1 if bad else 0)
