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
    'selfie':   {'cam': 'head', 'yaw': 168, 'face': 'charm', 'lookCam': 1},
    'avatar':   {'cam': 'head', 'camPos': [2.12, 1.45, 1.3], 'camAt': [2.0, 1.44, 2.5], 'fov': 24, 'yaw': 172, 'face': 'charm', 'lookCam': 1},
    'smug':     {'cam': 'mid', 'yaw': 160, 'face': 'smug', 'crossed': True, 'lookCam': 1},
    'bed':      {'cam': 'bed', 'clip': 'Sitting_Idle_Loop', 'at': [1.6, 3.02], 'seat': 0.47, 'yaw': 180, 'stance': 1, 'arms': 1, 'upright': 0.3, 'face': 'charm'},
    'laugh':    {'cam': 'head', 'yaw': 190, 'face': 'laughing', 'lookCam': 0.4},
    'walk':     {'cam': 'full', 'yaw': 140, 'face': 'neutral', 'clip': 'Walk_Loop', 't': 8, 'stance': 1, 'arms': 1, 'upright': 0.3, 'lookCam': 0},
    'low':      {'cam': 'low', 'yaw': 200, 'face': 'smug', 'crossed': True, 'lookCam': 1},
    'high':     {'cam': 'high', 'yaw': 215, 'face': 'hyped', 'lookCam': 1},
    'phone':    {'cam': 'mid', 'yaw': 195, 'face': 'deadpan', 'phone': 1, 'gaze': [0, -0.8], 'lookCam': 0},
    'window':   {'cam': 'land', 'actor': False},
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

SCREENS = {'thread': thread, 'gallery': gallery}
if __name__ == '__main__':
    name = sys.argv[1]
    for n in (SCREENS if name == 'all' else [name]):
        im = SCREENS[n](); f = sys.argv[2] if len(sys.argv) > 2 and name != 'all' else os.path.join(OUT, f'{n}.png')
        im.save(f); im.resize((W * 3, H * 3), Image.NEAREST).save(f.replace('.png', '_x3.png')); print(f)
