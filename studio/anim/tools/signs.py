#!/usr/bin/env python3
"""The words and pictures on things in the world: signs, plaques, posters, papers. Each is drawn here once, into one
atlas (public/signs/atlas.png), and src/nw3d/signs.json says where each sits in it. A box in a set shows one on its
front face (Box.sign, mat 7). Drawn large and clean; the renderer brings them down to the show's pixels.
Run: python3 tools/signs.py"""
import json, math, os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..')
PIX = os.path.join(ROOT, 'public', 'PixelifySans.ttf')
SIZE = 2048
atlas = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
rects, cur = {}, [0, 0, 0]  # x, y, row height


def font(px, bold=True):
    f = ImageFont.truetype(PIX, px)
    try: f.set_variation_by_axes([700 if bold else 400])
    except Exception: pass
    return f


def place(name, img):
    w, h = img.size
    if cur[0] + w > SIZE: cur[0], cur[1], cur[2] = 0, cur[1] + cur[2] + 4, 0
    x, y = cur[0], cur[1]
    atlas.paste(img, (x, y)); cur[0] += w + 4; cur[2] = max(cur[2], h)
    # GL convention: v up from the bottom of the atlas
    rects[name] = [x / SIZE, 1 - (y + h) / SIZE, (x + w) / SIZE, 1 - y / SIZE]


def centred(d, cx, y, text, f, fill):
    w = d.textlength(text, font=f); d.text((cx - w / 2, y), text, font=f, fill=fill)


def now_serving(n):
    # a black box with red dot-matrix light: NOW SERVING small on top, the number big
    W, H = 400, 200; im = Image.new('RGBA', (W, H), (22, 18, 20, 255)); d = ImageDraw.Draw(im)
    d.rectangle([6, 6, W - 7, H - 7], outline=(48, 40, 44), width=4)
    red, dim = (255, 64, 44, 255), (44, 16, 16, 255)
    small = font(34); centred(d, W / 2, 18, 'NOW SERVING', small, red)
    # the digit as a dot matrix, 5 wide by 7 high
    DIG = {'3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'], '4': ['10001', '10001', '10001', '11111', '00001', '00001', '00001']}
    g = DIG[str(n)]; r = 7; gap = 17; x0 = W / 2 - 2 * gap; y0 = 78
    for j, row in enumerate(g):
        for i, c in enumerate(row):
            cx, cy = x0 + i * gap, y0 + j * gap
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=red if c == '1' else dim)
    return im


def plaque():
    # a brass name plate by the door
    W, H = 420, 150; im = Image.new('RGBA', (W, H), (176, 140, 74, 255)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W - 1, H - 1], outline=(120, 90, 44), width=6); d.rectangle([10, 10, W - 11, H - 11], outline=(204, 172, 104), width=2)
    ink = (52, 36, 22)
    centred(d, W / 2, 22, 'PROF. HAVERBROOK', font(40), ink)
    f = font(28, False); t = 'MY DOOR IS ALWAYS OPEN'; w = d.textlength(t, font=f); x = W / 2 - (w + 34) / 2
    d.text((x, 86), t, font=f, fill=ink)
    cx, cy, R = x + w + 22, 100, 13  # the smiley
    d.ellipse([cx - R, cy - R, cx + R, cy + R], outline=ink, width=3); d.ellipse([cx - 6, cy - 5, cx - 2, cy - 1], fill=ink); d.ellipse([cx + 2, cy - 5, cx + 6, cy - 1], fill=ink)
    d.arc([cx - 8, cy - 7, cx + 8, cy + 7], 25, 155, fill=ink, width=3)
    return im


def take_a_number():
    W, H = 300, 150; im = Image.new('RGBA', (W, H), (196, 52, 46, 255)); d = ImageDraw.Draw(im)
    centred(d, W / 2, 22, 'TAKE A', font(46), (250, 240, 228)); centred(d, W / 2, 76, 'NUMBER', font(46), (250, 240, 228))
    return im


def hang_in_there():
    # our own poster: a ginger cat hanging from a bar by its front paws, big round eyes, words along the bottom
    W, H = 300, 400; im = Image.new('RGBA', (W, H), (150, 186, 214, 255)); d = ImageDraw.Draw(im)
    for k in range(H):  # the sky, lighter at the bottom
        c = int(150 + 50 * k / H); d.line([(0, k), (W, k)], fill=(c, min(255, c + 34), min(255, c + 62)))
    ink, fur, dark = (40, 28, 26), (226, 146, 72), (176, 98, 46)
    d.rounded_rectangle([20, 58, 280, 72], 7, fill=(120, 82, 54), outline=ink, width=3)  # the bar
    for px in (124, 176):  # paws over it, legs down to the body
        d.line([(px, 70), (px + (8 if px < 150 else -8), 150)], fill=ink, width=26); d.line([(px, 70), (px + (8 if px < 150 else -8), 150)], fill=fur, width=18)
        d.ellipse([px - 14, 54, px + 14, 78], fill=fur, outline=ink, width=3)
    d.ellipse([92, 140, 208, 262], fill=fur, outline=ink, width=4)  # body
    for k in range(3): d.arc([110, 160 + k * 26, 190, 190 + k * 26], 200, 340, fill=dark, width=5)
    d.line([(150, 255), (186, 330)], fill=ink, width=16); d.line([(150, 255), (186, 330)], fill=fur, width=9)  # tail
    d.ellipse([104, 74, 196, 156], fill=fur, outline=ink, width=4)  # head, in front of the paws
    d.polygon([(110, 96), (116, 62), (138, 82)], fill=fur, outline=ink); d.polygon([(190, 96), (184, 62), (162, 82)], fill=fur, outline=ink)
    for ex in (132, 168):
        d.ellipse([ex - 13, 100, ex + 13, 128], fill=(250, 246, 232), outline=ink, width=3); d.ellipse([ex - 6, 108, ex + 6, 126], fill=ink)
    d.polygon([(146, 134), (154, 134), (150, 139)], fill=(200, 100, 110))
    d.rectangle([0, 338, W, H], fill=(250, 244, 230)); centred(d, W / 2, 348, 'HANG IN THERE', font(36), ink)
    d.rectangle([0, 0, W - 1, H - 1], outline=(236, 230, 214), width=6)
    return im


def lab_report():
    # a page of a lab report, typed, with a coffee ring on it
    W, H = 240, 340; im = Image.new('RGBA', (W, H), (240, 236, 224, 255)); d = ImageDraw.Draw(im)
    ink = (70, 64, 66); d.text((22, 20), 'LAB REPORT', font=font(24), fill=ink); d.line([(22, 52), (W - 22, 52)], fill=ink, width=2)
    for k in range(13):
        y = 70 + k * 18; w = W - 44 - (37 * k) % 60
        d.line([(22, y), (22 + w, y)], fill=(150, 144, 146), width=5)
    d.rectangle([22, 300, 120, 320], outline=(150, 144, 146), width=2)
    d.ellipse([110, 150, 210, 250], outline=(150, 100, 60, 255), width=7); d.arc([116, 156, 204, 244], 40, 300, fill=(176, 130, 86), width=3)
    return im


def planner():
    W, H = 220, 300; im = Image.new('RGBA', (W, H), (74, 92, 112, 255)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 22, H], fill=(52, 64, 80)); d.rectangle([60, 120, 180, 150], outline=(214, 196, 140), width=4)  # a plain cover, a label box nobody filled in
    return dusty(im)


def dusty(im):
    # dust: a pale grey film, thicker at the top edge
    W, H = im.size; dust = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dd = ImageDraw.Draw(dust)
    for k in range(H): dd.line([(0, k), (W, k)], fill=(206, 200, 190, int(130 - 70 * k / H)))
    return Image.alpha_composite(im, dust)


def name_card(name):
    # a folded paper name card on the desk, the name in marker, under the same dust as the planner
    W, H = 360, 150; im = Image.new('RGBA', (W, H), (240, 236, 224, 255)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W - 1, H - 1], outline=(190, 182, 166), width=4); centred(d, W / 2, 34, name, font(72), (36, 40, 52))
    return dusty(im)


def stairs():
    W, H = 300, 100; im = Image.new('RGBA', (W, H), (36, 120, 74, 255)); d = ImageDraw.Draw(im)
    d.text((24, 22), 'STAIRS', font=font(50), fill=(244, 244, 236))
    for k in range(4): d.rectangle([200 + k * 16, 70 - k * 14, 216 + k * 16, 76], fill=(244, 244, 236))
    return im


def door_number(t):
    W, H = 160, 80; im = Image.new('RGBA', (W, H), (52, 56, 62, 255)); d = ImageDraw.Draw(im)
    centred(d, W / 2, 14, t, font(46), (236, 232, 222)); return im


def ticket(n):
    W, H = 120, 160; im = Image.new('RGBA', (W, H), (238, 226, 196, 255)); d = ImageDraw.Draw(im)
    centred(d, W / 2, 30, str(n), font(90), (40, 32, 30)); d.line([(10, 8), (W - 10, 8)], fill=(170, 150, 120), width=3); return im


def slide():
    # the last slide of the lecture on the screen behind him
    W, H = 640, 360; im = Image.new('RGBA', (W, H), (238, 240, 246, 255)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 64], fill=(64, 82, 140)); d.text((28, 12), 'WEEK 9', font=font(40), fill=(240, 240, 248))
    centred(d, W / 2, 160, 'ANY QUESTIONS?', font(56), (52, 56, 72))
    return im


def flyer():
    # Prof H's flyer, drawn by hand in markers on printer paper: every line a little crooked, the words in his colours
    W, H = 300, 400; im = Image.new('RGBA', (W, H), (246, 243, 234, 255)); d = ImageDraw.Draw(im)
    lines = [('PROF H', 44, (44, 86, 170), -3), ('IMPROV', 72, (206, 52, 52), 2), ('THURSDAY', 46, (34, 30, 34), 1)]
    y = 60
    for text, px, col, rot in lines:
        f = font(px); w = int(d.textlength(text, font=f)) + 12; layer = Image.new('RGBA', (w, px + 16), (0, 0, 0, 0))
        ImageDraw.Draw(layer).text((6, 2), text, font=f, fill=col); layer = layer.rotate(rot, resample=Image.BICUBIC, expand=True)
        im.alpha_composite(layer, (int(W / 2 - layer.width / 2), y)); y += px + 40 + (14 if text == 'IMPROV' else 0)
    # a wobbly underline under IMPROV, and two hand-drawn stars
    pts = [(60 + k * 18, 252 + (3 if k % 2 else -2)) for k in range(11)]; d.line(pts, fill=(206, 52, 52), width=5)
    for cx, cy, r in ((34, 50, 16), (268, 330, 14)):
        star = [(cx + r * math.cos(math.pi / 2 + k * math.pi * 0.8), cy - r * math.sin(math.pi / 2 + k * math.pi * 0.8)) for k in range(6)]
        d.line(star, fill=(232, 170, 40), width=4)
    return im


place('nowServing3', now_serving(3)); place('nowServing4', now_serving(4)); place('plaque', plaque()); place('takeNumber', take_a_number())
place('hangInThere', hang_in_there()); place('labReport', lab_report()); place('planner', planner()); place('stairs', stairs())
place('door114', door_number('B114')); place('door116', door_number('B116')); place('door112', door_number('B112'))
place('nameDarnell', name_card('DARNELL')); place('ticket4', ticket(4)); place('ticket5', ticket(5)); place('slide', slide()); place('flyer', flyer())
used = cur[1] + cur[2]
out = atlas.crop((0, 0, SIZE, 1 << max(8, math.ceil(math.log2(used)))))
# the atlas is cropped to a power of two high; the rects are made relative to the cropped height
H = out.size[1]
rects = {k: [r[0], 1 - (1 - r[1]) * SIZE / H, r[2], 1 - (1 - r[3]) * SIZE / H] for k, r in rects.items()}
out.save(os.path.join(ROOT, 'public', 'signs', 'atlas.png'))
json.dump({'size': [SIZE, H], 'rects': {k: [round(v, 6) for v in r] for k, r in rects.items()}}, open(os.path.join(ROOT, 'src', 'nw3d', 'signs.json'), 'w'), indent=0)
print('atlas', out.size, len(rects), 'signs')
