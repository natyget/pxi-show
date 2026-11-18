---
name: writers-room
description: Write a Nio World skit or episode the Gumball way, from a real, slightly shameful want to an ending pushed all the way, with PXI in the plot. Use for every new story or rewrite before anything is drawn or rendered.
---

# Nio World writers' room

This replaces the pile of note-by-note rules. Every founder note so far is a case of one of the seven principles
below. When a new note arrives, find which principle it breaks and sharpen that principle. Do not add a new rule.

## The seven principles

1. **Start from something real and a bit shameful.** Gumball's room mines the crew's own most embarrassing
   moments and pushes them into comedy. Our version: a real thing a 21-year-old wants or is embarrassed by
   (waving at the wrong person, a dead party, a friend who can't handle a drink). A stranger knows within
   3 seconds who Nio is with, where they are, and what he wants.
2. **One absurd thing. Everything else is real.** The chaos has to be motivated. The rooms make sense: kickbacks
   happen in Nio's living room, and the apartment looks like his room. Bystanders get on with their night and
   only react when the absurd thing reaches them, and then they react the way people actually would: groan,
   gasp, boo, tell someone to leave.
3. **Every beat causes the next, and it goes all the way.** Link beats with "so", "but" or "because", never
   "and then". Each beat is bigger than the last, pushed further than feels safe. The ending pays off something
   from the opening and leaves no dead air after it.
4. **People talk like people.** Read every line aloud and ask whether a 21-year-old at this exact place would say
   it. Lines are loose and full ("it's all in your head gang, you gotta will it"), never clipped or written.
   Every line fits the room it's said in. Hands match the words. A pause only stays if someone is acting in it.
5. **Nio makes it worse, and his face tells the story.** He is sharp, vain and certain, and he's the one who shows
   what not to do: his pride or his plan drives every escalation. The viewer follows the plot by watching his
   face react to the other characters, never the camera. He is never a goof.
6. **PXI is how the plot moves.** In every skit, someone uses one real feature (event page, invite, shared album,
   camera, map, notifications) in the way a person would, and that use causes or pays off a beat. It is never a
   logo, never sold. Only features listed in `bible/pxi-product.md`.
7. **Nothing stale, nothing cheap.** No stock bits: fainting, looks to camera, a crowd copying Nio, "who is this",
   and everything on the slop list. No jokes about a race, accent or group. Nothing sexual. It suits a 16-year-old.

## How a Gumball story is built (adapted)

- **The premise is one sentence.** Bocquelet writes premises as a single line on his phone. If ours needs two,
  it is two skits.
- **The rule of the game.** Name the one absurd rule, then find five escalations of it before writing a line. If
  you can't find five, the premise is wrong.
- **The double act.** Nio's certainty against a friend who goes along sincerely (Maya, Sami, Theo). The friend's
  calm makes Nio's plan look bigger.
- **Polite people going along.** The biggest laughs come from reasonable people accepting something unreasonable,
  until one of them finally says the obvious thing.
- **Spectacle on the turns.** Each escalation lands with something you see and hear: a camera push-in, a short
  shake, a sound hit, a costume or world change. Then a reaction shot.
- **The button.** The last beat turns the rule back on itself or on Nio, using something already on screen, and
  then we cut.

## Stage 1: Write (skit 25 to 40 s, episode 45 to 60 s)

1. Write the one-sentence premise and the rule.
2. List five escalations. Keep the best three or four. Mark where PXI causes or pays off a beat.
3. Write the button first. Then write the beats backwards to set it up.
4. Write the lines. Read them aloud as the character. Rewrite any line that sounds typed.
5. Cold read. Describe the skit in one sentence. If it needs "and then", fix the skit.
6. Check it against the seven principles, one at a time. A miss goes back to the step that caused it.
7. Hand off as a visual story sketch (panels with the lines under them), never as a script file.

In a scheduled run, read the files on the stage card you were given (`engine/stages/1-write.md`). Where any bible file
disagrees with the seven principles above (for example, one that lets PXI be absent, or one that caps line length),
the principles win (founder, Nov 18). The only file left behind is `episodes/<id>/script.md`, and the founder sees it
as a visual story sketch (template: `episodes/skits/launch-skits.html`). Lint with `engine/tools/script_lint.py`, but
the lint never overrides principle 4: a line that sounds like a person beats a line that hits a word count.

## Stage 2: Independent critique (separate subagents, each sees only the script and its own brief)
Spawn the critics in parallel on the cheapest model. They score and quote lines; they never rewrite. In a scheduled
run the Tells Auditor is replaced by `engine/tools/script_lint.py` plus one read of `tells.md` by the writer.
1. **The Skeptic**: what's heard-before or predictable? Which beat did you see coming and when?
2. **The Literal Viewer**: what confuses a literal-minded viewer ("wait, how did…")? Where does logic break?
3. **The Nine-Year-Old**: at which second do I get bored? What made me actually laugh (circle it)?
4. **The Tells Auditor**: run `tells.md` against every line; quote each hit.
Agreement between critics is not independent confirmation; weigh specifics over consensus.

## Stage 3: Punch-up
- Fix only what was flagged. For each weak line write three alternatives; keep one only if it beats the original.
  Top a joke at most twice. Cut jokes go in `episodes/<id>/room/candy-bag.md` for later.
- Then the read-aloud test: a guy at 2 a.m. telling his best friend what happened. Rewrite what sounds like a
  YouTuber.
- Score with `rubric.md`. Ship at 40/55 or above with no veto; otherwise loop to stage 2 once with fresh critics.

## Stage 4: De-AI pass (preserve mode)
- Audit table: each tell found → line → fix. Fix only what fired. Cutting is safe; additions must be justified.
- Then re-check: did line lengths get more uniform? (Humans vary; flattened rhythm fails.) Read every line aloud.
- Say what's working, so a later edit doesn't kill it.

## Stage 5: Shot list
- 12–22 shots, 1–5 s each. Each shot claims specific beats, has one purpose (geography, emotion, reveal, action,
  detail, insert, button) and one dominant subject/action. Locked-off camera, at most one move.
- Each line's seconds fit its shot. Track continuity: who sits where, what's in which hand, eyelines, screen direction.
- A shot list that just restates the script is a fail: say what the camera does for the joke.
