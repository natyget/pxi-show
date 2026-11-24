# The weekly runs

Three scheduled runs a week (founder, Nov 24). One heavy run makes the week. Two light ones read the numbers,
check facts and plan. Times are America/Chicago. The founder's weekly usage resets Monday 8 PM, so the heavy run
starts Monday afternoon and spends what the week has left.

Every run starts the same way: read `CLAUDE.md`, then `STATE.md`, then this page's section for the run. Every run
ends the same way: one new line in the test log in `STATE.md` if something was learned, the state updated, a commit
pushed to the default branch, and a report of six lines or fewer that leads with what the founder has to decide.

**Nothing is posted or scheduled until the founder has said yes to that exact piece** (see the threads below).

## The threads (founder, Nov 24)

- **The scheduler thread** holds Metricool. It schedules, reads the numbers, and is where the two light runs happen.
  It schedules a piece only when the piece's `post.md` carries the founder's yes, word for word and dated, and it
  always reads the schedule back. The founder can say yes there (it shows what is waiting) or in the thread that
  made the piece, which writes the words into `post.md`.
- **The maker thread** makes the upcoming videos and stills, and is where Monday's heavy run happens. Every finished
  piece gets a `post.md` beside it: the hosted files, the captions for each network, the cover, the audio pick and
  the planned times (`videos/2026-11-24-idk-to-omw/post.md` is the model).
- **The trainer** (the session that built this engine) tests the engine with a cheaper model on real pieces, reads
  where it fell short, and fixes the tool, the template or the page that caused it. The goal: the cheaper model
  makes pieces at the level of the approved ones, from these files alone.

## What a week holds (founder: 3 to 5 posts a day on each network, 3 to 10 stories a day)

The same piece goes to Instagram, TikTok, YouTube Shorts and Facebook, so a week is about 25 to 35 pieces and
30 to 70 stories:

| Kind | A week | Made from |
|---|---|---|
| City discovery reels, real listings | 4 (NYC and Boston, Thursday and Monday) | `studio/events.py`, `studio/card.py`, the scene template |
| App demos (the founder: "have more demos") | 4 to 6 | the real screens, one feature each, captions and voice |
| Feature story with a joke | 1 or 2 | `videos/2026-11-24-idk-to-omw` is the model |
| Nio to camera | 1 | his own voice (`studio/cast_voice.py`) |
| Stills and carousels (side quest, the invite, weekend carousel, real-photo posts) | 10 to 14 | real listings, the rig, the screens |
| One moving thing (loops) | 5 to 7 | a still with one element moving |
| Stories | 3 to 10 a day | tonight's real listings per city as Discover cards, polls, cut-downs of the day's video |

## Monday, 1:45 PM: the heavy run (makes everything)

1. Read the plan Sunday's run left in `STATE.md` (which pieces, which hooks, the one thing being tested).
2. `python3 studio/events.py nyc --days 9` and the same for `boston`. Real listings and posters for the week.
3. Make the week's pieces, each in its own `videos/<date>-<slug>/` folder, each through `method.md` and read as the
   viewer (`studio/viewer.md`). To use the time before the reset, the lead may start one extra session for each
   video (same repository, a brief of five lines, that one folder) and gather the results; rig shots render one at
   a time on each machine.
4. Run the checks on every piece. Put all of them on one review page for the founder: the file, the caption, the
   audio pick, the network and the planned time. Send the notification.
5. On the founder's yes, piece by piece: record it in the piece's `post.md`, host the files, and leave the
   scheduling to the scheduler thread.

Stop making new pieces at 7:30 PM. A piece that is not finished is listed as not finished, never shipped rough.

## Thursday, 12:17 PM: the light run (numbers so far, weekend facts)

1. Read Metricool for everything posted since Monday: reach, sends, saves, completion, follows. One line each.
2. Fetch the listings again. For every scheduled piece that names a real event, check the event still stands (same
   day, time, venue, price). Tell the founder at once about any that changed, and hold that piece.
3. Make Friday to Sunday's stories from the fresh listings (tonight's picks in each city, as Discover cards).
4. No new videos. Report, with any story batch for the founder's yes.

## Sunday, 6:38 PM: the light run (the weekly read and Monday's plan)

1. Read the last seven days in Metricool. Rank the posts by sends per reach, then follows per post.
2. Keep the hook and format of the top two, drop the bottom two, pick the one thing to change this week (hook, then
   ending, then format, then length, then time). Write one line per test into the test log in `STATE.md`.
3. Look at what people are posting about this week and pick up to two trends worth our own version (`growth.md`).
4. Write Monday's plan into `STATE.md`: every piece by name, format, city, hook and ending. No content is made.
