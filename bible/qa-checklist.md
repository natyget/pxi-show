# Visual + story QA checklist (grows with every new defect type; a major hit blocks publishing)

The reviewer is a separate agent with no context. It gets: a contact sheet of the middle frame of every shot, full-size
stills of every face shot, the script, and this file. Verdict PASS/FAIL per shot with the exact fix.

## Characters
- [ ] Faces are the flat 2D decal; nothing pokes out of the head when it turns; no seam or cut line on the head.
- [ ] Skin reads as the character's skin under the scene light (Nio light-skinned, not purple/grey).
- [ ] Hair sits on the head; clothing never sits on top of hair (no hood-under-hair, no collar through the chin).
- [ ] Hands hold what they hold (phone in hand, not floating); props obey gravity.
- [ ] Nobody walks without moving; nobody walks into a wall; feet on the floor when standing, on the seat when sitting.
- [ ] Sitting reads as sitting from this angle (else move the camera).
- [ ] No near-twins in the same shot; extras differ in silhouette and colour.

## Framing
- [ ] Faces centred and framed from the real head position: no chin-only crops, no side crops, headroom kept.
- [ ] The camera is never inside a wall, machine or prop (black frames fail).
- [ ] Eyelines match across reverse shots (he looks left → the reverse is on his left).

## Motion
- [ ] No dead pauses between animations; anticipation before big moves; overlap; squash only on sharp beats.
- [ ] No hooks called conditionally (render crashes = fail).

## Screens
- [ ] PXI wording is the app's own; nothing covers the clock unless intended; text fits; readable at phone size.
- [ ] Generic app icons only (no real brands); PXI icon is the real one.
- [ ] Dates and weekdays agree with the story (Ep 1: Wednesday Nov 11; party Saturday Nov 14).

## Sound
- [ ] Room tone from frame 1; voices land on the right shot; thoughts subtitled in (parentheses); no clipping.

## Story
- [ ] Premise in one sentence; escalation; a laugh or gasp at least every 5 s; one real feeling;
      out fast; PXI shown not said, or absent on purpose; a whole release with no "Part" label.

## Added after the Ep 1 review (Nov 9)
- [ ] Insert hands use the character's own skin; fingers wrap the phone; the thumb rests OFF the screen and only enters to tap.
- [ ] No hand/thumb covers story-critical UI (buttons, timestamps, the slot where a new photo lands).
- [ ] Subtitle glyphs render correctly (the pixel font has no ( ) * : those use the fallback font).
- [ ] Story-critical screen text is big and high-contrast (e.g. the red date stamp).
- [ ] No light source blows faces or hair out to white (phones have no point light).
- [ ] Hero props read at phone size: real shape, contrasting colour (the red striped sock).
- [ ] Wardrobe reads as written (a suit has a white shirt, tie and lapels).
- [ ] No standing label or pill on screen (`bible/craft-library.md`).
- [ ] Hands have fingers; there is a neck between head and collar.
- [ ] Pupils converge (no wall-eye on angled shots).
- [ ] The face-match ring sits on the face in the in-app photo.
- [ ] In-app photos depict the beat they're for (no repeating an earlier photo).
- [ ] A reverse is from the character's eyeline, not the same axis again; the camera is never inside a character.
- [ ] An establishing wide never holds > 2 s without motion.

## Added after the founder's Ep 1 notes (Nov 9, round 2)
- [ ] No limb raised without a reason (no hand hanging in the air); props are HELD, never floating; a handed object is in the hand.
- [ ] Nothing inside furniture (legs through a bench); sitting is ON the seat from every angle.
- [ ] Heads read as heads: no balloon cranium, no pointy chin; close-ups keep the whole head with breathing room.
- [ ] Dialogue reads as a reaction, not a script: short lines, no lists, no narrating the obvious, no words copied from notes.
- [ ] Reactions land on the beat they happen (his face drops AS he sees the date, not after).
- [ ] Front-camera calls don't show the caller's own phone/hand.
- [ ] Subtitle font has no broken ligatures ("fi"); max 2 lines in split screen; never on a face.

## Added after the founder's pilot review (Nov 11)
- [ ] No idle bob: no head or body moves up and down on a loop. Listening is a held pose and a blink.
- [ ] Eyelids are drawn over the eye white in every expression and at every angle.
- [ ] Every line has a face that changes before it. Nio shows at least three clearly different faces.
- [ ] No shot of a wall, an empty room or a person waiting. No pause that is not the marked hold on an acting face.
- [ ] Every exchange of four lines or more has a reaction shot.
- [ ] The voices are the designed voices in `bible/characters.md`, with the walkie-talkie colour and nothing else, each line performed, none flat.
- [ ] Nobody states a plan to the camera. No narrator.
- [ ] Anything strange on purpose (a Kevin, a glitch) is in the intent ledger and staged as the craft library says.

## Log of defects found (date · episode · defect → fix)
- Nov 9 · pilot · 3D eyeballs poked through on head turns → flat 2D faces.
- Nov 9 · pilot · seam line on the side of heads → hair/face cut from the welded head mesh.
- Nov 9 · pilot · hood rendered under hair → no hoods; crewneck with a collar ring.
- Nov 9 · pilot · walked into the wall without moving; dead pause before next action → positions travel; overlap.
- Nov 9 · pilot · faces cropped high/sideways → frame() from the head position.
- Nov 9 · ep1 · camera inside the washers (black frame) → wider lens/shorter distance in small rooms.
- Nov 9 · ep1 · push card covered the lock-screen clock → cards sit below the time.
- Nov 9 · ep1 · conditional React hook crashed the render → read the frame once at the top of each shot.
- Nov 11 · pilot · heads bobbing on a loop, faces not acting, lids behind the eye white, dead shots of walls
  and waiting people, stand-in voices → `bible/director.md` acting rules and the checks above.
