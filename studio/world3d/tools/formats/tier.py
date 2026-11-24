#!/usr/bin/env python3
"""TIER LIST, in Nio's world: a tier list Nio made on the cork board in his room, in marker, with Maya's note on it
in her green pen. Four slides: Nio in front of the board, the top of the board, the bottom of the board with the
note, then the phone (the PXI album thread) for the call to action.

  tier.py <out_dir>
"""
import os, sys
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit import *
import screens as S  # noqa: E402  (tools/pxi/screens.py)

# ---- the words. Every string here is in the format spec's screen text list.
TITLE = 'the group chat, ranked'
ROWS = [  # tier, colour, name, note
    ('me', (196, 160, 92), 'me', ''),
    ('S', (176, 110, 112), 'benji', "already outside. it starts at 10"),
    ('A', (190, 138, 104), 'maya', "4 minute voice notes. i listen to all of them"),
    ('B', (186, 168, 112), 'theo', "90% sure he's coming. he's not coming"),
    ('C', (122, 132, 92), 'sami', '"i am completely fine"'),
    ('F', (112, 96, 120), 'whoever', 'said "we should do something this weekend"'),
]
MAYA_NOTE = 'can i be S? i can do shorter ones'
NIO_REPLY = 'no. keep them long'
STICKY = 'new chat. the pics go in this one'


def board(s=1.0, seed=5):
    """The cork board, drawn natively at scale s (so a close-up is drawn bigger, never blown up)."""
    W, H = round(440 * s), round(560 * s)
    im = mottle(W, H, CORK, 9, max(2, round(3 * s)), seed).convert('RGBA')
    d = ImageDraw.Draw(im)
    # cork flecks
    import random; r = random.Random(seed)
    for _ in range(int(900 * s * s)):
        x, y = r.randrange(W), r.randrange(H); d.point((x, y), fill=(118, 86, 62, 255) if r.random() < .6 else (176, 136, 104, 255))
    fr = max(6, round(12 * s))  # the wooden frame
    d.rectangle([0, 0, W - 1, H - 1], outline=WOOD_D, width=fr)
    d.rectangle([fr, fr, W - fr - 1, H - fr - 1], outline=(58, 40, 36), width=max(1, round(2 * s)))
    d.rectangle([0, 0, W - 1, H - 1], outline=INK, width=max(1, round(2 * s)))
    # the title on a torn strip
    t = paper(round(300 * s), round(46 * s), seed=11)
    hand_text(ImageDraw.Draw(t), (round(14 * s), round(26 * s)), TITLE, 'nio', round(30 * s), INK, 'lm', wobble=1 * s, seed=2)
    t = turn(t, -1.5); drop_shadow(im, t, round(70 * s), round(22 * s), (round(2 * s), round(3 * s)))
    pin(d, round(220 * s), round(30 * s))
    # the rows
    y = round(84 * s); rh = round(66 * s); gap = round(8 * s)
    for i, (tier, col, name, note) in enumerate(ROWS):
        if tier == 'me':   # a scrap taped on above S, in his own hand, with a crown
            sc = paper(round(170 * s), round(58 * s), base=(236, 226, 198), seed=40)
            sd = ImageDraw.Draw(sc)
            hand_text(sd, (round(54 * s), round(34 * s)), 'me', 'marker', round(30 * s), INK, 'lm', seed=4)
            cx, cy = round(28 * s), round(30 * s)  # the crown, drawn in marker
            pts = [(cx - 16 * s, cy + 9 * s), (cx - 16 * s, cy - 8 * s), (cx - 8 * s, cy), (cx, cy - 13 * s), (cx + 8 * s, cy), (cx + 16 * s, cy - 8 * s), (cx + 16 * s, cy + 9 * s)]
            sd.polygon(pts, fill=(214, 168, 72), outline=INK); sd.line(pts + [pts[0]], fill=INK, width=max(2, round(2 * s)))
            hand_text(sd, (round(96 * s), round(34 * s)), 'tier', 'nio', round(22 * s), (90, 70, 60), 'lm', seed=8)
            sc = turn(sc, 3); drop_shadow(im, sc, round(130 * s), y - round(8 * s), (round(2 * s), round(3 * s)))
            tape(im, round(150 * s), y - round(4 * s), round(40 * s), round(12 * s), -20)
            tape(im, round(290 * s), y + round(40 * s), round(40 * s), round(12 * s), 25)
            y += round(60 * s); continue
        # the tier square, cut from coloured card
        sq = Image.new('RGBA', (rh, rh), col + (255,)); qd = ImageDraw.Draw(sq)
        qd.rectangle([0, 0, rh - 1, rh - 1], outline=INK, width=max(1, round(2 * s)))
        hand_text(qd, (rh // 2, rh // 2 + round(2 * s)), tier, 'marker', round(36 * s), INK, 'mm', seed=i)
        drop_shadow(im, turn(sq, (-1) ** i * 1.2), round(28 * s), y, (round(2 * s), round(3 * s)))
        # the strip with the name and his note
        sw = round(320 * s)
        st = paper(sw, rh - round(6 * s), seed=20 + i)
        sd = ImageDraw.Draw(st)
        nx = hand_text(sd, (round(12 * s), round(17 * s)), name, 'marker', round(20 * s), INK, 'lm', seed=i)
        lines = wrap(note, 'nio', round(18 * s), sw - round(24 * s))
        for k, ln in enumerate(lines[:2]):
            hand_text(sd, (round(12 * s), round(36 * s + k * 16 * s)), ln, 'nio', round(18 * s), (62, 46, 44), 'lm', wobble=0.6 * s, seed=10 + i + k)
        drop_shadow(im, turn(st, (-1) ** (i + 1) * 0.8), round(100 * s), y + round(3 * s), (round(2 * s), round(3 * s)))
        pin(d, round(108 * s), y + round(10 * s), [(160, 58, 52), (70, 96, 140), (196, 160, 70)][i % 3])
        if tier == 'A':  # Maya's arrow from her name up to S, in green
            g = OLIVE; ax = round(392 * s)
            d.line([(round(400 * s), y + round(26 * s)), (ax + round(14 * s), y - round(40 * s))], fill=g, width=max(2, round(3 * s)))
            d.line([(ax + round(14 * s), y - round(40 * s)), (ax + round(4 * s), y - round(30 * s))], fill=g, width=max(2, round(3 * s)))
            d.line([(ax + round(14 * s), y - round(40 * s)), (ax + round(20 * s), y - round(28 * s))], fill=g, width=max(2, round(3 * s)))
        y += rh + gap
    # Maya's sticky note at the bottom, in her green pen, and his answer under it in marker
    n = paper(round(190 * s), round(118 * s), base=(214, 222, 168), seed=60)
    nd = ImageDraw.Draw(n)
    for k, ln in enumerate(wrap(MAYA_NOTE, 'maya', round(24 * s), round(170 * s))):
        hand_text(nd, (round(10 * s), round(22 * s + k * 22 * s)), ln, 'maya', round(24 * s), OLIVE, 'lm', seed=30 + k)
    hand_text(nd, (round(10 * s), round(96 * s)), NIO_REPLY, 'nio', round(20 * s), INK, 'lm', wobble=0.6 * s, seed=33)
    n = turn(n, -4); drop_shadow(im, n, round(236 * s), round(430 * s), (round(2 * s), round(3 * s)))
    pin(d, round(332 * s), round(440 * s), (70, 96, 140))
    return im


def wall(w, h, seed=1):
    """His bedroom wall: vertical planks in the room's browns, with the string lights along the top."""
    im = mottle(w, h, (70, 46, 42), 7, 3, seed).convert('RGBA'); d = ImageDraw.Draw(im)
    for x in range(0, w, 46): d.line([(x, 0), (x, h)], fill=(44, 28, 28), width=2); d.line([(x + 2, 0), (x + 2, h)], fill=(92, 62, 54))
    import math
    pts = [(x, 18 + 16 * math.sin(x / w * math.pi * 2) ** 2) for x in range(0, w + 1, 4)]
    d.line(pts, fill=(30, 22, 22), width=1)
    for i, x in enumerate(range(10, w, 38)):
        y = 18 + 16 * math.sin(x / w * math.pi * 2) ** 2 + 4
        for rr, a in ((9, 40), (6, 80)):  # the glow, as rings of warmer wall
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(min(255, 70 + a), min(255, 46 + a * 3 // 4), 42 + a // 3))
        d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=LAMP); d.point((x - 1, y - 1), fill=(255, 236, 190))
    return im


def slide1(out):
    im = wall(BW, BH)
    b = board(1.0); drop_shadow(im, b, 50, 52, (5, 7), 140)
    # Nio in front of it, arms crossed, pleased with himself
    nio = cutout(world({'cam': 'mid', 'camPos': [2.25, 1.38, 1.05], 'camAt': [2.0, 1.2, 2.5], 'fov': 44, 'yaw': 196, 'face': 'smug', 'crossed': True, 'lookCam': 1, 'studio': True}, 170, 220))
    nio = world_on_board(nio); im.alpha_composite(nio, (BW - nio.width + 30, BH - nio.height))
    return save_post(im.convert('RGB'), out, 1)


def slide_crop(out, top, seed):
    s = 1.55; b = board(s)
    im = wall(BW, BH, seed)
    x0 = (b.width - BW) // 2 + round(20 * s) if b.width > BW else 0
    crop = b.crop((x0, top, x0 + BW, top + BH)); im.alpha_composite(crop)
    return save_post(im.convert('RGB'), out, seed)


def slide_full(out):
    s = 1.2; b = board(s); im = wall(BW, BH, 2)
    im.alpha_composite(b, ((BW - b.width) // 2, (BH - b.height) // 2))
    return save_post(im.convert('RGB'), out, 2)


def slide_note(out):
    s = 2.1; b = board(s); im = wall(BW, BH, 3)
    cx, cy = round(330 * s), round(480 * s)   # Maya's note and his answer
    im.alpha_composite(b.crop((cx - BW // 2, cy - BH // 2, cx + BW // 2, cy + BH // 2)))
    return save_post(im.convert('RGB'), out, 3)


def cast_thread():
    """The PXI album thread with Nio's people in it. Same layout, sizes, colours and fixed wording as
    tools/pxi/screens.py thread() (from app/album/[id].tsx and src/components/album/ThreadView.tsx);
    only the people and what they say are the show's."""
    from ui import Screen, W, H, BLACK, WHITE, PURPLE, G1C, G2E, mix, white, hexc, pt, sysp, text_w
    s = Screen(); s.box(0, 0, W, 158, BLACK); S.header(s, "Theo's Roof"); S.switch(s, 'THREAD')
    grey, dim = hexc('9A9A9A'), hexc('7A7A7A')

    def other(y, who, when, msg, ems=None, n=None):
        w = max(150, 22 + text_w(msg, 500, S.sysp(15)))
        s.box(64, y, 64 + w, y + 48, G1C, r=16, small=('bl', 5))
        s.text(75, y + 13, who, 800, pt(10), grey, ls=1); s.text(64 + w - 11, y + 13, when, 700, pt(9.5), dim, align='r')
        s.text(75, y + 32, msg, 500, sysp(15), WHITE); s.avatar(S.nobody(29), 26, y + 16, 29)
        if ems: S.tag(s, 72, y + 40, ems, n)

    def mine(y, when, msg, ems=None, n=None):
        w = max(150, 22 + text_w(msg, 500, sysp(15))); x0 = 295 - w; on = mix(PURPLE, WHITE, 0.72)
        s.box(x0, y, 295, y + 46, PURPLE, r=16, small=('br', 5))
        s.text(x0 + 12, y + 12, 'YOU', 800, pt(10), on, ls=1); s.text(284, y + 12, when, 700, pt(9.5), on, align='r')
        s.text(x0 + 12, y + 31, msg, 500, sysp(15), WHITE); s.avatar(S.pic('avatar', 29, 29), 305, y + 17, 29)
        if ems: S.tag(s, 295 - 50, y + 39, ems, n)

    other(178, 'BENJI', '6:02 PM', "i'm outside", ['\U0001F480'], '4')
    other(250, 'THEO', '9:40 PM', '90% this starts on time')
    # Maya's voice note, someone else's, so grey
    import math
    s.text(75, 330, 'MAYA', 800, pt(10), grey, ls=1)
    s.box(64, 339, 243, 378, G1C, r=20); s.disc(70, 345, 27, WHITE); s.icon('PlayIcon', 14, 84, 358, BLACK)
    for i in range(24):
        env = 0.45 + 0.55 * math.sin(math.pi * (i + 0.5) / 24); hgt = round(5 + (0.5 + 0.5 * math.sin(i * 1.7 + 0.4)) * env * 13)
        bx = 106 + round(i * 3.75); s.box(bx, 358 - hgt // 2, bx + 2, 358 - hgt // 2 + hgt, white(0.55, G1C))
    s.text(205, 358, '4:12', 800, pt(11), WHITE); s.avatar(S.nobody(29), 26, 344, 29)
    mine(404, '10:31 PM', 'listened to all of it', ['\U0001F49C'], '1')
    other(482, 'SAMI', '1:14 AM', 'I am completely fine.', ['\U0001F602'], '9')
    other(560, 'THEO', '1:15 AM', 'called it')
    s.disc(292, 643, 51, PURPLE); s.icon('Add01Icon', 24, 317, 668, WHITE)
    s.disc(19, 713, 40, G1C); s.text(39, 733, 'GIF', 900, pt(11), WHITE, ls=1, align='c')
    s.disc(70, 713, 40, G1C); s.icon('Mic01Icon', 17, 90, 733, WHITE)
    s.box(120, 713, 290, 753, G1C, r=20); s.text(134, 733, 'Type a message...', 400, sysp(15), white(0.35, G1C))
    s.disc(301, 713, 40, G2E); s.icon('SentIcon', 18, 320, 734, white(0.35, G2E))
    return s.im


def phone(screen, bez=10):
    """A phone as an object: the screen in a black body with a hard edge highlight."""
    w, h = screen.width + bez * 2, screen.height + bez * 2
    p = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(p)
    d.rounded_rectangle([0, 0, w - 1, h - 1], 44, fill=(16, 14, 18), outline=INK, width=2)
    d.rounded_rectangle([2, 2, w - 3, h - 3], 42, outline=(70, 66, 76), width=1)
    m = Image.new('L', screen.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, screen.width - 1, screen.height - 1], 36, fill=255)
    p.paste(screen, (bez, bez), m)
    d.rounded_rectangle([w // 2 - 46, bez + 10, w // 2 + 46, bez + 34], 12, fill=(0, 0, 0))  # the island
    return p


def slide4(out, scr):
    im = wall(BW, BH, 4)
    b = board(1.0); drop_shadow(im, b, 50, 52, (5, 7), 140)
    sh = Image.new('RGBA', im.size, (20, 12, 16, 120)); im.alpha_composite(sh)  # the board falls back
    ph = turn(phone(scr), -3); drop_shadow(im, ph, (BW - ph.width) // 2, 44, (6, 8), 150)
    st = paper(186, 112, base=(226, 206, 120), seed=70); sd = ImageDraw.Draw(st)
    for k, ln in enumerate(wrap(STICKY, 'nio', 26, 166)):
        hand_text(sd, (12, 28 + k * 26), ln, 'nio', 26, INK, 'lm', wobble=0.8, seed=71 + k)
    drop_shadow(im, turn(st, 6), 336, 548, (3, 4))
    return save_post(im.convert('RGB'), out, 4)


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ANIM, 'out', 'formats', 'tier')
    os.makedirs(out, exist_ok=True)
    print(slide1(os.path.join(out, '01.png')))
    print(slide_full(os.path.join(out, '02.png')))
    print(slide_note(os.path.join(out, '03.png')))
    scr = cast_thread(); scr.save(os.path.join(out, 'screen-thread.png'))
    print(slide4(os.path.join(out, '04.png'), scr))
