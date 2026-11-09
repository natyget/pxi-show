# The show's voice treatment: a little "pixelated walkie-talkie / underwater" colour on every line.
# Band-limit like a radio, crush the sample rate a bit, a slow wobble, soft clip. Then the mouth envelope (12 fps) for lip sync.
import subprocess, sys, json, numpy as np, soundfile as sf
CHAIN = ("highpass=f=300,lowpass=f=3400,"
         "acrusher=level_in=1:level_out=1:bits=9:mode=log:aa=0.4:samples=4:mix=0.55,"
         "vibrato=f=4.5:d=0.06,asoftclip=type=tanh:threshold=0.8,"
         "loudnorm=I=-16:TP=-1.5:LRA=7,aresample=48000")
def treat(src, dst):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", CHAIN, "-ac", "1", dst], check=True)
def envelope(path, fps=12):
    a, sr = sf.read(path); a = a if a.ndim == 1 else a.mean(1)
    hop = sr // fps; n = int(np.ceil(len(a) / hop))
    e = np.array([np.sqrt(np.mean(a[i*hop:(i+1)*hop] ** 2) + 1e-12) for i in range(n)])
    e = np.clip((e / (np.percentile(e, 90) + 1e-9)), 0, 1); e[e < 0.15] = 0
    return [round(float(x), 3) for x in e], len(a) / sr
if __name__ == "__main__":
    out = {}
    for src, dst, key in json.loads(sys.argv[1]):
        treat(src, dst); env, dur = envelope(dst); out[key] = {"file": dst.split("public/")[-1], "dur": round(dur, 2), "env": env}
    print(json.dumps(out))
