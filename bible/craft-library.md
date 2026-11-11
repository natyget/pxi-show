# Craft library (how each storytelling device looks and sounds in this show)

Founder, Nov 10, on the second pilot build: "the flash back and all that are not obvious enough ... be more
obvious to sound and look like flash back look up on best practice cinematic effects techniques on each thing it
tries to tell and do and lets slowly build up our library."

A device only works if the viewer knows, without thinking, what kind of moment they are in. So each device gets
one treatment, used the same way every time, until the audience has learned it. BOARD names the device for each
shot from this page. A device that is not here is added here first (section "Adding a device"), then used.

Every treatment has three layers that change **together**: picture, sound, and the way in and out. Changing only
one of them is why a device reads as a mistake.

## Devices

### Flashback
- **Way in:** the present shot ends on Nio's face or on the object that triggers it. A hard, visible
  transition: a white flash of 3 to 4 frames, or a match cut on the object, with a rising whoosh that cuts off.
- **Picture:** a different grade from the present: warm and faded, lower contrast, a soft vignette, light film
  grain, and a slightly lower frame rate feel (held on threes). A thin border or a narrower frame is allowed. The
  character looks different in a way the story explains: other clothes, the old apartment, daylight if the
  present is night.
- **Text:** one small stamp, bottom left, for the first second only: "3 months ago". This is one of the few
  places on-screen text is needed.
- **Sound:** room tone drops out and is replaced by a duller version. Voices get light reverb and lose their
  high end. Music changes or thins to one instrument.
- **Way out:** the same transition reversed, landing on the same face or object, with the present room tone
  snapping back at full level.
- **Length:** 3 to 6 seconds in a short cut. One idea only. If it needs more, it is a scene, not a flashback.
- **Never:** a flashback inside a flashback; more than two in a short cut; a flashback that looks like the present.

### Thought or imagined version (what Nio thinks will happen)
- **Way in:** push in on his eyes, a soft pop, the edges of the frame blur.
- **Picture:** brighter and cleaner than reality, slightly too perfect, a soft glow at the edges. Everyone in
  it agrees with him.
- **Sound:** his voice only, close and dry; a light, confident sting.
- **Way out:** a hard cut to the real thing, with the real, messier sound. The contrast is the joke.

### Dream
- Declared in the intent ledger. A named look that is clearly not the show's own. No way in: it simply starts,
  and something is wrong within two seconds. Ends on a hard cut to Nio awake. Sound is close, slow and sparse.

### Time passing
- A hard cut with a clock, a light change, or the same framing with one thing different. A stamp ("11:42 PM")
  only when the time matters to the plot. No dissolves and no montage music unless the piece is a montage.

### Montage
- Same framing or same action repeated in different places, each shot shorter than the last, one continuous
  piece of music, and a counter or object that carries through. It ends on a shot held twice as long.

### Phone insert
- The phone fills most of the frame and is brighter than the room. One idea on the screen. Hold it for the
  reading time (below), with a small move or a highlight that takes the eye to the one thing that matters. The
  thumb enters only to tap. A soft interface sound on each change.

### A list, a plan or a checklist on screen
- The founder could not tell what the checklist was without narration. So: Nio says what it is as it appears,
  it has a plain title in its first line, items arrive one at a time on a sound, and no more than three are on
  screen at once. If it cannot be understood with the sound off in two seconds, cut it and show the thing
  instead.

### Nio to the viewer
- He turns to the lens, the background softens slightly, the room tone dips by a third. He speaks plainly.
  Nobody else reacts. On the cut back, the room tone returns.

### The take and the hold
- A locked frame on a face. Nothing moves but the eyes or a blink. Room tone only. 8 to 12 frames longer than
  is comfortable, then a hard cut.

### The turn or reveal
- Cut to the thing before the reaction, hold it for the reading time, then the face. One sound: either a
  single low note or a sudden drop to silence. Never both.

## Pacing a viewer can follow

The second pilot build was "too fast and something hard to follow". These are floors, not targets.

- **One new thing a shot.** A shot gives the viewer one new fact. If it gives two, split it.
- **Reading time:** on-screen text is held for at least one second plus a third of a second a word, and never
  under 1.5 seconds. A phone screen with one idea is held at least 2 seconds.
- **Shot length:** nothing the viewer must understand is shorter than 1.2 seconds. Only montage shots and
  glitch beats may be shorter.
- **A beat to land:** after a joke, a reveal or a new piece of information, at least 10 frames before the next
  line starts.
- **Speech:** no more than about 2.3 words a second, and never two people talking over a piece of text the
  viewer is meant to read.
- **Geography first:** a new place opens on a shot that shows where everyone is before any close-up.
- **The stopwatch test:** the reviewer says, for each 10 seconds, what just happened. If it cannot, that
  stretch is too fast or too crowded.

## Text on screen

- Text appears only when the picture cannot say it: a time or date that matters, a flashback stamp, a place
  name the first time, the tag.
- **No standing label.** No pill, banner or title that stays on screen saying what the episode or the series is.
- Subtitles are the one constant, at the bottom, two lines at most, never on a face.
- Every string that will be drawn is checked against the font before rendering. A character the font does not
  have is replaced or drawn in the fallback font. Stray characters after numbers are a font or formatting bug,
  and they fail the cut.

## Words on screen and on covers

The founder called "PILOT · NO EVIDENCE" and "40 phones 0 photos" slop and AI-sounding. Any text the show
itself writes (stamps, covers, captions, titles, the tag) has to sound like a person.

- **The friend test.** Would Nio, or a person texting a friend, actually write this? If it reads like a label,
  a poster or a headline, rewrite it or remove it.
- Write a plain, whole thought in lower case: "three months here and i'm not in one photo". Not "3 MONTHS. 0
  PHOTOS."
- **Never:** labels joined by dots or bars ("PILOT · NO EVIDENCE"); number contrasts as drama ("40 phones 0
  photos"); clipped fragments; words in capitals for effect; episode or series labels on a cover; any phrase
  that explains what the viewer is about to see.
- A cover usually needs no words. If it has them, three at most, and they are something a character would say.
- The app's own wording inside phone screens is copied exactly and is not rewritten by these rules.
- Every string the show writes is listed in the script under `## Screen text` and checked by the lint.

## The same people in every video

Nio's skin tone differed between the two pilot reels. A character is one person everywhere.

- Skin, hair, eye and clothing colours come only from the constants in `studio/anim/src/world/Character.tsx`.
  No episode, shot or cover overrides them or passes its own colours.
- Light and grade change the scene, not the person. After grading, a face in a normal scene must still match
  the golden frame for that character. Only a declared device (a flashback, a dream) may shift it, and then
  the whole frame shifts with it.
- Every release is compared with the golden frames and with the previous release before it goes to the founder.

## Look

The founder wants a high-quality pixel look, not a low-quality one: "smooth curve looks when it comes to the
curvature but still pixel effect and not cylynder for fingers."

- Pixels are a finish, not a resolution limit. Shapes are modelled round and smooth, then pixelated at a size
  where curves still read as curves. If a curve shows stair-steps bigger than the outline, the pixel size is too
  coarse for that shot.
- Hands are shaped hands: a palm, a thumb and tapered fingers that bend. Never straight cylinders. If a hand
  cannot be made to look right at this distance, frame so it is not the subject.
- Close-ups get a finer pixel size than wides, so faces are never blocky.
- The final file is exported at full size and high bitrate. Softness or blockiness from compression is a defect.

## Voices

- **PXI is said "pixie".** Founder, Nov 11: "pxi is pronounced pixie". In every spoken line the voice says
  "pixie", so the text sent to the voice tool is written `pixie`. Everywhere it is read (subtitles, screens,
  covers, captions) it stays `PXI`. It is never spelled out as letters aloud.

- Only the voices the founder approved, made with the approved tools and settings recorded in
  `bible/characters.md`. There is no fallback voice. If the approved voice cannot be produced in this session,
  the stage stops as `BLOCKED`. A placeholder or robotic voice never goes into a cut that anyone sees.
- The only effect on a voice is the one written down for that character. Reverb is for flashbacks. Anything
  that makes a voice sound bubbly, metallic or underwater is a defect.
- Every new batch of lines is compared by ear with the approved reference before it is used.

## Thumbnails

Every video ships with a cover made on purpose, not a frame grabbed at random.

- A face in a take, large, with clear eyes, and one object or screen that raises the question of the episode.
- High contrast, readable at the size of a thumb. Three words of text at most, and often none.
- The same placement and treatment every time, so the series is recognisable in a grid.
- Vertical for Reels, TikTok and Shorts; a horizontal version for the long cut on YouTube.
- It never shows the turn or the payoff.

## Adding a device

When a script needs a device that is not on this page, BOARD writes its entry before boarding the shot: the way
in, picture, sound, the way out, the length, and what it must never do, in the same form as above. Look up how
film and animation usually signal it, choose the plainest version, and note where it came from. The founder's
reaction to its first use decides whether it stays.

## Where this came from

The entries above are the standard conventions of film and animation editing as the house understands them,
shaped by the founder's notes. A short look at published guides on flashbacks found the same core advice: mark
the start and the end clearly, change the visual tone (grain, design, costume), keep it brief and tied to the
present story. Entries are corrected when a release shows that a treatment did not read.
