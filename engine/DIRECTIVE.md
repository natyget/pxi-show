# PXI LABS production directive

Status: **DRAFT, waiting for the founder's approval.** Once approved, this is the standing order for the show on
@pxi.app. It changes only when the founder says so, and every change is dated at the bottom.

This file says what we make, how good it has to be, and how the house runs. It is written once, carefully, so
that the cheaper models that run the line never have to work any of it out again. A scheduled run does not read
this file. It reads `CLAUDE.md`, `engine/STATE.md` and one stage card, and those carry everything below in the
form a run needs.

## 1. What we make

PXI LABS is an animated series, released on @pxi.app on every platform. Nio moved to a city where he knew nobody,
kept finding out about everything after it happened, and was not in a single photo. So he built PXI, the thing
he is sure would have fixed all of it. The series is him using it to build a life, one night at a time, with
Maya, and asking us to come. It is a real show first. People should watch it because it is funny and because they like these two, and send it to
a friend for the same reason. It should feel like a series you follow, not like clips cut into parts.

The bar is festival and network quality, judged the way a jury or a Cartoon Network development exec would. In
practice that means seven things, and a release that misses one does not ship:

0. **It has a point.** Five seconds in, a stranger knows who this is and what he wants. At the end they can say
   what it was about in one sentence, and it sounds worth watching (`bible/story.md`).
1. **It is funny to a stranger**, and not corny. Someone who has never heard of PXI laughs out loud.
2. **It is about something.** Under the joke there is one true feeling a 21-year-old new to a city really has.
3. **It is acted.** Characters think before they move. The face changes before the line. Silence is on purpose.
4. **Every frame is composed.** Any frame could be pulled as a still and look intended.
5. **It sounds finished.** Room tone, performance, timing and music are mixed, with no dead air and no clipping.
6. **Nothing in it is an accident.** The show can be eerie and weird the way Gumball and Adventure Time are, on
   purpose. It is never weird because nobody was paying attention (section 7).

A script is not proof of any of this. **Only a rendered sequence counts as progress.** Reports show frames and
video, never a description of how good something will be.

## 2. PXI at the center

PXI is a free app: everything to do in your city on one map, and every photo you are in, from everyone's phones,
in one shared album.

- **PXI is Nio's own answer to his own problems.** He built it, he is proud of it, and in every story the
  feature is his plan, not a notification that happens to him.
- **Each story runs on one real PXI feature**, used exactly the way a real person would use it. Take PXI out and
  the story should fall apart. If it still works without PXI, the premise is rejected.
- **The viewer should want to do what they just watched.** A Thanksgiving episode shows people making the event,
  inviting each other, chatting in the album thread, reacting, and sharing to Instagram, so that the viewer does
  the same at their own Thanksgiving. The episode is the demonstration, played as comedy.
- **The discovery map is the simplest sell**: all the events near you on one map. When in doubt, the story or
  the tag goes there.
- **Inside the story, PXI is shown and never sold.** No character explains the app or its benefits in a scene.
- **Every release carries a call to action for PXI, in its own slot** (`engine/formats.md`): a tag at the end
  where Nio talks to the viewer, a line in the caption, or an end frame. The story stays clean, and the ask is
  fun and cute, in Nio's voice: get the app so you can find his events and come.
- **The screens are the real app, 1:1, in the show's pixels.** Layout, wording, colours and icons come from the
  app's own code (`bible/pxi-product.md` lists the source file for each screen). Nothing is invented.
- **PXI is never the villain and never the hero.** It just works. Nio is the one who makes it weird.

## 3. The people

- **Nio** made PXI. He is the Gumball type, and he is not a goof. He is sharp, quick, vain and sure of himself. His plans are
  clever and wrong. The comedy is his pride and his certainty, never stupidity. He is good-looking and knows it.
  He is 21, new in the city, keeps his apartment spotless, misses social signals, and never admits anything
  sensitive: he pivots to something sweeter or bigger. **He is the one character who can talk to the viewer.**
- **Maya** is laid back, outspoken and unbothered, which scares Nio. She answers the words, not the meaning. She
  notices the one concrete detail he missed. She gives one sensible suggestion, and when he ignores it she helps
  with the worse plan.
- **The world** treats strange things as normal. Only Nio reacts. There is a weird character in almost every
  episode and nobody else questions them.

Looks and voices are in `bible/characters.md`, and how they talk is in `bible/voice-and-dialogue.md`. The founder
likes the current Nio and Maya designs. Designs and voices change only on a founder note.

## 4. Story, then humor

**Story comes first** (`bible/story.md`). The first pilot build was funny on paper and the founder could not
tell what it was for. So every episode has the same legible shape: a hook in three seconds; the problem and
what Nio wants by five, said plainly, usually by Nio to the camera; his plan by ten, which is a PXI feature;
three steps that get worse; a turn; a payoff where he gets what he needed at a cost; and something new in his
world at the end. A premise has to pass nine tests before it is written (a problem the viewer has had, a want
the camera can see, stakes and a clock, PXI as his answer, an engine, a turn, a point, a one-sentence retell,
and someone to send it to). A script has to pass a cold read by a reader who knows nothing, and a cut has to
read with the sound off.

**The journey.** The series moves in chapters with a goal a viewer can hold, and his world visibly fills up:
people, places, albums, stamps. They go up slowly and never reset. That is what people follow for.

**Two pinned reels** open the account: the pilot, and "What this is", where Nio tells us what he built and why.

**Then humor** (`bible/humor.md`). The short version, which overrides anything older in the bible:

- **Deadpan and grounded.** The method is Nathan Fielder's: a small social problem, a plan that sounds
  reasonable, and total sincere commitment to it long after a normal person would stop. Nobody in the scene knows
  it is funny.
- **The plots are Cartoon Network plots**: Regular Show, Gumball, Clarence. A mundane errand, a shortcut, an
  escalation where each step is caused by the last, and a return to normal with a cost.
- **No forced absurdism.** Random objects, random lines and "quirky" turns are what the founder called corny and
  lame. Anything strange is the logical result of somebody's decision, or it is declared on purpose (section 7).
- **The laugh is in the take**: a held face, a silence that goes on too long, a polite person going along.
- **Depth.** Every story has one true thing written at the top of the script and never said aloud. Nio wants
  something small, his flaw makes it worse, and it costs him. Nobody says what they feel. Detail is specific.
  There is no lesson, and the ending leaves one image that is a little sad or a little sweet.
- **The series remembers.** Plants and payoffs live in `bible/callbacks.md`, dates in `bible/timeline.md`.
  Relationships move slowly and nothing resets.

**Craft** (`bible/craft-library.md`). Each storytelling device has one treatment, used the same way every time:
a flashback changes its picture, its sound and its way in and out together, so nobody has to wonder. The library
also holds the pacing floors (one new thing a shot, enough time to read every text and screen), the rule that
text appears only where the picture cannot say it and never as a standing label, the look (smooth curves under
the pixels, shaped hands, a sharp file), the voices (the approved ones only, never a stand-in), and how a cover
is made. It grows: a device is written into the library before its first use, and corrected when a release
shows it did not read.

## 5. What we release

`engine/formats.md` is the menu. The spine is the **episode**: one story, built once as a long cut of up to three
minutes, with a short cut of 30 to 50 seconds marked inside it. The short cut goes everywhere. The long cut goes
on YouTube, and anywhere else when it is strong enough to hold. Around the spine are cheaper formats that keep
the account alive between episodes: Nio talking to the viewer, dreams, fillers, loops and GIFs, and plain posts
made from frames and phone screens.

- **No "Part 1, Part 2" labels and no chopped episodes.** Each release is whole. "Stay tuned" is said only when
  a story really ends on a cliffhanger, and early on it is worth asking viewers to follow for the next one.
- **No intro and no outro** unless a story calls for one.
- **Every video ships with a cover made on purpose.**
- **Looks, hooks and formats are tested** (section 9). The locked style holds for episodes. Dreams and fillers
  are where a different look is allowed, on purpose.

## 6. Holidays

The show follows the calendar in `engine/calendar.md`. A holiday episode comes out on or just before the day
and models how to use PXI for that day. The calendar gives each holiday its release date, the PXI behaviour to
show, and the dates by which the script, the build and the approval have to be done. A holiday that cannot make
its dates gets a cheaper format from the menu instead of a late or rushed episode.

## 7. Nothing by accident

`bible/anti-slop.md` is the full standard. The rules:

- **Intent ledger.** Every strange thing in a release is written down before it is built, in the shot list,
  with what it is and why it is there. At review, anything strange that is not in the ledger is a defect, however
  good it looks.
- **Accident check.** A reviewer with no context looks at every shot for the things that give a machine-made
  video away: something attached in the wrong place, clipping, floating props, wrong hands, eyes that do not
  converge, broken text, lighting that does not match, frozen or black frames, a flat voice, mouths that do not
  match the sound.
- **Rig check.** When a character or a prop that is worn changes, the character is rendered from every angle and
  expression before it is allowed into a shot. A hat that starts in the middle of a face is caught here, once,
  and never reaches an episode.
- **The human-made test.** Nothing ships that the house would not be proud to sign. Fewer, better releases
  always beat volume, and the platforms punish mass-produced repetition anyway.

## 8. How the house runs

**Phase one is the pilot.** The founder's instruction is that the pilot is remade until the founder likes it, and then
everything follows that style. Until then no episodes are built. On the day the pilot is approved, whoever lands
it fills in `bible/style-lock.md` (the approved files, the golden frames, the timing numbers, what the founder
liked about it). After that a difference from the style lock is a defect.

**Phase two is the replication trial.** The point of this directive is that the house runs without the founder
and without the top model. So the first episode after the pilot is made end to end by the cheaper models from
these files alone. It passes if the founder approves it without having to explain anything that should already
be written here. Whatever the founder does have to explain is a hole in the bible, and it is fixed in the bible, not in
the episode. Three passes in a row and the house is in production.

**The line.** A story moves through stages, each with a card in `engine/stages/` that lists what to read, what
to do, what to leave behind and the gate that ends it. A run does one stage and stops.

| Stage | Output | Gate |
|---|---|---|
| P PLAN (weekly) | The next two weeks of releases in `STATE.md`, from the calendar, the bank and the playbook | Every holiday in range has an owner and dates |
| 1 WRITE | `script.md`: the retell, the point, beats, dialogue, the tag, the short-cut path | Cold read matches, lint passes, rubric 38/50, no critic veto |
| 2 BOARD | `shots.md` with the intent ledger, phone screens, voice lines | One purpose per shot; every screen cites its app source |
| 3 PROOF | The hardest 8 to 10 seconds at full quality | Accident check clean, and the reviewer names the second a viewer laughs |
| 4 BUILD | Short cut first, then the long cut; contact sheets | Has sound, reads with sound off, `bible/qa-checklist.md` and the accident check pass |
| 5 PACKAGE | Cuts, covers, captions per platform, canon updated | The founder approves from the notification |
| 6 SCHEDULE | Posts scheduled in Metricool as the founder approved them | Scheduled and confirmed, nothing else touched |
| L LEARN (weekly) | `engine/learning.md` updated, `engine/playbook.md` rewritten | Every change traces to numbers |

The proof stage exists because a script is not a sequence. If the hardest ten seconds do not play, the script
goes back to WRITE before any more is spent animating it.

**A gate that fails twice stops the line.** The run writes `BLOCKED` and the exact reason in `STATE.md` and
reports it. It does not try a third time and it does not lower the gate.

**Approval.** When a release is packaged, the founder gets a notification in the Claude app with the video
attached and one question. Nothing is scheduled, posted or sent anywhere until the founder answers. The answer is
recorded word for word. After three episodes in a row approved without notes, the founder can choose to let the cheap formats
(fillers, loops, plain posts) schedule without asking. Episodes always ask.

**Founder notes** are recorded the moment they arrive, word for word, dated, in `bible/show-bible.md`. The newest
note wins over everything, including this file.

## 9. Learning

The house learns from its own numbers every week (`engine/learning.md`).

- Every release is tagged with its format, hook, length, look, call to action and holiday.
- The numbers come from Metricool: how many people stay past the first seconds, how much of it they watch, sends
  and saves for each person reached, follows, profile visits and link clicks. Views alone are never the goal.
- One thing is tested at a time, and nothing is called a winner on fewer than three releases an arm. Instagram
  trial reels are the test bed.
- The mix follows the results: most of the output goes to what is working, a fifth to variations, a tenth to
  something new.
- What is learned is written into `engine/playbook.md`, a single page the writing and packaging stages read.
- **Paid promotion follows winners.** A release that has already won without it is proposed for promotion on
  Instagram and TikTok with its numbers, a budget and an end date. The founder approves each one, and no run
  ever spends without that.
- **Comments feed the website and the stories.** What viewers keep asking, in their words, is collected every
  week, turned into website proposals for search once a month, and into premises at any time.
- Learning changes hooks, cuts, covers, captions, calls to action, timing and the format mix. It never changes
  the characters, the humor doctrine or the locked style. Those are the founder's.

## 10. Who does what

The top model writes the directive and the bible, and is called back only for what the line cannot do. Everything
else is done by cheaper models, and each stage card names its model.

| Work | Model |
|---|---|
| Directive, bible, humor doctrine, extracting the style lock, fixing a hole the replication trial finds | Top model, in a thread the founder opens |
| Writing a script; building the proof and the episode; changing a rig, a set or a tool | Opus |
| Running the line: boarding, packaging, scheduling, planning, learning; the accident reviewer | Sonnet |
| Script critics; pulling numbers; status; captions from a finished script | Haiku |

These are starting points, and the replication trial settles them. A stage that passes three times in a row is
tried one tier down. A stage that fails its gate twice is moved one tier up. Either change is written in the
stage card with the date.

## 11. Cost rules

- **One stage per run.** Read `STATE.md`, the stage card and the files that card lists, and nothing else.
- **Nothing is worked out twice.** No web research and no studying references in a production run. The craft is
  already written down in the bible. Only PLAN may look up a date.
- **Tools do the mechanical work**: `engine/tools/script_lint.py` for words, runtime and banned phrases, and
  `engine/tools/render.sh` for every render. `engine/BACKLOG.md` lists the tools still to be built.
- **Reuse before building.** An episode adds at most one new set and three new props.
- **Renders are staged.** Drafts are half size and only the shots that changed. The full render runs once a cut.
- **Images are rationed.** Reviews look at contact sheets, at most four images a pass.
- **Reports are six lines or fewer**, with the frame or the video attached.

## 12. Cadence

A proposal until the founder confirms it, and the learning loop adjusts it after that.

- **Until the pilot is approved:** one planning run a week. Nothing is published.
- **Replication trial:** one line run a day, one episode at a time, no deadline pressure.
- **Production:** one episode a week and three or four cheap releases between episodes, so the account posts
  most days. Holidays take the episode slot for their week. Raise it to two episodes a week only after three in
  a row pass review on the first build.
- **Platforms:** the short cut on Instagram, TikTok, YouTube Shorts and Facebook; the long cut on YouTube.
  Captions are written for each platform, not copied.
- The show is separate from the daily meme posts and from the city creator accounts. Those have their own
  engines. The shared rules are the same: nothing published without approval, PXI's real screens only, one
  variable tested at a time, and no volume at the cost of quality.

## 13. Change log

- 2026-11-11: craft library added after the founder's review of the second pilot build (devices, pacing, text,
  look, voices, covers). Paid promotion of winners and comment-led website proposals added to the learning loop.
- 2026-11-10 (later): story doctrine added after the founder rejected the first pilot build as pointless and
  silent. Nio is now PXI's maker. Cold read, sound-off and has-sound gates added.
- 2026-11-10: first draft, from the Nov 9 session, the bible as it stood, and the founder's notes of Nov 9 and
  Nov 10 on the pilot, the Nio head, the humor, holidays, formats, approval, learning and cost.
