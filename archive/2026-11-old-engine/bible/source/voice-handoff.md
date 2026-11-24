# Approved voices handoff (founder, Nov 11)

Source text from the founder's message of 2026-11-11, word for word (the founder's own name replaced
with "[the founder]"). Kept for the record. **Runs do not read this folder.** What a run needs from it has been
written into the bible and the stage cards.

---

PXI show voices: handoff
Approved design. The user approved the Qwen3-TTS VoiceDesign voices for Nio and Maya (“new design for nio is nice, also maya design is nice”). They are original voices designed from text. No actor is cloned or imitated.
Model and setup

* Model: Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign (Apache-2.0).
* Venv: `/home/user/tools/qwen`, with `qwen-tts 0.1.1` and the pinned deps (transformers 4.57.3, torch CPU). Don’t run `pip install -U qwen-tts`; it hung for over an hour. Use the pinned wheel and `--no-deps`.
* Load: `Qwen3TTSModel.from_pretrained(..., device_map="cpu", dtype=torch.float32, attn_implementation="sdpa")`.
* Generate: `generate_voice_design(text=..., instruct=<character description> + " " + <acting note>, language="English")` returns `(wavs, sr)`. Set `torch.manual_seed(7)` before each line so the timbre stays consistent.

Character descriptions (the instruct text, verbatim)

* Nio: “A 21-year-old Black American guy, light-skinned, lower-mid pitch, warm and a little husky, quick and animated like the lead of a cartoon comedy; confident, cocky, playful; big swings between deadpan and excited; casual Gen Z delivery.”
* Maya: “A young woman around 20, bright, sweet and earnest voice, soft and clear, slightly higher pitch, gentle and kind, a little breathless when excited; sincere and literal, like the kind sidekick in a cartoon.”

Each line gets its own short acting note on top of these, e.g. “Deadpan, wounded pride, completely serious.”
Treatment (walkie-talkie)

* Script: studio/voice/fx2.py. Roles `dnio` and `dmaya` use pitch shift 0. The old `nio` and `maya` roles (shift −1 and +2) were tuned for the earlier Chatterbox voices and don’t apply here.
* Chain: highpass 280 Hz, lowpass 3500 Hz, bit-crush, vibrato, tanh soft clip, then loudnorm I=−16.
* Output: `public/vo/<key>.wav` at 48 kHz mono, plus a 12 fps mouth envelope merged into src/audio.json.
* Run it with the tts venv: `/home/user/tools/tts/bin/python voice/fx2.py <jobs.json>`, where the JSON is a list of `[src_wav, key, role]`.

Lines generated so far (studio/voice/design/pilot_lines.py, outputs `p_*.wav`, durations in `pilot_lines.json`)

* Maya: “Can you take one of me?”, “That’s your thumb.”, “You can just press the button.”, “Ooh.”, “Who took this?”
* Nio: “That’s a choice.”, “Nobody just presses the button.”, “Everybody quiet.”, “Three.”, “Two.”, “That was the plan.”

Don’t reuse

* The lines in `design.py` (e.g. “It’s a short one!”) and the old Chatterbox and Kokoro picks. The user rejected “It’s a short one!” as corny.
* Anything with “aight” or long “NAH” style delivery. The user rejected both.

Caveat: the user has approved the designs, but not yet heard these specific line deliveries in a rendered cut. Check them against the cut before calling the voices final.
