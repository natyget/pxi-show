# Acting (how a line is performed in the picture)

The founder, Nov 17, after the Office Hours v3 cut: "the animations at certain points are still off ... something
that teaches claude not to animate legs in chairs etc and sync flow natural conversation flow with movements of
character and talk and what face expression goes with that". This page is that. The engine does it for every
shot (`studio/anim/src/nw3d/acting.ts`); the board and the voice step feed it.

## What was wrong

Every sitting and standing character ran a looping game motion-capture clip (`Sitting_Talking_Loop`,
`Idle_Talking_Loop`). Legs shuffled under the desk, hands waved on a two-second cycle, and nothing landed on a word.
A TV cartoon works the other way round: strong held poses, and a snap from one to the next on the word that matters.

## The rules (the engine applies them; the board must not fight them)

1. **The lower body is a still drawing.** Seated, nothing below the belt moves. Standing, the feet are planted.
   Legs move only to travel (walk, jog, sprint, step back).
2. **Thought drives the pose, not syllables.** One pose change per line, landing ON its key word. Every other
   stressed syllable gets a head dip and a brow lift, nothing more. (Animation Mentor, Jay Jackson: "Dialogue doesn't
   drive action on the part of the character; thought drives action.")
3. **The snap.** 2 frames of anticipation the other way, 4 frames to an overshoot that lands on the word, 4 frames to
   settle, then hold. On twos.
4. **Moving holds, never loops.** A held pose stays alive with blinks and a drift too small to name. Nobody bobs and
   nobody breathes on a cycle. ("As long as the eyes are alive, you can darn near completely freeze the body.")
5. **Blinks carry thought.** A blink covers every change of face, starts every pose change, and answers the other
   person's key word. One more in a long hold. Never two characters blinking together.
6. **The face goes first, the body follows 2 frames later.** A reaction is the whole body: the attitude (lean, head,
   shoulders) belongs to the face. Smug leans back with the chin up; crushed folds forward with the head down;
   suspicious leans in with the head cocked; shock pulls back with the shoulders up.
7. **Hands only on the key word, and only if the face wants them.** Charm offers a palm, real puts a hand on the
   chest, sheepish goes to the back of the neck, suspicious to the chin, hyped makes fists, smug waves it off.
   Deadpan and dead-inside get no hands at all: stillness is the joke.
8. **The listener listens.** He holds, blinks when the line lands, gives a small nod a beat after the key word (unless
   his face is deadpan), and changes face only where the board says. The reaction shot is often the joke: give it
   its own face key.
9. **A held prop keeps the hands.** Phone, ticket, pen, flyer: he acts with his head and body only.

## What the board writes (`shots.md` and the episode file)

- **A face for every line and a face for every reaction**, as now. The body follows the face, so the face keys ARE
  the acting. A face change mid-shot (`[[0, 'uneasy'], [24, 'sheepish']]`) is a reaction and gets a blink and a
  body change.
- **The key word of each line**, underlined in the script. The voice step makes sure the read stresses it; the
  engine finds it from the audio (`engine/tools/accents.py`, the last strong stress of the line) and the pose lands
  there. If the read stresses the wrong word, the read is redone, not the animation.
- **A gesture only when the face's default is wrong:** `act: { g: [[frame, 'point']] }`. Gestures: rest, offer,
  shrug, chest, dismiss, fists, chin, neck, point, palms.
- **A frozen picture joke:** `act: { still: true }` (blinks only).
- `act: false` brings back the old looping clip. Never in a shot that ships.

## The voice step

Run `python3 engine/tools/accents.py manifest studio/anim/src/vo_<ep>.json studio/anim/src/lips/<ep>_accents.json`
after the lines are treated, beside `lipsync.py`. Check that each line's `main` lands on the underlined word
(frames = seconds x 24). A line with no clear stress (a flat read) gives the body nothing to hit, so ask for the
stress in the voice direction.

## Sources

- Animation Mentor, "Beyond the 12 Principles: Top 10 Advanced Performance Tips for Animators" and "Why all
  animators need to master the moving hold":
  https://animationmentor.com/blog/10-advanced-acting-performance-tips-for-animators ,
  https://animationmentor.com/blog/why-all-animators-need-to-master-the-moving-hold
- Bloop Animation and Animation Mentor on blinks and eye darts (blink on a change of thought, blink through a head
  turn): https://www.bloopanimation.com/blinking-animation/
- Cassell, Vilhjalmsson, Bickmore, "BEAT: the Behavior Expression Animation Toolkit" (SIGGRAPH 2001): gestures,
  brow raises and nods placed on the stressed words of the text, and listener nods:
  https://www.media.mit.edu/gnl/publications/siggraph2001.pdf
- Richard Williams, The Animator's Survival Kit, dialogue chapter (accents, not every syllable), and Ed Hooks,
  Acting for Animators (thought before action), as the standard texts behind the above.
- Rhubarb Lip Sync (MIT licence), the open-source mouth-timing tool whose eight mouths the rig already uses
  (`engine/tools/lipsync.py`): https://github.com/DanielSWolf/rhubarb-lip-sync
