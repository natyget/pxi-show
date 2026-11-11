# THE APPROVED VOICES (founder pick): Qwen3-TTS VoiceDesign (Apache-2.0), original voices designed from text, no actor cloned.
# Every line = the character description (verbatim, below) + a short acting note; torch.manual_seed(7) before each line.
# Run with the qwen venv (/home/user/tools/qwen: qwen-tts 0.1.1 --no-deps, transformers 4.57.3, torch cpu):
#   /home/user/tools/qwen/bin/python perform_qwen.py jobs.json
# jobs.json: [{"who": "nio"|"maya", "role": "dnio"|"dmaya", "text": "...", "note": "acting note", "out": "raw_<key>.wav"}] (written to raw/)
# Then treat with ../clean.py (roles dnio / dmaya, pitch 0).
import sys, json, time, torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
VOICES = {
  "nio": ("A 21-year-old Black American guy, light-skinned, lower-mid pitch, warm and a little husky, quick and animated like "
          "the lead of a cartoon comedy; confident, cocky, playful; big swings between deadpan and excited; casual Gen Z delivery."),
  "maya": ("A young woman around 20, bright, sweet and earnest voice, soft and clear, slightly higher pitch, gentle and kind, "
           "a little breathless when excited; sincere and literal, like the kind sidekick in a cartoon."),
}
if __name__ == "__main__":
    torch.set_num_threads(4)
    m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32, attn_implementation="sdpa")
    for j in json.load(open(sys.argv[1])):
        t0 = time.time(); torch.manual_seed(j.get("seed", 7))
        wavs, sr = m.generate_voice_design(text=j["text"], instruct=VOICES[j["who"]] + " " + j.get("note", ""), language="English")
        sf.write("raw/" + j["out"], wavs[0], sr); print(j["out"], round(len(wavs[0]) / sr, 2), "s in", round(time.time() - t0), "s", flush=True)
