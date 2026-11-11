# Stage L: LEARN (weekly)

**Model:** the run itself (Sonnet). Pulling numbers may go to one **Haiku** subagent that returns only a table.

**Read:** `engine/learning.md`, `engine/playbook.md`, `engine/audience-notes.md`. Nothing else. Open no script and no video.

**Do:**
1. Pull the numbers listed in `learning.md` from Metricool for every @pxi.app release in the ledger that is at
   least three days old and has no numbers yet, and refresh any under fourteen days old.
2. Fill the ledger rows. Update each open experiment: releases so far, and a result only when every arm has
   three releases. A small difference is recorded as "no difference".
3. Rewrite `engine/playbook.md` in full, 40 lines at most. Every changed line must trace to a ledger result.
   Lines with no data stay marked as assumptions.
4. Set the mix for PLAN: what is winning, what to vary, what new thing to try.
5. Comments: reply, flag, and update `engine/audience-notes.md` as `learning.md` says. On the first run of a
   month, write the website proposals into the report for the website's thread.
6. Promotion: if a release meets the rule in `learning.md`, propose it with numbers, budget and end date. Do
   not spend anything.
7. Once a quarter, check each platform's rule on AI disclosure for cartoons and record it in the playbook.

**Gate:** every changed line in the playbook traces to numbers in the ledger. Nothing in `bible/` is changed.
**Report:** three lines of what the numbers say, and at most one proposal for the founder.

## Pulling the numbers (Metricool)

Read-only. Never call a create, update or send tool. The brand is PXI LABS, `brandId` `7790844`, timezone America/Chicago (`-06:00`). Connected: instagram, tiktok, youtube. Do not call `getBrandSettings` or `getAnalyticsAvailableMetrics`; the ids below are fixed. Make three calls to `getAnalyticsDataByMetrics`, with `from` and `to` as `YYYY-MM-DDTHH:MM:SS-06:00` (from the oldest open ledger release to now). Each returns `rows`, one row per post, columns in the order of the `metrics` list you sent. A post's date comes back as `YYYYMMDDHHMMSS`; match it to the ledger row by date and time, then by url.

| Ledger column | Instagram reels (metrics, in order: IGRE02 IGRE06 IGRE23 IGRE11 IGRE24 IGRE28 IGRE30 IGRE10 IGRE07 IGRE21 IGRE12 IGRE26) | TikTok (TKPO02 TKPO03 TKPO07 TKPO11 TKPO13 TKPO15 TKPO08 TKPO09 TKPO10) | YouTube (YTVP02 YTVP05 YTVP06 YTVP08 YTVP09 YTVP11 YTVP12) |
|---|---|---|---|
| Hold | IGRE28 reel view rate (% past 3 s); IGRE30 skip rate is its mirror | n/a | n/a |
| Watch | IGRE24 avg watch seconds divided by Sec; IGRE27 retention is usually empty | TKPO13 full-watch rate (fraction, x100 for %); TKPO15 avg seconds | YTVP08 avg view seconds divided by Sec |
| Sends/reach | IGRE21 shares / IGRE11 reach | TKPO10 shares / TKPO11 reach | n/a (shares only, no reach) |
| Saves/reach | IGRE12 saved / IGRE11 reach | n/a | n/a |
| Follows | IGEV43 followers gained (account, per day) | TKEV08 new followers (account, per day) | n/a |
| Clicks | n/a | n/a | n/a |
| Context | IGRE10 likes, IGRE07 comments, IGRE23 views | TKPO08 likes, TKPO09 comments, TKPO07 views | YTVP09, YTVP11, YTVP06 |

Account level, for profile visits and follows: instagram `IGEV01 IGEV43 IGEV23 IGEV26`, tiktok `TKEV07 TKEV08 TKEV09` (TKEV09 is profile views), one row per day, date in the last column. Instagram has no profile-visit or link-click metric (the old ones are deprecated), and no follows per reel. Follows per release are therefore the account's gain in the two days after posting, marked "acct". A value that comes back `null`, a metric not listed, or an empty `rows` is written as "n/a", never a guess and never 0. A real zero comes back as `"0"`. TikTok `reach` is 0 for the newest videos for a day or two: write "n/a" until it is above 0. Boosted posts: spend is `IGRE20`, paid views `IGRE14`; keep paid and organic apart.
