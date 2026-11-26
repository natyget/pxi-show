#!/usr/bin/env python3
"""A whole carousel from one spec: the intro, one Discover card per pick, the app's map, in both sizes.
  python3 studio/carousel.py <folder>/carousel.json
The spec (growth.md, "Weekend carousel"):
  {"events": "videos/<slug>/events/la", "now": "2026-11-26 16:00", "tz": "America/Los_Angeles",
   "intro": "tryna find things to do in [LA this Thanksgiving]?",
   "picks": [{"match": "JERK HOLLYWOOD", "line": "JERK HOLLYWOOD at Taste of The Caribbean, tonight 5 PM, [free]"}, ...],
   "map": {"nights": "2026-11-26..2026-11-29", "line": "every event in [LA], in one place"}}
Writes <folder>/tiktok/1.jpg.. (1080x1920) and <folder>/ig/1.jpg.. (1080x1350), the screens and seeds, and
<folder>/sheet.jpg (every slide small, to look at every frame before the fresh reviewer does).
A pick must be a card the app draws (card.py refuses one without a song). Look at every card's edges: the
neighbouring cards peek in, and what they show is in the post too."""
import json, os, subprocess, sys
from PIL import Image
spec_path = sys.argv[1]; d = os.path.dirname(spec_path); s = json.load(open(spec_path))
run = lambda *a: subprocess.run(a, check=True, stdout=subprocess.DEVNULL)
os.makedirs(f"{d}/screens", exist_ok=True)
for i, p in enumerate(s["picks"], 1):
    run("python3", "studio/card.py", s["events"], p["match"], "--now", s["now"], "--out", f"{d}/screens/seed-{i}.json")
    run("node", "studio/screen.cjs", "look/app-screens/discover.html", f"{d}/screens/seed-{i}.json", f"{d}/screens/{i}.png")
n = len(s["picks"]) + 2
for size, sub in (("1080x1920", "tiktok"), ("1080x1350", "ig")):
    o = f"{d}/{sub}"; os.makedirs(o, exist_ok=True)
    for f in os.listdir(o):
        if f.endswith(".jpg"): os.remove(f"{o}/{f}")
    run("node", "studio/slide.cjs", "intro", s["intro"], f"{o}/1.jpg", "--size", size)
    for i, p in enumerate(s["picks"], 1):
        run("node", "studio/still.cjs", f"{d}/screens/{i}.png", p["line"], f"{o}/{i + 1}.jpg", "--size", size)
    run("node", "studio/map.cjs", os.path.join(s["events"], "app.json"), s["map"]["nights"], s["map"]["line"], f"{o}/{n}.jpg",
        "--size", size, "--tz", s.get("tz", "America/Los_Angeles"))
ims = [Image.open(f"{d}/ig/{i}.jpg").resize((270, 338)) for i in range(1, n + 1)]
cols = 5; sheet = Image.new("RGB", (cols * 274, ((n + cols - 1) // cols) * 342), (70, 70, 70))
for i, im in enumerate(ims): sheet.paste(im, ((i % cols) * 274, (i // cols) * 342))
sheet.save(f"{d}/sheet.jpg", quality=85)
print(f"{n} slides -> {d}/tiktok, {d}/ig, {d}/sheet.jpg")
