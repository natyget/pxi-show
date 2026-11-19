# The studio: departments, packets and gates

Founder, Nov 19, 4:59 PM (word for word in `bible/show-bible.md`): the engine "should be self [supervised] each step
of generation instead of trying something and hoping it passes review", and animation should be made "by agents
... like a real studio": key frames for one scene by one agent, the in-betweens by another, another team on the
next scene.

This page is that. It replaces "one thread builds the whole skit, renders it, and the stranger finds out".

## Why the old line failed (measured, Nov 19)

- **The world check passed all four launch skits** (`tools/skit_check.ts`: One Sip, Wave Back, Group Photo, Aux, all
  PASS) **and the stranger failed all four.** It checks one shot at a time. Every failure the stranger named lives
  between shots: who said a line, what changed off screen, who is looking at us, who is not on a model sheet.
- **The new story check** (`studio/anim/tools/story_check.ts`), run on the same four cut files with nothing changed,
  finds the stranger's failures before a single frame is drawn: Wave Back's "You never went to camp" over a phone
  screen, Marcus and Tobi speaking off screen and off model; One Sip's last line off screen, the coat put on with his
  back to us and the glove that appears between shots; Group Photo's empty skyline at 47 s; Aux's lines said by
  people with their backs to us and the party hats that appear between shots. Full output: `engine/studio/proof-nov19.md`.
- **Sound was judged only in the final mix.** The new sound check (`engine/tools/sound_check.py`) listens to each
  effect alone: 18 of the 30 synthesised skit sounds are not heard as what they are. The put-back pop is heard as a
  beep, the mower as a helicopter, the splash as an explosion, the dinner bed as a ding, the roof wind as an
  eruption, the creak as a fart. Those are the exact stretches the stranger flagged.
- **Remakes were rewritten from scratch.** Nothing recorded which shots had passed, so each version changed
  everything. Now each passed gate writes a lock, and a remake may only change the shots a note names.
- **Text cold reads passed scripts the videos then failed.** The script is read with the writer's intentions in the
  reader's head. Now the first blind read is of pictures (the key frames), not of words.

## The rule of the line

1. **Each department is a fresh agent with a packet**: only the files its row below lists. It never sees the
   whole episode, the bible, or another department's notes. A small context is the cure for hallucination.
2. **Each department writes one output of a fixed shape**, and a **gate** checks it before the next department
   starts. A gate is a tool (exit code 0) or a blind reader (a fresh agent that gets only what a viewer would at
   that step). The department never grades its own work.
3. **Two tries per gate, then it goes back one department** with the gate's words. Two returns: `BLOCKED`.
4. **Each passed gate writes a lock** (`node out/story_check.js <skit> --snapshot episodes/<id>/lock/<step>.json`).
   Later departments may not change a locked shot. A remake after a note runs
   `--lock episodes/<id>/lock/final.json --allow <the shots the note names>` and fails on anything else that moved.
5. **Only registered things.** Characters on a passed model sheet (`engine/studio/cast.json`), sounds that pass the
   sound check with a row in `engine/studio/sounds.json`, sets and props in `world.ts`. A new thing goes through the
   Model or Sound department first, never straight into a shot.
6. **A miss becomes a check.** When the stranger finds something every gate passed, the producer adds a check for it
   to the gate that should have caught it (a line in `story_check.ts`, `sound_check.py`, or a question for a
   reader), in the same run. The stranger should end up with nothing to find.

## The departments

The **producer** is the run itself. It splits the skit into scenes (one place and time, usually 4 to 10 shots),
hands out packets, runs every gate, writes the locks and `STATE.md`. It builds nothing and judges nothing by eye.

| # | Department | One agent per | Packet (all it gets) | Output | Gate |
|---|---|---|---|---|---|
| 1 | **Story** (writers' room) | skit | the skill `.claude/skills/writers-room/`, the premise | `script.md` and the **beat sheet**: per beat, who wants what, what causes it, and what is ON SCREEN that shows the cause | **Blind beat read**: a fresh reader gets only the on-screen column and says, per beat, who wants what and why it happened. Must match the want and cause columns |
| 2 | **Board** | skit | the beat sheet, `bible/acting.md`, the world registries (names only: sets, cameras, marks, cast, holds, wear, sounds) | the shot list in code (`src/ep/skits/<skit>.ts`) with every line, face and sound placed, and the intent ledger | `skit_check` (world) and `story_check` both PASS. Every remaining hit is a deliberate choice written into the spec (`lens: true`, `back: true`, a line's `off: "why"`) and the ledger |
| 3 | **Model** | new character, outfit or prop | the golden cast sheet, the new thing's spec | its entry in `characters.ts` / `people.ts` and a model sheet render beside the golden cast | **Blind model read**: "is anyone here from a different show? anything broken, glued on or blocky?" Pass adds it to `cast.json` |
| 4 | **Keys** | scene | that scene's shots and beats only | the key poses: first frame, every face change, every line's key word; rendered as the **animatic** (one still per key with the subtitle under it, silent) | `story_check` on the scene, then the **blind animatic read**: a fresh reader gets only the stills and subtitles and says, per line, who says it and to whom, and per beat what caused it. Must match the beat sheet. Pass writes `lock/keys.json` |
| 5 | **In-betweens** | scene, a different agent from its Keys | the scene's shots, the keys lock, `bible/acting.md` | timing between keys: holds, snaps, blinks, gestures, walks, the acting pass | `story_check --lock lock/keys.json` (no key may move), world check, `dead_check.sh` on the scene draft, and a **blind motion read** of the scene's half-size contact sheet: "is anyone stiff, bobbing, sliding, or broken?" |
| 6 | **Voice** | skit | the lines, acting notes, `bible/characters.md` voice rows | takes, picked by tone | `voice_check.py`, `tone_check.py`, `accents.py` (key word lands), as now |
| 7 | **Sound** | skit | the shot list, `sounds.json`, the scene drafts | beds and effects placed per shot | `sound_check.py` on every key used (each heard as itself, nothing on the bad list); every effect's `source` is on screen in its shot; `audio_tags.py` on each scene mix flags nothing; no bed under a line |
| 8 | **Finish** | skit | the locked scenes | the one full render, cover, subtitles | `render.sh check`, `text_check.py`, `av_check.sh`, then **the stranger** (`engine/reviewer.md`) as the last gate, unchanged. Pass writes `lock/final.json` |

Scenes run in parallel: while the In-betweens agent works scene 1, a Keys agent can start scene 2. Continuity across
scenes is the story check's job (it follows every costume piece and every speaker across cuts), not a person's
memory.

## The blind readers

A reader is a fresh **Sonnet** agent with the brief below and only its pictures and text: no script header, no
premise, no beat sheet, no intent. The producer compares the answers with the beat sheet. The reader is never told
what it should have seen, and is never re-run with more context.

> You are a viewer who has never seen this show. Here are [still frames with subtitles | a contact sheet | a model
> sheet]. Answer plainly; "not sure" counts as no. (1) For each subtitle, who in the picture says it, and to whom?
> (2) What does each person want? (3) For each thing that changes, what did you SEE cause it? (4) Is anyone looking
> at you, broken, off-model, or doing nothing? (5) The first moment you were lost.

Readers are cheap (stills, not video) and early (before the expensive parts). A failed animatic costs a few
stills, not a full render and a stranger round.

## Models

Producer and readers: Sonnet. Story: the writers' room as its card says. Board, Keys and In-betweens: Opus, a scene
at a time. Model, Voice, Sound: Sonnet. Never the top model in a scheduled run.
