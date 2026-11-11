# Clean voice treatment (founder note, Nov 11): NO walkie-talkie / bubbly / metallic colour.
# Only the approved per-character pitch (bible/characters.md), trimmed, loudness-normalised to -16 LUFS, 48 kHz mono.
# Flashback lines get the craft-library memory treatment: light reverb, high end rolled off.
# Output: studio/anim/public/vo/<key>.wav + src/vo_pilot.json {key: {file, text, dur, env}} (env = 12 fps mouth envelope).
import subprocess, sys, json, re, numpy as np, soundfile as sf
PITCH = {"nio": -1.0, "maya": 2.0, "n_liam": 0.0, "m_kore": 0.0}
MEMORY = {"raw_ne_p4.wav", "raw_ne_p4m.wav", "raw_ne_p7.wav"}
TRIM = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse"
def chain(who, mem, sr):
    st = PITCH[who]; r = 2 ** (st / 12)
    c = f"asetrate={int(sr*r)},aresample=48000,atempo={1/r:.5f}," if st else "aresample=48000,"
    c += "highpass=f=70," + TRIM
    if mem: c += ",lowpass=f=4500,aecho=0.85:0.5:60|110:0.18|0.10"
    return c + ",apad=pad_dur=0.06,loudnorm=I=-16:TP=-1.5:LRA=7,aresample=48000"
def envelope(a, sr, fps=12):
    hop = sr // fps; n = int(np.ceil(len(a) / hop))
    e = np.array([np.sqrt(np.mean(a[i*hop:(i+1)*hop] ** 2) + 1e-12) for i in range(n)])
    e = np.clip(e / (np.percentile(e, 90) + 1e-9), 0, 1); e[e < 0.15] = 0
    return [round(float(x), 3) for x in e]
NUM = {"212": "two hundred and twelve"}
# PXI is said "pixie" (founder, Nov 11): feed the TTS "pixie"; subtitles keep "PXI".
def norm(s):
    s = s.lower().replace("’", "'"); s = re.sub(r"\bpxi\b", "pixie", s)
    for k, v in NUM.items(): s = s.replace(k, v)
    return re.sub(r"[^a-z' ]", "", s).strip()
if __name__ == "__main__":
    jobs = json.load(open(sys.argv[1])); out = {}
    for j in jobs:
        src = f"raw/{j['out']}"; key = j["out"][4:-4]; dst = f"../anim/public/vo/{key}.wav"
        sr = sf.info(src).samplerate
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", chain(j["who"], j["out"] in MEMORY, sr), "-ac", "1", "-ar", "48000", dst], check=True)
        a, r = sf.read(dst)
        out[key] = {"file": f"vo/{key}.wav", "text": norm(j["text"]), "dur": round(len(a) / r, 3), "env": envelope(a, r)}
        print(key, out[key]["dur"], j["text"], flush=True)
    json.dump(out, open("../anim/src/vo_pilot.json", "w"), indent=0)
