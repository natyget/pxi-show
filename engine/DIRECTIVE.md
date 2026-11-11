# PXI LABS production directive

Status: **DRAFT, waiting for the founder's approval.** Once approved, this is the standing order for the show on
@pxi.app. It changes only when the founder says so, and every change is dated at the bottom.

This file says what we make, how good it has to be, and how the house runs. It is written once, carefully, so
that the cheaper models that run the line never have to work any of it out again. A scheduled run does not read
this file. It reads `CLAUDE.md`, `engine/STATE.md` and one stage card, and those carry everything below in the
form a run needs.

## 1. What we make

The show is **Nio World**, an animated series released on @pxi.app on every platform. Nio is 21 and new
to a city where he came for college. He kept missing everything and was in nobody's photos, so he built an app,
PXI. The series is his life there, with Maya, his friends, his neighbours and the girl who becomes his ex, in a
world that is stranger than he is. It is written through a Gumball lens. It is a real show first: people watch
it because it is funny and because they like these people, and they send it to a friend for the same reason.
That is how PXI gets discovered. It should feel like a series you follow, not like clips cut into parts.

The bar is festival and network quality, judged the way a jury or a Cartoon Network development exec would. In
practice that means seven things, and a release that misses one does not ship:

0. **It is clear.** A stranger can say who this is, what he wanted and what happened, and it sounds worth
   retelling (`bible/story.md`).
1. **It is funny to a stranger**, and not corny. Someone who has never heard of PXI laughs out loud.
2. **It is about something.** Under the joke there is one true feeling a 21-year-old new to a city really has.
3. **It is acted.** Faces are big and alive and change before the line. People talk to each other. Nothing
   bobs, nothing waits, and no shot is dead (`bible/director.md`).
4. **Every frame is composed.** Any frame could be pulled as a still and look intended.
5. **It sounds finished.** Room tone, performance, timing and music are mixed, with no dead air and no clipping.
6. **Nothing in it is an accident.** The show can be eerie and weird the way Gumball and Adventure Time are, on
   purpose. It is never weird because nobody was paying attention (section 7).

A script is not proof of any of this. **Only a rendered sequence counts as progress.** Reports show frames and
video, never a description of how good something will be.

## 2. PXI at the center

PXI is a free app: everything to do in your city on one map, and every photo you are in, from everyone's phones,
in one shared album.

- **PXI is Nio's.** He built it and he is casual about it: "this my app, yo."
- **The episode is funny even if PXI did not exist** (founder, Nov 11), and PXI is never forced into it. It
  turns up when he is stuck, used exactly the way a real person would use it. Most episodes have PXI as the way
  out of the problem or as one natural moment. Holiday episodes always do. Dreams, fillers and at most one
  episode in four may have none (`bible/story.md`, section 4).
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

- **Nio** is Gumball's kind of lead: alive, quick, expressive, laid back, and a troll on purpose. He asks the
  obvious question to wind people up, he hates on things, he carries his friend home, and he cannot say no. He
  is chill about the weird and big about himself. He never explains himself: he pivots. He is never a goof,
  never stupid and never a narrator. He is good-looking. He is the one character who can talk to the viewer.
- **Maya** is his friend and completes him the way Darwin completes Gumball: sweet, earnest, funny without
  being a troll, with a loving heart he does not share.
- **The best friend** is across the country and on the phone. Telling him what happened is how the show
  explains anything, because there is no narrator.
- **The world** treats strange things as normal. One thing in every episode was there the whole time and is
  never explained (the Kevin). Friends and neighbours are plots, and many come from the founder's real stories.

Who they are, their looks and the locked voices are in `bible/characters.md`, and how they talk is in
`bible/voice-and-dialogue.md`. The voices are the designed Qwen3-TTS voices the founder approved. The look is
being redesigned on the founder's note of Nov 11 and none is chosen yet. The show is for viewers of 16 and up, with nothing sexual.

## 4. Writing

**The writer takes on a role** (`bible/writers-room.md`): the writers' room of a Cartoon Network show at its
best, hired to make Nio World. Cheaper models write well when they are told who to be, how that room behaves
and what it hands over. The role, the characters, the humor engine, the dialogue rules, the story shape and
the plot machines are each one short file, and the WRITE stage gives the writer all six.

**The shape** (`bible/story.md`). Every episode, even fifteen seconds: a hook that is off; a tiny real problem
that starts at home; an absurd turn; an escalation where everyone stays calm; one real feeling for two
seconds; and a glitch button that ends it before it explains itself. No lesson. What Nio wants comes out of
people talking, never from a speech to the camera.

**The humor** (`bible/humor.md`). Everyone has a different logic and nobody questions it. The absurd is treated
as normal and the normal as absurd. Calm lines against loud pictures, never both loud. A picture is a joke.
The pause is a beat on an acting face, never dead air. Nothing random: one declared strange thing an episode.

**The plots** come from the founder's real stories (`engine/real-stories.md`, taken in by
`engine/story-intake.md`) and from the machines Gumball builds its episodes on (`bible/gumball-lens.md`), each
restated for Nio's world. Shapes are borrowed. Characters, lines, names and designs never are.

**The tests.** A premise is one sentence, is funny without PXI, and has a want the camera can see. A script
passes a cold read by someone who knows nothing, who must be able to say what happened and quote a laugh. A cut
reads with the sound off.

**The journey.** His world visibly fills up: people, places, albums, stamps. The girl is there at the start and
is his ex within a few episodes. One episode in three pays off a joke from five or more episodes back
(`bible/callbacks.md`). That is the lore people follow for.

**Two pinned reels** open the account: the pilot, and "What this is", where Nio tells us what he built and why.

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
| 1 WRITE | `script.md`: logline, six beats, dialogue with faces, PXI moment, glitch, callback, tag, caption | Cold read matches and quotes a laugh, lint passes, rubric 40/55, no veto |
| 2 BOARD | `shots.md` with a named expression per face, the intent ledger, phone screens, voice lines | One purpose per shot, no dead shot; every screen cites its app source |
| 3 PROOF | The hardest 8 to 10 seconds at full quality | Accident check clean, and the reviewer names the second a viewer laughs |
| 4 BUILD | Short cut first, then the long cut; contact sheets | Has sound, reads with sound off, `bible/qa-checklist.md` and the accident check pass |
| 5 PACKAGE | Cuts, covers, captions per platform, canon updated | The founder approves from the notification |
| 6 SCHEDULE | Posts scheduled in Metricool as the founder approved them | Scheduled and confirmed, nothing else touched |
| L LEARN (weekly) | `engine/learning.md` updated, `engine/playbook.md` rewritten | Every change traces to numbers |

The proof stage exists because a script is not a sequence. If the hardest ten seconds do not play, the script
goes back to WRITE before any more is spent animating it.

**A gate that fails twice stops the line.** The run writes `BLOCKED` and the exact reason in `STATE.md` and
reports it. It does not try a third time and it does not lower the gate.

**The stranger.** Before the founder is asked, the finished video and its cover are shown to a reviewer who
knows nothing and is given only what a viewer would get (`engine/reviewer.md`). It says what it thinks it
watched, where it got lost, what is over-explained, which words a person would not write, and whether each
character is the same person as in the last video. If it fails, the piece is fixed, not sent.

**Stories in.** When the founder tells a story from real life in any chat, it is banked and turned into
premises the same day (`engine/story-intake.md`).

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
- **Budget:** the show may use up to half of the week's usage. The line stops for the week before it goes over.

## 12. Cadence

A proposal until the founder confirms it, and the learning loop adjusts it after that.

- **Until the pilot is approved:** one planning run a week. Nothing is published.
- **Replication trial:** the line runs twice a day, one episode at a time, until three in a row pass.
- **Production:** a post every day and at least one long video a week. Each week is one episode (the long cut on
  YouTube, the short cut everywhere) and six cheaper releases, five of them cut from material the episode
  already made (`engine/formats.md`). The line runs twice a day to finish an episode a week, and a separate
  cheap run makes each day's post. Holidays take the episode slot for their week.
- A day is left empty before a weak piece is posted. Volume never lowers a gate.
- **Platforms:** the short cut on Instagram, TikTok, YouTube Shorts and Facebook; the long cut on YouTube.
  Captions are written for each platform, not copied.
- The show is separate from the daily meme posts and from the city creator accounts. Those have their own
  engines. The shared rules are the same: nothing published without approval, PXI's real screens only, one
  variable tested at a time, and no volume at the cost of quality.

## 13. Change log

- 2026-11-11 (night): rewritten around the founder's head writer brief and pilot review. The writer's role
  (`bible/writers-room.md`), Nio as a live, trolling college student, the six-beat sheet, the Kevin and
  the glitch button, PXI never forced, dialogue and acting rules, the Gumball plot machines, the story intake,
  the designed voices locked, and the standing constraints from the first handoff.

- 2026-11-11 (later): the stranger review of the finished video and cover, rules for words on screen, one set
  of character colours for every video, and a daily cadence with one long video a week.
- 2026-11-11: craft library added after the founder's review of the second pilot build (devices, pacing, text,
  look, voices, covers). Paid promotion of winners and comment-led website proposals added to the learning loop.
- 2026-11-10 (later): story doctrine added after the founder rejected the first pilot build as pointless and
  silent. Nio is now PXI's maker. Cold read, sound-off and has-sound gates added.
- 2026-11-10: first draft, from the Nov 9 session, the bible as it stood, and the founder's notes of Nov 9 and
  Nov 10 on the pilot, the Nio head, the humor, holidays, formats, approval, learning and cost.
