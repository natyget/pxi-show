# PXI screens, rebuilt for the web

The app cannot run in a browser (Skia, native Firebase, the camera, the native map), so its screens are rebuilt from
the component code as HTML, filled with real listings by the app's own code, and screenshotted or animated in a scene.
All are 390x844 points (an iPhone, insets 47/34), shown at 3x.

## Which screen for which listing

| What the video shows | Screen | Seed tool |
|---|---|---|
| A listing with a song (a note mark in the `events.py` list): the app shows it as a Discover card | `discover.html` | `studio/card.py <folder> "<words>"` |
| Any other listing from a ticket site (most of them): the app shows it only in All events | `all-events.html` | `studio/list.py <folder> --open "<words>"` |
| "And 221 more this week": the carousel's last card, the way in to All events | `discover.html` | `studio/card.py <folder> doorway` |

`card.py` refuses a card the app would not draw and points to the list. Never draw a card for a listing with no song.
A piece that goes from the cards to the list passes `--no-map` to `card.py`, so both screens say Cards / All events.

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

## `discover.html`: the Discover carousel, and its last card

The carousel as the app holds it: every card of the When in the app's order, the record behind the centred cover,
the line that says when, the stamp, LOCATION / PRICE / TASTE MATCH, JOIN and share. Stills with Los Angeles listings
(Nov 24): `discover-example.jpg` (a card, its record out), `discover-swipe-example.jpg` (one swipe, then the record),
`doorway-example.jpg` (the last card).

```
python3 studio/card.py videos/<slug>/events/la "Night Tales" --now "2026-11-27 18:30" --out videos/<slug>/seed.json
python3 studio/card.py videos/<slug>/events/la doorway --no-map --out videos/<slug>/seed-doorway.json
node studio/screen.cjs look/app-screens/discover.html videos/<slug>/seed.json out.png
```

- `card.py` runs the app's own code (`carousel.ts`: `carouselMix.ts`, `doorway.ts`, `externalEvents.ts`, `geometry.ts`,
  the stamp builder, the ticket-price rules). The seed holds all the cards (in Los Angeles on Nov 24: 33 this week,
  in time order) and opens on the pick. `--record` opens it with the record out; `--when` and `--now` as for the list.
- An outside listing's card is its flyer alone: no name printed over it, no host line, no heart, no faces. The taste
  match reads "--". That is how `EventCover.tsx` and `DiscoverDetails.tsx` draw one.
- In a scene (an iframe, `discover.html?seed=seed.json`), the page only goes where it is told; the scene owns time:
  `swipe(index, progress)` is the carousel between card `index` and the next (what the leaving card, the arriving
  card, the record and the words under them each do is `DiscoverStage.tsx`, `EventDisc.tsx` and `DiscoverDetails.tsx`,
  line for line); `disc(p)` pops the record out (its orange tab pressed); `spin(deg)` turns it (40 degrees a second
  in the app, only while it is out); `spring('snap' | 'disc' | 'pop', seconds)` is the app's own spring, so a swipe
  lands and a record pops with the app's motion; `carousel.at`, `carousel.indexOf(id)` and `carousel.doorway` say
  where cards are. A swipe always closes the record first, as in the app. `studio/weekend-reel.html` is the model.
- **The doorway** is the last card: three flyers in a stack that fan as it arrives (`fan(p)` to place them by hand),
  the app's count of the outside listings of the When that are not cards, "MORE THIS WEEK", and under it the three
  top picks with their times and the ticket sites. The button reads SEE ALL and there is no share. The count, the
  picks and the words are `doorway.ts`'s. This is the honest "and N more": say the number the card shows.
- An older seed (`center`, `left`) still draws, as one card and the one before it, so finished pieces keep rendering.
  `DEFAULT` in the file is an invented PXI night for a demo that is not a real listing (name on the cover, host,
  heart, faces, polaroids, a taste match).

Not drawn: sponsored cards, a PXI event from the API (none was public), the loading and empty states, the sheets
that open from a card, JOIN or SEE ALL (the listing sheet, the paywall, the map).

## Shared

- `chrome.js`: what every Discover body sits under and over (status bar, header, filter bar, view switch, tab bar),
  the seed reader and the poster a listing gets when it has no flyer. One place for all the screens.
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
- **The record's two lines.** By the code's own numbers a line that fills its box starts about 10 points under the
  cover's right edge, so its first letter can be half hidden. Drawn as coded; a phone was not there to confirm it.
- **The doorway's fan** opens on a spring when the card is centred. Here it opens with the swipe's last half unless
  the scene drives `fan(p)`.
- **The city in the bar.** The carousel says "City" until a city is picked; the seeds say the city, as after a pick.
- **Where the card sits.** The newer code puts the dateline, the card and the details 18 points lower than the
  screen approved on Nov 6 and always prints TASTE MATCH. The new numbers are the code's.
- Not compared against a real phone at all: no device or screenshot was available.
