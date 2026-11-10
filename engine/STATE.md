# Production state

Every run reads this file first and updates it last. Keep it under 60 lines.

phase: PILOT_LOCK
episode: pilot
stage: 0
stage_card: engine/stages/0-pilot-lock.md
next_action: Add up to three premises to engine/premise-bank.md and report status. Build nothing.
phases: PILOT_LOCK → REPLICATION (first three episodes, made from these files alone) → PRODUCTION
gate_failures: 0

## Open founder decisions

- Approve `engine/DIRECTIVE.md` (draft).
- Approve the pilot rewrite ("Not Me"). Owned by the pilot thread, not by scheduled runs.
- Approve the Nio head. Owned by the Nio head thread, not by scheduled runs.
- Pick the final voices: the Nov 9 picks in `bible/characters.md`, or the designed voices from audition 3
  (`episodes/ep2/voice-audition-3.mp4`).
- Confirm the cadence in section 12 of the directive.
- Thanksgiving (26 Nov): a full episode needs the pilot approved by about 16 Nov. Otherwise it gets a cheaper
  format and the first holiday episode is New Year's Eve.
- Make `main` the default branch of this repo, so scheduled runs can save state (BACKLOG item 8).

## Founder approvals (word for word, dated)

- (none yet)

## Parked

- Ep 2 "Forty-Seven" (`episodes/ep2/room/`): the founder rejected its humor as forced. Do not build it. Its
  premise may come back through the bank only if rewritten to pass `bible/humor.md`.
- Ep 1 Part 2: the payoffs are logged in `bible/callbacks.md`. It waits for the style lock.

## Queue (two weeks of releases, written by PLAN once the pilot is approved)

- (empty)

## Run log (newest first, keep five)

- 2026-11-10 · setup · directive, stage cards and tools written; waiting for founder approval.
