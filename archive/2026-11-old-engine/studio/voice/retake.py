# Re-perform lines whose take has a stray word or a swallowed start: new seeds until speech recognition hears
# exactly the script (after the clean treatment). Usage: python retake.py jobs_ne.json key1 key2 ...
import sys, json, re, subprocess, torch, soundfile as sf
from chatterbox.tts import ChatterboxTTS
from faster_whisper import WhisperModel
from clean import chain, MEMORY, norm
torch.set_num_threads(4)
tts = ChatterboxTTS.from_pretrained(device="cpu"); asr = WhisperModel('small.en', device='cpu', compute_type='int8')
W = {'200': 'two hundred', '212': 'two hundred and twelve', '40': 'forty', '3': 'three'}
def hear(path):
    t = " ".join(s.text for s in asr.transcribe(path, beam_size=5)[0])
    for k, v in W.items(): t = re.sub(rf"\b{k}\b", v, t)
    return norm(t.replace('-', ' '))
jobs = {j["out"][4:-4]: j for j in json.load(open(sys.argv[1]))}
for key in sys.argv[2:]:
    j = jobs[key]; want = norm(j["text"]); best = None
    for seed in range(2, 12):
        torch.manual_seed(seed)
        w = tts.generate(j["text"], audio_prompt_path=f"ref_{j['who']}.wav", exaggeration=j.get("ex", 0.75), cfg_weight=j.get("cfg", 0.35), temperature=j.get("temp", 0.8))
        raw = f"raw/{j['out']}.s{seed}.wav"; sf.write(raw, w.squeeze(0).numpy(), tts.sr)
        tmp = f"raw/{key}.s{seed}.clean.wav"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", chain(j["who"], j["out"] in MEMORY, tts.sr), "-ac", "1", "-ar", "48000", tmp], check=True)
        got = hear(tmp); print(key, seed, repr(got), got == want, flush=True)
        if got == want: best = seed; break
    if best: subprocess.run(["cp", f"raw/{j['out']}.s{best}.wav", f"raw/{j['out']}"]); j["seed"] = best
    else: print("NO CLEAN TAKE", key)
json.dump(list(jobs.values()), open(sys.argv[1], "w"), indent=1, ensure_ascii=False)
