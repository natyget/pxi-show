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
- [ ] Premise in one sentence; escalation ladder; a laugh/gasp at least every 5 s; glitch beat; weird character;
      mundane explanation planted; PXI shown not said; cliffhanger unless final part.

## Log of defects found (date · episode · defect → fix)
- Nov 9 · pilot · 3D eyeballs poked through on head turns → flat 2D faces.
- Nov 9 · pilot · seam line on the side of heads → hair/face cut from the welded head mesh.
- Nov 9 · pilot · hood rendered under hair → no hoods; crewneck with a collar ring.
- Nov 9 · pilot · walked into the wall without moving; dead pause before next action → positions travel; overlap.
- Nov 9 · pilot · faces cropped high/sideways → frame() from the head position.
- Nov 9 · ep1 · camera inside the washers (black frame) → wider lens/shorter distance in small rooms.
- Nov 9 · ep1 · push card covered the lock-screen clock → cards sit below the time.
- Nov 9 · ep1 · conditional React hook crashed the render → read the frame once at the top of each shot.
