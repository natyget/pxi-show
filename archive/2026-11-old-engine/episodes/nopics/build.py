#!/usr/bin/env python3
"""Build "No Pics" (the pilot) from its board: engine shots, phone inserts, subtitles, music and effects.

  python3 episodes/nopics/build.py [shots|inserts|cut|all] [--only N,N]

Shots are N3Shot specs checked by the world rules. Inserts are drawn with the PXI kit (studio/anim/tools/pxi) and the
engine's own pictures. Voices are not in this cut: the approved voice model could not be reached from this machine,
so lines play as subtitles only. Everything else is final.
"""
import json, math, os, shutil, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ANIM = os.path.abspath(os.path.join(HERE, '..', '..', 'studio', 'anim'))
sys.path.insert(0, os.path.join(ANIM, 'tools', 'pxi'))
import ui                                    # noqa: E402
from ui import W as SW, H as SH, world, Screen, hexc, mix, WHITE, BLACK, text_w, pt  # noqa: E402
import screens                               # noqa: E402

OUT = os.path.join(ANIM, 'out', 'nopics')
FPS, FW, FH = 24, 1080, 1920
NIO_C, MAYA_C = (255, 255, 255), (255, 196, 226)
FONT = os.path.join(ANIM, 'public', 'PixelifySans.ttf')

def N(cam, frames, face, at='rug', action='stand', **k):
    a = {'who': 'nio', 'at': at, 'action': action, 'face': face}; a.update(k)
    return {'set': 'nioRoom', 'camera': cam, 'frames': frames, 'actors': [a]}

# The board. Each row: (id, frames, kind, spec or insert name, [(start, end, who, line)], [sfx]).
# Lines are timed inside the shot in frames. Nio's mouth moves only inside his own lines.
B = [
 ('s01', 56, 'shot', N('bed', 56, [[0, 'hyped']], at='bedEdge', action='sitTalk', hold='phone', speak=[[6, 46]]),
  [(4, 56, 'NIO', 'Look at Sami. Look at this man on my desk.')], []),
 ('i02', 66, 'insert', 'roll', [], ['swipe@24', 'swipe@46']),
 ('s03', 44, 'shot', N('high', 44, [[0, 'hyped'], [12, 'uneasy'], [26, 'crushed']], at='bedEdge', action='sit', hold='phone'), [], []),
 ('i04', 44, 'insert', 'thumb', [], []),
 ('s05', 46, 'shot', N('mid', 46, [[0, 'deadpan']], hold='phone', facing='camera'),
  [(2, 46, 'MAYA', "Hiii! Wasn't last night the best?")], ['ring@0']),
 ('s06', 36, 'shot', N('low', 36, 'deadpan', facing='camera', speak=[[4, 26]]),
  [(2, 36, 'NIO', 'How many photos am I in.')], []),
 ('s07', 40, 'shot', N('mid', 40, [[0, 'suspicious']], hold='phone', facing='camera', speak=[[22, 32]]),
  [(0, 18, 'MAYA', 'Loads!'), (20, 40, 'NIO', 'Name one.')], []),
 ('s08', 52, 'shot', N('close', 52, [[0, 'deadpan'], [30, 'deadInside']], facing='camera'),
  [(24, 52, 'MAYA', 'The one with your elbow.')], []),
 ('s09', 36, 'shot', N('side', 36, [[0, 'smug'], [24, 'laughing']], speak=[[2, 22]]),
  [(0, 36, 'NIO', 'Describe the elbow.')], []),
 ('s10', 46, 'shot', N('side', 46, [[0, 'deadpan'], [28, 'asleep']]),
  [(2, 30, 'MAYA', 'It looked... happy?')], []),
 ('s11', 66, 'shot', N('low', 66, 'smug', facing='camera', hold='arms-crossed', speak=[[4, 58]]),
  [(2, 66, 'NIO', "They cut me out. Sami's been weird since I beat him at pool.")], []),
 ('s12', 74, 'shot', N('mid', 74, [[0, 'sheepish'], [50, 'suspicious']], hold='phone', facing='camera'),
  [(2, 74, 'MAYA', 'Nio, you had the phone all night. You kept going "one more, chin up."')], []),
 ('s13', 30, 'shot', N('full', 30, 'suspicious', facing='camera', speak=[[2, 20]]),
  [(0, 30, 'NIO', 'Sami got to you.')], []),
 ('s14', 36, 'shot', N('mid', 36, [[0, 'suspicious'], [18, 'deadpan']], hold='phone', facing='camera'),
  [(2, 36, 'MAYA', "He's asleep on my floor.")], []),
 ('i15', 72, 'insert', 'zoom', [], ['zoom@18', 'zoom@32', 'zoom@46']),
 ('s16', 40, 'shot', N('low', 40, 'hyped', hold='phone', facing='camera', speak=[[4, 30]]),
  [(2, 40, 'NIO', 'There he is. Evidence.')], []),
 ('s17', 36, 'shot', N('wide', 36, [[0, 'smug'], [16, 'crushed']], hold='phone', facing='camera'),
  [(4, 36, 'MAYA', "That's a sunglass.")], []),
 ('i18', 36, 'insert', 'camera', [], ['click@30']),
 ('s19', 40, 'shot', N('mid', 40, 'neutral', hold='phone', facing='camera'),
  [(2, 40, 'MAYA', "What's that clicking?")], ['click@8', 'click@26']),
 ('s20', 30, 'shot', N('close', 30, 'charm', facing='camera', speak=[[4, 16]]),
  [(0, 30, 'NIO', 'Round two.')], []),
 ('s21', 72, 'shot', N('wide', 72, 'hyped', action='dance', hold='phone', facing='camera'), [], ['music@0', 'click@12', 'click@30', 'click@48', 'click@64']),
 ('i22', 36, 'insert', 'album', [], ['click@6', 'click@18', 'click@30']),
 ('s23', 40, 'shot', N('low', 40, 'hyped', action='dance', hold='phone', facing='camera'),
  [(4, 40, 'MAYA', 'Nio. The group chat is going off.')], ['click@10', 'click@26']),
 ('i24', 50, 'insert', 'push', [], ['ding@2', 'musicstop@2']),
 ('i25', 78, 'insert', 'found', [], []),
 ('s26', 52, 'shot', N('side', 52, [[0, 'neutral'], [14, 'real']], hold='phone'), [], []),
 ('s27', 46, 'shot', N('full', 46, [[0, 'real'], [20, 'shock']], hold='phone', facing='camera'),
  [(2, 40, 'MAYA', 'Why are you dancing in the group album?')], ['click@40']),
 ('s28', 40, 'shot', N('mid', 40, 'charm', action='talk', facing='camera', look='camera', speak=[[6, 26]]),
  [(4, 40, 'NIO', 'This my app, yo.')], []),
]

def sh(cmd, **k): subprocess.run(cmd, check=True, **k)

# ---------------------------------------------------------------- engine shots
def render_shot(sid, spec):
    d = os.path.join(OUT, sid); raw = d + '_raw'
    if os.path.exists(os.path.join(d, 'done')): return
    shutil.rmtree(raw, ignore_errors=True); shutil.rmtree(d, ignore_errors=True)
    sh(['npx', 'remotion', 'render', 'src/index.ts', 'N3Shot', raw, '--sequence', '--image-format=png', '--gl=swangle', '--log=error',
        '--browser-executable=/opt/pw-browsers/chromium', '--props=' + json.dumps({'spec': spec})], cwd=ANIM, stdout=subprocess.DEVNULL)
    sh(['python3', 'tools/nw_finish.py', 'seq', raw, d, '--scale', '6'], cwd=ANIM, stdout=subprocess.DEVNULL)
    shutil.rmtree(raw, ignore_errors=True); open(os.path.join(d, 'done'), 'w').close()

def shot_frames(sid):
    d = os.path.join(OUT, sid); fs = sorted(f for f in os.listdir(d) if f.endswith('.png'))
    return [os.path.join(d, f) for f in fs]

# ---------------------------------------------------------------- inserts
ROOM_DARK = {'cam': 'wide', 'actor': False}
def party_photo(w, h, kind):
    """This room last night, from a phone: dark, lights everywhere, people as silhouettes against the window, and
    a blurry thumb in the corner. Drawn on the engine's own picture of the room."""
    base = world({'cam': 'wide', 'camPos': [2.4, 1.3, 0.7] if kind != 'door' else [2.6, 1.4, 3.6],
                  'camAt': [2.4, 1.1, 3.6] if kind != 'door' else [1.0, 1.1, 0.6], 'fov': 64, 'actor': False}, w, h)
    a = np.array(base).astype(float) * 0.62
    rng = np.random.default_rng({'sami': 1, 'door': 2, 'all': 3}[kind])
    im = Image.fromarray(a.astype(np.uint8)); dr = ImageDraw.Draw(im)
    for _ in range(9):                                     # party light: soft coloured spots
        x, y, r = int(rng.integers(0, w)), int(rng.integers(0, h // 2)), int(rng.integers(w // 16, w // 9))
        col = [(255, 80, 180), (90, 160, 255), (255, 180, 60)][rng.integers(0, 3)]
        spot = Image.new('L', (w, h), 0); ImageDraw.Draw(spot).ellipse([x - r, y - r, x + r, y + r], fill=90)
        im = Image.composite(Image.new('RGB', (w, h), col), im, spot.filter(ImageFilter.GaussianBlur(float(r) / 5)))
    dr = ImageDraw.Draw(im); ink = (24, 16, 28)
    def person(cx, base_y, s, arms_up=False):
        dr.ellipse([cx - 7 * s, base_y - 62 * s, cx + 7 * s, base_y - 47 * s], fill=ink)        # head
        dr.rounded_rectangle([cx - 10 * s, base_y - 47 * s, cx + 10 * s, base_y - 14 * s], 5 * s, fill=ink)
        dr.rectangle([cx - 8 * s, base_y - 16 * s, cx - 2 * s, base_y], fill=ink); dr.rectangle([cx + 2 * s, base_y - 16 * s, cx + 8 * s, base_y], fill=ink)
        if arms_up:
            dr.line([cx - 8 * s, base_y - 44 * s, cx - 17 * s, base_y - 72 * s], fill=ink, width=int(5 * s))
            dr.line([cx + 8 * s, base_y - 44 * s, cx + 17 * s, base_y - 72 * s], fill=ink, width=int(5 * s))
    s = w / 180
    if kind == 'sami':
        dr.rectangle([int(w * 0.45), int(h * 0.62), int(w * 0.95), int(h * 0.68)], fill=(40, 28, 30))   # the desk
        person(int(w * 0.7), int(h * 0.62), s * 1.3, arms_up=True)
        for i, x in enumerate((0.15, 0.3, 0.88)): person(int(w * x), int(h * 0.95), s * (1.6 + 0.2 * i), arms_up=i == 1)
    elif kind == 'door':
        for i, x in enumerate((0.3, 0.48, 0.66)): person(int(w * x), int(h * 0.82), s * 1.5)
    else:
        for i, x in enumerate((0.1, 0.25, 0.42, 0.58, 0.74, 0.9)): person(int(w * x), int(h * (0.86 + 0.05 * (i % 2))), s * 1.4, arms_up=i % 2 == 0)
    th = Image.new('L', (w, h), 0)                          # his thumb, out of focus, bottom corner
    ImageDraw.Draw(th).ellipse([int(w * 0.68), int(h * 0.74), int(w * 1.15), int(h * 1.1)], fill=235)
    im = Image.composite(Image.new('RGB', (w, h), (196, 140, 112)), im, th.filter(ImageFilter.GaussianBlur(float(w) / 30)))
    return im

def on_phone(screen_im, bg=None, scale=2):
    """A phone screen (360 x 780) shown big and sharp in the middle of the frame, over the room dimmed."""
    if bg is None: bg = Image.open(world(ROOM_DARK, 180, 320).filename if False else os.path.join(OUT, '_bg.png'))
    fr = bg.copy(); ph = screen_im.resize((SW * scale, SH * scale), Image.NEAREST)
    x, y = (FW - ph.width) // 2, (FH - ph.height) // 2
    body = Image.new('RGB', (ph.width + 36, ph.height + 36), (20, 18, 22)); m = Image.new('L', body.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, body.width - 1, body.height - 1], 70, fill=255)
    fr.paste(body, (x - 18, y - 18), m)
    sm = Image.new('L', ph.size, 0); ImageDraw.Draw(sm).rounded_rectangle([0, 0, ph.width - 1, ph.height - 1], 54, fill=255)
    fr.paste(ph, (x, y), sm)
    return fr

def roll_screen(kind):
    s = Screen(); p = party_photo(SW, 480, kind); s.im.paste(p, (0, 150)); s.status('6:12')
    s.text(180, 92, {'sami': 'Yesterday  2:14 AM', 'door': 'Yesterday  2:31 AM', 'all': 'Yesterday  3:05 AM'}[kind], 600, 15, WHITE, align='c')
    return s.im

def insert_frames(name, n):
    bg = Image.open(os.path.join(OUT, '_bg.png'))
    if name == 'roll':
        a, b, c = (on_phone(roll_screen(k), bg) for k in ('sami', 'door', 'all'))
        return [a if f < 24 else b if f < 46 else c for f in range(n)]
    if name == 'thumb':
        # the picture joke: his real thumb comes up beside the blurry one on the screen. It matches.
        base = on_phone(roll_screen('all'), bg); out = []
        for f in range(n):
            fr = base.copy(); k = min(1, max(0, (f - 6) / 6)); y = int(1960 - 640 * (1 - (1 - k) ** 3))
            d = ImageDraw.Draw(fr)
            d.rounded_rectangle([760, y, 960, y + 520], 95, fill=(176, 122, 96), outline=(30, 20, 24), width=10)
            d.rounded_rectangle([800, y + 30, 920, y + 170], 50, fill=(226, 188, 170), outline=(30, 20, 24), width=8)   # the nail
            out.append(fr)
        return out
    if name == 'zoom':
        ph = party_photo(720, 1000, 'all'); d = ImageDraw.Draw(ph)
        # a stranger close to the lens: head and big sunglasses, and in the left lens, tiny, Nio mid-shout
        d.ellipse([140, 300, 520, 760], fill=(28, 20, 30)); d.rectangle([150, 470, 510, 520], fill=(12, 10, 14))
        for lx in (160, 345):
            d.rounded_rectangle([lx, 440, lx + 165, 580], 44, fill=(36, 62, 74), outline=(8, 8, 10), width=8)
        nio = world({'cam': 'head', 'yaw': 168, 'face': 'hyped', 'lookCam': 1}, 60, 84); m = Image.new('L', nio.size, 0)
        ImageDraw.Draw(m).ellipse([0, 0, 59, 83], fill=170); ph.paste(nio, (213, 468), m)
        d.line([180, 460, 205, 448], fill=(200, 230, 240), width=6)   # the shine on the lens
        out = []
        steps = [(0, 0, 720, 1000), (110, 330, 560, 954), (170, 420, 320, 628), (205, 460, 281, 565)]
        for f in range(n):
            i = min(3, max(0, (f - 4) // 14)); x0, y0, x1, y1 = steps[i]
            crop = ph.crop((x0, y0, x1, y1)).resize((SW, 500), Image.NEAREST)
            s = Screen(); s.im.paste(crop, (0, 140)); s.status('6:13')
            out.append(on_phone(s.im, bg))
        return out
    selfie = world({'cam': 'head', 'yaw': 168, 'face': 'hyped', 'lookCam': 1}, SW, SH)
    if name == 'camera':
        im = screens.camera('FRIDAY', world({'cam': 'head', 'yaw': 168, 'face': 'charm', 'lookCam': 1}, SW, SH)); return [on_phone(im, bg)] * n
    if name == 'album':
        im = screens.camera('FRIDAY', selfie, 'high'); return [on_phone(im, bg)] * n
    if name == 'push':
        cam = screens.camera('FRIDAY', selfie, 'high'); out = []
        for f in range(n):
            s = Screen(); s.im = cam.copy(); s.d = ImageDraw.Draw(s.im); k = min(1, f / 5); y = int(-70 + 130 * k)
            s.box(11, y, 341, y + 59, (233, 233, 236), r=20); s.photo(screens.app_icon(34), 22, y + 12, 56, y + 46, r=8)
            s.text(66, y + 19, 'PXI', 600, ui.sysp(15), (12, 12, 14)); s.text(66, y + 37, 'You might be in 38 photos', 400, ui.sysp(15), (12, 12, 14))
            s.text(284, y + 21, 'now', 400, ui.sysp(13), (128, 128, 134), align='r')
            out.append(on_phone(s.im, bg))
        return out
    if name == 'found':
        pics = [world(screens.SHOTS[k], SW, 480) for k in ('laugh', 'high', 'bed2')]
        out = []
        for f in range(n):
            s = Screen(); s.status('6:14'); s.im.paste(pics[min(2, f // 26)], (0, 150))
            s.text(180, 92, 'friday', 700, 17, WHITE, align='c')
            out.append(on_phone(s.im, bg))
        return out
    raise SystemExit('no insert ' + name)

# ---------------------------------------------------------------- subtitles
_font = ImageFont.truetype(FONT, 76)
def subtitle(fr, text, col):
    d = ImageDraw.Draw(fr); words = text.split(); lines = ['']
    for w in words:
        t = (lines[-1] + ' ' + w).strip()
        if d.textlength(t, font=_font) > FW - 140: lines.append(w)
        else: lines[-1] = t
    y = 1500 - (len(lines) - 1) * 44
    for ln in lines:
        x = (FW - d.textlength(ln, font=_font)) / 2
        for dx, dy in [(-6, 0), (6, 0), (0, -6), (0, 6), (-6, -6), (6, 6), (-6, 6), (6, -6), (0, 10)]:
            d.text((x + dx, y + dy), ln, font=_font, fill=(21, 18, 22))
        d.text((x, y), ln, font=_font, fill=col); y += 88

# ---------------------------------------------------------------- sound (made here; no outside music)
SR = 48000
def tone(f, dur, amp=0.3, decay=6.0):
    t = np.arange(int(SR * dur)) / SR; return amp * np.sin(2 * np.pi * f * t) * np.exp(-decay * t)
def noise(dur, amp=0.3, decay=30.0):
    t = np.arange(int(SR * dur)) / SR; return amp * np.random.default_rng(5).uniform(-1, 1, t.size) * np.exp(-decay * t)
SFX = {
    'click': lambda: np.concatenate([noise(0.02, 0.5, 60), np.zeros(int(SR * 0.03)), noise(0.04, 0.35, 45)]),
    'ding': lambda: tone(1318, 0.5, 0.25, 5) + np.pad(tone(1760, 0.45, 0.2, 5), (int(SR * 0.05), 0))[:int(SR * 0.5)],
    'ring': lambda: np.concatenate([tone(880, 0.12, 0.15, 2) + tone(1100, 0.12, 0.1, 2), np.zeros(int(SR * 0.08)), tone(880, 0.12, 0.15, 2)]),
    'swipe': lambda: noise(0.12, 0.12, 18),
    'zoom': lambda: tone(600, 0.08, 0.1, 20) + tone(900, 0.08, 0.06, 20),
}
def music(dur):
    """A dance loop made from scratch: four-on-the-floor kick, offbeat hat, a two-chord synth stab. 120 bpm."""
    n = int(SR * dur); out = np.zeros(n); beat = SR // 2
    for i in range(0, n, beat):
        k = tone(55, 0.25, 0.7, 14) * np.linspace(1.6, 1, int(SR * 0.25)); out[i:i + k.size] += k[:max(0, n - i)]
        h = noise(0.05, 0.12, 80); j = i + beat // 2; out[j:j + h.size] += h[:max(0, n - j)]
    for b, i in enumerate(range(0, n, beat * 2)):
        root = [220, 196][(b // 2) % 2]; st = sum(tone(root * r, 0.3, 0.07, 7) for r in (1, 1.26, 1.5))
        j = i + beat // 2; out[j:j + st.size] += st[:max(0, n - j)]
    return out

def soundtrack(total):
    a = np.zeros(int(SR * total / FPS) + SR); t0 = 0; mstart = mstop = None
    room = noise(total / FPS + 1, 0.01, 0)                     # rain on the window, very low, all the way through
    a[:room.size] += np.convolve(room, np.ones(40) / 40, 'same')[:a.size]
    for sid, n, kind, spec, lines, fx in B:
        for e in fx:
            nm, at = e.split('@'); i = int(SR * (t0 + int(at)) / FPS)
            if nm == 'music': mstart = i
            elif nm == 'musicstop': mstop = i
            else: s = SFX[nm](); a[i:i + s.size] += s[:a.size - i]
        t0 += n
    if mstart is not None:
        m = music((mstop - mstart) / SR); a[mstart:mstart + m.size] += m
    a = a / max(1e-6, np.abs(a).max()) * 0.6
    f = os.path.join(OUT, 'nopics.wav'); w = wave.open(f, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((a * 32767).astype(np.int16).tobytes()); w.close(); return f

# ---------------------------------------------------------------- the cut
def cut():
    fin = os.path.join(OUT, 'frames'); shutil.rmtree(fin, ignore_errors=True); os.makedirs(fin)
    k = 0
    for sid, n, kind, spec, lines, fx in B:
        frames = [Image.open(p).convert('RGB') for p in shot_frames(sid)] if kind == 'shot' else insert_frames(spec, n)
        clicks = [int(e.split('@')[1]) for e in fx if e.startswith('click@')] if kind == 'shot' else []
        for f in range(n):
            fr = frames[min(f, len(frames) - 1)].copy()
            if any(0 <= f - c < 2 for c in clicks):            # the phone's flash, two frames
                fr = Image.blend(fr, Image.new('RGB', fr.size, (255, 255, 255)), 0.55)
            for (a, b, who, line) in lines:
                if a <= f < b: subtitle(fr, line, NIO_C if who == 'NIO' else MAYA_C)
            fr.save(os.path.join(fin, f'{k:05d}.png')); k += 1
    wav = soundtrack(k)
    out = os.path.join(HERE, 'nopics-draft.mp4')
    sh(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', os.path.join(fin, '%05d.png'), '-i', wav,
        '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-af', 'loudnorm=I=-16:TP=-1.5', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', out])
    print(out, k, 'frames')

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'
    only = sys.argv[sys.argv.index('--only') + 1].split(',') if '--only' in sys.argv else None
    if not os.path.exists(os.path.join(OUT, '_bg.png')):
        bg = world({'cam': 'wide', 'actor': False}, 180, 320)
        bg = Image.fromarray((np.array(bg).astype(float) * 0.35).astype(np.uint8)).resize((FW, FH), Image.NEAREST); bg.save(os.path.join(OUT, '_bg.png'))
    if what in ('check', 'all'):
        specs = os.path.join(OUT, 'specs.json'); json.dump([r[3] for r in B if r[2] == 'shot'], open(specs, 'w'))
        sh([os.path.join(ANIM, 'tools', 'n3_check.sh'), specs], cwd=ANIM)
    if what in ('shots', 'all'):
        for sid, n, kind, spec, *_ in B:
            if kind == 'shot' and (not only or sid in only): print('render', sid, flush=True); render_shot(sid, spec)
    if what in ('cut', 'all'): cut()
