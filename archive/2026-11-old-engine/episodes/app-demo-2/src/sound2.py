#!/usr/bin/env python3
"""Original sound for app demo 1: a 120 BPM beat made here from sine and noise, shutter clicks, whooshes, taps.
Nothing sampled. The beat goes muffled for "next day" (4.6 to 7.9 s) and stops on the end frame (18.4 s)."""
import numpy as np, wave, sys
SR = 44100; DUR = 14.6; N = int(SR * DUR); rng = np.random.default_rng(7)
out = np.zeros(N); beat = np.zeros(N)
def at(buf, t, x, g=1.0):
    i = int(t * SR); j = min(N, i + len(x)); buf[i:j] += g * x[:j - i]
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def kick():
    n = int(.35 * SR); t = np.arange(n) / SR; f = 50 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .12)
def hat(): n = int(.06 * SR); x = rng.standard_normal(n); x = np.diff(x, prepend=0); return x * env(n, .001, .015) * .35
def clap():
    n = int(.2 * SR); x = rng.standard_normal(n); x = np.convolve(x, np.ones(6) / 6, 'same') - np.convolve(x, np.ones(60) / 60, 'same')
    e = sum(env(n, .001, .01) * (np.arange(n) >= int(k * SR)) for k in (0, .011, .022)) + env(n, .001, .06)
    return x * e * .5
def bass(f, d):
    n = int(d * SR); t = np.arange(n) / SR; x = np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)
    return np.tanh(1.5 * x) * env(n, .005, d * .6) * .45




B = 0.5; roots = [55.0, 55.0, 65.41, 49.0]   # A, A, C, G
t = 0.0; k = 0
while t < 12.0:
    at(beat, t, kick(), .9)
    at(beat, t + B / 2, hat())
    if k % 2 == 1: at(beat, t, clap(), .55)
    at(beat, t + B / 4 * 3, bass(roots[(k // 4) % 4], .22))
    at(beat, t, bass(roots[(k // 4) % 4], .18), .7)
    t += B; k += 1
# muffle 4.6 to 7.9: the morning after
i0, i1 = 2000, int(4.62 * SR); seg = beat[i0 - 2000:i1 + 2000].copy()
from numpy.fft import rfft, irfft
F = rfft(seg); fr = np.fft.rfftfreq(len(seg), 1 / SR); F *= 1 / (1 + (fr / 350) ** 4); muf = irfft(F, len(seg)) * .8
fade = np.ones(len(seg)); r = 2000; fade[:r] = 1; fade[-r:] = np.linspace(1, 0, r)
beat[i0 - 2000:i1 + 2000] = seg * (1 - fade) + muf * fade
# stop the beat on the end frame
e = int(12.0 * SR); beat[e:] *= 0; beat[e - 400:e] *= np.linspace(1, 0, 400)
out += beat * .8
def shutter():
    n = int(.12 * SR); x = rng.standard_normal(n)
    return x * (env(n, .0005, .006) + .6 * env(n, .0005, .012) * (np.arange(n) > int(.045 * SR))) * .9
for ts in (4.62,): at(out, ts, shutter())
def whoosh(d, up=True):
    n = int(d * SR); x = rng.standard_normal(n); F = rfft(x); fr = np.fft.rfftfreq(n, 1 / SR)
    F *= np.exp(-((fr - 1800) / 1500) ** 2); x = irfft(F, n); x /= np.abs(x).max()
    sh = np.sin(np.pi * np.linspace(0, 1, n)) ** 2; return x * sh * .35
at(out, 4.75, whoosh(.45)); at(out, 8.7, whoosh(.5))
def tap(): n = int(.04 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * 1600 * tt) * env(n, .0005, .008) * .5
at(out, 2.88, tap()); at(out, 4.5, tap())
# end: one warm chord that rings out
n = int(2.6 * SR); tt = np.arange(n) / SR; ch = sum(np.sin(2 * np.pi * f * tt) for f in (220, 277.18, 329.63, 440)) / 4
at(out, 12.0, ch * env(n, .01, 1.1) * .5); at(out, 12.0, kick(), .9)
out /= np.abs(out).max() * 1.05
st = np.stack([out, out], 1); w = wave.open(sys.argv[1], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st * 32767).astype('<i2').tobytes()); w.close()
