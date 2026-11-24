# Pilot sfx: original, synthesised. A wooden creak and a canopy crash. No samples.
import numpy as np, soundfile as sf
SR = 48000; r = np.random.default_rng(5)
# creak: a slow stick-slip saw sweeping up, band-limited, wobbly
n = int(SR * 1.1); t = np.arange(n) / SR
f = 70 + 60 * t + 18 * np.sin(2 * np.pi * 3.1 * t)
ph = 2 * np.pi * np.cumsum(f) / SR
saw = (ph / (2 * np.pi)) % 1.0 - 0.5
click = np.diff(np.floor(ph / (2 * np.pi)), prepend=0)
ring = np.convolve(click, np.sin(2 * np.pi * 1350 * np.arange(900) / SR) * np.exp(-np.arange(900) / 160), 'same')
ring2 = np.convolve(click, np.sin(2 * np.pi * 2300 * np.arange(700) / SR) * np.exp(-np.arange(700) / 110), 'same')
y = (ring * 0.5 + ring2 * 0.3 + saw * 0.05) * np.minimum(1, t * 8) * np.minimum(1, (1.1 - t) * 6)
sf.write('public/sfx/creak.wav', (y / np.abs(y).max() * 0.7).astype(np.float32), SR)
# crash: a low thud, a burst of splintering noise, falling clatter
n = int(SR * 1.8); t = np.arange(n) / SR
thud = np.sin(2 * np.pi * (95 * np.exp(-t * 9) + 38) * t) * np.exp(-t * 7)
noise = r.normal(0, 1, n)
k = np.ones(24) / 24; lo = np.convolve(noise, k, 'same')
burst = (noise - lo) * 0.5 * np.exp(-t * 5.5) + lo * 2.2 * np.exp(-t * 4)
y = thud * 0.9 + burst * 0.55
for i in range(22):
    t0 = int(r.uniform(0.08, 1.3) * SR); m = 2400; tt = np.arange(m) / SR
    y[t0:t0 + m] += np.sin(2 * np.pi * r.uniform(500, 2600) * tt) * np.exp(-tt * r.uniform(35, 90)) * r.uniform(0.08, 0.3) * np.exp(-t0 / SR * 1.6)
y = np.tanh(y * 1.6)
sf.write('public/sfx/crash.wav', (y / np.abs(y).max() * 0.9).astype(np.float32), SR)
print('ok')
