#!/usr/bin/env python3
"""The city weekend reel: one scene for every city and every week. Only the events change.

  python3 studio/weekend.py videos/<date>-<city>-weekend

Reads from that folder:
  reel.json     the city, the picks (words from each listing's title, in the order the voice names them), the word
                on which each card's camera glides down to the place and the price, how names are written in the
                captions, and "more": one or two other real listings swiped past while the voice names PXI
  words.json    the voice (studio/voice.py). Line 0 is the hook, lines 1..N are the events in order, line N+1 names
                PXI, line N+2 is the ending
  events/<city> this week's listings (studio/events.py)
Writes: one Discover seed per pick (studio/card.py, the pill says "This weekend"), reel.js (what scene.html loads),
cues.json (the small sounds, on the same times), sources.md (the listings shown, with their ticket pages), and scene.html (a copy of studio/weekend-reel.html, if not there yet).
Every time in the scene comes from the voice, so a new city or a new week needs no edit to the scene."""
import json, os, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = os.path.abspath(sys.argv[1]); reel = json.load(open(os.path.join(d, "reel.json"))); vo = json.load(open(os.path.join(d, "words.json")))
ev_dir = os.path.join(d, "events", reel["city"]); picks = reel["events"]; N = len(picks); LN = vo["lines"]; W = vo["words"]
if len(LN) != N + 3: sys.exit(f"the voice has {len(LN)} lines; {N} events need {N + 3} (hook, one per event, the PXI line, the ending)")

def word(line, w, n=0):
    m = [x for x in W if x["line"] == line and x["w"].lower() == w.lower()]
    if len(m) <= n: sys.exit(f"line {line} has no word {w!r}: {' '.join(x['w'] for x in W if x['line'] == line)}")
    return m[n]["s"]

seeds, facts = [], []
more = [{"pick": m} for m in reel.get("more", [])]  # real listings swiped past on the PXI line, with no voice line
for i, p in enumerate(picks + more):
    out = os.path.join(d, "events", f"seed-{i + 1}.json")
    cmd = ["python3", os.path.join(ROOT, "studio/card.py"), ev_dir, p["pick"], "--when", "This weekend", "--out", out]
    if i: cmd += ["--left", (picks + more)[i - 1]["pick"]]  # the card to the left is the one just swiped away
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: sys.exit(r.stderr or r.stdout)
    facts.append(json.loads(r.stdout)); seeds.append(json.load(open(out)))

t = {"dive": round(word(0, reel["dive"]) - 0.05, 3) if reel.get("dive") else round(LN[0]["s"] + 0.65 * (LN[0]["e"] - LN[0]["s"]), 3),
     "ev": [{"s": round(LN[i + 1]["s"] - 0.3, 3), "push": bool(p.get("on")), "on": round(word(i + 1, p["on"], p.get("nth", 0)) - 0.12, 3) if p.get("on") else None} for i, p in enumerate(picks)],
     "back": round(LN[N + 1]["s"] - 0.1, 3), "end": round(LN[N + 2]["s"] + 0.02, 3), "dur": round(vo["duration"] + 0.45, 2)}
t["flick"] = [round(t["back"] + 0.55 + k * 0.6, 3) for k in range(len(more))]
shot = json.load(open(os.path.join(d, "shots", reel["shot"] + ".json")))
js = {"city": seeds[0]["city"], "n": N, "seeds": seeds, "t": t, "shot": {"name": reel["shot"], "frames": shot["frames"], "phone": reel.get("phoneAt", [540, 1300])},
      "proper": reel.get("proper", []), "show": reel.get("show", {}), "key": reel.get("key", [])}
open(os.path.join(d, "reel.js"), "w").write("window.REEL=" + json.dumps(js, ensure_ascii=False) + ";")
cues = [["whir", t["dive"] - 0.34, 0.09, 0.4]] + [["pop", e["s"] + 0.05, 0.13] for e in t["ev"][1:]] + [["tick", e["on"] + 0.1, 0.14] for e in t["ev"] if e["on"]] \
     + [["pop", f + 0.05, 0.12] for f in t["flick"]] + [["pop", t["end"], 0.12]]
json.dump({"duration": t["dur"], "cues": cues}, open(os.path.join(d, "cues.json"), "w"))
if not os.path.exists(os.path.join(d, "scene.html")): shutil.copy(os.path.join(ROOT, "studio/weekend-reel.html"), os.path.join(d, "scene.html"))
with open(os.path.join(d, "sources.md"), "w") as f:  # the proof behind the piece: only the listings it shows
    f.write(f"# Listings shown in this piece\n\nFrom PXI's API, fetched {json.load(open(os.path.join(ev_dir, 'events.json')))['fetched']}. Check each ticket page again before the piece is scheduled.\n\n| When | Event | Venue | Price on the card | Ticket page |\n|---|---|---|---|---|\n")
    for x in facts: f.write(f"| {x['when']} | {x['listing']} | {x['venue'] or ''} | {x['price']} | {x['ticket page']} |\n")
for f in facts: print(f"  {f['when']:<18} {f['listing'][:50]:<50} {f['venue'] or '':<24} {f['price']:<8} {f['listed on']}")
print(f"{N} cards, {t['dur']} s, the shot ends at {t['dive']} s ({int(t['dive'] * 24) + 1} frames needed, the spec has {shot['frames']})")
