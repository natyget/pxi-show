# Engineering backlog

Work the line needs that is building, not judgment. Each item names the model that should do it and how to know
it is done. Do these in a normal thread, one item at a time. None of it needs the top model.

| # | Item | Model | Done when |
|---|---|---|---|
| 1 | **Rig sheet.** A `RigCheck` composition and `engine/tools/render.sh rig`: each character from eight angles, each expression, standing and sitting, with every worn item, on one sheet per character | Opus | The sheet renders in under two minutes and a deliberately misplaced hat is visible on it |
| 2 | **Picture and sound check.** `engine/tools/av_check.sh <video>`: black frames, frozen frames, silence at the start, clipping, loudness, using ffmpeg's detectors | Sonnet | It prints PASS or FAIL with timestamps, and fails on a test clip with one second of black |
| 3 | **Golden frame compare.** `engine/tools/golden.sh <Comp>`: render the frames named in `bible/style-lock.md` beside their golden stills as one image | Sonnet | One side-by-side image per golden frame |
| 4 | **Short-cut render.** A `cut` prop on the episode composition so the short cut and the long cut come from one file, and `render.sh final` takes `--cut short|long` | Opus | Both cuts render from the pilot's file, and the short cut plays as a complete piece |
| 5 | **Voice setup.** `engine/setup.sh` that installs the voice tools the founder's picked voices need, and a `voice.sh <jobs.json>` wrapper | Sonnet | A fresh session produces one line of Nio from a jobs file with two commands |
| 6 | **Loop and still export.** `render.sh loop <Comp> <from-to>` to a seamless GIF and mp4, and `render.sh still` at cover size | Sonnet | A two-second take exports as a loop that does not jump |
| 7 | **Metricool pull.** A short, fixed procedure in `engine/stages/L-learn.md` naming the exact Metricool tools and fields for each metric in `engine/learning.md` | Sonnet | One LEARN run fills a ledger row for a real post without exploring the connector |
| 8 | **Default branch.** Make `main` the default branch so scheduled runs can save state to it | The founder, in GitHub settings | The scheduled run's state shows up on `main` |
| 9 | **Environment.** A setup script for the scheduled runs' environment: `npm ci` in `studio/anim`, ffmpeg, the voice tools | Sonnet | A scheduled run reaches a draft render without installing anything |
| 10 | **Text check.** `engine/tools/text_check.py`: collect every string a composition draws (subtitles, stamps, screens) and fail on any character the pixel font lacks, on stray characters after numbers, and on text held for less than the reading time in `bible/craft-library.md` | Sonnet | It fails on a subtitle with a missing glyph and on a 0.5 s text, and passes the fixed pilot |
| 11 | **Voice lock.** One wrapper that makes lines only with the approved voice settings in `bible/characters.md`, writes which settings made each file, and refuses to run if the approved tool is missing | Sonnet | A line made any other way is rejected by `render.sh check` |
| 12 | **Device kit.** Reusable components for the library's devices: `Flashback` (grade, grain, vignette, stamp, transition and sound in one wrapper), `Thought`, `ToViewer`, `Hold` | Opus | Wrapping any shot in `Flashback` gives the full treatment with no per-shot work |
| 13 | **Look.** Finer pixel size on close-ups, shaped hands (palm, thumb, tapered bending fingers) in the rig, and a high-bitrate export preset | Opus | The rig sheet shows hands that are not cylinders and a close-up with smooth curves |
| 14 | **Cover render.** `render.sh cover <Comp> <frame>` at vertical and horizontal sizes | Sonnet | Both covers come out of one command |

