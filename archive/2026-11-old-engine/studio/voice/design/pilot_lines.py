# Pilot voices: Qwen3-TTS VoiceDesign (Apache-2.0). Same character description every line + a per-line acting note.
import torch, soundfile as sf, time, json
from qwen_tts import Qwen3TTSModel
torch.set_num_threads(4)
m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32, attn_implementation="sdpa")
NIO = ("A 21-year-old Black American guy, light-skinned, lower-mid pitch, warm and a little husky, quick and animated like "
       "the lead of a cartoon comedy; confident, cocky, playful; big swings between deadpan and excited; casual Gen Z delivery.")
MAYA = ("A young woman around 20, bright, sweet and earnest voice, soft and clear, slightly higher pitch, gentle and kind, "
        "a little breathless when excited; sincere and literal, like the kind sidekick in a cartoon.")
lines = [
  ("p_m1", MAYA, "Can you take one of me?", "Casual, friendly, a small ask."),
  ("p_m2", MAYA, "That's your thumb.", "Flat, kind, just stating a fact."),
  ("p_n1", NIO, "That's a choice.", "Deadpan, wounded pride, completely serious."),
  ("p_m3", MAYA, "You can just press the button.", "Patient and sweet, a little tired of holding the pose."),
  ("p_n2", NIO, "Nobody just presses the button.", "Lying on the ground, dead serious, like an artist explaining his craft."),
  ("p_n3", NIO, "Everybody quiet.", "Calm, commanding, a director on a film set."),
  ("p_n4", NIO, "Three.", "Slow, solemn countdown."),
  ("p_n5", NIO, "Two.", "Slow, solemn countdown, slightly worried."),
  ("p_m4", MAYA, "Ooh.", "Pleasantly surprised, soft."),
  ("p_m5", MAYA, "Who took this?", "Amazed, genuinely curious."),
  ("p_n6", NIO, "That was the plan.", "Muffled, from under a pile of wood, calm and certain, not missing a beat."),
]
out = {}
for key, who, text, note in lines:
    t0 = time.time()
    torch.manual_seed(7)
    wavs, sr = m.generate_voice_design(text=text, instruct=who + " " + note, language="English")
    sf.write(f"{key}.wav", wavs[0], sr); out[key] = round(len(wavs[0]) / sr, 2)
    print(key, out[key], 's in', round(time.time() - t0), 's', flush=True)
json.dump(out, open('pilot_lines.json', 'w'))
