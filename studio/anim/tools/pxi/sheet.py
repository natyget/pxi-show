#!/usr/bin/env python3
"""sheet.py <out.png> : the founder's comparison sheet for PXI's screens. Each pair is the App Store picture (squared up
by ref.py, read from the website repo, never copied here) next to the same screen in the show's pixels (screens.py),
then the phone in Nio's hand in his room and three close looks at the pixels. Needs out/pxi/<screen>.png and
out/pxi/hand_discover.png, hand_thread.png (tools/n3_still.sh with "screen" and "hold")."""
import os, sys
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ANIM = os.path.join(HERE, '..', '..'); OUT = os.path.join(ANIM, 'out', 'pxi')
sys.path.insert(0, HERE)
import ref

BG, INK, DIM, PURPLE = (12, 10, 13), (240, 236, 232), (150, 142, 150), (0xA5, 0x23, 0xEF)
F = lambda w, px: ImageFont.truetype(os.path.join(ANIM, 'public', 'pxi-ui', 'fonts', f'Inter-{w}.otf'), px)
Z, SW, SH = 2, 360, 780                     # every screen is shown at twice its pixels
PAIR = SW * Z * 2 + 24; M = 80; GAP = 120
W = M * 2 + PAIR * 2 + GAP

def pair(d, sheet, name, title, note, x, y):
    d.text((x, y), title, font=F('Bold', 44), fill=INK)
    d.text((x, y + 58), note, font=F('Regular', 26), fill=DIM)
    y += 112
    sheet.paste(ref.rectify(name, Z), (x, y))
    sheet.paste(Image.open(os.path.join(OUT, f'{name}.png')).convert('RGB').resize((SW * Z, SH * Z), Image.NEAREST), (x + SW * Z + 24, y))
    d.text((x, y + SH * Z + 14), 'The app today (App Store picture)', font=F('Medium', 26), fill=DIM)
    d.text((x + SW * Z + 24, y + SH * Z + 14), "In Nio's world", font=F('Medium', 26), fill=PURPLE)
    return y + SH * Z + 60

def close(name, box, z):
    return Image.open(os.path.join(OUT, f'{name}.png')).convert('RGB').crop(box).resize(((box[2] - box[0]) * z, (box[3] - box[1]) * z), Image.NEAREST)

def main(out):
    rows = [[('discover', 'Discover', 'Same layout and words. The app has since moved the title to the middle and gone to three tabs.'),
             ('camera', 'Camera', 'His room through the viewfinder. The live album pill and the tabs follow the current app.')],
            [('thread', 'Album thread', 'Every bubble, pill, icon and count in its place. The photos are his.'),
             ('gallery', 'Gallery', 'His shots first, then everyone else, as the app lays them out now.')]]
    hand = [Image.open(os.path.join(OUT, f'hand_{n}.png')).convert('RGB') for n in ('discover', 'thread')]
    closes = [close('thread', (48, 268, 312, 480), 3), close('discover', (48, 506, 312, 694), 3), close('gallery', (0, 160, 264, 372), 3)]
    H = M + 150 + 3 * (112 + SH * Z + 60 + 70) + 112 + hand[0].height + 60 + M
    sheet = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(sheet)
    d.text((M, M - 10), "PXI in Nio's world", font=F('Black', 76), fill=INK)
    d.text((M, M + 84), "The real app, screen for screen, drawn from the app's own code in the show's pixels. The photos and faces are Nio and his room.",
           font=F('Regular', 30), fill=DIM)
    y = M + 180
    for row in rows:
        yy = y
        for i, (name, title, note) in enumerate(row): yy = pair(d, sheet, name, title, note, M + i * (PAIR + GAP), y)
        y = yy + 70
    # the Passport, with its two pages at three times beside it
    y0 = y; yy = pair(d, sheet, 'passport', 'Passport', "His stamps are placed and drawn by the app's own stamp code. The app has since added Edit profile and dropped the level bar.", M, y)
    x = M + PAIR + GAP; d.text((x, y0), 'Up close', font=F('Bold', 44), fill=INK)
    d.text((x, y0 + 58), 'The stamp page and the ID page at four times.', font=F('Regular', 26), fill=DIM)
    c = close('passport', (5, 237, 355, 441), 4); sheet.paste(c, (x, y0 + 112)); c2 = close('passport', (5, 441, 355, 617), 4); sheet.paste(c2, (x, y0 + 112 + c.height + 24))
    y = yy + 70
    d.text((M, y), 'On his phone', font=F('Bold', 44), fill=INK)
    d.text((M, y + 58), 'The same screens on the phone in his hand, over his shoulder and closer. Far right: the pixels at three times, nothing blurred.',
           font=F('Regular', 26), fill=DIM)
    y += 112
    sheet.paste(hand[0], (M, y)); sheet.paste(hand[1], (M + 1080 + 40, y))
    x = M + 2160 + 80; cw = W - M - x
    for c in closes:
        c = c.crop((0, 0, min(c.width, cw), c.height)); sheet.paste(c, (x, y)); y += c.height + 40
    sheet.save(out); print(out, sheet.size)

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(OUT, 'sheet.png'))
