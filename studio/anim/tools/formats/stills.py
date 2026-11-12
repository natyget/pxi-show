#!/usr/bin/env python3
"""STILLS, in Nio's world. Each is one object from his world, photographed where it lives.

  LOCK SCREEN  his phone face up on the bed, the morning after: his people's messages and PXI's notification.
  RECEIPT      the receipt from Saturday on his nightstand, by the lamp. It itemises the night.

  stills.py <out_dir>
"""
import os, sys
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit import *
import screens as S  # noqa: E402
from tier import phone  # noqa: E402

# ---- the words (in the format spec's screen text list). Messages are the show's; PXI's line is the app's own.
LOCK_NOTES = [  # (kind, title, body, when)
    ('pxi', "Theo's Roof", "You're in 14 new photos", 'now'),
    ('msg', 'Benji', "got your jacket. it's safe. i'm wearing it", '2m ago'),
    ('msg', 'Sami', 'I am completely fine. Thank you for asking.', '6m ago'),
    ('msg', 'Maya', 'text me when you get home', '9m ago'),
]
RECEIPT = [
    ("THEO'S ROOF", None), ('SAT        02:47 AM', None), ('-' * 24, None),
    ('jacket', 'LOST'), ("dances w/ sami's dad", '1'), ('"one more song"', '6'), ('stairs, carried sami', 'ALL'),
    ('numbers saved', '2'), ('names remembered', '0'), ('photos of me', 'PENDING'), ('-' * 24, None),
    ('TOTAL', 'WORTH IT'), ('', None), ('keep this for your records', None), ('*** thank you ***', None),
]


def msg_icon(px):
    """A plain messages icon: a green rounded square with a white speech bubble. Not any phone maker's own."""
    im = Image.new('RGB', (px, px), (0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, px - 1, px - 1], px // 4, fill=(74, 186, 96))
    d.ellipse([px * .2, px * .24, px * .8, px * .7], fill=(255, 255, 255)); d.polygon([(px * .3, px * .62), (px * .26, px * .8), (px * .44, px * .68)], fill=(255, 255, 255))
    return im


def lock_screen():
    """Layout, sizes and colours as tools/pxi/screens.py lock() (measured from the App Store picture)."""
    from ui import Screen, W, H, WHITE, sysp, mix
    s = Screen(); s.photo(S.pic('lockwall', W, H), 0, 0, W, H); s.shade(0, 0, W, 300, 0.45, 0.0)
    s.status('9:12'); s.text(180, 87, 'Sunday, November 9', 600, 18, WHITE, align='c'); s.text(180, 141, '9:12', 700, 88, WHITE, ls=-1, align='c')
    card, ink, grey = (233, 233, 236), (12, 12, 14), (128, 128, 134)
    for i, (kind, title, body, when) in enumerate(LOCK_NOTES):
        y = 300 + i * 65
        s.box(11, y, 349, y + 59, card, r=20)
        s.photo(S.app_icon(34) if kind == 'pxi' else msg_icon(34), 22, y + 12, 56, y + 46, r=8)
        s.text(66, y + 19, title, 600, sysp(15), ink)
        b = body
        from ui import text_w
        while text_w(b, 400, sysp(15)) > 270: b = b[:-2]
        if b != body: b = b.rstrip(' .,') + '...'
        s.text(66, y + 37, b, 400, sysp(15), ink); s.text(338, y + 21, when, 400, sysp(13), grey, align='r')
    return s.im


def still_lock(out):
    bg = world_on_board(world({'cam': 'high', 'actor': False}, WW, WH)).convert('RGBA')
    bg.alpha_composite(Image.new('RGBA', bg.size, (16, 10, 16, 90)))
    ph = turn(phone(lock_screen()), 4); drop_shadow(bg, ph, (BW - ph.width) // 2, 34, (6, 9), 150)
    return save_post(bg.convert('RGB'), out, 7)


def still_receipt(out):
    bg = world_on_board(world({'cam': 'full', 'camPos': [0.35, 1.36, 0.9], 'camAt': [0.7, 1.05, 2.65], 'fov': 60, 'actor': False}, WW, WH)).convert('RGBA')
    bg.alpha_composite(Image.new('RGBA', bg.size, (16, 10, 16, 60)))
    lh, pw = 26, 300; ph = 40 + lh * len(RECEIPT) + 20
    r = paper(pw, ph, base=(236, 232, 222), seed=91); d = ImageDraw.Draw(r)
    for x in range(0, pw, 8): d.polygon([(x, ph - 1), (x + 4, ph - 7), (x + 8, ph - 1)], fill=(0, 0, 0, 0))  # torn off the roll
    ink = (52, 48, 56)
    for i, (left, right) in enumerate(RECEIPT):
        y = 34 + i * lh
        if right is None: hand_text(d, (pw // 2, y), left, 'till', 26, ink, 'mm')
        else:
            hand_text(d, (16, y), left, 'till', 24, ink, 'lm'); hand_text(d, (pw - 16, y), right, 'till', 24, ink, 'rm')
    r = turn(r, -5); drop_shadow(bg, r, 160, 40, (5, 7), 140)
    return save_post(bg.convert('RGB'), out, 8)


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ANIM, 'out', 'formats', 'stills')
    os.makedirs(out, exist_ok=True)
    print(still_lock(os.path.join(out, 'lock-screen.png'))); print(still_receipt(os.path.join(out, 'receipt.png')))
