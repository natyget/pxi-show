"""Sound check: every effect and bed, on its own, before it is mixed (founder, Nov 19: "the audio still weird").
The stranger only heard the finished mix, so a pop heard as a beep, a mower heard as a helicopter or a bed heard as
static was found after a full render. This listens to each file alone with the same open classifier the stranger
uses (AST on AudioSet, engine/tools/audio_tags.py) and fails it unless it is heard as what engine/studio/sounds.json
says it is, and as nothing on the bad list. A bed is judged every 4 s along its length, an effect as a whole.

    <python with torch + transformers> engine/tools/sound_check.py [keys...]     (no keys: every row in sounds.json)

Prints one row per sound and RESULT PASS or FAIL. A sound that fails is remade or swapped before any render.
"""
import json, os, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SFX = os.path.join(ROOT, 'studio/anim/public/sfx')
REG = json.load(open(os.path.join(ROOT, 'engine/studio/sounds.json')))
BAD = [b.lower() for b in REG['bad']]
BEDS = {'sk_party', 'sk_walla', 'sk_chatter', 'sk_dinner', 'sk_roof', 'sk_quad', 'sk_rain', 'sk_muzak', 'sk_piano'}

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768

def main():
    import torch
    from transformers import ASTFeatureExtractor, ASTForAudioClassification
    m = 'MIT/ast-finetuned-audioset-10-10-0.4593'
    fe = ASTFeatureExtractor.from_pretrained(m); model = ASTForAudioClassification.from_pretrained(m).eval()
    def tags(seg):
        if len(seg) < 16000: seg = np.pad(seg, (0, 16000 - len(seg)))
        with torch.no_grad(): p = torch.sigmoid(model(**fe(seg, sampling_rate=16000, return_tensors='pt')).logits)[0]
        return [(model.config.id2label[int(k)], float(p[k])) for k in p.argsort(descending=True)[:5]]
    keys = [a for a in sys.argv[1:] if not a.startswith('--')] or [k for k in REG if k not in ('_', 'bad')]
    fails = 0
    for k in keys:
        row = REG.get(k); f = os.path.join(SFX, k + '.wav')
        if not row: print(f'{k:12} FAIL  no row in engine/studio/sounds.json: say what it is meant to be heard as first'); fails += 1; continue
        if not os.path.exists(f): print(f'{k:12} FAIL  no file {f}'); fails += 1; continue
        x = load(f); heard = [h.lower() for h in row['heard']]
        segs = [x[i:i + 64000] for i in range(0, max(1, len(x) - 32000), 64000)] if k in BEDS and len(x) > 96000 else [x[:160000]]
        worst = None
        for j, seg in enumerate(segs):
            t = tags(seg)
            ok = any(any(h == l.lower() or h in l.lower() for h in heard) for l, s in t if s > 0.05)
            bad = [l for l, s in t if s > 0.08 and any(b in l.lower() for b in BAD)]
            if not ok or bad:
                worst = (j * 4, t, bad); break
        if worst:
            fails += 1; at, t, bad = worst
            print(f'{k:12} FAIL  at {at}s heard as ' + ', '.join(f'{l} {s:.2f}' for l, s in t[:4]) + (f'  << bad: {", ".join(bad)}' if bad else f'  << not heard as {row["heard"][0]}'))
        else:
            t = tags(segs[0]); print(f'{k:12} ok    heard as ' + ', '.join(f'{l} {s:.2f}' for l, s in t[:3]))
    print(f'RESULT {"FAIL" if fails else "PASS"} ({fails} of {len(keys)} sounds not heard as what they are)')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    main()
