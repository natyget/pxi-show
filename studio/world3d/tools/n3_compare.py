#!/usr/bin/env python3
"""n3_compare.py <out_dir> : the look comparison sheets. Renders the proposed character and room from the engine
and lays them out next to the founder's two reference images (look-options/reference2)."""
import hashlib, json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
here = os.path.dirname(os.path.abspath(__file__))
REF = '/mnt/project-files/look-options/reference2/'
cache = os.path.join(here, '..', 'out', 'n3', 'cache'); os.makedirs(cache, exist_ok=True)
FONT = os.path.join(here, '..', 'public', 'PixelifySans.ttf')
BG, PANEL, INK, CREAM, DIM = (36, 26, 30), (54, 40, 46), (20, 13, 14), (236, 222, 200), (168, 146, 150)
font = lambda s: ImageFont.truetype(FONT, s)

def shot(props, scale):
    key = hashlib.sha1((json.dumps(props, sort_keys=True) + str(scale) + os.environ.get('N3_REV', '')).encode()).hexdigest()[:16]
    f = os.path.join(cache, key + '.png')
    if not os.path.exists(f):
        subprocess.run([os.path.join(here, 'n3_still.sh'), f, json.dumps(props), str(scale)], check=True)
    return Image.open(f).convert('RGB')

def row(ims, gap=16):
    w = sum(i.width for i in ims) + gap * (len(ims) - 1); h = max(i.height for i in ims)
    o = Image.new('RGB', (w, h), PANEL); x = 0
    for i in ims: o.paste(i, (x, 0)); x += i.width + gap
    return o
def grid(ims, cols, gap=12):
    rows = [row(ims[i:i + cols], gap) for i in range(0, len(ims), cols)]
    o = Image.new('RGB', (max(r.width for r in rows), sum(r.height for r in rows) + gap * (len(rows) - 1)), PANEL); y = 0
    for r in rows: o.paste(r, (0, y)); y += r.height + gap
    return o
def fit(im, w, h=None):
    k = w / im.width if h is None else min(w / im.width, h / im.height)
    return im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
def palette(im, n=10):
    q = im.quantize(n, method=Image.Quantize.MEDIANCUT); p = q.getpalette()[:n * 3]
    cols = sorted([tuple(p[i * 3:i * 3 + 3]) for i in range(n)], key=lambda c: c[0] * 0.3 + c[1] * 0.6 + c[2] * 0.1)
    o = Image.new('RGB', (n * 84, 70), PANEL)
    for i, c in enumerate(cols): ImageDraw.Draw(o).rectangle([i * 84, 0, i * 84 + 76, 70], fill=c)
    return o

class Sheet:
    def __init__(self, w, title, sub):
        self.w = w; self.items = []; self.title = title; self.sub = sub
    def add(self, label, left, right, note=''):
        self.items.append((label, left, right, note))
    def save(self, path, lw):
        pad = 40; y = 150; hs = []
        for label, l, r, note in self.items: hs.append(max(l.height if l else 0, r.height) + 126 + (30 if note else 0))
        H = y + sum(hs) + pad
        o = Image.new('RGB', (self.w, H), BG); d = ImageDraw.Draw(o)
        d.text((pad, 30), self.title, font=font(58), fill=CREAM); d.text((pad, 100), self.sub, font=font(28), fill=DIM)
        for (label, l, r, note), h in zip(self.items, hs):
            d.rectangle([pad - 12, y, self.w - pad + 12, y + h - 24], fill=PANEL)
            d.text((pad + 8, y + 12), label, font=font(36), fill=CREAM)
            ty = y + 58
            if note: d.text((pad + 8, ty), note, font=font(22), fill=DIM); ty += 30
            if l:
                d.text((pad + 8, ty), 'your reference', font=font(22), fill=DIM); o.paste(l, (pad + 8, ty + 30))
                d.text((pad + lw + 40, ty), 'proposed, drawn by the engine', font=font(22), fill=DIM); o.paste(r, (pad + lw + 40, ty + 30))
            else:
                d.text((pad + 8, ty), 'proposed, drawn by the engine', font=font(22), fill=DIM); o.paste(r, (pad + 8, ty + 30))
            y += h
        o.save(path); print(path, o.size)

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
cs = Image.open(REF + 'character-sheet.png').convert('RGB'); bed = Image.open(REF + 'bedroom.jpg').convert('RGB')
ST = {'studio': True}
head = lambda face, **k: shot({'cam': 'head', 'w': 124, 'h': 124, 'yaw': 152, 'face': face, **ST, **k}, 3)
head2 = lambda face: shot({'cam': 'head', 'w': 124, 'h': 124, 'yaw': 152, 'face': face, **ST}, 3).resize((392, 392), Image.NEAREST)
SIT = {'cam': 'bed', 'clip': 'Sitting_Idle_Loop', 'at': [1.6, 3.02], 'seat': 0.47, 'yaw': 180, 'stance': 1, 'arms': 1, 'upright': 0.3, 'face': 'charm'}
WALK = {'clip': 'Walk_Loop', 't': 8, 'stance': 1, 'arms': 1, 'upright': 0.3, 'lookCam': 0}

# ---- sheet 1: the character ----
s = Sheet(2560, 'NIO  ·  second pass, next to your character sheet', 'Rebuilt from your notes: the eyes (heavy line, rounded square, big pupil tucked to one side), the head, the hair, quieter expressions, folded arms, the clothes.')
LW = 900
s.add('portrait', fit(cs.crop((18, 105, 400, 455)), LW, 760), row([shot({'cam': 'head', 'w': 124, 'h': 124, 'yaw': 150, 'face': 'neutral', **ST}, 6), shot({'cam': 'head', 'w': 124, 'h': 124, 'yaw': 180, 'face': 'deadpan', 'lookCam': 1, **ST}, 6)]),
      'Drawn at the same pixel size as your reference. Left: the same three-quarter view. Right: Nio at rest, straight on.')
s.add('eyes', fit(cs.crop((1010, 70, 1230, 195)), LW, 420), row([shot({'cam': 'face', 'w': 150, 'h': 84, 'yaw': 180, 'face': 'neutral', 'lookCam': 1, 'camPos': [2.0, 1.36, 1.3], 'camAt': [2.0, 1.345, 2.5], 'fov': 11, **ST}, 5)]),
      'A rounded square with a heavy line, a warm white, a tall pupil tucked to one side with one small bite of white. The two eyes are never quite the same size.')
s.add('expressions', fit(cs.crop((18, 478, 552, 795)), LW), grid([head(f) for f in ['neutral', 'smug', 'shock', 'uneasy', 'crushed', 'rage', 'laughing', 'sheepish']], 4),
      'The same eight as your sheet, in the same order. The eyes never change size: the feeling is in the lids, the pupils, the brows and the small marks. Shock is now small pupils, a tiny mouth and two marks.')
s.add('more of his faces', None, grid([head2(f) for f in ['deadpan', 'charm', 'suspicious', 'hyped', 'real', 'deadInside']], 6, 12), 'Deadpan is how he rests. Then charm, suspicious, hyped, sincere, dead inside.')
s.add('full body and poses', fit(cs.crop((562, 478, 1254, 800)), LW), row([
    shot({'cam': 'full', 'yaw': 172, **ST}, 2), shot({'cam': 'full', 'yaw': 158, 'crossed': True, 'face': 'smug', **ST}, 2), shot({'cam': 'mid', 'yaw': 165, 'crossed': True, 'face': 'smug', 'camPos': [2.25, 1.2, 0.9], 'camAt': [2.0, 1.02, 2.5], 'fov': 40, **ST}, 2), shot({'cam': 'full', 'yaw': 140, 'face': 'neutral', **ST, **WALK}, 2)], 12),
      'One body. Wide trousers that sit on the shoes, a boxy tee. Folded arms are rebuilt: both forearms across the chest, one hand on the other arm.')
s.add('more shots', fit(cs.crop((18, 1035, 1085, 1242)), LW), row([
    shot({'cam': 'head', 'w': 168, 'h': 168, 'yaw': 118, 'lookCam': 0, 'face': 'neutral', **ST}, 2), shot({'cam': 'head', 'w': 168, 'h': 168, 'yaw': 20, 'lookCam': 0, **ST}, 2),
    shot({'cam': 'mid', 'w': 168, 'h': 168, 'yaw': 200, 'phone': 1, 'face': 'deadpan', 'gaze': [0, -0.8], 'lookCam': 0, **ST}, 2), shot({'cam': 'head', 'w': 168, 'h': 168, 'yaw': 165, 'face': 'laughing', **ST}, 2)]))
s.add('clothes are real pieces', None, row([shot({'cam': 'full', 'yaw': 165, 'outfit': o, **ST}, 2) for o in ['home', 'olive', 'bare']] + [shot({'cam': 'full', 'yaw': 20, 'lookCam': 0, **ST}, 2), shot({'cam': 'full', 'yaw': 118, 'lookCam': 0, **ST}, 2)]),
      'The tee is one garment over a complete body. It changes or comes off without touching the character. The same model from the back and the side.')
ours = shot({'cam': 'full', 'yaw': 172, **ST}, 2)
s.add('palette', palette(cs.crop((570, 490, 1050, 790)), 10), palette(ours, 10))
s.save(os.path.join(out, 'nio-comparison-character.png'), LW)

# ---- sheet 2: the room ----
s = Sheet(2700, "NIO'S ROOM  ·  second pass, next to your bedroom", 'More of his things in it now: slippers, a mug and a note, books, a basket of clothes, a backpack, a pin board, photos on a string, an instant camera, and a door.')
LW = 1252
land = shot({'w': 320, 'h': 180, 'cam': 'land', 'actor': False}, 4)
s.add('the room', bed.resize((1252, 682), Image.LANCZOS), land)
import json as _j
SP = _j.load(open(os.path.join(here, 'n3_specs', 'cameras.json')))
def spec_shot(i, frame=12, scale=3):
    sp = SP[i]; key = hashlib.sha1((_j.dumps(sp, sort_keys=True) + str(frame) + str(scale) + os.environ.get('N3_REV', '')).encode()).hexdigest()[:16]
    f = os.path.join(cache, 's' + key + '.png')
    if not os.path.exists(f):
        tmp = os.path.join(cache, '_spec.json'); _j.dump(sp, open(tmp, 'w'))
        subprocess.run([os.path.join(here, 'n3_shot.sh'), tmp, f, str(frame), str(scale)], check=True, stdout=subprocess.DEVNULL)
    return Image.open(f).convert('RGB')
s.add('the same room in the upright frame the show uses', None, row([spec_shot(0), spec_shot(7, 30), spec_shot(8), spec_shot(10)], 20),
      'These four are drawn through the world rules: a named camera, a named place, a named action and face. The rules refuse anything else.')
s.add('more corners of it', None, row([spec_shot(12), spec_shot(4), spec_shot(6), spec_shot(9)], 20), 'The door, from the floor looking up, from the top corner, at the dresser.')
s.add('palette', palette(bed, 12), palette(land, 12))
s.save(os.path.join(out, 'nio-comparison-room.png'), LW)
