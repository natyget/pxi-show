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
    wavs, sr = m.generate_voice_design(text=text, instruct=V[j["who"]] + " " + j["note"], language="English")
    sf.write("raw/" + j["out"], wavs[0], sr); print(j["out"], round(len(wavs[0]) / sr, 2), "s in", round(time.time() - t0), "s", flush=True)
