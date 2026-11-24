# How a video is made

One folder per video: `videos/<date>-<slug>/`. Commands run from that folder unless they start with `studio/`.
`videos/2026-11-24-idk-to-omw/` is the worked example: copy its files to start a new one.

## 1. Brief (five lines, before anything is made)

The format (`growth.md`), the city if any, the hook, the one ending, the length (30 to 45 s or 60 to 90 s), and
the real listing or app screen it shows.

Real events: `python3 studio/events.py nyc --out videos/<slug>/events/nyc` fetches this week's listings and posters
from PXI's own API and writes `sources.md`. `python3 studio/card.py <that folder> "<words from the title>"` dresses
one listing as the app's Discover card (the app's own code picks the name, place, price, record lines and stamp)
and writes the seed the scene's Discover screen loads. `node studio/screen.cjs look/app-screens/discover.html
<seed> out.png` shows it as a still. Fetch again on the day a piece is scheduled: listings change.

## 2. Script, read as the viewer, then the voice

- Write `script.md`: the voice lines in a `voice` block, and a table of what the picture does on each line.
- Read it as the viewer (`studio/viewer.md`) and rewrite until every line passes. Then
  `python3 studio/check.py script script.md` for the banned phrases.
- `python ../../studio/voice.py script.md` makes `vo_raw.wav` and `words.json`: a start and end time for every
  word (Kokoro, voice `am_michael`). Write PXI as "Pixie" in the voice text; captions show "PXI".
- `python ../../studio/hear.py vo_raw.wav` prints what a stranger hears. Fix any word it gets wrong.

## 3. The character shots (the 3D rig)

Each shot is a JSON spec in `shots/` (set, camera, marks, action, faces by frame, hold). Frame numbers come from
`words.json` at 24 a second, so a face changes on its word.

```
python3 studio/shot.py videos/<slug>/shots/<name>.json videos/<slug>/plates/<name>
```

It renders the shot, re-renders any blank frame the rig drops, and refuses to finish until every frame is clean.
Run one shot at a time with no other render going: the rig loses its graphics context when the machine is busy.

Render one still first and look at it as the viewer (who is in frame, where the eyes point):
`cd studio/world3d && npx remotion still src/index.ts N3Shot out.png --props='{"spec": <spec>}' --frame=N --gl=swangle --browser-executable=/opt/pw-browsers/chromium`

## 4. The scene

`scene.html` holds the whole timeline: the plates, the phone with the real app screens, the chat, the map, the
captions and the end card. Every element is timed to the word that names it (`A(line, word)`).

- One thing moves at a time. A still image never zooms.
- The camera pushes into the part of the app screen the line is about, and the rest of the screen dims.
- Captions: every spoken word, in the band from y 1160 to y 1340, phrases broken where the voice breathes.

## 5. Stills, then the checks

- `node studio/render.cjs videos/<slug>/scene.html nio all <dir> "<times>"`, one contact sheet, look at it as the
  viewer. Fix timing, size and clutter here.
- `node studio/safe.cjs videos/<slug>/scene.html <seconds>` fails text outside the safe box.

## 6. Render and sound

```
node studio/render.cjs videos/<slug>/scene.html nio art fr/art frames:30:<seconds>
node studio/render.cjs videos/<slug>/scene.html nio ui  fr/ui  frames:30:<seconds>
python ../../studio/sfx.py cues.json vo_raw.wav     # voice + small sound effects, -14 LUFS, no music
bash ../../studio/compose.sh <slug>
python3 studio/check.py video <slug>.mp4 caption.md
```

Then the stranger (`studio/viewer.md`): a fresh reviewer, contact sheets and the spoken lines only.

## 7. To the founder, then out

Send the MP4 itself. On a yes: host it (`pxispace.com/public/social/<slug>/`, pushed with the founder's yes),
schedule in Metricool with the caption, an Instagram library track (`audioConfiguration`), `showReelOnFeed` true,
`draft` false, and read the schedule back.

## Safe zones (1080x1920)

Text stays inside x 90 to 930 and y 360 to 1440. Above is the status bar and Dynamic Island; below, the caption
and music line; on the right, the like, comment and share buttons. The grid crops a cover to 3:4.
