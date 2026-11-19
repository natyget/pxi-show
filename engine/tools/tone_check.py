"""Tone check: does a voice line sound like the situation it is in? (founder, Nov 19: "work on voice and how
people's tone works in different scenarios"). Reads raw takes (before loudness treatment, so intensity is real),
measures each one and scores it against the tone the line is written for. Also flags broken rhythm: a gap inside a
short line, or a line spoken far slower than people talk.

usage: python tone_check.py takes.json      takes: [{"key", "who", "tone", "text", "files": [wav, ...]}]
prints one row per take and the best take per line as  BEST <key> <file>  (tone_pick in the voice chain copies it).
Tones: panic, rage, shout, horror, deadpan, brag, sincere, laugh, beam, strained, wheeze, plain.
"""
import sys, json, numpy as np, librosa

def measure(f):
    y, sr = librosa.load(f, sr=24000, mono=True)
    rms = librosa.feature.rms(y=y, frame_length=1024, hop_length=240)[0]; on = rms > max(rms.max() * 0.08, 1e-4)
    idx = np.where(on)[0]; y0, y1 = (idx[0], idx[-1]) if len(idx) else (0, len(rms) - 1)
    act = on[y0:y1 + 1]; gaps, run = [], 0
    for a in act:
        if not a: run += 1
        else:
            if run: gaps.append(run * 0.01)
            run = 0
    f0, vf, _ = librosa.pyin(y, fmin=70, fmax=600, sr=sr, frame_length=1024, hop_length=240)
    f0 = f0[vf & ~np.isnan(f0)] if f0 is not None else np.array([])
    st = 12 * np.log2(f0 / 100) if len(f0) > 4 else np.array([0.0])
    cen = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=240)[0][y0:y1 + 1]
    return {'dur': (y1 - y0) * 0.01, 'db': float(20 * np.log10(np.sqrt(np.mean(rms[y0:y1 + 1] ** 2)) + 1e-9)),
            'pitch': float(np.median(st)), 'range': float(np.percentile(st, 90) - np.percentile(st, 10)),
            'bright': float(np.median(cen)), 'gap': max(gaps or [0])}

# what each tone wants, as signs on (loudness, pitch, range, brightness, speed) against the speaker's own baseline
WANT = {'panic': (1, 1, 1, 1, 1), 'rage': (1, 0.5, 0.5, 1, 0.5), 'shout': (1, 1, 0, 1, 0.5), 'horror': (-1.2, -0.5, 0.3, -0.6, -0.5),
        'deadpan': (-0.5, -0.5, -1, -0.5, 0), 'brag': (0, -0.3, 0.5, 0, -0.3), 'sincere': (-0.3, 0, 0.3, -0.3, 0),
        'laugh': (0.5, 1, 1, 0.5, 0.5), 'beam': (0.5, 0.5, 0.5, 0.3, 0), 'strained': (0.3, 0.3, 0, 0.3, 0), 'wheeze': (-0.5, 0.5, 0.5, -0.3, 0), 'plain': (0, 0, 0, 0, 0)}

def syll(t): return max(1, sum(max(1, len([c for c in w if c in 'aeiouy'])) for w in t.lower().split()) * 0.8)

if __name__ == '__main__':
    lines = json.load(open(sys.argv[1])); M = {}
    for l in lines:
        for f in l['files']: M[f] = measure(f)
    base = {}
    for l in lines:
        for f in l['files']: base.setdefault(l['who'], []).append(M[f])
    B = {w: {k: np.median([m[k] for m in ms]) for k in ('db', 'pitch', 'range', 'bright')} for w, ms in base.items()}
    for l in lines:
        w = WANT[l['tone']]; best = None
        for f in l['files']:
            m = M[f]; b = B[l['who']]; rate = syll(l['text']) / max(m['dur'], 0.2)
            v = ((m['db'] - b['db']) / 4, (m['pitch'] - b['pitch']) / 2, (m['range'] - b['range']) / 3, (m['bright'] - b['bright']) / 400, (rate - 4.5) / 1.5)
            score = sum(a * c for a, c in zip(w, v)) - (2.0 if m['gap'] > 0.35 and len(l['text'].split()) <= 6 else 0) - (1.5 if rate < 2.2 else 0)
            flag = ' GAP' if m['gap'] > 0.35 else ''; flag += ' SLOW' if rate < 2.2 else ''
            print(f"{l['key']:10} {l['tone']:8} {f.split('/')[-1]:24} db {m['db']:6.1f} pitch {m['pitch']:5.1f} range {m['range']:4.1f} rate {rate:4.1f}/s gap {m['gap']:.2f} score {score:5.2f}{flag}")
            if best is None or score > best[0]: best = (score, f)
        print('BEST', l['key'], best[1], flush=True)
