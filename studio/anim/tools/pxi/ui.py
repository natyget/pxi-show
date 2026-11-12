#!/usr/bin/env python3
"""The drawing kit for PXI's screens in the show's pixels.

A phone screen in the show is 360 x 780 hard pixels: the real app's 393 x 852 points at 0.916 pixels a point, which is
twice as fine as the world (the world is 180 pixels wide). Nothing is drawn smooth and then filtered. Shapes are filled
pixel by pixel, text is the app's own fonts set straight onto the pixel grid with no smoothing, and icons are the
app's own icon set reduced to on-or-off pixels.

Sizes come from the app's code in points and go through pt(). Positions are in pixels on the 360 x 780 screen.
"""
import hashlib, json, os, subprocess
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ANIM = os.path.abspath(os.path.join(HERE, '..', '..'))
UI = os.path.join(ANIM, 'public', 'pxi-ui')
OUT = os.path.join(ANIM, 'out', 'pxi')
os.makedirs(os.path.join(OUT, 'world'), exist_ok=True)

W, H = 360, 780
K = W / 393.0
def pt(v): return max(1, round(v * K))
def sysp(v): return max(1, round(v * K * 0.95))   # body text in the system font: Inter runs about 5% wider than San Francisco

BLACK, WHITE = (0, 0, 0), (255, 255, 255)
PURPLE = (0xA5, 0x23, 0xEF)          # the app's one purple
G1C, G2E = (0x1C, 0x1C, 0x1C), (0x2E, 0x2E, 0x2E)   # the app's two flat greys
def mix(a, b, t): return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))
def white(a, bg=BLACK): return mix(bg, WHITE, a)    # white at an opacity over a flat ground
def hexc(s): s = s.lstrip('#'); return tuple(int(s[i:i + 2], 16) for i in (0, 2, 4))

# The app's type. Headers are Stack Sans Notch; everything else is the system font, which on a phone is San Francisco.
# Inter stands in for it here (same proportions, free licence).
FACES = {'serif': 'Gelasio.ttf', 'display': 'StackSansNotch-Bold.ttf', 'display6': 'StackSansNotch-SemiBold.ttf', 'mono': 'DMMono-Medium.ttf',
         400: 'Inter-Regular.otf', 500: 'Inter-Medium.otf', 600: 'Inter-SemiBold.otf', 700: 'Inter-Bold.otf',
         800: 'Inter-ExtraBold.otf', 900: 'Inter-Black.otf'}
_fonts = {}
def font(face, px):
    k = (face, px)
    if k not in _fonts: _fonts[k] = ImageFont.truetype(os.path.join(UI, 'fonts', FACES[face]), px)
    return _fonts[k]
def text_w(t, face, px, ls=0):
    f = font(face, px); return round(sum(f.getlength(c) for c in t) + ls * max(0, len(t) - 1))

def _mask1(im, thr=128):
    """An on-or-off mask from a smooth alpha."""
    return im.point(lambda v: 255 if v >= thr else 0)

ICON_THR = {'Mic01Icon': 124}
def icon_mask(name, px, thr=96):
    """One of the app's icons as on-or-off pixels. tools/pxi/icons.cjs draws it large; this reduces it and keeps it."""
    small = os.path.join(UI, 'icons', f'{name}_{px}.png')
    if not os.path.exists(small):
        big = os.path.join(OUT, 'icons_big', f'{name}_{px}.png')
        if not os.path.exists(big): raise FileNotFoundError(f'draw {name}:{px} with tools/pxi/icons.cjs first')
        a = Image.open(big).convert('RGBA').getchannel('A').resize((px, px), Image.BOX)
        _mask1(a, ICON_THR.get(name, thr)).save(small)
    return Image.open(small).convert('L')

NOTO = '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf'
def emoji_im(ch, px):
    """A small emoji in hard pixels and few colours, kept in public/pxi-ui/emoji."""
    f = os.path.join(UI, 'emoji', f'{"-".join(format(ord(c), "x") for c in ch)}_{px}.png')
    if not os.path.exists(f):
        ft = ImageFont.truetype(NOTO, 109); big = Image.new('RGBA', (160, 160), (0, 0, 0, 0))
        ImageDraw.Draw(big).text((12, 12), ch, font=ft, embedded_color=True)
        big = big.crop(big.getbbox()); k = px / max(big.size)
        sm = big.resize((max(1, round(big.width * k)), max(1, round(big.height * k))), Image.BOX)
        a = _mask1(sm.getchannel('A'), 110)
        rgb = sm.convert('RGB').quantize(10, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
        o = Image.new('RGBA', sm.size, (0, 0, 0, 0)); o.paste(rgb, (0, 0), a); o.save(f)
    return Image.open(f).convert('RGBA')

def reduce_art(name, w, colors=12):
    """Art drawn large by tools/pxi/svg.cjs (a stamp), reduced to hard pixels and few colours; kept in public/pxi-ui/art."""
    f = os.path.join(UI, 'art', f'{name}_{w}.png')
    if not os.path.exists(f):
        os.makedirs(os.path.dirname(f), exist_ok=True)
        big = Image.open(os.path.join(OUT, 'svg_big', f'{name}_{w}.png')).convert('RGBA')
        sm = big.resize((w, round(big.height * w / big.width)), Image.BOX); a = _mask1(sm.getchannel('A'), 120)
        flat = Image.new('RGB', sm.size, (0, 0, 0)); flat.paste(sm.convert('RGB'), (0, 0), sm.getchannel('A'))
        rgb = flat.quantize(colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
        o = Image.new('RGBA', sm.size, (0, 0, 0, 0)); o.paste(rgb, (0, 0), a); o.save(f)
    return Image.open(f).convert('RGBA')

def world(props, w, h, rev=''):
    """A picture from the show's world, drawn by the engine at exactly w x h pixels (one engine pixel = one screen pixel)."""
    p = dict(props); p['w'] = w; p['h'] = h
    key = hashlib.sha1((json.dumps(p, sort_keys=True) + rev).encode()).hexdigest()[:16]
    f = os.path.join(OUT, 'world', key + '.png')
    if not os.path.exists(f):
        subprocess.run([os.path.join(ANIM, 'tools', 'n3_still.sh'), f, json.dumps(p), '1'], check=True)
    return Image.open(f).convert('RGB')

class Screen:
    def __init__(s, bg=BLACK, w=W, h=H):
        s.im = Image.new('RGB', (w, h), bg); s.d = ImageDraw.Draw(s.im); s.d.fontmode = '1'

    # ---- shapes. Boxes are x0, y0, x1, y1 with x1 and y1 one past the last pixel.
    def box(s, x0, y0, x1, y1, fill, r=0, small=None):
        """A filled box with round corners. `small` = (corner, radius) gives one corner a tighter radius, the way the
        app's chat bubbles have one tight corner. corner is 'tl', 'tr', 'br' or 'bl'."""
        r = min(r, (x1 - x0) // 2, (y1 - y0) // 2)
        s.d.rounded_rectangle([x0, y0, x1 - 1, y1 - 1], r, fill=fill)
        if small:
            c, r2 = small; cx0 = x0 if c in ('tl', 'bl') else x1 - r - 1; cy0 = y0 if c in ('tl', 'tr') else y1 - r - 1
            s.d.rounded_rectangle([cx0, cy0, cx0 + r, cy0 + r], r2, fill=fill)
    def ring(s, x0, y0, x1, y1, col, r=0, w=1):
        s.d.rounded_rectangle([x0, y0, x1 - 1, y1 - 1], r, outline=col, width=w)
    def disc(s, x0, y0, d, fill): s.d.ellipse([x0, y0, x0 + d - 1, y0 + d - 1], fill=fill)
    def line(s, x0, y0, x1, y1, col, w=1): s.d.line([x0, y0, x1, y1], fill=col, width=w)

    # ---- type. y is the middle of the capital letters, which is where the app centres a line.
    def text(s, x, y, t, face, px, fill, ls=0, align='l'):
        f = font(face, px); cap = -f.getbbox('H', anchor='ls')[1]; base = y + (cap + 1) // 2
        w = text_w(t, face, px, ls)
        x = x - w if align == 'r' else x - w // 2 if align == 'c' else x
        cx = float(x)
        for c in t:
            s.d.text((round(cx), base), c, font=f, fill=fill, anchor='ls'); cx += f.getlength(c) + ls
        return x, x + w

    # ---- pictures
    def icon(s, name, px, cx, cy, fill, thr=96):
        m = icon_mask(name, px, thr); s.im.paste(Image.new('RGB', m.size, fill), (cx - px // 2, cy - px // 2), m)
    def emoji(s, ch, px, cx, cy):
        e = emoji_im(ch, px); s.im.paste(e, (cx - e.width // 2, cy - e.height // 2), e)
    def photo(s, im, x0, y0, x1, y1, r=0):
        w, h = x1 - x0, y1 - y0
        if im.size != (w, h):   # cover-fit with hard pixels
            k = max(w / im.width, h / im.height); im = im.resize((max(w, round(im.width * k)), max(h, round(im.height * k))), Image.NEAREST)
            ox, oy = (im.width - w) // 2, (im.height - h) // 2; im = im.crop((ox, oy, ox + w, oy + h))
        m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, w - 1, h - 1], min(r, w // 2, h // 2), fill=255)
        s.im.paste(im, (x0, y0), m)
    def avatar(s, im, x0, y0, d): s.photo(im, x0, y0, x0 + d, y0 + d, r=d // 2)
    def paste(s, other, x, y, mask=None): s.im.paste(other, (x, y), mask)

    def shade(s, x0, y0, x1, y1, a0, a1, col=BLACK):
        """A soft shade the pixel way: a checker of darkened pixels that thins out from strength a0 at the top to a1 at
        the bottom. This is how the app's see-through blacks and gradients are drawn here."""
        B = ((0, 8, 2, 10), (12, 4, 14, 6), (3, 11, 1, 9), (15, 7, 13, 5)); am = max(a0, a1)
        if am <= 0: return
        for y in range(max(0, y0), min(s.im.height, y1)):
            a = a0 + (a1 - a0) * (y - y0) / max(1, y1 - y0 - 1)
            for x in range(max(0, x0), min(s.im.width, x1)):
                if (B[y % 4][x % 4] + 0.5) / 16 < a / am: s.im.putpixel((x, y), mix(s.im.getpixel((x, y)), col, am))
    def stamp(s, name, w, cx, cy):
        """One of the app's stamps (tools/pxi/stamps.sh), with its lettering set again on the pixel grid."""
        import json
        art = reduce_art(name, w); x0, y0 = cx - art.width // 2, cy - art.height // 2; s.im.paste(art, (x0, y0), art)
        meta = json.load(open(os.path.join(OUT, 'svg_big', f'{name}_{w}.json')))
        for t in meta['texts']:
            if t['op'] < 1: continue
            px = max(7, round(t['size'] * meta['unit'])); face = 800 if px < 10 else 'serif'
            f = font(face, px); tw = text_w(t['s'], face, px, 1); x = x0 + t['x'] * meta['unit'] - tw / 2; y = y0 + round(t['y'] * meta['unit'])
            for c in t['s']:
                s.d.text((round(x), y), c, font=f, fill=hexc(t['fill']), anchor='ls'); x += f.getlength(c) + 1

    # ---- the phone's own status bar: the time, signal, wifi, battery
    def status(s, time='9:41', col=WHITE):
        s.text(50, 28, time, 600, pt(17), col)
        for i, hh in enumerate((4, 6, 9, 11)): s.box(258 + i * 5, 34 - hh, 261 + i * 5, 34, col)
        cx, cy = 290, 33                       # wifi: three arcs and a dot
        for rad, wd in ((10, 2), (6, 2)): s.d.arc([cx - rad, cy - rad, cx + rad, cy + rad], 225, 315, fill=col, width=wd)
        s.box(cx - 1, cy - 3, cx + 2, cy, col)
        s.ring(304, 23, 326, 34, mix(BLACK, col, 0.45), r=3); s.box(306, 25, 324, 32, col, r=1); s.box(326, 27, 328, 31, mix(BLACK, col, 0.45))
