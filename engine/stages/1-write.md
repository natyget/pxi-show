# Stage 1: WRITE

**Model:** delegate the writing to one **Opus** subagent, given this card and the files below. Critics are three
**Haiku** subagents. The run itself only runs the lint, checks the gate and updates the state.

**Read:** `bible/story.md`, `bible/humor.md`, `bible/voice-and-dialogue.md`, `bible/pxi-product.md`, `bible/callbacks.md`,
`bible/timeline.md`, `bible/style-lock.md` (the numbers), `engine/playbook.md`, `engine/formats.md` (the row for
this format), `.claude/skills/writers-room/SKILL.md` with its `rubric.md` and `tells.md`, and the premise named
in `STATE.md`. For a holiday, also its row in `engine/calendar.md`.

**Do:** run the writers' room skill, stages 2 to 6, on that premise. Write one file, `episodes/<id>/script.md`:

```
# <id> "<Title>"
Retell: <the episode in one sentence a viewer would say to a friend>
Problem: <one the viewer has had this month> · Want: <a goal the camera can see> · Stakes and clock: …
PXI answer: <the feature that is his plan> · Turn: … · Flaw: … · Cost: …
Point: <what the viewer feels at the end, and what is different in Nio's world>
True thing: <one sentence, never spoken>
Hook: <the picture in the first three seconds>
After watching, a viewer would: <the PXI behaviour this models, in one line>
Moves the journey: <the person, place, album or stamp that is new after this episode>
Sets: <existing sets> · New: <at most one set, three props>

## Beats
<5 to 7 beats for the short cut in the shape of `bible/story.md` section 2: hook, problem and want by 5 s,
plan by 10 s, three steps, turn, payoff. Each caused by the one before. Extra beats for the long cut marked LONG>

## Script
NAME: spoken line
(action, take or hold, on its own line)
INSERT: what the phone shows, in the app's exact words
[LONG] in front of anything that is only in the long cut

## Tag
<Nio to the viewer, after the button, 5 seconds at most. The PXI ask, in his voice.>

## Screen text
<every piece of text the show itself puts on screen or on the cover, one a line. Not the app's own wording.>
```

Then:
1. `python3 engine/tools/script_lint.py episodes/<id>/script.md` and fix every FAIL.
2. Read the script with every `[LONG]` line removed. It must be a complete joke with its own opening and button.
3. **The cold read.** One Haiku subagent given only the short-cut script, with the header removed. It answers
   in a line each: who is this, what does he want, why does it matter, what is the plan, what happened, what
   was the point, would you send it and to whom. Compare with the header. Any mismatch or "not sure" is a fail:
   fix the script, not the header.
4. Three critics in parallel, each given only the Script section and its brief from the skill (Skeptic, Literal
   Viewer, Nine-Year-Old). They quote lines and score. They do not rewrite.
5. Punch-up: fix only what was flagged. Score with `rubric.md`. Run the lint again.

**Gate:** the cold read matches the header, lint has no FAIL, rubric 38/50 or more, no critic scored "actually
funny" under 3, and the short cut stands alone. One more round with fresh critics is allowed. If it fails again, write `BLOCKED` in `STATE.md`
with the critics' three weakest lines quoted, and stop.

**Leave behind:** `script.md` only. Cut jokes go in `episodes/<id>/candy-bag.md`. No drafts.
**Next:** stage 2.
