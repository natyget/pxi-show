# Los Angeles this weekend (city discovery reel, real listings, 34 s)

Format: city discovery reel, the weekend told as nights out. City: Los Angeles, Fri Nov 27 to Sun Nov 29.
Hook: the city and the need, in the founder's words ("are you in LA, looking for things to do this weekend? we got
you"). Ask: send. The quick narrator (```` ```voice quick ````). Said to "you"; Nio is in the pictures and is never named.

```voice quick
Are you in LA{L.A.}, / looking for things to do / this weekend? / We got you.
Friday, / you can have dinner / with strangers / in Echo Park.
It's called / Foodies and New Friends. / Seven o'clock, / about twenty-three dollars.
After dinner, / you go dancing.
Night Tales, / at The Spotlight. / Ten o'clock, / about twenty-five.
Saturday's party / won't say / where it is yet.
Midnight Lovers. / Eleven forty-five, / about thirty-five dollars.
Sunday, / you recover / on a rooftop.
Brunch and football / on Sunset, / from eleven. / That one's free.
All four of these / are in Pixie. / Send this / to whoever plans / your weekend. || 0.9
```

| Line | Picture |
|---|---|
| Are you in LA, looking for things to do this weekend? We got you | Nio in his room, seen from the floor, bored at his phone; his face lights up on "We got you" (rig shot `shots/hook.json`) |
| Friday, you can have dinner with strangers in Echo Park | A dinner table in Nio World: Nio and three people he does not know, laughing (rig shot `shots/dinner.json`) |
| It's called Foodies and New Friends | The listing's real Discover card, the app screen as wide as the picture. A small push toward the price on "about twenty-three dollars" |
| After dinner, you go dancing | Nio on the club floor, the crowd behind him (rig shot `shots/club.json`) |
| Night Tales, at The Spotlight | Its real card. Push toward the price on "about twenty-five" |
| Saturday's party won't say where it is yet | A chat with Sarah: "midnight lovers saturday?", "where is it", "location TBA 😭", "ok im in", each landing on its word |
| Midnight Lovers | Its real card: the place line says LOCATION TBA, LOS ANGELES. Push toward the price on "about thirty-five dollars" |
| Sunday, you recover on a rooftop | Nio up on a chair on the roof with a cup, laughing (rig shot `shots/roof.json`) |
| Brunch and football on Sunset | Its real card. Push toward the price, which says FREE, on "free" |
| All four of these are in PXI | The four cards again, quickly |
| Send this to whoever plans your weekend | The PXI icon, "PXI", "free", the store badges |

## The listings (fetched Nov 24 from PXI's API; every fact, with its ticket page, is in `sources.md`)

| Said | The listing says |
|---|---|
| Friday, you can have dinner with strangers in Echo Park. It's called Foodies and New Friends. Seven o'clock, about twenty-three dollars | "Foodies + New Friends Echo Park: Dinner with Strangers", Fri Nov 27, 7 PM, "Restaurant of the Night", Echo Lake, $23.18 |
| Night Tales, at The Spotlight. Ten o'clock, about twenty-five | "Night Tales", Fri Nov 27, 10 PM, The Spotlight, 1601 North Cahuenga Boulevard, $24.93 |
| Saturday's party won't say where it is yet. Midnight Lovers. Eleven forty-five, about thirty-five dollars | "Midnight Lovers with Demi Riquísimo", Sat Nov 28, 11:45 PM, venue "Location TBA, Los Angeles", $35.02 |
| Sunday, you recover on a rooftop. Brunch and football on Sunset, from eleven. That one's free | "Sunday Brunch + Football", Sun Nov 29, 11 AM, Sunset Rooftop, 6097 Sunset Boulevard. The listing's price is 0, which the app shows as FREE |

The dinner, the club and the roof are Nio World pictures of that kind of night, not pictures of these venues. The
chat is an invented one-to-one thread with a plain name; it says only what the listing says (location TBA).
The day above each card is worded as the app words it from Monday to Thursday ("FRI", "SAT", "SUN"); on Friday the
app would say "TONIGHT", so this cut is for a post before Friday. Sound: the voice and small effects, no music.

## The next city, or the next week (nothing in `scene.html` changes)

The scene is `studio/weekend-reel.html`, copied in as `scene.html`; it names no city and no event.

1. `python3 studio/events.py <city> --days 9 --out videos/<date>-<city>-weekend/events/<city>`. Pick four listings
   for the weekend that someone 18 to 30 would go to and that make a weekend when said in order: a party, something
   free, something in the day. Look at each as its card first. A free pick must say FREE on its card.
2. The hook calls the city and the need (`growth.md`, Hooks). For each pick, the picture of that kind of night (a rig shot, a chat, the map) and the one reason a friend would
   give. Write `script.md`: a picture line then a card line for each pick, then the line that names PXI and makes
   the one ask. Say only what each listing says; say prices the way a friend does ("about twenty-five").
   Open the block with ```` ```voice quick ````, break the captions with ` / `, then
   `python ../../studio/voice.py script.md` and `hear.py`.
3. `reel.json`: the city, `cards` (words from each title, or the listing id when the same event is listed on several
   nights), and `beats`, one per voice line (`studio/weekend.py` lists the kinds: `shot`, `card` with the word its
   push lands on, `chat` with the word each message lands on, `end`), plus the names that keep their capitals.
4. The rig shots in `shots/` (`studio/shot.py`), each at least as long as its beat; faces above the caption band.
5. `python3 studio/weekend.py videos/<date>-<city>-weekend` writes the card seeds, `reel.js`, `cues.json`,
   `sources.md` and the scene, and prints each beat's times. Then stills, `safe.cjs`, the two render passes,
   `sfx.py`, `compose.sh`, `check.py` (`method.md`, 5 and 6), and the stranger.
