# Sound for the pilot "No Evidence" and reel 2: all original, synthesised here (no samples, no models).
# Music cues, room tones, spot effects, and a "voice blip" track per speaker (pixel-game speech, until real voices).
import numpy as np, wave
from numpy.fft import rfft, irfft, rfftfreq
SR = 48000
R = np.random.default_rng(7)
OUT = 'public/sfx/'

def t_(d): return np.arange(int(SR * d)) / SR
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def band(x, lo=0, hi=SR / 2, tilt=0):
    X = rfft(x); f = rfftfreq(len(x), 1 / SR)
    X *= ((f >= lo) & (f <= hi)) * (1 / (1 + (f / max(hi, 1)) ** 4) if tilt else 1)
    return irfft(X, len(x))
def lp(x, hi): return band(x, 0, hi, 1)
def norm(x, peak=0.9): m = np.abs(x).max(); return x / m * peak if m > 0 else x
def place(buf, x, at):
    i = int(at * SR); j = min(len(buf), i + len(x)); buf[i:j] += x[:j - i]
def save(name, x, peak=0.9):
    y = (np.clip(norm(x, peak), -1, 1) * 32767).astype('<i2')
    with wave.open(OUT + name, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
    print(name, round(len(x) / SR, 2))

# ---------------------------------------------------------------- instruments
def epiano(m, d, v=1.0):
    t = t_(d); f = mtof(m)
    env = np.exp(-t * 2.2) * np.minimum(1, t * 200)
    x = np.sin(2 * np.pi * f * t + 1.1 * np.exp(-t * 4) * np.sin(2 * np.pi * 2 * f * t)) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 5)
    return x * env * v
def pluck(m, d, v=1.0, damp=0.996):
    f = mtof(m); n = int(SR / f); buf = R.uniform(-1, 1, n); out = np.zeros(int(SR * d))
    for i in range(len(out)):
        out[i] = buf[i % n]; buf[i % n] = damp * 0.5 * (buf[i % n] + buf[(i + 1) % n])
    return out * v
def bass(m, d, v=1.0):
    t = t_(d); f = mtof(m)
    x = np.tanh(1.6 * np.sin(2 * np.pi * f * t)) * np.exp(-t * 3) * np.minimum(1, t * 300)
    return x * v
def kick(v=1.0):
    t = t_(0.35); ph = 2 * np.pi * np.cumsum(45 + 90 * np.exp(-t * 30)) / SR
    return np.sin(ph) * np.exp(-t * 9) * v
def snare(v=1.0):
    t = t_(0.2); n = band(R.normal(0, 1, len(t)), 900, 7000)
    return (n / np.abs(n).max() * np.exp(-t * 22) + 0.4 * np.sin(2 * np.pi * 185 * t) * np.exp(-t * 30)) * v
def hat(v=1.0):
    t = t_(0.05); n = band(R.normal(0, 1, len(t)), 6000, 16000)
    return n / np.abs(n).max() * np.exp(-t * 90) * v
def pad(ms, d, v=1.0):
    t = t_(d); x = np.zeros(len(t))
    for m in ms:
        for det in (-0.08, 0.08):
            x += np.sin(2 * np.pi * mtof(m + det) * t) + 0.3 * np.sin(2 * np.pi * 2 * mtof(m + det) * t)
    env = np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.8)
    return lp(x * env, 2200) * v
def bell(m, d, v=1.0):
    t = t_(d); f = mtof(m)
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for r, a, k in [(1, 1, 2.5), (2.76, 0.4, 4), (5.4, 0.2, 7), (8.9, 0.1, 10)]) * v
def noise(d, lo, hi): return band(R.normal(0, 1, int(SR * d)), lo, hi)

# ---------------------------------------------------------------- music cues
def groove(d=48, bpm=96):
    """The procedure: a dry, tidy groove. Dm7 G7 Cmaj7 Am7."""
    b = 60 / bpm; out = np.zeros(int(SR * (d + 2)))
    chords = [[50, 53, 57, 60], [43, 47, 50, 53], [48, 52, 55, 59], [45, 48, 52, 55]]
    roots = [38, 43, 36, 45]
    bar = 0
    while bar * 4 * b < d:
        c = chords[bar % 4]; t0 = bar * 4 * b
        for beat in range(4):
            tb = t0 + beat * b
            place(out, kick(0.9 if beat in (0, 2) else 0), tb)
            if beat in (1, 3): place(out, snare(0.35), tb)
            place(out, hat(0.25), tb + b / 2); place(out, hat(0.12), tb)
            # staccato keys on the off-beats
            for m in c: place(out, epiano(m + 12, 0.18, 0.18) * np.exp(-t_(0.18) * 8), tb + b / 2)
            # bass: root, fifth, octave, approach
            bm = [roots[bar % 4], roots[bar % 4] + 7, roots[bar % 4] + 12, roots[(bar + 1) % 4] - 1][beat]
            place(out, bass(bm, b * 0.9, 0.55), tb)
        if bar % 2 == 1: place(out, bell(c[-1] + 24, 1.2, 0.08), t0 + 3.5 * b)
        bar += 1
    return out[:int(SR * d)]
def happy(d=5.0):
    """Morning glow: bright plucked arpeggios, F major, fast."""
    out = np.zeros(int(SR * (d + 1))); seq = [65, 69, 72, 77, 72, 69, 67, 70, 74, 79, 74, 70]
    for i in range(int(d / 0.16)):
        place(out, pluck(seq[i % len(seq)], 0.6, 0.5), i * 0.16)
        if i % 4 == 0: place(out, bass(41 if (i // 12) % 2 == 0 else 43, 0.6, 0.4), i * 0.16)
    place(out, pad([65, 69, 72], d, 0.08), 0)
    return out[:int(SR * d)]
def party(d=12, bpm=122):
    """Last night, as a memory: a house beat through a wall of people, low-passed and warm."""
    b = 60 / bpm; out = np.zeros(int(SR * (d + 2)))
    chords = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]]
    i = 0
    while i * b < d:
        tb = i * b; c = chords[(i // 4) % 4]
        place(out, kick(1.0), tb); place(out, hat(0.3), tb + b / 2)
        if i % 2 == 1: place(out, snare(0.3), tb)
        for m in c: place(out, epiano(m, b * 0.45, 0.2), tb + b / 2)
        place(out, bass(c[0] - 24, b * 0.45, 0.5), tb + b / 2)
        i += 1
    out = lp(out[:int(SR * d)], 1400)
    crowd = noise(d, 250, 2500) * (0.6 + 0.4 * np.sin(t_(d) * 1.3))
    for k in range(25):  # whoops and laughs, far away
        tt = t_(0.25); place(crowd, np.sin(2 * np.pi * np.cumsum(R.uniform(500, 900) * (1 + 0.6 * tt)) / SR) * np.exp(-tt * 9) * 3, R.uniform(0, d - 0.3))
    return norm(out, 0.8) + norm(crowd, 0.18)
def sadpad(d=6): return pad([57, 60, 64, 71], d, 1.0)
def chime(d=3.2):
    out = np.zeros(int(SR * d))
    for i, m in enumerate([79, 84, 88, 91]): place(out, bell(m, d - i * 0.18, 0.6), i * 0.18)
    return out
def ending(d=10):
    """The laptop: the groove's chords, slow and warm, rising."""
    out = np.zeros(int(SR * (d + 2)))
    for i, c in enumerate([[48, 52, 55, 59], [53, 57, 60, 64], [50, 53, 57, 60], [55, 59, 62, 65, 69]]):
        for k, m in enumerate(c): place(out, epiano(m + 12, 2.5, 0.35), i * 2.4 + k * 0.06)
        place(out, bass(c[0] - 12, 2.2, 0.4), i * 2.4)
    for i in range(int(d / 0.3)): place(out, hat(0.08), i * 0.3)
    return out[:int(SR * d)]
def thump():
    t = t_(2.5); x = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 20)) / SR) * np.exp(-t * 2.5)
    return x + 0.2 * bell(60, 2.5, 1.0) * np.exp(-t * 2)

# ---------------------------------------------------------------- ambiences
def roomtone(d=30): return norm(lp(R.normal(0, 1, int(SR * d)), 300), 0.25) + 0.03 * np.sin(2 * np.pi * 60 * t_(d))
def hall(d=30): return norm(lp(R.normal(0, 1, int(SR * d)), 500), 0.22) + 0.05 * np.sin(2 * np.pi * 120 * t_(d)) * (1 + 0.1 * np.sin(t_(d) * 37))
def night(d=14):
    w = noise(d, 80, 900) * (0.5 + 0.5 * np.sin(t_(d) * 0.7) ** 2)
    out = norm(w, 0.4)
    tt = t_(2.0); place(out, np.sin(2 * np.pi * np.cumsum(600 + 200 * np.sin(tt * 3)) / SR) * np.minimum(1, tt) * np.exp(-tt * 1.2) * 0.05, 4.0)  # a far siren
    return out

# ---------------------------------------------------------------- spot effects
def tap(): t = t_(0.05); return noise(0.05, 1500, 6000) * np.exp(-t * 120)
def die():
    t = t_(0.7); f = 900 * np.exp(-t * 3)
    return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t * 4) * 0.5
def marker():
    t = t_(0.35); s = np.sin(2 * np.pi * np.cumsum(2400 + 500 * np.sin(t * 50)) / SR) * 0.3 + noise(0.35, 2000, 8000) * 0.5
    return s * np.minimum(1, t * 40) * np.minimum(1, (0.35 - t) * 30)
def knock():
    out = np.zeros(int(SR * 0.8)); t = t_(0.12)
    k = (np.sin(2 * np.pi * 140 * t) + 0.6 * noise(0.12, 200, 1600)) * np.exp(-t * 45)
    for a in (0, 0.18, 0.36): place(out, k, a)
    return out
def latch():
    out = np.zeros(int(SR * 0.9)); t = t_(0.06); place(out, noise(0.06, 1500, 7000) * np.exp(-t * 80), 0)
    tt = t_(0.7); place(out, np.sin(2 * np.pi * np.cumsum(300 + 120 * np.sin(tt * 9)) / SR) * 0.15 * np.exp(-tt * 3), 0.1)
    return out
def shut():
    t = t_(0.6); return (np.sin(2 * np.pi * 70 * t) + 0.8 * noise(0.6, 60, 1200)) * np.exp(-t * 12)
def cash():
    out = np.zeros(int(SR * 0.5)); t = t_(0.18); place(out, noise(0.18, 2500, 9000) * np.exp(-t * 18) * 0.6, 0)
    place(out, bell(96, 0.3, 0.25), 0.05); return out
def till():
    out = np.zeros(int(SR * 1.2)); place(out, cash(), 0); place(out, bell(91, 1.0, 0.6) + bell(98, 1.0, 0.4), 0.12); return out
def steps(d=2.4):
    out = np.zeros(int(SR * d)); t = t_(0.12)
    for i in range(int(d / 0.32)): place(out, (np.sin(2 * np.pi * 90 * t) + 0.5 * noise(0.12, 150, 2500)) * np.exp(-t * 35) * (0.8 if i % 2 else 1), i * 0.32)
    return out
def typing(d=2.6):
    out = np.zeros(int(SR * d)); t = 0.0
    while t < d - 0.1: place(out, tap() * R.uniform(0.6, 1.0), t); t += R.uniform(0.07, 0.16)
    return out

# ---------------------------------------------------------------- voice blips (one per speaker)
def blips(base, d=40, spread=0.22, rate=13):
    out = np.zeros(int(SR * d)); t = 0.0; w = 0
    while t < d - 0.2:
        dur = R.uniform(0.055, 0.085); tt = t_(dur)
        f = base * (1 + R.uniform(-spread, spread)) * (1.12 if w == 0 else 1)   # first syllable of a word a bit higher
        x = sum(np.sin(2 * np.pi * f * k * tt) / k for k in (1, 2, 3, 4)) * np.minimum(1, tt * 250) * np.exp(-tt * 18)
        place(out, x, t); t += dur + 0.012; w += 1
        if w > R.integers(2, 5): t += R.uniform(0.04, 0.09); w = 0
    return lp(out, 3500)

def reverb(x, secs=1.6, mix=0.35):
    n = int(SR * secs); ir = R.normal(0, 1, n) * np.exp(-np.arange(n) / SR * 4.5); ir /= np.abs(ir).sum() ** 0.5 * 8
    L = len(x) + n; y = irfft(rfft(x, L) * rfft(ir, L), L)[:len(x)]
    return x * (1 - mix) + norm(y, np.abs(x).max()) * mix
def party_mem(d=14):
    """The party as a memory: duller, further away, a slow wobble, a long room."""
    x = lp(party(d), 900); t = t_(d)
    x = reverb(x, 2.2, 0.45) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.35 * t))
    return x + pad([69, 73, 76, 81], d, 0.05)
def swell(d=2.0, out=False):
    """A reversed shimmer that rises into the white flash."""
    t = t_(d); x = noise(d, 2000, 9000) * 0.3 + sum(np.sin(2 * np.pi * mtof(m) * t) for m in (76, 83, 88)) * 0.25
    env = (t / d) ** 2.5; x = x * env
    x = reverb(x, 1.2, 0.5)
    return x[::-1] if out else x

if __name__ == '__main__':
    save('ne_party_mem.wav', party_mem(), 0.8); save('ne_swell.wav', swell(), 0.8); save('ne_swell_out.wav', swell(1.4, True), 0.8)
    save('ne_groove.wav', groove(), 0.8); save('ne_happy.wav', happy(), 0.8); save('ne_party.wav', party(), 0.85)
    save('ne_pad.wav', sadpad(), 0.55); save('ne_chime.wav', chime(), 0.6); save('ne_end.wav', ending(), 0.75); save('ne_thump.wav', thump(), 0.9)
    save('ne_room.wav', roomtone(), 0.25); save('ne_hall.wav', hall(), 0.25); save('ne_night.wav', night(), 0.45)
    save('ne_tap.wav', tap(), 0.5); save('ne_die.wav', die(), 0.6); save('ne_marker.wav', marker(), 0.5); save('ne_knock.wav', knock(), 0.95)
    save('ne_door.wav', latch(), 0.6); save('ne_shut.wav', shut(), 0.9); save('ne_cash.wav', cash(), 0.7); save('ne_till.wav', till(), 0.8)
    save('ne_steps.wav', steps(), 0.6); save('ne_typing.wav', typing(), 0.6)
