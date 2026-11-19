"""Aux's sounds, remade so an audio classifier hears them as what they are (founder, Nov 18, 9:32 PM; engine/tools/
audio_tags.py): the indoor rain was heard as static, the lift music as a sine wave, the cable pull as static.
All synthesis here, no samples.

    /root/.pxi-voice/bin/python tools/aux_audio.py    (writes public/sfx/sk_rain.wav, sk_muzak.wav, sk_unplug.wav)"""
import os
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000; rng = np.random.default_rng(5)
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'sfx')
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def write(name, x, peak=0.8):
    x = x / (np.abs(x).max() + 1e-9) * peak; f = int(0.03 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    wavfile.write(os.path.join(OUT, name + '.wav'), SR, (x * 32767).astype(np.int16)); print(name, round(len(x) / SR, 1), 's')

def rain(sec=30):
    """Rain falling indoors: a steady hiss of many fine drops, heavier drops landing on wood and fabric, and a few
    drips from the ceiling. The hiss is shaped like rain (most of it 1 to 6 kHz, slowly swelling), not flat noise."""
    n = sec * SR; out = np.zeros(n + SR)
    hiss = bp(rng.standard_normal(n), 900, 7000, 3)
    swell = 0.75 + 0.25 * lp(rng.standard_normal(n), 0.4) / 0.05
    out[:n] += hiss * np.clip(swell, 0.4, 1.2) * 0.35
    for _ in range(int(sec * 900)):                             # fine drops: tiny bright ticks
        o = int(rng.uniform(0, n)); m = int(0.004 * SR)
        out[o:o + m] += hp(rng.standard_normal(m), 3000) * env(m, 0.0002, 0.0012) * rng.uniform(0.2, 0.6)
    for _ in range(int(sec * 70)):                              # heavier drops on wood: a short knock with a pitch
        o = int(rng.uniform(0, n)); m = int(0.03 * SR); f = rng.uniform(700, 2500)
        out[o:o + m] += bp(rng.standard_normal(m), f, f * 2.2) * env(m, 0.0003, 0.004) * rng.uniform(0.3, 0.9)
    for _ in range(int(sec * 1)):                               # drips into a puddle: a falling blip
        o = int(rng.uniform(0, n)); m = int(0.09 * SR); t = np.arange(m) / SR; f = rng.uniform(900, 1700)
        out[o:o + m] += np.sin(2 * np.pi * np.cumsum(f * (1 + 1.5 * np.exp(-t / 0.01))) / SR) * env(m, 0.001, 0.025) * 0.8
    out = lp(out[:n], 9000) + 0.15 * lp(rng.standard_normal(n), 180)
    return out

def rhodes(f, n):
    t = np.arange(n) / SR; mod = np.sin(2 * np.pi * f * t) * 1.2 * np.exp(-t / 0.4)
    return (np.sin(2 * np.pi * f * t + mod) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / 1.4)

def muzak(sec=34):
    """Lift music: soft bossa nova. Electric piano chords (Cmaj7 Am7 Dm7 G7), a round upright-style bass, a shaker,
    a vibraphone melody. 112 BPM."""
    beat = 60 / 112; n = int(sec * SR); out = np.zeros(n + 2 * SR)
    N = lambda m: 440 * 2 ** ((m - 69) / 12)
    chords = [(48, [60, 64, 67, 71]), (45, [60, 64, 67, 69]), (50, [60, 62, 65, 69]), (43, [59, 62, 65, 67])]
    mel = [76, 74, 72, 74, 76, 79, 76, None, 74, 72, 69, 72, 74, None, 71, 72]
    bar = 4 * beat
    for b in range(int(sec / bar) + 1):
        root, ch = chords[b % 4]; s0 = b * bar
        for pos in (0, 1.5, 2.5):                                # bossa comp on 1, the and of 2, the and of 3
            o = int((s0 + pos * beat) * SR); m = int(1.2 * beat * SR)
            if o + m > len(out): continue
            out[o:o + m] += sum(rhodes(N(v), m) for v in ch) * 0.11
        for pos, mm in ((0, root), (1.5, root + 7), (2, root + 7), (3.5, root)):   # bass: root, fifth
            o = int((s0 + pos * beat) * SR); m = int(0.9 * beat * SR)
            if o + m > len(out): continue
            t = np.arange(m) / SR; out[o:o + m] += lp(np.sin(2 * np.pi * N(mm - 12) * t) + 0.3 * np.sin(4 * np.pi * N(mm - 12) * t), 700) * env(m, 0.01, 0.3) * 0.5
        for k in range(8):                                       # shaker 8ths, the off-beats a little louder
            o = int((s0 + k * beat / 2) * SR); m = int(0.06 * SR)
            if o + m > len(out): continue
            out[o:o + m] += bp(rng.standard_normal(m), 5000, 11000) * env(m, 0.01, 0.02) * (0.12 if k % 2 else 0.07)
        for k, mm in enumerate(mel[(b % 2) * 8:(b % 2) * 8 + 8]):   # vibes, a phrase every bar
            if mm is None: continue
            o = int((s0 + k * beat / 2) * SR); m = int(1.0 * SR)
            if o + m > len(out): continue
            t = np.arange(m) / SR; trem = 1 + 0.25 * np.sin(2 * np.pi * 5.5 * t)
            out[o:o + m] += (np.sin(2 * np.pi * N(mm) * t) + 0.2 * np.sin(2 * np.pi * 4 * N(mm) * t) * np.exp(-t / 0.05)) * np.exp(-t / 0.7) * trem * 0.16
    out = out[:n]
    n2 = int(0.6 * SR); ir = rng.standard_normal(n2) * np.exp(-np.arange(n2) / SR / 0.15); ir[0] = 0
    out = out + 0.03 * fftconvolve(out, lp(ir, 5000))[:n]
    return lp(hp(out, 60), 6000)    # out of a small speaker in a lift

def unplug():
    """The aux cable yanked: a hard pop, a short low thump as the speaker drops, then nothing."""
    m = int(0.6 * SR); t = np.arange(m) / SR; x = np.zeros(m)
    x += np.sin(2 * np.pi * 55 * t) * np.exp(-t / 0.08) * 0.9
    k = int(0.012 * SR); x[:k] += lp(rng.standard_normal(k), 2500) * np.linspace(1, 0, k) * 0.8
    return x

if __name__ == '__main__':
    write('sk_rain', rain(), 0.7); write('sk_muzak', muzak(), 0.75); write('sk_unplug', unplug(), 0.8)

def roof(sec=60):
    """A roof at sunset: wind gusting past the parapet (a low whistle that swells and dies), the city far below."""
    n = sec * SR
    g = np.clip(lp(rng.standard_normal(n), 0.3) / 0.025 + 0.4, 0.05, 1.3)
    howl = sum(bp(rng.standard_normal(n), f, f * 1.08, 2) * w for f, w in ((420, 1.0), (610, 0.6), (880, 0.35)))
    whoosh = bp(rng.standard_normal(n), 150, 600) * 0.6
    city = lp(rng.standard_normal(n), 150) * 0.5
    return (howl * 2.5 + whoosh) * g + city

if __name__ == '__main__':
    write('sk_roof', roof(), 0.6)
