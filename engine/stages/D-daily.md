# Stage D: DAILY (one cheap release a day)

**Model:** the run itself (Sonnet). The stranger is one **Sonnet** subagent. No Opus.

Makes the one LOOP, STILL, FOURTH WALL or FILLER the Queue names for tomorrow. Never an episode.

**Read:** `engine/formats.md` (the row for this format), `engine/playbook.md`, `bible/craft-library.md` (Words on
screen, The same people, Thumbnails), `engine/reviewer.md`, and the `script.md` and `shots.md` of the source
episode. For a FOURTH WALL or FILLER, also `bible/characters.md` (who they are), `bible/voice-and-dialogue.md` and
`bible/pxi-product.md`.

**Do:**
1. LOOP or STILL: cut it from frames the source episode already rendered. No new animation.
   FOURTH WALL or FILLER: existing sets and rigs only, three shots at most, the designed voices only, 25 seconds at
   most. Nio is alive in it: at least two clearly different faces, and he talks like himself, not like an advert. Write its lines in `episodes/<id>/daily-<date>.md` and run `engine/tools/script_lint.py` on it.
2. Write the caption and any on-screen words by the friend test. Make the cover.
3. `engine/tools/render.sh check` on any video. Then the stranger. One fix and one re-run at most.
4. Add the piece to `episodes/<id>/post.md` with its tags for the learning ledger.

**Gate:** the stranger passes it and the founder approves it (or has allowed cheap formats to schedule without
asking, recorded in `STATE.md`). If it fails twice, post nothing today and say why. An empty day is better than
a weak post.
