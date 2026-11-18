# Stage 1: WRITE

**Model:** delegate the writing to one **Opus** subagent. Its brief is `bible/writers-room.md`, word for word,
followed by this card and the premise. It takes on that role and stays in it. The table read
(`engine/script-reviewer.md`) is three **Haiku** subagents. The run itself only runs the lint, checks the gate and
updates the state.

**Read (the writer):** `.claude/skills/writers-room/SKILL.md` (the seven principles, which win over every other
file) and its `tells.md`; then `bible/characters.md` (skip the voice recipe), `bible/voice-and-dialogue.md`,
`bible/world.md`, `bible/three-shows.md`, `bible/gumball-style.md`, `bible/humor.md`, `bible/story.md` (sections
2 to 4), `bible/pxi-product.md`, `bible/callbacks.md`, `bible/timeline.md`, `engine/playbook.md`, the row for this
format in `engine/formats.md`, and the premise named in `STATE.md`. If the premise says `From: R<n>`, that story
in `engine/real-stories.md`. For a holiday, its row in `engine/calendar.md`. No slang in the early episodes
(founder, Nov 13, in `bible/three-shows.md`).

**First, the founder's orders and funny log** (Nov 17). Read `engine/episode-orders.md` and `engine/funny-log.md`
before anything else. If an order is open, the oldest one is this episode's premise, in place of the one in
`STATE.md`: build it around every element it names, and mark it `DONE: <id>` when the script passes. Every script
uses at least one funny-log entry not yet used, as a mechanism (why it is funny), never word for word, and marks it
`USED BY: <id>`.

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
<the joke in one plain line, as a funny 22-year-old would post it. PACKAGE adds the search line
(`engine/captions.md`)>

## Screen text
<every piece of text the show itself puts on screen or on the cover, one a line. Not the app's own wording.>
```

Then:
0. **Freshness check.** List the main props, places and jokes of the last ten scripts (`episodes/`, including
   `episodes/season-1/episodes.md`) and the slop list in `bible/anti-slop.md` section 5. Nothing in the new script may
   repeat them, unless it is a callback named in `bible/callbacks.md`.
1. `python3 engine/tools/script_lint.py episodes/<id>/script.md` and fix every FAIL.
2. Read the script with every `[LONG]` line removed. It must be complete, with its own opening and way out.
3. **The table read** (`engine/script-reviewer.md`): the cold reader, the ear and the room, in parallel.
4. Punch-up by the writer, in role: fix only what the readers quoted. Run the lint again. Then a fresh table read.

**Gate:** the table read passes, as `engine/script-reviewer.md` defines it, and the short cut stands alone. A
second FAIL is `BLOCKED` in `STATE.md` with the readers' quoted lines, and the run stops.

**What the founder sees** (founder, Nov 17): the founder does not read scripts. A story goes to the founder as a
quick visual story sketch: rough drawn panels with the line under each, made from the script as a `SKITS`-style
page (template: `episodes/skits/launch-skits.html`; each panel has a background, figures with who, x, face and
arms, a caption and the lines) and published as an artifact. `script.md` stays internal.

**Leave behind:** `script.md` only. Cut jokes go in `episodes/<id>/candy-bag.md`. No drafts.
**Next:** stage 2.
