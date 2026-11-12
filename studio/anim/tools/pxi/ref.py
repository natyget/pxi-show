#!/usr/bin/env python3
"""ref.py <name> : cut one phone screen out of an App Store image, square it up, and save it at the show's phone-screen
size (360 x 780) plus a zoomed copy with a ruler, for measuring. The store images are only a reference to check
against (the app's code is the source); they are read from the website repo and never copied into this one."""
import sys, os
from PIL import Image, ImageDraw
STORE = '/home/user/pxispace.com/.claude/skills/social-content-engine/examples/pxi/app-store-2.3.2/'
# the four corners of the screen in each store image: top-left, top-right, bottom-right, bottom-left
QUADS = {
    'thread': ('07-keep-the-night-talking.jpg', [(196, 815), (1090, 815), (1090, 2752.6), (196, 2752.6)]),
    'gallery': ('03-relive-the-moment.jpg', [(412.3, 924.6), (1223, 966.5), (1119.3, 2716.8), (308.6, 2674.9)]),
    # these two run off the bottom of their pictures, and the app has moved on since (see screens.py): rough corners
    'discover': ('02-find-your-next-night.jpg', [(86, 900), (994, 900), (996, 2752), (128, 2752)]),
    'camera': ('01-never-lose-the-night.jpg', [(236, 1190), (1046, 1190), (1046, 2945), (236, 2945)]),
    'passport': ('06-every-night-stamped.jpg', [(164, 163), (1049, 133), (1133, 2029), (233, 2067)]),
}
W, H = 360, 780
def rectify(name, scale=1):
    f, q = QUADS[name]; im = Image.open(STORE + f).convert('RGB')
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = q
    return im.transform((W * scale, H * scale), Image.QUAD, (x0, y0, x3, y3, x2, y2, x1, y1), Image.BICUBIC)
def ruler(im, z):
    d = ImageDraw.Draw(im)
    for x in range(0, W, 10):
        d.line([(x * z, 0), (x * z, im.height)], fill=(0, 255, 255) if x % 50 == 0 else (60, 90, 90), width=1)
        if x % 50 == 0: d.text((x * z + 2, 2), str(x), fill=(255, 255, 0))
    return im
if __name__ == '__main__':
    name = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), '..', '..', 'out', 'pxi')
    rectify(name).save(os.path.join(out, f'ref_{name}.png'))
    z = 3; big = rectify(name, z); d = ImageDraw.Draw(big)
    for y in range(0, H, 10):
        d.line([(0, y * z), (big.width, y * z)], fill=(0, 255, 255) if y % 50 == 0 else (60, 90, 90), width=1)
        if y % 50 == 0: d.text((2, y * z + 2), str(y), fill=(255, 255, 0))
    ruler(big, z)
    n = 3; hh = big.height // n
    for i in range(n): big.crop((0, i * hh, big.width, (i + 1) * hh)).save(os.path.join(out, f'ref_{name}_z{i}.png'))
