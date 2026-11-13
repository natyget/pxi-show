#!/usr/bin/env python3
"""Mouth timing from a voice line: the line's text, forced onto its audio, gives mouth-shape cues.

The shapes are the eight classic cartoon mouths, named as Rhubarb Lip Sync names them, so its output can
replace this one later without touching the rig:
  A closed (M B P)     B teeth, barely open (most consonants, EE)   C open (EH, AE, short I)
  D wide open (AA, I)  E rounded (AO, ER, R)                        F puckered (OO, OW, W)
  G teeth on lip (F V) H tongue up (L)                              X rest (silence)

How: the text becomes a rough phone string (spelling rules, no dictionary). Each phone has an expected loudness
and hiss. A left-to-right Viterbi pass lines those up with the audio's loudness and hiss every 10 ms, with
optional pauses between words. The result is quantised to the frame rate and held at least two frames, because
the show animates on twos.

Usage:
  lipsync.py one <audio> "<text>" [--fps 24]              print the cues as JSON
  lipsync.py manifest <vo_*.json> <out.json> [--fps 24]   every line in a voice manifest ({id: {file, text}})
Needs ffmpeg and numpy only.
"""
import json, re, subprocess, sys
import numpy as np

SR, HOP = 16000, 160  # 10 ms analysis frames

# ---------- text to phones ----------
# (pattern, phones) tried longest first at each position. A phone is (viseme, kind); kinds drive the audio model.
V, N, S, P, L = 'vowel', 'nasal', 'hiss', 'stop', 'liquid'
RULES = [
    ('tion', [('B', S), ('C', V), ('B', N)]), ('ough', [('F', V)]), ('igh', [('D', V), ('B', V)]),
    ('eigh', [('C', V), ('B', V)]), ('oo', [('F', V)]), ('ou', [('D', V), ('F', V)]), ('ow', [('E', V), ('F', V)]),
    ('ee', [('B', V)]), ('ea', [('B', V)]), ('ey', [('B', V)]), ('ie', [('B', V)]), ('ei', [('C', V), ('B', V)]),
    ('ai', [('C', V), ('B', V)]), ('ay', [('C', V), ('B', V)]), ('oy', [('E', V), ('B', V)]), ('oi', [('E', V), ('B', V)]),
    ('oa', [('E', V), ('F', V)]), ('ue', [('F', V)]), ('ew', [('F', V)]), ('au', [('E', V)]), ('aw', [('E', V)]),
    ('ar', [('D', V), ('E', L)]), ('or', [('E', V), ('E', L)]), ('er', [('E', V)]), ('ir', [('E', V)]), ('ur', [('E', V)]),
    ('al', [('D', V), ('H', L)]),
    ('th', [('B', S)]), ('sh', [('B', S)]), ('ch', [('B', S)]), ('ph', [('G', S)]), ('wh', [('F', L)]), ('ck', [('B', P)]),
    ('ng', [('B', N)]), ('qu', [('B', P), ('F', L)]), ('gh', []), ('kn', [('B', N)]), ('wr', [('E', L)]),
    ('a', [('C', V)]), ('e', [('C', V)]), ('i', [('C', V)]), ('o', [('E', V)]), ('u', [('C', V)]), ('y', [('B', V)]),
    ('m', [('A', N)]), ('b', [('A', P)]), ('p', [('A', P)]), ('f', [('G', S)]), ('v', [('G', S)]), ('l', [('H', L)]),
    ('w', [('F', L)]), ('r', [('E', L)]), ('s', [('B', S)]), ('z', [('B', S)]), ('c', [('B', P)]), ('k', [('B', P)]),
    ('g', [('B', P)]), ('j', [('B', S)]), ('x', [('B', P), ('B', S)]), ('t', [('B', P)]), ('d', [('B', P)]),
    ('n', [('B', N)]), ('h', [('C', S)]),
]
RULES.sort(key=lambda r: -len(r[0]))
WORDS = {  # the few words spelling gets wrong and the show says a lot
    'i': [('D', V), ('B', V)], "i'm": [('D', V), ('B', V), ('A', N)], 'you': [('B', V), ('F', V)], 'the': [('B', S), ('C', V)],
    'to': [('B', P), ('F', V)], 'do': [('B', P), ('F', V)], 'one': [('F', L), ('C', V), ('B', N)], 'my': [('A', N), ('D', V), ('B', V)],
    'pixie': [('A', P), ('C', V), ('B', P), ('B', S), ('B', V)], 'okay': [('E', V), ('B', P), ('C', V), ('B', V)],
    'eighty': [('C', V), ('B', V), ('B', P), ('B', V)], 'percent': [('A', P), ('E', V), ('B', S), ('C', V), ('B', N), ('B', P)],
    'what': [('F', L), ('D', V), ('B', P)], "what's": [('F', L), ('D', V), ('B', P), ('B', S)], 'was': [('F', L), ('D', V), ('B', S)],
    'are': [('D', V), ('E', L)], 'guys': [('B', P), ('D', V), ('B', V), ('B', S)], 'gonna': [('B', P), ('D', V), ('B', N), ('C', V)],
    'life': [('H', L), ('D', V), ('B', V), ('G', S)], 'called': [('B', P), ('E', V), ('H', L), ('B', P)], 'nobody': [('B', N), ('E', V), ('A', P), ('D', V), ('B', P), ('B', V)],
}

def word_phones(w):
    w = w.lower().strip("'")
    if w in WORDS: return WORDS[w]
    if len(w) > 3 and w.endswith('e') and w[-2] not in 'aeiouy': w = w[:-1]  # silent final e
    if w.endswith('mb'): w = w[:-1]
    out, i = [], 0
    while i < len(w):
        for pat, ph in RULES:
            if w.startswith(pat, i):
                if not (out and ph and out[-1] == ph[0] and ph[0][1] != V): out += ph  # double letters say once
                i += len(pat); break
        else: i += 1
    return out

def text_phones(text):
    """A list of phones with optional pauses ('X', 'gap') between words and forced ones at punctuation."""
    seq = [('X', 'sil')]
    for tok in re.findall(r"[A-Za-z']+|[.,!?;:…—-]+", text.replace('PXI', 'pixie')):
        if re.match(r"[A-Za-z]", tok):
            ph = word_phones(tok)
            if ph: seq += ph + [('X', 'gap')]
        else:
            if seq[-1][1] == 'gap': seq[-1] = ('X', 'pause')
    if seq[-1][1] in ('gap', 'pause'): seq[-1] = ('X', 'sil')
    else: seq.append(('X', 'sil'))
    return seq

# expected (loudness, hiss) per kind, and the shortest stay in 10 ms frames
MODEL = {V: (1.0, 0.1, 4), N: (0.55, 0.05, 3), L: (0.7, 0.1, 2), S: (0.4, 0.9, 4), P: (0.2, 0.4, 2),
         'gap': (0.0, 0.0, 1), 'pause': (0.0, 0.0, 6), 'sil': (0.0, 0.0, 1)}

# ---------- audio features ----------
def features(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    n = max(1, len(x) // HOP)
    x = np.pad(x, (0, n * HOP + 400 - len(x)))
    fr = np.stack([x[i * HOP:i * HOP + 400] for i in range(n)]) * np.hanning(400)
    sp = np.abs(np.fft.rfft(fr, 512)) ** 2
    f = np.fft.rfftfreq(512, 1 / SR)
    tot = sp[:, (f > 80)].sum(1) + 1e-9
    hi = sp[:, (f > 3500)].sum(1) / tot
    db = 10 * np.log10(tot)
    top = np.percentile(db, 95); floor = max(np.percentile(db, 10), top - 45)
    loud = np.clip((db - floor) / (top - floor + 1e-9), 0, 1)
    loud = np.convolve(loud, np.ones(3) / 3, 'same')
    hiss = np.clip((hi - 0.02) / 0.3, 0, 1)
    return loud, hiss

# ---------- alignment ----------
def align(seq, loud, hiss):
    T, Sn = len(loud), len(seq)
    # expand each phone into its minimum number of sub-states so durations stay plausible
    states, owner = [], []
    for k, (vis, kind) in enumerate(seq):
        l, h, mn = MODEL[kind]
        for j in range(mn): states.append((l, h, kind in ('gap',), j == 0)); owner.append(k)
    M = len(states)
    if M > T:  # audio shorter than the text wants: squeeze to one sub-state each
        states = [(MODEL[k][0], MODEL[k][1], k == 'gap', True) for _, k in seq]; owner = list(range(Sn)); M = Sn
    el = np.array([s[0] for s in states]); eh = np.array([s[1] for s in states])
    cost = (loud[:, None] - el[None]) ** 2 + 0.6 * (hiss[:, None] - eh[None]) ** 2 * (loud[:, None] > 0.15)
    INF = 1e18
    D = np.full((T, M), INF); B = np.zeros((T, M), np.int32)
    D[0, 0] = cost[0, 0]
    last_of = {}
    for m in range(M): last_of[owner[m]] = m
    for t in range(1, T):
        prev = D[t - 1]
        stay = prev
        adv = np.concatenate([[INF], prev[:-1]])
        best = np.minimum(stay, adv); arg = np.where(adv < stay, 1, 0)
        # skipping an optional word gap (its single sub-state): from the state before it straight into the next phone
        for m in range(2, M):
            if states[m - 1][2] and states[m][3] and prev[m - 2] < best[m]: best[m] = prev[m - 2]; arg[m] = 2
        D[t] = best + cost[t]; B[t] = arg
    m = M - 1; path = [m]
    for t in range(T - 1, 0, -1):
        m -= B[t, m]; path.append(m)
    path.reverse()
    return [seq[owner[m]][0] for m in path]

def to_cues(vis, fps, hold=2):
    dur = len(vis) * HOP / SR
    nf = int(round(dur * fps))
    frames = []
    for f in range(nf):
        a, b = int(f / fps * SR / HOP), max(int(f / fps * SR / HOP) + 1, int((f + 1) / fps * SR / HOP))
        seg = vis[a:b] or ['X']
        # the most open shape wins inside a frame, so short vowels are not lost; closures (A) win over rest
        rank = {'D': 7, 'C': 6, 'H': 5, 'E': 5, 'F': 4, 'B': 3, 'G': 3, 'A': 2, 'X': 0}
        frames.append(max(seg, key=lambda s: (rank[s], seg.count(s))))
    # on twos: each shape is held at least `hold` frames
    out, f = [], 0
    while f < nf:
        s = frames[f]; out.append([f, s]); f += hold
        while f < nf and frames[f] == s: f += 1
    # merge repeats
    cues = []
    for c in out:
        if not cues or cues[-1][1] != c[1]: cues.append(c)
    return {'fps': fps, 'frames': nf, 'cues': cues}

def run(path, text, fps=24):
    loud, hiss = features(path)
    return to_cues(align(text_phones(text), loud, hiss), fps)

if __name__ == '__main__':
    a = sys.argv[1:]
    fps = int(a[a.index('--fps') + 1]) if '--fps' in a else 24
    if a and a[0] == 'one':
        print(json.dumps(run(a[1], a[2], fps)))
    elif a and a[0] == 'manifest':
        import os
        man = json.load(open(a[1])); base = os.path.join(os.path.dirname(a[1]), '..', 'public')
        res = {k: run(os.path.join(base, v['file']), v.get('sub', v['text']), fps) for k, v in man.items()}
        json.dump(res, open(a[2], 'w'), separators=(',', ':'))
        print(f'{len(res)} lines -> {a[2]}')
    else:
        print(__doc__); sys.exit(1)
