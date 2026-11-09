# Voice treatment per role. Every voice gets the show's walkie-talkie colour; pitch moves make them younger/cartoonier.
# Thoughts get a small "inside the head" echo. Output: treated wav + 12 fps mouth envelope, merged into audio.json.
import subprocess, sys, json, numpy as np, soundfile as sf
WALKIE = ("highpass=f=280,lowpass=f=3500,acrusher=level_in=1:level_out=1:bits=9:mode=log:aa=0.4:samples=4:mix=0.5,"
          "vibrato=f=4.5:d=0.05,asoftclip=type=tanh:threshold=0.8")
def shift(st):
    r = 2 ** (st / 12)
    return f"asetrate={int(24000*r)},aresample=48000,atempo={1/r:.5f}," if st else "aresample=48000,"
ROLES = {
  "nio":     shift(-1.0) + WALKIE + ",loudnorm=I=-16:TP=-1.5:LRA=7",
  "thought": shift(-1.0) + WALKIE + ",aecho=0.8:0.6:45|90:0.25|0.15,volume=0.9,loudnorm=I=-18:TP=-1.5:LRA=7",
  "maya":    shift(2.0) + WALKIE + ",loudnorm=I=-16:TP=-1.5:LRA=7",
  "phone":   shift(2.0) + WALKIE + ",highpass=f=450,lowpass=f=3000,loudnorm=I=-17:TP=-1.5:LRA=7",
  "weird":   shift(-2.5) + WALKIE + ",loudnorm=I=-17:TP=-1.5:LRA=7",
  "tv":      "aresample=48000,highpass=f=500,lowpass=f=3200,acrusher=bits=7:mode=log:samples=3:mix=0.4,volume=0.5",
}
def treat(src, dst, role):
    sr = sf.info(src).samplerate
    chain = ROLES[role].replace("asetrate=", f"asetrate=").replace("24000", str(sr))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", chain, "-ac", "1", "-ar", "48000", dst], check=True)
def envelope(path, fps=12):
    a, sr = sf.read(path); a = a if a.ndim == 1 else a.mean(1)
    hop = sr // fps; n = int(np.ceil(len(a) / hop))
    e = np.array([np.sqrt(np.mean(a[i*hop:(i+1)*hop] ** 2) + 1e-12) for i in range(n)])
    e = np.clip(e / (np.percentile(e, 90) + 1e-9), 0, 1); e[e < 0.15] = 0
    return [round(float(x), 3) for x in e], len(a) / sr
if __name__ == "__main__":
    jobs = json.loads(open(sys.argv[1]).read()); out = {}
    for src, key, role in jobs:
        dst = f"/home/user/pxi-show/studio/anim/public/vo/{key}.wav"; treat(src, dst, role)
        env, dur = envelope(dst); out[key] = {"file": f"vo/{key}.wav", "dur": round(dur, 2), "env": env}
    p = '/home/user/pxi-show/studio/anim/src/audio.json'; a = json.load(open(p)); a['lines'].update(out); json.dump(a, open(p, 'w'))
    print({k: v['dur'] for k, v in out.items()})
