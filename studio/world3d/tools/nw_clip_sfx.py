#!/usr/bin/env python3
"""Sound for the Nio World look test (NWClip): the music in his earbud, a phone buzz, moves, the caught silence, the glitch."""
import sys, wave
import numpy as np
SR = 44100; FPS = 24; N = int(SR * 192 / FPS)
t = np.arange(N) / SR
rng = np.random.default_rng(3)
out = np.zeros(N)
def add(sig, at, gain=1.0):
    i = int(at * SR); n = min(len(sig), N - i)
    if n > 0: out[i:i + n] += sig[:n] * gain
def ep(freq, dur):
    x = np.arange(int(dur * SR)) / SR
    env = np.minimum(1, x / 0.008) * np.exp(-x * 2.2)
    return (np.sin(2 * np.pi * freq * x) + 0.35 * np.sin(4 * np.pi * freq * x) * np.exp(-x * 5) + 0.15 * np.sin(2 * np.pi * freq * 1.005 * x)) * env
def lp(x, a):
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y
beat = 60 / 84
chords = [[174.6, 220.0, 261.6, 329.6], [164.8, 196.0, 246.9, 293.7]]
music = np.zeros(N)
def madd(sig, at, gain):
    i = int(at * SR); n = min(len(sig), N - i)
    if n > 0: music[i:i + n] += sig[:n] * gain
b = 0
while b * beat < 8.2:
    ch = chords[(b // 4) % 2]
    if b % 2 == 0:
        for j, f in enumerate(ch): madd(ep(f, 1.8), b * beat + j * 0.012, 0.11)
        madd(ep(ch[0] / 2, 1.2), b * beat, 0.16)
    x = np.arange(int(0.16 * SR)) / SR
    if b % 2 == 0: madd(np.sin(2 * np.pi * (45 + 70 * np.exp(-x * 30)) * x) * np.exp(-x * 16), b * beat, 0.5)
    else: madd(lp(rng.normal(0, 1, len(x)), 0.35) * np.exp(-x * 26), b * beat, 0.22)
    h = np.arange(int(0.04 * SR)) / SR
    hat = rng.normal(0, 1, len(h)); hat = hat - lp(hat, 0.5)
    madd(hat * np.exp(-h * 90), b * beat + beat / 2, 0.07)
    b += 1
caught0, caught1 = 106 / FPS, 122 / FPS
gate = np.ones(N); gate[int(caught0 * SR):int(caught1 * SR)] = 0.0
k = int(0.02 * SR); gate = np.convolve(gate, np.ones(k) / k, mode='same')
out += music * gate
out += lp(rng.normal(0, 1, N), 0.02) * 0.05  # room tone
crack = (rng.random(N) < 0.0006) * rng.normal(0, 0.12, N); out += crack * gate
# phone buzz
x = np.arange(int(0.2 * SR)) / SR
bz = lp(np.sign(np.sin(2 * np.pi * 150 * x)), 0.12) * (0.6 + 0.4 * np.sin(2 * np.pi * 28 * x)) * np.minimum(1, x / 0.01) * np.minimum(1, (0.2 - x) / 0.02)
add(bz, 30 / FPS, 0.5); add(bz, 30 / FPS + 0.3, 0.5)
def whoosh(dur):
    x = np.arange(int(dur * SR)) / SR
    n = rng.normal(0, 1, len(x)); n = lp(n, 0.25) - lp(n, 0.03)
    return n * np.sin(np.pi * x / dur) ** 2
add(whoosh(0.22), 52 / FPS - 0.05, 0.5)
add(whoosh(0.28), 78 / FPS - 0.06, 0.8)
for j, f in enumerate([523.3, 659.3, 784.0]): add(ep(f, 0.6), 78 / FPS + j * 0.07, 0.16)
add(whoosh(0.16), 122 / FPS - 0.04, 0.35)
# glitch button
g0 = 180 / FPS
x = np.arange(N - int(g0 * SR)) / SR
crush = np.round(rng.normal(0, 1, len(x)) * 3) / 3
crush = np.repeat(crush[::24], 24)[:len(x)]
gl = crush * 0.25 + 0.3 * np.sign(np.sin(2 * np.pi * (220 * np.exp(-x * 4)) * x))
i0 = int(g0 * SR); out[i0:] = out[i0:] * 0.3 + gl * 0.5
out[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
out = out / np.max(np.abs(out)) * 0.8
w = wave.open(sys.argv[1], 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()
