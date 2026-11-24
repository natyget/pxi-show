#!/usr/bin/env python3
"""The app's Discover carousel for a city, centred on one real listing: writes the seed for look/app-screens/discover.html.

  python3 studio/card.py <events dir from events.py> "<listing id or words from its title>" [--when week]
        [--now "2026-11-27 18:30"] [--clock 6:30] [--record] [--no-map] [--out seed.json]
  python3 studio/card.py <events dir> doorway ...      the carousel opened on its last card, the way in to All events

The seed holds every card the app's carousel would hold, in the app's order, and its last card, the doorway to All
events ("230 MORE THIS WEEK"), so a scene can swipe from the pick to its real neighbours (look/app-screens/README.md).
The app's own code decides all of it (look/app-screens/carousel.ts, run against ../pxi-mobile-app, read-only): which
listings are cards (only the ones that carry a song), their order, each card's day and hour, Location, Price, the two
lines on the record, the stamp, and the doorway's count, three picks and words. A listing's cover is its own poster;
an outside listing has no name printed over it, no heart, no faces and no taste match, exactly as the app draws it.

  --when     what the filter bar's When says: week (the app's own start, tonight to Sunday), tonight, tomorrow,
             weekend, or one night as YYYY-MM-DD. "This weekend" and "This week" are understood too.
  --now      the moment in the story, in the city's own time: it decides "TONIGHT" and what is over.
             Left out: the moment the listings were fetched.
  --clock    the time on the status bar, when it should differ from --now.
  --record   the seed opens with the pick's record popped out (a still of it; a scene pops it with disc(p))
  --no-map   the second word of the view switch reads "All events", not "Map": use it when the piece goes on to
             the All events list (studio/list.py), which is drawn as the app shows it with no map.

A listing with no song is REFUSED: the app never shows it as a card. Show it with studio/list.py.
The posters and the songs' artwork are fetched into the folder (never committed): run the same command again after
a fresh clone. Then:  node studio/screen.cjs look/app-screens/discover.html <seed> out.png   (a still to look at)"""
import argparse, datetime, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from appdata import ROOT, app_code, find, load_app, posters, the_moment, web

WHENS = {"this week": "week", "this weekend": "weekend", "week": "week", "weekend": "weekend", "tonight": "tonight", "tomorrow": "tomorrow"}

def carousel(d, when="week", now=None):
    """The app's carousel for the folder's city at that moment: the cards in order, the doorway, and the moment itself."""
    p, app = load_app(d); at, tz = the_moment(app, now)
    key = WHENS.get(when.lower()) or "night:" + when
    car = app_code("carousel.ts", p, json.dumps({"now": at.astimezone(datetime.timezone.utc).isoformat(), "when": key}), tz=str(tz))
    return app, at, car

def seed_of(d, car, at, index, clock=None, no_map=False):
    """The seed for discover.html: the carousel with every picture it shows fetched, opened on card `index`."""
    cards = car["cards"]; door = car["doorway"]
    covers = posters(d, cards + (door["picks"] if door else []))
    art = posters(d, [{"id": "art-" + c["id"], "labelUrl": c["labelUrl"], "name": c["name"]} for c in cards if not c["labelFallback"]], key="labelUrl", sub="art")
    os.makedirs(os.path.join(d, "stamps"), exist_ok=True); out = []
    for c in cards:
        stamp = os.path.join(d, "stamps", c["id"][:60] + ".svg"); open(stamp, "w").write(c["stamp"]["svg"])
        f = covers.get(c["id"]); a = art.get("art-" + c["id"])
        if c["coverUrl"] and not f: print(f"  \"{c['name'][:50]}\": its poster could not be fetched, the card will be empty", file=sys.stderr)
        out.append({"id": c["id"], "external": True, "name": c["name"], "hideName": c["hideName"], "host": c["host"], "cover": web(os.path.join(d, f)) if f else None, "poster": c["poster"],
                    "label": web(os.path.join(d, a)) if a else web(os.path.join(d, f)) if f else None, "labelFallback": c["labelFallback"] or not a,
                    "record": c["record"], "day": c["day"], "clock": c["clock"], "location": c["location"], "price": c["price"], "match": None,
                    "stamp": {"img": web(stamp), "w": c["stamp"]["w"], "h": c["stamp"]["h"]}})
    if door:
        picks = [{"id": p["id"], "title": p["title"], "time": p["time"], "poster": p["poster"],
                  "cover": web(os.path.join(d, covers[p["id"]])) if covers.get(p["id"]) else None} for p in door["picks"]]
        out.append({"doorway": True, "count": door["count"], "windowLabel": door["windowLabel"], "from": door["from"], "picks": picks})
    return {"clock": clock or at.strftime("%-I:%M"), "when": car["whenLabel"], "city": car["city"], "me": "assets/me-nio.png", "second": "All events" if no_map else "Map",
            "cards": out, "at": index, "discOpen": False, "joined": False}

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("dir"); ap.add_argument("pick"); ap.add_argument("--out"); ap.add_argument("--when", default="week"); ap.add_argument("--now"); ap.add_argument("--clock")
    ap.add_argument("--no-map", action="store_true"); ap.add_argument("--record", action="store_true")
    a = ap.parse_args()
    d = os.path.abspath(a.dir); app, at, car = carousel(d, a.when, a.now)
    ids = [c["id"] for c in car["cards"]]; door = car["doorway"]
    out = a.out or os.path.join(d, "seed-" + a.pick[:12].replace(" ", "-") + ".json")
    if a.pick.lower() == "doorway":
        if not door: sys.exit("the app would show no doorway here: no outside listing is left in this When once the cards are taken out")
        json.dump(seed_of(d, car, at, len(ids), a.clock, a.no_map), open(out, "w"), indent=1, ensure_ascii=False)
        print(json.dumps({"doorway": f"{door['count']} MORE {door['windowLabel']}", "its three picks": [f"{p['time']}  {p['title']}" for p in door["picks"]], "under them": door["from"],
                          "cards before it": len(ids), "the moment": at.strftime("%a %b %-d, %-I:%M %p"), "seed": out}, indent=1, ensure_ascii=False)); return
    e = find(app, a.pick, at)
    if e["id"] not in ids:
        if not ((e.get("topSong") or {}).get("title") or "").strip():
            sys.exit(f"REFUSED: \"{e['title']}\" has no song, so the app never shows it as a Discover card: it is in All events.\n"
                     f"Show it where the app does: python3 studio/list.py {a.dir} --open \"{a.pick}\"   (look/app-screens/all-events.html)")
        sys.exit(f"REFUSED: \"{e['title']}\" ({e['night']}) is not a card at this moment with the When on \"{car['whenLabel']}\": it is over, or its night is outside the When. Change --when or --now.")
    k = ids.index(e["id"]); c = car["cards"][k]; seed = seed_of(d, car, at, k, a.clock, a.no_map); seed["discOpen"] = a.record
    json.dump(seed, open(out, "w"), indent=1, ensure_ascii=False)
    print(json.dumps({"listing": c["name"], "when": f"{c['day']}, {c['clock']}", "venue": c["venue"], "price": c["price"], "listed on": c["source"], "ticket page": c["ticketUrl"],
                      "card": f"{k + 1} of {len(ids)}" + (", then the doorway" if door else ""), "next cards": [x["name"] for x in car["cards"][k + 1:k + 4]],
                      "doorway": f"{door['count']} MORE {door['windowLabel']}" if door else None, "the moment": at.strftime("%a %b %-d, %-I:%M %p"), "seed": out}, indent=1, ensure_ascii=False))

if __name__ == "__main__":
    main()
