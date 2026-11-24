# New York this weekend (city discovery reel, real listings, 39 s)

Format: city discovery reel. City: New York, Fri Nov 27 to Sun Nov 29. Hook: a list with one thing held back
("One of them is free"). Ending: one question. Said to "you". Nio is the picture in the first three seconds and is
never named.

```voice
Four things to do in New York this weekend. One of them is free. || 0.35
Friday at eight: Marco Leece, at the Public Hotel. House music, twenty dollars. || 0.3
Saturday, you can skate. Xanadu in Brooklyn, with Rich Medina, from seven. Twenty-five dollars. || 0.3
Or pay nothing: a free rave with an arcade, Saturday at nine, at Danger Danger. || 0.3
Sunday is Theo Parrish, all day at Nowadays, from three. Twenty dollars. || 0.45
All four are in Pixie, with the rest of your weekend. || 0.3
Which one are you going to? || 1.2
```

"Leece" is how the voice has to be given "Lys" to say it right; the captions show "Lys".

| Line | Picture |
|---|---|
| Four things to do in New York this weekend | Nio up on a chair on the roof at sunset, on his phone (rig shot `shots/roof.json`). His face lights up on "weekend" |
| One of them is free | The camera dives into his phone: the real Discover screen edge to edge, "This weekend in New York", the first card |
| Friday at eight: Marco Lys | The camera pushes in until the app fills the frame: the day, the poster, the name, the place, the price, JOIN. On "twenty dollars" it moves closer on the place and the price |
| Saturday, you can skate | A thumb swipes the card away, the way the app's cards swipe. Closer on the price on "Twenty-five dollars" |
| Or pay nothing: a free rave with an arcade | Swipe. The card stays whole: its name says "Free Rave and Arcade Pop Up" |
| Sunday is Theo Parrish | Swipe. Closer on the price on "Twenty dollars" |
| All four are in PXI, with the rest of your weekend | The camera pulls back to the whole screen and the thumb swipes on through two more real listings |
| Which one are you going to? | The PXI icon, "PXI", "free", the store badges |

## The listings (fetched Nov 24 from PXI's API; every fact, with its ticket page, is in `sources.md`)

| Said | The listing says |
|---|---|
| Friday at eight: Marco Lys, at the Public Hotel. House music, twenty dollars | "Marco Lys at Public Hotel", Fri Nov 27, 8 PM, ArtSpace, 215 Chrystie Street, genre house, $20 |
| Saturday, you can skate. Xanadu in Brooklyn, with Rich Medina, from seven. Twenty-five dollars | "Xanadu 54" starring Rich Medina (skate)", Sat Nov 28, 7 PM, Xanadu, 262 Starr Street, Brooklyn, $25 |
| Or pay nothing: a free rave with an arcade, Saturday at nine, at Danger Danger | "Sounds So Dangerous (Free Rave and Arcade Pop Up)", Sat Nov 28, 9 PM, Danger Danger, Brooklyn. Free is in the listing's name; its price field is empty, so the app's card says PRICE TBA |
| Sunday is Theo Parrish, all day at Nowadays, from three. Twenty dollars | "Theo Parrish All Day", Sun Nov 29, 3 PM, Nowadays, Ridgewood, $20 |
| (shown, not said, on the PXI line) | "NYC: Unlimited Prosecco Cruise (Lady M)", Sun Nov 29, 11 AM, Pier 36, $18.90; "Panama Independence Weekend Party Latin Bar NYC", Fri Nov 27, 5 PM, San Antonios, $14.95 |

Each event is its real Discover card: the listing's own poster, and the name, day, place, price, record lines and
stamp chosen by the app's own code (`studio/card.py`). The day above each card is worded as the app words it from
Monday to Thursday ("FRI", "SAT", "SUN"); on Friday the app would say "TONIGHT", so this cut is for a post before
Friday. Sound: the voice and small effects, no music.

## The next city, or the next week (nothing in `scene.html` changes)

The scene is `studio/weekend-reel.html`, copied in as `scene.html`. It names no city and no event. To make another:

1. `python3 studio/events.py <city> --days 9 --out videos/<date>-<city>-weekend/events/<city>` and pick four or
   five listings for the weekend that someone 18 to 30 would go to: a party, something free, something in the day.
   Look at each as its card first (`studio/card.py`, `studio/screen.cjs`).
2. Write `script.md`. The voice block keeps this order: the hook, one line per event, the line that names PXI, the
   one ending. Say only what each listing says, and say each one a different way. `python ../../studio/voice.py
   script.md`, then `hear.py`.
3. Write `reel.json`: the city, the picks in the order the voice names them (words from each title, or a listing
   id), the word on which each card's camera moves closer on the price (`"push": "price", "on": "<the word>"`; leave
   both out to stay on the whole card), `"more"` (one or two other real listings swiped past on the PXI line), the
   word in the hook where the camera dives into the phone, the names that keep their capitals in the captions, and
   any name the voice had to be given by sound (`"show": {"Leece": "Lys"}`).
4. One rig shot for the hook in `shots/` (a different place or pose from the last one), `studio/shot.py`, and where
   the phone is in that picture as `phoneAt`.
5. `python3 studio/weekend.py videos/<date>-<city>-weekend` writes the card seeds, `reel.js`, `cues.json` and the
   scene. Then stills, `safe.cjs`, the two render passes, `sfx.py`, `compose.sh`, `check.py` (`method.md`, 5 and 6).

Boston, made this way the same day: `videos/2026-11-24-boston-weekend/`.
