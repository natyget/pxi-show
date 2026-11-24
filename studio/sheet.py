#!/usr/bin/env python3
"""Contact sheets of a scene, to look at as the viewer and to give the stranger.

  python3 studio/sheet.py videos/<slug>                  -> contact-sheet.jpg (and contact-sheet-2.jpg past 24 stills)
  python3 studio/sheet.py videos/<slug> --every 0.5 --from 8 --to 14      a closer look at one part
  python3 studio/sheet.py videos/<slug> --times 1,3.5,6.5 --out look.jpg  chosen moments

With no options it looks at the scene four times a second and keeps: the first three seconds whole (the hook is
judged there), a still right after every cut, and at least one every 1.25 s, so a beat of one second is never
missed. A still marked "cut" is the first after the picture changed. It stops with an error when the picture is
blank (a scene that draws only captions passes every other check). The length comes from the voice (words.json)."""
import argparse, json, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument("folder"); ap.add_argument("--every", type=float); ap.add_argument("--from", dest="a", type=float, default=0.25)
ap.add_argument("--to", type=float); ap.add_argument("--times"); ap.add_argument("--out"); a = ap.parse_args()
d = os.path.abspath(a.folder); scene = os.path.relpath(os.path.join(d, "scene.html"), ROOT)
end = a.to or json.load(open(os.path.join(d, "words.json")))["duration"] + 0.4
def span(t, step):
    out = []
    while t < end: out.append(round(t, 2)); t += step
    return out
auto = not a.times and not a.every
times = [float(x) for x in a.times.split(",")] if a.times else span(a.a, a.every) if a.every else span(0.0, 0.25)
tmp = tempfile.mkdtemp(prefix="sheet_")
env = dict(os.environ, NODE_PATH=subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip())
r = subprocess.run(["node", "studio/render.cjs", scene, "nio", "all", tmp, ",".join(f"{t:.2f}" for t in times)], cwd=ROOT, env=env, capture_output=True, text=True)
if r.returncode or "PAGEERR" in r.stdout + r.stderr: sys.exit((r.stdout + r.stderr).strip() or "the scene did not render")
still = lambda t: os.path.join(tmp, f"t{t:.2f}.png")
cuts = set()
if auto:
    small = [np.asarray(Image.open(still(t)).convert("L").resize((54, 96)), dtype=np.float32) for t in times]
    blank = sum(1 for s in small if s[:53].std() < 3)  # the top of the frame, above the captions
    if blank > len(small) // 2: sys.exit(f"the picture is blank in {blank} of {len(small)} stills: the scene draws its captions but not its art")
    keep, last = [], -9.0
    for i, t in enumerate(times):
        cut = i > 0 and float(np.abs(small[i] - small[i - 1]).mean()) > 22
        if cut: cuts.add(t)
        if t <= 3.0 or cut or t - last >= 1.25: keep.append(t); last = t
    times = keep
COLS, TW, TH, LAB, PER = 6, 270, 480, 22, 24
pages = [times[i:i + PER] for i in range(0, len(times), PER)]
for n, page in enumerate(pages):
    rows = -(-len(page) // COLS); sheet = Image.new("RGB", (min(COLS, len(page)) * TW, rows * (TH + LAB)), "#ffffff"); dr = ImageDraw.Draw(sheet)
    for k, t in enumerate(page):
        x, y = (k % COLS) * TW, (k // COLS) * (TH + LAB)
        sheet.paste(Image.open(still(t)).convert("RGB").resize((TW, TH), Image.LANCZOS), (x, y + LAB))
        dr.text((x + 6, y + 5), f"{t:.2f} s" + ("   cut" if t in cuts else ""), fill="#000000")
    base = a.out or os.path.join(d, "contact-sheet.jpg"); out = base if n == 0 else f"{os.path.splitext(base)[0]}-{n + 1}.jpg"
    sheet.save(out, quality=86); print(len(page), "stills ->", os.path.relpath(out, ROOT))
if auto: print(len(cuts), "cuts in", round(end, 1), "s; the longest stretch with no cut:", max((b - a for a, b in zip([0.0] + sorted(cuts), sorted(cuts) + [end])), default=end), "s")
