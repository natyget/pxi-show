# One swipe a night (Discover demo, Los Angeles, about 21 s)

Format: app demo, one feature: swiping the Discover cards with the When pill on "This weekend". City: Los Angeles.
Hook: a question that says who it is for ("In L.A., looking for something to do this weekend?") over you slumped on the couch in the rain. Quick narrator (```voice quick).
Ending: one ask, download ("It's free. It's called Pixie." over the icon and the store badges).
Length: 20 to 40 s (the job's range for a demo; this cut lands near 21 s).
Real listings (PXI's API, fetched Nov 24, `events/la/sources.md`), in the app's own carousel order for This weekend:
Night Tales, The Spotlight, Fri 10 PM, $24.93 · Solomun, Reframe Studios Outdoors, Sat 6 PM, $118.59 ·
Midnight Lovers with Demi Riquísimo, location TBA, Sat 11:45 PM, $35.02.

Said to "you": the viewer does not know Nio, so he is the picture and never the name. The joke: the weekend you
said was empty runs out of you before it runs out of plans: Sunday you are back on the same couch, asleep.

```voice quick
In L.A., / looking for something / to do this weekend? || 0.25
We got you. || 0.3
Open Pixie, / pick this weekend, / and swipe. || 0.2
Friday: / a late one / in Hollywood, / twenty-five bucks.
Swipe. / Saturday: / Solomun{Solomoon}, / outdoors, / at six.
Swipe. / Still standing? / House music / at midnight. || 0.3
Sunday, / you sleep. || 0.5
It's free. / It's called Pixie. || 1.2
```

| Line | Picture |
|---|---|
| In LA, looking for something to do this weekend? We got you. | You, slumped on the couch in the rain, on your phone (rig `shots/couch.json`) |
| Open PXI, pick this weekend, and swipe | The camera dives into the phone: a tap on the PXI icon, Discover opens; the camera pushes to the pill "at This weekend in Los Angeles" on "this weekend", then down to the card, FRI 10 PM, Night Tales. A thumb drags the card on "swipe" |
| Friday: a late one in Hollywood, twenty-five bucks | The camera pushes into the Night Tales card (the rest dims), then cuts to you dancing in a packed club (rig `shots/fri.json`) |
| Swipe. Saturday: Solomun, outdoors, at six | Back on the phone: the swipe. Night Tales slides off left, Solomun slides in, the line above turns SAT 6 PM. Then you on a roof, arms up, the sky going dark (rig `shots/sat.json`) |
| Swipe. Still standing? House music at midnight | The swipe again: Midnight Lovers, SAT 11:45 PM. Then you, back in the club, still dancing, wrecked (rig `shots/late.json`) |
| Sunday, you sleep | The first shot again: the same couch, asleep (rig `shots/sun.json`) |
| It's free. It's called PXI | The PXI icon, "PXI", "free", the store badges |

The three cards are the real Discover cards, dressed by the app's own code (`studio/card.py`). In the app an outside
listing rides in the carousel only when it carries a song (`carouselMix.ts`), and the cards go in time order, so
these three really are neighbours under "This weekend". The Nio World shots are pictures of that kind of night, not
of the venues. Sound: the voice and small effects, no music; Instagram's own track is added at scheduling.
