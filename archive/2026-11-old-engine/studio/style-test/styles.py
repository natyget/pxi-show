"""Quick style test: the same moment (Nio shows Maya his phone, apartment at night) in styles A, B and C.
Everything is drawn in code at low resolution, outlined, then scaled up with hard pixel edges."""
import numpy as np
from PIL import Image, ImageDraw, ImageFont

INK = (20, 18, 22)          # off-black outline
NIGHT = (58, 42, 53)        # mauve/brown night wall
NIGHT2 = (44, 32, 41)
FLOOR = (78, 58, 60)
CREAM = (239, 230, 210)
CREAM2 = (214, 202, 178)
BLUE = (46, 107, 255)       # PXI electric blue
BLUE_L = (140, 180, 255)
SKIN = (233, 190, 160)
SKIN2 = (205, 160, 132)
HAIR_N = (32, 26, 30)
HAIR_M = (70, 40, 34)
JACKET = (150, 92, 128)
JACKET2 = (120, 70, 102)
PANTS = (40, 38, 48)
MOON = (250, 240, 214)
SKYC = (26, 22, 40)
WIN = (36, 30, 52)


class Layer:
    """A drawing layer with a mask, so each part can be outlined on its own."""
    def __init__(self, w, h):
        self.img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img)

    def rect(self, x0, y0, x1, y1, c):
        self.d.rectangle([x0, y0, x1, y1], fill=c + (255,))

    def ell(self, x0, y0, x1, y1, c):
        self.d.ellipse([x0, y0, x1, y1], fill=c + (255,))

    def px(self, x, y, c):
        self.d.point((x, y), fill=c + (255,))


def outline(layer, width=1):
    a = np.array(layer.img)
    m = a[..., 3] > 0
    g = m.copy()
    for _ in range(width):
        n = g.copy()
        n[1:, :] |= g[:-1, :]; n[:-1, :] |= g[1:, :]; n[:, 1:] |= g[:, :-1]; n[:, :-1] |= g[:, 1:]
        g = n
    ring = g & ~m
    a[ring] = INK + (255,)
    return Image.fromarray(a)


def paste(base, layer, width=1):
    o = outline(layer, width)
    base.alpha_composite(o)


# ---------------------------------------------------------------- characters
def eye(F, ex, ey, ew, eh, s, lid):
    """A white eye with an ink rim and a small pupil. lid=True draws Maya's half-lidded, side-eye look."""
    F.d.ellipse([ex - 1, ey - 1, ex + ew + 1, ey + eh + 1], fill=INK + (255,))
    F.d.ellipse([ex, ey, ex + ew, ey + eh], fill=(255, 255, 255, 255))
    p = max(2, s // 2)
    if lid:
        F.rect(ex - 1, ey - 1, ex + ew + 1, ey + eh // 2 - 1, SKIN)
        F.rect(ex - 1, ey + eh // 2 - 1, ex + ew + 1, ey + eh // 2, INK)
        F.rect(ex + ew - p - 1, ey + eh // 2 + 1, ex + ew - 1, ey + eh // 2 + p, INK)   # looking sideways
    else:
        cx, cy = ex + ew // 2, ey + eh // 2
        F.rect(cx - p // 2, cy - p // 2, cx - p // 2 + p - 1, cy - p // 2 + p - 1, INK)
def nio(W, H, x, y, s, tall=False, shade=False):
    """Nio at (x, y) = feet centre. s = unit size. Cream hoodie, flat dark fringe, white sneakers, phone held up."""
    L = Layer(W, H)
    hh = 5 * s if tall else 6 * s           # head height
    hw = 5 * s if tall else 6 * s
    body_h = 6 * s if tall else 4 * s
    leg_h = 6 * s if tall else 3 * s
    feet = y
    leg_top = feet - leg_h
    body_top = leg_top - body_h
    head_bot = body_top + s // 2
    head_top = head_bot - hh
    # legs
    L.rect(x - 2 * s, leg_top, x - s // 3, feet - s // 2, PANTS)
    L.rect(x + s // 3, leg_top, x + 2 * s, feet - s // 2, PANTS)
    # sneakers (spotless white)
    L.rect(x - 2 * s - s // 3, feet - s, x - s // 3, feet, (250, 250, 248))
    L.rect(x + s // 3, feet - s, x + 2 * s + s // 3, feet, (250, 250, 248))
    paste_parts = [L]
    # hoodie body
    B = Layer(W, H)
    B.rect(x - 3 * s, body_top + s // 2, x + 3 * s, leg_top + s // 2, CREAM)
    B.ell(x - 3 * s, body_top, x + 3 * s, body_top + 2 * s, CREAM)
    if shade:
        B.rect(x + 2 * s, body_top + s, x + 3 * s, leg_top + s // 2, CREAM2)
    # hoodie pocket
    B.rect(x - 2 * s, leg_top - s - s // 2, x + 2 * s, leg_top - s // 2, CREAM2)
    # left arm down
    A = Layer(W, H)
    A.rect(x - 4 * s, body_top + s, x - 3 * s, leg_top - s // 2, CREAM2 if shade else CREAM)
    A.ell(x - 4 * s, leg_top - s, x - 3 * s + 1, leg_top, SKIN)
    # right arm bent, holding phone up at chest
    R = Layer(W, H)
    R.rect(x + 3 * s, body_top + s, x + 4 * s, body_top + 3 * s, CREAM)
    R.rect(x + s, body_top + 2 * s, x + 4 * s, body_top + 3 * s, CREAM)
    P = Layer(W, H)
    px0, py0 = x + s // 2, body_top + s // 2
    P.rect(px0, py0, px0 + 2 * s, py0 + 3 * s, INK)
    P.rect(px0 + 1, py0 + 1, px0 + 2 * s - 1, py0 + 3 * s - 1, BLUE)
    P.rect(px0 + 2, py0 + 2, px0 + 2 * s - 2, py0 + 3, BLUE_L)
    # head
    Hd = Layer(W, H)
    Hd.ell(x - hw // 2 - s, head_top, x + hw // 2 + s, head_bot, SKIN)
    if shade:
        Hd.ell(x + hw // 2 - s // 2, head_top + s, x + hw // 2 + s, head_bot - s, SKIN2)
    # flat dark fringe: straight bottom edge
    Hr = Layer(W, H)
    Hr.ell(x - hw // 2 - s - 1, head_top - s // 2, x + hw // 2 + s + 1, head_top + hh // 2 + s // 2, HAIR_N)
    Hr.rect(x - hw // 2 - s, head_top + s, x + hw // 2 + s, head_top + int(hh * 0.33), HAIR_N)
    # face: the blank stare (big white eyes, pin pupils, flat mouth)
    F = Layer(W, H)
    ey = head_top + int(hh * 0.4)
    ew, eh = int(s * 1.5), int(s * 1.9)
    for ex in (x - int(s * 1.9), x + int(s * 0.4)):
        eye(F, ex, ey, ew, eh, s, lid=False)
    my = head_bot - int(s * 1.2)
    F.rect(x - s // 2, my, x + s // 2, my, INK)
    # phone glow on the face
    return [L, B, A, Hd, Hr, R, P], F


def maya(W, H, x, y, s, tall=False, shade=False):
    """Maya: short bob, mauve bomber, slouch (head tilted, hand in pocket), crooked sticker on her phone."""
    hh = 5 * s if tall else 6 * s
    hw = 5 * s if tall else 6 * s
    body_h = 6 * s if tall else 4 * s
    leg_h = 6 * s if tall else 3 * s
    feet = y
    leg_top = feet - leg_h
    body_top = leg_top - body_h + s // 2     # a little shorter, slouched
    head_bot = body_top + s // 2
    head_top = head_bot - hh
    tilt = s // 2
    L = Layer(W, H)
    L.rect(x - 2 * s, leg_top, x - s // 3, feet - s // 2, PANTS)
    L.rect(x + s // 3, leg_top, x + 2 * s + s // 2, feet - s // 2, PANTS)   # weight on one leg
    L.rect(x - 2 * s - s // 3, feet - s, x - s // 3, feet, CREAM2)
    L.rect(x + s // 3, feet - s, x + 3 * s, feet, CREAM2)
    B = Layer(W, H)
    B.rect(x - 3 * s, body_top + s // 2, x + 3 * s, leg_top, JACKET)
    B.ell(x - 3 * s, body_top, x + 3 * s, body_top + 2 * s, JACKET)
    B.rect(x - 3 * s, leg_top - s // 2, x + 3 * s, leg_top + s // 3, JACKET2)   # bomber cuff
    if shade:
        B.rect(x - 3 * s, body_top + s, x - 2 * s, leg_top - s // 2, JACKET2)
    B.rect(x - s // 4, body_top + s, x + s // 4, leg_top - s // 2, JACKET2)     # zip
    A = Layer(W, H)      # arm into pocket
    A.rect(x + 3 * s, body_top + s, x + 4 * s, leg_top - s, JACKET2 if shade else JACKET)
    A2 = Layer(W, H)     # other arm, phone low by her hip
    A2.rect(x - 4 * s, body_top + s, x - 3 * s, leg_top, JACKET)
    P = Layer(W, H)
    px0, py0 = x - 5 * s, leg_top - s
    P.rect(px0, py0, px0 + 2 * s, py0 + 3 * s, INK)
    P.rect(px0 + 1, py0 + 1, px0 + 2 * s - 1, py0 + 3 * s - 1, (60, 56, 70))
    P.rect(px0 + 2, py0 + s, px0 + 3, py0 + s + 2, (255, 200, 60))         # crooked sticker
    Hd = Layer(W, H)
    Hd.ell(x - hw // 2 - s + tilt, head_top, x + hw // 2 + s + tilt, head_bot, SKIN)
    Hr = Layer(W, H)     # bob: hair down to the jaw on both sides, side part
    Hr.ell(x - hw // 2 - s - 1 + tilt, head_top - s // 2, x + hw // 2 + s + 1 + tilt, head_top + hh // 2 + s, HAIR_M)
    Hr.rect(x - hw // 2 - s - 1 + tilt, head_top + s, x - hw // 2 + tilt, head_bot - s // 2, HAIR_M)
    Hr.rect(x + hw // 2 + tilt, head_top + s, x + hw // 2 + s + 1 + tilt, head_bot - s // 2, HAIR_M)
    Hr.rect(x - hw // 2 - s + tilt, head_top + s, x + s + tilt, head_top + int(hh * 0.33), HAIR_M)
    F = Layer(W, H)
    ey = head_top + int(hh * 0.4)
    ew, eh = int(s * 1.5), int(s * 1.9)
    for ex in (x - int(s * 1.9) + tilt, x + int(s * 0.4) + tilt):
        eye(F, ex, ey, ew, eh, s, lid=True)
    my = head_bot - int(s * 1.2)
    F.rect(x - s // 2 + tilt, my, x + s + tilt, my, INK)     # the half-smile
    F.px(x + s + tilt + 1, my - 1, INK)
    return [L, B, A, A2, Hd, Hr, P], F


# ---------------------------------------------------------------- set
def apartment(W, H, s, shade=False):
    img = Image.new("RGBA", (W, H), NIGHT + (255,))
    d = ImageDraw.Draw(img)
    fy = int(H * 0.72)
    d.rectangle([0, fy, W, H], fill=FLOOR + (255,))
    d.rectangle([0, fy - s // 2, W, fy], fill=INK + (255,))                # skirting line
    # window with the night city and a moon
    wx0, wy0, wx1, wy1 = int(W * 0.12), int(H * 0.2), int(W * 0.55), int(H * 0.47)
    d.rectangle([wx0 - s // 2, wy0 - s // 2, wx1 + s // 2, wy1 + s // 2], fill=INK + (255,))
    d.rectangle([wx0, wy0, wx1, wy1], fill=SKYC + (255,))
    d.ellipse([wx1 - 6 * s, wy0 + 2 * s, wx1 - 2 * s, wy0 + 6 * s], fill=MOON + (255,))
    for i, (bx, bh) in enumerate([(0, 9), (4, 13), (8, 7)]):
        x0 = wx0 + bx * s
        if x0 + 4 * s > wx1: continue
        d.rectangle([x0, wy1 - bh * s, x0 + 4 * s, wy1], fill=WIN + (255,))
        for yy in range(wy1 - bh * s + s, wy1 - s, 2 * s):
            if (yy // s + i) % 3 == 0:
                d.rectangle([x0 + s, yy, x0 + s + s // 2, yy + s // 2], fill=(240, 200, 120, 255))
    d.rectangle([(wx0 + wx1) // 2 - s // 4, wy0, (wx0 + wx1) // 2 + s // 4, wy1], fill=INK + (255,))
    # one perfectly centred frame on the wall (he's tidy)
    fx = int(W * 0.78)
    d.rectangle([fx - 3 * s, wy0, fx + 3 * s, wy0 + 5 * s], fill=INK + (255,))
    d.rectangle([fx - 2 * s, wy0 + s, fx + 2 * s, wy0 + 4 * s], fill=CREAM2 + (255,))
    # the couch, squared to the wall
    cy = fy - 2 * s
    d.rectangle([int(W * 0.08), cy - 6 * s, int(W * 0.6), fy + 3 * s], fill=INK + (255,))
    d.rectangle([int(W * 0.08) + s // 2, cy - 6 * s + s // 2, int(W * 0.6) - s // 2, fy + 3 * s - s // 2], fill=(96, 70, 74, 255))
    d.rectangle([int(W * 0.08) + s // 2, cy - s, int(W * 0.6) - s // 2, cy], fill=(80, 58, 62, 255))
    if shade:
        d.rectangle([0, 0, W, int(H * 0.1)], fill=NIGHT2 + (255,))
    return img


def label(img, text, scale):
    """Pixel text in the top band, drawn at low res then scaled with everything else."""
    f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 7 * scale // 2)
    d = ImageDraw.Draw(img)
    w = d.textlength(text, font=f)
    d.rectangle([0, 0, img.width, 8 * scale // 2 + 4], fill=INK + (255,))
    d.text(((img.width - w) / 2, 2), text, font=f, fill=CREAM + (255,))


def to_two_tone(img):
    """Style C: map every colour to off-black or cream (checker dither for mid-tones). Only PXI blue survives."""
    a = np.array(img.convert("RGB")).astype(int)
    out = np.zeros_like(a)
    lum = 0.3 * a[..., 0] + 0.59 * a[..., 1] + 0.11 * a[..., 2]
    blue = (a[..., 2] > 200) & (a[..., 0] < 160)
    yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]
    chk = (xx + yy) % 2 == 0
    ink, cream = np.array(INK), np.array(CREAM)
    q = (xx % 2) * 2 + (yy % 2)         # 2x2 Bayer
    bayer = np.choose(q, [0, 2, 3, 1])
    level = np.clip(((lum - 22) / 190 * 5).astype(int), 0, 4)    # 0 = ink .. 4 = cream
    out[:] = ink
    out[bayer < level] = cream
    out[blue] = a[blue]
    return Image.fromarray(out.astype(np.uint8))


def scene(W, H, s, tall, shade):
    img = apartment(W, H, s, shade)
    fy = int(H * 0.72)
    for parts, face in (nio(W, H, int(W * 0.33), fy + 9 * s, s, tall, shade), maya(W, H, int(W * 0.71), fy + 9 * s, s, tall, shade)):
        for p in parts:
            paste(img, p)
        img.alpha_composite(face.img)
    return img


def up(img, w=1080, h=1920):
    return img.convert("RGB").resize((w, h), Image.NEAREST)


A = scene(135, 240, 5, tall=False, shade=False); label(A, "PART 1", 4)
B = scene(180, 320, 4, tall=True, shade=True); label(B, "PART 1", 5)
C = scene(135, 240, 5, tall=False, shade=False); label(C, "PART 1", 4); C = to_two_tone(C)
for n, im in (("A", A), ("B", B), ("C", C)):
    up(im).save(f"style-{n}.png")

# side-by-side board for a quick look
board = Image.new("RGB", (1080 * 3 + 80, 1920 + 160), (12, 11, 14))
bd = ImageDraw.Draw(board)
f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
names = ["A  Chunky", "B  Tall + shading", "C  Two-tone + blue"]
for i, n in enumerate("ABC"):
    board.paste(Image.open(f"style-{n}.png"), (20 + i * 1100, 140))
    bd.text((40 + i * 1100, 40), names[i], font=f, fill=CREAM)
board.resize((board.width // 2, board.height // 2), Image.LANCZOS).save("styles-board.jpg", quality=90)
print("ok")
