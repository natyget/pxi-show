# Launch-skit treatment: the approved chain from clean.py (trim, -16 LUFS, 48 kHz mono) with the skit's voice medium
# (mediums.py: one per skit, so the founder can compare how each performs) in place of the walkie colour.
# usage: python treat_skit.py jobs.json manifest_out.json <skit>
import sys, json, subprocess, numpy as np, soundfile as sf
import clean, mediums
skit = sys.argv[3]; L = mediums.SKIT[skit]
clean.USE_WALKIE = True; clean.WALKIE = mediums.OPT[L]
R = np.random.default_rng(3)
jobs = json.load(open(sys.argv[1])); out = {}
for j in jobs:
    src = f"raw/{j['out']}"; key = j["out"][4:-4]; dst = f"../anim/public/vo/{key}.wav"
    who = j.get("role", "d" + j["who"]); clean.PITCH.setdefault(who, 0.0)
    c = clean.chain(who, False, sf.info(src).samplerate)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", c, "-ac", "1", "-ar", "48000", dst], check=True)
    a, r = sf.read(dst)
    kind = mediums.NOISE.get(L)
    if kind == 'crackle': a = a + R.normal(0, 1, len(a)) * 0.006 + (R.uniform(0, 1, len(a)) > 0.9993) * R.normal(0, 0.25, len(a))
    if kind == 'hiss': a = a + R.normal(0, 1, len(a)) * 0.01
    a = np.clip(a, -1, 1); sf.write(dst, a, r)
    out[key] = {"file": f"vo/{key}.wav", "who": j["who"], "text": clean.norm(j["text"]), "sub": j.get("sub", j["text"]), "dur": round(len(a) / r, 3), "env": clean.envelope(a, r), "medium": L}
    print(key, out[key]["dur"], j["text"], flush=True)
json.dump(out, open(sys.argv[2], "w"), indent=0)
