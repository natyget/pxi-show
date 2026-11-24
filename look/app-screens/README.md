# PXI screens, rebuilt for the web

The app cannot run in a browser (Skia, native Firebase, the camera, the native map), so its screens are rebuilt from
the component code as HTML, filled with real listings by the app's own code, and screenshotted or animated in a scene.
All are 390x844 points (an iPhone, insets 47/34), shown at 3x.

## Which screen for which listing

| What the video shows | Screen | Seed tool |
|---|---|---|
| A listing with a song (a note mark in the `events.py` list): the app shows it as a Discover card | `discover.html` | `studio/card.py` |
| Any other listing from a ticket site (most of them): the app shows it only in All events | `all-events.html` | `studio/list.py` |

`card.py` refuses a card the app would not draw and points here. Never draw a card for a listing with no song.

## `all-events.html`: the All events list

The list of every event in the city, by night: the night's name and its count, then a row per listing (the flyer, the
title, the venue, the clock, and on the right the price and the ticket site), and "31 more tonight" after a night's
first 12. `all-events-example.jpg` is a still of it with Los Angeles listings (Nov 24).

```
python3 studio/events.py la --out videos/<slug>/events/la
python3 studio/list.py videos/<slug>/events/la --open "Foodies Echo Park" --now "2026-11-27 18:30" --out videos/<slug>/seed-list.json
node studio/screen.cjs look/app-screens/all-events.html videos/<slug>/seed-list.json out.png
```

- `list.py` runs the app's own code (`list.ts`: `allEventsModel.ts`, `doorway.ts`, `nights.ts`, `whenModel.ts`,
  `posterLayout.ts`) on the answer to the app's own question (`app.json`: the city's centre, ranked, seven nights, 300
  rows). The order, the nights, the counts, the 12 before "more", the prices, the clocks and the ticket-site tags are
  the app's. `--open` scrolls to one listing and, when it is past its night's first 12, presses that night's "more"
  first and says so. `--now` is the moment in the story (it decides "Tonight" and what is over); `--when` is the
  filter bar's When (`week`, the app's own start, or `tonight`, `tomorrow`, `weekend`, a date).
- In a scene, put the page in an iframe (`all-events.html?seed=seed-list.json`) and drive it:
  `scrollList(y)` scrolls (0 to `maxScroll()`), `rowY(id)` is the scroll that brings a listing up under its night's
  pinned header, `press(id, p)` is the row dipping under a finger (p from 0 to 1). Night headers pin as in the app.
- The state drawn is the list as a view of its own (Cards / All events). The app shows it that way when the native
  map is not in the build or failed to start. On most phones the same rows stand in a grey sheet raised over the map
  (Cards / Map). The map cannot be rebuilt, so that state is not drawn: do not add a map behind this list.

Not drawn, and refused or left out by the tool:
- A PXI event's row (the "record sleeve": cover, record, stamp, taste match, JOIN). No PXI event was public in Los
  Angeles, New York or anywhere on Nov 24. `list.py` refuses a city that has one. Build `PxiRow` from
  `AllEventsRows.tsx` the first time a city does.
- The distance under the ticket site ("1.2 mi"). The app prints it only from the viewer's own position inside the
  city. The screen is the app with no location shared.
- The sponsored host row, the loading blocks, the empty and failed states, a preview playing (the purple pause).

## `discover.html`: the Discover carousel

The carousel stage (header, filter bar, Cards / Map, the line that says when, the cover and its neighbour, the record,
the stamp, LOCATION / PRICE, JOIN and share, the tab bar), geometry from `geometry.ts`. `studio/card.py` writes its
seed from one real listing (`listing.ts` and `stamp.ts` run the app's code for the name, byline, place, price, record
lines and stamp). Seed keys are in DEFAULT in the file. An outside listing has no heart, faces, polaroids or taste
match, as the app draws it.

## Shared

- `icons.js`: the app's own icon set (`@hugeicons/core-free-icons`), path for path. Use `hugeicon(name, size, colour,
  strokeWidth)`; never redraw an icon by hand.
- `assets/`: Inter (the stand-in for the phone's system font), Stack Sans Notch (the app's display face), the app's
  paper grain for posters, Nio's avatar. Listing posters are other people's work: they stay out of the repo
  (`covers/` folders are ignored) and are used only as the app uses them, as that event's own cover.
- **Camera:** never fake the live camera. Flash real photos one after another like shots being taken. No viewfinder.
- **Profile pictures and facepiles:** chest-up or wider. Never a tight face crop.

## Rules

1. Every screen is copied from its component files (structure, sizes, colours, fonts, words), never invented. Pull
   `PXILABS/pxi-mobile-app` first: the code is newer than any screenshot. Where the code leaves a doubt, write it
   under "Could not be verified" below; never guess in silence.
2. A new or changed screen is reviewed against its component code, line by line: every style in the component's
   `StyleSheet` has its match in the HTML, every word on screen comes from the seed tool running the app's code, and
   whatever could not be checked is listed below. The founder's eye is the last check: show the still.
   (There are no App Store screenshots or recordings in this repo to compare against.)
3. Don't fake what cannot be rebuilt convincingly (the live camera, video, the native map). Use another idea.
4. Save a still beside each screen (`<screen>-example.jpg`) and a line here.

## Could not be verified (Nov 24)

- **The font.** The app sets body text in the phone's system font (SF Pro); these pages use Inter. Widths differ by
  a few percent, so a title may wrap or cut a word earlier or later than on a phone, and the filter bar's values may
  shrink a little more or less. Line heights the code leaves to the system are set to SF's ratio (about 1.19).
- **Emoji** in a title are drawn with Noto, not Apple's.
- **Icon stroke.** `hugeicon` scales the stroke with the icon, as an SVG does; `@hugeicons/react-native` was not run.
- **The header's left side** (the avatar and "Discover" with its chevron) belongs to the Home screen and is kept as
  the founder approved it on Nov 6, not re-read from code. The tab bar and status bar likewise.
- **Signed in.** The listings were asked for signed out. A signed-in viewer may get PXI events or a different rank.
- **The 300-row answer.** A busy city has more listings than the app loads, so a night's count ("44") is the count
  of what the app loaded, which is what the app prints.
- Not compared against a real phone at all: no device or screenshot was available.
