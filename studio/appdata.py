#!/usr/bin/env python3
"""What studio/card.py and studio/list.py share: running the app's own code on the answer to the app's own question
(app.json, saved by studio/events.py), finding the listing a maker means, and fetching the posters a screen shows."""
import datetime, json, os, re, subprocess, sys, tempfile, urllib.request
from concurrent.futures import ThreadPoolExecutor
from zoneinfo import ZoneInfo
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.environ.get("PXI_APP", os.path.join(os.path.dirname(ROOT), "pxi-mobile-app"))
UA = {"User-Agent": "pxi-studio/1.0"}
web = lambda p: "/" + os.path.relpath(p, ROOT)  # a path the render server understands

def app_code(script, *args, tz=None):
    """Run one of look/app-screens/*.ts against the app's code and return what it prints, as JSON."""
    cfg = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False)
    json.dump({"compilerOptions": {"baseUrl": APP, "paths": {"@/*": ["src/*"]}, "jsx": "react-jsx", "esModuleInterop": True, "allowJs": True}}, cfg); cfg.close()
    r = subprocess.run(["npx", "-y", "tsx", "--tsconfig", cfg.name, os.path.join(ROOT, "look/app-screens", script), *args], cwd=APP, capture_output=True, text=True, env={**os.environ, **({"TZ": tz} if tz else {})})
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

def posters(d, wanted, key="coverUrl", sub="covers"):
    """Fetch the pictures a screen shows (rows with an id and a link under `key`) into covers/, and return {id: file}."""
    os.makedirs(os.path.join(d, sub), exist_ok=True); have = {}
    for f in os.listdir(os.path.join(d, sub)): have[os.path.splitext(f)[0]] = sub + "/" + f
    def one(row):
        k = re.sub(r"[^A-Za-z0-9_-]", "_", row["id"])[:60]
        if k in have: return row["id"], have[k]
        try:
            with urllib.request.urlopen(urllib.request.Request(row[key], headers=UA), timeout=30) as r: img, ctype = r.read(), r.headers.get("Content-Type", "")
            name = sub + "/" + k + "." + ("png" if "png" in ctype else "webp" if "webp" in ctype else "jpg")
            open(os.path.join(d, name), "wb").write(img); return row["id"], name
        except Exception as err:
            print("  picture not fetched:", str(row.get("title") or row.get("name"))[:50], "|", str(err)[:60], file=sys.stderr); return row["id"], None
    with ThreadPoolExecutor(8) as ex: return dict(ex.map(one, [r for r in wanted if r.get(key)]))

