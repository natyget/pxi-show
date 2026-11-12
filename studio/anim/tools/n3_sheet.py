#!/usr/bin/env python3
"""n3_sheet.py out.png '<json>' '<json>' ... : render several N3Still frames and put them side by side."""
import subprocess, sys, os
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__))
out, jobs = sys.argv[1], sys.argv[2:]
ims = []
for i, j in enumerate(jobs):
    f = os.path.join(here, '..', 'out', f'_sheet{i}.png')
    subprocess.run([os.path.join(here, 'n3_still.sh'), f, j, '2'], check=True)
    ims.append(Image.open(f).convert('RGB'))
w, h = ims[0].size
cols = min(len(ims), 4); rows = (len(ims) + cols - 1) // cols
o = Image.new('RGB', (w * cols, h * rows))
for i, im in enumerate(ims): o.paste(im, ((i % cols) * w, (i // cols) * h))
o.save(out)
