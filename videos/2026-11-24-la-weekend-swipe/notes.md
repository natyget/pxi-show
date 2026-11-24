# Trial notes: one swipe a night (Los Angeles)

## The brief (as given)

One finished app demo, 20 to 40 s, that makes someone in Los Angeles open PXI's Discover tonight. One feature of
Discover only, on the real rebuilt screen (`look/app-screens/discover.html`), with real Los Angeles listings for
Fri Nov 27 to Sun Nov 29, 2026. It still has to pass the viewer: a person, a reason, a picture that changes. The
maker chooses the feature, the hook type and the ask. method.md steps 1 to 6, then the stranger review. post.md
marked "Not approved". No engine file changed: problems are written down here instead.

What I made: the feature is **swiping the Discover cards with the When pill on "This weekend"**. Hook: first a myth check ("Nothing to do in L.A. this weekend?"), then, after the engine changed mid-trial, the founder's form ("In L.A., looking for something to do this weekend? We got you.") with the quick narrator. Ask: download. Three real cards in the app's real carousel order
(Night Tales Fri 10 PM, Solomun Sat 6 PM, Midnight Lovers Sat 11:45 PM), each cut against a Nio World shot of
that kind of night. Payoff: Sunday, you are asleep on the same couch as the hook. Final cut 20.4 s, every check passes. **The stranger failed it twice: dropped** (viewer.md).

## Time per step (UTC, Nov 24, from `date` in the shell)

| Step | From | To | Took |
|---|---|---|---|
| Read the pages in order (CLAUDE.md, STATE, viewer, dont, method, growth, product, the model video, app-screens, runs) | 14:18 | 14:19 | ~1 min by the shell clock (most of the reading) |
| 1. Brief: attach and clone the app, fetch LA listings, read the app's Discover code, dress three seeds | 14:19 | 14:21 | ~3 min |
| 2. Script, banned-phrase check, voice (story narrator), hearing check | 14:21 | 14:23 | ~2 min (plus ~1 min first-time model downloads) |
| 3. Rig: camera lists, checks, test stills (11 refused or unusable tries) | 14:23 | 14:30 | ~7 min |
| 3. Rig renders, five shots, one at a time (scene.html written meanwhile) | 14:30 | 14:42 | ~12 min, unattended |
| Engine changed mid-trial (trainer's message): verify, merge, city-first hook, quick narrator, re-key the scene | 14:40 | 14:43 | ~3 min |
| 4 to 6. Contact sheets, safe check, render both passes, sound, compose, video check | 14:43 | 14:45 | ~3 min |
| Stranger 1 (FAIL), fixes, one shot re-rendered, render again | 14:46 | 14:53 | ~7 min |
| Stranger 2 (FAIL): piece dropped; notes, post, commit | 14:53 | 14:56 | ~3 min |

What the mid-trial change cost: the voice was made three times (story, quick at 17.6 s, quick lengthened to clear the
20 s floor). The quick narrator says the same words about 30% faster, so a script written for 20 to 40 s fell under
20 s and I added two lines ("We got you.", "pick this weekend", "at six"). The rig shots were already rendered to the
old timings; the scene holds a shot's last frame when its slot is longer (the couch shot froze ~0.6 s in the first
cut). About 5 minutes in all, and the hook changed from my myth check to the founder's form.

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

15. **The engine changed under the trial** (eddc207, 48cb511, by message from the trainer thread). Problem 2 above is
    fixed upstream in 48cb511 ("a pick that matches several nights says so"); I found it before the fix. The new
    quick narrator changes a script's length by about a third and no page says so (`method.md` step 2,
    `studio/voice.py` line 26): a piece written to the floor of its range falls under it.
16. **Rig plates have a fixed length and nothing warns when the voice outgrows them.** The scene clamps to the last
    frame (`Math.min(PL[k] - 1, ...)` in the model scene), so a retimed voice turns the end of a shot into a still
    frame silently.
17. **The contact sheet can hide a beat.** `studio/sheet.py` samples every 1.25 s; at quick pace a card on screen for
    1.2 s can fall between two stills, and the stranger, who sees only the sheet, judged it missing ("no card for it
    ever appears"). The stranger's verdict is partly a verdict on the sampling. What I did: held each card about 1.6 s.
18. **What the strangers kept hitting, which the engine itself decides, not the maker:** "Pixie" said, "PXI" written
    (`CLAUDE.md`, `studio/voice.py` SHOW) cost both reviewers the search; the real prices with cents ($24.93) next to
    "twenty-five bucks" read as fake to both; the record's text under the card ("IGHT TALES", "LOMI") and the poster
    text on the card read as a broken layout at any push-in (`discover.html` draws it that way, as the app does);
    the end card (`look/look.md`) is a held still both called an ad outro; the founder's own hook words ("we got you")
    read as ad copy to the second reviewer. A maker cannot fix these in a video folder.

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

Stranger 1, on the first cut (20.9 s; its contact sheet was overwritten by the second cut's, as `studio/sheet.py` always writes `contact-sheet.jpg`), the reviewer's words as given:

> Viewer review of /home/user/pxi-show/videos/2026-11-24-la-weekend-swipe/contact-sheet.jpg (judged only from the contact sheet and the spoken lines)
>
> 1. What happened, and what did the person want?
> A cartoon guy sits on a couch on a rainy night, bored, and wants something to do in L.A. this weekend. He opens an app, swipes through events, goes out Friday and Saturday (club, rooftop at sunset, a midnight house set) and sleeps through Sunday. I get it: he wanted plans for the weekend.
>
> 2. What is the app, and what would you search for?
> It's an app for finding events or parties near you, where you swipe through cards by day. I'd search "PXI", since that's the spelling on screen and the end card has App Store and Google Play badges. But the narrator says "Pixie", so if I only heard it I'd type "Pixie" and probably land on the wrong app.
>
> 3. Where would you scroll away?
> Around 2 to 4 s. From 0.25 to 4.0 s it's the same couch shot with almost no movement, and "looking for something to do this weekend" is a line I've heard in a hundred ads. At 0.25 s there's no caption yet, so nothing grabs me. If I'm still watching, the next risk is 5.25 s: a tiny phone in the middle of a dark frame that I can't read. The last 3 to 4 s (17.75 to 20.25 s) are a static logo card, so I'd swipe away before it ends.
>
> 4. What confused me?
> - "Saturday: Solomun, outdoors, at six." I don't know who or what Solomun is, and no card for it ever appears. The rooftop picture (11.5 to 12.75 s) has no event, no name and no price.
> - The Saturday card that does appear (14.0 s) says SAT 11:45 PM, "Midnight Lovers with Demi Riquisimo", which goes with the "midnight" line. So Saturday at six is never shown in the app.
> - "Friday: a late one in Hollywood" is cut into one-word captions ("a", "25") over a dance shot, so I lose the sentence.
> - The card says $24.93 and $35.02. Those are odd prices next to "twenty-five bucks", and they look fake.
> - The 5.25 s phone is too small to tell what I'm looking at.
>
> 5. What reads as an ad or as machine-made?
> - "We got you." reads as a pure brand-ad line.
> - "It's free. It's called Pixie." over a logo and store badges reads as an ad outro.
> - The one-word captions ("a", "25", "house") and the green-tinted midnight close-up (15.25 s) feel auto-generated.
> - The prices with cents ($24.93, $35.02) feel machine-made.
>
> 6. What looks wrong?
> - The event cards at 6.5 s, 10.25 s and 14.0 s are cropped at the screen edges. Text overlaps itself: "NIGHT TALES" sits on top of "IGHT TALES / NOIZE B2B WHO", the "NOVEMBER 2_" text is cut off, and "EVER SEEN YOU DAN" is truncated. It looks like a broken layout.
> - The captions sit on top of card content: "and swipe" and "25 bucks" cover the location and title text on the card.
> - The 5.25 s frame is a small phone floating in a big empty dark area.
> - The midnight close-up at 15.25 s is murky and green, so it reads as a color glitch.
> - At 17.75 s the store badges are greyed out, as if they're still loading.
>
> 7. Would I send it to a friend?
> No. The idea is relatable ("plan my weekend in 3 swipes"), but it looks like an ad with a glitchy app screen. Solomun means nothing to me, and nothing funny or surprising happens that I'd want to share. "Sunday, you sleep" is the only line with any charm.
>
> FAIL

Fixed after it: the couch shot cut to the phone on "We got you" (3.2 s, was 4.8 s); the phone starts close on the
icon (it was small in a dark frame); the push-in eased from 1.9x to 1.6x so the card and header are whole and sit
above the captions; the Solomun card held until "at six"; the late club shot re-rendered in the purple light (the
green read as "a color glitch"); the end card comes in faster and the tail is 0.5 s shorter. Kept on purpose:
"We got you" and the city-first hook (the founder's words), "Pixie" (CLAUDE.md), the prices (the app's own).

Stranger 2, a new reviewer with no memory of the first, on the second cut (20.4 s):

> Viewer review: videos/2026-11-24-la-weekend-swipe (contact sheet plus spoken lines only)
>
> 1. What happened, and what did the person want?
> A guy on a couch on a rainy night, on his phone, wants something to do in L.A. this weekend. He opens an app and swipes through events. Friday is a club night, Saturday is Solomun outdoors at six, and Saturday night is house music. We see him dancing, on a rooftop at sunset, then smirking at midnight. On Sunday he is back on the couch, asleep. The idea of planning your whole weekend in three swipes comes through.
>
> 2. What is the app, and what would you search for?
> It is an app that lists events near you for a date you pick, shown as cards you swipe through, with a price and a JOIN button. I can't tell whether JOIN buys a ticket or does something else. I hear "Pixie" but read "PXI", so I would probably type "Pixie" first and get the wrong apps. The end card shows "PXI" with App Store and Google Play badges, so I'd find it if I remembered the spelling.
>
> 3. Where would I scroll away?
> At about 3.5 to 4.0 s. The scene cuts from the guy to a plain purple screen with just the logo and "we got you". That is the moment it turns into an ad, and the opening line ("looking for something to do this weekend?") already sounds like ad copy. A second risk is the 17.75 s end card, which holds a static logo for about 3 s.
>
> 4. What confused me?
> - "Pixie" said, "PXI" written.
> - At 5.25 s the app screen looks empty or still loading: a black circle where the event should be. The caption "open PXI" sits on top of a "NIGHT TALES" sticker, so it is a jumble.
> - The line says "house music at midnight" but the card reads SAT 11:45 PM.
> - The prices are oddly exact ($24.93, roughly $118) next to "twenty-five bucks". Small, but it makes me wonder what JOIN costs.
> - I can't tell what JOIN does.
>
> 5. What reads as an ad or as machine-made?
> - "Looking for something to do this weekend? We got you." on a bare logo screen is pure ad.
> - "It's free. It's called Pixie." over three near-identical end-card frames.
> - The one-word captions ("a" alone at 7.75 s, "25" at 9.00 s, "at six") over dancing shots feel auto-generated.
>
> 6. What looks wrong?
> - 5.25 s: an empty event card, with the caption overlapping the sticker.
> - From 6.50 s on, the phone screens are cropped at the top: "Discover" and the header are cut off, so it looks like a bad crop.
> - 12.75 s: the caption "at six" sits right on the character's face and mouth.
> - 7.75 s: a lone "a" in mid-frame.
> - The event card art is crowded and partly cut off ("IGHT TALES", "LOMI").
>
> 7. Would I send it to a friend?
> Probably not. The weekend arc and the "Sunday, you sleep" punchline are cute and relatable, and an L.A. friend might get a "this weekend?" text from me. But it reads as an app ad from second 4. The app screens look glitchy, which makes the app seem unfinished. And I'd have to explain that "Pixie" is spelled "PXI".
>
> FAIL

Two FAILs: the piece is dropped (`studio/viewer.md`). It is kept on this branch as the trial's evidence.
