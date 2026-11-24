#!/usr/bin/env python3
"""The kit for Nio World posts that are not episodes: carousels, stills and loops.

Every post is an object that exists in Nio's world (his cork board, his crayon pages, his phone, a receipt on his
nightstand), drawn in the show's pixels. Nothing is a flat graphic with a cartoon pasted on.

Grids. A feed post is 1080 x 1350. It is built on a 540 x 675 board (two final pixels per board pixel), which is
the grid paper, ink and phone screens are drawn on. The world (Nio, his room) is drawn by the engine at 270 x 338,
four final pixels per pixel, the same as an episode. So paper and screens are twice as fine as the world, exactly as
the phone screens are in an episode.
"""
import math, os, random, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ANIM = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ANIM, 'tools', 'pxi'))
import ui  # noqa: E402  (the PXI screen kit and world())

FONTS = os.path.join(ANIM, 'public', 'pxi-ui', 'fonts')
HAND = {'nio': 'hand/GochiHand-Regular.ttf', 'maya': 'hand/Caveat.ttf', 'print': 'hand/PatrickHand-Regular.ttf',
        'marker': 'hand/PermanentMarker-Regular.ttf', 'till': 'hand/VT323-Regular.ttf', 'pixel': '../PixelifySans.ttf'}

# The show's palette (the v6 room and character sheets)
INK = (29, 21, 24)
CREAM = (232, 220, 196)
PAPER = (226, 214, 190)
CORK = (150, 112, 84)
WOOD = (74, 50, 44)
WOOD_D = (50, 34, 32)
PLUM = (44, 32, 40)
MAUVE = (120, 92, 108)
OLIVE = (93, 112, 62)       # Maya's pen: the green of her jacket
RED = (160, 58, 52)
LAMP = (238, 186, 108)

BW, BH = 540, 675            # the board grid of a feed post
WW, WH = 270, 338            # the world grid of a feed post

def font(key, px):
    return ImageFont.truetype(os.path.join(FONTS, HAND.get(key, key)), px)

def hard(im):
    """Board pixels to final pixels: nearest neighbour, nothing smooth."""
    return im.resize((im.width * 2, im.height * 2), Image.NEAREST)

def world(props, w=WW, h=WH):
    """A picture from the engine at w x h world pixels, already finished (grain, the show's saturation)."""
    return ui.world(props, w, h)

def world_on_board(im):
    """A world picture doubled onto the board grid."""
    return im.resize((im.width * 2, im.height * 2), Image.NEAREST)

def cutout(im, dark=62):
    """Nio out of a studio frame. The engine draws a heavy dark outline around every character, so the backdrop is
    everything joined to the edge of the frame without crossing that line. Pockets of backdrop shut in by his arms
    are found by colour and removed too. Returns RGBA."""
    a = np.asarray(im.convert('RGB')).astype(np.int32)
    lum = a @ np.array([3, 6, 1]) // 10
    h, w = lum.shape
    bg = np.zeros((h, w), bool)
    stack = [(y, x) for x in range(w) for y in (0, h - 1)] + [(y, x) for y in range(h) for x in (0, w - 1)]
    while stack:
        y, x = stack.pop()
        if y < 0 or x < 0 or y >= h or x >= w or bg[y, x] or lum[y, x] < dark: continue
        bg[y, x] = True
        stack += [(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)]
    # backdrop colour, then any shut-in pocket of it bigger than a few pixels
    ref = a[bg].mean(0)
    near = (np.abs(a - ref).sum(-1) < 46) & ~bg
    from collections import deque
    seen = np.zeros_like(near)
    for y in range(h):
        for x in range(w):
            if near[y, x] and not seen[y, x]:
                q = deque([(y, x)]); comp = []; seen[y, x] = True
                while q:
                    cy, cx = q.popleft(); comp.append((cy, cx))
                    for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                        if 0 <= ny < h and 0 <= nx < w and near[ny, nx] and not seen[ny, nx]: seen[ny, nx] = True; q.append((ny, nx))
                if len(comp) > 30:
                    for cy, cx in comp: bg[cy, cx] = True
    out = im.convert('RGBA'); al = np.where(bg, 0, 255).astype(np.uint8)
    out.putalpha(Image.fromarray(al)); return out

def grain(im, seed=0, amount=3.0):
    """The show's grain at board-pixel scale, for things drawn on the board (paper, ink)."""
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    n = np.random.default_rng(seed).normal(0, amount, a.shape[:2])[..., None]
    return Image.fromarray(np.clip(a + n, 0, 255).astype(np.uint8))

def mottle(w, h, base, spread=10, block=3, seed=1):
    """A surface with the blocky, slightly uneven shading of the room (cork, paper, wood), built in, not filtered on."""
    rng = np.random.default_rng(seed)
    gh, gw = h // block + 2, w // block + 2
    n = rng.normal(0, 1, (gh, gw))
    n = np.kron(n, np.ones((block, block)))[:h, :w]
    a = np.array(base, np.float32)[None, None, :] + n[..., None] * spread * np.array([1, 0.85, 0.75])
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

def hand_text(d, xy, text, key, px, fill, anchor='la', spacing=1.0, wobble=0, seed=0):
    """Handwriting set onto the board grid with no smoothing, one letter at a time, each a hair off the line so it
    reads as written, not typed. Returns the x where the line ends."""
    f = font(key, px); x, y = xy; rng = random.Random(seed)
    if anchor[0] == 'm': x -= sum(f.getlength(c) for c in text) * spacing / 2
    if anchor[0] == 'r': x -= sum(f.getlength(c) for c in text) * spacing
    d.fontmode = '1'
    for c in text:
        dy = rng.uniform(-wobble, wobble) if wobble else 0
        d.text((round(x), round(y + dy)), c, font=f, fill=fill, anchor='l' + anchor[1])
        x += f.getlength(c) * spacing
    return x

def text_w(text, key, px, spacing=1.0):
    f = font(key, px); return sum(f.getlength(c) for c in text) * spacing

def wrap(text, key, px, width):
    out, line = [], ''
    for word in text.split(' '):
        t = (line + ' ' + word).strip()
        if text_w(t, key, px) <= width: line = t
        else: out.append(line); line = word
    if line: out.append(line)
    return out

def pin(d, cx, cy, col=RED):
    """A push pin on the board grid."""
    d.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=INK)
    d.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=col)
    d.rectangle([cx - 2, cy - 3, cx - 1, cy - 2], fill=tuple(min(255, c + 70) for c in col))

def tape(im, cx, cy, w=46, h=14, rot=0, col=(214, 200, 160)):
    """A strip of masking tape, slightly see-through, hard edged."""
    t = Image.new('RGBA', (w, h), col + (200,))
    td = ImageDraw.Draw(t)
    for x in range(0, w, 3): td.point((x, 0), fill=(0, 0, 0, 0)); td.point((x + 1, h - 1), fill=(0, 0, 0, 0))
    t = t.rotate(rot, Image.NEAREST, expand=True)
    im.alpha_composite(t, (cx - t.width // 2, cy - t.height // 2)) if im.mode == 'RGBA' else im.paste(t, (cx - t.width // 2, cy - t.height // 2), t)

def paper(w, h, base=PAPER, seed=3, lines=False, holes=False):
    """A sheet of paper on the board grid, with its own uneven tone and a one-pixel dark edge."""
    p = mottle(w, h, base, 5, 2, seed).convert('RGBA')
    d = ImageDraw.Draw(p)
    if lines:
        for y in range(34, h, 22): d.line([(0, y), (w, y)], fill=(176, 186, 200, 255))
        d.line([(36, 0), (36, h)], fill=(196, 128, 120, 255))
    if holes:
        for y in (h * 0.18, h * 0.5, h * 0.82): d.ellipse([10, y - 5, 20, y + 5], fill=(0, 0, 0, 0))
    d.rectangle([0, 0, w - 1, h - 1], outline=(150, 138, 120, 255))
    return p

def drop_shadow(base, layer, x, y, off=(3, 4), alpha=110):
    """A hard shadow under a layer, the pixel way."""
    a = layer.getchannel('A').point(lambda v: alpha if v > 0 else 0)
    sh = Image.new('RGBA', layer.size, (14, 8, 12, 0)); sh.putalpha(a)
    base.alpha_composite(sh, (x + off[0], y + off[1])); base.alpha_composite(layer, (x, y))

def turn(layer, deg):
    """Turn a layer a few degrees with hard pixels."""
    return layer.rotate(deg, Image.NEAREST, expand=True)

def save_post(board, path, seed=0):
    """Board grid to the final file: grain at board scale, then doubled."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    hard(grain(board, seed)).save(path)
    return path
