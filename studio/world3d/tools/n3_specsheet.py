#!/usr/bin/env python3
"""n3_specsheet.py <specs.json> <out.png> [frame=12] : check a list of shot specs against the world rules, draw one
frame of each and lay them out on one contact sheet with the camera and place written under each."""
import json, subprocess, sys, os, tempfile
from PIL import Image, ImageDraw, ImageFont
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
specs = json.load(open(sys.argv[1])); specs = specs if isinstance(specs, list) else [specs]
out = sys.argv[2]; frame = int(sys.argv[3]) if len(sys.argv) > 3 else 12
subprocess.run([os.path.join(here, 'n3_check.sh'), sys.argv[1]], check=True)
tiles = []
for i, s in enumerate(specs):
    raw = os.path.join(root, 'out', f'_ss{i}.png'); fin = os.path.join(root, 'out', f'_ss{i}f.png')
    subprocess.run(['npx', 'remotion', 'still', 'src/index.ts', 'N3Shot', raw, '--props=' + json.dumps({'spec': s}), f'--frame={min(frame, s["frames"] - 1)}',
                    '--gl=swangle', '--log=error', '--browser-executable=/opt/pw-browsers/chromium'], cwd=root, check=True, stdout=subprocess.DEVNULL)
    subprocess.run(['python3', os.path.join(here, 'nw_finish.py'), 'still', raw, fin, '2'], check=True, stdout=subprocess.DEVNULL)
    a = s['actors'][0]; tiles.append((Image.open(fin).convert('RGB'), f"{s['camera']}: {a['at']}" + (f" to {a['to']}" if a.get('to') else '') + f", {a['action']}"))
w, h = tiles[0][0].size; cols = min(5, len(tiles)); rows = (len(tiles) + cols - 1) // cols; pad = 14; lab = 30
sheet = Image.new('RGB', (cols * (w + pad) + pad, rows * (h + lab + pad) + pad), (24, 18, 21)); d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 17)
except Exception: font = ImageFont.load_default()
for i, (im, t) in enumerate(tiles):
    x = pad + (i % cols) * (w + pad); y = pad + (i // cols) * (h + lab + pad)
    sheet.paste(im, (x, y)); d.text((x, y + h + 6), t, fill=(232, 220, 205), font=font)
sheet.save(out); print(out, sheet.size)
