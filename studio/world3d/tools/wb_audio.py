"""Wave Back v9's sounds, all synthesis, made so an audio classifier hears them as what they are (engine/tools/
audio_tags.py): the ride-on mower revving and running, and the splash into the lake.

    /root/.pxi-voice/bin/python tools/wb_audio.py    (writes public/sfx/sk_mower.wav, sk_splash.wav)"""
import os
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000; rng = np.random.default_rng(9)
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'sfx')
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def write(name, x, peak=0.8):
    x = x / (np.abs(x).max() + 1e-9) * peak; f = int(0.02 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    wavfile.write(os.path.join(OUT, name + '.wav'), SR, (x * 32767).astype(np.int16)); print(name, round(len(x) / SR, 1), 's')

def mower(sec=14):
    """A small single-cylinder engine: each firing a sharp knock ringing the exhaust (damped resonances near 110,
    260 and 520 Hz) plus a puff of noise, the rate revving from idle (about 18 a second) to full (about 42) with an
    uneven wobble, and a tinny rattle of loose panels. Two revs, then it takes off and keeps running."""
    n = sec * SR; t = np.arange(n) / SR
    rate = np.interp(t, [0, 0.6, 0.9, 1.3, 1.7, 2.2, 3.0, sec], [17, 17, 34, 20, 38, 23, 40, 40])
    ph = np.cumsum(rate) / SR; fire = np.where(np.diff(np.floor(ph), prepend=0) > 0)[0]
    out = np.zeros(n + SR); m = int(0.05 * SR); tt = np.arange(m) / SR
    for k, i in enumerate(fire):
        i = min(n - 1, max(0, i + int(rng.normal(0, 0.0015) * SR)))                    # never quite even
        g = rng.uniform(0.7, 1.0) * (0.3 if rng.random() < 0.06 else 1.0) * (1.0 if k % 2 else 0.8)   # the odd misfire
        puff = rng.standard_normal(m) * np.exp(-tt / 0.009)
        out[i:i + m] += (bp(puff, 60, 140) * 2.6 + bp(puff, 180, 380) * 1.4 + bp(puff, 450, 1200) * 0.35) * g
    out = out[:n]
    rattle = bp(rng.standard_normal(n), 1500, 4500) * 0.03 * (0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(rate) / SR) ** 8)
    return lp(out, 4000) + rattle

def splash():
    """Something heavy into a lake: a deep whump, a roar of white water made of thousands of bubbles (each a short
    rising chirp), then drops falling back and the water sloshing."""
    n = int(3.2 * SR); t = np.arange(n) / SR; x = np.zeros(n)
    def bubble(o, f, d, g):
        m = int(d * 6 * SR); tt = np.arange(m) / SR
        if o + m > n: return
        x[o:o + m] += np.sin(2 * np.pi * np.cumsum(f * (1 + 0.6 * tt / d)) / SR) * np.exp(-tt / d) * g
    for _ in range(5000):                                                               # the white water
        o = int(abs(rng.normal(0.2, 0.45)) * SR); f = rng.uniform(300, 3000); bubble(o, f, rng.uniform(0.003, 0.012), rng.uniform(0.05, 0.25) * np.exp(-o / SR / 0.9))
    for _ in range(220):                                                                # drops falling back
        o = int(rng.uniform(0.35, 2.6) * SR); bubble(o, rng.uniform(600, 2200), rng.uniform(0.004, 0.01), rng.uniform(0.04, 0.2))
    x += lp(rng.standard_normal(n), 400) * np.exp(-((t - 1.2) / 0.8) ** 2) * 0.25          # slosh
    return x * np.minimum(1, t / 0.18) ** 2   # the water rises into the roar, no hard hit (a hit is heard as a blast)

if __name__ == '__main__':
    write('sk_mower', mower(), 0.7); write('sk_splash', splash(), 0.85)
