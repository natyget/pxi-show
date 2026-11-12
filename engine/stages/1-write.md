# Stage 1: WRITE

**Model:** delegate the writing to one **Opus** subagent. Its brief is `bible/writers-room.md`, word for word,
followed by this card and the premise. It takes on that role and stays in it. Critics and the cold reader are
**Haiku** subagents. The run itself only runs the lint, checks the gate and updates the state.

**Read (the writer):** `bible/writers-room.md` first, then `bible/characters.md` (who they are; skip the voice
recipe), `bible/world.md`, `bible/gumball-style.md`, `bible/humor.md`, `bible/voice-and-dialogue.md`, `bible/story.md`,
`bible/gumball-lens.md`,
`bible/pxi-product.md`, `bible/callbacks.md`, `bible/timeline.md`, `engine/playbook.md`, `engine/formats.md`
(the row for this format), `.claude/skills/writers-room/SKILL.md` with its `rubric.md` and `tells.md`, and the
premise named in `STATE.md`. If the premise says `From: R<n>`, that story in `engine/real-stories.md`. For a
holiday, its row in `engine/calendar.md`.

**Do:** run the writers' room skill on that premise. Write one file, `episodes/<id>/script.md`:

```
# <id> "<Title>"
Type: <Lore | Standalone | Experiment | Dream> · Tone: <Funny | Wholesome | Eerie | Sad>
Kind: <the kind of story from bible/gumball-style.md section 2, or the machine from bible/gumball-lens.md>
From life: <the real embarrassment or story this starts from>
Logline: Nio wants <X>, but <Y weird thing> happens, and he responds by <Z>.
Nio's game: <who he is playing with, what the game is, and the moment it stops being a game>
Retell: <the episode in one sentence a viewer would say to a friend>
Want: <a goal the camera can see> · Why tonight: <the clock>
Ego: <whose pride, itch or certainty causes it> · Theory: <the confident wrong thing said in the first quarter>
Feeling: <the one real feeling, hit once, never spoken>
PXI moment: <ENGINE | MOMENT | NONE> <the feature and exactly what he does with it>
Way out: <the reset, the ironic price or the hard cut, within three seconds of the peak>
Strange on purpose: <anything declared for the intent ledger, such as a Kevin or a glitch> or NONE
Callback: <the old joke this pays off, with its episode> or NONE · Plants: <what this leaves for later> or NONE
Laughs: <the three pictures or lines where a stranger laughs, in order>
After watching, a viewer would: <the PXI behaviour this models> (leave out if PXI moment is NONE)
Moves the journey: <the person, place, album or plant that is new after this episode>
From: <R<n> in engine/real-stories.md> or original
Sets: <existing sets> · New: <at most one set, three props>

## Beats
Ordinary moment: … / Itch: … / Theory: … / So 1: … / So 2: … / So 3: … / Tilt: … / Set piece: … /
Real second: … / Out: …
<one line each for the short cut, in the build in `bible/story.md` section 2. Extra beats that are only in the long cut are marked LONG>

## Script
[what we see, in square brackets, including every change of face: [Nio, lit up]]
NAME: spoken line
NAME (over her): a line that cuts in
INSERT: what the phone shows, in the app's exact words
[LONG] in front of anything that is only in the long cut

## Tag
<Nio to the viewer, after the last joke, 5 seconds at most. The PXI ask, in his voice, fun and cute.>

## Caption
<one plain line, then a lore question for the comments>

## Screen text
<every piece of text the show itself puts on screen or on the cover, one a line. Not the app's own wording.>
```

Then:
1. `python3 engine/tools/script_lint.py episodes/<id>/script.md` and fix every FAIL.
2. Read the script with every `[LONG]` line removed. It must be complete, with its own opening and way out.
3. **The cold read.** One Haiku subagent given only the short-cut Script section. It answers in a line each:
   who is this, what did he want, what happened, what was the strange thing and did anyone mind, what did he
   feel at the end, where did you laugh (quote it), would you send it and to whom. Compare with the header.
   "Not sure" on what he wanted or what happened is a fail. No laugh quoted is a fail. Fix the script, not the
   header.
4. Three critics in parallel, each given only the Script section and its brief from the skill (Skeptic, Literal
   Viewer, Nine-Year-Old). They quote lines and score. They do not rewrite.
5. Punch-up by the writer, in role: fix only what was flagged, then the Nio pass (the eight checks at
   the bottom of `bible/voice-and-dialogue.md`) and the ten questions at the end of `bible/writers-room.md` and the ten checks at the end of
   `bible/gumball-style.md`. Score with `rubric.md`. Run the lint again.

**Gate:** the cold read matches the header and quotes a laugh; lint has no FAIL; rubric 40/55 or more with no
veto; the short cut stands alone. One more round with fresh critics is allowed. If it fails again, write
`BLOCKED` in `STATE.md` with the critics' three weakest lines quoted, and stop.

**Leave behind:** `script.md` only. Cut jokes go in `episodes/<id>/candy-bag.md`. No drafts.
**Next:** stage 2.
