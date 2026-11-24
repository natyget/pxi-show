# Market murmur: original, synthesised (band-limited noise with slow swells + soft clinks). No samples.
import numpy as np, soundfile as sf
from numpy.fft import rfft, irfft
SR = 48000; r = np.random.default_rng(11); n = SR * 40
x = r.normal(0, 1, n)
X = rfft(x); f = np.fft.rfftfreq(n, 1 / SR)
X *= ((f > 180) & (f < 2400)) * (1 / (1 + (f / 700) ** 2))
y = irfft(X, n)
env = 0.6 + 0.4 * np.convolve(r.normal(0, 1, n), np.ones(SR // 2) / (SR // 2), 'same') * 8
y = y / np.abs(y).max() * 0.25 * np.clip(env, 0.3, 1.2)
for k in range(60):
    t0 = r.integers(0, n - 4000); tt = np.arange(3000) / SR
    y[t0:t0 + 3000] += np.sin(2 * np.pi * r.uniform(1800, 3200) * tt) * np.exp(-tt * 40) * 0.05
sf.write('public/sfx/market.wav', y.astype(np.float32), SR)
print('ok')
