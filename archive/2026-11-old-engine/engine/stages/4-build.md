# Stage 4: BUILD (In-betweens per scene, Sound, Finish)

**How this stage runs:** `engine/studio/departments.md`. Each scene's motion is made by an In-betweens agent that
is not the scene's Keys agent; the keys are locked and may not move.

**Model:** one **Opus** subagent per scene as In-betweens. One **Sonnet** subagent as Sound. Fresh **Sonnet**
readers. The run is the producer: it renders, runs every gate and writes the locks.

**Packets:**
- In-betweens: the scene's shots, `episodes/<id>/lock/keys.json`, `bible/acting.md`, `bible/qa-checklist.md`.
- Sound: the shot list, `engine/studio/sounds.json`, the scene drafts' contact sheets.

**Do:**
1. **In-betweens**, a scene at a time: holds, snaps, blinks, gestures, walks, timing. Draft the scene at half size
   (`engine/tools/render.sh draft`), then the producer runs, in order:
   `node out/story_check.js <skit> --lock episodes/<id>/lock/keys.json` (no key moved; In-betweens may add frames
   and acting, not change a key), the world check, `engine/tools/dead_check.sh` on the draft, and the blind motion
   read of the scene's contact sheet ("anyone stiff, bobbing, sliding, broken, or looking at you?").
2. **Voice** as before: `voice_check.py`, `tone_check.py`, `accents.py`.
3. **Sound**: only keys with a row in `sounds.json` that pass `engine/tools/sound_check.py <keys>` on their own.
   Every effect's `source` is on screen in the shot it plays in. No bed under a line louder than the line.
   A sound that fails is remade or replaced, never mixed lower to hide it. Then `audio_tags.py` on each scene mix:
   nothing flagged.
4. **Finish**: the one full render (`render.sh final`), cover, `render.sh check`, `text_check.py`, `av_check.sh`,
   then the stranger (`engine/reviewer.md`), unchanged, as the last gate.
5. Pass: `node out/story_check.js <skit> --snapshot episodes/<id>/lock/final.json`.

**Gate:** every scene's gates pass, the sound check passes for every key used, and the stranger passes.
**When the stranger fails something every gate passed**, the producer writes a check for it into the gate that
should have caught it (`story_check.ts`, `sound_check.py`, or a reader question) in the same run, and the fix is
made by the department that owns it. A remake after a founder or stranger note runs
`node out/story_check.js <skit> --lock episodes/<id>/lock/final.json --allow <the shots the note names>`: anything
else that moved is put back. Two failed gates in a row: `BLOCKED` with the failing shots.

This stage can take more than one run. Write in `STATE.md` which scenes are locked.
**Next:** stage 5.
