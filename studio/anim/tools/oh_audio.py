# Sound for "Office Hours": all original, synthesised here (no samples, no models, no existing music).
# Beds: the campus theme (bouncy, cartoon), the lecture-hall murmur, the fluorescent hum, the office room tone,
# the pitch outdoors. Spots: laptop shut, zip, stairwell door, phone tap, mop, sprint whoosh, smash-cut hit,
# inner door, paper slide, door click, a step on grass.
import numpy as np, wave
from numpy.fft import rfft, irfft, rfftfreq
SR = 48000
R = np.random.default_rng(11)
OUT = 'public/sfx/'

def t_(d): return np.arange(int(SR * d)) / SR
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def band(x, lo=0, hi=SR / 2):
    X = rfft(x); f = rfftfreq(len(x), 1 / SR); X *= (f >= lo) & (f <= hi); return irfft(X, len(x))
def norm(x, peak=0.9): m = np.abs(x).max(); return x / m * peak if m > 0 else x
def place(buf, x, at):
    i = int(at * SR); j = min(len(buf), i + len(x)); buf[i:j] += x[:j - i]
def save(name, x, peak=0.9):
    y = (np.clip(norm(x, peak), -1, 1) * 32767).astype('<i2')
    with wave.open(OUT + name, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
    print(name, round(len(x) / SR, 2))
def fade(x, a=0.01, b=0.05):
    n = len(x); e = np.ones(n); ia, ib = int(a * SR), int(b * SR)
    if ia: e[:ia] = np.linspace(0, 1, ia)
    if ib: e[-ib:] = np.minimum(e[-ib:], np.linspace(1, 0, ib))
    return x * e

# ---------------------------------------------------------------- instruments
def keys(m, d, v=1.0):  # a bright toy-piano/marimba hit
    t = t_(d); f = mtof(m)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 18)) * np.exp(-t * 6) * np.minimum(1, t * 400) * v
def bass(m, d, v=1.0):
    t = t_(d); f = mtof(m)
    return np.tanh(2.2 * np.sin(2 * np.pi * f * t)) * np.exp(-t * 4) * np.minimum(1, t * 300) * v
def kick(v=1.0):
    t = t_(0.3); ph = 2 * np.pi * np.cumsum(50 + 110 * np.exp(-t * 35)) / SR
    return np.sin(ph) * np.exp(-t * 14) * v
def snare(v=1.0):
    t = t_(0.18); return (band(R.normal(0, 1, len(t)), 1500, 8000) * 0.8 + 0.4 * np.sin(2 * np.pi * 190 * t)) * np.exp(-t * 28) * v
def hat(v=1.0):
    t = t_(0.05); return band(R.normal(0, 1, len(t)), 7000, 16000) * np.exp(-t * 90) * v
def whistle(m, d, v=1.0):  # a slide-whistle lead
    t = t_(d); f = mtof(m) * (1 + 0.012 * np.sin(2 * np.pi * 5.5 * t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t * 30) * np.minimum(1, (d - t) * 30) * v

# ---------------------------------------------------------------- the campus theme: 112 bpm, C major, a strutting bass and a toy melody
BPM = 112; B = 60 / BPM
def theme(bars=16):
    n = bars * 4 * B; x = np.zeros(int(SR * (n + 1)))
    prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (50, [62, 65, 69]), (43, [55, 59, 62])]  # C Am Dm G
    mel = [72, None, 74, 76, None, 74, 72, None, 69, None, 72, None, 74, None, None, None,
           72, None, 74, 76, None, 79, 76, None, 74, None, 72, None, 71, None, None, None]
    for bar in range(bars):
        root, ch = prog[bar % 4]; t0 = bar * 4 * B
        for beat in range(4):
            tb = t0 + beat * B
            place(x, kick(0.9 if beat % 2 == 0 else 0.5), tb)
            if beat % 2: place(x, snare(0.45), tb)
            place(x, hat(0.25), tb); place(x, hat(0.15), tb + B / 2)
            place(x, bass(root + (0 if beat % 2 == 0 else 7) - 12, B * 0.9, 0.55), tb)
            if beat in (1, 3):
                for m in ch: place(x, keys(m, B * 0.6, 0.12), tb + B / 2)
        if bar >= 4:  # the tune comes in after an intro
            for i in range(8):
                m = mel[((bar - 4) % 4) * 8 + i]
                if m: place(x, keys(m, B * 0.9, 0.35), t0 + i * B / 2); place(x, whistle(m, B * 0.45, 0.06), t0 + i * B / 2) if m else None
    return fade(x[: int(SR * n)], 0.005, 0.3)

# ---------------------------------------------------------------- beds
def hall(d=12):  # a lecture hall emptying: low murmur, rustle, a chair, a cough far off
    n = int(SR * d); x = band(R.normal(0, 1, n), 180, 900) * 0.25
    x *= 0.7 + 0.3 * np.abs(band(R.normal(0, 1, n), 0, 3))
    for k in range(40):
        at = R.uniform(0, d - 0.3); l = int(SR * R.uniform(0.05, 0.25))
        place(x, band(R.normal(0, 1, l), 2000, 7000) * np.hanning(l) * R.uniform(0.05, 0.2), at)
    return fade(x, 0.3, 0.3)
def hum(d=12):  # fluorescent tubes: 120 Hz and its buzz
    t = t_(d); x = 0.6 * np.sin(2 * np.pi * 120 * t) + 0.25 * np.sin(2 * np.pi * 240 * t) + 0.1 * np.sign(np.sin(2 * np.pi * 120 * t)) * 0.3
    x += band(R.normal(0, 1, len(t)), 2000, 6000) * 0.02
    return fade(x * (1 + 0.04 * np.sin(2 * np.pi * 0.3 * t)), 0.2, 0.2)
def office(d=12):  # small room tone, a ticking clock
    n = int(SR * d); x = band(R.normal(0, 1, n), 60, 400) * 0.2
    for i in range(int(d)): place(x, band(R.normal(0, 1, 400), 2000, 6000) * np.hanning(400) * 0.5, i + 0.05)
    return fade(x, 0.2, 0.2)
def pitch(d=12):  # outdoors: wind, birds, a ball kicked far away, shouts
    n = int(SR * d); x = band(R.normal(0, 1, n), 80, 600) * 0.3
    for k in range(10):
        at = R.uniform(0, d - 0.5); t = t_(0.18); f = R.uniform(2500, 4200)
        place(x, np.sin(2 * np.pi * (f + 900 * np.sin(2 * np.pi * 14 * t)) * t) * np.hanning(len(t)) * 0.12, at)
    for k in range(5): place(x, kick(0.25), R.uniform(0, d - 0.4))
    return fade(x, 0.3, 0.3)

# ---------------------------------------------------------------- spots
def laptop():
    t = t_(0.18); return band(R.normal(0, 1, len(t)), 200, 3000) * np.exp(-t * 40) + 0.5 * np.sin(2 * np.pi * 90 * t) * np.exp(-t * 30)
def zipper():
    d = 0.5; n = int(SR * d); x = np.zeros(n)
    for i, at in enumerate(np.linspace(0, d - 0.01, 38)): place(x, band(R.normal(0, 1, 160), 2500, 9000) * 0.6, at)
    return x
def bang():
    t = t_(0.5); return (band(R.normal(0, 1, len(t)), 60, 1500) * 0.8 + np.sin(2 * np.pi * 70 * t)) * np.exp(-t * 9)
def tap():
    t = t_(0.04); return band(R.normal(0, 1, len(t)), 1500, 6000) * np.exp(-t * 150)
def mop():
    d = 0.8; t = t_(d); return band(R.normal(0, 1, len(t)), 400, 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 1.6 * t)) ** 2 * np.hanning(len(t)) * 0.6
def whoosh():
    d = 0.5; t = t_(d); f = 300 + 3000 * t / d
    x = band(R.normal(0, 1, len(t)), 300, 5000) * np.hanning(len(t)) ** 2
    return x + 0.2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.hanning(len(t))
def hit():  # the smash cut: a dull thud, then nothing
    t = t_(0.4); return np.sin(2 * np.pi * np.cumsum(60 + 80 * np.exp(-t * 20)) / SR) * np.exp(-t * 10)
def creak():
    d = 0.9; t = t_(d); f = 180 + 60 * np.sin(2 * np.pi * 1.3 * t)
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return band(saw, 150, 2000) * np.hanning(len(t)) * (0.6 + 0.4 * (R.uniform(0, 1, len(t)) > 0.6))
def paper():
    d = 0.6; t = t_(d); return band(R.normal(0, 1, len(t)), 1200, 8000) * np.hanning(len(t)) * 0.5
def click():
    t = t_(0.12); return band(R.normal(0, 1, len(t)), 800, 5000) * np.exp(-t * 60) + 0.4 * np.sin(2 * np.pi * 300 * t) * np.exp(-t * 50)
def drain():  # the colour leaving Theo's face: a slide whistle falling an octave and a half, slowing as it goes
    d = 0.9; t = t_(d); f = 1400 * 2 ** (-1.6 * (1 - (1 - t / d) ** 2))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t * 40) * np.minimum(1, (d - t) * 12) * (1 + 0.01 * np.sin(2 * np.pi * 6 * t))
def grass():
    t = t_(0.2); return band(R.normal(0, 1, len(t)), 400, 3000) * np.exp(-t * 20)

if __name__ == '__main__':
    save('oh_theme.wav', theme(48), 0.8)
    save('oh_hall.wav', hall(90), 0.6); save('oh_hum.wav', hum(90), 0.5); save('oh_office.wav', office(90), 0.5); save('oh_pitch.wav', pitch(90), 0.6)
    for name, f in [('laptop', laptop), ('zip', zipper), ('bang', bang), ('tap', tap), ('mop', mop), ('whoosh', whoosh), ('hit', hit),
                    ('creak', creak), ('paper', paper), ('click', click), ('grass', grass), ('drain', drain)]:
        save(f'oh_{name}.wav', f())
