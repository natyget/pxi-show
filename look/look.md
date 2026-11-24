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
- **An app screen is shown clean** (founder, Nov 24): whole and centred, on the app's own black from edge to edge.
  No block of another colour under it, no corner showing a lighter colour, no gradient or dim laid over it. To
  point at something on it, circle it or pop it; never a rough zoom that leaves the screen off-centre.
- **"Everything near you" is the map.** When a line is about all the events at once, the picture is the map with
  the real listings as pins ("all events near you on one map"), drawn in the world's style as in
  `videos/2026-11-24-idk-to-omw`, not a card and not a screenshot with chrome around it.
- **Captions and labels stay sharp**, never pixelated.
- **Event covers are real.** A real listing wears its own poster (`studio/events.py`). An invented demo event
  gets a flyer that looks like a host made it: one idea, the day big, the time small (`app-screens/covers/`).
  Never a stock crowd, never a room from the show.

## Directing the rig

`look/rig.md`: every set with a picture, how to choose a camera, what the cast can do, and what is left before Nio
can talk to camera. The tool is `studio/rig.py`.
