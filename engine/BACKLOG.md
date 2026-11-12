# Engineering backlog

Work the line needs that is building, not judgment. Each item names the model that should do it and how to know
it is done. Do these in a normal thread, one item at a time. None of it needs the top model.

| # | Item | Model | Done when |
|---|---|---|---|
| 1 | **Rig sheet.** A `RigCheck` composition and `engine/tools/render.sh rig`: each character from eight angles, each expression, standing and sitting, with every worn item, on one sheet per character | Opus | The sheet renders in under two minutes and a deliberately misplaced hat is visible on it |
| 2 | **Picture and sound check.** `engine/tools/av_check.sh <video>`: black frames, frozen frames, silence at the start, clipping, loudness, using ffmpeg's detectors | Sonnet | It prints PASS or FAIL with timestamps, and fails on a test clip with one second of black |
| 3 | **Golden frame compare.** `engine/tools/golden.sh <Comp>`: render the frames named in `bible/style-lock.md` beside their golden stills as one image | Sonnet | One side-by-side image per golden frame |
| 4 | **Short-cut render.** A `cut` prop on the episode composition so the short cut and the long cut come from one file, and `render.sh final` takes `--cut short|long` | Opus | Both cuts render from the pilot's file, and the short cut plays as a complete piece |
| 5 | **Voice setup.** `engine/setup.sh` that installs Qwen3-TTS VoiceDesign exactly as pinned in `bible/characters.md`, and a `voice.sh <jobs.json>` wrapper that takes a line, a character and an acting note | Sonnet | A fresh session produces one line of Nio from a jobs file with two commands, with the walkie-talkie colour, at −16 LUFS |
| 6 | **Loop and still export.** `render.sh loop <Comp> <from-to>` to a seamless GIF and mp4, and `render.sh still` at cover size | Sonnet | A two-second take exports as a loop that does not jump |
| 7 | **Metricool pull.** A short, fixed procedure in `engine/stages/L-learn.md` naming the exact Metricool tools and fields for each metric in `engine/learning.md` | Sonnet | One LEARN run fills a ledger row for a real post without exploring the connector |
| 8 | **Default branch.** Make `main` the default branch so scheduled runs can save state to it | The founder, in GitHub settings | The scheduled run's state shows up on `main` |
| 9 | **Environment.** A setup script for the scheduled runs' environment: `npm ci` in `studio/anim`, ffmpeg, the voice tools | Sonnet | A scheduled run reaches a draft render without installing anything |
| 10 | **Text check.** `engine/tools/text_check.py`: collect every string a composition draws (subtitles, stamps, screens) and fail on any character the pixel font lacks, on stray characters after numbers, and on text held for less than the reading time in `bible/craft-library.md` | Sonnet | It fails on a subtitle with a missing glyph and on a 0.5 s text, and passes the fixed pilot |
| 11 | **Voice lock.** One wrapper that makes lines only with the approved voice settings in `bible/characters.md`, writes which settings made each file, and refuses to run if the approved tool is missing | Sonnet | A line made any other way is rejected by `render.sh check` |
| 12 | **Device kit.** Reusable components for the library's devices: `Flashback` (grade, grain, vignette, stamp, transition and sound in one wrapper), `Thought`, `ToViewer`, `Hold` | Opus | Wrapping any shot in `Flashback` gives the full treatment with no per-shot work |
| 13 | **Look.** Finer pixel size on close-ups, shaped hands (palm, thumb, tapered bending fingers) in the rig, and a high-bitrate export preset | Opus | The rig sheet shows hands that are not cylinders and a close-up with smooth curves |
| 14 | **Cover render.** `render.sh cover <Comp> <frame>` at vertical and horizontal sizes | Sonnet | Both covers come out of one command |
| 15 | **Expression sheet.** Named expressions for each character in the rig (lit up, smug, trolling, crushed, bored, caught, sincere, dead-eyed, and more), pushed big and asymmetrical, with the lids always over the eye white; shown on the rig sheet | Opus | The sheet shows twelve clearly different faces per character and no lid behind an eye |
| 16 | **Acting kit.** Remove every idle bob from the rigs. Add pose-to-pose helpers: a snap move with squash and settle, anticipation, a held pose with blinks, `face(name, atFrame)` that changes the face a few frames before a line | Opus | A two-line exchange built with the kit shows no looping motion and a face change before each line |
| 17 | **Glitch button and Kevin (on hold: unconfirmed with the founder).** A `GlitchButton` component with the three declared breaks and its sound, and a board check that the Kevin is in the first wide shot | Opus | Any episode ends on the button with one line of code |
| 18 | **Dead-shot check.** `engine/tools/dead_check.sh <video>`: flag any stretch over 1.2 s where almost nothing in the frame changes, and any gap between lines over 1 s that is not a marked hold | Sonnet | It flags a test clip with a two-second static wall |

Note, Nov 11: the look is being redesigned and no rig is chosen. Items 1, 3, 12, 13, 15, 16 and 17 depend on the
rig and wait for that choice. The others can start now.
