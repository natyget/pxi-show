# How it looks

## Identity

- Black first: #050505 page, #A523EF the one brand purple, #C26BFF for keywords in captions.
- Type: Inter (captions 84 px, weight 900, black outline), DM Mono (small labels, times), Instrument Serif (rare).
- The end frame: the app icon, "PXI", "free", the App Store and Google Play badges, plain near-black. Nothing else.
- Files: `fonts/`, `brand/` (icon, badges, grain), `app-screens/` (the real app rebuilt, and event covers).

## One look: Nio World

- **The world and the cast come from the 3D rig** in `studio/world3d` (founder, Nov 24: "the old nio really
  looked nice"). It draws at 180x320 and is shown at 6x with grain: Nio's room in the rain, the club, the living
  room, the campus, the roof. Cast: Nio, Maya, Sami, Theo, Imane and the strangers.
- **The app is real.** Screens are the rebuilt app (`app-screens/`), animated (cards slide, buttons press, the
  record spins) on a pixel grid twice as fine as the world, so app text stays readable. The camera pushes into the
  part of the screen the line is about.
- **Captions and labels stay sharp**, never pixelated.
- **Event covers are real.** A real listing wears its own poster (`studio/events.py`). An invented demo event
  gets a flyer that looks like a host made it: one idea, the day big, the time small (`app-screens/covers/`).
  Never a stock crowd, never a room from the show.

## Directing the rig

- A shot is a small spec: the set, a named camera, who is at which mark, the action (sit, stand, walk, dance),
  the face by frame, what they hold, where they look. Examples: `videos/2026-11-24-idk-to-omw/shots/`.
- The rig refuses a shot the world cannot show (someone out of frame, a back nobody asked for).
- Eyes go to the phone, the person or the thing. `look: 'camera'` only when the script asks for it.
- One or two people a shot. The face changes on the word that causes it.
- A new prop is a few lines in `studio/world3d/src/nw3d/room.ts` (the microphone was added this way).
- It renders about one frame a second, 24 frames for each second of the shot.

## Next for the series

A pose library (named poses a scene picks from), mouth shapes from the audio (`archive/.../engine/tools/lipsync.py`
already reads a voice line into mouth cues), and Nio's own voice for the to-camera videos.
