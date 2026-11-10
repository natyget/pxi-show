# Stage 1: WRITE

**Model:** delegate the writing to one **Opus** subagent, given this card and the files below. Critics are three
**Haiku** subagents. The run itself only runs the lint, checks the gate and updates the state.

**Read:** `bible/humor.md`, `bible/voice-and-dialogue.md`, `bible/pxi-product.md`, `bible/callbacks.md`,
`bible/timeline.md`, `bible/style-lock.md` (the numbers), `engine/playbook.md`, `engine/formats.md` (the row for
this format), `.claude/skills/writers-room/SKILL.md` with its `rubric.md` and `tells.md`, and the premise named
in `STATE.md`. For a holiday, also its row in `engine/calendar.md`.

**Do:** run the writers' room skill, stages 2 to 6, on that premise. Write one file, `episodes/<id>/script.md`:

```
# <id> "<Title>"
True thing: <one sentence, never spoken>
PXI engine: <feature> · Want: … · Flaw: … · Cost: …
After watching, a viewer would: <the PXI behaviour this models, in one line>
Sets: <existing sets> · New: <at most one set, three props>

## Beats
<5 to 7 beats for the short cut, each caused by the one before; extra beats for the long cut marked LONG>

## Script
NAME: spoken line
(action, take or hold, on its own line)
INSERT: what the phone shows, in the app's exact words
[LONG] in front of anything that is only in the long cut

## Tag
<Nio to the viewer, after the button, 5 seconds at most. The PXI ask, in his voice.>
```

Then:
1. `python3 engine/tools/script_lint.py episodes/<id>/script.md` and fix every FAIL.
2. Read the script with every `[LONG]` line removed. It must be a complete joke with its own opening and button.
3. Three critics in parallel, each given only the Script section and its brief from the skill (Skeptic, Literal
   Viewer, Nine-Year-Old). They quote lines and score. They do not rewrite.
4. Punch-up: fix only what was flagged. Score with `rubric.md`. Run the lint again.

**Gate:** lint has no FAIL, rubric 38/50 or more, no critic scored "actually funny" under 3, and the short cut
stands alone. One more round with fresh critics is allowed. If it fails again, write `BLOCKED` in `STATE.md`
with the critics' three weakest lines quoted, and stop.

**Leave behind:** `script.md` only. Cut jokes go in `episodes/<id>/candy-bag.md`. No drafts.
**Next:** stage 2.
