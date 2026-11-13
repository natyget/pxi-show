#!/usr/bin/env python3
"""The second batch of post formats in Nio's world:

  FIVE STAGES   polaroids of Nio's faces on his cork board (the engine's faces, so the acting carries it)
  SEARCH        a phone face up on his desk, a search bar that has typed "how to"
  SUPERLATIVES  a yearbook page for the night where nobody's photo was sent, except his
  DICTIONARY    a dictionary page on his desk with words from his world

  batch2.py <out_dir> [names...]
"""
import os, random, sys
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit import *
from tier import wall, phone  # noqa: E402
import screens as S  # noqa: E402

# ---- the words (every string the posts draw)
STAGES_TITLE = 'waiting for the pics, in 5 stages'
STAGES = [('deadpan', '1. they\'ll send them tonight'), ('rage', '2. theo posted 9 stories. none of me'),
          ('charm', '3. if i send mine first they have to'), ('crushed', '4. was i even there'),
          ('deadInside', "5. i'll draw them myself"), ('hyped', '6. remembered i made an app for this')]
SEARCH_TYPED = 'how to'
SEARCH = ['how to get the pics from last night', 'how to ask for pics without being weird',
          'how to tell if i blinked in every photo', "how to find what's on tonight near me",
          "how to get everyone's pics in one album"]
YB_TITLE = "theo's roof"
YB_SUB = 'superlatives'
YB = [('nio', 'most likely to make an app about it', True), ('maya', 'most likely to cry at a stranger\'s proposal', False),
      ('benji', 'most likely to be outside already', False), ('theo', 'most likely to say he called it', False),
      ('sami', 'most likely to be fine', False), ('?', 'most likely to say "send me that" and never send it', False)]
YB_NOPHOTO = 'photo not sent'
DICT = [('pic debt', 'n.', "the photos someone owes you from a night out. see also: theo"),
        ('outside', 'adj.', 'where benji is. has been since six. the party starts at ten'),
        ('one more song', 'phr.', 'a unit of time between forty minutes and the sun coming up')]


def cork(W, H, seed=5, s=1.0):
    im = mottle(W, H, CORK, 9, max(2, round(3 * s)), seed).convert('RGBA'); d = ImageDraw.Draw(im); r = random.Random(seed)
    for _ in range(int(W * H / 200)):
        d.point((r.randrange(W), r.randrange(H)), fill=(118, 86, 62, 255) if r.random() < .6 else (176, 136, 104, 255))
    fr = max(6, round(12 * s)); d.rectangle([0, 0, W - 1, H - 1], outline=WOOD_D, width=fr); d.rectangle([0, 0, W - 1, H - 1], outline=INK, width=2)
    return im


def title_strip(im, text, x, y, w, px=30, rot=-1.5, seed=11):
    t = paper(w, round(px * 1.6), seed=seed); hand_text(ImageDraw.Draw(t), (12, round(px * 0.85)), text, 'nio', px, INK, 'lm', wobble=1, seed=2)
    drop_shadow(im, turn(t, rot), x, y, (2, 3)); pin(ImageDraw.Draw(im), x + w // 2, y + 8)


def polaroid(face, cap, w=150, seed=0, extra=None):
    ph = world({'cam': 'head', 'yaw': 172, 'face': face, 'lookCam': 1, **(extra or {})}, 64, 64)
    p = paper(w, round(w * 1.36), base=(238, 234, 226), seed=seed)
    p.paste(world_on_board(ph).resize((w - 16, w - 16), Image.NEAREST), (8, 8))
    d = ImageDraw.Draw(p)
    for k, ln in enumerate(wrap(cap, 'nio', 17, w - 12)[:3]):
        hand_text(d, (7, w + 2 + k * 15), ln, 'nio', 17, INK, 'lm', wobble=0.5, seed=seed + k)
    return p


def five_stages(out):
    im = wall(BW, BH, 6); b = cork(500, 610, 6); title_strip(b, STAGES_TITLE, 40, 18, 420, 28)
    for i, (face, cap) in enumerate(STAGES):
        p = polaroid(face, cap, 140, 50 + i)
        x, y = 30 + (i % 3) * 152, 90 + (i // 3) * 250
        drop_shadow(b, turn(p, random.Random(i).uniform(-4, 4)), x, y, (2, 3)); pin(ImageDraw.Draw(b), x + 72, y + 8, [(160, 58, 52), (70, 96, 140), (196, 160, 70)][i % 3])
    drop_shadow(im, b, 20, 34, (5, 7), 140)
    f1 = save_post(im.convert('RGB'), os.path.join(out, '01.png'), 21)
    # slide 2: the last two, close
    im = wall(BW, BH, 7); b = cork(BW + 40, BH + 40, 7)
    for i, (face, cap) in enumerate(STAGES[4:]):
        p = polaroid(face, cap, 236, 60 + i); x, y = 22 + i * 262, 150
        drop_shadow(b, turn(p, (-3, 4)[i]), x, y, (3, 4)); pin(ImageDraw.Draw(b), x + 118, y + 10)
    im.alpha_composite(b, (-20, -20))
    return [f1, save_post(im.convert('RGB'), os.path.join(out, '02.png'), 22)]


def search_screen():
    """A phone's own search screen in dark mode: no particular company's design, in the PXI kit's pixels."""
    from ui import Screen, W, WHITE, G1C, white, sysp, text_w, hexc
    s = Screen(); s.status('1:47')
    s.box(16, 70, W - 16, 112, G1C, r=21); s.icon('Search01Icon', 20, 40, 91, white(0.6, G1C))
    _, x1 = s.text(60, 91, SEARCH_TYPED, 400, sysp(17), WHITE); s.box(x1 + 3, 80, x1 + 5, 102, hexc('4a8cff'))
    for i, t in enumerate(SEARCH):
        y = 150 + i * 56; s.icon('Search01Icon', 20, 40, y, white(0.45))
        s.text(66, y, SEARCH_TYPED, 400, sysp(16), white(0.55)); s.text(66 + text_w(SEARCH_TYPED + ' ', 400, sysp(16)), y, t[len(SEARCH_TYPED) + 1:], 700, sysp(16), WHITE)
        if i < len(SEARCH) - 1: s.box(66, y + 27, W - 16, y + 28, white(0.12))
    # the keyboard, dimmed under the list
    s.box(0, 520, W, 780, hexc('1b1b1d'))
    for r, keys in enumerate(('qwertyuiop', 'asdfghjkl', 'zxcvbnm')):
        kw = 32; x0 = (W - len(keys) * (kw + 4)) // 2
        for k, ch in enumerate(keys):
            x = x0 + k * (kw + 4); y = 534 + r * 52; s.box(x, y, x + kw, y + 44, hexc('3a3a3c'), r=6); s.text(x + kw // 2, y + 22, ch, 400, sysp(19), WHITE, align='c')
    s.box(80, 690, 280, 734, hexc('3a3a3c'), r=6); s.text(180, 712, 'space', 400, sysp(15), WHITE, align='c')
    return s.im


def search(out):
    from crayon import on_desk  # noqa
    im = mottle(BW, BH, (88, 58, 46), 8, 3, 12).convert('RGBA'); d = ImageDraw.Draw(im)
    for y in range(0, BH, 34): d.line([(0, y), (BW, y + 6)], fill=(66, 42, 36), width=2)
    ph = turn(phone(search_screen()), 3); drop_shadow(im, ph, (BW - ph.width) // 2, 26, (6, 9), 150)
    return [save_post(im.convert('RGB'), os.path.join(out, '01.png'), 41)]


def superlatives(out):
    im = mottle(BW, BH, (88, 58, 46), 8, 3, 13).convert('RGBA')
    pg = paper(500, 630, base=(236, 230, 214), seed=91); d = ImageDraw.Draw(pg)
    hand_text(d, (250, 40), YB_TITLE.upper(), 'print', 40, INK, 'mm'); hand_text(d, (250, 76), YB_SUB, 'print', 24, (110, 100, 96), 'mm')
    d.line([(30, 98), (470, 98)], fill=INK, width=2)
    for i, (name, line, real) in enumerate(YB):
        x, y = 22 + (i % 3) * 160, 116 + (i // 3) * 250
        if real:
            ph = world_on_board(world({'cam': 'head', 'yaw': 165, 'face': 'smug', 'lookCam': 1}, 66, 72)); pg.paste(ph, (x, y))
        else:
            d.rectangle([x, y, x + 131, y + 143], fill=(200, 194, 182)); d.rectangle([x, y, x + 131, y + 143], outline=(150, 140, 130))
            for k, ln in enumerate(wrap(YB_NOPHOTO, 'print', 18, 110)): hand_text(d, (x + 66, y + 64 + k * 18), ln, 'print', 18, (120, 112, 106), 'mm')
        hand_text(d, (x + 66, y + 160), name.upper(), 'print', 22, INK, 'mm')
        for k, ln in enumerate(wrap(line, 'print', 17, 140)[:3]): hand_text(d, (x + 66, y + 182 + k * 16), ln, 'print', 17, (80, 72, 70), 'mm')
    drop_shadow(im, turn(pg, -1.5), 14, 20, (4, 6), 130)
    return [save_post(im.convert('RGB'), os.path.join(out, '01.png'), 51)]


def dictionary(out):
    im = mottle(BW, BH, (88, 58, 46), 8, 3, 14).convert('RGBA')
    pg = paper(470, 600, base=(232, 224, 204), seed=92); d = ImageDraw.Draw(pg)
    hand_text(d, (440, 26), 'pic — one', 'print', 18, (120, 110, 100), 'rm'); d.line([(24, 42), (446, 42)], fill=(120, 110, 100))
    y = 84
    for word, kind, mean in DICT:
        x = hand_text(d, (30, y), word, 'print', 34, INK, 'lm'); hand_text(d, (x + 10, y + 4), kind, 'print', 22, (110, 100, 96), 'lm')
        y += 34
        for ln in wrap(mean, 'print', 23, 400): hand_text(d, (44, y), ln, 'print', 23, (60, 52, 52), 'lm'); y += 26
        y += 40
    # his marker underline on the first one
    d.line([(28, 102), (190, 104)], fill=(176, 64, 58), width=4)
    drop_shadow(im, turn(pg, 2), 30, 40, (4, 6), 130)
    return [save_post(im.convert('RGB'), os.path.join(out, '01.png'), 61)]


MAKERS = {'five-stages': five_stages, 'search': search, 'superlatives': superlatives, 'dictionary': dictionary}
if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ANIM, 'out', 'formats')
    for n in (sys.argv[2:] or MAKERS):
        o = os.path.join(out, n); os.makedirs(o, exist_ok=True)
        for f in MAKERS[n](o): print(f)
