# Production state

Every run reads this file first and updates it last. Keep it under 70 lines.

phase: PILOT_LOCK
episode: pilot
stage: 0
stage_card: engine/stages/0-pilot-lock.md
next_action: Add up to three premises to engine/premise-bank.md and report status. Build nothing.
phases: PILOT_LOCK → REPLICATION (first three episodes, made from these files alone) → PRODUCTION
gate_failures: 0

## Open founder decisions

- Approve `engine/DIRECTIVE.md` (draft, rewritten Nov 11 around the head writer brief).
- Approve a pilot. "Not Me" (Nov 10) and "No Evidence" (Nov 11) were both rejected. Owned by the pilot thread,
  which now writes from `bible/writers-room.md`. Not for scheduled runs.
- Pick a look. Owned by the look thread; the first three options were rejected on Nov 11 ("ai slop").
- Who Nio is, how he talks and the writer's role are owned by the thread "Write Nio's character and stories".
  `bible/characters.md` holds the founder's answers of Nov 11 until that thread's output replaces it.
- Voices are clean, without the walkie-talkie colour, until the founder has heard both and picks.
- How often an episode may have no PXI in the picture. Working answer: at most one in four, never a holiday.
- The best friend has no approved voice. Until one is picked he appears as text on Nio's phone.
- Make `main` the default branch of this repo, so scheduled runs can save state (BACKLOG item 8).
- Confirm the cadence in section 12 of the directive, then switch on the scheduled tasks in `engine/ROUTINES.md`.
- Thanksgiving (26 Nov): a full episode needs the pilot approved by about 16 Nov. Otherwise it gets a cheaper
  format and the first holiday episode is New Year's Eve.

## Decided


- Voices (founder, restated Nov 11): the designed Qwen3-TTS voices for Nio and Maya, in `bible/characters.md`.
- Backlog tools (founder, Nov 11: "yes i say yes to that too"): to be built in their own thread on a cheaper
  model.
- Push notifications are on and Metricool is connected (founder, Nov 11).

## Ready to schedule

- Stage 6 is written. The first post is scheduled in the run after the founder approves the next cut, provided
  the Metricool connector is on for that run.

## Founder approvals (word for word, dated)

- (none yet)

## Parked

- Ep 2 "Forty-Seven" (`episodes/ep2/room/`): the founder rejected its humor as forced. Do not build it. Its
  premise may come back through the bank only if rewritten through `bible/writers-room.md`.
- Ep 1 and its Part 2: from before Nio was PXI's maker. Not canon unless the founder brings them back.

## Queue (two weeks of releases, written by PLAN once the pilot is approved)

- (empty)

## Run log (newest first, keep five)

- 2026-11-11 · bible · rewritten around the head writer brief: the room, Nio, six beats, the Kevin, dialogue,
  acting, the Gumball lens, story intake, voices locked. Pilot, look and Nio threads still open.
- 2026-11-10 · setup · directive, stage cards and tools written; waiting for founder approval.
