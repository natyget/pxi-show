"""Crowd sounds made from the cast's own voices (founder, Nov 18, 9:32 PM: the synthetic boos and gasps read as sirens
and horns to an audio classifier). Each sound is several cast members' takes layered with small offsets, a touch of
pitch spread and the room's echo. The party walla is short lines of chatter scattered under the music.

    /root/.pxi-voice/bin/python tools/crowd_mix.py   (reads studio/voice/raw/raw_crowd_NN.wav, writes public/sfx/)

Takes (jobs_crowd.json): 1-5 boo, 6-10 gasp, 11-14 groan, 15-18 cheer, 19-26 walla lines."""
import os
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__)); ANIM = os.path.dirname(HERE)
RAW = os.path.join(ANIM, '..', 'voice', 'raw'); OUT = os.path.join(ANIM, 'public', 'sfx')
SR = 48000; rng = np.random.default_rng(11)

def load(i):
    sr, x = wavfile.read(os.path.join(RAW, f'raw_crowd_{i:02d}.wav'))
    x = x.astype(np.float32); x = x / (32768.0 if np.abs(x).max() > 2 else 1.0)
    if x.ndim > 1: x = x.mean(1)
    if sr != SR: x = resample_poly(x, SR, sr)
    a = np.abs(x); idx = np.where(a > 0.02 * a.max())[0]      # trim the silence round the take
    return x[max(0, idx[0] - 400): idx[-1] + 2400]

def shift(x, cents):  # a small pitch change by resampling, so five takes are not one voice
    k = 2 ** (cents / 1200); n = int(len(x) / k)
    return np.interp(np.arange(n) * k, np.arange(len(x)), x)

def room(x, amt=0.18, t=0.35):
    n = int(t * SR); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (t / 4)); ir[0] = 0
    ir = sosfilt(butter(2, 3500, 'low', fs=SR, output='sos'), ir)
    return x + amt * fftconvolve(x, ir)[:len(x)] / np.sqrt(n) * 4

def layer(ids, spread=0.12, cents=60, gains=None):
    parts = []
    for k, i in enumerate(ids):
        x = shift(load(i), rng.uniform(-cents, cents)) * (gains[k] if gains else rng.uniform(0.6, 1.0))
        parts.append((int(rng.uniform(0, spread) * SR), x))
    n = max(o + len(x) for o, x in parts) + SR // 2; out = np.zeros(n)
    for o, x in parts: out[o:o + len(x)] += x
    return out

def write(name, x, peak=0.8):
    x = room(x); fade = int(0.03 * SR); x[-fade:] *= np.linspace(1, 0, fade)
    x = x / (np.abs(x).max() + 1e-9) * peak
    wavfile.write(os.path.join(OUT, name + '.wav'), SR, (x * 32767).astype(np.int16)); print(name, round(len(x) / SR, 2), 's')

write('sk_boo', layer([1, 2, 3, 4, 5], 0.25))
write('sk_gasp', layer([6, 7, 8, 9, 10], 0.06))
write('sk_groan', layer([11, 12, 13, 14], 0.15))
write('sk_cheer', layer([15, 16, 17, 18], 0.12))
# walla: the eight chatter lines, each a few times, scattered over 70 s, dull and far, never two of the same at once
dur = 70; out = np.zeros(dur * SR); lp = butter(2, 2600, 'low', fs=SR, output='sos')
t = 0.3
while t < dur - 3:
    x = shift(load(int(rng.integers(19, 27))), rng.uniform(-80, 80)) * rng.uniform(0.35, 0.7)
    o = int(t * SR); out[o:o + len(x)] += x[: len(out) - o]
    t += rng.uniform(0.6, 1.6)
write('sk_walla', sosfilt(lp, out), peak=0.5)
