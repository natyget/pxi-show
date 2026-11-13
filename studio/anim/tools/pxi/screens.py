#!/usr/bin/env python3
"""PXI's real screens, drawn in the show's pixels. One function per screen; each says which file of pxi-mobile-app it
copies. Wording is the app's own, character for character. Photos and faces come from the show's world.

  screens.py <name> [out.png]     name: thread | gallery | camera | discover | all
"""
import math, os, sys
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui import *

# ---- pictures from Nio's world, by name. Each is drawn by the engine at the exact size the screen needs.
ROOM = {'lookCam': 0.7}
SHOTS = {
    'cover':    {'cam': 'mid', 'camPos': [2.45, 1.5, 0.75], 'camAt': [1.95, 1.45, 2.5], 'fov': 52, 'yaw': 165, 'face': 'smug', 'crossed': True, 'lookCam': 1},
    'view':     {'cam': 'wide', 'camPos': [2.9, 1.45, 0.25], 'camAt': [1.75, 1.0, 3.6], 'fov': 62, 'actor': False},
    'selfie':   {'cam': 'head', 'yaw': 168, 'face': 'charm', 'lookCam': 1},
    'passport': {'cam': 'head', 'camPos': [2.0, 1.44, 1.2], 'camAt': [2.0, 1.42, 2.5], 'fov': 36, 'yaw': 180, 'face': 'smug', 'lookCam': 1},
    'avatar':   {'cam': 'head', 'camPos': [2.12, 1.45, 1.3], 'camAt': [2.0, 1.44, 2.5], 'fov': 24, 'yaw': 172, 'face': 'charm', 'lookCam': 1},
    'smug':     {'cam': 'mid', 'yaw': 160, 'face': 'smug', 'crossed': True, 'lookCam': 1},
    'bed':      {'cam': 'bed', 'clip': 'Sitting_Idle_Loop', 'at': [1.6, 3.02], 'seat': 0.47, 'yaw': 180, 'stance': 1, 'arms': 1, 'upright': 0.3, 'face': 'charm'},
    'laugh':    {'cam': 'head', 'yaw': 190, 'face': 'laughing', 'lookCam': 0.4},
    'walk':     {'cam': 'full', 'yaw': 140, 'face': 'neutral', 'clip': 'Walk_Loop', 't': 8, 'stance': 1, 'arms': 1, 'upright': 0.3, 'lookCam': 0},
    'low':      {'cam': 'low', 'yaw': 200, 'face': 'smug', 'crossed': True, 'lookCam': 1},
    'high':     {'cam': 'high', 'yaw': 215, 'face': 'hyped', 'lookCam': 1},
    'phone':    {'cam': 'mid', 'yaw': 195, 'face': 'deadpan', 'phone': 1, 'gaze': [0, -0.8], 'lookCam': 0},
    'window':   {'cam': 'land', 'actor': False},
    'lockwall': {'cam': 'wide', 'camPos': [2.5, 1.5, 0.6], 'camAt': [1.7, 1.25, 4.4], 'fov': 58, 'actor': False},
    'room':     {'cam': 'wide', 'actor': False},
    'close':    {'cam': 'close', 'yaw': 150, 'face': 'suspicious', 'lookCam': 1},
    'side':     {'cam': 'side', 'yaw': 250, 'face': 'real', 'lookCam': 0.8},
    'stand':    {'cam': 'full', 'yaw': 172, 'face': 'deadpan', 'lookCam': 1},
    'olive':    {'cam': 'mid', 'yaw': 175, 'face': 'charm', 'outfit': 'olive', 'lookCam': 1},
    'lamp':     {'camPos': [0.35, 1.36, 0.9], 'camAt': [0.7, 1.05, 2.65], 'fov': 60, 'cam': 'full', 'actor': False},
    'desk':     {'camPos': [2.2, 1.5, 1.6], 'camAt': [3.6, 0.9, 1.2], 'fov': 50, 'cam': 'full', 'actor': False},
    'sheepish': {'cam': 'head', 'yaw': 150, 'face': 'sheepish', 'lookCam': 1},
    'bed2':     {'cam': 'high', 'clip': 'Sitting_Idle_Loop', 'at': [1.6, 3.02], 'seat': 0.47, 'yaw': 170, 'stance': 1, 'arms': 1, 'upright': 0.3, 'face': 'deadpan', 'lookCam': 1},
}
def pic(name, w, h): return world(SHOTS[name], w, h)

def nobody(d):
    """The app's own blank avatar (src/components/ui/AnonymousAvatarSilhouette.tsx): #111 with a #2a2a2a head and shoulders."""
    im = Image.new('RGB', (d, d), hexc('111111')); g = ImageDraw.Draw(im); k = d / 64
    g.ellipse([round(20 * k), round(12 * k), round(44 * k), round(36 * k)], fill=hexc('2a2a2a'))
    g.ellipse([round(10 * k), round(42 * k), round(54 * k), round(86 * k)], fill=hexc('2a2a2a'))
    return im

def header(s, title):
    """The album top bar and the THREAD / GALLERY switch (app/album/[id].tsx: header, albumTitle, toggleSwitch)."""
    s.status()
    s.icon('ArrowLeft01Icon', 24, 26, 80, WHITE)
    s.text(180, 80, title.upper(), 'display', pt(14), WHITE, ls=1, align='c')
    s.icon('MoreHorizontalIcon', 24, 334, 80, WHITE)
def switch(s, on):
    s.box(15, 110, 345, 156, G1C, r=23)
    x = 20 if on == 'THREAD' else 183
    s.box(x, 116, x + 157, 150, PURPLE, r=17)
    for name, cx in (('THREAD', 99), ('GALLERY', 262)):
        s.text(cx + 1, 133, name, 900, pt(11), WHITE if name == on else white(0.3, G1C), ls=2, align='c')

def chip(s, x, y, em, n, mine=False, h=32):
    """One reaction chip of the bar under a photo (AlbumReactionBar.tsx: chipPill, chipActive, chipCount)."""
    tw = text_w(n, 800, pt(12)); w = 8 + 20 + 3 + tw + 9
    s.box(x, y, x + w, y + h, mix(G1C, PURPLE, 0.15) if mine else G1C, r=h // 2)
    s.emoji(em, pt(18), x + 18, y + h // 2)
    s.text(x + 31, y + h // 2, n, 800, pt(12), PURPLE if mine else WHITE)
    return x + w

def tag(s, x, y, ems, n, bg=BLACK):
    """The small reaction pill that hangs off a message."""
    w = 6 + 13 * len(ems) + 2 + text_w(n, 700, pt(11)) + 7
    s.box(x - 2, y - 2, x + w + 2, y + 20, bg, r=11); s.box(x, y, x + w, y + 18, G1C, r=9)
    for i, e in enumerate(ems): s.emoji(e, 11, x + 12 + 13 * i, y + 9)
    s.text(x + 8 + 13 * len(ems), y + 9, n, 700, pt(11), hexc('cfcfcf'))

def thread():
    """The album thread. Sources: app/album/[id].tsx, src/components/album/ThreadView.tsx, AlbumThreadMediaCard.tsx,
    AlbumReactionBar.tsx, ChatBar.tsx, AlbumThreadAddMenu.tsx, src/components/messages/VoiceNoteBubble.tsx."""
    s = Screen()
    # the photo card at the top of the list sits a little crooked, with its reaction bar; build it flat, then turn it
    c = Screen(w=W, h=300)
    c.box(30, 0, 336, 62, G1C, r=14); c.photo(pic('smug', 298, 220), 34, -100, 332, 58, r=10)
    for yy in range(22, 58):                                   # a dithered shade under the caption
        for xx in range(34, 332):
            if (xx + yy) % 2 == 0 and c.im.getpixel((xx, yy)) != G1C: c.im.putpixel((xx, yy), mix(c.im.getpixel((xx, yy)), BLACK, 0.55))
    c.avatar(pic('avatar', 27, 27), 52, 27, 27); c.text(88, 40, 'framing this one', 500, sysp(15), WHITE)
    x = chip(c, 42, 76, '❤️', '41', mine=True); x = chip(c, x + 6, 76, '✨', '22'); x = chip(c, x + 6, 76, '\U0001F64C', '13'); chip(c, x + 6, 76, '\U0001F60D', '9')
    c.box(262, 70, 360, 114, BLACK); c.disc(267, 75, 35, G1C); c.icon('Add01Icon', 18, 284, 92, WHITE); c.icon('LinkForwardIcon', 24, 320, 92, WHITE)
    card = c.im.rotate(1.5, Image.NEAREST, center=(180, 60)); s.paste(card.crop((0, 0, W, 125)), 0, 136)
    s.box(0, 0, W, 158, BLACK); header(s, 'Late Checkout'); switch(s, 'THREAD')

    # someone else's message
    s.box(64, 279, 297, 327, G1C, r=16, small=('bl', 5))
    s.text(75, 292, 'AMA.K', 800, pt(10), hexc('9A9A9A'), ls=1); s.text(286, 292, '11:57 PM', 700, pt(9.5), hexc('7A7A7A'), align='r')
    s.text(75, 311, 'the couch one is going on my wall', 500, sysp(15), WHITE)
    s.avatar(nobody(29), 26, 295, 29); tag(s, 72, 319, ['\U0001F602'], '6')
    # the viewer's own message is purple
    s.box(148, 353, 295, 399, PURPLE, r=16, small=('br', 5)); on = mix(PURPLE, WHITE, 0.72)
    s.text(160, 365, 'YOU', 800, pt(10), on, ls=1); s.text(284, 365, '11:58 PM', 700, pt(9.5), on, align='r')
    s.text(160, 384, 'best night in a while', 500, sysp(15), WHITE)
    s.avatar(pic('avatar', 29, 29), 305, 370, 29); tag(s, 246, 392, ['\U0001F49C'], '12')
    # a voice note
    s.text(116, 432, 'YOU', 800, pt(10), hexc('9A9A9A'), ls=1)
    s.box(116, 441, 295, 480, PURPLE, r=20); s.disc(122, 447, 27, WHITE); s.icon('PlayIcon', 14, 136, 460, BLACK)
    for i in range(24):
        env = 0.45 + 0.55 * math.sin(math.pi * (i + 0.5) / 24); hgt = round(5 + (0.5 + 0.5 * math.sin(i * 2.4 + 1.3)) * env * 13)
        bx = 158 + round(i * 3.75); s.box(bx, 460 - hgt // 2, bx + 2, 460 - hgt // 2 + hgt, mix(PURPLE, WHITE, 0.45))
    s.text(257, 460, '0:07', 800, pt(11), WHITE)
    s.avatar(pic('avatar', 29, 29), 305, 446, 29)
    # a photo in the chat
    s.text(70, 504, 'KOFI', 800, pt(10), hexc('9A9A9A'), ls=1); s.text(248, 504, '12:01 AM', 700, pt(9.5), hexc('7A7A7A'), align='r')
    s.photo(pic('window', 180, 134), 69, 516, 249, 650); s.avatar(nobody(29), 26, 627, 29); tag(s, 69, 651, ['\U0001F525', '\U0001F64C'], '13')
    # the add button and the message bar
    s.disc(292, 643, 51, PURPLE); s.icon('Add01Icon', 24, 317, 668, WHITE)
    s.disc(19, 713, 40, G1C); s.text(39, 733, 'GIF', 900, pt(11), WHITE, ls=1, align='c')
    s.disc(70, 713, 40, G1C); s.icon('Mic01Icon', 17, 90, 733, WHITE)
    s.box(120, 713, 290, 753, G1C, r=20); s.text(134, 733, 'Type a message...', 400, sysp(15), white(0.35, G1C))
    s.disc(301, 713, 40, G2E); s.icon('SentIcon', 18, 320, 734, white(0.35, G2E))
    return s.im

def gallery():
    """The album gallery. Sources: app/album/[id].tsx, src/components/album/AlbumMasonryGrid.tsx (three square cells a
    row, each a rounded tile with the poster's avatar and the top reaction), YourNightControls.tsx (the viewer's own
    shots come first, then the quiet line "Everyone else"), AlbumThreadAddMenu.tsx."""
    s = Screen()
    tiles = [('smug', '\U0001F525', '156'), ('bed', '\U0001F60D', '124'), ('laugh', '\U0001F60D', '91'), ('low', '\u2764\ufe0f', '90'), ('olive', '\u270c\ufe0f', '83'), ('high', '\U0001F525', '77'),
             ('window', '\u2764\ufe0f', '71'), ('close', '\U0001F942', '66'), ('room', '\U0001FAF6', '61'), ('walk', '\U0001F525', '58'), ('lamp', '\u2728', '52'), ('sheepish', '\U0001F3A7', '47'),
             ('desk', '\U0001F64C', '44'), ('bed2', '\U0001F60D', '39'), ('side', '\U0001F64C', '36')]
    def tile(i, y, mine):
        name, em, n = tiles[i]; x = (i % 3) * 120
        s.photo(pic(name, 116, 116), x + 2, y + 2, x + 118, y + 118, r=pt(14))
        s.disc(x + 9, y + 85, 26, G1C); s.avatar(pic('avatar', 22, 22) if mine else nobody(22), x + 11, y + 87, 22)
        w = 6 + 12 + 2 + text_w(n, 800, pt(10)) + 6; bx = x + 111 - w
        for yy in range(y + 96, min(H, y + 111)):              # the badge is see-through black: every other pixel
            for xx in range(bx, bx + w):
                r = 7; cx = min(max(xx, bx + r), bx + w - r - 1); cy = min(max(yy, y + 96 + r), y + 110 - r)
                if (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r + 2: s.im.putpixel((xx, yy), mix(s.im.getpixel((xx, yy)), BLACK, 0.62))
        s.emoji(em, 11, bx + 11, y + 103); s.text(bx + 19, y + 103, n, 800, pt(10), WHITE)
    for i in range(6): tile(i, 160 + (i // 3) * 120, True)
    s.text(pt(16), 427, 'Everyone else', 600, sysp(13), white(0.55))
    for i in range(6, 15): tile(i, 444 + ((i - 6) // 3) * 120, False)
    s.box(0, 0, W, 158, BLACK); header(s, 'Late Checkout'); switch(s, 'GALLERY')
    s.disc(292, 643, 51, PURPLE); s.icon('Add01Icon', 24, 317, 668, WHITE)
    return s.im

def tabbar(s, on):
    """The floating tab bar: a pill of three buttons, Home, Camera and Nights (app/(tabs)/_layout.tsx). The Passport
    has no button; the avatar at the top left of Home opens it."""
    s.box(76, 700, 284, 758, hexc('1A1A1A'), r=29)
    for i, name in enumerate(('Home05Icon', 'Camera02Icon', 'Ticket01Icon')):
        s.icon(name, 22, 111 + round(i * 69.6), 729, WHITE if i == on else white(0.4, hexc('1A1A1A')))

def fit_title(words, box_w, max_h, hi, lo):
    """The cover's name as huge caps: the largest size at which every line fits the box (EventCover.tsx, fitTitle)."""
    for px in range(hi, lo - 1, -1):
        lines, cur = [], ''
        for w in words:
            t = (cur + ' ' + w).strip()
            if text_w(t, 'display', px, -1) <= box_w: cur = t
            else:
                if cur: lines.append(cur)
                cur = w
        lines.append(cur); lh = round(px * 0.98)
        if all(text_w(l, 'display', px, -1) <= box_w for l in lines) and lh * len(lines) <= max_h: return px, lines
    return lo, lines

def cover(photo, name, by, k=1.0, faces=0, extra='', centre=True):
    """One event cover (src/components/discover/EventCover.tsx): 3:4, the name in huge caps top left, BY HOST in light
    purple, faces bottom left, the heart bottom right and the orange record tab on the right edge."""
    cw, ch = round(184 * k), round(245 * k); c = Screen(w=cw, h=ch, bg=hexc('111111'))
    c.photo(pic(photo, cw, ch), 0, 0, cw, ch)
    c.shade(0, 0, cw, ch // 2, 0.42, 0.0); c.shade(0, ch - round(ch * 0.32), cw, ch, 0.0, 0.5)
    pad = round(cw * 0.07); px, lines = fit_title(name.upper().split(), cw - 2 * pad, ch * 0.34, round(cw * 0.195), round(cw * 0.085))
    y = pad + round(px * 0.42)
    for l in lines:
        c.text(pad, y + 1, l, 'display', px, mix(hexc('111111'), BLACK, 0.5), ls=-1); c.text(pad, y, l, 'display', px, WHITE, ls=-1); y += round(px * 0.98)
    if by: c.text(pad, y - round(px * 0.98) + round(px * 0.37) + 5 + 5, by, 900, max(8, round(cw * 0.05)), hexc('D651FB'), ls=1)
    face = round(21 * max(0.85, k)); fx = pad
    for i in range(faces):
        c.disc(fx, ch - pad - face, face, hexc('EBEBEB')); c.avatar(pic('avatar', face - 2, face - 2) if i == 0 else nobody(face - 2), fx + 1, ch - pad - face + 1, face - 2); fx += face - round(face * 0.32)
    if extra:
        fx += round(face * 0.32) + 5; w = 7 + text_w(extra, 900, pt(10.5)) + 7
        c.box(fx, ch - pad - face, fx + w, ch - pad, hexc('EBEBEB'), r=face // 2); c.text(fx + 7, ch - pad - face + face // 2, extra, 900, pt(10.5), hexc('111111'))
    if centre:
        d = pt(32); hx, hy = cw - pad - d, ch - pad - d
        for yy in range(hy, hy + d):
            for xx in range(hx, hx + d):
                if (xx - hx - d / 2 + 0.5) ** 2 + (yy - hy - d / 2 + 0.5) ** 2 <= (d / 2) ** 2: c.im.putpixel((xx, yy), mix(c.im.getpixel((xx, yy)), BLACK, 0.38))
        c.icon('FavouriteIcon', 15, hx + d // 2, hy + d // 2, WHITE)
    tr = round(cw * 0.13); ty = round(ch * 0.48) - tr
    c.d.ellipse([cw - tr, ty, cw + tr, ty + 2 * tr], fill=hexc('FF5A1F'))
    if centre: c.icon('MusicNote01Icon', 15, cw - tr // 2 + 1, ty + tr, WHITE)
    m = Image.new('L', (cw, ch), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, cw - 1, ch - 1], round(pt(18) * k), fill=255)
    return c.im, m

def record(s, cx, cy, R):
    """The vinyl record tucked behind the centred cover (VinylDisc.tsx): near-black, fine grooves, a pale rim line."""
    for r in range(R, 0, -1):
        t = r / R; g = mix(hexc('161616'), hexc('060606'), t)
        if r % 3 == 0 and 0.36 < t < 0.97: g = mix(g, WHITE, 0.07)
        if r == R: g = mix(BLACK, WHITE, 0.12)
        s.d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=g)

def discover():
    """Home, in its Discover state. Sources: app/(tabs)/index.tsx, src/components/discover/DiscoverScreen.tsx (the order
    of the page and how the spare height is shared), geometry.ts (every size on the stage comes from the cover's width),
    WallSwitcher.tsx (the title), PassportAvatarButton.tsx, DiscoverFilterBar.tsx, when/ViewSwitch.tsx, DiscoverStage.tsx,
    EventCover.tsx, VinylDisc.tsx, DiscoverDetails.tsx, src/components/stamps (the stamp is the app's own drawing)."""
    s = Screen(); s.status()
    # the title row: the viewer's avatar (it opens the Passport), the title with its chevron, the purple Create button
    s.avatar(pic('avatar', 38, 38), 15, 66, 38)
    x0, x1 = s.text(186, 85, 'Discover', 'display', pt(33), WHITE, ls=-1, align='c'); s.icon('ArrowDown01Icon', 13, x1 + 9, 89, WHITE)
    s.disc(307, 66, 38, PURPLE); s.icon('PlusSignIcon', 18, 326, 85, WHITE)
    # the filter pill: at <when> in <city>, then sort and search
    P = hexc('232323'); s.box(7, 116, 353, 167, P, r=26); x = 23
    def group(x, small, value):
        _, x = s.text(x, 142, small, 700, pt(14), white(0.35, P)); _, x = s.text(x + 16, 141, value, 800, pt(20), WHITE)
        s.icon('ArrowDown01Icon', 12, x + 8, 143, white(0.55, P)); return x + 14
    x = group(x, 'at', 'This week'); x = group(x + 24, 'in', 'City')
    s.box(265, 130, 266, 154, white(0.22, P)); s.icon('Sorting01Icon', 20, 286, 141, WHITE); s.icon('Search01Icon', 20, 326, 141, WHITE)
    # the two views of the same nights, as words on a hairline
    s.box(7, 208, 353, 209, white(0.16)); a, b = s.text(94, 192, 'Cards', 800, pt(15), WHITE, align='c'); s.text(267, 192, 'Map', 800, pt(15), white(0.55), align='c')
    s.box(a, 207, b, 209, PURPLE)
    # when the centred night is
    d1 = text_w('TONIGHT', 'display', pt(19 * 0.897)); d2 = text_w('  9 PM', 'display', pt(19 * 0.897)); dx = 180 - (d1 + d2) // 2
    s.text(dx, 236, 'TONIGHT', 'display', pt(19 * 0.897), PURPLE); s.text(dx + d1 + 8, 236, '9 PM', 'display', pt(19 * 0.897), WHITE)
    # the stage: a neighbour peeking each side, the record, then the centred cover
    for name, title, cxn in (('window', 'Golden Hour', 12), ('lamp', 'Velvet Hour', 332)):
        im, m = cover(name, title, '', k=0.66, centre=False); im = Image.eval(im, lambda v: v // 2)
        s.im.paste(im, (cxn - im.width // 2, 355 - im.height // 2), m)
    record(s, 188, 376, 116)
    im, m = cover('cover', 'Late Checkout', 'BY AMA.K', faces=3, extra='+245'); s.im.paste(im, (80, 254), m)
    # the stamp in its dark circle, and the three facts
    s.disc(71, 510, 99, mix(BLACK, WHITE, 0.08)); s.disc(72, 511, 97, hexc('161616')); s.stamp('late-checkout', 73, 120, 559)
    s.text(121, 621, 'EVENT STAMP', 800, pt(11), PURPLE, ls=1, align='c')
    for label, value, yl, yv, px in (('LOCATION', 'SEAPORT', 520, 534, pt(12)), ('PRICE', 'FREE', 560, 573, pt(12)), ('TASTE MATCH', '93%', 599, 617, pt(24))):
        s.text(191, yl, label, 800, pt(10), PURPLE, ls=1); s.text(191, yv, value, 'display', px, WHITE)
    # join and share
    s.box(95, 639, 212, 685, PURPLE, r=23); s.text(154, 662, 'JOIN', 900, pt(18), WHITE, align='c')
    s.disc(220, 639, 45, PURPLE); s.icon('LinkForwardIcon', 20, 242, 661, WHITE)
    tabbar(s, 0)
    return s.im

def camera(album='LATE CHECKOUT', view='view', print_shot='selfie'):
    """The camera. Sources: app/(tabs)/camera.tsx (a full-bleed viewfinder with the controls over it), and in
    src/components/camera: LiveAlbumPill.tsx, VaultPolaroid.tsx, FilterModePill.tsx, filterPillThemes.ts (SNAP: a matte
    black body, white shutter, the orange ring and name)."""
    s = Screen(); ORANGE = hexc('FF5A1F'); BODY = hexc('121212')
    global VIEW; VIEW = pic(view, W, H) if isinstance(view, str) else view; s.photo(VIEW, 0, 0, W, H); s.status()
    # the live album pill under the island: every shot goes to this album
    nm = album; w = 11 + 6 + 7 + text_w('LIVE', 900, pt(11), 1) + 7 + 1 + 7 + text_w(nm, 'display6', pt(13)) + 15; x = (W - w) // 2
    s.box(x, 61, x + w, 90, BODY, r=15); s.disc(x + 11, 72, 6, ORANGE)
    _, x1 = s.text(x + 24, 75, 'LIVE', 900, pt(11), ORANGE, ls=1); s.box(x1 + 7, 69, x1 + 8, 82, white(0.25, BODY)); s.text(x1 + 15, 75, nm, 'display6', pt(13), WHITE)
    # zoom: .5 / 1 / 3 in a see-through black pill, the chosen one on a dark disc
    s.shade(121, 547, 239, 587, 0.4, 0.4)
    for xx in range(121, 239):                    # round the pill's ends by restoring the picture outside them
        for yy in range(547, 587):
            cx = min(max(xx, 141), 218); 
            if (xx - cx) ** 2 + (yy - 567) ** 2 > 20 * 20 + 6: s.im.putpixel((xx, yy), VIEW.getpixel((xx, yy)))
    for i, t in enumerate(('.5', '1', '3')):
        cx = 141 + round(i * 38.5)
        if i == 1: s.disc(cx - 16, 551, 33, mix(BLACK, WHITE, 0.12)); s.disc(cx - 15, 552, 31, BODY)
        s.text(cx + 1, 567, t, 900, pt(11), WHITE if i == 1 else mix(mix(VIEW.getpixel((cx, 567)), BLACK, 0.4), WHITE, 0.6), align='c')
    # the newest shot as a small print with a polaroid chin
    s.box(294, 543, 334, 592, hexc('F4F1EA'), r=3); s.photo(pic(print_shot, 34, 37), 297, 546, 331, 583, r=1)
    # the capture pill: flip, the shutter, the flash; the filter's name under it
    s.box(41, 602, 318, 671, mix(BLACK, WHITE, 0.07), r=35); s.box(42, 603, 317, 670, BODY, r=34)
    s.icon('Refresh04Icon', 18, 82, 637, white(0.9, BODY)); s.icon('FlashIcon', 16, 278, 637, white(0.9, BODY))
    s.disc(154, 610, 53, ORANGE); s.disc(157, 613, 47, BODY); s.disc(159, 615, 43, WHITE)
    s.text(181, 687, 'SNAP', 900, pt(11), ORANGE, ls=2, align='c')
    tabbar(s, 1)
    return s.im

def passport():
    """The Passport (app/(tabs)/passport.tsx, src/components/passport/NewPassportCard.tsx, PassportStampsLayer.tsx,
    MemberStamp.tsx). Where the stamps sit, what they look like, the member stamp and the level all come out of the
    app's own code (tools/pxi/passport.sh, with Nio's nights in tools/pxi/passport.json). On a 393 x 852 phone the
    card is 381 x 491 points: 223 of stamps over the 268-point ID page."""
    import json
    from ui import turned_art, dotted
    P = lambda v: round(v * K)
    data = json.load(open(os.path.join(OUT, 'passport', 'passport.json')))
    s = Screen(); s.status()
    # the header: his handle with the account arrow, and settings
    _, x1 = s.text(P(24), P(85), '@nio', 'display', pt(20), WHITE); s.icon('ArrowDown01Icon', 13, x1 + P(4) + 6, P(85) + 1, white(0.72))
    s.icon('Settings01Icon', 20, P(349), P(85), WHITE)
    # the numbers, and the level hexagon in its ring
    x = P(24)
    for label, n in (('FRIENDS', '23'), ('ALL POSTS', '12'), ('MY SHOTS', '148')):
        _, a = s.text(x, P(147), label, 500, sysp(10), white(0.5), ls=1); _, b = s.text(x, P(163), n, 700, sysp(16), WHITE); x = max(a, b) + P(24)
    lv = turned_art('level', 59, colors=6, flat=(0, 0, 0)); s.im.paste(lv, (P(345) - 29, P(157) - 29), lv)
    s.text(P(345), P(157), data['level']['letter'], 800, sysp(13), WHITE, align='c')
    # Edit profile
    bg = hexc('121212'); s.box(P(6), P(203), P(387), P(243), bg, r=P(8)); s.ring(P(6), P(203), P(387), P(243), white(0.09, bg), r=P(8))
    tw = text_w('Edit profile', 600, sysp(14)); gx = (W - (16 + P(8) + tw)) // 2
    s.icon('PencilEdit02Icon', 16, gx + 8, P(223), WHITE); s.text(gx + 16 + P(8), P(223), 'Edit profile', 600, sysp(14), WHITE)

    # ---- the card: the stamp page over the ID page
    cx0, cy0, cw = P(6), P(259), P(381); top, idh = P(223), P(268); fold = cy0 + top; cy1 = fold + idh
    card = Screen(hexc('0a0a0a'), cw, top + idh)
    m = Image.open('/home/user/pxi-mobile-app/src/assets/images/passport/map-world.png').convert('RGBA')
    dots = Image.new('RGB', m.size, hexc('0a0a0a')); dots.paste(m.convert('RGB'), (0, 0), m.getchannel('A'))
    dots = dots.convert('L').point(lambda v: 255 if v >= 36 else 0)          # the map's dots, already about one pixel each: kept as they are
    ox, oy = (m.width - cw) // 2, (m.height - top) // 2
    card.im.paste(hexc('3e3e3e'), (0, 0), dots.crop((ox, oy, ox + cw, oy + top)))
    # SEASON up the left edge and the passport number at the top right, in the app's dotted letters
    mk = dotted('SEASON 2026', pt(24), P(2)).rotate(90, expand=True)
    card.im.paste(white(0.6, hexc('0a0a0a')), (P(15) - mk.width // 2, P(145) - mk.height // 2), mk)
    num = 'P7C2E9A4XI'; mk = dotted(num, pt(14), P(2))
    card.im.paste(white(0.27, hexc('0a0a0a')), (P(317) - mk.width // 2, P(18) - mk.height // 2), mk)
    # the stamps, each where the app's layout put it, turned as it was pressed, with its light
    for st in data['stamps']:
        w = P(st['width']); art = turned_art('stamp-' + st['id'], w, st['rotation'])
        x0 = P(st['left'] + st['width'] / 2) - art.width // 2; y0 = P(st['top'] + st['height'] / 2) - art.height // 2
        card.glow(art, x0, y0, hexc(st['color'])); card.im.paste(art, (x0, y0), art)
    # the ID page
    idb = hexc('070707'); card.box(0, top, cw, top + idh, idb)
    c0 = top + P(18.5); L = P(12); R = cw - P(12); lab = white(0.45, idb)
    card.text(L, c0 + P(8.5), 'PXI PASSPORT', 700, sysp(14), WHITE, ls=P(2))
    card.box(L, c0 + P(21), L + P(188), c0 + P(21) + 2, WHITE); card.box(L + P(12), c0 + P(25), L + P(200), c0 + P(25) + 2, WHITE)
    card.text(R, c0 + P(5.5), 'PXI PASSPORT NO.', 700, sysp(9), lab, ls=1, align='r')
    card.text(R, c0 + P(20.5), num, 500, sysp(12), white(0.6, idb), ls=1, align='r')
    mark = turned_art('mark', 18, colors=4); card.im.paste(mark, (L, c0 + P(38) - mark.height // 2), mark)
    card.text(L + 18 + P(2), c0 + P(38), 'PASSPORT   PASS   PORT', 600, sysp(9), WHITE, ls=P(0.5))
    card.text(R - P(126), c0 + P(36.5), 'LEVEL ' + data['level']['label'].upper(), 600, sysp(9), white(0.8, idb), ls=P(0.45))
    g0 = c0 + P(51)                                    # the details grid: the photo and the column beside it
    # the member stamp goes down first, so the page's print stays on top of the ink
    ms = turned_art('member', 66, -10, colors=6); mx, my = cw - P(8) - 33 - ms.width // 2, top + P(225.5) - 33 - ms.height // 2
    ink = Image.new('RGB', ms.size, mix(idb, PURPLE, 0.72)); card.im.paste(ink, (mx, my), ms.getchannel('A'))
    card.photo(pic('passport', P(124), P(144)), L, g0, L + P(124), g0 + P(144), r=P(6))
    ix = L + P(124) + P(10)
    cz = turned_art('citizen', 70, colors=2); card.im.paste(WHITE, (R - cz.width, g0 - P(4)), cz.getchannel('A'))
    card.text(ix, g0 + P(7.75), 'FULL NAME', 700, sysp(9), lab, ls=1)
    nm = Screen(BLACK, text_w('NIO', 800, sysp(13), P(0.5)) + 2, 16); nm.text(1, 8, 'NIO', 800, sysp(13), WHITE, ls=P(0.5))     # the name glows
    na = nm.im.convert('RGBA'); na.putalpha(nm.im.convert('L').point(lambda v: 255 if v else 0))
    card.glow(na, ix - 1, g0 + P(20.85) - 8, WHITE, reach=4, strength=0.22); card.text(ix, g0 + P(20.85), 'NIO', 800, sysp(13), WHITE, ls=P(0.5))
    card.text(ix, g0 + P(38.75), 'USERNAME', 700, sysp(9), lab, ls=1); card.text(ix, g0 + P(51.85), 'nio', 600, sysp(13), WHITE)
    for dx, label, val, wt, a in ((0, 'CITY', 'BOS', 500, 0.85), (P(58), 'AGE', '21', 500, 0.85), (P(98), 'INSTA', '@nio', 600, 0.65)):
        card.text(ix + dx, g0 + P(79.25), label, 700, sysp(9), lab, ls=1); card.text(ix + dx, g0 + P(92.35), val, wt, sysp(13), white(a, idb))
    card.text(ix, g0 + P(109.35), 'BIO', 700, sysp(9), lab, ls=1)
    card.text(ix, g0 + P(121.95), 'New in town. Built PXI.', 400, sysp(11.5), white(0.85, idb))
    # the rule and the two machine lines
    card.box(0, top + P(227), cw, top + P(227) + 2, white(0.4, idb))
    def line(parts): j = '<<'.join(parts); return j + '<' * max(0, 55 - len(j))
    for i, parts in enumerate((('PXI', 'NIO', 'NIO'), ('ISSUED01AUG26', num, 'PXISPACE'))):
        card.text(P(6), top + P(242 + 14 * i), line(parts), 400, sysp(10), white(0.32, idb), ls=1)
    card.box(cw - P(6), top + P(232), cw, top + idh, idb)                    # the lines are clipped at the page's inner edge
    # the fold: the binding, with its stitching
    card.shade(0, top - P(11.5), cw, top - P(1.5), 0.85, 0.85, (10, 10, 10)); card.box(0, top - P(1.5), cw, top + P(1.5) + 1, hexc('050505'))
    for x in range(0, cw, P(10)): card.box(x, top - 1, x + P(4), top + 1, white(0.4, hexc('050505')))
    mask = Image.new('L', card.im.size, 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, cw - 1, top + idh - 1], P(8), fill=255)
    s.im.paste(card.im, (cx0, cy0), mask)
    tabbar(s, -1)
    return s.im

def app_icon(px):
    """PXI's own icon (pxi-mobile-app/assets/icon.png) in hard pixels, with the phone's rounded corners."""
    f = os.path.join(UI, 'art', f'pxi-icon_{px}.png')
    if not os.path.exists(f):
        big = Image.open('/home/user/pxi-mobile-app/assets/icon.png').convert('RGB')
        sm = big.resize((px, px), Image.BOX).quantize(12, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB'); sm.save(f)
    return Image.open(f).convert('RGB')

def lock():
    """The phone's lock screen with PXI's notifications on it. This is the phone's own screen, not the app's, so there is
    no app code for it: the layout is measured from the App Store picture (04, "Found in every shot") and the three
    notifications are its words, character for character. The wallpaper and the small pictures are Nio's room."""
    s = Screen(); s.photo(pic('lockwall', W, H), 0, 0, W, H)
    s.shade(0, 0, W, 300, 0.45, 0.0)                                       # the top is dimmed so the clock reads
    s.status('9:40')
    s.text(180, 87, 'Saturday, October 3', 600, 18, WHITE, align='c')
    s.text(180, 141, '9:40', 700, 88, WHITE, ls=-1, align='c')
    card, ink, grey = (233, 233, 236), (12, 12, 14), (128, 128, 134)
    notes = (('Late Checkout', "You're in 14 new photos", 'now', 'bed', None),
             ('Kofi saved your photo', 'from Late Checkout', '2m ago', 'low', None),
             ('Ama reacted', 'to your photo in Late Checkout', '4m ago', 'laugh', '❤️'))
    for i, (title, body, when, shot, em) in enumerate(notes):
        y = 359 + i * 65
        s.box(11, y, 341, y + 59, card, r=20)
        s.photo(app_icon(34), 22, y + 12, 56, y + 46, r=8)
        _, x1 = s.text(66, y + 19, title, 600, sysp(15), ink)
        if em: s.emoji(em, 13, x1 + 10, y + 19)
        s.text(66, y + 37, body, 400, sysp(15), ink)
        s.text(284, y + 21, when, 400, sysp(13), grey, align='r')
        s.photo(pic(shot, 38, 38), 293, y + 11, 331, y + 49, r=7)
    for cx, name in ((79, 'FlashlightIcon'), (281, 'Camera01Icon')):          # the torch and the camera
        s.shade(cx - 22, 699, cx + 22, 743, 0.0, 0.0); d = Image.new('L', (44, 44), 0); ImageDraw.Draw(d).ellipse([0, 0, 43, 43], fill=255)
        s.im.paste(mix(s.im.getpixel((cx, 721)), (20, 20, 22), 0.72), (cx - 22, 699), d); s.icon(name, 20, cx, 721, WHITE)
    s.box(119, 771, 241, 775, WHITE, r=2)                                  # the home bar
    return s.im

SCREENS = {'thread': thread, 'gallery': gallery, 'discover': discover, 'camera': camera, 'passport': passport, 'lock': lock}
if __name__ == '__main__':
    name = sys.argv[1]
    for n in (SCREENS if name == 'all' else [name]):
        im = SCREENS[n](); f = sys.argv[2] if len(sys.argv) > 2 and name != 'all' else os.path.join(OUT, f'{n}.png')
        im.save(f); im.resize((W * 3, H * 3), Image.NEAREST).save(f.replace('.png', '_x3.png')); print(f)
