# Director's playbook — directing PXI LABS like a Gumball spin-off (our characters, their craft)

Sources: creator Ben Bocquelet and crew interviews (Skwigly 2014; ScreenRant 2025), AV Club reviews, critic essays.
We copy none of Gumball's characters, designs, names or voices. We copy the *discipline*.

## The rules the Gumball team works by
1. **One-sentence mundane premise.** Bocquelet writes premises as one line on his phone ("a guy gets a push that he's
   in a photo"). If it doesn't fit in one sentence, it isn't a premise.
2. **Take it as far as it can go.** "If there's a gag, it has to be the best possible version of that gag. It has to be
   pushed as far as it can go." Each beat must top the last: photo of him → album of him → photo from the future →
   he deletes the app → the app tells on him anyway.
3. **Comedy is a physical reaction or it's cut.** "It's supposed to induce a reaction, a physical one. If it doesn't,
   it doesn't work. Rework it until it does." The QA reviewer asks: where exactly does a viewer laugh/gasp? If no
   answer per 5 seconds, rewrite.
4. **From a real place.** Real feelings (being watched, being left out, being bored at 11 PM) under the absurd.
5. **The world treats absurd things as normal.** Only Nio reacts. The sock guy is just there.
6. **Three acts + a set piece**, even in 45 seconds: setup (0–8 s) → escalation (8–35 s) → set piece / turn → button.
7. **Long-running mystery, loose continuity.** Plant things (the rooftop flyer on the laundromat board) and pay them off
   episodes later. Log every plant in `callbacks.md`.
8. **Something they haven't seen before**, every episode: a visual idea, a format break, a new use of the phone screen.

## Shot grammar
- **Hook in the first second** with motion and sound (a lone sock spinning; dryers; a TV mid-sentence).
- **Hard cuts** on action. A shot lasts as long as the joke needs, not longer (most 1–3 s).
- **Reaction shots are the comedy.** After every reveal, cut to the face. Hold the deadpan one beat longer than
  comfortable, then cut.
- **Inserts** of the phone are their own beats, readable in one glance.
- **Reverse shots** to show what he's afraid of, and that nothing is there (or something absurdly calm is).
- **Coverage per scene:** a wide to place everyone, then MCU/CU for acting, then inserts. Frame faces with `frame()`
  from the head's real position: eyes ~40% from the top, centred, headroom kept.
- **The button:** end on the smallest, driest line or image (". . . it's clean.").

## Acting (flat 2D faces)
- Faces carry it: lids, brows, pupils, mouth. Escalate expressions with the story: neutral → squint → one brow →
  sweat → wide-eyed trip-out (tiny pupils, mouth wobble).
- Squash on sharp reactions (a whip turn, a realisation) for 2–4 frames, then settle. Anticipation before big moves
  (a dip before standing). Overlap: nothing starts and stops at the same time. No dead pauses between animations.
- Physics always: a moving body travels; feet stay on the floor; props fall with gravity; hands hold things.

## Writing Nio
- Thoughts in (parentheses), spoken lines sparingly: he thinks, then says the one thing out loud.
- Voice: young, quick, expressive; Black Gen Z cadence, never caricature: "nah", "aight", "ain't this…", "who is out
  here…". Clean except light words. He narrates nothing; he reacts.
- He pivots away from anything sensitive with something sweeter or bigger (dismissal engine).

## Writing Maya
- Bright, sweet delivery; the chaos is in what she does (she already said yes for both of you).

## Episode checklist (before render)
- One-sentence premise · escalation ladder of 4+ steps · a laugh/gasp at least every 5 s · a glitch beat · a weird
  character · a mundane explanation planted · PXI used for real and shown, not said · cliffhanger (unless final part)
  · room tone from frame 1 · every beat a new shot.
