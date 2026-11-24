"""An original house track for party scenes, made here from synthesis (no samples, no one else's music), heard as it
would be in the room: from a speaker, a little dull at the top, with the room's echo. Founder, Nov 18, 9:32 PM: the
old party bed "sounds like bumble bee glitches not music or actually party vibes".

    /root/.pxi-voice/bin/python tools/party_track.py public/sfx/sk_party.wav [seconds]

122 BPM, A minor (Am F C G), four on the floor: kick, clap on 2 and 4, off-beat hats, an off-beat bass, chord stabs
ducked by the kick, and a simple top-line hook every other 8 bars. Deterministic (fixed seed)."""
import sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 48000
BPM = 122
BEAT = 60 / BPM
rng = np.random.default_rng(7)

def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)

def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)

def kick():
    n = int(0.42 * SR); t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.22)
    click = hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.004) * 0.25
    return np.tanh(1.6 * (body + click))

def clap():
    n = int(0.3 * SR); out = np.zeros(n); noise = bp(rng.standard_normal(n), 900, 3500)
    for k, d in enumerate((0, 0.011, 0.022)):
        s = int(d * SR); out[s:] += noise[: n - s] * env(n - s, 0.0005, 0.012 if k < 2 else 0.09)
    return out * 0.9

def hat(open_=False):
    n = int((0.22 if open_ else 0.05) * SR)
    sq = sum(np.sign(np.sin(2 * np.pi * f * np.arange(n) / SR)) for f in (3140, 4250, 5380, 6910, 8230, 9670))
    x = hp(sq / 6 + 0.6 * rng.standard_normal(n), 7000)
    return x * env(n, 0.0005, 0.07 if open_ else 0.012) * (0.3 if open_ else 0.35)

def saw(f, n, detune=(0,)):
    t = np.arange(n) / SR
    return sum(2 * ((t * f * 2 ** (c / 1200) + rng.random()) % 1) - 1 for c in detune) / len(detune)

def note(m): return 440 * 2 ** ((m - 69) / 12)

CHORDS = [(57, [57, 60, 64]), (53, [57, 60, 65]), (48, [55, 60, 64]), (55, [55, 59, 62])]  # Am F C G (root, voicing)
HOOK = [76, None, 74, 72, None, 72, 74, None, 76, None, 79, 76, None, 74, 72, None]          # one bar per chord, 16ths

def track(seconds):
    n = int(seconds * SR); drums = np.zeros(n + SR); bass = np.zeros(n + SR); keys = np.zeros(n + SR); lead = np.zeros(n + SR)
    duck = np.ones(n + SR)
    K, CL, H, HO = kick(), clap(), hat(), hat(True)
    six = BEAT / 4
    bars = int(seconds / (4 * BEAT)) + 1
    for b in range(bars):
        root, voicing = CHORDS[b % 4]
        for q in range(4):
            s = int((b * 4 + q) * BEAT * SR)
            if s >= n: break
            drums[s:s + len(K)] += K
            d = np.ones(int(0.3 * SR)); d[:] = 1 - 0.65 * np.exp(-np.arange(len(d)) / SR / 0.09); duck[s:s + len(d)] = np.minimum(duck[s:s + len(d)], d)
            if q in (1, 3): drums[s:s + len(CL)] += CL
            o = s + int(2 * six * SR); drums[o:o + len(HO if q == 3 else H)] += HO if q == 3 else H
            for k in (1, 3): o = s + int(k * six * SR); drums[o:o + len(H)] += H * 0.5
            # bass on the off-beat 8th, and a pickup 16th
            for k, m in ((2, root - 12), (3, root)):
                o = s + int(k * six * SR); m_ = int(six * SR * 0.9)
                bass[o:o + m_] += lp(saw(note(m), m_, (0, 7)), 500) * env(m_, 0.003, 0.09)
        # chord stabs: the 'and' of 1, the 'e' of 3, the 'and' of 4
        for pos in (2, 9, 14):
            s = int((b * 16 + pos) * six * SR); m_ = int(six * SR * 1.6)
            if s + m_ >= n + SR: continue
            ch = sum(saw(note(v), m_, (-9, 0, 8)) for v in voicing) / 3
            keys[s:s + m_] += lp(ch, 1900) * env(m_, 0.004, 0.16)
        if (b // 8) % 2 == 1:   # the hook on every other eight bars
            for i, m in enumerate(HOOK):
                if m is None: continue
                s = int((b * 16 + i) * six * SR); m_ = int(six * SR * 1.8)
                if s + m_ >= n + SR: continue
                t = np.arange(m_) / SR
                tone = np.sin(2 * np.pi * note(m) * t) + 0.35 * np.sin(2 * np.pi * 2 * note(m) * t + 0.4 * np.sin(2 * np.pi * 5 * t))
                lead[s:s + m_] += tone * env(m_, 0.004, 0.14) * 0.22
    mix = 0.95 * drums + 0.75 * bass + (0.55 * keys + 0.5 * lead) * duck
    mix = mix[:n]
    # heard in the room: a speaker's top end, a small room
    mix = lp(hp(mix, 35), 7500)
    ir_n = int(0.45 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.11); ir[0] = 0
    wet = fftconvolve(mix, lp(ir, 4000))[:n] * 0.035
    out = np.tanh(1.2 * (mix + wet))
    fade = int(0.04 * SR); out[:fade] *= np.linspace(0, 1, fade); out[-fade:] *= np.linspace(1, 0, fade)
    return out / np.max(np.abs(out)) * 0.7

if __name__ == '__main__':
    dst = sys.argv[1]; sec = float(sys.argv[2]) if len(sys.argv) > 2 else 70
    wavfile.write(dst, SR, (track(sec) * 32767).astype(np.int16))
    print(dst, sec, 's')
