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
head = lambda face, **k: shot({'cam': 'face', 'w': 112, 'h': 112, 'yaw': 150, 'face': face, **ST, **k}, 3)
SIT = {'cam': 'bed', 'clip': 'Sitting_Idle_Loop', 'at': [1.6, 3.02], 'seat': 0.47, 'yaw': 180, 'stance': 1, 'arms': 1, 'upright': 0.3, 'face': 'charm'}
WALK = {'clip': 'Walk_Loop', 't': 8, 'stance': 1, 'arms': 1, 'upright': 0.3, 'lookCam': 0}

# ---- sheet 1: the character ----
s = Sheet(2560, 'NIO  ·  proposed look next to your character sheet', 'Original character, same technique: chunky uneven hair, large simple eyes that are never quite the same size, off-centre pupils, uneven ink line, flat colour with a blocky texture.')
LW = 980
s.add('portrait', fit(cs.crop((18, 105, 400, 455)), LW, 760), shot({'cam': 'head', 'w': 190, 'h': 190, 'yaw': 150, 'face': 'neutral', **ST}, 4))
s.add('expressions', fit(cs.crop((18, 478, 552, 795)), LW), grid([head(f) for f in ['neutral', 'deadpan', 'suspicious', 'shock', 'crushed', 'rage', 'laughing', 'sheepish']], 4),
      'Every expression is a set of numbers on the same face, so any two blend and nothing off-model can be drawn.')
s.add('full body and poses', fit(cs.crop((562, 478, 1254, 800)), LW), row([
    shot({'cam': 'full', 'yaw': 172, **ST}, 2), shot({'cam': 'full', 'yaw': 150, 'crossed': True, 'face': 'smug', **ST}, 2), shot(SIT, 2), shot({'cam': 'full', 'yaw': 140, 'face': 'neutral', **ST, **WALK}, 2)]),
      'One body. Standing, folded arms, sitting on his bed and walking are the same rig; the walk is real human motion.')
s.add('more shots', fit(cs.crop((18, 1035, 1085, 1242)), LW), row([
    shot({'cam': 'head', 'w': 168, 'h': 168, 'yaw': 118, 'lookCam': 0, 'face': 'neutral', **ST}, 2), shot({'cam': 'head', 'w': 168, 'h': 168, 'yaw': 20, 'lookCam': 0, **ST}, 2),
    shot({'cam': 'mid', 'w': 168, 'h': 168, 'yaw': 200, 'phone': 1, 'face': 'suspicious', 'gaze': [0, -0.8], 'lookCam': 0, **ST}, 2), shot({'cam': 'head', 'w': 168, 'h': 168, 'yaw': 165, 'face': 'asleep', **ST}, 2)]))
s.add('clothes are real pieces', None, row([shot({'cam': 'full', 'yaw': 165, 'outfit': o, **ST}, 2) for o in ['home', 'olive', 'bare']] + [shot({'cam': 'full', 'yaw': 20, 'lookCam': 0, **ST}, 2), shot({'cam': 'full', 'yaw': 118, 'lookCam': 0, **ST}, 2)]),
      'The tee is one garment over a complete body. It changes or comes off without touching the character. The same model from the back and the side.')
ours = shot({'cam': 'full', 'yaw': 172, **ST}, 2)
s.add('palette', palette(cs.crop((570, 490, 1050, 790)), 10), palette(ours, 10))
s.save(os.path.join(out, 'nio-comparison-character.png'), LW)

# ---- sheet 2: the room ----
s = Sheet(2700, "NIO'S ROOM  ·  proposed look next to your bedroom", 'Same language: dark wood boards, a rain window, a string of lights, warm lamp pools that fall off in steps, flecked cloth. Built as a real room, so the camera can stand anywhere.')
LW = 1252
land = shot({'w': 320, 'h': 180, 'cam': 'land', 'actor': False}, 4)
s.add('the room', bed.resize((1252, 682), Image.LANCZOS), land)
s.add('the same room in the upright frame the show uses', None, row([
    shot({'cam': 'wide', 'yaw': 150, 'at': [2.2, 2.6]}, 3), shot({'cam': 'high', 'yaw': 215, 'at': [2.1, 2.5], 'face': 'neutral', **WALK}, 3),
    shot(SIT, 3), shot({'cam': 'low', 'yaw': 152, 'phone': 1, 'face': 'shock', 'gaze': [0, -0.7], 'lookCam': 0}, 3)], 20))
s.add('palette', palette(bed, 12), palette(land, 12))
s.save(os.path.join(out, 'nio-comparison-room.png'), LW)
