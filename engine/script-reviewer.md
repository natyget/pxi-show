# The table read (the reviewer of every script, before anything is drawn)

Founder, Nov 18: "i need to now have a not only animation reviewer but also a script dialogue and interaction the
same way so thing look clean."

The stranger (`engine/reviewer.md`) judges the finished video. The table read judges the words and the people
before a single panel is drawn, so a weak script never costs a render. It is the only script check. Every older
checklist (the ten questions, the Nio checks, the ten Gumball checks, the script tests in `bible/story.md`, the
rubric score) is folded into it and deleted. It measures against one thing: the seven principles in
`.claude/skills/writers-room/SKILL.md`.

It runs on every script, skit, filler, fourth-wall piece, app promo and the words of every still or carousel, at
the end of WRITE and before the story sketch goes to the founder.

## Who reads, and what each is given

Three readers on **Haiku**, in parallel, each a fresh subagent. None of them sees the header, the premise, the
bible or this page beyond its own brief. If they need context to get it, so will the audience.

| Reader | Given only | Judges |
|---|---|---|
| **The cold reader** | The short-cut Script section | Does it make sense and is it funny (principles 1, 3) |
| **The ear** | The Script section with every name replaced by A, B, C | Do these people talk like people, and to each other (principles 4, 5) |
| **The room** | The Script section and the feature table in `bible/pxi-product.md` | Is the world real, does the app move the plot, is anything stale (principles 2, 6, 7) |

## The briefs, word for word

**The cold reader.** You are a 20-year-old reading this on your phone. You have never heard of this show or this
app. Answer in a line each, plainly. "Not sure" counts as a no.
1. Who is this, and where are they?
2. What did the main guy want?
3. What happened? Say it in one sentence. If you need "and then", say so.
4. What was the one strange thing, and did anyone in it act like it was strange?
5. Quote the line or the picture where you laughed. If nothing, say "nothing".
6. Would you send it to someone? Who?
End with PASS or FAIL and the one thing to fix.

**The ear.** The names are hidden. Read every line out loud in your head. Quote, do not summarise.
1. Which lines would no 21-year-old actually say out loud? (Typed, clipped, a slogan, a caption, a speech.)
2. Which lines explain: the joke, the plan, a feeling, or what the picture already shows?
3. Which lines exist only to set up the next line's comeback?
4. Can you tell A from B from C by how they talk? Name any two who sound the same.
5. Is there one exchange where two people want different things and the upper hand changes? Quote it.
6. Is the lead playing with someone (a game, a dare, a straight face) or reading out a plan? Quote it.
7. Is a face written for the turns (`[lit up]`, `[it drains out of him]`)? Name any stretch with no face change.
8. Does any line sell, pitch or describe an app?
End with PASS or FAIL and the one thing to fix.

**The room.** Quote, do not summarise.
1. Name the one absurd thing. Is everything else a real place and real people? Name a second absurd thing if
   there is one, and whether the first caused it.
2. Do the people in the background react the way people would, only when it reaches them? Quote anyone who reacts
   too early, too much, or not at all.
3. Does each beat cause the next and get bigger? Name the weakest link.
4. Does the ending turn something from the opening and stop? Quote anything after the last joke.
5. Which app feature is used, and does using it cause or pay off a beat? Would a real person use it exactly like
   that, there, that night? Is it a feature in the table you were given?
6. Name anything you have seen a hundred times: a faint, a look to camera, a crowd copying someone, "who is
   this", a lesson. Anything about race, accent or group, or anything sexual.
End with PASS or FAIL and the one thing to fix.

Then the run itself runs `python3 engine/tools/script_lint.py` and the freshness check on the stage card.

## How the run uses the answers

- **FAIL** if any reader says FAIL, any "not sure" under the cold reader's 2 or 3, "nothing" under 5, a
  quoted line under the ear's 1, 2, 3 or 8, a pair named under the ear's 4, a no under the ear's 5 or 6, a
  second unmotivated absurd thing, anything named under the room's 6, or a PXI use the room says nobody would
  make. A line the lint flags is a FAIL only if it also sounds typed when read aloud (principle 4 wins).
- The writer fixes **only** what was quoted, in role, then a **fresh** set of three readers reads it once. A second
  FAIL is `BLOCKED`, with the readers' quoted lines copied into `STATE.md`. No third try.
- The run never argues with a reader, never explains the joke to one, and never gives one more context to pass.
- The cold reader's one-sentence answer to 3 goes on the first panel of the story sketch the founder sees.
- A note that keeps coming back from the readers sharpens one of the seven principles in the skill. It never
  becomes a new rule here.
