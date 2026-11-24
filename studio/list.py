#!/usr/bin/env python3
"""The app's All events list for a city, from real listings: writes the seed for look/app-screens/all-events.html.

  python3 studio/list.py <events dir from events.py> [--open "<listing id or words from its title>"] [--when week]
        [--now "2026-11-27 18:30"] [--sort rank] [--expand 2026-11-27 ...] [--clock 6:30] [--out seed-list.json]

This is the screen for a listing the app never shows as a Discover card (one with no song): most of them. The list
is worked out by the app's own code (look/app-screens/list.ts, run against ../pxi-mobile-app, read-only) from the
answer to the app's own question (app.json, saved by events.py): what is over, the nights, the order in a night, the
12 a night shows before "32 more tonight", and every row's price, clock and ticket site.

  --open    the list opens scrolled to this listing. When it is past its night's first 12, the night's "more" row is
            pressed first, as a viewer would; the tool says so.
  --when    what the filter bar's When says: week (the app's own start, tonight to Sunday), tonight, tomorrow,
            weekend, or one night as YYYY-MM-DD.
  --now     the moment in the story, in the city's own time: it decides "Tonight" and which listings are over.
            Left out: the moment the listings were fetched.
  --sort    rank ("Best for you", the app's start), soonest or cheapest. (Nearest needs the viewer's position.)

The posters of the rows on the list are fetched into the folder's covers/ (never committed). Run the same command
again after a fresh clone to fetch them again. Then:
  node studio/screen.cjs look/app-screens/all-events.html <seed> out.png      (a still to look at)"""
import argparse, datetime, json, os, re, subprocess, sys, tempfile, urllib.request
from concurrent.futures import ThreadPoolExecutor
from zoneinfo import ZoneInfo
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.environ.get("PXI_APP", os.path.join(os.path.dirname(ROOT), "pxi-mobile-app"))
UA = {"User-Agent": "pxi-studio/1.0"}
VIEW_H = 844 - 223  # the list's window on a 390x844 phone: from 8 under the view switch to the bottom of the screen
TAB_BAR = 98        # the room the app leaves under the last row for the floating tab bar

def app_code(script, *args):
    """Run one of look/app-screens/*.ts against the app's code and return what it prints, as JSON."""
    cfg = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False)
    json.dump({"compilerOptions": {"baseUrl": APP, "paths": {"@/*": ["src/*"]}, "jsx": "react-jsx", "esModuleInterop": True, "allowJs": True}}, cfg); cfg.close()
    r = subprocess.run(["npx", "-y", "tsx", "--tsconfig", cfg.name, os.path.join(ROOT, "look/app-screens", script), *args], cwd=APP, capture_output=True, text=True)
    os.unlink(cfg.name)
    if r.returncode: sys.exit("the app's code would not run (is pxi-mobile-app cloned beside this repo, or PXI_APP set?):\n" + r.stderr[-800:])
    return json.loads(r.stdout)

def load_app(d):
    p = os.path.join(d, "app.json")
    if not os.path.exists(p): sys.exit(f"no app.json in {d}: fetch the listings again with studio/events.py (it saves the app's own answer now)")
    app = json.load(open(p))
    if app.get("pxiEvents"): sys.exit(f"REFUSED: {app['pxiEvents']} PXI events are public in this city. The app lists them first in each night as a record sleeve, "
                                      "a row these screens do not draw yet (look/app-screens/README.md): build it from AllEventsRows.tsx (PxiRow) before showing this list.")
    return p, app

def the_moment(app, now):
    """The moment in the story as an instant, and the city's zone."""
    tz = ZoneInfo((app.get("city") or {}).get("timeZone") or "America/New_York")
    if now: at = datetime.datetime.fromisoformat(now.replace(" ", "T")).replace(tzinfo=tz)
    else: at = datetime.datetime.fromisoformat(app["asked"].replace("Z", "+00:00")).astimezone(tz)
    return at, tz

def find(app, q, at):
    """The listing a maker means: an id, or words from its title. Never picks in silence between two."""
    rows = app.get("events") or []
    hit = [e for e in rows if e["id"] == q] or [e for e in rows if all(w.lower() in e["title"].lower() for w in q.split())]
    hit = [e for e in hit if datetime.datetime.fromisoformat(e["startsAt"].replace("Z", "+00:00")) >= at] or hit
    if not hit: sys.exit(f"no listing matches {q!r} in the app's answer (app.json). The list holds seven nights from the day it was fetched.")
    hit.sort(key=lambda e: (e["night"], -(e.get("rank") or 0)))
    if len(hit) > 1:
        print(f"{len(hit)} listings match {q!r}; took the first. For another, pass its id:", file=sys.stderr)
        for e in hit[:12]: print(f"   {e['night']}  {e['title'][:60]}  id {e['id']}", file=sys.stderr)
    return hit[0]

def posters(d, wanted):
    """Fetch the posters the screen shows into covers/, and return {listing id: file}."""
    os.makedirs(os.path.join(d, "covers"), exist_ok=True); have = {}
    for f in os.listdir(os.path.join(d, "covers")): have[os.path.splitext(f)[0]] = "covers/" + f
    def one(row):
        key = re.sub(r"[^A-Za-z0-9_-]", "_", row["id"])[:60]
        if key in have: return row["id"], have[key]
        try:
            with urllib.request.urlopen(urllib.request.Request(row["coverUrl"], headers=UA), timeout=30) as r: img, ctype = r.read(), r.headers.get("Content-Type", "")
            name = "covers/" + key + "." + ("png" if "png" in ctype else "webp" if "webp" in ctype else "jpg")
            open(os.path.join(d, name), "wb").write(img); return row["id"], name
        except Exception as err:
            print("  poster not fetched:", row["title"][:50], "|", str(err)[:60], file=sys.stderr); return row["id"], None
    with ThreadPoolExecutor(8) as ex: return dict(ex.map(one, [r for r in wanted if r.get("coverUrl")]))

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("dir"); ap.add_argument("--open"); ap.add_argument("--when", default="week"); ap.add_argument("--now"); ap.add_argument("--sort", default="rank", choices=["rank", "soonest", "cheapest"])
    ap.add_argument("--expand", nargs="*", default=[]); ap.add_argument("--clock"); ap.add_argument("--out")
    a = ap.parse_args()
    d = os.path.abspath(a.dir); p, app = load_app(d); at, tz = the_moment(app, a.now)
    when = a.when if a.when in ("week", "tonight", "tomorrow", "weekend") else "night:" + a.when
    pick = find(app, a.open, at) if a.open else None
    opts = {"now": at.astimezone(datetime.timezone.utc).isoformat(), "when": when, "sort": a.sort, "expand": a.expand, "open": pick["id"] if pick else None}
    lst = app_code("list.ts", p, json.dumps(opts))
    if pick and lst["openNote"]: sys.exit(f"REFUSED: \"{pick['title']}\" is not on this list: {lst['openNote']}. Change --when or --now, or pick a listing the list holds.")
    if not lst["sections"]: sys.exit(f"the app would say \"Nothing listed in {lst['city']} ...\" here: no listing falls in this When at this moment")
    rows = [r for s in lst["sections"] for r in s["rows"] if r["kind"] == "listing"]
    got = posters(d, rows); web = lambda f: "/" + os.path.relpath(os.path.join(d, f), ROOT)
    for r in rows:
        f = got.get(r["id"]); r["cover"] = web(f) if f else None
        if r.pop("coverUrl", None) and not f: print(f"  \"{r['title'][:50]}\" will show an empty flyer: its poster could not be fetched", file=sys.stderr)
    top = max(0, lst["height"] + TAB_BAR - VIEW_H)  # how far the list scrolls
    # Open on a listing: one row stays above it, under its night's pinned header.
    y = min(top, max(0, lst["open"]["top"] - 56 - 96)) if lst.get("open") else 0
    seed = {"clock": a.clock or at.strftime("%-I:%M"), "when": lst["whenLabel"], "city": lst["city"], "me": "assets/me-nio.png", "sortDotted": a.sort != "rank",
            "scrollY": y, "maxScroll": top, "open": (lst["open"] or {}).get("id"), "height": lst["height"], "sections": lst["sections"]}
    out = a.out or os.path.join(d, "seed-list.json")
    json.dump(seed, open(out, "w"), indent=1, ensure_ascii=False)
    note = {"city": lst["city"], "the moment": at.strftime("%a %b %-d, %-I:%M %p"), "when": lst["whenLabel"], "events on the list": lst["total"],
            "nights": [f"{s['title']} {s['count']}" for s in lst["sections"]], "seed": out}
    if pick:
        o = lst["open"]; sec = next(s for s in lst["sections"] if s["night"] == o["night"]); row = next(r for r in sec["rows"] if r.get("id") == o["id"])
        note["opens on"] = {"listing": pick["title"], "night": sec["title"], "row": f"{row['time']}, {row['venue']}, {row['price'] or 'no price given'}, {row['tag']}",
                            "ticket page": pick.get("ticketUrl"), "scrollY": y}
        if o["pressedMore"]: note["opens on"]["note"] = f"past the night's first 12: the list is shown after \"more\" was pressed for {sec['title']}"
    print(json.dumps(note, indent=1, ensure_ascii=False))

if __name__ == "__main__":
    main()
