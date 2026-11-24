# Stage 2: BOARD (the Board department, and the Model department when something is new)

**How this stage runs:** `engine/studio/departments.md`. The run is the producer: it hands out packets, runs the
gates and writes the locks. It builds nothing and judges nothing by eye.

**Model:** one **Opus** subagent as the Board, given only the packet below. One **Sonnet** subagent per new
character, outfit or prop as the Model department. Readers are fresh **Sonnet** subagents.

**Packet for the Board:** `episodes/<id>/script.md` with its beat sheet, `bible/acting.md`, `bible/director.md`
(Acting: faces first, Acting: bodies), `bible/craft-library.md`, `bible/anti-slop.md` (section 1), and the names in
the registries: `SETS` (sets, cameras, marks) and `HOLDS`, `WEAR`, `FACES` in `studio/anim/src/nw3d/world.ts`,
`engine/studio/cast.json`, `engine/studio/sounds.json`. Not the other skits, not the bible beyond this list.

**Do:**
1. **Model first.** Anyone who speaks or is alone in a shot and is not in `cast.json`, and any new outfit, worn
   piece or prop, goes to the Model department: its entry, a model sheet rendered beside the golden cast, and the
   blind model read. Pass adds it to `cast.json`. A fail is redrawn once; a second fail cuts it from the script.
2. **Board.** The shot list in code (`studio/anim/src/ep/skits/<skit>.ts`): every shot with its line, faces,
   holds, wear, sounds and a one-line viewer read in a comment; the intent ledger in `episodes/<id>/shots.md`.
   Mark scene breaks (one place and time).
3. **Phone screens** as before: each INSERT cites its app source file and matches it 1:1 (`bible/pxi-product.md`).
4. **Voice jobs** as before (`studio/voice/jobs_<id>.json`), each line with its tone and its key word.

**Gate (the producer runs it, not the Board):**
- `cd studio/anim && node out/skit_check.js <skit>` and `node out/story_check.js <skit>` both print `RESULT PASS`
  (build each with esbuild as its header says). Every hit that is meant is written into the spec, not argued:
  `lens: true` for a look to us, `back: true` for a back, `off: "why"` on a line heard from off screen, a ledger row
  for an empty shot. Each of those needs its ledger row.
- The blind beat read from stage 1 still matches (the board did not change a cause).
Two failures: back to stage 1 with the gate's output. Then `BLOCKED`.
**Next:** stage 3.
