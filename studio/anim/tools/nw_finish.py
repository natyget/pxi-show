#!/usr/bin/env python3
"""Nio World finisher. Takes native 270x480 frames and gives the show's finish:
grain at pixel scale (it changes every third frame), the optional glitch button, then a nearest-neighbour upscale.

  nw_finish.py still <in.png> <out.png> [scale=4]
  nw_finish.py seq <in_dir> <out_dir> [--glitch START:END] [--scale 4]
"""
import os, sys
import numpy as np
from PIL import Image

PXI = np.array([165, 35, 239], np.float32)

def grain(a, seed, amount=3.0):
    rng = np.random.default_rng(seed)
    n = rng.normal(0, amount, a.shape[:2])[..., None]
    return np.clip(a + n, 0, 255)

def glitch(a, p, seed):
    """p runs 0..1 over the button. RGB split, slipped slices, then the picture falls apart in blocks."""
    rng = np.random.default_rng(1000 + seed)
    h, w, _ = a.shape
    out = a.copy()
    d = int(1 + 7 * p)
    out[..., 0] = np.roll(a[..., 0], d, axis=1)
    out[..., 2] = np.roll(a[..., 2], -d, axis=1)
    y = 0
    while y < h:
        bh = int(rng.integers(4, 26))
        if rng.random() < 0.25 + 0.5 * p:
            out[y:y + bh] = np.roll(out[y:y + bh], int(rng.integers(-40, 41) * p), axis=1)
        y += bh
    B = 6
    gh, gw = h // B + 1, w // B + 1
    thr = np.random.default_rng(7).random((gh, gw))  # fixed, so blocks that fall stay fallen
    gone = np.kron(thr < (p * 1.25 - 0.2), np.ones((B, B)))[:h, :w].astype(bool)
    edge = np.kron((thr >= (p * 1.25 - 0.2)) & (thr < (p * 1.25 - 0.12)), np.ones((B, B)))[:h, :w].astype(bool)
    out[edge] = PXI
    out[gone] = np.array([14, 10, 18], np.float32)
    return out

def finish(arr, i=0, glitch_p=None):
    a = arr.astype(np.float32)
    if glitch_p is not None:
        a = glitch(a, glitch_p, i)
    return grain(a, i // 3).astype(np.uint8)

def up(im, k):
    return im.resize((im.width * k, im.height * k), Image.NEAREST)

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'still':
        k = int(sys.argv[4]) if len(sys.argv) > 4 else 4
        up(Image.fromarray(finish(np.array(Image.open(sys.argv[2]).convert('RGB')))), k).save(sys.argv[3])
    else:
        src, dst = sys.argv[2], sys.argv[3]
        g0 = g1 = None
        k = 4
        if '--glitch' in sys.argv:
            g0, g1 = map(int, sys.argv[sys.argv.index('--glitch') + 1].split(':'))
        if '--scale' in sys.argv:
            k = int(sys.argv[sys.argv.index('--scale') + 1])
        os.makedirs(dst, exist_ok=True)
        files = sorted(f for f in os.listdir(src) if f.endswith('.png'))
        for i, f in enumerate(files):
            p = None if g0 is None or i < g0 else min(1.0, (i - g0 + 1) / (g1 - g0))
            a = finish(np.array(Image.open(os.path.join(src, f)).convert('RGB')), i, p)
            up(Image.fromarray(a), k).save(os.path.join(dst, '%05d.png' % i))
