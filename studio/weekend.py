#!/usr/bin/env python3
"""The city weekend reel: this weekend told as nights out. One scene for every city and week; only reel.json,
the voice and the rig shots change.

  python3 studio/weekend.py videos/<date>-<city>-weekend

Reads from that folder:
  reel.json     the city; "cards": the picks (words from each listing's title, or a listing id); "beats": what the
                picture is on each voice line, in order. A beat is one of
                  {"line": 0, "shot": "dinner"}                  a rig shot (shots/dinner.json, plates/dinner/). When someone
                                                                 in the cast speaks in it (look/rig.md, "Talking"), its "says"
                                                                 must start each line on its frame: a shot that differs is
                                                                 refused, with the "says" to write
                  {"line": 0, "shot": "dinner", "from": 40}      the shot from its frame 40, for a piece that reuses a plate
                  {"line": 1, "shot": "dinner", "zoom": [1.5, 540, 700], "label": {"pick": "<id>", "name": "...", "place": "..."}}
                                                                 the same shot carried on, cut in closer (scale, and the
                                                                 point it grows from), with the listing's facts as a plain
                                                                 label ("noprice": true when the listing gives none): for a pick the app shows in All events, not as a card
                                                                 (only a listing with a song is a Discover card; card.py refuses the rest)
                  {"line": 1, "card": 0, "on": "about"}          that pick's real Discover card; on the word "on"
                                                                 everything but the price dims (leave out: nothing dims)
                  {"line": 4, "chat": {"name": "Sarah", "msgs": [["them", "text", null], ["me", "text", "word"]]}}
                                                                 a chat; each message lands on its word (null: there when the chat appears; "3:word": a word of line 3)
                  {"line": 8, "map": {"labels": [{"pick": "<id>", "name": "Night Tales", "place": "Echo Park"}]}}
                                                                 the map, for a line about all of them at once: every weekend
                                                                 listing a pin by its own coordinates, the named ones with name and time
                  {"line": 1, "list": "<listing id>", "on": "free"}  the All events list come to rest on that listing (studio/list.py:
                                                                 the screen for a pick with no song); on the word "on" a circle goes
                                                                 round its price (its name when the listing gives none)
                  {"line": 8, "flick": true}                     the carousel swiped, card after card from the first pick
                                                                 (the app's own next cards, whatever they are)
                "now": the moment in the story, in the city's time ("2026-11-27 18:30"); left out: when the listings were fetched
                  {"line": 2, "card": 0, "hold": true}           the same card as the beat before, carried on (a second voice line on it)
                  {"line": 8, "end": true, "cap": true}          the end card with the ask said over it, its captions under the badges
                  {"line": 8, "at": "Send", "end": true}         the end card ("at": a beat that starts on a word inside its line;
                                                                 "after": true: it starts when the line has been said)
                and how names are written in the captions ("proper", "show", "key")
  words.json    the voice (studio/voice.py)
  events/<city> this week's listings (studio/events.py)
Writes: events/seed.json, the app's carousel with every pick in it (studio/card.py; the When is "This weekend"),
reel.js (what scene.html loads),
cues.json (the small sounds, on the same times), sources.md (the listings shown, with their ticket pages) and
scene.html (a copy of studio/weekend-reel.html, copied again on every run). Every time comes from the voice."""
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
WHEN = reel.get("when", "weekend")  # what the filter bar says: weekend, tonight, tomorrow
app, moment, car = carousel(ev_dir, WHEN, reel.get("now")); ids = [c["id"] for c in car["cards"]]; picks, facts = [], []
for pick in reel["cards"]:
    e = find(app, pick, moment)
    if e["id"] not in ids: sys.exit(f"REFUSED: \"{e['title']}\" is not a card of the app's carousel this weekend (no song, over, or another night). "
                                    f"Show it with a label on a shot, or in All events (studio/list.py).")
    c = car["cards"][ids.index(e["id"])]; picks.append(ids.index(e["id"]))
    facts.append({"listing": c["name"], "when": f"{c['day']}, {c['clock']}", "venue": c["venue"], "price": c["price"], "listed on": c["source"], "ticket page": c["ticketUrl"]})
if not picks: picks = [0]  # a piece with no card of its own still swipes the app's carousel from its first card
seed = seed_of(ev_dir, car, moment, picks[0]); seeds = picks
json.dump(seed, open(os.path.join(d, "events", "seed.json"), "w"), indent=1, ensure_ascii=False)

def from_app(pick):  # a listing outside the forty in events.json, from the app's own answer (app.json)
    import datetime; from zoneinfo import ZoneInfo
    a = json.load(open(os.path.join(ev_dir, "app.json"))); a = a if isinstance(a, list) else a.get("events") or a.get("listings") or []
    r = next((x for x in a if x["id"] == pick), None)
    if not r: sys.exit(f"no listing {pick} in events.json or app.json: fetch again, it may be gone")
    tz = ZoneInfo((json.load(open(os.path.join(ev_dir, "events.json"))).get("city") or {}).get("timeZone") or "America/New_York")
    st = datetime.datetime.fromisoformat(r["startsAt"].replace("Z", "+00:00")).astimezone(tz); c = r.get("priceFromCents")
    return {"id": pick, "title": r["title"].strip(), "day": st.strftime("%a %b %-d"), "time": st.strftime("%-I:%M %p").replace(":00 ", " "), "venue": r.get("venueName"),
            "price": "Free" if r.get("isFree") or c == 0 else ("$%d" % (c / 100) if c and c % 100 == 0 else "$%.2f" % (c / 100) if c else None), "ticketUrl": r.get("ticketUrl"), "lat": r.get("lat"), "lng": r.get("lng")}

def map_pins(spec, t0):
    """The map: every weekend listing as a pin by its own coordinates, the named ones with their name and time.
    Our drawing of the idea, so only what the coordinates give: which is north or east of which, nothing about distance."""
    import math
    lab = []
    for k, m in enumerate(spec["labels"]):
        e = next((x for x in listings if x["id"] == m["pick"]), None) or from_app(m["pick"])
        if e.get("lat") is None or "tba" in (e.get("venue") or "").lower(): sys.exit(f"the map cannot place \"{e['title']}\": its listing gives no place")
        lab.append({"lat": e["lat"], "lng": e["lng"], "name": m.get("name", e["title"]), "when": f"{e['day'].split()[0].upper()} {e['time']}" + (f" · {m['place']}" if m.get("place") else "")})
    k0 = math.cos(math.radians(lab[0]["lat"])); X = lambda e: e["lng"] * k0; Y = lambda e: -e["lat"]
    xs, ys = [X(e) for e in lab], [Y(e) for e in lab]; span = max(max(xs) - min(xs), (max(ys) - min(ys)) * 560 / 520, 0.02)
    cx, cy = (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2; sc = 560 / span
    P = lambda e: (round(540 + (X(e) - cx) * sc), round(760 + (Y(e) - cy) * sc))
    pins = []; seen = set()
    a = json.load(open(os.path.join(ev_dir, "app.json"))); a = a if isinstance(a, list) else a.get("events") or a.get("listings") or []
    for e in a:  # every other listing the app has for these nights, unnamed, where it falls inside the picture
        if e.get("lat") is None or "tba" in (e.get("venueName") or "").lower(): continue
        x, y = P(e)
        if not (40 <= x <= 1040 and 300 <= y <= 1560) or (x // 20, y // 20) in seen or any(abs(x - P(l)[0]) < 24 and abs(y - P(l)[1]) < 24 for l in lab): continue
        seen.add((x // 20, y // 20)); pins.append({"x": x, "y": y})
    for i, p in enumerate(pins): p["t"] = round(t0 + min(0.04, 1.2 / len(pins)) * i, 3)  # every pin is down inside 1.2 s
    named = []
    for k, l in enumerate(lab):
        x, y = P(l); wide = max(len(l["name"]) * 29, len(l["when"]) * 23); n = {"x": x, "y": y, "w": wide, "name": l["name"], "when": l["when"], "t": round(t0 + 0.15 + 0.28 * k, 3)}
        # the label sits beside its pin where it fits inside the safe box, else under it
        if x + 52 + wide <= 930: n.update(lx=x + 52, ly=y - 124)
        elif x - 52 - wide >= 90: n.update(lx=x - 52 - wide, ly=y - 124)
        else: n.update(lx=max(96, min(930 - wide, x - wide // 2)), ly=y + 14)
        named.append(n)
    for _ in range(12):  # two labels never lie on each other: the lower one moves down until they are clear
        moved = False
        for a2 in sorted(named, key=lambda n: n["ly"]):
            for b2 in named:
                if b2 is a2 or b2["ly"] > a2["ly"] or (b2["ly"] == a2["ly"] and named.index(b2) > named.index(a2)): continue
                if a2["lx"] < b2["lx"] + b2["w"] + 20 and b2["lx"] < a2["lx"] + a2["w"] + 20 and a2["ly"] - b2["ly"] < 122: a2["ly"] = b2["ly"] + 122; moved = True
        if not moved: break
    return pins + named

dur = round(vo["duration"] + 0.45, 2); beats = []; cues = []; used = {}; labelled = []
listings = json.load(open(os.path.join(ev_dir, "events.json")))["events"]
last = lambda line: [x for x in W if x["line"] == line][-1]["e"]
starts = [0.0 if i == 0 else round(last(b["line"]) + 0.25, 3) if b.get("after") else round((word(b["line"], b["at"]) if b.get("at") else LN[b["line"]]["s"]) - 0.12, 3) for i, b in enumerate(reel["beats"])]
wrong = []
for i, b in enumerate(reel["beats"]):
    t0, t1 = starts[i], (starts[i + 1] if i + 1 < len(starts) else dur); o = {"t0": t0, "t1": t1}
    if "shot" in b:
        spec = json.load(open(os.path.join(d, "shots", b["shot"] + ".json"))); need = int((t1 - t0) * 24) + 1
        f0 = b.get("from", used.get(b["shot"], 0)); used[b["shot"]] = f0 + int(round((t1 - t0) * 24))  # a second beat on the same shot carries on where the first stopped
        if spec["frames"] < f0 + need - 4: sys.exit(f"shot {b['shot']} has {spec['frames']} frames; its beats need {f0 + need}")
        o.update(kind="shot", name=b["shot"], frames=spec["frames"], f0=f0, zoom=b.get("zoom"))
        # the cast's lines heard during this shot, each on the frame it starts (a line already running starts before frame 0)
        for a in spec["actors"]:
            if "says" not in a or f0: continue
            span = t0 + sum((starts[k + 1] if k + 1 < len(starts) else dur) - starts[k] for k, x in enumerate(reel["beats"]) if x.get("shot") == b["shot"])
            says = [[round((l["s"] - t0) * 24), l["i"]] for l in LN if l.get("who") == a["who"] and l["e"] > t0 and l["s"] < span]
            if a["says"] != says: wrong.append(f'shot {b["shot"]}: {a["who"]} says the wrong lines or on the wrong frames. Write "says": {json.dumps(says)}, then render it again')
        if b.get("label"):
            e = next((x for x in listings if x["id"] == b["label"]["pick"]), None) or from_app(b["label"]["pick"]); price = "FREE" if e["price"] == "Free" else (e["price"] or "price TBA")
            o["label"] = [b["label"].get("name", e["title"]), f"{e['day'].split()[0].upper()} {e['time']} · {b['label'].get('place', e['venue'])}" + ("" if b["label"].get("noprice") else f" · {price}")]
            labelled.append({"when": f"{e['day']}, {e['time']}", "listing": e["title"], "venue": e["venue"], "price": price + " (label, no card)", "ticket page": e["ticketUrl"]})
    elif "card" in b:
        on = round(word(b["line"], b["on"], b.get("nth", 0)) - 0.12, 3) if b.get("on") else None
        o.update(kind="card", card=b["card"], on=on, hold=bool(b.get("hold")))
        if not b.get("hold"): cues.append(["pop", t0 + 0.02, 0.1])
        if on: cues.append(["tick", on + 0.1, 0.14])
    elif "chat" in b:
        msgs = [{"me": who == "me", "txt": txt, "t": round(at(b["line"], w) - 0.08, 3) if w else t0} for who, txt, w in b["chat"]["msgs"]]
        o.update(kind="chat", name=b["chat"]["name"], msgs=msgs); cues += [["pop", m["t"], 0.13] for m in msgs]
    elif "map" in b:
        pins = map_pins(b["map"], t0); o.update(kind="map", pins=pins); cues += [["pop", p["t"], 0.12] for p in pins if p.get("name")]
    elif "list" in b:
        import subprocess
        out = os.path.join(d, "events", "seed-list.json"); cmd = [sys.executable, os.path.join(ROOT, "studio/list.py"), ev_dir, "--open", b["list"], "--when", WHEN, "--out", out] + (["--now", reel["now"]] if reel.get("now") else [])
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode: sys.exit(r.stdout + r.stderr)
        note = json.loads(r.stdout[r.stdout.index("{"):])["opens on"]; on = round(word(b["line"], b["on"], b.get("nth", 0)) - 0.12, 3) if b.get("on") else None
        o.update(kind="list", id=json.load(open(out))["open"], on=on); cues.append(["pop", t0 + 0.02, 0.1])
        if on: cues.append(["tick", on + 0.1, 0.14])
        labelled.append({"when": note["night"] + ", " + note["row"].split(",")[0], "listing": note["listing"], "venue": note["row"].split(", ")[1], "price": note["row"].split(", ")[2] + " (All events row)", "ticket page": note["ticket page"]})
    elif "flick" in b:
        n = b.get("n", len(seeds)); o.update(kind="flick", n=n); cues += [["tick", round(t0 + k * (t1 - t0) / n, 3) + 0.02, 0.12] for k in range(n)]
    else:
        o.update(kind="end", cap=bool(b.get("cap"))); cues.append(["pop", t0, 0.12])
    beats.append(o)
if wrong: sys.exit("\n".join(wrong))
js = {"city": seed["city"], "cards": picks, "beats": beats, "dur": dur, "proper": reel.get("proper", []), "show": reel.get("show", {}), "key": reel.get("key", [])}
open(os.path.join(d, "reel.js"), "w").write("window.REEL=" + json.dumps(js, ensure_ascii=False) + ";")
json.dump({"duration": dur, "cues": cues}, open(os.path.join(d, "cues.json"), "w"))
with open(os.path.join(d, "sources.md"), "w") as f:  # the proof behind the piece: only the listings it shows
    f.write(f"# Listings shown in this piece\n\nFrom PXI's API, fetched {json.load(open(os.path.join(ev_dir, 'events.json')))['fetched']}. Check each ticket page again before the piece is scheduled.\n\n| When | Event | Venue | Price on the card | Ticket page |\n|---|---|---|---|---|\n")
    for x in facts + labelled: f.write(f"| {x['when']} | {x['listing']} | {x['venue'] or ''} | {x['price']} | {x['ticket page']} |\n")
shutil.copy(os.path.join(ROOT, "studio/weekend-reel.html"), scene)  # always the builder as it is now: a fix there reaches every piece
for f in facts: print(f"  {f['when']:<18} {f['listing'][:50]:<50} {(f['venue'] or '')[:24]:<24} {f['price']:<8} {f['listed on']}")
for b in beats: print(f"  {b['t0']:>6.2f} to {b['t1']:>6.2f}  {b['kind']:<5} {b.get('name', b.get('card', ''))}")
print(f"{len(seeds)} cards, {dur} s")
