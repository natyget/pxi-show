# screen time: notes from the trial (method.md steps 1 to 5)

## The brief (step 1)

- Format: feature story (Discover), New York.
- Hook: "Your phone just told on you. Seven hours a day." over the weekly screen-time report. Not a rewind (the
  model used one; growth.md says never the same hook type twice in a row).
- Ending: "What's on near you this Sunday?" on the end card.
- Length: 36.1 s of voice (method's 30 to 45 s band).
- Real listing: Theo Parrish All Day, Nowadays, Sun Nov 29, 3 PM, $20 (RA). The map also shows the Giants watch
  party at The Crown (1 PM, free) and Reggaeton on Houston at San Antonios (5 PM). See `events/nyc/sources.md`.
- The joke: you open an app on your phone to find a reason to put the phone down. By five you "forgot you even had
  a phone". Next Sunday screen time is up 12%, and the camera roll shows why. Nobody says it.

## What is in this folder

`script.md`, `shots/couch.json` + `shots/couch.png`, `shots/floor.json` + `shots/floor.png` (a finished plate frame
of each), `scene.html`, `contact-sheet.jpg` (12 stills, 1.0 s to 34.0 s), `words.json`/`words.js`/`vo_raw.wav`,
`seed.json` (the card seed from `card.py`), `roll/` (two extra rig stills for the camera roll thumbnails), and
`events/nyc/` on the machine only (the whole folder is gitignored, see problem 1).
Not done, as asked: step 6 (full render, sound, compose) and step 7. No stranger review was run.

## Times (one machine, nothing else running)

Setup (`npm ci` 8 s, `setup.sh` 12 s), clone of pxi-mobile-app 1.5 s, `events.py` 5 s, `card.py` 2 s,
`voice.py` 32 s, `hear.py` 13 s, one rig still 15 to 24 s, `shot.py` couch 126 frames 2 min 50 s, floor 92 frames
3 min 17 s (no blank frames either time), 12 scene stills 3.6 s, `safe.cjs` 1.5 s.

## Problems, worst first

1. **A real-listing scene does not survive a fresh clone.** `card.py` writes the seed with poster paths under
   `videos/<slug>/events/nyc/covers/`, and `.gitignore` ignores `videos/*/events/*/covers/` and `raw.json`
   ("posters are other people's work, never committed"). So `scene.html` as committed shows a blank card until
   someone runs `events.py` again, and by then the listing may have changed or gone (method.md line 26 says
   "Fetch again on the day a piece is scheduled: listings change"). Nothing says how to rebuild the exact posters
   a reviewed cut used, or what to do if the listing has gone. The seed is also baked into the iframe `src` by
   hand (I URL-encoded `seed.json` with a one-off Python line); method.md says the seed is "what the scene's
   Discover screen loads" but not how the scene loads it.
   Worse: `.gitignore` line 17 is a bare `events/`, which matches every `videos/*/events/` folder, so
   `events.json`, `sources.md` ("the proof behind a post", events.py docstring) and the stamps the card uses are
   not committed either. This folder's listing facts survive only as the copy in `seed.json` and `script.md`.
2. **No contact-sheet tool.** method.md step 5 (line 63) says "one contact sheet" after `render.cjs`, and
   viewer.md line 27 asks for "two contact sheets (a frame every 1.25 s)", but no tool in `studio/` builds one
   (`grep -ri contact studio` finds only a banned-phrase regex). I wrote a 15-line PIL script in my scratch folder.
   The two pages also disagree: "one contact sheet" from chosen times vs "a frame every 1.25 s".
3. **The rig hides why a shot is refused.** `npx remotion still ... N3Shot` with `"camera": "booth"` in the club
   printed only `Error This shot is refused by the world rules:` and a code excerpt; the list of reasons that
   `validate()` builds (world.ts line 394) never reached the terminal. There is no command to run `validate()` on
   a spec without rendering (a dry run). I gave up on that camera.
4. **Choosing a camera is guesswork.** look.md says "a named camera" and points at the two example specs, but the
   names and what each frames live only in comments inside `world.ts` and `club.ts`. The club's `mid` camera
   (used by the model for Theo) cropped Nio's raised arms and the top of his head with `hold: "arms-up"`; `low`
   worked. In `livingDay`, `couch` worked and `sofa2` cut him at the frame edge. Each try is a 15 to 25 s still.
   A page listing sets, cameras, marks, actions and holds, with one thumbnail each, would save most of this.
5. **`livingDay` is not day.** world.ts line 148 calls it "in daylight", but the window behind the sofa shows night
   rain (see `shots/couch.png`). My story says "Sunday, one P.M.". I kept it; a viewer may notice.
6. **The scene is copied, not templated.** method.md line 4 says copy the model's files; `studio/scene-template.html`
   also exists and nothing says which to start from or how they differ. I copied the model's `scene.html` and
   rewrote about 60% of its script by hand: segment times, camera points in "phone space" (`CARD = [481, 842]`,
   `JOINP`, the tap on the icon at `[540, 716]`) and the plate zoom origin (`transform-origin:486px 800px` in the
   model, a magic number for where the phone sits in that plate; I measured mine by eye as 520px 1290px). None of
   these numbers are explained anywhere.
7. **Captions are grouped by hand.** The `PHR` array (word counts per caption phrase, per line) has to be
   recounted whenever a line changes, and a wrong count fails silently (words shift to the wrong group). Nothing
   checks that the counts add up to each line's words.
8. **Respelling for the voice has no caption path.** `voice.py` has a fixed `SHOW` table (Pixie, P.M., ...).
   Kokoro says "Houston" like the Texas city; New Yorkers say "HOW-ston" for the street. I wrote "Howston" in the
   voice text and had to map it back to "Houston" in the scene's own `show()` function. `hear.py` cannot catch it:
   Whisper wrote "Houston" for both spellings, so the hearing check passes a mispronunciation.
9. **`safe.cjs` only checks what the scene tells it to.** It calls the scene's own `window.safeCheck`, whose
   selector list is written by hand in each scene. New text (my lock-screen notification, the camera roll header,
   the app screen) is not checked unless the maker adds it. The "Ridgewood" camera-roll header sits at about y 140,
   above the safe box, and the check passed.
10. **Step 1 has no place to write the brief.** method.md asks for "five lines, before anything is made" but no
    file for it; I put it at the top of `script.md` and here.
11. **The map labels in the model could not be reused as they were.** The model's map starts on a word inside the
    listing line and the first label shows until the next item is named. In mine the first item ("all day party")
    was already shown on the card, so its label would have flashed for 0.15 s (map start 16.26 s, "Giants" at
    16.41 s). I dropped that label. Nothing in the pages warns about it; I only saw it from the timings.
12. **`events.py` and its pages disagree.** The docstring says `events.json` is "one row per listing"; it is an
    object with `city`, `fetched`, `events`. `--days 7` (the default) returned Monday Nov 23 listings on Tuesday
    Nov 24, i.e. yesterday. runs.md says `--days 9` without saying why.
13. **`card.py` sets the phone's clock to the fetch time** (`"clock": "6:12"`), not the time in the story. I
    changed it to 1:04 by hand. It also takes `--left` for the side card but the right side has no option.
14. **The card shows the title twice.** The real RA poster already has "Theo Parrish" and "All Day" on it, and
    the app draws "THEO PARRISH ALL DAY" over it. That is how the app draws it, so I left it, but a viewer sees
    the name three times on one card (title, poster, record).
15. **Remotion prints "You might have inadvertently set the --memory flag of `docker run`..."** on every still
    and render. Harmless, but it buries real errors.
16. **pxi-mobile-app:** `card.py` ran against it read-only; nothing in this trial wrote to it.

## Guesses I made

- The weekly report's wording ("Your screen time was up 38% last week, for an average of 7h 12m a day") is how
  the phone's own report reads, written from memory; the hourglass icon is a plain glyph, no Apple artwork. The
  camera roll is the phone's photo grid, not a PXI screen; `dont.md` and look.md only talk about PXI's screens, so
  I took "never a fake screen" to mean PXI's.
- The camera roll thumbnails are the floor plate's frames plus two club stills I rendered for them (`roll/`).
  Most still show Nio's face; a real roll would show the room more. A crowd-only angle was not available
  (`booth` refused, reason hidden, see 3).
- Twelve percent, 7h 12m and 8h 04m are invented numbers for a person in a story, not claims about PXI. product.md
  says "never invent a number"; I read that as numbers about PXI.
- The map pins are an illustration, as in the model; Nowadays is about 9 km from the city centre, so the map does
  not claim distance.
- The Giants watch party starts at 1 PM and the story is at 1:04 PM; I kept it as a real Sunday listing.
- Twelve stills for the contact sheet at chosen times (the task's number), not a frame every 1.25 s.
- The model's scene had `room.json` start "on" a line by `LN[1].s - 0.05`; I reused all such offsets as they were.

## Not done here, on purpose

No engine file was changed. No line in `STATE.md`'s test log (runs.md asks every run for one; this trial's
findings are this file). Nothing scheduled, posted or sent to Metricool.
