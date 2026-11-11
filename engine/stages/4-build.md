# Stage 4: BUILD

**Model:** delegate the build to one **Opus** subagent a scene at a time. The reviewer is one **Sonnet**
subagent. The run itself renders, runs the checks and updates the state.

**Read:** `episodes/<id>/shots.md`, `studio/anim/src/<Id>.tsx`, `bible/qa-checklist.md`, `bible/anti-slop.md`
(sections 1 and 2), `bible/craft-library.md`, `bible/style-lock.md`.

**Do:**
1. Build the remaining S shots first, a scene at a time, drafting only the frames that changed. Then the L shots.
2. Sound: room tone from frame 1, voices on their shots, music and effects synthesised in code as in
   `studio/anim/tools/`. No dead air, no clipping. A flat read of a line is re-performed, not kept.
   Approved voices only, with only the effect written down for that character. No stand-in voice, ever.
3. Render the short cut: `engine/tools/render.sh final <Id> episodes/<id>/<id>-short.mp4`. Then the long cut
   when its shots are done.
4. `engine/tools/render.sh sheet` for the contact sheets, saved in `episodes/<id>/`.
5. `engine/tools/render.sh check` on each cut. A cut with no audio, or a silent one, is not finished.
   The reviewer, as in stage 3, over the whole cut: PASS or FAIL for each shot with the exact fix. It also
   retells the plot from the contact sheet and subtitles alone (the sound-off test in `bible/story.md`). If its
   retelling does not match the Retell line in the script, the cut fails. It also runs the stopwatch test (what
   happened in each 10 seconds), says whether each device read as what it is (a flashback as a flashback), and
   lists any on-screen text that is unneeded, unreadable or has stray characters.
6. Fix what failed, re-render those frames, and run the reviewer once more on the fixed shots only.

7. Compare the faces with the golden frames. Character colours come only from `Character.tsx`.

**Gate:** the cut has sound, it reads with the sound off, `bible/qa-checklist.md` and the accident check pass with no hit, and nothing strange is outside the
ledger. A new kind of defect is added to the checklist and its log in the same run. Two failed reviews: write
`BLOCKED` with the failing shots, and stop.

This stage can take more than one run. If you stop partway, write in `STATE.md` exactly which shots are done.
The short cut may go to stage 5 while the long cut is still being built.
**Next:** stage 5.
