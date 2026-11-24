#!/usr/bin/env python3
"""Make the 2 am viewfinder (dark, blue, noisy) and the shot as the camera keeps it: on-camera flash (the subject
lit, the room falling off to dark) graded like the app's Snap filter (src/services/shaders.ts, slot 0: soft
shoulder, golden mids, teal shadows, warm halation on true lights, fine grain, light vignette)."""
import sys, numpy as np
from PIL import Image, ImageFilter
src, cx, cy, rx, ry = sys.argv[1], *map(float, sys.argv[2:6])
im = Image.open(src).convert('RGB'); a = np.asarray(im).astype(float) / 255; h, w, _ = a.shape
yy, xx = np.mgrid[0:h, 0:w]; d = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
m = np.clip(1.25 - d, 0, 1); m = np.asarray(Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(40))).astype(float)[..., None] / 255
rng = np.random.default_rng(3); L = lambda c: (c * [0.2126, 0.7152, 0.0722]).sum(2, keepdims=True)
# viewfinder: dark room, phone-camera noise
vf = a * 0.38; vf = vf * [0.85, 0.9, 1.15]; vf += rng.normal(0, 0.035, (h, w, 1)); vf = np.clip(vf, 0, 1)
Image.fromarray((vf * 255).astype('uint8')).save(src.replace('.png', '_dark.png'))
# flash: subject lifted and cooled-white, room drops off
lit = a * (0.20 + 1.0 * m) * (1 + 0.18 * m)
lit = (lit - 0.5) * (1 + 0.15 * m) + 0.5             # flash contrast on the subject
lit = np.where(lit > 0.8, 0.8 + (lit - 0.8) / (1 + (lit - 0.8) * 3), lit)   # soft shoulder
l = L(lit)
lit = lit + (np.array([0.05, 0.03, -0.03]) * np.clip(1 - abs(l - 0.5) * 2, 0, 1))   # golden mids
lit = lit + np.array([-0.03, 0.01, 0.03]) * np.clip(0.35 - l, 0, 1) * 2.5           # teal shadows
hl = np.clip((l - 0.82) / 0.18, 0, 1); hal = np.asarray(Image.fromarray((hl[..., 0] * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(10))).astype(float)[..., None] / 255
lit = lit + hal * np.array([0.18, 0.06, 0.0])          # warm halation round the lights
v = 1 - 0.12 * (((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)[..., None]
lit = lit * v + rng.normal(0, 0.02, (h, w, 1)) * (1 - L(np.clip(lit, 0, 1)))
Image.fromarray((np.clip(lit, 0, 1) * 255).astype('uint8')).save(src.replace('.png', '_flash.png'))
