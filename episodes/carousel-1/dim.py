#!/usr/bin/env python3
"""The party room as your eyes saw it: dim, warm, soft, fairy-light glow, nothing lit up. No noise, no blue."""
import sys, numpy as np
from PIL import Image, ImageFilter
im = Image.open(sys.argv[1]).convert('RGB'); a = np.asarray(im).astype(float) / 255
a = a * 0.58; a = a * [1.06, 0.93, 0.80]; a = 0.5 + (a - 0.5) * 0.85 - 0.06
glow = np.asarray(im.filter(ImageFilter.GaussianBlur(30))).astype(float) / 255
a = a + 0.10 * glow * [1.0, 0.7, 0.4]
Image.fromarray((np.clip(a, 0, 1) * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.6)).save(sys.argv[2])
