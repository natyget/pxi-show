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

Second batch, sampled Nov 12 by `tools/formats/batch2.py`: FIVE STAGES, SEARCH, SUPERLATIVES, DICTIONARY. Bingo and
fortune cookie were built and then dropped by the founder on Nov 13 ("nothing gen z or humerous about them").

## The bar (founder, Nov 12 and Nov 13)

A format stays only if a person would **repost it or send it to a friend**: "this is so us", "this is you", "tag
the one who does this". Funny first, relatable to a college kid's life, Gen Z in how it talks. Not cute, not
clever-for-a-brand, not a product feature with a joke on it.

- **Every post is a new observation.** Never lean on a running joke or a phrase the show has used before; the
  founder threw out the recurring "elbow" and "evidence" bits as slop. A character trait (Benji helps, Sami is
  "fine") is a person, not a catchphrase to repeat.
- **Never about the product.** The subject is the friend group's life: classes, roommates, house parties, trips,
  pickup games, birthdays. PXI goes in its slot (the caption, or a phone that is naturally in the picture), the
  way any phone brand would be in a show. Photo-sharing is one topic among many, not the theme of every post.

## Every old format, sorted against that bar

The old engine had 76 formats over 100 posts. Its wording and topics are never reused; only the shape comes over.

**Kept (27).** S = sampled, T = a tool exists for its object.

| Old format | In Nio's world | First idea | Why it gets sent on | |
|---|---|---|---|---|
| Tier list | Cork board in his room | The group chat, ranked | Everyone checks where they are | S |
| Crayon doodle | Crayon on printer paper on his desk | Saturday, drawn from memory | The blank page is the joke | S |
| Group chat | The PXI album thread on his phone | Planning a cabin trip; nobody commits to a date | Every group chat | S |
| Phone lock screen | His lock screen on the bed | Everyone's messages the morning after | One look, each friend in character | S |
| Receipt | A receipt on his nightstand | The night, itemised | "this was literally us" | S |
| Five stages | Polaroids of his faces on the board | Next: the five stages of a 9am class | His faces do the work | S |
| Search autocomplete | A phone on his desk, "how to" typed | Searches at 1:47 am | Everyone has searched these | S |
| Yearbook superlatives | A printed page on his desk | Superlatives for the friend group | Tag each friend | S |
| Dictionary entry | A dictionary page on his desk | Words only your friend group uses | Send it to the group | S |
| Moving still | A room shot where rain, lights and breathing move | Sunday | Mood post, saved | S |
| Starter pack | Things laid out on his bed, each one the engine's prop | The roommate who is "five minutes away" | Tag the friend | T |
| Venn diagram | Marker circles on the board | Things Maya cries at vs films | Tag the friend | T |
| 5 signs | Sticky notes down the board | 5 signs the pregame is going to be the whole night | Relatable | T |
| Seating chart | Paper on the board, Maya's plan in green | Friendsgiving, who cannot sit together | Every family has one | T |
| Expectation vs reality | Two polaroids of his faces | The fit at 9 pm, the mirror at 2 am | Universal | T |
| Character select | His faces as a select screen on the board | Choose your roommate | "i'm the third one" | T |
| Trading cards | A card per friend with stats | The friend group as cards | Tag each friend | T |
| Parking ticket | A ticket stuck to his door | Notice: left the group chat on read | Tag the offender | T |
| Tear-off flyer | A flyer on his door, tabs torn off | Roommate wanted, must tolerate 3 am singing | Funny on sight | T |
| Newspaper front page | A paper on his desk | Local man finally does laundry | Funny on sight | T |
| Breaking news | A news alert on his lock screen | Theo's prediction comes true, Theo unwell | Funny on sight | T |
| Playlist | His phone's music app in the show's pixels | Songs for the walk home at 4 am | Saved and shared | T |
| Guess who | Cropped polaroids of a friend on the board | Guess the friend from their shoes | People comment guesses | T |
| Lost and found | The box by the door the morning after the house party | What got left behind | "that's mine" | T |
| CAPTCHA grid | A phone screen | Select all squares with a friend who is "five minutes away" | Tag the friend | T |
| Whiteboard chart | A small whiteboard by his desk, his marker | When i say i'm leaving vs when i leave | Universal | T |
| Movie end credits | Moving still: credits roll over his room | Saturday night, the credits | Funny on sight | T |

**Dropped.** Never brought over:

- Bingo card and fortune cookie: built, sampled, and not funny or Gen Z enough (founder, Nov 13).
- Prescription label, nutrition label, weather forecast, honest side effects, tap your ___, fridge door, coffee
  punch card, wristband stack, advent calendar, transit map, sticky-note wall, report card, delivery tracker,
  censored photo: cute or clever, but nobody sends them on.
- Boarding pass and passport page, wallet passes, the Discover map post, story wrap: posts about the product.
  The PXI Passport and Discover stay as things Nio uses inside episodes.
- Price anchor, receipt comparison by fee, "don't pay 3.7%", calculator, pizza pie chart of sales, tip jars,
  fundraising thermometer, giant novelty check, bouncer clicker, "isn't for every host": fee comparisons are
  forbidden, and money is unanswered for Nio.
- Doodles on photos, contact sheet, email + caption, "size matters": built on real people's photos.
- Forum thread + promoted, zero stars billboard, "like X but for Y", "don't be an idiot", face the facts: read as
  ads or as lectures, and Nio never pitches to the lens.
- Museum wall label, split-flap board, neon sign, patches on denim: weird or uncanny (founder, Nov 12).

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
