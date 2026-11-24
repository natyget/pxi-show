# Stage 3: KEYS (one Keys agent per scene, and the blind animatic read)

**How this stage runs:** `engine/studio/departments.md`. This replaces PROOF: the first test of whether the piece
plays is now a set of stills with subtitles, read by someone who knows nothing, before any motion or sound.

**Model:** one **Opus** subagent per scene as Keys (scenes can run in parallel). One fresh **Sonnet** subagent per
scene as the animatic reader. The run is the producer.

**Packet for a Keys agent:** that scene's shots in `src/ep/skits/<skit>.ts`, that scene's beats from the beat
sheet, `bible/acting.md`, `bible/style-lock.md` (golden frames). Nothing from other scenes except the hand-off
line the producer writes: where each person stands, and what they hold and wear at the cut.

**Do:**
1. Keys sets the key poses of its scene, eyelines first: every speaker faces the person his line is for (`to:` on
   the line when it is not the next speaker), nobody stands between them, and the listener faces him back. Then the first picture of every shot, every face change, and every line's
   key word (faces, facing, gaze, holds, wear, marks). It does not time anything between keys.
2. The producer runs `node out/story_check.js <skit>` (must PASS), then renders the scene's animatic:
   `node tools/animatic.mjs <skit> episodes/<id>/animatic/<scene> --shots <the scene's shots>`.
3. **The blind animatic read.** A fresh reader gets only the animatic sheets and the brief in
   `engine/studio/departments.md` (The blind readers). The producer compares its answers with the beat sheet:
   every line given to the right person, every want and every cause named. Any "not sure" or mismatch fails.
4. Pass: `node out/story_check.js <skit> --snapshot episodes/<id>/lock/keys.json`. The keys are locked.

**Gate:** story check PASS and the animatic read matches the beat sheet, for every scene. A failed scene goes back
to its Keys agent with the reader's words (never with an explanation of what was meant). Two failures: back to
stage 2 for that scene. A beat no picture can make clear goes back to stage 1. Then `BLOCKED`.

**Report:** attach the animatic sheets.
**Next:** stage 4.
