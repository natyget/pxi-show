#!/usr/bin/env python3
"""Finish raw frames from the 3D rig (studio/world3d, 180x320) into plates a scene can show.
Applies the show's finish (colour a little under full, grain that changes every third frame) and writes
f0000.png ... at native size; the scene scales them 6x with hard pixels.
  python3 studio/plates.py <raw_dir> <videos/<slug>/plates/<name>>"""
import glob, os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'world3d', 'tools'))
from nw_finish import finish
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
files = sorted(glob.glob(os.path.join(src, '*.png')))
# The rig sometimes writes a blank frame (all one colour) when the machine is busy. Refuse those: name them so
# they can be rendered again one by one (remotion still ... --frame=N), then run this again.
blank = [i for i, f in enumerate(files) if np.array(Image.open(f).convert('L')).std() < 4]
if blank:
    print('BLANK FRAMES, render these again:', ' '.join(map(str, blank))); sys.exit(1)
for i, f in enumerate(files):
    Image.fromarray(finish(np.array(Image.open(f).convert('RGB')), i)).save(os.path.join(dst, f'f{i:04d}.png'))
print(len(files), 'plates ->', dst)
