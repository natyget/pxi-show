# Stage 2: BOARD

**Model:** the run itself (Sonnet). No subagents.

**Read:** `episodes/<id>/script.md`, `bible/director.md` (Shot grammar and Acting), `bible/style-lock.md`,
`bible/characters.md`, `bible/pxi-product.md`, `bible/anti-slop.md` (section 1), and the header comments of the
files in `studio/anim/src/ui/`.

**Do:**
1. `episodes/<id>/shots.md`, a table: number, seconds, set, framing, the one purpose (geography, emotion,
   reveal, action, detail, insert, button, tag), the beat or line it carries, what the camera does for the joke,
   and S or L for short cut or long-cut only. Mark every take and hold with its length in frames. Track who
   stands where, what is in which hand, and eyelines. Mark with PROOF the 8 to 10 seconds hardest to make play.
2. The **Intent ledger** at the end of `shots.md`, as in `bible/anti-slop.md`. If nothing is strange, say so.
3. Phone screens: for each INSERT, open the one app source file named in `bible/pxi-product.md` and build or
   extend a screen in `studio/anim/src/ui/` that matches it 1:1, with the source path in a comment at the top.
   Render each once with `engine/tools/render.sh still` and look at it.
4. Voice: write `studio/voice/jobs_<id>.json` in the format of the existing jobs files, with an acting note for
   each line. Generate the lines only if the voice tools are installed. If not, say so in the report.

**Gate:** every shot has exactly one purpose; every line fits the seconds of its shot; the S shots alone tell
the short cut; every screen cites its source and matches the app's wording character for character; every
strange thing in the script has a ledger row.
**Next:** stage 3.
