"""What the sound of a finished video is heard as, every few seconds, by an open audio classifier (AST trained on
AudioSet, BSD-3). The stranger cannot hear, so this is how it judges the audio (founder, Nov 18, 9:32 PM: the party
bed "sounds like bumble bee glitches not music"). A party should read as music and chatter, a roof as wind, a
line as speech; a stretch heard as a siren, a horn, a buzz, insects, static or a foghorn is a defect.

    HF_HOME=/root/.cache/pxi-hf /root/.pxi-voice/bin/python engine/tools/audio_tags.py <video or wav> [window s] > audio.txt
"""
import subprocess, sys
import numpy as np
import torch
from transformers import ASTFeatureExtractor, ASTForAudioClassification

BAD = ('Siren', 'horn', 'Buzz', 'Insect', 'Bee', 'Static', 'Foghorn', 'Sonar', 'White noise', 'Pink noise', 'Beep', 'Buzzer', 'Glitch', 'Mosquito', 'Fly', 'Whale', 'Heart murmur', 'Tuning fork', 'Sine wave', 'Dial tone')

def main():
    src = sys.argv[1]; win = float(sys.argv[2]) if len(sys.argv) > 2 else 4.0
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    m = 'MIT/ast-finetuned-audioset-10-10-0.4593'
    fe = ASTFeatureExtractor.from_pretrained(m); model = ASTForAudioClassification.from_pretrained(m).eval()
    n = int(win * 16000); flags = 0
    print(f'What the sound is heard as, every {win:g} s (an audio classifier; the score is how sure it is).')
    for i in range(0, max(1, len(x) - n // 2), n):
        seg = x[i:i + n]
        if len(seg) < 8000: break
        with torch.no_grad(): p = torch.sigmoid(model(**fe(seg, sampling_rate=16000, return_tensors='pt')).logits)[0]
        top = [(model.config.id2label[int(k)], float(p[k])) for k in p.argsort(descending=True)[:4] if p[k] > 0.05]
        bad = [l for l, s in top if s > 0.1 and any(b.lower() in l.lower() for b in BAD)]
        flags += bool(bad)
        print(f'{i / 16000:5.1f}-{min(len(x), i + n) / 16000:5.1f}s  ' + ', '.join(f'{l} {s:.2f}' for l, s in top) + (f'   << sounds wrong: {", ".join(bad)}' if bad else ''))
    print(f'RESULT {"FLAG" if flags else "PASS"} ({flags} stretch{"es" if flags != 1 else ""} heard as something that does not belong)')

if __name__ == '__main__':
    main()
