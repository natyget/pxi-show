#!/usr/bin/env python3
"""The stressed beats of a voice line, for the acting pass (studio/anim/src/nw3d/acting.ts).

An animator times dialogue to its ACCENTS, not to every syllable: the body changes pose on the one word the line
is about, the head dips on the other stressed syllables, and everything else holds. This finds those beats from the
audio: the loudness envelope every 10 ms, its syllable peaks, and how far each peak stands above the line's own level.

Output, per line: {"frames": n, "accents": [[frame, strength 0..1], ...], "main": frame}
  - at most one accent every 10 frames, and only peaks at 55% or more of the line's loudest
  - "main" is the last accent at 80% or more of the strongest (the key word of a line usually comes late), the beat the pose change lands on (the body arrives ON it, so the move starts
    3 to 4 frames before)

Usage:
  accents.py manifest <vo_*.json> <out.json> [--fps 24]   every line in a voice manifest ({id: {file, ...}})
  accents.py one <audio> [--fps 24]
Needs ffmpeg and numpy only. Files in the manifest are relative to studio/anim/public.
"""
import json, os, subprocess, sys
import numpy as np

SR, HOP = 16000, 160


def envelope(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    n = len(x) // HOP
    rms = np.sqrt((x[: n * HOP].reshape(n, HOP) ** 2).mean(1) + 1e-9)
    db = 20 * np.log10(rms)
    k = np.ones(5) / 5  # 50 ms smoothing: a syllable, not a waveform
    return np.convolve(db, k, mode='same')


def accents(path, fps=24, gap=10, keep=0.55):
    e = envelope(path)
    n = len(e)
    frames = int(np.ceil(n * HOP / SR * fps))
    floor = np.percentile(e, 20)
    top = e.max()
    if top - floor < 6:
        return {'frames': frames, 'accents': [], 'main': None}
    lev = np.clip((e - floor) / (top - floor), 0, 1)
    # syllable peaks: local maxima over +-80 ms
    peaks = [i for i in range(n) if lev[i] >= keep and lev[i] == lev[max(0, i - 8): i + 9].max()]
    # rising into the peak counts: a stressed syllable has a sharp onset
    def score(i):
        rise = lev[i] - lev[max(0, i - 12): i + 1].min()
        return 0.6 * lev[i] + 0.4 * rise
    peaks.sort(key=lambda i: -score(i))
    chosen = []
    for i in peaks:
        f = int(round(i * HOP / SR * fps))
        if all(abs(f - c[0]) >= gap for c in chosen):
            chosen.append((f, round(float(score(i)), 3)))
    chosen.sort()
    if not chosen:
        return {'frames': frames, 'accents': [], 'main': None}
    mx = max(s for _, s in chosen)
    acc = [[f, round(s / mx, 3)] for f, s in chosen]
    # the key word is usually the LAST strong stress in an English line ("did they ever drop the new GTA?")
    main = [f for f, s in acc if s >= 0.8][-1]
    return {'frames': frames, 'accents': acc, 'main': main}


def main():
    a = sys.argv[1:]
    fps = 24
    if '--fps' in a:
        i = a.index('--fps'); fps = int(a[i + 1]); del a[i:i + 2]
    if a[0] == 'one':
        print(json.dumps(accents(a[1], fps)))
    elif a[0] == 'manifest':
        man = json.load(open(a[1]))
        pub = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'studio', 'anim', 'public')
        out = {}
        for k, v in man.items():
            p = v['file'] if os.path.isabs(v['file']) else os.path.join(pub, v['file'])
            if os.path.exists(p):
                out[k] = accents(p, fps)
        json.dump(out, open(a[2], 'w'), separators=(',', ':'))
        print(f'{len(out)} lines -> {a[2]}')
    else:
        print(__doc__); sys.exit(2)


if __name__ == '__main__':
    main()
