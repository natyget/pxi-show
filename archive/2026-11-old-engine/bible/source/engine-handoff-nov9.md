# The earlier engine handoff (pasted by the founder, Nov 11)

Source text from the founder's message of 2026-11-11, word for word (the founder's own name replaced
with "[the founder]"). Kept for the record. **Runs do not read this folder.** What a run needs from it has been
written into the bible and the stage cards.

---

PXI show engine: handoff
Goal
Build a fully automated animated short-form show for PXI, posted through Metricool to the PXI LABS brand (blogId 7790844). Target platforms are IG, Facebook, TikTok and YouTube. The show is meant to replace the old meme engine, cut effort, and push out more video. Target audience is new viewers, since the account has 14 followers who barely engage. The pipeline is: idea → script → storyboard → render → independent QA → publish, with a learning loop and up to 50% of weekly usage.
Current priority (overrides everything else)
Make one decent pilot, “One Photo”, and keep remaking it until the founder likes it. Then that style becomes the standard. The founder said “this is no episode two or v2, this is the pilot.” Show scripts are not enough. The founder wants to see rendered sequences.
Creative direction

* Humour target: Gumball and Clarence, Uncle Grandpa, Regular Show, and Nathan Fielder’s deadpan commitment. Nio is confident and scheming, with ego first and fear second, and confident bad plans. He is not a nervous goof. Maya is literal and kind, and she reacts genuinely (confused, disturbed) on the beat.
* Plots should follow a mundane setup that snowballs (Regular Show and Clarence style).
* Gumball’s craft is the reference. Borrow the craft only. Don’t copy characters, lines, designs, or the show’s voice actors.
* Writing rules from the founder: no narration of what’s on screen, no lists, no “normal person thing”, no “It’s a short one!” (rejected as corny), no “aight”, no long “NAH”, no copying the founder’s words verbatim, no over-explaining. Reactions land on the beat.
* Show bible rules: entertaining first, PXI subliminal and visual, a weird character each episode, a mundane explanation Nio misses, a glitch beat, no narrator, Part N series with cliffhangers.

Look (rendered 3D toon world)

* Stack: Remotion 4.0.541, @remotion/three, React Three Fiber 8.17.10, three 0.169, in `/home/user/pxi-show/studio/anim`.
* Style: MeshToonMaterial with 3 bands, inverted-hull ink outlines, rendered to a low-res target (135×240, insert 216×384), then dithered (4×4 Bayer) and palette-reduced. Animation is on twos. 24 fps, 1080×1920.
* Faces are flat 2D canvas decals (world/face.ts) on a decal cut from the welded head mesh (world/sculpt.ts). Hair is a shell from the same head, so nothing floats or pokes through.
* Nio’s look: `'hero'` head shape, light skin `#d8a27c`, crop hair with volume, eyeScale 0.86, restLid 0.22, orange crewneck. Founder notes: attractive, not a goof; no receding jaw; hair not head-shaped; no “food in mouth” bulge; eyes not too wide.
* Maya’s look: `round` head, `puff` hair, skin `#8d5a3d`, hoops, lashes, green varsity jacket.
* Phone: keep the cream “Phone you universe” design. App UI must match the real app 1:1, in pixels (ui/PilotScreens.tsx reads from `/home/user/pxi-mobile-app`, which is reference only and must not be pushed to).

Voices (approved)
Qwen3-TTS VoiceDesign, walkie-talkie treatment, pitch shift 0. The full recipe is in the previous handoff message.
Pilot status: “One Photo” (src/PilotOnePhoto.tsx, 23 shots + END)

* Story: Maya asks Nio to take her photo at the night market. He takes it like a newborn, and the photo is of his thumb. He lies on the ground to get the shot. The stall owner holds a lamp and the sock guy holds a reflector. Blurry and pigeon photos follow. A crowd forms with phones up. Nio climbs onto the candle stall’s roof and says “Everybody quiet.” After a held silence, the countdown runs and the roof collapses. Maya’s phone reads “You might be in 214 photos”. Her album fills, and she opens the photo of Nio mid-fall. “Who took this?” The sock guy raises a hand. Nio, in the wreckage: “That was the plan.”
* Done: the shots and staging code, the 1:1 app screens, the 11 designed-voice lines treated with no pitch shift, and the sound effects (`market`, `creak` and `crash` synthesised originally in tools/pilot_sfx.py). The comps `PilotOnePhoto` and `PilotPhoto` are registered in `Root.tsx`.
* Not done: the in-show photos are not rendered (`public/photos/p_*.png`); the shots have not been stilled or checked for staging; the code is not type-checked (`tsc` needs to run from `studio/anim`, which has the config); there is no full render; no contact sheet; no independent screen.
* Next steps:
   1. Render the photos: `npx remotion still src/index.ts PilotPhoto public/photos/p_<which>.png --props='{"which":"<which>"}' --browser-executable=$B --gl=swangle`, with `which` set to thumb, blurry, pigeon, maya1–6, or fall. `$B` is `/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.
   2. Still-check each shot for staging: the lying pose, the roof height of 2.42, the collapse, the crowd, and the inserts.
   3. Full render, then a contact sheet via studio/anim/tools/qa_sheets.sh.
   4. Independent screener subagent, checked against bible/qa-checklist.md.
   5. Fix, re-encode, send the video to the founder.

Process rules

* Research first, use existing open-source tools, and don’t build from scratch. The founder has criticised this repeatedly.
* Render and show the sequence. A script alone doesn’t count.
* The independent screener must check physical bugs: raised limbs for no reason, legs through furniture, floating props, hair and clothing physics, face crops, walking through walls.
* No cut has passed an independent review yet.

Standing constraints

* Never post to @pxi.nyc.
* Never compare fees or say “cheaper than other apps”.
* Never use the founder’s photos (public/site/img/lib/t00.jpg is banned).
* Metricool: only the PXI brand, and confirm before scheduling.
* No push notifications for the channel. Chat updates only.
* No copyrighted music, art or lyrics. AI content labels on.
* Don’t create PRs unless asked.
* Keep the founder’s email private. Don’t send it to external services.
* Don’t work around sites that block automated access (the fandom wiki and the Rhubarb extraction were both blocked by the classifier).

Git

* Repo `natyget/pxi-show`, branch `claude/practical-hamilton-6ywdqs`. Push with `git push -q origin claude/practical-hamilton-6ywdqs`.
* Latest commit: `021fbcf`, the pilot work in progress.

Deferred until the pilot is approved
Automated scheduling, the studio job queue, Metricool trial-Reel posting, CTA experiments, bio-link tracking (`pxispace.com/bio?utm_source=<platform>`), and retiring the old meme engine.
