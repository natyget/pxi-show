# Stage 0: pilot lock (phase PILOT_LOCK)

**Model:** the run itself (Sonnet). No subagents.

The pilot and the Nio head are being finished in their own threads. A scheduled run does not touch them, does
not animate and does not write scripts.

**Read:** `bible/story.md`, `bible/humor.md`, `bible/gumball-lens.md`, `bible/characters.md` (who they are),
`bible/pxi-product.md`, `engine/premise-bank.md`, `engine/real-stories.md`, `engine/calendar.md`.

**Do:**
1. If `bible/style-lock.md` no longer says "Not locked yet" and `STATE.md` still says `PILOT_LOCK`: set
   `phase: REPLICATION`, `stage: P`, `stage_card: engine/stages/P-plan.md`, and stop. Report that the line is open.
2. Otherwise add up to three new premises to the bank as CANDIDATE, in the bank's format, with every test
   in `bible/story.md` section 5 answered in a line. Start from a real story that has no premise yet, then from
   a machine in `bible/gumball-lens.md` not yet used in the bank. At least one should fit the next holiday on
   the calendar. Skip any that breaks the Never list in `bible/humor.md`. If the bank already holds twelve
   candidates, add none.
3. Report: the phase, what the founder still has to decide (from `STATE.md`), the next holiday and whether its
   dates can still be met, and the new premises in one line each.

**Gate:** none. This stage always ends after one pass.
