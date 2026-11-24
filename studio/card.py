#!/usr/bin/env python3
"""One real listing as the app's Discover card: writes the seed for look/app-screens/discover.html.

  python3 studio/card.py <events dir from events.py> "<listing id or words from its title>" [--left "<words>"] [--when "This weekend"] [--clock 1:04] [--out seed.json]

The card is dressed by the app's own code (look/app-screens/listing.ts, run against ../pxi-mobile-app, read-only):
the name, the byline, Location, Price, the two lines on the record, and the stamp. The cover is the listing's own
poster. An outside listing has no heart, no guest faces and no taste match, exactly as the app draws it.
Then: node studio/screen.cjs look/app-screens/discover.html seed.json out.png   (a still to look at)"""
import argparse, datetime, json, os, subprocess, sys, tempfile
from zoneinfo import ZoneInfo
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.environ.get("PXI_APP", os.path.join(os.path.dirname(ROOT), "pxi-mobile-app"))

def find(events, q):
    hit = [e for e in events if e["id"] == q] or [e for e in events if all(w.lower() in (e["titleClean"] + " " + e["title"]).lower() for w in q.split())]
    if not hit: sys.exit(f"no listing matches {q!r}")
    hit.sort(key=lambda e: e["start"])
    if len(hit) > 1:  # the same event on several nights, or two events with the same words: say so, never pick in silence
        print(f"{len(hit)} listings match {q!r}; took the earliest. For another, pass its id:", file=sys.stderr)
        for e in hit: print(f"   {e['day']}, {e['time']}  {e['titleClean'][:50]}  id {e['id']}", file=sys.stderr)
    return hit[0]

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("dir"); ap.add_argument("pick"); ap.add_argument("--left"); ap.add_argument("--out")
    ap.add_argument("--when", help='what the filter pill says, as the app words it: "This weekend", "This week". Left out: the listing\'s own night')
    ap.add_argument("--clock", default="6:12", help="the time on the phone's status bar: the time in the story")
    ap.add_argument("--today", help="the day the piece goes out, YYYY-MM-DD: the card says TONIGHT, FRI or NOV 29 as the app would that day. Left out: today")
    a = ap.parse_args()
    d = os.path.abspath(a.dir); data = json.load(open(os.path.join(d, "events.json"))); events = data["events"]
    e = find(events, a.pick)
    # The app's own rule (pxi-mobile-app, src/components/discover/carouselMix.ts): a listing from another ticket site is a
    # card of the Discover carousel only when it carries a song. Without one the app shows it in All events, never as a card.
    rides = lambda x: bool((x.get("song") or "").strip())
    if not rides(e): sys.exit(f"REFUSED: \"{e['titleClean']}\" has no song, so the app never shows it as a Discover card: it is in All events.\n"
                              "Use a listing marked with a note in the events.py list for a card. To show this one, say it and picture the night; do not draw a card for it.")
    cfg = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False)
    json.dump({"compilerOptions": {"baseUrl": APP, "paths": {"@/*": ["src/*"]}, "jsx": "react-jsx", "esModuleInterop": True, "allowJs": True}}, cfg); cfg.close()
    r = subprocess.run(["npx", "-y", "tsx", "--tsconfig", cfg.name, os.path.join(ROOT, "look/app-screens/listing.ts"), os.path.join(d, "raw.json"), e["id"]],
                       cwd=APP, capture_output=True, text=True)
    os.unlink(cfg.name)
    if r.returncode: sys.exit("the app's code would not run:\n" + r.stderr[-600:])
    card = json.loads(r.stdout)
    os.makedirs(os.path.join(d, "stamps"), exist_ok=True)
    stamp = os.path.join(d, "stamps", e["id"][:60] + ".svg"); open(stamp, "w").write(card["stampSvg"])
    web = lambda p: "/" + os.path.relpath(p, ROOT)  # a path the render server understands
    tz = ZoneInfo((data.get("city") or {}).get("timeZone") or "America/New_York")
    start = datetime.datetime.fromisoformat(e["start"]); today = datetime.date.fromisoformat(a.today) if a.today else datetime.datetime.now(tz).date()
    night = datetime.date.fromisoformat(e["night"]) if e.get("night") else start.date(); ahead = (night - today).days
    when = a.when or ("Tonight" if ahead == 0 else start.strftime("%a %-d"))
    # the line above the card, as the app's eventClock.ts words it: Tonight or Today, the weekday for the next six nights, then the date
    day = ("Tonight" if start.hour >= 17 or start.hour < 5 else "Today") if ahead == 0 else night.strftime("%a") if 0 < ahead < 7 else night.strftime("%b %-d")
    # the card peeking in from the left: the one before it in the carousel, which the app keeps in time order (cards with a song only).
    # Before the first card the app shows its All events doorway, which is not rebuilt: the slot stays empty there.
    line = sorted((x for x in events if rides(x) and x["cover"]), key=lambda x: x["start"]); k = [x["id"] for x in line].index(e["id"])
    left = find(events, a.left) if a.left else (line[k - 1] if k > 0 else None)
    if left and not rides(left): sys.exit(f"REFUSED: the card on the left, \"{left['titleClean']}\", has no song, so the app never shows it as a card")
    seed = {"clock": a.clock, "when": when, "city": (data.get("city") or {}).get("name", ""), "day": day.upper(), "hour": e["time"], "me": "assets/me-nio.png",
            "center": {"name": card["name"] or e["title"], "host": card["host"] or "", "cover": web(os.path.join(d, e["cover"])), "pos": "50% 50%",
                       "faces": [], "going": 0, "polaroids": [], "reaction": None, "match": None, "external": True,
                       "genre": card["record"][0], "second": card["record"][1], "label": web(os.path.join(d, e["cover"])),
                       "location": card["location"], "price": card["price"], "stamp": web(stamp)},
            "left": {"name": left["title"], "cover": web(os.path.join(d, left["cover"]))} if left else {"name": "", "cover": ""},
            "discOpen": True, "joined": False}
    out = a.out or os.path.join(d, "seed-" + e["id"][:12] + ".json")
    json.dump(seed, open(out, "w"), indent=1, ensure_ascii=False)
    print(json.dumps({"listing": e["titleClean"], "when": f"{e['day']}, {e['time']}", "venue": e["venue"], "price": card["price"], "listed on": e["source"],
                      "ticket page": e["ticketUrl"], "seed": out}, indent=1, ensure_ascii=False))

if __name__ == "__main__":
    main()
