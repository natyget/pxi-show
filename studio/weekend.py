#!/usr/bin/env python3
"""The city weekend reel: this weekend told as nights out. One scene for every city and week; only reel.json,
the voice and the rig shots change.

  python3 studio/weekend.py videos/<date>-<city>-weekend

Reads from that folder:
  reel.json     the city; "cards": the picks (words from each listing's title, or a listing id); "beats": what the
                picture is on each voice line, in order. A beat is one of
                  {"line": 0, "shot": "dinner"}                  a rig shot (shots/dinner.json, plates/dinner/)
                  {"line": 1, "shot": "dinner", "zoom": [1.5, 540, 700], "label": {"pick": "<id>", "name": "...", "place": "..."}}
                                                                 the same shot carried on, cut in closer (scale, and the
                                                                 point it grows from), with the listing's facts as a plain
                                                                 label: for a pick the app shows in All events, not as a card
                                                                 (only a listing with a song is a Discover card; card.py refuses the rest)
                  {"line": 1, "card": 0, "on": "about"}          that pick's real Discover card; the camera pushes
                                                                 toward the price on the word "on" (leave out: no push)
                  {"line": 4, "chat": {"name": "Sarah", "msgs": [["them", "text", null], ["me", "text", "word"]]}}
                                                                 a chat; each message lands on its word (null: at once; "3:word": a word of line 3)
                  {"line": 8, "flick": true}                     the carousel swiped, card after card from the first pick
                                                                 (the app's own next cards, whatever they are)
                "now": the moment in the story, in the city's time ("2026-11-27 18:30"); left out: when the listings were fetched
                  {"line": 8, "at": "Send", "end": true}         the end card ("at": a beat that starts on a word inside its line)
                and how names are written in the captions ("proper", "show", "key")
  words.json    the voice (studio/voice.py)
  events/<city> this week's listings (studio/events.py)
Writes: events/seed.json, the app's carousel with every pick in it (studio/card.py; the When is "This weekend"),
reel.js (what scene.html loads),
cues.json (the small sounds, on the same times), sources.md (the listings shown, with their ticket pages) and
scene.html (a copy of studio/weekend-reel.html, if not there yet). Every time comes from the voice."""
import json, os, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from appdata import ROOT, find
from card import carousel, seed_of
d = os.path.abspath(sys.argv[1]); reel = json.load(open(os.path.join(d, "reel.json"))); vo = json.load(open(os.path.join(d, "words.json")))
ev_dir = os.path.join(d, "events", reel["city"]); LN = vo["lines"]; W = vo["words"]

def word(line, w, n=0):
    m = [x for x in W if x["line"] == line and x["w"].lower() == w.lower()]
    if len(m) <= n: sys.exit(f"line {line} has no word {w!r}: {' '.join(x['w'] for x in W if x['line'] == line)}")
    return m[n]["s"]

def at(line, w):  # "word" in the beat's own line, or "3:word" in line 3
    return word(int(w.split(':')[0]), w.split(':')[1]) if ':' in w else word(line, w)

scene = os.path.join(d, "scene.html")
if os.path.exists(scene) and "REEL.seeds" in open(scene).read():
    sys.exit(f"{scene} is the older scene (one screen per card). Delete it and run this again: the new one swipes the app's real carousel.")
# The app's own carousel for this weekend, and where each pick sits in it. A pick the app would not show as a card stops the build.
app, moment, car = carousel(ev_dir, "weekend", reel.get("now")); ids = [c["id"] for c in car["cards"]]; picks, facts = [], []
for pick in reel["cards"]:
    e = find(app, pick, moment)
    if e["id"] not in ids: sys.exit(f"REFUSED: \"{e['title']}\" is not a card of the app's carousel this weekend (no song, over, or another night). "
                                    f"Show it with a label on a shot, or in All events (studio/list.py).")
    c = car["cards"][ids.index(e["id"])]; picks.append(ids.index(e["id"]))
    facts.append({"listing": c["name"], "when": f"{c['day']}, {c['clock']}", "venue": c["venue"], "price": c["price"], "listed on": c["source"], "ticket page": c["ticketUrl"]})
seed = seed_of(ev_dir, car, moment, picks[0]); seeds = picks
json.dump(seed, open(os.path.join(d, "events", "seed.json"), "w"), indent=1, ensure_ascii=False)

dur = round(vo["duration"] + 0.45, 2); beats = []; cues = []; used = {}; labelled = []
listings = json.load(open(os.path.join(ev_dir, "events.json")))["events"]
starts = [0.0 if i == 0 else round((word(b["line"], b["at"]) if b.get("at") else LN[b["line"]]["s"]) - 0.12, 3) for i, b in enumerate(reel["beats"])]
for i, b in enumerate(reel["beats"]):
    t0, t1 = starts[i], (starts[i + 1] if i + 1 < len(starts) else dur); o = {"t0": t0, "t1": t1}
    if "shot" in b:
        spec = json.load(open(os.path.join(d, "shots", b["shot"] + ".json"))); need = int((t1 - t0) * 24) + 1
        f0 = used.get(b["shot"], 0); used[b["shot"]] = f0 + int(round((t1 - t0) * 24))  # a second beat on the same shot carries on where the first stopped
        if spec["frames"] < f0 + need - 4: sys.exit(f"shot {b['shot']} has {spec['frames']} frames; its beats need {f0 + need}")
        o.update(kind="shot", name=b["shot"], frames=spec["frames"], f0=f0, zoom=b.get("zoom"))
        if b.get("label"):
            e = next(x for x in listings if x["id"] == b["label"]["pick"]); price = "FREE" if e["price"] == "Free" else (e["price"] or "price TBA")
            o["label"] = [b["label"].get("name", e["title"]), f"{e['day'].split()[0].upper()} {e['time']} · {b['label'].get('place', e['venue'])} · {price}"]
            labelled.append({"when": f"{e['day']}, {e['time']}", "listing": e["title"], "venue": e["venue"], "price": price + " (label, no card)", "ticket page": e["ticketUrl"]})
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
js = {"city": seed["city"], "cards": picks, "beats": beats, "dur": dur, "proper": reel.get("proper", []), "show": reel.get("show", {}), "key": reel.get("key", [])}
open(os.path.join(d, "reel.js"), "w").write("window.REEL=" + json.dumps(js, ensure_ascii=False) + ";")
json.dump({"duration": dur, "cues": cues}, open(os.path.join(d, "cues.json"), "w"))
with open(os.path.join(d, "sources.md"), "w") as f:  # the proof behind the piece: only the listings it shows
    f.write(f"# Listings shown in this piece\n\nFrom PXI's API, fetched {json.load(open(os.path.join(ev_dir, 'events.json')))['fetched']}. Check each ticket page again before the piece is scheduled.\n\n| When | Event | Venue | Price on the card | Ticket page |\n|---|---|---|---|---|\n")
    for x in facts + labelled: f.write(f"| {x['when']} | {x['listing']} | {x['venue'] or ''} | {x['price']} | {x['ticket page']} |\n")
if not os.path.exists(scene): shutil.copy(os.path.join(ROOT, "studio/weekend-reel.html"), scene)
for f in facts: print(f"  {f['when']:<18} {f['listing'][:50]:<50} {(f['venue'] or '')[:24]:<24} {f['price']:<8} {f['listed on']}")
for b in beats: print(f"  {b['t0']:>6.2f} to {b['t1']:>6.2f}  {b['kind']:<5} {b.get('name', b.get('card', ''))}")
print(f"{len(seeds)} cards, {dur} s")
