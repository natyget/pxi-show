#!/usr/bin/env python3
"""CRAYON, in Nio's world: nobody sent him the photos from Saturday, so he drew the night himself, in crayon, on
printer paper. He is good at drawing; these are bad on purpose, because the bit is funnier that way. Five slides:
him, him dancing, everyone filming, the page of photos he was sent (empty), then his phone: PXI found them.

  crayon.py <out_dir>
"""
import math, os, random, sys
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit import *

# ---- the words (in the format spec's screen text list)
P1 = ('saturday', 'from memory'); P1_LABEL = 'me'; P1_LABEL2 = 'the life of it'
P2 = 'me dancing'; P2_LABEL = 'everyone else'
P3 = 'everyone taking pics'; P3_LABEL = 'me somewhere'
P4 = 'pics of me i got sent:'
P5 = 'ok never mind'

C_BROWN, C_PURPLE, C_BLACK, C_SKIN = (112, 70, 44), (118, 84, 140), (40, 34, 40), (214, 160, 120)
C_YELLOW, C_RED, C_BLUE, C_GREEN = (236, 196, 70), (196, 70, 62), (70, 104, 168), (96, 140, 70)


class Page:
    """A sheet of printer paper on the board grid with a crayon that skips over the paper's tooth."""
    def __init__(s, seed):
        s.r = random.Random(seed)
        s.im = mottle(BW, BH, (238, 232, 218), 4, 2, seed).convert('RGB')
        s.tooth = np.random.default_rng(seed).random((BH, BW))
        s.px = s.im.load()

    def dab(s, x, y, rad, col, density=0.78):
        for yy in range(int(y - rad), int(y + rad) + 1):
            for xx in range(int(x - rad), int(x + rad) + 1):
                if 0 <= xx < BW and 0 <= yy < BH and (xx - x) ** 2 + (yy - y) ** 2 <= rad * rad and s.tooth[yy, xx] < density:
                    s.px[xx, yy] = col

    def stroke(s, pts, col, w=3, jitter=0.8):
        """A crayon line through points, a little wobbly, pressure fading at both ends."""
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = max(1, int(math.hypot(x1 - x0, y1 - y0)))
            for i in range(n):
                t = i / n; x = x0 + (x1 - x0) * t + s.r.uniform(-jitter, jitter); y = y0 + (y1 - y0) * t + s.r.uniform(-jitter, jitter)
                s.dab(x, y, w / 2, col)

    def loop(s, cx, cy, rx, ry, col, w=3, turns=1.08, a0=None):
        a0 = s.r.uniform(0, 6.28) if a0 is None else a0
        pts = [(cx + rx * math.cos(a0 + t / 40 * 6.283 * turns) * s.r.uniform(.96, 1.04), cy + ry * math.sin(a0 + t / 40 * 6.283 * turns) * s.r.uniform(.96, 1.04)) for t in range(41)]
        s.stroke(pts, col, w)

    def fill(s, poly, col, gap=4, w=3, angle=0.6):
        """Scribble fill, back and forth, the way a crayon fills a shape, a bit outside the lines."""
        m = Image.new('L', (BW, BH), 0); ImageDraw.Draw(m).polygon(poly, fill=255); mp = m.load()
        xs, ys = [p[0] for p in poly], [p[1] for p in poly]
        ca, sa = math.cos(angle), math.sin(angle)
        for k, off in enumerate(range(-BW, BW + BH, gap)):
            pts = []
            for t in range(-BH, BW + BH, 2):
                x = off + t * ca; y = t * sa + (min(ys) if False else 0)
                x, y = off + t * ca * 0.3, t
                x = int(off * 1 + t * 0.55); y = int(t)
                if 0 <= x < BW and 0 <= y < BH and mp[x, y] and min(xs) - 2 <= x <= max(xs) + 2:
                    pts.append((x, y))
                elif pts:
                    if len(pts) > 1: s.stroke(pts[::3] + [pts[-1]], col, w, 1.3)
                    pts = []
            if len(pts) > 1: s.stroke(pts[::3] + [pts[-1]], col, w, 1.3)

    def write(s, xy, t, px, col, key='marker', anchor='lm', rot=0):
        """Crayon lettering: the letters set in a hand, then only where the crayon catches the paper."""
        f = font(key, px); w = int(text_w(t, key, px)) + 20
        m = Image.new('L', (w, px * 2), 0); ImageDraw.Draw(m).text((10, px), t, font=f, fill=255, anchor='lm')
        if rot: m = m.rotate(rot, Image.NEAREST, expand=True)
        x0 = xy[0] - (m.width // 2 if anchor[0] == 'm' else 10); y0 = xy[1] - m.height // 2
        mp = m.load()
        for yy in range(m.height):
            for xx in range(m.width):
                X, Y = x0 + xx, y0 + yy
                if mp[xx, yy] > 100 and 0 <= X < BW and 0 <= Y < BH and s.tooth[Y, X] < 0.82: s.px[X, Y] = col

    def arrow(s, a, b, col):
        s.stroke([a, ((a[0] + b[0]) / 2 + 12, (a[1] + b[1]) / 2 - 10), b], col, 3)
        ang = math.atan2(b[1] - a[1], b[0] - a[0])
        for d in (2.6, -2.6):
            s.stroke([b, (b[0] + 16 * math.cos(ang + d), b[1] + 16 * math.sin(ang + d))], col, 3)

    def nio(s, cx, cy, k=1.0, arms='down'):
        """Nio, in crayon: the curly brown hair, the big square eyes, the purple tee, the wide black trousers."""
        r = 34 * k
        s.fill([(cx - 28 * k, cy + r), (cx + 28 * k, cy + r), (cx + 40 * k, cy + r + 110 * k), (cx - 40 * k, cy + r + 110 * k)], C_PURPLE, 5)
        s.stroke([(cx - 28 * k, cy + r), (cx - 40 * k, cy + r + 110 * k), (cx + 40 * k, cy + r + 110 * k), (cx + 28 * k, cy + r)], C_BLACK, 3)
        s.fill([(cx - 38 * k, cy + r + 110 * k), (cx + 38 * k, cy + r + 110 * k), (cx + 46 * k, cy + r + 220 * k), (cx - 46 * k, cy + r + 220 * k)], C_BLACK, 4)
        if arms == 'down':
            for sx in (-1, 1): s.stroke([(cx + sx * 30 * k, cy + r + 10 * k), (cx + sx * 52 * k, cy + r + 70 * k), (cx + sx * 50 * k, cy + r + 110 * k)], C_SKIN, 6)
        else:
            for sx in (-1, 1): s.stroke([(cx + sx * 30 * k, cy + r + 10 * k), (cx + sx * 64 * k, cy + r - 30 * k), (cx + sx * 70 * k, cy + r - 80 * k)], C_SKIN, 6)
        s.loop(cx, cy, r, r * 1.05, C_BLACK, 3)
        s.fill([(cx + r * math.cos(a / 10 * 6.283), cy + r * math.sin(a / 10 * 6.283)) for a in range(10)], C_SKIN, 5)
        for ring, (rr, n) in enumerate(((r + 8 * k, 22), (r + 22 * k, 26))):  # the hair: a big mop of loops
            for i in range(n):
                a = math.pi * 0.92 + i / (n - 1) * math.pi * 1.16
                s.loop(cx + rr * math.cos(a) * 1.12, cy + rr * math.sin(a) * 0.95 - 10 * k, 13 * k, 12 * k, C_BROWN, 4)
        for sx in (-1, 1):  # the eyes: squares with heavy lines, pupils off to one side
            ex = cx + sx * 15 * k
            s.stroke([(ex - 10 * k, cy - 6 * k), (ex + 10 * k, cy - 6 * k), (ex + 10 * k, cy + 12 * k), (ex - 10 * k, cy + 12 * k), (ex - 10 * k, cy - 6 * k)], C_BLACK, 3)
            s.dab(ex + 4 * k, cy + 4 * k, 4 * k, C_BLACK, 0.95)
        s.stroke([(cx - 8 * k, cy + 22 * k), (cx, cy + 26 * k), (cx + 9 * k, cy + 21 * k)], C_BLACK, 2)

    def stick(s, cx, cy, k, col, phone=True):
        """Someone else: a stick figure, holding a phone up, with a flash going off."""
        s.loop(cx, cy, 12 * k, 13 * k, col, 3)
        s.stroke([(cx, cy + 13 * k), (cx, cy + 60 * k)], col, 3)
        s.stroke([(cx - 16 * k, cy + 100 * k), (cx, cy + 60 * k), (cx + 16 * k, cy + 100 * k)], col, 3)
        s.stroke([(cx, cy + 26 * k), (cx + 22 * k, cy + 8 * k)], col, 3); s.stroke([(cx, cy + 26 * k), (cx - 18 * k, cy + 44 * k)], col, 3)
        if phone:
            px, py = cx + 26 * k, cy + 2 * k
            s.fill([(px - 6 * k, py - 12 * k), (px + 6 * k, py - 12 * k), (px + 6 * k, py + 8 * k), (px - 6 * k, py + 8 * k)], C_BLACK, 2, 2)
            for a in range(8):
                ang = a / 8 * 6.283; s.stroke([(px + 12 * k * math.cos(ang), py - 18 * k + 12 * k * math.sin(ang)), (px + 22 * k * math.cos(ang), py - 18 * k + 22 * k * math.sin(ang))], C_YELLOW, 3)

    def star(s, cx, cy, rad, col):
        pts = [(cx + rad * (1 if i % 2 == 0 else .45) * math.cos(-math.pi / 2 + i * math.pi / 5), cy + rad * (1 if i % 2 == 0 else .45) * math.sin(-math.pi / 2 + i * math.pi / 5)) for i in range(11)]
        s.stroke(pts, col, 3)


def on_desk(page, seed, extra=None):
    """The page lying on his desk, a little crooked, with the desk's wood round it."""
    im = mottle(BW, BH, (88, 58, 46), 8, 3, seed).convert('RGBA'); d = ImageDraw.Draw(im)
    for y in range(0, BH, 34): d.line([(0, y), (BW, y + 6)], fill=(66, 42, 36), width=2)
    pg = page.im.resize((BW - 56, BH - 70), Image.NEAREST).convert('RGBA')
    ImageDraw.Draw(pg).rectangle([0, 0, pg.width - 1, pg.height - 1], outline=(176, 166, 150))
    drop_shadow(im, turn(pg, page.r.uniform(-2, 2)), 22, 26, (4, 6), 130)
    if extra: extra(im)
    return im


def make(out):
    os.makedirs(out, exist_ok=True); files = []
    p = Page(1); p.write((70, 70), P1[0], 46, C_BLUE); p.write((80, 120), P1[1], 30, C_BLUE, 'nio')
    p.nio(270, 270, 1.15)
    for (x, y, rr, c) in ((110, 250, 18, C_YELLOW), (440, 220, 22, C_YELLOW), (420, 420, 14, C_RED), (120, 470, 16, C_GREEN), (470, 330, 10, C_BLUE)): p.star(x, y, rr, c)
    p.arrow((430, 560), (340, 470), C_RED); p.write((330, 600), P1_LABEL2, 36, C_RED, 'nio')
    p.write((140, 380), P1_LABEL, 34, C_RED, 'marker'); files.append(save_post(on_desk(p, 1).convert('RGB'), os.path.join(out, '01.png'), 1))

    p = Page(2); p.write((60, 70), P2, 44, C_BLUE)
    p.nio(270, 250, 1.0, arms='up')
    for sx in (-1, 1):
        for i in range(3): p.stroke([(270 + sx * (90 + i * 14), 220 + i * 26), (270 + sx * (112 + i * 14), 214 + i * 26)], C_BLACK, 2)
    for i, x in enumerate((70, 150, 400, 480)): p.stick(x, 470 + (i % 2) * 16, 0.85, [C_GREEN, C_RED, C_BLUE, C_BROWN][i])
    p.arrow((300, 640), (420, 560), C_RED); p.write((120, 640), P2_LABEL, 34, C_RED, 'nio')
    files.append(save_post(on_desk(p, 2).convert('RGB'), os.path.join(out, '02.png'), 2))

    p = Page(3); p.write((60, 70), P3, 40, C_BLUE)
    rng = random.Random(9)
    for i in range(11):
        x, y = 70 + (i % 4) * 130 + rng.randint(-14, 14), 170 + (i // 4) * 150 + rng.randint(-10, 10)
        p.stick(x, y, 0.75, [C_GREEN, C_RED, C_BLUE, C_BROWN, C_PURPLE][i % 5])
    for i in range(14):  # him, a blur in the middle of it
        a = i / 14 * 6.283; p.loop(400 + 16 * math.cos(a), 520 + 12 * math.sin(a), 18, 18, C_BROWN if i % 2 else C_PURPLE, 3)
    p.arrow((260, 625), (370, 548), C_RED); p.write((70, 630), P3_LABEL, 34, C_RED, 'nio')
    files.append(save_post(on_desk(p, 3).convert('RGB'), os.path.join(out, '03.png'), 3))

    p4 = Page(4); p4.write((50, 70), P4, 38, C_BLUE)
    p4.loop(470, 600, 20, 20, C_BLACK, 3)  # a very small face in the corner
    p4.dab(463, 596, 2.5, C_BLACK, 1); p4.dab(477, 596, 2.5, C_BLACK, 1); p4.stroke([(462, 612), (470, 608), (478, 612)], C_BLACK, 2)
    files.append(save_post(on_desk(p4, 4).convert('RGB'), os.path.join(out, '04.png'), 4))

    # 5: the same empty page, his phone dropped on it with PXI's notification, and a new line in crayon
    p5 = Page(4); p5.r = random.Random(4); p5.write((50, 70), P4, 38, C_BLUE)
    p5.loop(470, 600, 20, 20, C_BLACK, 3); p5.dab(463, 596, 2.5, C_BLACK, 1); p5.dab(477, 596, 2.5, C_BLACK, 1); p5.stroke([(462, 612), (470, 608), (478, 612)], C_BLACK, 2)
    p5.write((60, 135), P5, 40, C_RED, 'nio', rot=-4)
    from tier import phone
    scr = Image.open(os.path.join(ANIM, 'public', 'pxi-ui', 'screens', 'lock.png')).convert('RGB')
    def put(im):
        ph = turn(phone(scr), -7); drop_shadow(im, ph, 110, 168, (6, 9), 150)
    files.append(save_post(on_desk(p5, 4, put).convert('RGB'), os.path.join(out, '05.png'), 5))
    return files


if __name__ == '__main__':
    for f in make(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ANIM, 'out', 'formats', 'crayon')): print(f)
