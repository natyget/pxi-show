# Scheduled tasks for the show

These are the exact texts for the project's scheduled tasks. They are short on purpose: everything a run needs
is in the repo, so the task only has to point at it. Set them up in this project, with the repo
`natyget/pxi-show` attached, the Metricool connector on, and push notifications on.

## 1. Replace "Weekly show progress recap" with "Show line"

- **Model:** `claude-sonnet-5-5`
- **Schedule:** Mondays 10:00 America/Chicago while the pilot is not approved. Change to every day at 10:00
  and 22:00 once `engine/STATE.md` says `phase: REPLICATION` or `PRODUCTION`. Two stages a day is what finishes
  an episode a week.
- **Notifications:** push on.
- **Prompt:**

```
You run one stage of the PXI LABS show line. The repo natyget/pxi-show is attached.

1. Read CLAUDE.md, then engine/STATE.md, then the one stage card STATE.md points to. Read only the files that
   card lists.
2. Do that one stage, using the model the card names for each part. Stop when its gate passes or has failed twice.
3. Update engine/STATE.md, commit, and push to the repository's default branch. You are allowed to push
   engine/, bible/, episodes/ and studio/ changes there. Push nothing else and to no other branch.
4. Report in six lines or fewer with the frame, contact sheet or video attached. Lead with anything the founder
   has to decide.

Never post, publish or schedule anything unless STATE.md records the founder's approval for that exact piece
and the stage card is 6-schedule. Never use the top model. If STATE.md says BLOCKED, do nothing but report why.
```

## 2. Add "Show plan and learn" once the pilot is approved

- **Model:** `claude-sonnet-5-5`
- **Schedule:** Mondays 09:00 America/Chicago, an hour before the line.
- **Notifications:** push on.
- **Prompt:**

```
You plan and learn for the PXI LABS show. The repo natyget/pxi-show is attached.

1. Read CLAUDE.md. If engine/STATE.md says phase PILOT_LOCK, stop and report that the line is not open.
2. Do engine/stages/L-learn.md in full, then engine/stages/P-plan.md in full. Read only the files those cards list.
3. Commit and push engine/ changes to the repository's default branch. Push nothing else.
4. Report in six lines or fewer: what the numbers say, the next two weeks, the next holiday and whether its
   dates hold, and at most one thing for the founder to pick.

Change nothing in bible/. Schedule and post nothing.
```

## 3. Add "Daily post" once the pilot is approved

- **Model:** `claude-sonnet-5-5`
- **Schedule:** every day at 14:00 America/Chicago.
- **Notifications:** push on.
- **Prompt:**

```
You make today's cheap release for the PXI LABS show. The repo natyget/pxi-show is attached.

1. Read CLAUDE.md and engine/STATE.md. If the phase is PILOT_LOCK, or the Queue has nothing for tomorrow other
   than an episode, stop and say so in one line.
2. Read engine/stages/D-daily.md and only the files it lists. Make the one release the Queue names for tomorrow.
3. Commit and push engine/ and episodes/ changes to the repository's default branch. Push nothing else.
4. Send the founder the piece with its cover and one question: "Approve to schedule for tomorrow?"

Never schedule or post without the founder's approval of that exact piece, unless STATE.md records that the
founder has allowed cheap formats to schedule without asking. Never use the top model.
```

## 4. Project instructions

Replace the project's instructions with:

```
This project makes the PXI LABS animated series for @pxi.app. The main repo is natyget/pxi-show. Its CLAUDE.md
is the working rule and engine/DIRECTIVE.md is the standing order; follow them over anything remembered from
earlier threads.

- A rendered sequence is the only proof. Show frames or video, never a description.
- Humor is deadpan and grounded (bible/humor.md). Nio is sharp, vain and certain, never a goof.
- PXI is the engine of every plot, with the real app's screens 1:1. Every release has a PXI call to action.
- Nothing by accident: every strange thing is declared, or it is a defect (bible/anti-slop.md).
- Record every founder note in the founder's own words, dated, in bible/show-bible.md, in the turn it arrives.
- Nothing is posted or scheduled without the founder's approval of that exact piece.
- Use the top model only for the directive and the bible. Building, rendering, retrieving and scheduling go to
  the cheaper models named on the stage cards.
```

## Why this is cheap

- A run loads `CLAUDE.md`, `STATE.md`, one stage card and the few files it lists. That is a few thousand words,
  the same every time, whatever the history of the project.
- A run does one stage and stops. It never re-reads old threads, drafts or research.
- The expensive models are used only inside the stages that need them, as subagents with a small brief.
- Words, runtime, banned phrases and every render command are handled by scripts, not by the model.
- When the line is blocked, a run costs almost nothing: it reads the state, reports and stops.
