#!/usr/bin/env python3
"""Contact sheets of a scene: a still every 1.25 s with its time, to look at as the viewer and to give the stranger.

  python3 studio/sheet.py videos/<slug>                  -> contact-sheet.jpg (and contact-sheet-2.jpg past 24 stills)
  python3 studio/sheet.py videos/<slug> --every 0.5 --from 8 --to 14      a closer look at one part
  python3 studio/sheet.py videos/<slug> --times 1,3.5,6.5 --out look.jpg  chosen moments

The length comes from the voice (words.json). Stills are the finished picture: art and captions together."""
import argparse, json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument("folder"); ap.add_argument("--every", type=float, default=1.25); ap.add_argument("--from", dest="a", type=float, default=0.25)
ap.add_argument("--to", type=float); ap.add_argument("--times"); ap.add_argument("--out"); a = ap.parse_args()
d = os.path.abspath(a.folder); scene = os.path.relpath(os.path.join(d, "scene.html"), ROOT)
if a.times: times = [float(x) for x in a.times.split(",")]
else:
    end = a.to or json.load(open(os.path.join(d, "words.json")))["duration"] + 0.4
    times = []; t = a.a
    while t < end: times.append(round(t, 2)); t += a.every
tmp = tempfile.mkdtemp(prefix="sheet_")
env = dict(os.environ, NODE_PATH=subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip())
r = subprocess.run(["node", "studio/render.cjs", scene, "nio", "all", tmp, ",".join(f"{t:.2f}" for t in times)], cwd=ROOT, env=env, capture_output=True, text=True)
if r.returncode or "PAGEERR" in r.stdout + r.stderr: sys.exit((r.stdout + r.stderr).strip() or "the scene did not render")
COLS, TW, TH, LAB, PER = 6, 270, 480, 22, 24
pages = [times[i:i + PER] for i in range(0, len(times), PER)]
for n, page in enumerate(pages):
    rows = -(-len(page) // COLS); sheet = Image.new("RGB", (min(COLS, len(page)) * TW, rows * (TH + LAB)), "#ffffff"); dr = ImageDraw.Draw(sheet)
    for k, t in enumerate(page):
        x, y = (k % COLS) * TW, (k // COLS) * (TH + LAB)
        sheet.paste(Image.open(os.path.join(tmp, f"t{t:.2f}.png")).convert("RGB").resize((TW, TH), Image.LANCZOS), (x, y + LAB)); dr.text((x + 6, y + 5), f"{t:.2f} s", fill="#000000")
    out = a.out if a.out and len(pages) == 1 else os.path.join(d, "contact-sheet.jpg" if n == 0 else f"contact-sheet-{n + 1}.jpg")
    sheet.save(out, quality=86); print(len(page), "stills ->", os.path.relpath(out, ROOT))
