# Production state

Every run reads this file first and updates it last. Keep it under 70 lines.

phase: PILOT_LOCK
episode: office-hours
stage: 0
stage_card: engine/stages/0-pilot-lock.md
next_action: Office Hours is boarded (episodes/office-hours/shots.md; voice jobs in studio/voice/jobs_office-hours.json). Build it as the design thread delivers Prof H, the waiting room, the lecture hall, the corridor, the office and the pitch, and once voices can be made (huggingface.co is refused by this session's proxy). Build nothing else.
phases: PILOT_LOCK → REPLICATION (first three episodes, made from these files alone) → PRODUCTION
gate_failures: 0

## Next render: "The Move" (season 1, episode 1)

Scripts: `episodes/season-1/episodes.md` (six, in posting order); plan: `episodes/season-1/series-plan.md`. "No
Pics" is retired. The Move is built when the design thread delivers what the plan's last section lists: the club
set, the friends and a reusable crowd, Nio's real hand on the phone, a phone-lens camera, the PXI flash and filter
in the world, and mouth shapes from the audio. The cast (Maya, Sami, Theo, Imane) is approved. Voices still need
huggingface.co allowed, and Theo, the girl and the club chant need voices the founder approves by ear.

## Learning and ads: paused (founder, Nov 13)

"we'll skip metricool for now until we see better results till then ill run ads manually". LEARN does not run.
No campaign is built or proposed by a run; `engine/promotion.md` stays as the plan for later.

## Open founder decisions

- **Posting is closed** until the founder watches a built episode and approves it (founder, Nov 12: "once weve
  built it i approve and once approved then we can start posting"). Then each format posts once one sample is approved.
- Approve `engine/DIRECTIVE.md` (draft, rewritten Nov 11 around the head writer brief).
- Approve a pilot. "Not Me" (Nov 10) and "No Evidence" (Nov 11) were both rejected. Owned by the pilot thread,
  which now writes from `bible/writers-room.md`. Not for scheduled runs.
- Does "nio dont got a penny" mean no money, or no girl he pines for? Asked in the character thread. No money
  jokes until answered.
- Keep or scrap, from the pasted brief (asked in the character thread): the stranger who was in the room the
  whole time and the glitch ending; the best friend who is only on the phone; Nio knowing he is in a show; age
  21 in a different city. Until answered these are allowed and never required.
- How often an episode may have no PXI in the picture. Working answer: at most one in four, never a holiday.
- Profile name and bio on each platform should say PXI and both searched needs (`engine/captions.md`). A
  proposal for the founder to make or approve; no run edits a profile.
- The best friend has no approved voice. Until one is picked he appears as text on Nio's phone.
- Confirm the cadence in section 12 of the directive, then switch on the scheduled tasks in `engine/ROUTINES.md`.
- Thanksgiving (26 Nov): a full episode needs the pilot approved by about 16 Nov. Otherwise it gets a cheaper
  format and the first holiday episode is New Year's Eve.

## Decided

- Ads (founder, Nov 12): $1 a day each, and the best performer gets more budget (`engine/promotion.md`).
- Posts between episodes are gen-z funny and relatable; the uncanny ones are scratched (founder, Nov 12).
- Voices (founder, restated Nov 11): the designed Qwen3-TTS voices for Nio and Maya, in `bible/characters.md`,
  with the walkie-talkie colour (picked by ear on a decision card, Nov 11).
- Backlog tools (founder, Nov 11: "yes i say yes to that too"): to be built in their own thread on a cheaper
  model.
- Push notifications are on and Metricool is connected (founder, Nov 11).

## Founder approvals (word for word, dated)

- (none yet)

## Parked

- Ep 2 "Forty-Seven" (`episodes/ep2/room/`): the founder rejected its humor as forced. Do not build it. Its
  premise may come back through the bank only if rewritten through `bible/writers-room.md`.
- Ep 1 and its Part 2: from before Nio was PXI's maker. Not canon unless the founder brings them back.

## Queue (two weeks of releases, written by PLAN once the pilot is approved)

- (empty)

## Run log (newest first, keep five)

- 2026-11-13 · pilot · Office Hours (episode 1 now) boarded: 40 shots, short 71 s, long 82 s; voice jobs written.
- 2026-11-13 · pilot · speech mouths from the voice audio (lipsync.py, src/lips); The Move on hold for the rewrite, Potential first.
- 2026-11-13 · pilot · The Move boarded: 21 shots, about 46 s short cut; POV device added to the craft library; voice jobs written, not generated.
- 2026-11-13 · bible · founder notes on the draft: nothing carried over, PXI as the phone his world runs on, engine continuity; LEARN paused.
- 2026-11-12 · pilot · No Pics written, built and cut; failed the stranger twice; BLOCKED on cast, props and voices.
