import sys, json, torch, soundfile as sf
from chatterbox.tts import ChatterboxTTS
torch.set_num_threads(4)
m = ChatterboxTTS.from_pretrained(device="cpu")
jobs = json.load(open(sys.argv[1]))
for j in jobs:
    torch.manual_seed(j.get("seed", 1))
    w = m.generate(j["text"], audio_prompt_path=f"ref_{j['who']}.wav", exaggeration=j.get("ex", 0.75), cfg_weight=j.get("cfg", 0.35), temperature=j.get("temp", 0.8))
    sf.write(j["out"], w.squeeze(0).numpy(), m.sr); print(j["out"], w.shape[-1] / m.sr, flush=True)
