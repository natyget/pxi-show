#!/usr/bin/env python3
"""The city weekend reel: this weekend told as nights out. One scene for every city and week; only reel.json,
the voice and the rig shots change.

  python3 studio/weekend.py videos/<date>-<city>-weekend

Reads from that folder:
  reel.json     the city; "cards": the picks (words from each listing's title, or a listing id); "beats": what the
                picture is on each voice line, in order. A beat is one of
                  {"line": 0, "shot": "dinner"}                  a rig shot (shots/dinner.json, plates/dinner/)
                  {"line": 1, "card": 0, "on": "about"}          that pick's real Discover card; the camera pushes
                                                                 toward the price on the word "on" (leave out: no push)
                  {"line": 4, "chat": {"name": "Sarah", "msgs": [["them", "text", null], ["me", "text", "word"]]}}
                                                                 a chat; each message lands on its word (null: at once; "3:word": a word of line 3)
                  {"line": 8, "flick": true}                     every card again, one after another, quickly
                  {"line": 8, "at": "Send", "end": true}         the end card ("at": a beat that starts on a word inside its line)
                and how names are written in the captions ("proper", "show", "key")
  words.json    the voice (studio/voice.py)
  events/<city> this week's listings (studio/events.py)
Writes: one Discover seed per card (studio/card.py; the pill says "This weekend"), reel.js (what scene.html loads),
cues.json (the small sounds, on the same times), sources.md (the listings shown, with their ticket pages) and
scene.html (a copy of studio/weekend-reel.html, if not there yet). Every time comes from the voice."""
import json, os, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = os.path.abspath(sys.argv[1]); reel = json.load(open(os.path.join(d, "reel.json"))); vo = json.load(open(os.path.join(d, "words.json")))
ev_dir = os.path.join(d, "events", reel["city"]); LN = vo["lines"]; W = vo["words"]

def word(line, w, n=0):
    m = [x for x in W if x["line"] == line and x["w"].lower() == w.lower()]
    if len(m) <= n: sys.exit(f"line {line} has no word {w!r}: {' '.join(x['w'] for x in W if x['line'] == line)}")
    return m[n]["s"]

def at(line, w):  # "word" in the beat's own line, or "3:word" in line 3
    return word(int(w.split(':')[0]), w.split(':')[1]) if ':' in w else word(line, w)

seeds, facts = [], []
for i, pick in enumerate(reel["cards"]):
    out = os.path.join(d, "events", f"seed-{i + 1}.json")
    r = subprocess.run(["python3", os.path.join(ROOT, "studio/card.py"), ev_dir, pick, "--when", "This weekend", "--out", out], capture_output=True, text=True)
    if r.returncode: sys.exit(r.stderr or r.stdout)
    fact = json.loads(r.stdout); seed = json.load(open(out))
    # the app prints a listing's title as it is ("Foodies + New Friends"); until card.py does, take it from the listing
    raw = json.load(open(os.path.join(ev_dir, "events.json")))["events"]
    seed["center"]["name"] = next(e["title"] for e in raw if e["ticketUrl"] == fact["ticket page"]); json.dump(seed, open(out, "w"), indent=1, ensure_ascii=False)
    fact["listing"] = seed["center"]["name"]; facts.append(fact); seeds.append(seed)

dur = round(vo["duration"] + 0.45, 2); beats = []; cues = []
starts = [0.0 if i == 0 else round((word(b["line"], b["at"]) if b.get("at") else LN[b["line"]]["s"]) - 0.12, 3) for i, b in enumerate(reel["beats"])]
for i, b in enumerate(reel["beats"]):
    t0, t1 = starts[i], (starts[i + 1] if i + 1 < len(starts) else dur); o = {"t0": t0, "t1": t1}
    if "shot" in b:
        spec = json.load(open(os.path.join(d, "shots", b["shot"] + ".json"))); need = int((t1 - t0) * 24) + 1
        if spec["frames"] < need - 4: sys.exit(f"shot {b['shot']} has {spec['frames']} frames; the beat needs {need}")
        o.update(kind="shot", name=b["shot"], frames=spec["frames"])
    elif "card" in b:
        on = round(word(b["line"], b["on"], b.get("nth", 0)) - 0.12, 3) if b.get("on") else None
        o.update(kind="card", card=b["card"], on=on); cues.append(["pop", t0 + 0.02, 0.1])
        if on: cues.append(["tick", on + 0.1, 0.14])
    elif "chat" in b:
        msgs = [{"me": who == "me", "txt": txt, "t": round(at(b["line"], w) - 0.08, 3) if w else round(t0 + 0.12, 3)} for who, txt, w in b["chat"]["msgs"]]
        o.update(kind="chat", name=b["chat"]["name"], msgs=msgs); cues += [["pop", m["t"], 0.13] for m in msgs]
    elif "flick" in b:
        o.update(kind="flick"); cues += [["tick", round(t0 + k * (t1 - t0) / len(seeds), 3) + 0.02, 0.12] for k in range(len(seeds))]
    else:
        o.update(kind="end"); cues.append(["pop", t0, 0.12])
    beats.append(o)
js = {"city": seeds[0]["city"], "seeds": seeds, "beats": beats, "dur": dur, "proper": reel.get("proper", []), "show": reel.get("show", {}), "key": reel.get("key", [])}
open(os.path.join(d, "reel.js"), "w").write("window.REEL=" + json.dumps(js, ensure_ascii=False) + ";")
json.dump({"duration": dur, "cues": cues}, open(os.path.join(d, "cues.json"), "w"))
with open(os.path.join(d, "sources.md"), "w") as f:  # the proof behind the piece: only the listings it shows
    f.write(f"# Listings shown in this piece\n\nFrom PXI's API, fetched {json.load(open(os.path.join(ev_dir, 'events.json')))['fetched']}. Check each ticket page again before the piece is scheduled.\n\n| When | Event | Venue | Price on the card | Ticket page |\n|---|---|---|---|---|\n")
    for x in facts: f.write(f"| {x['when']} | {x['listing']} | {x['venue'] or ''} | {x['price']} | {x['ticket page']} |\n")
if not os.path.exists(os.path.join(d, "scene.html")): shutil.copy(os.path.join(ROOT, "studio/weekend-reel.html"), os.path.join(d, "scene.html"))
for f in facts: print(f"  {f['when']:<18} {f['listing'][:50]:<50} {(f['venue'] or '')[:24]:<24} {f['price']:<8} {f['listed on']}")
for b in beats: print(f"  {b['t0']:>6.2f} to {b['t1']:>6.2f}  {b['kind']:<5} {b.get('name', b.get('card', ''))}")
print(f"{len(seeds)} cards, {dur} s")
