# Stage 5: PACKAGE

**Model:** the run itself (Sonnet). Captions may be drafted by one **Haiku** subagent given the script and the
playbook.

**Read:** `engine/reviewer.md`, `episodes/<id>/script.md`, `bible/craft-library.md` (Thumbnails), `engine/playbook.md`, `engine/formats.md`, `bible/callbacks.md`,
`bible/timeline.md`.

**Do:**
1. `episodes/<id>/post.md`: for each platform, the cut, a caption (the script's Caption: one plain line and a
   lore question for the comments; then one line that PXI is a free app and what it does; no hashtag wall; the
   AI content label switched on), the cover frame, the proposed date and time,
   whether it goes out as a trial reel, and the tags for the learning ledger (format, hook, length, look, call
   to action, holiday, experiment and arm).
2. **Thumbnails.** For each video, a cover made on purpose by the rules in `bible/craft-library.md`: vertical for
   the short cut, horizontal as well for the long cut. Render with `engine/tools/render.sh still`, look at it at
   thumb size, and save it as `episodes/<id>/cover-<cut>.png`.
3. Cut the cheap releases this episode pays for: one or two LOOPs from takes and one STILL or carousel. List
   them in `post.md` with their captions.
4. Append to `bible/timeline.md` what is now canon. Add new plants to `bible/callbacks.md`, mark paid-off ones.
5. **The stranger.** Run `engine/reviewer.md` on each video with its cover. A FAIL is fixed and re-run once;
   a second FAIL is `BLOCKED`. Put the stranger's one-sentence answer at the top of the message to the founder.
   Run `engine/tools/render.sh check` on every file you are about to send. Never send the founder a file that
   fails it. Put the Retell line from the script at the top of the message, so the point is clear before play.
6. **Ask the founder.** Send the short cut (and the long cut if ready) with its cover as one message that
   reaches the founder as an app notification, with one question: "Approve to schedule?" List the dates. Then
   stop. This is the only notification a release sends; everything else stays in the chat.

**Gate:** the founder's answer. Record it word for word in `STATE.md`. "Approve" moves to stage 6. Notes are
recorded under Founder notes in `bible/show-bible.md` and send the piece back to the stage they concern. Never
schedule, post or publish from this stage.
**Next:** stage 6 after approval.
