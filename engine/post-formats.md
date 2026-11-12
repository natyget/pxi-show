# Post formats in Nio's world (the STILL and LOOP rows of `engine/formats.md`, in detail)

Every post is Nio World. The old engine's formats (tier lists, crayon, receipts, phone screens, stills with small
moving parts) live on as **objects in Nio's world**, drawn in the show's pixels by the show's engine. Never a flat
graphic with a cartoon pasted on, never the old posts' wording, never a fee comparison.

Samples of each, made by the tools below (Nov 12): `/mnt/project-files/nio-formats/`. Status: **waiting on the
founder's review.** Nothing here ships until the founder approves the format.

## The rules every post format follows

1. **It is a thing in his world.** The cork board in his room, paper on his desk, his phone, a receipt on his
   nightstand, a room shot from the engine. Name the object and where it sits before drawing anything.
2. **The cast in character.** Each line on it is something a character would write, by their own logic
   (`bible/characters.md`, `/mnt/project-files/nio-soul/bible/world.md`). Nio in marker or his phone; Maya in her
   green pen, sincere; Benji helping slightly wrong; Theo in percentages; Sami formally fine.
3. **One soft beat.** A carousel has one small real moment (Maya's note, "no. keep them long"), and no lesson.
4. **The friend test for every string** (`bible/craft-library.md`, Words on screen). Lower case, whole thoughts,
   no labels joined by dots, no number contrasts as drama. App wording inside a PXI screen is the app's own.
5. **PXI in its slot.** The last slide of a carousel, or in the picture of a still, plus the caption. Shown, never
   sold. PXI screens come from `studio/anim/tools/pxi/` (the app 1:1 in the show's pixels) and keep the app's text.
6. **No money jokes** until the founder answers the "dont got a penny" question. Receipts itemise the night, not
   prices. Never compare fees.
7. **Sizes.** Feed posts 1080 x 1350, built on a 540 x 675 board (2 final pixels a pixel); the world drawn at
   270 x 338 (4 final pixels a pixel). Loops 1080 x 1920 from the engine's native 180 x 320. A GIF copy at 540 x 960.
8. **Sound.** A loop sent as a video has sound (room tone, rain) and passes `engine/tools/render.sh check`.
9. **The stranger** (`engine/reviewer.md`) reviews every post before it goes to the founder, like a video.

## The formats

| Format | Object in the world | Slides | Tool | Cost |
|---|---|---|---|---|
| TIER LIST | Nio's cork board in his room: title strip, tier squares cut from card, paper strips in marker, a "me tier" scrap taped on top, Maya's green sticky note | 1 Nio in front of the board (smug, arms crossed); 2 the whole board; 3 close-up of the soft beat; 4 the phone with the PXI album thread and his sticky note | `tools/formats/tier.py` | Very low |
| CRAYON | Printer paper on his desk, drawn by Nio in crayon, bad on purpose | 1 to 3 the story in drawings; 4 the picture-joke page; 5 his phone lands on the page with PXI's notification | `tools/formats/crayon.py` | Very low |
| PHONE STILL | His phone face up on the bed: the lock screen with his people's messages and one PXI notification | 1 | `tools/formats/stills.py` (`still_lock`) | Very low |
| PAPER STILL | A receipt (or report card, ticket, flyer, label) lying in his room, itemising something that should not be itemised | 1 | `tools/formats/stills.py` (`still_receipt`) | Very low |
| MOVING STILL | A room shot where only small things move: rain, lights, breathing, a phone glow | 2 to 3 s loop, MP4 with sound and a GIF | engine `N3Shot` spec + `tools/nw_finish.py seq`, see below | Low |

Old formats that move onto the same objects: on the cork board, bingo cards, starter packs, Venn diagrams, five
signs, sticky-note walls, seating charts; on his phone, search history, the calculator, wallet passes, boarding
passes and the PXI Passport; on paper, dictionary entries, report cards, parking tickets, prescription labels,
tear-off flyers, newspaper front pages. Dropped for good: price anchors, fee receipts, "don't pay 3.7%", and
anything built on real people's photos.

## How to make one

Run from `studio/anim` (needs `npm ci` once).

- Words first. Write every string in the post's file at the top (`TITLE`, `ROWS`, `P1`..., `LOCK_NOTES`,
  `RECEIPT`). A new post of an existing format is a copy of the script with new words, not new drawing code.
- `python3 tools/formats/tier.py <out_dir>`, `crayon.py <out_dir>`, `stills.py <out_dir>`.
- Nio in a post comes from the engine through `kit.world(props, w, h)` (cached by its props), cut out of a studio
  frame with `kit.cutout()` when he stands in front of an object. Faces and poses are only those in
  `src/nw3d/face.ts` and `src/nw3d/world.ts`.
- Moving still: write a shot spec, check it, render, finish, encode:
  ```
  echo '{"set":"nioRoom","camera":"bed","frames":48,"actors":[{"who":"nio","at":"bedEdge","action":"sit","face":"asleep","hold":"phone"}]}' > spec.json
  tools/n3_check.sh spec.json
  npx remotion render src/index.ts N3Shot raw --sequence --image-format=png --props="{\"spec\":$(cat spec.json)}" --gl=swangle --browser-executable=/opt/pw-browsers/chromium
  python3 tools/nw_finish.py seq raw fin --scale 6
  ```
  then encode the MP4 with sound and a GIF (see the samples' commands in the thread "Remake post formats in Nio's
  world"), and run `engine/tools/render.sh check` on the MP4.
- Handwriting fonts are open-licence Google Fonts in `public/pxi-ui/fonts/hand/` (Gochi Hand for Nio, Caveat for
  Maya, Permanent Marker, Patrick Hand, VT323 for receipts).

## Where they go in the week

The STILL and LOOP days of `engine/formats.md` (days 2, 4 and 6). A carousel is the default for day 4. LEARN
moves the mix: a format that wins on follows and shares gets more days; one that loses twice is rested.

## Open with the founder

- Which of the five sample formats to keep, change or drop.
- The friends' working names and "Theo's Roof".
- Whether PXI notifications for album thread messages exist in the app, and their wording, before a phone still
  shows one (the samples only show the App Store notification "You're in 14 new photos").
