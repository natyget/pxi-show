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

Built and sampled in the second batch (Nov 12, the founder liked the first five and asked for every funny,
relatable format from the old engine): FIVE STAGES, BINGO, SEARCH, SUPERLATIVES, DICTIONARY, FORTUNE, made by
`tools/formats/batch2.py`.

## Every old format, sorted (founder, Nov 12: keep the Gen Z funny relatable ones, drop the weird uncanny ones)

The old engine had 76 formats over 100 posts. Its wording and topics are never reused; only the shape comes over.

**Kept. Each has its object in Nio's world and a first idea.** (S = sampled, T = a tool exists for its object.)

| Old format | In Nio's world | First idea | |
|---|---|---|---|
| Tier list | Cork board in his room | The group chat, ranked | S |
| Crayon doodle | Crayon on printer paper on his desk | Saturday, drawn from memory | S |
| Group chat | The PXI album thread on his phone | Theo's Roof the morning after | S |
| iPhone Notes, Texts from mom | His lock screen on the bed | Everyone's messages the morning after | S |
| Receipt comparison | A receipt on his nightstand that itemises the night | Theo's Roof, 02:47 | S |
| Five stages | Polaroids of his faces on the board | Waiting for the pics | S |
| Bingo card | Maya's card on the board, her green pen | Night out bingo | S |
| Search autocomplete | A phone on his desk, the search bar typed "how to" | What you search the morning after | S |
| Yearbook superlatives | A printed page on his desk | Theo's Roof superlatives; only his photo was sent | S |
| Dictionary entry | A dictionary page on his desk | pic debt, outside, one more song | S |
| Fortune cookie | The slip on his desk next to the takeout | You will be in many photos | S |
| Moving still (from the video formats) | A room shot where only rain, lights and breathing move | Sunday | S |
| Starter pack | Things laid out on his bed, each one the engine's prop | The Theo starter pack | T |
| Two- and three-circle Venn | Marker circles on the board | Maya's love life vs a film she is rooting for | T |
| 5 signs | Sticky notes down the board | 5 signs Benji is already outside | T |
| Sticky-note wall | The board covered in his notes | Things i said i'd do this weekend | T |
| Seating chart | Paper on the board, Maya's plan in green | Friendsgiving, who sits away from Theo | T |
| Expectation vs reality | Two polaroids of his faces | The outfit, the photo you get sent | T |
| Character select | Polaroids of his faces as a select screen on the board | Choose your Nio for tonight | T |
| Trading cards | A card per friend with stats, his photo the only real one | Benji: helpfulness 99, accuracy 4 | T |
| Report card | Printed page on his desk | Sami's report card for the night | T |
| Prescription label | A pill bottle label on his nightstand | Prescribed by Dr Maya: one honest answer a day | T |
| Parking ticket | A ticket stuck to his door | Notice: parked in the group chat, said nothing | T |
| Nutrition label | Printed on the side of the takeout | Nutrition facts of one more song | T |
| Weather forecast | His phone's weather screen | The forecast for Saturday, Theo's version | T |
| Tear-off flyer | A flyer on his door, tabs torn off | Missing: every photo of me | T |
| Newspaper front page | A paper on his desk | Local man still outside (Benji) | T |
| Breaking news drop | A news alert on his lock screen | Sami is fine, sources say | T |
| Honest side effect | Small print on a box on his desk | Side effects of going out with Theo | T |
| Playlist | His phone's music app in the show's pixels | Songs for the walk home | T |
| Guess who I am | Polaroids of a friend, cropped, on the board | Guess the friend from their shoes | T |
| Tap your ___ | Polaroids of his faces, "tap your mood" | Tap your Sunday | T |
| Lost and found box | A box by his door | What Benji is holding for people | T |
| Fridge door | His fridge, magnets and notes | The flat's fridge, mostly Maya's notes | T |
| Coffee punch card | A card in his wallet | Two more nights to a free one | T |
| Wristband stack | His wrist, a phone photo from the bed | A wrist full of Saturdays | T |
| Boarding pass, passport page | The PXI Passport on his phone | His stamps from the month | T |
| Wallet passes | His phone's wallet with PXI tickets | His weekend, as tickets | T |
| CAPTCHA grid | A phone screen | Select all squares with Benji in them | T |
| Weather, calendar, map ("always something to do") | PXI's Discover map on his phone | Tonight, near him | T |
| Whiteboard chart | A small whiteboard by his desk, his marker | Photos taken of me vs photos sent to me | T |
| Movie end credits | Moving still: credits roll over his room | Saturday night, the credits | T |
| Advent calendar | Paper doors on the board | December, one plan a day | T |
| Story wrap | PXI's Night Wrap on his phone | His night, wrapped | T |
| Transit map | Marker map on the board | The weekend line: roof, laundromat, home | T |
| Delivery tracker | His phone | Your photos are out for delivery (since Tuesday) | T |
| Censored photo, censored then revealed | A polaroid with a sticky note over it, then lifted | The one photo of him that got sent | T |

**Dropped.** Never brought over:

- Price anchor, receipt comparison by fee, "don't pay 3.7%", calculator, pizza pie chart of sales, tip jars,
  fundraising thermometer, giant novelty check, bouncer clicker, report cards for events, "isn't for every host":
  fee comparisons are forbidden, and money is unanswered for Nio.
- Doodles on photos, contact sheet, email + caption, "size matters": built on real people's photos.
- Forum thread + promoted, zero stars billboard, "like X but for Y", "don't be an idiot", face the facts: read as
  ads or as lectures, and Nio never pitches to the lens.
- Museum wall label, split-flap board, neon sign, patches on denim: the weird or uncanny ones the founder asked to
  drop, or needing a set the show does not have.

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
