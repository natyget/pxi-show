# Engine trial notes: "One night", Los Angeles (Midnight Lovers)

Branch: `trial/la-one-night-midnight-lovers` (`trial/la-one-night` already held trial 2a, so it was left alone).

Result: dropped after two FAILs from the stranger (`studio/viewer.md`: two FAILs and the piece is dropped). The MP4
on this branch is cut 2, 17.8 s. No engine file was changed; every fix stayed inside this folder.

## The brief

- Format: One night (`growth.md`), 15 to 25 s. City: Los Angeles, Fri Nov 27 to Sun Nov 29, 2026.
- Listing: "Midnight Lovers with Demi Riquísimo" (DICE), Sat Nov 28, 11:45 PM, Location TBA, $35.02, house. Picked
  because a party that won't say where it is sounds made up when said out loud, and because only three weekend
  listings carry a song (the only ones the app shows as Discover cards): Night Tales, Solomun, Midnight Lovers.
- Hook: did you know / only-here, opening with the city ("Are you in LA? There's a party Saturday that won't say
  where it is").
- Ask: cut 1 comment ("would you go not knowing where? Yes or no"); cut 2 send ("send this to the friend who'd go
  anyway").
- Beats: a rig shot of Nio bored at his phone, a chat, the card, a club shot, a flick through the weekend's three
  cards, the end card. All built with `studio/weekend.py` as `method.md` says.

## How long each step took (UTC, Nov 24)

| Step | Time |
|---|---|
| Reading (CLAUDE.md order), app clone, setup (`npm ci`, `setup.sh`) | 15:15 to 15:17, about 5 min with reading |
| 1. Brief, listings (`events.py`), choosing the pick | about 3 min |
| 2. Script, voice, hearing check (3 voice passes for one misheard word) | about 4 min |
| 3. Rig shots: 4 camera tries with stills, 2 plates (`shot.py`, about 5 min) | 15:19 to 15:27 |
| 4. Scene (`weekend.py`, `reel.json`) | about 1 min |
| 5. Contact sheets, safe check | about 1 min |
| 6. Render (two passes), sound, compose, check, a caption bug fixed and the UI re-rendered | 15:27 to 15:32 |
| Stranger 1 (FAIL) | under 1 min |
| Cut 2: script, voice (2 passes), 1 camera try, 2 plates, scene, sheets | about 15 min of work; the session's worker restarted in the middle |
| Cut 2 render, sound, compose, check | 19:43 to 19:45 |
| Stranger 2 (FAIL) | under 1 min |

The whole making, without the restart, was about 45 minutes. The tools were not the bottleneck; the format was.

## The cut-off (the account's usage limit)

It fell during cut 2, right after `weekend.py`, `sheet.py` and `safe.cjs` had run on the rewritten script and the
re-rendered plates (about 15:35 UTC), before the cut 2 render. The session's worker came back at about 19:42. Every
file was still on disk (plates, sheets, voice, the branch); nothing was made twice. What it cost: about four hours of
wall clock, and the context of the first stranger's report had to be carried in the summary, not re-read. No step
was redone, and the render, sound, check and the second stranger ran from where it stopped.

## Problems with the engine, worst first

1. **The format's own shape fails the stranger, and nothing warns of it.** `growth.md:29` (One night) asks for a
   hook that is the listing, then "where, when, how much, the card", then the flick. Both strangers failed it for
   the same reason: the hook raises a question (where is the party?) and the app card answers nothing (it says
   LOCATION TBA), so "what did the app do for me?" has no answer. Both also called the card-then-flick part "an app
   tour" and left at the first app screen (6.5 s in cut 1). The weekend reel survived this because each card is one
   of four nights. With one listing, the app is only proof of a fact the voice already said. `studio/viewer.md` has
   no question that catches "the hook asks something the app cannot answer". What I did instead: moved the card
   later, held it 2.2 s, and made the line "it's on PXI with the rest of your weekend". Not enough. What would have
   saved it: a rule in the format row that the listing's weird fact must be something the card shows and resolves
   (free, a time, a place), or a payoff the app really gives (the map pin, the share, "JOIN").
2. **The caption band sits on the event stamp on every card.** `studio/weekend-reel.html:27` (`#cap` top 1160) and
   `:100` (the comment says the band "falls between the place and the price"). On the real card the stamp is in that
   band, so "about", "it's", "of your weekend" are printed over it. Both strangers named it; `STATE.md`'s test log
   names it too ("the caption over the stamp"). What I did instead: nothing. Changing my copy of the scene felt like
   forking the template. Unclear whether a maker may edit the copied `scene.html`.
3. **`{}` spellings that end in a dot never reach the caption.** `studio/voice.py:81` and `:101` look the word up as
   `L["show"].get(bare(w))`, and `bare()` strips the trailing dot of "L.A.", so `LA{L.A.}` misses and words.json
   keeps "L.A.". `weekend-reel.html:92` then lowercases it: the first caption read "are you in l.a.". The approved
   `videos/2026-11-24-la-weekend/words.json:144` has the same "L.A.", so that reel's caption almost surely says
   "l.a." too. What I did instead: `"show": {"L.A.": "LA"}` in `reel.json`.
4. **The end card opens on a near-black frame.** `studio/weekend-reel.html:141-143`: the black covers the picture
   in 0.2 s, and the icon, name and badges come in 0.15 to 0.4 s later. The sheet catches that frame (14.0 s) and both
   strangers read it as "the video is over" and an exit. What I did: nothing (template).
5. **A chat beat opens on an empty black chat.** `studio/weekend.py:56`: a first message with `null` lands at
   t0 + 0.12, and `studio/sheet.py:38-40` takes its "cut" still right at t0, so the sheet shows an empty black chat
   (3.75 s). Stranger 2 named it as the surest exit. In the MP4 it lasts about 0.1 s, but the stranger only sees the
   sheet. What I did: nothing.
6. **`proper` works by word, not by phrase.** `studio/weekend-reel.html:92`: putting "Midnight" in `proper` (for
   "Midnight Lovers") also capitalises "quarter to Midnight". What I did: left it; no way around it in `reel.json`.
7. **`rig.py list` says "sees" when the still cuts the head.** `club` `sweepTwo` "sees circle", but at frame 30 the
   top of Nio's head is out of frame; `club` `mid` the same. `wide` "sees circle" but the crowd hides him fully
   (`look/rig.md` warns of this, but only in general). What I did: went back to the model's `low`, which both
   strangers called "a huge purple slab" (a low wide angle makes his trousers fill the lower half).
8. **The card push crops the card.** `weekend-reel.html` (the `card` beat's push): at full push the day and time
   line ("SAT 11:45 PM") is half out of the top, and the song line on the right is cut ("EVER SEEN YOU DA", "OMETHING
   WE ALL A"). Both strangers saw it.
9. **"Pixie" vs PXI.** `studio/voice.py` (SHOW maps Pixie to PXI) and `CLAUDE.md`'s rule to say Pixie: both
   strangers said they would search "pixie app" and land elsewhere. That is a founder decision, not a tool bug, but
   no page says how a viewer learns the spelling before the end card.
10. **Conflicting pages on saying what the card shows.** `studio/viewer.md` ("Do I already see this on screen? Then
    the line goes") against `growth.md:29` (say where, when, how much, then the card). I followed the format row and
    said the name, time and price, with the price the friendly way.
11. **The hearing check mishears the first word of a line.** `studio/hear.py` heard "Would you go" as "Did you go"
    and "Send this" as "Then this". I could not listen, so I reworded until it heard it right ("So, would you go",
    "Now, send this"). No page says whether hear.py or the ear wins.
12. **Small:** `method.md` 6 names the file `<slug>.mp4`, but the model folder has `la-weekend.mp4` (no date);
    `method.md` 4 describes building `scene.html` by hand with `A(line, word)`, which does not apply to a piece built
    by `weekend.py`; `rig.py list` needs a second still because the "sees" check is not enough.

## Guesses I made

- That editing my copy of `scene.html` counts as changing the engine; so I did not.
- That a piece can reuse a listing the approved LA weekend reel already uses (Midnight Lovers), and the same chat
  friend name (Sarah) with new lines.
- That "Nobody knows" is fair for a listing whose venue is "Location TBA" (the organiser knows).
- That "The rest of the weekend" may be the two other weekend listings with a song, even though the app's All events
  holds many more (`growth.md` allows "a number only when the app's own count gives it"; I gave none).
- That the format row's 15 to 25 s overrides CLAUDE.md's 30 to 45 s (CLAUDE.md says a format row may give its own).
- That the date of the folder is today's (Nov 24), not the event's.
- That `hear.py` agreeing is enough for a name I could not hear myself (LA, Midnight Lovers).

## What the stranger said, word for word

### Cut 1 (18.5 s, ask: comment): FAIL

> Stranger review of 2026-11-24-la-one-night, based only on the two contact sheets.
>
> 1. **What happened, and what did the person want?** A guy in LA hears about a Saturday party with a secret location. His friend Sarah doesn't know where it is either ("they won't say", "say less"). He wants to go anyway. He finds the party in an app: Midnight Lovers, Sat 11:45 PM, $35, location TBA. The crowd dances. A couple of other parties flick past. Then the logo.
>
> 2. **What is the app, and what would I search for?** An app for finding parties and events in your city. It shows cards with a time, price, location and a Join button. I'd search "Pixie app" because that's what I heard, and I'd get fairy and photo apps. The icon reads as "px" with a smile, not clearly PXI. I only learn the spelling at 16 s, if I'm still watching.
>
> 3. **Where would I scroll away, and why?** At 6.5 s. The chat beat is relatable, but then the cartoon world cuts to a dense app screenshot with tiny text. It reads as "here comes the ad", and the mystery from the hook isn't moving forward. If I'd stayed, 14.75 s would lose me: a near-black frame with a faint logo, which looks like the video is over.
>
> 4. **What confused me?**
>    - The hook promises "won't say where it is", and the app also says "location TBA". The mystery is never solved, so what did the app do for me?
>    - "You go anyway" is spoken over a chat screen, and nobody goes anywhere.
>    - At 3.75 s the chat screen is blank black for a moment.
>    - "Midnight Lovers with Demi Riquísimo" with a spinning vinyl record and an "Event Stamp". I don't know what a stamp is.
>    - The end asks "would you go not knowing where?" over a logo, which feels detached from everything before it.
>
> 5. **What reads as an ad or as machine-made?**
>    - "The rest of your weekend is in PXI" is a pure tagline.
>    - "Quarter to midnight, about thirty-five bucks" over a card that says "$35.02" feels like auto-converted data. Nobody prices a party at $35.02.
>    - "Yes or no" is a stock engagement-bait ending.
>    - The end card (App Store / Google Play badges, "free") is a straight ad.
>
> 6. **What looks wrong?**
>    - In the opening frames the phone covers his mouth, so for the first second he looks like he's biting it, shot from a low angle.
>    - Captions sit on top of the app's round Event Stamp ("it's", "about", "is in PXI" are all printed over it), so caption and UI collide.
>    - The top of the app card is cut off at 8.75 to 10.25 s ("SAT 11:45 PM" half off the frame). The side text is truncated ("EVER SEEN YOU DA...", "OMETHING WE ALL A").
>    - The dance shot: his huge head and body fill the frame while the crowd behind him is tiny. The scale is odd, and "no address yet" lands on the crowd.
>    - The near-empty frame at 14.75 s.
>    - The Solomun card shows $118.59, which also looks like raw data.
>
> 7. **Would I send it to a friend?** No. The chat bit ("they won't say 😂" / "say less") is the one part that feels like real life. Everything after it is an app tour, and there's no reveal to share.
>
> FAIL: the hook promises a secret-location party, but the payoff is an app card that also doesn't know where it is. A stranger leaves at about 6.5 s when the app screenshot starts, and the ones who stay can't say why they'd need this app or how to spell it.

What cut 2 changed: the hook camera (`full`, the phone no longer at his mouth); the name and the time said over the
club shot, and the card held 2.2 s instead of 4; the app named as where you found it; the ask changed to send.

### Cut 2 (17.8 s, ask: send): FAIL

> Stranger review of the 17.8 s "LA one night" short, based only on the two contact sheets.
>
> 1. **What happened, and what did the person want?** A guy in his bedroom hears about a secret party on Saturday. He texts Sarah, and nobody knows where it is, but they're both going. Then they're dancing. The app shows the party, Midnight Lovers, Sat 11:45 PM, about $35, and then two more events. He wanted to go to the mystery party. The video sets up that he also wants to find out where it is, and it never tells him.
>
> 2. **What is the app, and what would I search?** It looks like an app for finding parties and events in your city this weekend. It shows cards with time, price and a JOIN button. I'd search "PXI events app". The narrator says "Pixie", so some people would type "pixie app" and land somewhere else. The end card only shows the logo, "PXI", "free" and the store badges. Nothing there says what the app does.
>
> 3. **Where would I scroll away, and why?**
>    - **0 to 2 s:** a mostly still character stares at his phone in a dim room. "Are you in LA?" makes everyone outside LA leave. The only change is his eyes at 2.25 s.
>    - **3.75 s (the one I'm surest about):** the chat cuts in as a completely black screen with just "Sarah" at the top. It's a dead frame, and that's where I'd swipe.
>    - **About 14 s:** if I'm still there, the near-black frame with a faint logo before the end card is another exit.
>
> 4. **What confused me?**
>    - The hook is "a party that won't say where it is", and the payoff card says "LOCATION TBA". So what did the app do for me? It didn't solve the mystery. It just listed the event.
>    - "House music" goes by too fast to land.
>    - The three cards at 12.4 to 14 s (Night Tales, Solomun) are a blur, and I can't tell why they're there.
>    - "With the rest of your weekend" is vague.
>
> 5. **What reads as an ad or as machine-made?**
>    - "And it's on PXI with the rest of your weekend" is a straight ad line.
>    - "Now, send this to the friend who'd go anyway" is a stock engagement-bait ending.
>    - "About thirty-five bucks" next to a card that says $35.02 feels like a generated price.
>    - The bright, quick narrator on top of a moody bedroom scene feels like a template.
>    - At 0 s the character's slanted brows read as angry, not bored.
>
> 6. **What looks wrong?**
>    - The black empty chat frame at 3.75 s.
>    - On the app shots, captions sit right on top of the round event stamp and the location/price text ("about", "of your weekend"), so both are hard to read.
>    - From 10.75 s the push-in crops the top of the card, cutting off the date and time line.
>    - Card text is truncated: "EVER SEEN YOU DAN", "IGHT TALES", "OMETHING WE ALL A".
>    - The price is tiny even though the camera pushes toward it.
>    - The near-black frame at 14 s.
>    - The arm holding the phone looks stiff and robotic.
>    - In the dance shot the camera sits low and wide, so the body is a huge purple slab.
>
> 7. **Would I send it to a friend?** No. There's no reveal and no joke, and the only reason to send it is that the narrator asks me to.
>
> FAIL: the hook promises to find out where the secret party is, and the video never pays that off. The app shows "Location TBA", so a stranger who stays to the end still doesn't see what the app did for them.

## My own reading

The deciding fault was mine as much as the format's: I chose the one listing whose strange fact is something the app
cannot resolve. A pick like a free listing, or one whose odd place is printed on the card, would let the card be the
payoff. A page that said so would have stopped me at step 1.
