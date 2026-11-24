# Trial notes: one swipe a night (Los Angeles)

## The brief (as given)

One finished app demo, 20 to 40 s, that makes someone in Los Angeles open PXI's Discover tonight. One feature of
Discover only, on the real rebuilt screen (`look/app-screens/discover.html`), with real Los Angeles listings for
Fri Nov 27 to Sun Nov 29, 2026. It still has to pass the viewer: a person, a reason, a picture that changes. The
maker chooses the feature, the hook type and the ask. method.md steps 1 to 6, then the stranger review. post.md
marked "Not approved". No engine file changed: problems are written down here instead.

What I made: the feature is **swiping the Discover cards with the When pill on "This weekend"**. Hook: myth check
("Nothing to do in L.A. this weekend?"). Ask: download. Three real cards in the app's real carousel order
(Night Tales Fri 10 PM, Solomun Sat 6 PM, Midnight Lovers Sat 11:45 PM), each cut against a Nio World shot of
that kind of night. Payoff: Sunday, you are asleep on the same couch as the hook.

## Time per step (UTC, Nov 24, from `date` in the shell)

TIMES

## Problems with the engine, worst first

1. **`studio/card.py` lets you show a card the app would never put in the carousel.** In the app an outside listing
   rides in the Discover carousel only when it carries a song (`pxi-mobile-app/src/components/discover/carouselMix.ts`,
   lines 1 to 25, `ridesInCarousel` / `hasSong`); without one it stays in All events. `card.py` (`main`, lines 20 to 60)
   and `look/app-screens/listing.ts` dress any listing as the centre card, and no page says so. My first plan used
   two free listings at Sunset Rooftop (the Palladium pregame, Sunday Brunch Football): both have no song, so the
   video would have shown a Discover screen that cannot happen. I found this only by reading the app's code.
   What I did: used only listings with a song. Of the 13 Fri to Sun listings fetched, 3 have one.
2. **`card.py` picks a listing by title words, not by night** (`find`, lines 14 to 17). A listing that runs every day
   (the Palladium pregame, Dinner with Strangers, the pottery party) comes back as the first copy in rank order: I
   asked for Friday's and got Thursday's card, with THU in the dateline. Nothing warns that several matched.
   What I did: passed the listing id.
3. **`card.py` chooses the left neighbour by its own rule, not the app's** (lines 44 to 46: same type, nearest in
   time, any night). It put Thursday's copy of the same event to the left of Friday's, outside the "This weekend"
   range, and ignores the song rule and the time order the carousel really uses. What I did: `--left` with the card
   that really comes before (for the first card, the last one: a guess, the app shows the All events doorway there,
   which `discover.html` cannot draw).
4. **The rig's place list and its check disagree, and "ok" does not mean the face shows.** `rig.py list nioRoom` says
   cameras wide, full, high and atDoor "see" `rugLie`; `check` then refuses high (too steep) and atDoor (not in the
   picture), and passes full and wide, whose stills show only his feet (lying feet first to the lens). The `lie`
   action also lasts 59 frames and refuses a longer hold, which `look/rig.md` does not say. On the roof, `check`
   passed camera `three` for Nio and Maya, and Nio was not in the still. In the club, `wide` passed and Nio was lost in
   the crowd. (`studio/rig.py`, `studio/world3d/tools/rig_info.ts`, `look/rig.md` "Choosing the camera".)
   What I did: a still of every shot before rendering; moved the hook from the bedroom floor to the living-room couch
   (camera bedPhoto), Nio alone on the roof (camera nioA), the late club shot on camera mid.
5. **On the roof every second person has their back to the camera**, at every mark and camera I tried (maya at maya,
   sami, theo; cameras nioSun, three, crowdPic, pov, sami, whole), and `facing: "nio"` did not change the refusal. No
   page says which roof marks face which camera. What I did: one person in the roof shot.
6. **`discover.html` is a still, not a carousel.** It draws one centre card and one left neighbour, no right
   neighbour, no doorway, no swipe (`look/app-screens/README.md`, `discover.html`). A demo of Discover's main gesture
   has no template. What I did: three iframes of the same screen, one seed each; on each swipe the outgoing stage
   slides left by one pitch (203 x 0.87, from `DiscoverStage.tsx`), the next slides in from the right, and the two
   screens trade places in the middle 20% of the move. It reads as a swipe, but it is not how the app moves (in the
   app the old card shrinks to the left slot and the record stays).
7. **The fetch cannot see a whole weekend.** `studio/events.py` (the query near line 57) asks for 40 listings over 9
   nights by rank, with no start date: only 13 Fri to Sun listings came back, several are the same event on
   different days, and only 3 carry a song. A weekend piece made on Tuesday works from a sample, and "these are the
   neighbours in the carousel" is only true of that sample. What I did: said nothing in the video that depends on it
   being the whole weekend.
8. **The length rule disagrees with itself.** `CLAUDE.md` ("Every video: ... 30 to 45 s or 60 to 90 s") vs
   `growth.md` (One night 15 to 25 s, Nio to camera 20 to 40 s) vs `studio/check.py` (15 to 95 s) vs this brief
   (20 to 40 s). What I did: followed the brief, about 24.5 s.
9. **`card.py` dates the card from the day it runs, not the day the post goes out** (lines 38 to 41). Made on Tuesday,
   the cards say FRI and SAT; posted on Friday the app would say TONIGHT. There is no `--today` option, so a piece
   cannot be made ahead for its posting day. What I did: planned the post for Wednesday and wrote in post.md that it
   must go out before Friday.
10. **The phone-space comment in the model scene is wrong.** `videos/2026-11-24-idk-to-omw/scene.html`, the comment
    above `CARD`: "an app pixel (x, y) is at about (271 + 1.379x, 367 + 1.379y)". The screen starts at y 316, and
    the model's own `CARD = [481, 842]` only fits 316. What I did: worked from 316, said so in my scene's comment.
11. **No way to check a name is said right.** `method.md` step 2: "listen to every name ... yourself". A maker without
    ears cannot; `hear.py` heard "Solomun" as "solid moon" and cannot say which is right. What I did: spelled it
    `Solomun{Solomoon}` (my guess at the usual pronunciation) and flagged it here for the founder to listen.
12. **Two pages pull against each other on what the voice says.** `studio/viewer.md`: "Do I already see this on
    screen? Then the line goes." `STATE.md` (the reviewer's ask for the city reels): "prices said the way a friend
    says them". The price is on the card. What I did: one price, said the friend's way ("twenty-five bucks"), the
    rest left to the cards.
13. **A screen that is not rebuilt has nowhere to go.** The sort sheet's Free / Paid filter (`FilterSheet.tsx`) would
    make a strong demo, but `look/app-screens/README.md` rule 2 sends a new screen to a side-by-side review against
    `examples/pxi/app-store-2.3.2/`, and that folder is not in the repo. What I did: chose a feature the rebuilt
    screen can show.
14. Small ones: `studio/rig.py` says `still` writes a picture "at the size the video shows it"; it writes 180x320.
    `runs.md` says every run ends with a push to the default branch (this trial must not). `method.md`'s card.py
    example does not mention `--when`, which a weekend piece needs for the pill to say "This weekend".

## Guesses

- "Tonight" in the brief: the piece is for someone planning the weekend from tonight (posted Wed Nov 25), not a
  Friday-night piece. The planned time (6:30 PM in Los Angeles) is mine.
- The three cards are neighbours in the app's carousel under This weekend (time order, outside listings with a song
  only), as far as the 40 fetched listings show. PXI-hosted events in Los Angeles, if any, could sit between them.
- The card left of Night Tales: in the app it is the All events doorway (the loop's last card); I showed Midnight
  Lovers, the last of the three.
- Discover opens already set to This weekend (the When choice is kept between visits in `whenStore.ts`, I did not
  confirm that it survives closing the app). The video never shows the When sheet being used.
- Solomun's pronunciation (above). "Outdoors" from the venue's name, Reframe Studios Outdoors.
- The roof shot is at sunset; Solomun starts at 6 PM, after an LA sunset in late November (about 4:45 PM). A picture
  of that kind of night, not of the venue.
- "A late one in Hollywood": Night Tales starts at 10 PM at 1601 N Cahuenga Blvd, Hollywood. I did not call it
  techno: the listing gives no genre.
- The thumb is drawn as the model's tap circle dragged across the card.

## The stranger, word for word

STRANGER
