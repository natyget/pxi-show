# Nothing by accident (the standard that keeps the show from reading as machine-made)

Founder, Nov 10: the show "can be eerie and weird just in gumball manner and adventure time or cartoon network
style. not weird because he has a hat starting from the middle of his face when its supposed to be a regular
shot. weirdness and uncanniness should be intentional and on purpose not because it wasnt paid enough attention
to."

A viewer forgives a cheap show. A viewer does not forgive a careless one. What reads as "AI made this" is almost
never the style. It is a detail nobody looked at. So every strange thing is either declared or it is a defect.

## 1. The intent ledger

`shots.md` ends with a table called **Intent ledger**. Every deliberately strange thing in the release has a row:

| Shot | What is strange | Why it is there | How a viewer knows it is on purpose |
|---|---|---|---|
| 14 | The kid with the balloon never blinks | He is the weird character; only Nio notices | Held for two shots, and Nio looks at him |

Rules for a ledger entry:
- It is **staged**: framed, held, or reacted to. An odd thing that flashes past unframed reads as a glitch.
- It is **consistent**: the same in every shot it appears in.
- It **costs or reveals** something. Strange for decoration is cut (`bible/humor.md`). A script may declare one unexplained thing (a Kevin), staged on purpose and written in the ledger.
- A dream or a filler in a different look is one ledger entry for the whole piece, with the look named.

At review, anything strange that is not in the ledger is a defect, even if it looks good. The reviewer never
gives the benefit of the doubt.

## 2. The accident check

Run by a reviewer with no context, on the contact sheets and the audio, shot by shot. One hit fails the shot.

**Attachment and bodies**
- Hair, hats, glasses, hoops and collars sit where they belong from this angle. Nothing starts in the middle of
  a face, floats off the head, or passes through it.
- Hands have the right number of fingers and wrap what they hold. Nothing floats. Nothing is inside furniture.
- Pupils converge. Both eyes are on the face. The mouth is closed when no one is speaking, and looks empty.
- Feet are on the floor. A walking body travels. There is a neck.
- Background people differ from each other and move like people.

**Continuity**
- The same character has the same face, hair, clothes and scale in every shot.
- Light direction, time of day and the set match across a cut. Props stay where they were left.
- What is in which hand stays there until we see it move.

**Picture**
- No black frames, frozen frames, clipping, z-fighting, or camera inside an object.
- No face or hair blown out to white. No large flat area where a surface should have detail.
- Text on screens and signs is real, spelled right, the same in every frame, and readable at phone size.

**Sound**
- The voice has breaths, emphasis and changes of pace. A flat, even read fails and is re-performed.
- Mouths close on b, p and m, and the mouth moves only while the line is heard.
- No clipping, no dead air, room tone from the first frame.

**Craft** (`bible/craft-library.md`)
- Each device reads as what it is: picture, sound and the way in and out all change together.
- Nothing the viewer must understand is faster than the pacing floors. The stopwatch test passes.
- No standing label, no unneeded text, no stray characters after numbers or anywhere else.
- The voices are the approved ones, with no bubbly, metallic or underwater sound.
- Curves are smooth under the pixels. Hands are shaped, not cylinders. The file is not soft or blocky.

**Writing**
- The dialogue passes `engine/tools/script_lint.py` and `.claude/skills/writers-room/tells.md`.
- Captions are written by a person's rules: the joke first, plain words, no hashtag wall, nothing that sounds
  like an ad.

## 3. The rig check

Whenever `studio/anim/src/world/Character.tsx`, `face.ts`, `sculpt.ts` or anything worn changes, render the rig
sheet before the character is used in a shot: each character from eight angles, in each expression, standing and
sitting, with every worn item. Look at the whole sheet. A defect found here is fixed in the rig, once. A defect
found in an episode means the rig check was skipped, and the fix goes into the rig, not the shot.

## 4. Habits that keep work from looking generated

- **Decide before you make.** The true thing, the beats and the shot purposes are written before anything is
  rendered. Nothing is kept because it happened to come out.
- **Specific over smooth.** Keep the odd, exact detail. Sand nothing down to average.
- **Direct the light and colour.** Every scene has a named light source and a palette from the style lock.
- **Hide what the pipeline does badly.** If hands or crowds are weak, compose the shot so they are not the
  subject. Never ship a weak close-up of them.
- **Imperfection on purpose.** Animation on twos, a held frame, a camera that drifts slightly. Perfectly smooth
  motion reads as machine motion.
- **Little text in the world.** The phone screens carry the text, and they are built from the app's code.
- **Cut anything that adds nothing.** A shot, a line or a post that is only there to fill time is removed.
- **Do not publish what you would not watch.**

## 5. Platforms

- Platforms rank original work up and repetitive, mass-produced work down, and accounts that mostly repost are
  not recommended to people who do not follow them. Every release is original, and no two share a template so
  closely that they read as the same video.
- No watermark from another app on any upload. Export clean files.
- The show is plainly a cartoon. YouTube asks for an AI disclosure only when made or altered content looks
  realistic, and says clearly unrealistic animation does not need one. Check each platform's current rule at
  the first upload and once a quarter, and write the answer in `engine/playbook.md`.
