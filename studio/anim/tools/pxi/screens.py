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

def map_pin(s, cx, cy, purple=True, k=1.0):
    """One venue on the map (map/MapPin.tsx): a 30pt black disc with a groove and a small label, purple for a PXI night."""
    d = round(pt(30) * k); s.disc(cx - d // 2, cy - d // 2, d, hexc('111111'))
    g = round(d * 0.36); s.d.ellipse([cx - g, cy - g, cx + g, cy + g], outline=mix(hexc('111111'), WHITE, 0.12))
    l = round(d * 0.34); s.disc(cx - l // 2, cy - l // 2, l, PURPLE if purple else WHITE)

def discover_map(event='Office Hours', when='ALWAYS', venue='Haverbrook Hall', price='FREE'):
    """Home, Discover, in its Map view. Sources: src/components/discover/map/DiscoverMap.tsx (the map fills the screen
    under the title and the filter pill; the card strip floats over its bottom above the tab bar), mapStyle.ts (the
    charcoal colours), mapLook.ts (the viewer's dot: #D651FB in a white ring), MapPin.tsx (the records), MapCarousel.tsx
    (the card: the cover at 3:4 on the left, then when, the title, the venue, the price), EventWhen.tsx (the day in
    purple), allEvents/PosterFallback.tsx (a night with no flyer: PXI purple ink, the title in off-white, one rule).
    For Office Hours (episode 1): his dot sits inside a grey building that is not on campus; that night is the only
    one there, and its card says when it is: ALWAYS."""
    s = Screen()
    LAND, MINOR, MAJOR, PARK, BLD, PLACE = hexc('0D0D0F'), hexc('1B1B1E'), hexc('242428'), hexc('111113'), hexc('141416'), hexc('7C7C83')
    s.box(0, 0, 360, 780, LAND)
    # campus: a park with its buildings, the streets round it, a river along the right
    s.box(30, 250, 230, 470, PARK, r=6)
    for x0, y0, x1, y1 in ((48, 270, 110, 318), (124, 266, 212, 300), (52, 338, 96, 420), (118, 322, 160, 380), (170, 318, 214, 452), (110, 400, 156, 452)):
        s.box(x0, y0, x1, y1, BLD, r=2)
    for x in (20, 240, 300): s.box(x, 180, x + 8, 760, MAJOR)
    for y in (238, 480, 560): s.box(0, y, 360, y + 8, MAJOR)
    for x in (70, 140, 270): s.box(x, 180, x + 3, 250, MINOR); s.box(x, 488, x + 3, 760, MINOR)
    for y in (300, 360, 420): s.box(240, y, 360, y + 3, MINOR)
    s.box(330, 180, 360, 760, hexc('060607'))
    s.text(130, 362, 'CAMPUS', 700, pt(11), PLACE, ls=2, align='c')
    for cx, cy in ((80, 296), (168, 284), (190, 400), (132, 430)): map_pin(s, cx, cy)
    # the building that is not on campus: grey, set apart, his dot inside it, its record selected (1.35x)
    s.box(258, 372, 318, 448, hexc('3A3A40'), r=3); s.box(262, 376, 314, 444, hexc('2D2D32'), r=2)
    s.disc(288 - pt(9), 418 - pt(9), 2 * pt(9), WHITE); s.disc(288 - pt(6), 418 - pt(6), 2 * pt(6), hexc('D651FB'))
    map_pin(s, 288, 392, k=1.35)
    # the title row and the filter pill float over the map
    s.status()
    s.avatar(pic('avatar', 38, 38), 15, 66, 38)
    x0, x1 = s.text(186, 85, 'Discover', 'display', pt(33), WHITE, ls=-1, align='c'); s.icon('ArrowDown01Icon', 13, x1 + 9, 89, WHITE)
    s.disc(307, 66, 38, PURPLE); s.icon('PlusSignIcon', 18, 326, 85, WHITE)
    P = hexc('232323'); s.box(7, 116, 353, 167, P, r=26); x = 23
    def group(x, small, value):
        _, x = s.text(x, 142, small, 700, pt(14), white(0.35, P)); _, x = s.text(x + 16, 141, value, 800, pt(20), WHITE)
        s.icon('ArrowDown01Icon', 12, x + 8, 143, white(0.55, P)); return x + 14
    x = group(x, 'at', 'This week'); x = group(x + 24, 'in', 'City')
    s.box(265, 130, 266, 154, white(0.22, P)); s.icon('Sorting01Icon', 20, 286, 141, WHITE); s.icon('Search01Icon', 20, 326, 141, WHITE)
    a, b = s.text(94, 192, 'Cards', 800, pt(15), white(0.55, LAND), align='c'); a2, b2 = s.text(267, 192, 'Map', 800, pt(15), WHITE, align='c')
    s.box(7, 208, 353, 209, white(0.16, LAND)); s.box(a2, 207, b2, 209, PURPLE)
    # the card strip: one card, the poster on the left
    ch = pt(116); cw = round(ch * 0.75); x0 = pt(24); y0 = 690 - 12 - ch
    s.box(x0, y0, 360 - x0, y0 + ch, hexc('1C1C1C'), r=pt(18))
    s.box(x0, y0, x0 + cw, y0 + ch, PURPLE, r=pt(18)); s.box(x0 + cw - pt(18), y0, x0 + cw, y0 + ch, PURPLE)
    ty = y0 + 14
    for wd in event.upper().split():
        s.text(x0 + 8, ty, wd, 'display', pt(15), hexc('F4EFE6'), ls=-1); ty += pt(15)
    s.box(x0 + 8, ty + 2, x0 + cw - 8, ty + 3, hexc('F4EFE6'))
    bx = x0 + cw + pt(14)
    s.text(bx, y0 + pt(11) + 6, when, 800, pt(11), PURPLE, ls=1)
    s.text(bx, y0 + pt(11) + 28, event, 'display', pt(18), WHITE)
    s.text(bx, y0 + ch - pt(11) - 30, venue, 600, pt(13), white(0.55, hexc('1C1C1C')))
    s.text(bx, y0 + ch - pt(11) - 8, price, 900, pt(14), WHITE)
    tabbar(s, 0)
    return s.im

def roof_album():
    """Group Photo: the Roof album's gallery after the shoot (AlbumMasonryGrid.tsx, as gallery()). Every try is in it:
    the sunset with nobody in it, Theo walking out of one, Maya alone, and the first one with three of them. The
    centre tile is the one Theo means at the end, so the zoom in shot 19 lands on it (out/skit-stills/gp*.png)."""
    s = Screen()
    tiles = [(still('gp822'), 0.5, 0.42, 0.62), (still('gp574'), 0.74, 0.47, 0.5), (still('gp700'), 0.5, 0.5, 0.62), (still('gp245'), 0.45, 0.5, 0.8)]
    for i, (im, cx, cy, k) in enumerate(tiles):
        x, y = (i % 3) * 120, 160 + (i // 3) * 120
        s.photo(sq(im, cx, cy, k).resize((116, 116), Image.LANCZOS), x + 2, y + 2, x + 118, y + 118, r=pt(14))
        s.disc(x + 9, y + 85, 26, G1C); s.avatar(pic('avatar', 22, 22), x + 11, y + 87, 22)
    s.box(0, 0, W, 158, BLACK); header(s, 'Roof'); switch(s, 'GALLERY')
    s.disc(292, 643, 51, PURPLE); s.icon('Add01Icon', 24, 317, 668, WHITE)
    return s.im

def sunday_dinner(joined=False):
    """Wave Back: the family's Sunday dinner event, from an invite (app/event/[id].tsx, EventDetailsBody.tsx: the title,
    the venue in purple, DATE and TIME; EventSections.tsx: N MEMBERS and WHO'S GOING; EventFooter.tsx: an invite shows
    Deny and Join, and once joined the green JOINED chip)."""
    s = Screen(bg=hexc('1C1C1C'))
    s.status()
    s.icon('ArrowLeft01Icon', 24, 26, 80, WHITE)
    s.text(180, 190, 'SUNDAY', 'display', pt(40), WHITE, align='c'); s.text(180, 238, 'DINNER', 'display', pt(40), WHITE, align='c')
    s.text(180, 286, "MUM'S HOUSE", 'display', pt(18), PURPLE, align='c')
    for cx, lab, val in ((120, 'DATE', 'SUN 23 NOV'), (240, 'TIME', '6:00 PM')):
        s.text(cx, 340, lab, 800, pt(10), white(0.45, hexc('1C1C1C')), ls=2, align='c'); s.text(cx, 362, val, 'display', pt(16), WHITE, align='c')
    s.text(180, 430, ('5' if joined else '4') + ' MEMBERS', 900, pt(11), WHITE, ls=2, align='c')
    for i in range(5 if joined else 4):
        x = 180 - (5 if joined else 4) * 18 + i * 36
        if joined and i == 4: s.avatar(pic('avatar', 32, 32), x, 448, 32)
        else: s.avatar(nobody(32), x, 448, 32)
    s.text(180, 500, "WHO\u2019S GOING", 800, pt(10), white(0.45, hexc('1C1C1C')), ls=2, align='c')
    if joined:
        s.box(20, 690, 340, 738, G2E, r=24); s.d.line([(143, 714), (148, 719), (157, 709)], fill=hexc('32D74B'), width=2)  # Tick02Icon, drawn by hand (the icon set is not in this repo)
        s.text(196, 714, 'JOINED', 900, pt(12), WHITE, ls=2, align='c')
    else:
        s.box(20, 690, 172, 738, G2E, r=24); s.text(96, 714, 'Deny', 800, pt(14), WHITE, align='c')
        s.box(188, 690, 340, 738, PURPLE, r=24); s.text(264, 714, 'Join', 800, pt(14), WHITE, align='c')
    return s.im

def album_face(photo, name, venue, cw, ch):
    """The album card face (src/components/album/AlbumCardFace.tsx): the cover photo at 3:4, a dark scrim over the top
    half with the name in huge caps on the top third (7% padding, fitTitle), and a foot scrim with the venue."""
    c = Screen(w=cw, h=ch, bg=hexc('111111'))
    w, h = photo.size; k = min(w / cw, h / ch); pw, ph = round(cw * k), round(ch * k)
    c.photo(photo.crop(((w - pw) // 2, (h - ph) // 2, (w - pw) // 2 + pw, (h - ph) // 2 + ph)).resize((cw, ch), Image.LANCZOS), 0, 0, cw, ch)
    c.shade(0, 0, cw, ch // 2, 0.42, 0.0); c.shade(0, ch - round(ch * 0.32), cw, ch, 0.0, 0.5)
    pad = round(cw * 0.07); px, lines = fit_title(name.upper().split(), cw - 2 * pad, ch * 0.34, round(cw * 0.195), round(cw * 0.085))
    y = pad + round(px * 0.42)
    for l in lines:
        c.text(pad, y + 2, l, 'display', px, mix(hexc('111111'), BLACK, 0.5), ls=-1); c.text(pad, y, l, 'display', px, WHITE, ls=-1); y += round(px * 0.98)
    c.text(pad, ch - pad - pt(10), venue, 800, pt(15), WHITE)
    return c.im

def dinner_cover(): return still('wb8_1150')

def push_invite(who='Marcus', event="Sunday at Mum's"):
    """Wave Back v8 (founder, Nov 18, 9:08 PM): the invite lands as a real PXI push on Nio's lock screen, from the
    friend, with the event's cover as its picture (the phone's own notification, laid out as lock())."""
    s = Screen(); s.photo(pic('lockwall', W, H), 0, 0, W, H)
    s.shade(0, 0, W, 300, 0.45, 0.0); s.status('4:12')
    s.text(180, 87, 'Wednesday, November 19', 600, 18, WHITE, align='c')
    s.text(180, 141, '4:12', 700, 88, WHITE, ls=-1, align='c')
    card, ink, grey = (233, 233, 236), (12, 12, 14), (128, 128, 134)
    y = 359; s.box(11, y, 341, y + 59, card, r=20)
    s.photo(app_icon(34), 22, y + 12, 56, y + 46, r=8)
    s.text(66, y + 19, f'{who} invited you', 600, sysp(15), ink)
    s.text(66, y + 37, f'to {event}', 400, sysp(15), ink)
    s.text(284, y + 21, 'now', 400, sysp(13), grey, align='r')
    s.photo(sq(dinner_cover(), 0.5, 0.45, 0.8).resize((38, 38), Image.LANCZOS), 293, y + 11, 331, y + 49, r=7)
    s.box(119, 771, 241, 775, WHITE, r=2)
    return s.im

def invite_card(going=False, who='Marcus', event="Sunday at Mum's", venue="Mum's house \u00b7 Sun 6 PM"):
    """Wave Back v8: the tap on the push opens the invite on the album card (AlbumInviteCard.tsx: "{name} invited you
    to", the AlbumCardFace cover, RSVP in purple and Pass; once accepted the green "You're going" box). Framed on the
    cover, its name and its place (founder, Nov 18, 9:08 PM): no member row, no who's going."""
    s = Screen(); s.status('4:12')
    _, x = s.text(30, 112, who, 800, sysp(17), WHITE); s.text(x, 112, ' invited you to', 500, sysp(17), white(0.55))
    cw, ch = 300, 400
    face = album_face(dinner_cover(), event, venue, cw, ch)
    m = Image.new('L', (cw, ch), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, cw - 1, ch - 1], 18, fill=255)
    s.im.paste(face, (30, 140), m)
    if going:
        s.box(30, 566, 330, 614, (21, 46, 27), r=14); s.text(180, 590, "You're going", 600, sysp(15), white(0.88), align='c')
    else:
        s.box(30, 566, 174, 614, PURPLE, r=24); s.text(102, 590, 'RSVP', 800, pt(14), WHITE, align='c')
        s.box(186, 566, 330, 614, G2E, r=24); s.text(258, 590, 'Pass', 800, pt(14), WHITE, align='c')
    return s.im

def lock_push(notes, clock='9:14', date='Thursday, November 20', wall='lockwall'):
    """A PXI push on the phone's lock screen (the phone's own layout, as lock()): newest on top, each card the app icon,
    a bold first line, the body, the time and the picture. notes: (title, body, when, picture or None)."""
    s = Screen(); s.photo(pic(wall, W, H) if isinstance(wall, str) else wall.resize((W, H), Image.LANCZOS), 0, 0, W, H)
    s.shade(0, 0, W, 300, 0.45, 0.0); s.status(clock)
    s.text(180, 87, date, 600, 18, WHITE, align='c')
    s.text(180, 141, clock, 700, 88, WHITE, ls=-1, align='c')
    card, ink, grey = (233, 233, 236), (12, 12, 14), (128, 128, 134)
    for i, (title, body, when, im) in enumerate(notes):
        y = 359 + i * 65
        s.box(11, y, 341, y + 59, card, r=20)
        s.photo(app_icon(34), 22, y + 12, 56, y + 46, r=8)
        s.text(66, y + 19, title, 600, sysp(15), ink)
        s.text(66, y + 37, body, 400, sysp(15), ink)
        s.text(284 if im is not None else 330, y + 21, when, 400, sysp(13), grey, align='r')
        if im is not None: s.photo(sq(im, 0.5, 0.45, 0.8).resize((38, 38), Image.LANCZOS), 293, y + 11, 331, y + 49, r=7)
    s.box(119, 771, 241, 775, WHITE, r=2)
    return s.im

def event_details(title, cover_im, venue, date, time, visibility='PRIVATE', footer='guest'):
    """The event modal exactly as the app shows it on open, unscrolled (src/components/album/AlbumDetailsModal.tsx with
    EventDetailsBody.tsx and EventFooter.tsx, theme eventTheme.ts): an iOS page sheet (#1C1C1C) over black; the header
    EVENT DETAILS (12.5pt, 800) with the close X; the title in purple display caps (FitTitle, up to 34pt, 2 lines) and
    PRIVATE under it; the 3:4 cover with 40pt corners; the venue in purple display; DATE and TIME (purple 11pt labels,
    white 24pt display values); and the sticky footer, [Deny | Join] for a guest or the green JOINED chip."""
    SHEET, PURP = hexc('1C1C1C'), hexc('A523EF')
    s = Screen(); s.status()
    s.box(pt(10), pt(48), W - pt(10), pt(70), hexc('2a2a2c'), r=pt(10))            # the screen behind, pushed back
    top = pt(56); s.box(0, top, W, H + pt(20), SHEET, r=pt(10))
    hy = top + pt(22) + pt(8)
    s.text(pt(20), hy, 'EVENT DETAILS', 800, pt(12.5), WHITE, ls=0.3); _x(s, W - pt(20) - pt(11), hy, pt(8), WHITE, 2)
    y = hy + pt(14) + pt(6) + pt(8)
    inner = W - 2 * pt(20)
    px, lines = fit_title(title.upper().split(), inner, pt(34) * 2.2, pt(34), pt(20))
    for l in lines:
        y += round(px * 0.53)
        s.text(W // 2, y + 2, l, 'display', px, mix(SHEET, BLACK, 0.6), ls=-1, align='c'); s.text(W // 2, y, l, 'display', px, PURP, ls=-1, align='c')
        y += round(px * 0.53)
    y += pt(6) + pt(6); s.text(W // 2, y, visibility, 800, pt(11), white(0.55, SHEET), ls=1.4, align='c'); y += pt(6)
    y += pt(16); ch = round(inner * 4 / 3)
    w0, h0 = cover_im.size; k = min(w0 / inner, h0 / ch); cw_, ch_ = round(inner * k), round(ch * k)
    crop = cover_im.crop(((w0 - cw_) // 2, (h0 - ch_) // 2, (w0 - cw_) // 2 + cw_, (h0 - ch_) // 2 + ch_)).resize((inner, ch), Image.LANCZOS)
    s.photo(crop, pt(20), y, pt(20) + inner, y + ch, r=pt(40)); y += ch
    y += pt(26) + pt(10); s.text(W // 2, y + 2, venue.upper(), 'display', pt(20), mix(SHEET, BLACK, 0.6), ls=-0.3, align='c'); s.text(W // 2, y, venue.upper(), 'display', pt(20), PURP, ls=-0.3, align='c')
    y += pt(10) + pt(22) + pt(6)
    for cx, lab, val in ((W // 2 - pt(62), 'DATE', date), (W // 2 + pt(62), 'TIME', time)):
        s.text(cx, y, lab, 800, pt(11), PURP, ls=1, align='c'); s.text(cx, y + pt(22), val, 'display', pt(24), WHITE, ls=-0.4, align='c')
    # the sticky footer: a fade over the top padding, then solid
    fy = H - (pt(44) + pt(48)) ; s.shade(0, fy - pt(44), W, fy - pt(26), 0.0, 1.0, SHEET); s.box(0, fy - pt(26), W, H, SHEET)
    if footer == 'guest':
        bw = (W - 2 * pt(18) - pt(14)) // 2
        s.box(pt(18), fy, pt(18) + bw, fy + pt(48), hexc('4A4A4A'), r=pt(24)); s.text(pt(18) + bw // 2, fy + pt(24), 'Deny', 800, pt(16), WHITE, align='c')
        s.box(W - pt(18) - bw, fy, W - pt(18), fy + pt(48), PURP, r=pt(24)); s.text(W - pt(18) - bw // 2, fy + pt(24), 'Join', 800, pt(16), WHITE, align='c')
    else:
        s.box(pt(18), fy, W - pt(18), fy + pt(48), (21, 46, 27), r=pt(24)); s.text(W // 2 + pt(12), fy + pt(24), 'JOINED', 900, pt(14), hexc('32D74B'), ls=1.6, align='c')
        cx = W // 2 - pt(36); s.line(cx - 6, fy + pt(24), cx - 1, fy + pt(24) + 5, hexc('32D74B'), 2); s.line(cx - 1, fy + pt(24) + 5, cx + 8, fy + pt(24) - 5, hexc('32D74B'), 2)
    s.box(119, 771, 241, 775, WHITE, r=2)
    return s.im

def now_playing(title, art, bg, wet=0):
    """Aux: what Nio puts on, on his own phone's music player (not PXI: a plain player, no brand). The song title is
    the cause of what happens next, so it is the one big thing on the screen (craft library, phone insert)."""
    s = Screen(bg=hexc('121212')); s.status()
    s.text(180, 92, 'NOW PLAYING', 800, pt(11), white(0.5, hexc('121212')), ls=2, align='c')
    s.box(50, 130, 310, 390, hexc(bg), r=24); s.emoji(art, 150, 180, 260)
    s.text(180, 450, title, 'display', pt(30), WHITE, align='c')
    s.box(40, 520, 320, 526, white(0.25, hexc('121212')), r=3); s.box(40, 520, 70, 526, WHITE, r=3); s.disc(64, 515, 16, WHITE)
    s.disc(150, 570, 60, WHITE); s.box(172, 586, 179, 614, hexc('121212')); s.box(184, 586, 191, 614, hexc('121212'))
    for sx in (-1, 1):   # back and skip: two triangles and a bar each side of play
        cx = 180 + sx * 92
        for k in (0, 1):
            tx = cx + sx * (k * 11 - 8)
            s.d.polygon([(tx - sx * 9, 588), (tx - sx * 9, 612), (tx + sx * 9, 600)], fill=WHITE)
        s.box(cx + sx * 14 - 2, 588, cx + sx * 14 + 2, 612, WHITE)
    if wet:              # water on the glass: drops, each a dark rim, a lighter body and a bright glint
        import random; r = random.Random(wet)
        for _ in range(26 * wet):
            x, y, rr = r.randint(10, 350), r.randint(60, 760), r.randint(5, 16)
            box = [x - rr, y - rr * 1.15, x + rr, y + rr * 1.15]
            under = s.im.getpixel((min(359, x), min(779, y)))
            s.d.ellipse(box, fill=mix(under, (160, 190, 220), 0.35), outline=mix(under, (0, 0, 0), 0.4), width=2)
            s.d.ellipse([x - rr * 0.5, y - rr * 0.75, x - rr * 0.1, y - rr * 0.3], fill=(240, 248, 255))
    return s.im

def invite_notif(who='Marcus', event='Sunday Dinner'):
    """Wave Back v8: Nio's phone the second Marcus adds him (app/notifications.tsx, the album/event invite row: avatar,
    "{name} invited you to", the event in bold, "now"). The cause of the dinner, on screen."""
    s = Screen(); s.status('4:12')
    hy = pt(74)
    s.text(pt(20), hy, 'NOTIFICATIONS', 'display', pt(13), WHITE, ls=0.4); _x(s, W - pt(31), hy, pt(7), WHITE, 2)
    s.text(pt(28), pt(126), 'NEW', 800, pt(12), hexc('8A8A8A'), ls=1.1)
    top = pt(140); cy = top + pt(40); ix = pt(36); d = pt(48); tx = ix + d + pt(16)
    s.avatar(nobody(d), ix, cy - d // 2, d)
    _, x = s.text(tx, cy - pt(10), who, 700, sysp(15), WHITE); s.text(x, cy - pt(10), ' invited you to', 500, sysp(15), white(0.55))
    s.text(tx, cy + pt(10), event, 800, sysp(15), WHITE); s.text(tx, cy + pt(29), 'now', 600, pt(10), white(0.35), ls=0.2)
    s.disc(W - pt(36) - pt(10), cy - pt(5), pt(10), PURPLE)
    s.box(pt(20), top + pt(80), W - pt(20), top + pt(80) + 1, white(0.1))
    # older rows under it (PhotoReactionCard.tsx), so his phone is his: friends reacting in his albums last week
    s.text(pt(28), top + pt(104), 'EARLIER', 800, pt(12), hexc('8A8A8A'), ls=1.1)
    for k, (name, em, album, still_name, when) in enumerate((('Maya', '\U0001F602', 'Roof', 'gp574', '2d'), ('Theo', '\U0001F525', 'Roof', 'gp700', '2d'), ('Sami', '\u2764\ufe0f', "Theo's party", 'ax142', '5d'))):
        y0 = top + pt(118) + k * pt(80); cy2 = y0 + pt(40)
        s.avatar(nobody(d), ix, cy2 - d // 2, d)
        x = tx; _, x = s.text(x, cy2 - pt(9), name, 700, sysp(14), WHITE); _, x = s.text(x, cy2 - pt(9), ' reacted ', 500, sysp(14), white(0.42))
        s.emoji(em, pt(15), x + pt(8), cy2 - pt(9)); x += pt(17)
        s.text(x, cy2 - pt(9), ' in ', 500, sysp(14), white(0.42))
        s.text(tx, cy2 + pt(9), album, 700, sysp(14), WHITE)
        s.text(tx, cy2 + pt(28), when, 500, sysp(12), white(0.35))
        t = pt(56); s.photo(sq(still(still_name), 0.5, 0.35, 0.7).resize((t, t), Image.NEAREST), W - pt(36) - t, cy2 - t // 2, W - pt(36), cy2 + t // 2, r=pt(10))
        s.box(pt(20), y0 + pt(80), W - pt(20), y0 + pt(80) + 1, white(0.1))
    return s.im

def roof_thread(hearts, comments):
    """Group Photo v8: the Roof album's thread (as thread(): ThreadView, AlbumThreadMediaCard, AlbumReactionBar) the minute
    after the shot. One photo: the empty rooftop and a perfect sunset. The hearts on it climb; strangers in the album
    comment. The cause of Nio's last line, on screen."""
    s = Screen()
    photo = sq(still('gp8_930'), 0.5, 0.42, 0.75).resize((300, 300), Image.LANCZOS)
    s.photo(photo, 30, 170, 330, 470, r=14)
    s.avatar(pic('avatar', 27, 27), 42, 482, 27); s.text(78, 495, 'sunset', 500, sysp(15), WHITE)
    x = chip(s, 42, 520, '\u2764\ufe0f', str(hearts)); chip(s, x + 6, 520, '\U0001F525', str(max(1, hearts // 4)))
    y = 572
    for name, text in comments:
        w = 24 + text_w(text, 500, sysp(15)) + 20
        s.box(64, y, 64 + max(w, 120), y + 48, G1C, r=16, small=('bl', 5))
        s.text(75, y + 13, name, 800, pt(10), hexc('9A9A9A'), ls=1); s.text(75, y + 32, text, 500, sysp(15), WHITE)
        s.avatar(nobody(29), 26, y + 16, 29); y += 60
    s.box(0, 0, W, 158, BLACK); header(s, 'Roof'); switch(s, 'THREAD')
    return s.im

def face_of(name, cx, cy, k, size):
    """A neighbour's profile picture: a square crop of a launch-skit still, at the avatar's size."""
    return sq(still(name), cx, cy, k).resize((size, size), Image.LANCZOS)

PARKWAY = [('DENISE_3B', '3B here. beautiful', ('wb8_1150', 0.5, 0.42, 0.55)),
           ('KWAME.O', 'is this OUR roof??', ('ax204', 0.2, 0.33, 0.28)),
           ('LILY.W', 'new wallpaper', ('wb8_1150', 0.82, 0.24, 0.3)),
           ('RAY_4F', 'who took this', None)]

def parkway_thread(stage):
    """Group Photo v9: the building's album (ThreadView, AlbumThreadMediaCard, AlbumReactionBar), "151 Parkway Residents".
    Nio's sunset photo; neighbours pile in with every kind of reaction and comment, with their own profile pictures."""
    s = Screen()
    photo = sq(still('gp8_930'), 0.5, 0.42, 0.75).resize((250, 250), Image.LANCZOS)
    s.photo(photo, 55, 168, 305, 418, r=14)
    s.avatar(pic('avatar', 27, 27), 55, 430, 27); s.text(91, 443, 'sunset', 500, sysp(15), WHITE)
    chips = [('\u2764\ufe0f', '9'), ('\U0001F525', '3')] if stage == 0 else [('\u2764\ufe0f', '64'), ('\U0001F60D', '23'), ('\U0001F525', '19'), ('\U0001F62E', '11'), ('\U0001F64C', '8')]
    x = 30
    for i, (em, n) in enumerate(chips):
        if x > 280: break
        x = chip(s, x, 466, em, n) + 6
    y = 514
    for name, text, face in PARKWAY[: (1 if stage == 0 else 4)]:
        w = 24 + text_w(text, 500, sysp(15)) + 20
        s.box(64, y, 64 + max(w, 120), y + 48, G1C, r=16, small=('bl', 5))
        s.text(75, y + 13, name, 800, pt(10), hexc('9A9A9A'), ls=1); s.text(75, y + 32, text, 500, sysp(15), WHITE)
        s.avatar(face_of(*face, 29) if face else nobody(29), 26, y + 16, 29); y += 60
    s.box(0, 0, W, 158, BLACK); header(s, '151 Parkway Residents'); switch(s, 'THREAD')
    return s.im

STILLS = os.path.join(ANIM, 'out', 'skit-stills')
def still(name, box=None):
    """A frame of a launch skit, rendered by the engine (out/skit-stills/<name>.png), optionally cropped to a box given
    as fractions of the frame (x0, y0, x1, y1)."""
    im = Image.open(os.path.join(STILLS, name + '.png')).convert('RGB')
    if box: w, h = im.size; im = im.crop((round(box[0] * w), round(box[1] * h), round(box[2] * w), round(box[3] * h)))
    return im
def sq(im, cx=0.5, cy=0.5, k=1.0):
    """A square from a picture: side k times its short edge, centred on (cx, cy) as fractions."""
    w, h = im.size; c = round(min(w, h) * k); x = min(max(0, round(cx * w - c / 2)), w - c); y = min(max(0, round(cy * h - c / 2)), h - c)
    return im.crop((x, y, x + c, y + c))

def aux_album():
    """Aux: Theo's party album the morning after, everyone's shots of the night (the same gallery as gallery():
    AlbumMasonryGrid.tsx, YourNightControls.tsx): the rain indoors, the couch on the ceiling, the cake, the lift queue."""
    s = Screen()
    rain, up, cake, queue = still('ax10_rain'), still('ax10_up'), still('ax10_cake'), still('ax10_lift')
    tiles = [(up, 0.5, 0.45, 0.8, '\U0001F525', '212'), (rain, 0.5, 0.5, 0.9, '\U0001F62D', '187'), (cake, 0.5, 0.55, 0.85, '\U0001F382', '164'),
             (queue, 0.5, 0.4, 0.8, '\U0001F610', '151'), (rain, 0.35, 0.6, 0.6, '☔', '140'), (up, 0.6, 0.3, 0.55, '\U0001F92F', '133'),
             (cake, 0.4, 0.4, 0.6, '\U0001F973', '120'), (queue, 0.5, 0.7, 0.55, '\U0001F6D7', '96'), (up, 0.35, 0.6, 0.6, '\U0001F525', '91'),
             (rain, 0.65, 0.35, 0.6, '\U0001F62D', '88'), (cake, 0.6, 0.65, 0.55, '\U0001F382', '74'), (queue, 0.4, 0.45, 0.6, '\U0001F610', '61'),
             (up, 0.5, 0.75, 0.6, '\U0001F92F', '58'), (rain, 0.5, 0.3, 0.55, '☔', '52'), (cake, 0.5, 0.3, 0.6, '\U0001F973', '47')]
    def tile(i, y, mine):
        im, cx, cy, k, em, n = tiles[i]; x = (i % 3) * 120
        s.photo(sq(im, cx, cy, k).resize((116, 116), Image.NEAREST), x + 2, y + 2, x + 118, y + 118, r=pt(14))
        s.disc(x + 9, y + 85, 26, G1C); s.avatar(nobody(22), x + 11, y + 87, 22)
        w = 6 + 12 + 2 + text_w(n, 800, pt(10)) + 6; bx = x + 111 - w
        for yy in range(y + 96, min(H, y + 111)):
            for xx in range(bx, bx + w):
                r = 7; cx0 = min(max(xx, bx + r), bx + w - r - 1); cy0 = min(max(yy, y + 96 + r), y + 110 - r)
                if (xx - cx0) ** 2 + (yy - cy0) ** 2 <= r * r + 2: s.im.putpixel((xx, yy), mix(s.im.getpixel((xx, yy)), BLACK, 0.62))
        s.emoji(em, 11, bx + 11, y + 103); s.text(bx + 19, y + 103, n, 800, pt(10), WHITE)
    for i in range(3): tile(i, 160, True)
    s.text(pt(16), 307, 'Everyone else', 600, sysp(13), white(0.55))
    for i in range(3, 15): tile(i, 324 + ((i - 3) // 3) * 120, False)
    s.box(0, 0, W, 158, BLACK); header(s, "Theo's House Party"); switch(s, 'GALLERY')
    s.disc(292, 643, 51, PURPLE); s.icon('Add01Icon', 24, 317, 668, WHITE)
    return s.im

def _x(s, cx, cy, r, col, w):
    s.line(cx - r, cy - r, cx + r, cy + r, col, w); s.line(cx - r, cy + r, cx + r, cy - r, col, w)
def _scanface(s, cx, cy, r, col):
    """lucide ScanFace, by hand: four corner brackets, two eyes, a smile."""
    a = r; b = round(r * 0.45)
    for sx in (-1, 1):
        for sy in (-1, 1):
            x0, y0 = cx + sx * a, cy + sy * a
            s.line(x0, y0, x0 - sx * b, y0, col, 2); s.line(x0, y0, x0, y0 - sy * b, col, 2)
    s.box(cx - 4, cy - 4, cx - 2, cy - 2, col); s.box(cx + 2, cy - 4, cx + 4, cy - 2, col)
    s.d.arc([cx - 5, cy - 3, cx + 5, cy + 5], 20, 160, fill=col, width=2)

def face_match(album="Nio's kickback", n=41, photo=None, reacts=None):
    """One Sip's button: the notifications screen (app/notifications.tsx: SheetHeader "Notifications" in small caps with
    the close X, the section label, rows flat on black with a hairline) with the opt-in face-match row
    (src/components/notifications/FaceMatchCard.tsx: the purple gradient ring with ScanFace, "You might be in N photos",
    "Tap to review in {album}", the time from utils/notificationTime.ts, the 56-point thumbnail)."""
    s = Screen(); s.status('9:14')
    hy = pt(74)
    s.text(pt(20), hy, 'NOTIFICATIONS', 'display', pt(13), WHITE, ls=0.4)
    _x(s, W - pt(31), hy, pt(7), WHITE, 2)
    s.text(pt(28), pt(126), 'NEW', 800, pt(12), hexc('8A8A8A'), ls=1.1)
    top = pt(140); cy = top + pt(40); ix = pt(36); d = pt(48)
    g = Image.new('RGB', (d, d)); gd = ImageDraw.Draw(g)
    for k in range(2 * d):   # the gradient runs from the bottom-left (#A523EF) to the top-right (#552BCE)
        t = k / (2 * d - 1); gd.line([(k, d), (k - d, 0)] if False else [(0, d - 1 - k), (k, d - 1)], fill=mix(hexc('A523EF'), hexc('552BCE'), t), width=2)
    m = Image.new('L', (d, d), 0); ImageDraw.Draw(m).ellipse([0, 0, d - 1, d - 1], fill=255); s.im.paste(g, (ix, cy - d // 2), m)
    di = pt(44); s.disc(ix + (d - di) // 2, cy - di // 2, di, BLACK)
    _scanface(s, ix + d // 2, cy, pt(9), WHITE)
    tx = ix + d + pt(16)
    s.text(tx, cy - pt(17), f'You might be in {n} photos', 800, pt(14), WHITE)
    s.text(tx, cy + pt(1), f'Tap to review in {album}', 500, sysp(13), white(0.6))
    s.text(tx, cy + pt(18), '8 hours ago', 600, pt(10), white(0.35), ls=0.2)
    if photo is not None:
        t = pt(56); s.photo(photo.resize((t, t), Image.NEAREST), W - pt(36) - t, cy - t // 2, W - pt(36), cy + t // 2, r=pt(10))
    s.box(pt(20), top + pt(80), W - pt(20), top + pt(80) + 1, white(0.1))
    # the night's other rows under it (PhotoReactionCard.tsx: avatar, "{name} reacted {emoji} in {album}", the time)
    for k, (name, em, still_name) in enumerate(reacts or []):
        y0 = top + pt(80) + k * pt(80); cy2 = y0 + pt(40)
        s.avatar(nobody(d), ix, cy2 - d // 2, d)
        x = tx; _, x = s.text(x, cy2 - pt(9), name, 700, sysp(14), WHITE); _, x = s.text(x, cy2 - pt(9), ' reacted ', 500, sysp(14), white(0.42))
        s.emoji(em, pt(15), x + pt(8), cy2 - pt(9)); x += pt(17)
        _, x = s.text(x, cy2 - pt(9), ' in ', 500, sysp(14), white(0.42))
        s.text(tx, cy2 + pt(9), album, 700, sysp(14), WHITE)
        s.text(tx, cy2 + pt(28), '8 hours ago', 500, sysp(12), white(0.35))
        t = pt(56); s.photo(sq(still(still_name), 0.5, 0.35, 0.7).resize((t, t), Image.NEAREST), W - pt(36) - t, cy2 - t // 2, W - pt(36), cy2 + t // 2, r=pt(10))
        s.box(pt(20), y0 + pt(80), W - pt(20), y0 + pt(80) + 1, white(0.1))
    return s.im

def face_review(photo, left=41, match=94):
    """One Sip's button: app/face-review.tsx. "IS THIS YOU?" between the back chevron and an empty slot, "{N} to review"
    with the match in fainter white, the 3:4 card (radius 24) on the face-focused photo with the TAP FOR FULL PHOTO
    chip, the "Not me" (red) and "It's me" (green) pills, and the hint under them."""
    s = Screen(); s.status('9:14')
    hy = pt(79)
    s.line(pt(40) - 4, hy, pt(40) + 3, hy - 7, WHITE, 2); s.line(pt(40) - 4, hy, pt(40) + 3, hy + 7, WHITE, 2)   # ChevronLeft
    s.text(W // 2, hy, 'IS THIS YOU?', 900, pt(15), WHITE, ls=3, align='c')
    a = f'{left} to review'; b = f'   {match}% match'; wa = text_w(a, 700, pt(12)); wb = text_w(b, 700, pt(12)); x0 = W // 2 - (wa + wb) // 2
    s.text(x0, pt(108), a, 700, pt(12), white(0.5)); s.text(x0 + wa, pt(108), b, 700, pt(12), white(0.3))
    cx0, cx1 = pt(20), W - pt(20); ct = pt(128); cb = ct + round((cx1 - cx0) * 4 / 3)
    s.photo(photo, cx0, ct, cx1, cb, r=pt(24))
    chip = 'TAP FOR FULL PHOTO'; cw = text_w(chip, 800, pt(10), 1.5) + 2 * pt(12); ch = pt(22)
    s.box(W // 2 - cw // 2, cb - pt(12) - ch, W // 2 + cw // 2, cb - pt(12), mix(BLACK, BLACK, 0), r=ch // 2)
    s.text(W // 2, cb - pt(12) - ch // 2, chip, 800, pt(10), white(0.85), ls=1.5, align='c')
    by = cb + pt(18) + pt(26)
    def pill(x, label, col, bg, icon):
        w = pt(26) + pt(26) + pt(8) + text_w(label, 900, pt(15)) + pt(26)
        s.box(x, by - pt(26), x + w, by + pt(26), bg, r=pt(26))
        icon(x + pt(26) + pt(13), by, col); s.text(x + pt(26) + pt(26) + pt(8), by, label, 900, pt(15), col)
        return w
    no_w = pt(26) * 3 + pt(8) + text_w('Not me', 900, pt(15)); yes_w = pt(26) * 3 + pt(8) + text_w("It's me", 900, pt(15))
    x = W // 2 - (no_w + pt(14) + yes_w) // 2
    red, green = hexc('f87171'), hexc('34d399')
    pill(x, 'Not me', red, mix(BLACK, red, 0.16), lambda cx, cy, c: _x(s, cx, cy, pt(8), c, 3))
    pill(x + no_w + pt(14), "It's me", green, mix(BLACK, green, 0.16), lambda cx, cy, c: (s.line(cx - 8, cy, cx - 3, cy + 6, c, 3), s.line(cx - 3, cy + 6, cx + 9, cy - 7, c, 3)))
    hy2 = by + pt(26) + pt(16) + pt(8)
    s.text(W // 2, hy2, '"Not me" hides this photo from your matches', 500, sysp(12), white(0.4), align='c')
    s.text(W // 2, hy2 + pt(17), 'everywhere and improves accuracy.', 500, sysp(12), white(0.4), align='c')
    return s.im

def review_photo(name, cx, cy, k):
    """The face-focused view of a candidate (components/face/FaceFocusImage): the photo zoomed in on the face, 3:4."""
    im = still(name); w, h = im.size; cw = round(w * k); ch = round(cw * 4 / 3)
    x = min(max(0, round(cx * w - cw / 2)), w - cw); y = min(max(0, round(cy * h - ch / 2)), h - ch)
    return im.crop((x, y, x + cw, y + ch))

def camp_album(stage):
    """Wave Back v9: the Lakeview Reunion album's gallery (app/album/[id].tsx, AlbumMasonryGrid.tsx). 'marcus': on
    Marcus's phone, his own shots first, then "Everyone else". 'noshots': on Nio's, face matching finds nothing, so the
    face empty state takes the top spot (renderFaceEmpty, compact): the FaceId icon, NO SHOTS OF YOU FOUND IN THIS ALBUM
    YET, the line under it, RESCAN FOR ME. 'found': the one photo he's in, first, then everyone else."""
    s = Screen()
    jetty, sign, mower, garden, lake = still('wb9_jetty'), still('wb9_sign'), still('wb9_mower'), still('wb9_garden'), still('wb9_lake')
    tiles = [(jetty, 0.5, 0.45, 0.8, '\U0001F525', '48'), (sign, 0.5, 0.5, 0.85, '\u2764\ufe0f', '41'), (mower, 0.5, 0.55, 0.8, '\U0001F602', '39'),
             (garden, 0.5, 0.5, 0.9, '\U0001F60D', '33'), (jetty, 0.35, 0.4, 0.6, '\U0001FAF6', '30'), (sign, 0.6, 0.35, 0.6, '\U0001F525', '28'),
             (mower, 0.4, 0.5, 0.55, '\U0001F602', '24'), (garden, 0.6, 0.6, 0.6, '\u2764\ufe0f', '22'), (jetty, 0.65, 0.5, 0.6, '\U0001F60D', '19'),
             (sign, 0.4, 0.6, 0.6, '\U0001F64C', '17'), (mower, 0.6, 0.4, 0.6, '\U0001F525', '15'), (garden, 0.4, 0.4, 0.6, '\U0001FAF6', '12')]
    def tile(t, i, y, av=None):
        im, cx, cy, k, em, n = t; x = (i % 3) * 120
        s.photo(sq(im, cx, cy, k).resize((116, 116), Image.LANCZOS), x + 2, y + 2, x + 118, y + 118, r=pt(14))
        s.disc(x + 9, y + 85, 26, G1C); s.avatar(av if av is not None else nobody(22), x + 11, y + 87, 22)
        w = 6 + 12 + 2 + text_w(n, 800, pt(10)) + 6; bx = x + 111 - w
        for yy in range(y + 96, min(H, y + 111)):
            for xx in range(bx, bx + w):
                r = 7; c0 = min(max(xx, bx + r), bx + w - r - 1); c1 = min(max(yy, y + 96 + r), y + 110 - r)
                if (xx - c0) ** 2 + (yy - c1) ** 2 <= r * r + 2: s.im.putpixel((xx, yy), mix(s.im.getpixel((xx, yy)), BLACK, 0.62))
        s.emoji(em, 11, bx + 11, y + 103); s.text(bx + 19, y + 103, n, 800, pt(10), WHITE)
    if stage == 'marcus':
        for i in range(3): tile(tiles[i], i, 160)
        s.text(pt(16), 307, 'Everyone else', 600, sysp(13), white(0.55))
        for i in range(3, 12): tile(tiles[i], i, 324 + ((i - 3) // 3) * 120)
    elif stage == 'noshots':
        s.icon('FaceIdIcon', 40, 180, 196, white(0.4))
        s.text(180, 238, 'NO SHOTS OF YOU FOUND', 'display', pt(18), WHITE, ls=1, align='c')
        s.text(180, 260, 'IN THIS ALBUM YET', 'display', pt(18), WHITE, ls=1, align='c')
        s.text(180, 288, "We'll let you know when you're", 400, sysp(14), hexc('9A9A9A'), align='c')
        s.text(180, 308, 'spotted in new photos.', 400, sysp(14), hexc('9A9A9A'), align='c')
        s.box(80, 330, 280, 378, PURPLE, r=24); s.text(180, 354, 'RESCAN FOR ME', 900, pt(13), WHITE, ls=2, align='c')
        for i in range(9): tile(tiles[i], i, 404 + (i // 3) * 120)
    else:
        tile((lake, 0.5, 0.55, 0.5, '\U0001F602', '212'), 0, 160, pic('avatar', 22, 22))
        s.text(pt(16), 307, 'Everyone else', 600, sysp(13), white(0.55))
        for i in range(9): tile(tiles[i], i, 324 + (i // 3) * 120)
    s.box(0, 0, W, 158, BLACK); header(s, 'Lakeview Reunion'); switch(s, 'GALLERY')
    s.disc(292, 643, 51, PURPLE); s.icon('Add01Icon', 24, 317, 668, WHITE)
    return s.im

SCREENS = {'push-aux': lambda: lock_push([("Theo's House Party", 'jaz.k: HOW IS IT RAINING INSIDE', 'now', still('ax10_rain')), ("Theo's House Party", 'dre_m and 31 others posted to the album', 'now', None), ("Theo's House Party", 'mo.b: theo next weekend??', '1m ago', None), ("Theo's House Party", 'kenzie reacted to your photo', '1m ago', None)], '1:12', 'Sunday, November 23', still('ax10_cake')), 'push-aux2': lambda: lock_push([("Theo's House Party", 'lena.p: best night of my life fr', 'now', still('ax10_up')), ("Theo's House Party", 'jaz.k: HOW IS IT RAINING INSIDE', '1m ago', None), ("Theo's House Party", 'dre_m and 31 others posted to the album', '1m ago', None)], '1:13', 'Sunday, November 23', still('ax10_cake')), 'camp-album': lambda: camp_album('marcus'), 'camp-noshots': lambda: camp_album('noshots'), 'camp-found': lambda: camp_album('found'), 'push-lakeview': lambda: lock_push([('PXI', 'Marcus added you to Lakeview Reunion', 'now', still('wb9_jetty'))], '4:12', 'Thursday, November 20'), 'push-photo1': lambda: lock_push([('Lakeview Reunion', 'You might be in 1 photo', 'now', None)], '6:47', 'Sunday, November 23'), 'thread': thread, 'gallery': gallery, 'discover': discover, 'map': discover_map, 'camera': camera, 'passport': passport, 'lock': lock, 'roof': roof_album, 'dinner': sunday_dinner, 'dinner2': lambda: sunday_dinner(True), 'aux-album': aux_album, 'invite': invite_notif, 'test-event': lambda: event_details('Lakeview Reunion', still('gp8_930'), "Marcus's place", 'SUN 23 NOV', '7:00 PM'), 'parkway-a': lambda: parkway_thread(0), 'parkway-b': lambda: parkway_thread(1), 'push-parkway': lambda: lock_push([('151 Parkway Residents', 'kwame.o: is this OUR roof??', 'now', None), ('151 Parkway Residents', 'denise_3b reacted to your photo', 'now', None), ('151 Parkway Residents', 'lily.w and 18 others reacted', '1m ago', None), ('151 Parkway Residents', 'ray_4f: who took this', '1m ago', None)], '7:48', 'Tuesday, November 18'), 'push-face41': lambda: lock_push([('PXI', 'You might be in 41 photos', 'now', still('os8_700'))], '9:14', 'Thursday, November 20', still('gp8_930').crop((48, 0, 491, 960))), 'push-invite': push_invite, 'invite-card': invite_card, 'invite-going': lambda: invite_card(True), 'roof-thread-a': lambda: roof_thread(9, [('AMA.K', 'who took this')]), 'roof-thread-b': lambda: roof_thread(60, [('AMA.K', 'who took this'), ('KOFI', 'wallpaper')]), 'song-rain': lambda: now_playing('Rainy Day Piano', '\U0001F327', '3d5a80'), 'song-rain-wet': lambda: now_playing('Rainy Day Piano', '\U0001F327', '3d5a80', 1), 'song-roof-wet': lambda: now_playing('Through The Roof', '\U0001F680', 'c0392b', 2), 'song-roof': lambda: now_playing('Through The Roof', '\U0001F680', 'c0392b'), 'song-bday': lambda: now_playing('Happy Birthday', '\U0001F382', 'e88cb0'), 'song-lift': lambda: now_playing('Lift Music', '\U0001F6D7', '8a8f98'),
           'facematch': lambda: face_match(photo=sq(still('os8_700'), 0.5, 0.3, 0.5), reacts=[('Theo', '\U0001F602', 'os8_700'), ('Imane', '\U0001F480', 'os8_340'), ('Maya', '\U0001F62D', 'os8_505')]),
           'review-king': lambda: face_review(review_photo('os8_700', 0.5, 0.3, 0.5), 41, 94),
           'review-duke': lambda: face_review(review_photo('os8_505', 0.5, 0.3, 0.8), 40, 91),
           'review-snob': lambda: face_review(review_photo('os8_205', 0.5, 0.3, 0.8), 39, 88)}
if __name__ == '__main__':
    name = sys.argv[1]
    for n in (SCREENS if name == 'all' else [name]):
        im = SCREENS[n](); f = sys.argv[2] if len(sys.argv) > 2 and name != 'all' else os.path.join(OUT, f'{n}.png')
        im.save(f); im.resize((W * 3, H * 3), Image.NEAREST).save(f.replace('.png', '_x3.png')); print(f)
