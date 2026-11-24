# How a video is made

One folder per video: `videos/<date>-<slug>/`. Commands run from the repo root; the two marked "in the folder" run
from the video's folder.

- **A story** (a feature, a joke, a cast): `videos/2026-11-24-idk-to-omw/` is the model. Copy its `scene.html`,
  `seed.json` and `cues.json`, and write your own `script.md` and `shots/`.
- **Nio to camera**: `videos/2026-11-24-nio-la/` is the model, and its `script.md` says how to make the next one. It
  is built with the same tool as the pieces below: his shots, the real cards he talks about, the end card.
- **A piece that gives information** (a city weekend reel, a "One night" piece, an app demo): never build its
  scene by hand. `studio/weekend.py` builds it from a short list of beats (a rig shot, a real card, a chat, a flick
  through the cards, the end card), each tied to a voice line or a word, and gets the phone's size, the camera, the
  captions and the sounds right for you. `videos/2026-11-24-la-weekend/` is the model: copy its `reel.json` and
  write your own beats. A piece with one listing is the same thing with fewer beats.

## A fresh machine (once)

```
cd studio/world3d && npm ci                      # the 3D rig
bash studio/setup.sh && . ~/.pxi-tts/bin/activate   # the narrator's voice and the hearing check
bash studio/setup_cast_voice.sh                  # only when a cast member speaks (a 4 GB model)
python3 studio/events.py --posters videos/<slug>/events/<city>   # only to render a piece that shows real cards
python3 studio/card.py | studio/list.py <the same command as before>   # fetches a carousel's or a list's pictures again
```

Node tools need `NODE_PATH=$(npm root -g)` (Playwright and Chromium are already installed). `studio/card.py` reads
the app's code from `../pxi-mobile-app`, or from the folder in `PXI_APP`. Posters are other people's work and are
never committed; everything else about a listing is (`events.json`, `sources.md`, the seeds).

## 1. Brief (five lines at the top of `script.md`, before anything is made)

The format (`growth.md`), the city if any, the hook and its type, the one ending and its ask, the length (30 to 45 s
or 60 to 90 s), and the real listing or app screen it shows.

Real events: `python3 studio/events.py la --out videos/<slug>/events/la` fetches the next nine nights of listings
and posters from PXI's own API and writes `sources.md`. Then pick the screen the app really shows the listing on
(`look/app-screens/README.md`):

- **It carries a song** (a note mark in the list): it is a Discover card.
  `python3 studio/card.py <that folder> "<words from the title>" --now "<the moment in the story>" --out
  videos/<slug>/seed.json`, then `node studio/screen.cjs look/app-screens/discover.html <seed> out.png` for a still.
  The seed is the app's whole carousel opened on that card: a scene swipes it with `swipe(index, progress)` and pops
  the record with `disc(p)`. The scene's Discover screen loads `seed.json` from its own folder.
- **It does not** (most listings): it is a row of All events, and `card.py` refuses it.
  `python3 studio/list.py <that folder> --open "<words from the title>" --now "<the moment in the story>" --out
  videos/<slug>/seed-list.json`, then `node studio/screen.cjs look/app-screens/all-events.html <seed> out.png`.
  The list opens scrolled to that listing; a scene scrolls it with `scrollList(y)`.
- **"And N more"**: the carousel's last card says the number. `python3 studio/card.py <that folder> doorway`.
  Never say a count the card does not show.

The app's own code picks every word, price, order and count on both screens. Fetch again on the day a piece is
scheduled: listings change.

## 2. Script, read as the viewer, then the voice

- Write `script.md`: the brief, the voice lines in a `voice` block, and a table of what the picture does on each line.
- Read it as the viewer (`studio/viewer.md`) and rewrite until every line passes. Then
  `python3 studio/check.py script videos/<slug>/script.md` for the banned phrases.
- In the folder: `python ../../studio/voice.py script.md` makes `vo_raw.wav` and `words.json`: a start and end for
  every word. Open the block with ```` ```voice quick ```` when the piece gives information (a city reel, a demo, a
  list): a brighter narrator at about 3.1 words a second. Plain ```` ```voice ```` is the story narrator, slower and
  warmer. In a voice line, ` / ` is where the caption breaks, `Lys{Leece}` shows
  "Lys" and says "Leece", and `|| 0.4` is the pause after the line. Write PXI as "Pixie"; captions show "PXI".
  A line that starts with a cast name (`nio: ... (how it is said)`) is spoken by that person in their own voice,
  and a shot can move their mouth to it (`look/rig.md`, "Talking").
- In the folder: `python ../../studio/hear.py vo_raw.wav` prints what a stranger hears. It cannot tell a name said
  wrong from a name said right, so listen to every name of a place or a person yourself.

## 3. The character shots (the 3D rig)

`look/rig.md` shows every set. A shot is a JSON spec in `shots/` (set, camera, places, action, faces by frame,
hold). Frame numbers come from `words.json` at 24 a second, so a face changes on its word.

```
python3 studio/rig.py list club                                  # which camera sees a person at which place
python3 studio/rig.py check videos/<slug>/shots/<name>.json      # ok, or every reason the world refuses it
python3 studio/rig.py still videos/<slug>/shots/<name>.json 40 still.png    # one frame, to look at as the viewer
python3 studio/shot.py videos/<slug>/shots/<name>.json videos/<slug>/plates/<name>
```

Look at the still before the shot: who is in frame, where the eyes point, whether the head or the hands are cut.
`shot.py` renders about a frame a second, re-renders any blank frame the rig drops, and refuses to finish until
every frame is clean. Run one render at a time: the rig loses its graphics context when the machine is busy.

## 4. The scene

`scene.html` holds the whole timeline: the plates, the phone with the real app screens, the chat, the map, the
captions and the end card. Two layers: `#art` is the world (shown in big pixels), `#ui` is the sharp layer
(captions, labels, banners, the end card). Every element is timed to the word that names it (`A(line, word)`), and
the caption groups come from the voice, so nothing is counted by hand.

- One thing moves at a time. A still image never zooms.
- The camera pushes into the part of the app screen the line is about, and the rest of the screen dims. The
  comment above `CARD` in the model says how to aim it.
- Captions sit in the band from y 1160 to y 1340.

## 5. Stills, then the checks

- `python3 studio/sheet.py videos/<slug>` makes the contact sheets: the first three seconds four times a second,
  then a still at every cut and at least every 1.25 s. It prints the longest stretch with no cut. Look at the
  sheets as the viewer (`studio/viewer.md`) and fix timing, size and clutter here.
- `node studio/safe.cjs videos/<slug>/scene.html` fails anything in the sharp layer outside the safe box.

## 6. Render and sound

```
node studio/render.cjs videos/<slug>/scene.html nio art videos/<slug>/fr/art frames:30:<seconds>
node studio/render.cjs videos/<slug>/scene.html nio ui  videos/<slug>/fr/ui  frames:30:<seconds>
(in the folder) python ../../studio/sfx.py cues.json vo_raw.wav     # voice + small sound effects, -14 LUFS, no music
(in the folder) bash ../../studio/compose.sh <slug>
python3 studio/check.py video videos/<slug>/<slug>.mp4 videos/<slug>/caption.md
```

Then the stranger (`studio/viewer.md`): a fresh reviewer, the contact sheets and the spoken lines only.

## 7. To the founder, then out

Write `post.md` beside the MP4: the hook type and the ask, the captions for each network, the cover, the audio
pick, the planned times (`videos/2026-11-24-idk-to-omw/post.md` is the model). Send the MP4 itself and one phone
notification. On the founder's yes, write the yes into `post.md` word for word, host the files
(`pxispace.com/public/social/<slug>/video.mp4` and `cover.jpg`, on main), and message the scheduler thread, which
schedules it and reads the schedule back (`runs.md`).

## Safe zones (1080x1920)

Text stays inside x 90 to 930 and y 360 to 1440. Above is the status bar and Dynamic Island; below, the caption
and music line; on the right, the like, comment and share buttons. The grid crops a cover to 3:4.
