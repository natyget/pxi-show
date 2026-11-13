# Office Hours treatment: the approved chain from clean.py (pitch 0, trim, walkie colour, -16 LUFS, 48 kHz mono),
# plus the lecture-hall PA on Prof H's mic lines (a whisper made to boom by the room: low shelf + big hall echo).
# usage: python treat_oh.py jobs.json manifest_out.json
import sys, json, subprocess, soundfile as sf
import clean
PA = {"raw_oh_01t1.wav","raw_oh_01t2.wav","raw_oh_02t1.wav","raw_oh_02t2.wav", "raw_oh_01.wav", "raw_oh_02.wav", "raw_aud_profh_a_01.wav", "raw_aud_profh_b_01.wav", "raw_aud_profh_c_01.wav"}
PA_FX = ",bass=g=9:f=110,aecho=0.9:0.7:90|180|320:0.45|0.3|0.18,volume=1.4"
jobs = json.load(open(sys.argv[1])); out = {}
for j in jobs:
    src = f"raw/{j['out']}"; key = j["out"][4:-4]; dst = f"../anim/public/vo/{key}.wav"
    who = j.get("role", "d" + j["who"]); clean.PITCH.setdefault(who, 0.0)
    c = clean.chain(who, False, sf.info(src).samplerate)
    if j["out"] in PA: c = c.replace(",apad=", PA_FX + ",apad=")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", c, "-ac", "1", "-ar", "48000", dst], check=True)
    a, r = sf.read(dst)
    out[key] = {"file": f"vo/{key}.wav", "who": j["who"], "text": clean.norm(j["text"]), "sub": j.get("sub", j["text"]), "dur": round(len(a) / r, 3), "env": clean.envelope(a, r)}
    print(key, out[key]["dur"], j["text"], flush=True)
json.dump(out, open(sys.argv[2], "w"), indent=0)
