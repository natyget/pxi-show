# Retake a designed-voice line that recognition hears wrong. Keeps seed 7 (timbre) and varies only the acting note.
import sys, json, re, subprocess, torch, soundfile as sf
sys.path.insert(0, 'design')
from qwen_tts import Qwen3TTSModel
from perform_qwen import VOICES
from clean import chain, norm
torch.set_num_threads(4)
m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32, attn_implementation="sdpa")
TAILS = ["", " Say only the words, no sigh or sound before them.", " Start right on the first word.", " Clean read, exactly these words."]
jobs = {j["out"][4:-4]: j for j in json.load(open(sys.argv[1]))}
for key in sys.argv[2:]:
    j = jobs[key]
    for i, tail in enumerate(TAILS[1:], 1):
        torch.manual_seed(7)
        wavs, sr = m.generate_voice_design(text=j["text"], instruct=VOICES[j["who"]] + " " + j["note"] + tail, language="English")
        sf.write(f"raw/{key}.t{i}.wav", wavs[0], sr); print(key, i, round(len(wavs[0]) / sr, 2), flush=True)
