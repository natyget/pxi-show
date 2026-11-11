---
name: writers-room
description: Write a PXI LABS episode (45–60 s animated short) through a staged writers' room - pitch, beat sheet, jokes, independent critique by isolated reader personas, punch-up, a de-AI pass, and a shot list. Use for every new episode or rewrite before anything is rendered.
---

# PXI LABS writers' room

Read first: `bible/writers-room.md`. It is the role you take on, and it and the other files on the stage card
(`engine/stages/1-write.md`) win over anything below that disagrees with them. Run the stages in order. In a scheduled run the
only file left behind is `episodes/<id>/script.md`; the shot list (stage 7) is made in the BOARD stage.

Sources this is built from (re-implemented in our own words; see CREDITS.md): sb-dev/narrative-production-skills,
jtydhr88/screenwriting-skills (sitcom-comedy, dialogue), eternityspring/shuohao-skills, 0xhughs/director-skills,
danjdewhurst/story-skills (reader-panel), ccf/humanize, shir-danishyar/humanize, blader/humanizer,
ameenmo/humanize-skill, and the idea of isolated audience critics from talsraviv/comedy-writers-room (unlicensed: idea only).

## Stage 1: Pitch
- Write 6 loglines in the form "Nio wants X, but Y weird thing happens, and he responds by Z". They must differ
  in *comic logic* (what's funny and why), not wording. Throw away the first two you thought of. Start from a
  real story (`engine/real-stories.md`) or a machine in `bible/gumball-lens.md`.
- Each must be funny with PXI taken out. Then decide honestly whether PXI is its engine, a moment, or absent
  (`bible/story.md`, section 4). Never bend the story to fit a feature.
- **Premise-machine test:** could this premise make five more jokes without wordplay? If you have to force puns, the
  premise is wrong. Keep the best two; lock one as APPROVED (an approved choice becomes a constraint, not a suggestion).

## Stage 2: Beat sheet
- Six beats: hook (by 1.5 s), setup, absurd turn, escalation, emotional hit, glitch button (`bible/story.md`,
  section 2).
- Each beat is *caused* by the one before and is *bigger*. Nio's own ego, trolling or inability to say no makes
  it worse. Everyone else stays calm.
- It ends on the glitch with nothing resolved. No lesson, no epilogue, no inner acceptance.
- A scene card per beat: want / obstacle / turn.

## Stage 3: Jokes and dialogue
- Write punchlines first, then build the setup backwards. Setups are plausible, two-part (topic + complication) and
  never hint at the punch. The punch word goes last. Don't talk past the joke.
- One runner that returns twice; the last return is a reversal.
- Mark every place a *take* (a face, a held silence) or a visual gag beats a line, and use the take.
- Write the conversation before the jokes: two people who want different things, four to eight lines, status
  changing hands (`bible/voice-and-dialogue.md`). Write every change of face in brackets.
- Nio: quick and natural with a live face; trolls with questions; pivots. Maya: sweet, earnest, literal,
  funny without trolling. The best friend: a real phone call.
- Budget: 100–130 spoken words for 60 s, 60–80 for a 35 s short cut. Estimate runtime (≈2.3 words/s spoken,
  ≈2.5 s per action beat, plus takes) and keep it within ±15% of the target.
- Inner thoughts are allowed but rare and *for a reason*: thinking while someone else is in the room, or one glance to
  the lens. Never narrate what the picture shows. Never have Nio state his plan to the camera.

## Stage 4: Independent critique (separate subagents, each sees only the script and its own brief)
Spawn the critics in parallel on the cheapest model. They score and quote lines; they never rewrite. In a scheduled
run the Tells Auditor is replaced by `engine/tools/script_lint.py` plus one read of `tells.md` by the writer.
1. **The Skeptic**: what's heard-before or predictable? Which beat did you see coming and when?
2. **The Literal Viewer**: what confuses a literal-minded viewer ("wait, how did…")? Where does logic break?
3. **The Nine-Year-Old**: at which second do I get bored? What made me actually laugh (circle it)?
4. **The Tells Auditor**: run `tells.md` against every line; quote each hit.
Agreement between critics is not independent confirmation; weigh specifics over consensus.

## Stage 5: Punch-up
- Fix only what was flagged. For each weak line write three alternatives; keep one only if it beats the original.
  Top a joke at most twice. Cut jokes go in `episodes/<id>/room/candy-bag.md` for later.
- Then the read-aloud test: a guy at 2 a.m. telling his best friend what happened. Rewrite what sounds like a
  YouTuber.
- Score with `rubric.md`. Ship at 40/55 or above with no veto; otherwise loop to stage 4 once with fresh critics.

## Stage 6: De-AI pass (preserve mode)
- Audit table: each tell found → line → fix. Fix only what fired. Cutting is safe; additions must be justified.
- Then re-check: did line lengths get more uniform? (Humans vary; flattened rhythm fails.) Read every line aloud.
- Say what's working, so a later edit doesn't kill it.

## Stage 7: Shot list
- 12–22 shots, 1–5 s each. Each shot claims specific beats, has one purpose (geography, emotion, reveal, action,
  detail, insert, button) and one dominant subject/action. Locked-off camera, at most one move.
- Each line's seconds fit its shot. Track continuity: who sits where, what's in which hand, eyelines, screen direction.
- A shot list that just restates the script is a fail: say what the camera does for the joke.
