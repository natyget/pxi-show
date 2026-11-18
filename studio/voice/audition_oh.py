# Make audition lines for Office Hours candidates and the episode's Nio lines (approved voice) in one model load.
# usage: <qwen venv python> audition_oh.py jobs.json   (jobs: who = nio | a key of CANDIDATES)
import sys, json, time, torch, soundfile as sf
sys.path.insert(0, 'design')
from qwen_tts import Qwen3TTSModel
from perform_qwen import VOICES
from candidates_oh import CANDIDATES
V = {**VOICES, **CANDIDATES}
torch.set_num_threads(4)
m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32, attn_implementation="sdpa")
for j in json.load(open(sys.argv[1])):
    t0 = time.time(); torch.manual_seed(j.get("seed", 7))
    text = j["text"].replace("PXI", "pixie")
    # a cap on how long a line can run (12 codes a second): Qwen sometimes never stops, and an uncapped line ran for
    # ten minutes (Nov 18). Hitting the cap means it ran away: try again on the next seed, at most twice.
    cap = int(12 * (2.5 + 0.11 * len(text)))
    for k in range(3):
        if k: torch.manual_seed(j.get("seed", 7) + k)
        wavs, sr = m.generate_voice_design(text=text, instruct=V[j["who"]] + " " + j["note"], language="English", max_new_tokens=cap)
        if len(wavs[0]) / sr < cap / 12 - 0.6: break
        print(j["out"], "ran away, again", flush=True)
    sf.write("raw/" + j["out"], wavs[0], sr); print(j["out"], round(len(wavs[0]) / sr, 2), "s in", round(time.time() - t0), "s", flush=True)
