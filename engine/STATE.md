# Production state

Every run reads this file first and updates it last. Keep it under 70 lines.

phase: PILOT_LOCK
episode: pilot
stage: 0
stage_card: engine/stages/0-pilot-lock.md
next_action: Add up to three premises to engine/premise-bank.md and report status. Build nothing.
phases: PILOT_LOCK → REPLICATION (first three episodes, made from these files alone) → PRODUCTION
gate_failures: 0

## BLOCKED: pilot "No Pics" (Nov 12)

The cut (`episodes/nopics/`, built by `build.py`) failed the stranger review twice. Its words: "the middle and end
are muddled, and the app reveal reads as an ad, not a punchline"; "two phone screens of dark blurry crowds";
"Nio's face is cropped and close, almost the same pose in every shot". What the engine needs first: Maya and the
friends drawn (only Nio exists, in one room), props he can hold and use, and the approved voices (huggingface.co is
blocked in this environment).

## Open founder decisions

- **Posting is closed** until the founder watches a built episode and approves it (founder, Nov 12: "once weve
  built it i approve and once approved then we can start posting"). Then each format posts once one sample is approved.
- Supermetrics: the trial ends about Nov 14. Keep it or not (answered in the thread, Nov 12). Without it, LEARN
  uses Metricool alone and Instagram follows per reel stay "acct".
- Approve `engine/DIRECTIVE.md` (draft, rewritten Nov 11 around the head writer brief).
- Approve a pilot. "Not Me" (Nov 10) and "No Evidence" (Nov 11) were both rejected. Owned by the pilot thread,
  which now writes from `bible/writers-room.md`. Not for scheduled runs.
- Pick a look. Owned by the look thread; the first three options were rejected on Nov 11 ("ai slop").
- Does "nio dont got a penny" mean no money, or no girl he pines for? Asked in the character thread. No money
  jokes until answered.
- Keep or scrap, from the pasted brief (asked in the character thread): the stranger who was in the room the
  whole time and the glitch ending; the best friend who is only on the phone; Nio knowing he is in a show; age
  21 in a different city. Until answered these are allowed and never required.
- How often an episode may have no PXI in the picture. Working answer: at most one in four, never a holiday.
- Profile name and bio on each platform should say PXI and both searched needs (`engine/captions.md`). A
  proposal for the founder to make or approve; no run edits a profile.
- The best friend has no approved voice. Until one is picked he appears as text on Nio's phone.
- Make `main` the default branch of this repo, so scheduled runs can save state (BACKLOG item 8).
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

- 2026-11-12 · pilot · No Pics written, built and cut; failed the stranger twice; BLOCKED on cast, props and voices.
- 2026-11-12 · engine · learn scores follows, reads Supermetrics; promotion ladder (95% watchers, paused until yes); Nio-style format menu; posting waits on an approved episode.
- 2026-11-12 · engine · captions and search written and wired into package, daily and schedule.
- 2026-11-12 · bible · style handoff and world; Nio pruned to the founder's words; thirteen candidates banked.
