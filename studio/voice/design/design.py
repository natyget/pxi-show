# Original voices designed from a text description (Qwen3-TTS VoiceDesign, Apache-2.0). No actor is cloned.
import torch, soundfile as sf, sys, time
from qwen_tts import Qwen3TTSModel
torch.set_num_threads(4)
m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32, attn_implementation="sdpa")
NIO = ("A 21-year-old Black American guy, light-skinned, lower-mid pitch, warm and a little husky, quick and animated like "
       "the lead of a cartoon comedy; confident, cocky, playful; big swings between deadpan and excited; casual Gen Z delivery.")
MAYA = ("A young woman around 20, bright, sweet and earnest voice, soft and clear, slightly higher pitch, gentle and kind, "
        "a little breathless when excited; sincere and literal, like the kind sidekick in a cartoon.")
jobs = [
  ("nio_a", NIO, "If you go to one thing a minute, which is easy, because a thing is just a room with people in it, I can get forty-seven before my dryer's done."),
  ("nio_b", NIO, "That's my building. It's a short one!"),
  ("nio_c", NIO, "FORTY-SEVEN!"),
  ("maya_a", MAYA, "Nio, that's a fish."),
  ("maya_b", MAYA, "Was that the whole pottery class?"),
  ("maya_c", MAYA, "I didn't."),
]
for name, ins, text in jobs:
    t0 = time.time()
    wavs, sr = m.generate_voice_design(text=text, instruct=ins, language="English")
    sf.write(f"{name}.wav", wavs[0], sr); print(name, round(len(wavs[0]) / sr, 2), 's audio in', round(time.time() - t0), 's', flush=True)
