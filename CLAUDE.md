# PXI LABS show: how to work in this repo

This repo makes "Nio World", an animated series (9:16) about Nio and Maya for @pxi.app, written through a
Gumball lens, with Nio's app PXI in it wherever it fits. It ships as episodes with a short cut and a long cut,
plus cheaper formats between episodes, so that there is a post every day and a long video every week. The standing order is `engine/DIRECTIVE.md`. You do not need to read it for a normal run:
this page and one stage card carry what you need.

## Every run, in this order

1. Read `engine/STATE.md`. It names the phase, the episode, the stage and the next action.
2. Read the one stage card it points to in `engine/stages/`, and only the files that card lists.
3. Do that stage, using the model the card names for each part. Stop when its gate passes, or when the gate
   has failed twice.
4. Update `engine/STATE.md` (stage, next action, one new line at the top of the run log, and drop the oldest so
   five remain). Commit and push to the repository's default branch when your run instructions allow it, so the
   next run sees the new state. Otherwise push to the branch you were given and say in the report that the state
   is waiting on a merge.
5. Report in six lines or fewer, with the frame, contact sheet or video attached. Lead with anything the founder
   has to decide.

One stage per run. If the stage is finished early, stop. Do not start the next one.

## Rules that never bend

- **A rendered sequence is the only proof.** Never describe how good something will be. Show it.
- **Funny first, and clear** (`bible/story.md`). An episode is funny even if PXI did not exist. Six beats: hook,
  setup, absurd turn, escalation, one real feeling, glitch button. A stranger can say what Nio wanted and what
  happened, and can quote a laugh. A script that fails the cold read does not go forward.
- **The writer takes on the room** (`bible/writers-room.md`): a Cartoon Network writers' room making Nio World.
  Our own characters and jokes. Never a character, line, name or design from an existing show.
- **Every file sent to the founder has sound, is loud enough, and reads with the sound off.** Run `engine/tools/render.sh check`.
- **Devices, pacing, text, look, voices and covers follow `bible/craft-library.md`.** A flashback looks and
  sounds like a flashback. Nothing the viewer must understand goes by faster than the floors there. No standing
  label on screen. Approved voices only, never a stand-in. PXI is spoken "pixie" and written PXI. Smooth curves under the pixels, shaped hands.
- **The stranger reviews every finished video and cover** (`engine/reviewer.md`): a reviewer who knows nothing,
  given only what a viewer gets. If it is lost, finds text a person would not write, or sees a character look
  different from the golden frames, the piece does not go to the founder.
- **Humor is the Gumball engine** (`bible/humor.md`): a normal problem, one insane thing everyone treats as
  normal (the Kevin), calm lines against loud pictures, a picture that is the joke, no lesson. Never a random
  line as a punchline, never an explained joke, no narrator.
- **Nio is alive** (`bible/characters.md`): quick, funny, laid back, a troll on purpose, chill about the weird
  and big about himself. Never a goof, never stupid, never an NPC reading a plan. He is good-looking.
- **People talk to each other** (`bible/voice-and-dialogue.md`), and **faces act** (`bible/director.md`): an
  expression for every line, no idle bobbing, no shot where nothing happens.
- **PXI is Nio's app and is never forced** (`bible/story.md`, section 4). It is shown and never sold. Screens
  are the real app 1:1 in the show's pixels (`bible/pxi-product.md`). Every release carries a PXI call to
  action in its own slot: the tag, the caption or the end frame (`engine/formats.md`).
- **Nothing by accident** (`bible/anti-slop.md`). Every strange thing is declared in the intent ledger before
  it is built. Anything strange that is not in the ledger is a defect, however good it looks.
- **Whole releases, never "Part 1".** No intro or outro unless the piece calls for one.
- **Voices are locked:** the designed Qwen3-TTS voices in `bible/characters.md`, made exactly as written there.
  Character designs change only on a dated founder note.
- **After the pilot is approved, `bible/style-lock.md` is the reference.** A difference from it is a defect.
- **A gate that fails twice stops the line.** Write `BLOCKED` and the exact reason in `STATE.md`. Never lower a
  gate, skip a check or try a third time.
- **Nothing leaves the repo without the founder's approval.** A finished piece goes to the founder by notification with
  the video attached. Only stage 6, with the founder's approval recorded word for word, may schedule anything.
- **A founder note is recorded the moment it arrives**, word for word, dated, under "Founder notes" in
  `bible/show-bible.md`. The newest note wins over every file here.
- **A story the founder tells is banked the moment it arrives** (`engine/story-intake.md`).

## Standing constraints (the founder's, from the first handoff; they hold everywhere)

- Never post to @pxi.nyc. In Metricool, only the PXI brand (blogId 7790844), and confirm before scheduling.
- Never compare fees or say "cheaper than other apps".
- Never use the founder's photos (`public/site/img/lib/t00.jpg` is banned).
- No copyrighted music, art or lyrics. AI content labels on.
- Keep the founder's email and name private. Never send them to an outside service.
- Do not work around a site that blocks automated access.
- The app repo (`pxi-mobile-app`) is reference only. Never push to it.
- Research first and use existing open-source tools before building anything from scratch.
- Updates go in the chat. The one notification is a finished piece waiting for approval.
- Do not open pull requests unless asked. Scheduled runs push to the default branch.
- No model name in a commit, a pull request or a file.

## Keeping a run cheap

- Read only what the stage card lists. Never open `.wav`, `.mp4`, `package-lock.json`, `node_modules`,
  `studio/anim/src/audio.json`, `studio/voice/`, `studio/style-test/`, `bible/source/`, or the drafts
  in another episode's `room/` folder.
- No web research. No studying references. The craft is already in the bible. Only PLAN may look up a date, and BOARD
  may look up a storytelling device that is not yet in `bible/craft-library.md`.
- Use the tools, not your head, for mechanical work:
  - `python3 engine/tools/script_lint.py episodes/<id>/script.md` checks word count, runtime, line rhythm and
    banned phrases.
  - `engine/tools/render.sh still|draft|final|sheet|check ...` holds every render command and the has-sound check.
- Subagents are only the ones a stage card names, on the model it names, each given only what the card lists.
  This file is the instruction to use them. Never use the top model in a scheduled run.
- Look at contact sheets, not folders of stills. At most four images a QA pass.
- An episode adds at most one new set and three new props. Reuse `studio/anim/src/world/`, `src/lib/` and
  `src/ui/` as they are.
- Draft renders are half size and only the frames that changed. The full render runs once per episode.

## Where things are

| Path | What |
|---|---|
| `engine/STATE.md` | The board: phase, episode, stage, next action, open founder decisions |
| `engine/stages/` | One card per stage |
| `engine/premise-bank.md` | Approved and candidate premises |
| `engine/real-stories.md`, `engine/story-intake.md` | The founder's real stories, and how one becomes a premise |
| `engine/formats.md`, `engine/calendar.md` | The format menu and the holiday calendar |
| `engine/learning.md`, `engine/playbook.md` | The results ledger, and the one page of what is working now |
| `engine/reviewer.md` | The stranger: the last review of the finished video and cover |
| `engine/BACKLOG.md`, `engine/ROUTINES.md` | Tools still to build, and the scheduled tasks' exact text |
| `bible/` | The writers' room role, characters and voices, humor, dialogue, story, the Gumball lens, the craft library, directing and acting, product truth, QA checklist, canon. `bible/show-bible.md` has the index and every founder note |
| `.claude/skills/writers-room/` | The staged writing method, rubric and tells |
| `episodes/<id>/` | Script, shots, final render and contact sheet for each episode |
| `studio/anim/` | Remotion and three.js project: `src/world` sets and rigs, `src/ui` phone screens, `src/lib` helpers |
