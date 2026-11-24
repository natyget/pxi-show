# Nio: things to do in LA this weekend (Nio to camera, 31 s)

Format: Nio to camera, the first of "Nio builds PXI". City: Los Angeles, Fri Nov 27 to Sun Nov 29.
Hook: the city and the need, in his own voice, on the search phrase "things to do in la this weekend" ("Looking for things to do in LA this weekend? I built an app for that"). Ask: follow, with the reason (what's on in LA, every week).
He talks to "you", into the lens, quick, like someone who knows the city. No narrator.
Shows: the real Discover carousel for Los Angeles this weekend, and one real card.

```voice
nio: Looking for things to do in LA{L.A.} this weekend? I built an app for that. (Quick and bright, to a friend, sure of himself.) || 0.2
nio: It's called PXI, and this is everything on in LA{L.A.} this weekend. (Quick and easy, a little pleased with himself.) || 0.2
nio: I made it because every Friday I had five tabs open, just to find one thing to do. (Quick, talking to a friend, still a bit annoyed about it.) || 0.2
nio: This Friday there's a dinner with strangers in Echo Park. I didn't know that existed, and I made the app. (Quick and amused, then dry, laughing at himself a little.) || 0.25
nio: Saturday there's a party that still hasn't said where it is. I respect that. (Quick, amused, to a friend.) || 0.3
nio: I'm still building it. Follow, and I'll show you what's on in LA{L.A.} every week. (Talking to a friend, warm and easy.) || 1.9
```

| Line | Picture |
|---|---|
| Looking for things to do in LA this weekend? | Nio in his room, to the viewer (`shots/a-hook.json`, camera `talk`) |
| I built an app for that. | A cut in, inside the line (`b-built`, `talkClose`) |
| It's called PXI, | Nio holding up his phone (`c-name`, `talk`); the caption shows the name |
| and this is everything on in LA this weekend. | The map, our drawing (founder, Nov 24: "for that moment i think the map does so well"): every listing the app has for these nights as a pin, placed by its own coordinates; the dinner, Night Tales and the brunch named with their times |
| I made it because every Friday I had five tabs open, | Arms crossed, a step to the side (`d-tabs`, `talkSide`) |
| just to find one thing to do. | Cut in (`d2-find`, `talkClose`) |
| This Friday there's a dinner with strangers in Echo Park. | Nio (`e-dinner`, `talk`) with the listing's facts as a plain label: Foodies + New Friends, FRI 7 PM, Echo Park, $23.18. No card: the listing has no song, so the app lists it in All events |
| I didn't know that existed, and I made the app. | Cut in (`f-joke`, `talkClose`): sheepish on "and I made the app" |
| Saturday there's a party that still hasn't said where it is. I respect that. | The real card of Midnight Lovers: its place line says LOCATION TBA, LOS ANGELES |
| I'm still building it. Follow, and I'll show you what's on in LA every week. | Nio (`g-ask`, `talkSide`), then the PXI icon, "PXI", "free", the store badges |

## What he says, and what stands behind it

| Said | Behind it |
|---|---|
| everything on in LA this weekend | Discover: every event near you, as cards or on a map (`product.md`) |
| every Friday I had five tabs open | His story, written from what Discover does: it gathers listings from other ticket sites beside PXI's own. **The founder should change this line if the real reason was a different one.** No site is named and nothing is compared |
| This Friday, a dinner with strangers in Echo Park | "Foodies + New Friends Echo Park: Dinner with Strangers", Fri Nov 27, 7 PM, $23.18 |
| Saturday, a party that still hasn't said where it is | "Midnight Lovers with Demi Riquísimo", Sat Nov 28, 11:45 PM, venue "Location TBA, Los Angeles" |
| I'll show you what's on in LA every week | The plan in `runs.md`: Los Angeles discovery reels every week |

Every listing shown, with its ticket page: `sources.md` (fetched Nov 24 from PXI's API). He says "this Friday" and
"Saturday", and the cards say FRI and SAT, so this goes out before Friday Nov 27. Sound: his voice and small
effects, no music. The piece before this one failed two fresh reviewers; what they said is in
`videos/2026-11-24-nio-annoyed/review/notes.md`, and this script is built on it.

## The next Nio to camera (nothing in `scene.html` changes)

It is made with the reel tool (`studio/weekend.py`), like every piece that gives information.

1. `script.md`: every line starts `nio:` and ends with how it is said ("Quick ..."). The first words say the city
   and the need; his own reason comes second, in one line. The app is on screen within about seven seconds, and
   never under words about the problem. A line under about six words comes out of the voice model garbled: join
   it to its neighbour. `python ../../studio/voice.py script.md` (about 30 s a line), then `hear.py`.
2. `reel.json`: a `shot` when he is on screen; a `map` or a `card` when he talks about the app (his voice carries
   on over it); a `label` on his shot for a listing the app does not show as a card; the `end` beat with
   `"after": true`, so he finishes the ask to the viewer first. A beat with `"at": "<word>"` cuts to another
   camera inside a line: no shot of him runs past four seconds.
3. `shots/`: Nio at `rug`, `"facing": "camera", "look": "camera", "lens": true, "action": "talk"`, cameras `talk`,
   `talkSide` and `talkClose` (`look/rig.md`: they keep his chin above the captions). Never the same camera twice
   in a row; a hold (`arms-crossed`, `show-phone`) keeps his arms from hanging. With `lens: true` his pupils are
   on the viewer in every face: `real` or `deadpan` for a plain line, `suspicious` and `uneasy` for the complaint,
   `charm` when he is pleased, `sheepish` for a joke on himself (`smug` and `shock` read as sleepy and
   hollow-eyed this close). Change the face on the word that causes it.
4. `python3 studio/weekend.py videos/<slug>` refuses a talking shot whose `"says"` is not on the voice's frames
   and prints the one to write. Then `studio/shot.py` for each shot, one at a time, and `method.md` 5 and 6.
