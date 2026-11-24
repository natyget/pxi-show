# Ep 1 sound, all synthesised here (original, no samples): laundromat room tone, camera shutter, poof, pitch-drop.
import numpy as np, soundfile as sf
SR = 48000; r = np.random.default_rng(5)
def t(d): return np.arange(int(SR * d)) / SR
# laundromat: dryer rumble + a tumbling thump every ~0.7 s + fluorescent buzz
n = SR * 60; tt = np.arange(n) / SR
rumble = np.convolve(r.normal(0, 1, n), np.ones(400) / 400, 'same') * 0.6
hum = np.sin(2 * np.pi * 58 * tt) * 0.05 + np.sin(2 * np.pi * 120 * tt) * 0.012
thumps = np.zeros(n)
for k in np.arange(0, 60, 0.72):
    i = int(k * SR); d = t(0.12); thumps[i:i + len(d)] += np.sin(2 * np.pi * 70 * d) * np.exp(-d * 30) * 0.35
room = (rumble * 0.25 + hum + thumps) * 0.6
sf.write('public/sfx/laundromat.wav', room.astype(np.float32), SR)
# shutter: two clicks
d = t(0.12); click = r.uniform(-1, 1, len(d)) * np.exp(-d * 120)
sh = np.concatenate([click, np.zeros(int(SR * 0.05)), click * 0.7]) * 0.5
sf.write('public/sfx/shutter.wav', sh.astype(np.float32), SR)
# poof: filtered noise swell + a soft pop
d = t(0.35); po = np.convolve(r.normal(0, 1, len(d)), np.ones(30) / 30, 'same') * np.sin(np.pi * d / 0.35) * 0.6
po[:2000] += np.sin(2 * np.pi * 600 * d[:2000]) * np.exp(-d[:2000] * 60) * 0.4
sf.write('public/sfx/poof.wav', po.astype(np.float32), SR)
# the world slowing down: a falling tone
d = t(1.2); f = 220 * np.exp(-d * 1.4); ph = 2 * np.pi * np.cumsum(f) / SR
sf.write('public/sfx/drop.wav', (np.sign(np.sin(ph)) * 0.12 * np.exp(-d * 1.2)).astype(np.float32), SR)
print('ok')
