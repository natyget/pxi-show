# Notes: engine trial, "One night", Los Angeles (dinner with strangers)

## The brief

- Format: One night (`growth.md`). City: Los Angeles. Night: Sat Nov 28, 2026.
- Listing: "Foodies + New Friends Echo Park: Dinner with Strangers", Sat Nov 28, 7 PM, Echo Park ("Restaurant of the
  Night", Echo Lake, LA 90026), $23.18, Eventbrite, organizer Ermantourage LA. From PXI's API, fetched Nov 24 14:19 UTC.
  Chosen because it sounds made up said out loud, it is a night out someone 18 to 30 would send to a friend, and the
  card has a real price.
- Hook: only-here (the real listing said out loud), shown as a silent table of strangers in the first frame.
- Ending and ask: send ("Send this to the friend who'd actually go"), over the table, then the end card.
- Length: 24.7 s (the format says 15 to 25 s; see problem 1).
- Result: `la-one-night.mp4`, cut 2. Stranger: cut 1 FAIL, cut 2 PASS (narrowly). Not approved (`post.md`).

## How long each step took (wall clock, Nov 24 UTC, from the shell's `date`)

| Step | From | To | About |
|---|---|---|---|
| Read CLAUDE.md, STATE, viewer, dont, method, growth, the model's script, scene, shots and sheet | 14:18 | 14:21 | 3 min |
| Setup: attach and clone the app repo, `npm ci` in the rig, `setup.sh` (voice) in the background | 14:21 | 14:23 | 2 min |
| 1. Brief: `events.py la`, pick the listing, `card.py`, look at the card | 14:21 | 14:22 | 1 min |
| 3a. Finding cameras that work at a dinner table (eight `rig.py check`/`still` rounds, most refused) | 14:22 | 14:25 | 3 min |
| 2. Script, `check.py script`, `voice.py`, `hear.py` (failed once on a rate limit, passed later) | 14:23 | 14:27 | 4 min (overlapping) |
| 3b. Five rig shots with `shot.py` (one blank-frame repair) | 14:25:45 | 14:31:28 | 6 min |
| 4. `scene.html` (written while the plates rendered) and four flick-card seeds | 14:26 | 14:31 | 5 min |
| 5. Contact sheet (first one blank, see problem 9), camera fixes, `safe.cjs` | 14:31 | 14:33 | 2 min |
| 6. Two render passes, `sfx.py`, `compose.sh`, `check.py video` (cut 1) | 14:33 | 14:35 | 2 min |
| Stranger, round 1 (FAIL) | 14:35 | 14:36 | 1 min |
| Cut 2: new voice, two new plates, scene fixes, render, safe fix, checks | 14:36 | 14:43 | 7 min |
| Stranger, round 2 (PASS) | 14:43 | 14:44 | 1 min |
| post.md, notes.md, commit | 14:44 | 14:50 | 6 min |

The renders were fast here: the rig made about a frame every 1.3 s, the two scene passes 741 frames each in about 45 s.

## Problems with the engine, worst first

1. **The format and the house rule disagree on length.** `growth.md:29` gives One night "15 to 25 s"; `CLAUDE.md:24`
   says every video is "30 to 45 s or 60 to 90 s", and `method.md:27` asks the brief for "30 to 45 s or 60 to 90 s".
   No page says which wins. I followed the format (24.7 s), since the job named the format. A One night stretched to
   30 s would have needed padding, which the stranger punishes.
2. **"And forty more this weekend" cannot be true, and the tool cannot count it.** `growth.md:29` scripts the flick
   as "and forty more this weekend". `studio/events.py:62` asks the API for `limit: 40` across nine nights, so the
   most it can ever show is 40 for the whole stretch; for LA the weekend (Fri to Sun) held 13 rows, several of them
   the same recurring listing (pottery for kids every day, this dinner every night). There is no way to learn the real
   weekend count. I said "with the rest of this weekend" and showed four real cards.
3. **There is no One night template, and the page points at the wrong model.** `method.md:5-9` names two starting
   points (the feature-story scene, the weekend reel) and neither is a One night. I copied the structure of
   `videos/2026-11-24-idk-to-omw/scene.html` and lifted the full-width card camera and the swipe from
   `studio/weekend-reel.html:66-140` by hand. `method.md:7` also says to copy the model's `cues.json`, which holds that
   video's own times; it is useless to copy. No tool writes cues for a story (`studio/weekend.py` does it only for the
   weekend reel), so I wrote `cues.json` by hand from `words.json`.
4. **No set fits most real listings, and the one I used is daylight.** `look/rig.md:26` (the table of sets) and
   `:29` say there is no bar, restaurant or street. A 7 PM dinner had to go in `dining`, a family dining room with a
   sunny window and a lake outside. Both reviewers accepted it, but it is wrong for the night.
5. **The rig refuses ordinary table shots and the list does not say why in advance.** `python3 studio/rig.py list dining`
   tells which camera "sees" a place, but not which way each seat faces. Every seat facing away from a camera is
   refused ("would have his back to camera"), so I found the shots by trial: `end` (people crowded into one corner,
   faces tiny), `nio`, `mum`, `table` (refused), then `wide` and `jade`. Eight check or still rounds. The `list`
   output could add the facing of each seat. `gaze` is also fixed for a whole shot (the skits in
   `studio/world3d/src/ep/skits/*.ts` change it by making a spec per frame, which `shot.py` JSON cannot do), so a
   look that changes on a word needs its own shot (`close.json`, then `close2.json`).
6. **A listing's own poster shows something else again.** The dinner's Eventbrite poster is four people posing in a
   club. `STATE.md` (test log, second round) already records the same problem for Boston. Nothing in `method.md`
   says what to do. I let the Nio World table carry the hook and kept the card on screen only as the proof
   of day, place and price. The second stranger still read the card as "too small to read" and the poster as
   off-story.
7. **`check.py script` reads the whole script file, not only the words people hear or see.** `studio/check.py`
   (`scan`, line 18) flagged my notes: "did you know" (the hook type's own name in `growth.md:41`) as the filler "you
   know", the ticket site's name as "fee talk", and "proof" as a retired joke. `method.md` asks for the brief and the
   listing table in the same file. I reworded my notes to get a PASS. The check should read the voice block and the
   caption only.
8. **The price on the card cannot match a spoken price.** The card says $23.18 (fees included). The voice cannot say
   "twenty-three eighteen" like a friend. Cut 1 said "twenty-three bucks" and the first stranger flagged the
   mismatch; cut 2 says "about twenty-three dollars" and the second stranger still called it "oddly exact". The
   test log in `STATE.md` records the same failure for the weekend reels; there is no rule for how to say a price.
9. **The model scene hides the trap that blanked my first contact sheet.** In
   `videos/2026-11-24-idk-to-omw/scene.html` the plate and the phone are hidden by an inline `style="display:none"`
   and shown by setting `display = ''`. I moved the hiding into the stylesheet, so `''` fell back to `none` and the
   whole picture layer was blank. My mistake, but `sheet.py` and `safe.cjs` both passed a scene with no picture at
   all: neither checks that the art layer draws anything.
10. **`card.py` cannot be re-run on a fresh clone.** `studio/card.py:29` needs `events/<city>/raw.json`, and
    `.gitignore` keeps `raw.json` out of the repo. `events.py --posters` fetches the posters again but not the raw
    answer, so the seeds are committed but cannot be rebuilt or changed (a new `--clock`) without fetching a new
    list, which has moved on. I committed the seeds.
11. **`hear.py` failed the first time on a Hugging Face rate limit** (429 when downloading `faster-whisper-small.en`).
    `studio/setup.sh` installs faster-whisper but does not fetch the model, so the first run of `hear.py` depends on the
    network at that moment. It worked on the second try about five minutes later.
12. **The app-screens README points at files that do not exist.** `look/app-screens/README.md:18` asks for a
    side-by-side review against "App Store screenshots in `examples/pxi/app-store-2.3.2/`"; there is no `examples/`
    folder. I changed no screen, so I skipped that review.
13. **The default caption groups come out one or two words long.** The first stranger: "The 1 to 2 word captions
    popping in feel auto-generated." That is how the model's captions work (each word appears on its time), and with
    short " / " groups a still can catch a lone "in". For cut 2 I made longer groups in the voice block. Nothing in
    `method.md` says how long a group should be; `studio/weekend-reel.html:80-84` has its own rule (three words, 16
    letters) that the story scene does not share.
14. **`method.md` step 7 asks for a phone notification and for hosting.** This job forbade both, so I did neither.
    Not an engine fault, but a run that follows `method.md` to the end would send and host before the founder's yes:
    the order there says "send the MP4 and one phone notification" first, which is right, then hosting on the yes.
15. **Saying the name.** Both strangers said they would search "PXI", not "Pixie", and the first said a viewer who
    only heard "Pixie" would not find it. `method.md:43` says to write PXI as "Pixie" so the voice says it. Nothing on
    screen tells a viewer how to say it. Left as is.

## Every guess I made

- Length: the format's 15 to 25 s over `CLAUDE.md`'s 30 to 45 s (problem 1).
- Which day the piece goes out: before Saturday, so the card's "SAT" stays true (`card.py` words the day from the
  fetch date). I proposed Thu Nov 26 in `post.md` and flagged that it is Thanksgiving.
- The clock on the card: 9:41, as in the app's own screenshots. The story has no time of day.
- "By dessert" is a joke, not a fact from the listing. The group chat banners ("saturday dinner", "Sarah added you",
  "Mike: again next week?") are story, not the app: they look like a phone's own notification, not a PXI screen.
- The four flick cards (Night Tales, Sunday Brunch Football, Solomun, Sip Smoke And Paint): the weekend's other
  listings with a clear price and a poster, skipping the kids' pottery class and "Location TBA".
- The dining room by day stands in for a restaurant at night (problem 4).
- Cast: Nio, `girl`, `guest1` and `marcus` from the rig, never named. Faces and eyes go to the plates, the person
  beside, or each other; nobody looks into the lens.
- The cover frame and the planned times in `post.md` are proposals; nothing is scheduled.
- The second stranger's PASS ends the review (`studio/viewer.md`: a FAIL is fixed and reviewed once more). I did not
  act on its three suggested fixes, because a changed cut would need a new review that the rule does not allow.

## What the stranger said, word for word

Each was a fresh reviewer with nothing but the contact sheet (`contact-sheet-cut1.jpg`, then `contact-sheet.jpg`)
and the spoken lines.

### Round 1, cut 1: FAIL

> 1. **What happened:** A cartoon guy stares at an empty plate. Then he is at a table with three strangers. An app shows a "Dinner with Strangers" event in Echo Park, Saturday at 7 PM, $23. A text comes in: "Mike: same table next week." What he wanted was a dinner where he meets new people. I only get that around 5 s. The first 3 s are one frozen close-up with captions that say just "in" and "you can".
>
> 2. **What the app is:** It finds weekend events near you (Discover, "This weekend in Los Angeles"). I'd search "PXI" because that's the spelling on screen. If I only heard "Pixie", I'd type "pixie" and probably not find it. Nothing on screen tells me how to say it.
>
> 3. **Where I'd scroll away:** At about 2.5 s, because nothing moves and the one-word captions mean nothing with sound off. If I somehow stayed, I'd leave at 20 s, when it becomes a still logo card for the last 4 s.
>
> 4. **What confused me:**
>    - "on purpose" sits over the app screen at 7.75 s, not over the guy. It's disconnected.
>    - The screen says $23.18 but the voice says "twenty-three bucks".
>    - The "group chat" payoff is a tiny notification I can't read at phone size.
>    - Why does the guy have a pumpkin-like plate?
>
> 5. **What reads as an ad or machine-made:**
>    - The last 5 s: logo, "free", store badges, "Send this to the friend who'd actually go". That's a classic ad outro.
>    - The 1 to 2 word captions popping in feel auto-generated.
>    - The real club-style photo poster clashes with the pixel cartoon.
>
> 6. **What looks wrong:**
>    - The event card is cut off: "OS ANGELES", "S + NEW IDS EC". At 11.5 to 12.75 s it zooms in so far the card falls apart.
>    - The app screen jumps in framing between 7.75 s (status bar showing) and 9 s.
>    - The plate covers a third of the frame in the opening shots.
>    - At 20 s, "send" sits alone on a black screen.
>
> 7. **Would I send it?** Probably not. The idea (dinner with strangers, $23, Saturday) is good, but the opening doesn't sell it, and the ending asks me to share before I care.
>
> FAIL

What I changed for cut 2: opened on the wide table (it moves: the camera creeps in, a stranger looks over) and cut
to Nio on "with total strangers"; cropped the close shots so the bread leaves the picture; longer caption groups; a
caption leaves before the picture changes to the next line's shot; the phone arrives by a cut, not half-risen; a
smaller push that keeps the place, the price and JOIN whole; "about twenty-three dollars"; a banner big enough to read;
"Send this to the friend" over a new shot of the table laughing, with the end card only for the last 3 s.

### Round 2, cut 2: PASS (narrowly)

> 1. **What happened:** Three pixel-art people sit at a dinner table. One of them is surprised ("!") that the others are strangers. By dessert she has been added to the "saturday dinner" group chat. The person wanted a low-stakes way to meet new people this Saturday in Echo Park.
>
> 2. **The app:** PXI, an app that lists events happening this weekend in your city. The voice says "Pixie" but the screen says PXI, so I'd search "PXI" because the end card shows it. Typing "Pixie" would turn up the wrong apps.
>
> 3. **Where I'd scroll away:** Around 0–1.5 s, a dim, static wide shot with no caption. The "!" close-up at 4 s is what keeps me. The next risk is 7.75 s, when it jumps to a busy app screen full of tiny text.
>
> 4. **What confused me:**
>    - The event card's title ("FOODIES NEW FRIENDS ECHO PARK: DINNER WITH STRANGERS") is too small to read, and the caption sits on top of the photo.
>    - "Restaurant of the night" doesn't tell me where it is.
>    - At 17.75–19 s, "it's on PXI / the rest of this weekend" plays over a "Night Tales" DJ set and a $118 Solomun card. That pulls me off the dinner story.
>
> 5. **Ad-like or machine-made:** "It's on Pixie, with the rest of this weekend" plus the app-store end card is the sales moment. "Send this to the friend who'd actually go" reads as engagement bait. "$23.18" is oddly exact next to "about twenty-three dollars."
>
> 6. **What looks wrong:**
>    - At 11.5–12.75 s the zoom crops the screen to the bottom half: photos cut off, the nav bar showing, a big empty black area. It looks like a glitch.
>    - At 20.25–21.5 s the wide shot is frozen.
>    - The end card is mostly empty black.
>
> 7. **Would I send it?** Maybe. "Dinner with strangers, $23, Saturday" is a concrete, shareable plan, and the group-chat payoff lands. It's weaker for anyone outside LA.
>
> PASS (narrowly). Fixes: open on the close-up or put a caption on the first frame, fix the cropped zoom, and keep the "rest of this weekend" beat on calmer cards.

Not fixed, because review ended on the PASS: the first 0.6 s has no caption (the voice starts at 0.6 s), the price
push still shows the bottom of the phone, and the flick cards are a DJ set and a $118 show under a dinner story.
