# Stage 3: PROOF

**Model:** delegate the build to one **Opus** subagent, given this card and the files below. The reviewer is one
**Sonnet** subagent that sees only what step 3 lists.

Build only the shots marked PROOF in `shots.md`, at full quality. This is the test of whether the piece plays
before the rest is built.

**Read:** `episodes/<id>/shots.md`, `bible/craft-library.md`, `bible/style-lock.md`, `bible/director.md` (Acting), and the composition the
style lock names as the template. Open files in `studio/anim/src/world/` only when you call them.

**Do:**
1. Create `studio/anim/src/<Id>.tsx` from the template and register it in `src/Root.tsx`. Build the PROOF shots.
   If a character rig or a worn item changed, run the rig check first (`bible/anti-slop.md`, section 3).
2. Iterate with `engine/tools/render.sh draft <Id> <from-to>`. At most four draft rounds.
3. `engine/tools/render.sh sheet`, then the reviewer, given only: the contact sheet, the lines for those shots,
   the Intent ledger, sections 1 and 2 of `bible/anti-slop.md`, and the golden frames. It answers three
   questions: which accident-check items fail, what is strange that is not in the ledger, and at which second a
   viewer laughs. The PROOF shots must include the first ten seconds, so the reviewer also says, from the
   pictures and subtitles alone, who this is and what he wants. If it cannot, that is a fail.
4. `engine/tools/render.sh check` on the clip. It must have sound, in the approved voices only. If the approved
   voice cannot be made in this session, stop as `BLOCKED`. Never use a stand-in voice.

**Gate:** the accident check is clean, nothing strange is outside the ledger, the frames match the golden
frames, and the reviewer names a second where a viewer laughs. Clean but not funny is a script failure: set the
stage back to 1 with the reviewer's reason, and stop. Two failures on quality: write `BLOCKED` and stop.

**Report:** attach the proof clip and the contact sheet.
**Next:** stage 4.
