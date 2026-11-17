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
  # Approved by the founder by ear, Nov 13 ("I prefer voice B for everything"): design B of candidates_oh.py.
  "profh": 'A huge, gentle professor around sixty, hushed airy voice with a soft rasp, medium-low pitch, earnest and a little nervous, always talking like he is in a library.',
  "theo": "A 21-year-old guy, clear mid pitch, quick and confident, a sports commentator's certainty in a quiet voice, slightly nasal, playful.",
  "darnell": 'A gentle man in his thirties, warm mid voice, dreamy and peaceful, speaks slowly and friendly, like a monk who likes video games.',
  "cleaner": 'A brisk woman in her fifties, bright clear voice, quick and casual, a little amused, has seen it all.',
  # Designed Nov 17 for the launch skits, from bible/world.md; the founder judges them by ear in the finished skits.
  "sami": ("A 21-year-old guy, mid pitch, soft, precise and very polite, a tidy careful voice that pronounces every word; "
           "earnest and a little prim, means everything he says, always sounds slightly overdressed."),
  "marcus": ("A 21-year-old Black British guy, deep easy voice, friendly and relaxed, a little slow to react, "
             "warm and sincere; laughs easily."),
  "imane": ("A 20-year-old young woman, low calm alto, dry and level, unimpressed and sensible, the sanest person in the room; "
            "short answers, a tiny hint of amusement."),
  "mum": ("A warm Black British mum in her fifties, rich full voice, loud and loving, delighted by everyone, "
          "talks to grown men like they are still twelve."),
  # Original designs for the pilot "No Pics" (Nov 11), written from the script's character notes.
  "dev": ("A 21-year-old guy on a video call from another city, relaxed low-mid voice, dry and unimpressed, talks while "
          "chewing, unhurried; sounds like a real best friend on the phone at midnight, not a performer."),
  "beanie": ("A tall, pale man in his thirties, very flat and quiet voice, almost no inflection, soft and slightly too close "
             "to the microphone; polite, unsettling, eerie calm."),
}
if __name__ == "__main__":
    torch.set_num_threads(4)
    m = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map="cpu", dtype=torch.float32, attn_implementation="sdpa")
    for j in json.load(open(sys.argv[1])):
        t0 = time.time(); torch.manual_seed(j.get("seed", 7))
        wavs, sr = m.generate_voice_design(text=j["text"], instruct=VOICES[j["who"]] + " " + j.get("note", ""), language="English")
        sf.write("raw/" + j["out"], wavs[0], sr); print(j["out"], round(len(wavs[0]) / sr, 2), "s in", round(time.time() - t0), "s", flush=True)
