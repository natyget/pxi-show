#!/usr/bin/env python3
"""Render one character shot with the 3D rig and turn it into plates, checking every frame.
  python3 studio/shot.py videos/<slug>/shots/<name>.json videos/<slug>/plates/<name>
The rig can lose its graphics context when the machine is busy and write blank frames (all black or all white).
This renders the shot, finds blank frames, renders only those again (up to three passes), and refuses to finish
while any are left. Run one shot at a time, with no other render going."""
import glob, json, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.abspath(__file__)); RIG = os.path.join(ROOT, 'world3d')
spec_path, dst = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
spec = json.load(open(spec_path)); n = spec['frames']
raw = sys.argv[3] if len(sys.argv) > 3 else tempfile.mkdtemp(prefix='shot_')
os.makedirs(raw, exist_ok=True)
def render(frames=None):
    cmd = ['npx', 'remotion', 'render', 'src/index.ts', 'N3Shot', raw, '--sequence', '--image-format=png', '--props=' + json.dumps({'spec': spec}),
           '--gl=swangle', '--log=error', '--concurrency=2', '--timeout=240000', '--browser-executable=/opt/pw-browsers/chromium']
    if frames: cmd.append(f'--frames={frames[0]}-{frames[1]}')
    subprocess.run(cmd, cwd=RIG, check=True)
def frame_file(i):
    # a re-rendered range can be written with different zero padding: take the newest file with this frame number
    m = [f for f in glob.glob(os.path.join(raw, 'element-*.png')) if int(os.path.basename(f)[8:-4]) == i]
    return max(m, key=os.path.getmtime) if m else None
def blanks():
    out = []
    for i in range(n):
        f = frame_file(i)
        if not f or np.array(Image.open(f).convert('L')).std() < 4: out.append(i)
    return out
def runs(xs):
    r = []
    for x in xs:
        if r and x == r[-1][1] + 1: r[-1][1] = x
        else: r.append([x, x])
    return r
if not blanks() == []: 
    if not glob.glob(os.path.join(raw, '*.png')): render()
for attempt in range(3):
    bad = blanks()
    if not bad: break
    print('pass', attempt + 1, 'blank or missing frames:', runs(bad))
    for a, b in runs(bad): render((a, b))
bad = blanks()
if bad: print('STILL BLANK:', runs(bad)); sys.exit(1)
sys.path.insert(0, os.path.join(RIG, 'tools'))
from nw_finish import finish
os.makedirs(dst, exist_ok=True)
for old in glob.glob(os.path.join(dst, 'f[0-9][0-9][0-9][0-9].png')): os.remove(old)
for i in range(n): Image.fromarray(finish(np.array(Image.open(frame_file(i)).convert('RGB')), i)).save(os.path.join(dst, f'f{i:04d}.png'))
print(n, 'clean plates ->', dst)
