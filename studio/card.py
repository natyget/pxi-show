#!/usr/bin/env python3
"""One real listing as the app's Discover card: writes the seed for look/app-screens/discover.html.

  python3 studio/card.py <events dir from events.py> "<listing id or words from its title>" [--left "<words>"] [--out seed.json]

The card is dressed by the app's own code (look/app-screens/listing.ts, run against ../pxi-mobile-app, read-only):
the name, the byline, Location, Price, the two lines on the record, and the stamp. The cover is the listing's own
poster. An outside listing has no heart, no guest faces and no taste match, exactly as the app draws it.
Then: node studio/screen.cjs look/app-screens/discover.html seed.json out.png   (a still to look at)"""
import argparse, datetime, json, os, subprocess, sys, tempfile
from zoneinfo import ZoneInfo
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.environ.get("PXI_APP", os.path.join(os.path.dirname(ROOT), "pxi-mobile-app"))

def find(events, q):
    hit = [e for e in events if e["id"] == q] or [e for e in events if all(w.lower() in e["titleClean"].lower() for w in q.split())]
    if not hit: sys.exit(f"no listing matches {q!r}")
    return hit[0]

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("dir"); ap.add_argument("pick"); ap.add_argument("--left"); ap.add_argument("--out"); a = ap.parse_args()
    d = os.path.abspath(a.dir); data = json.load(open(os.path.join(d, "events.json"))); events = data["events"]
    e = find(events, a.pick)
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
    start = datetime.datetime.fromisoformat(e["start"]); tonight = datetime.datetime.now(tz).strftime("%Y-%m-%d") == e["night"]
    when = "Tonight" if tonight else start.strftime("%a %-d")
    left = find(events, a.left) if a.left else next((x for x in events if x["id"] != e["id"] and x["cover"]), None)
    seed = {"clock": "6:12", "when": when, "city": (data.get("city") or {}).get("name", ""), "day": when.upper(), "hour": e["time"], "me": "assets/me-nio.png",
            "center": {"name": e["titleClean"], "host": card["host"] or "", "cover": web(os.path.join(d, e["cover"])), "pos": "50% 50%",
                       "faces": [], "going": 0, "polaroids": [], "reaction": None, "match": None, "external": True,
                       "genre": card["record"][0], "second": card["record"][1], "label": web(os.path.join(d, e["cover"])),
                       "location": card["location"], "price": card["price"], "stamp": web(stamp)},
            "left": {"name": left["titleClean"], "cover": web(os.path.join(d, left["cover"]))} if left else {"name": "", "cover": ""},
            "discOpen": True, "joined": False}
    out = a.out or os.path.join(d, "seed-" + e["id"][:12] + ".json")
    json.dump(seed, open(out, "w"), indent=1, ensure_ascii=False)
    print(json.dumps({"listing": e["titleClean"], "when": f"{e['day']}, {e['time']}", "venue": e["venue"], "price": card["price"], "listed on": e["source"],
                      "ticket page": e["ticketUrl"], "seed": out}, indent=1, ensure_ascii=False))

if __name__ == "__main__":
    main()
