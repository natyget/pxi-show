# Stage L: LEARN (weekly)

**Model:** the run itself (Sonnet). Pulling numbers may go to one **Haiku** subagent that returns only a table.

**Read:** `engine/learning.md`, `engine/promotion.md`, `engine/playbook.md`, `engine/audience-notes.md`. Nothing else. Open no script and no video.

**Do:**
1. Pull the numbers listed in `learning.md` from Metricool and Supermetrics (both recipes below) for every @pxi.app release in the ledger that is at
   least three days old and has no numbers yet, and refresh any under fourteen days old.
2. Fill the ledger rows. Update each open experiment: releases so far, and a result only when every arm has
   three releases. A small difference is recorded as "no difference".
3. Rewrite `engine/playbook.md` in full, 40 lines at most. Every changed line must trace to a ledger result.
   Lines with no data stay marked as assumptions.
4. Set the mix for PLAN: what is winning, what to vary, what new thing to try.
5. Comments: reply, flag, and update `engine/audience-notes.md` as `learning.md` says. On the first run of a
   month, write the website proposals into the report for the website's thread.
6. Promotion, by `engine/promotion.md`: read any running campaign's paid numbers; propose at most one new
   campaign (a winner for follows, or a winning app video for the warm audience) in the proposal format there,
   built paused. Report the warm audiences' sizes. Never switch anything on and never spend.
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

## Pulling the numbers (Supermetrics)

Read-only: `data_query` then `get_async_query_results`. Never call `manage_campaign`, `manage_social_media` or any
write tool here (stage L only proposes). Run `accounts_discovery` once per source and record the account ids in
this card the first time. Dates: `date_range_type` `last_30_days`. A missing value is "n/a", never 0. If a
source is not authenticated or the subscription has lapsed, say so in the report and use Metricool alone.

| Source | Report type | Fields | Fills |
|---|---|---|---|
| `IGI` Instagram | `AccountMediaVideo` | `media_id`, `timestamp`, `media_permalink`, `media_follows`, `media_profile_visits`, `media_reel_shares`, `media_saved`, `media_reel_avg_watch_time`, `media_reels_skip_rate` | Follows per reel (the score, no longer "acct" on Instagram), profile visits, sends, watch |
| `IGI` Instagram | `AccountMediaProfileActivity` | `media_id`, `media_bio_link_click` | Bio link clicks per post (the road to the app) |
| `IGI` Instagram | `AccountInsightsDaily` | `date`, `follower_count`, `reach` | Daily new followers (last 30 days only) |
| `TIKBA` TikTok | `videos` | `videos__share_url`, `videos__reach`, `videos__shares`, `videos__average_view_time`, `videos__total_time_watched_sec` | Reach, sends, watch per video |
| `TIKBA` TikTok | `profile` | `profile__date`, `profile__new_followers`, `profile__profile_views` | Daily follows and profile views (follows per video stay "acct") |
| `FA` Meta ads | ads | the fields in `engine/promotion.md` | Paid columns, cost per follow and install |
| `TIK` TikTok ads | `Ad` | the fields in `engine/promotion.md` | Paid columns |
| `GAWA` site | default | sessions and users by `sessionSource` for `pxispace.com/bio` | Visits from each platform's link (`utm_source`) |
| `GPC` Google Play | default | store listing visitors and installs by day | Installs after a release (context, never claimed as caused by one post) |

Field ids for `GAWA` and `GPC` are pinned with `field_discovery` on the first run that uses them and written
into this table. YouTube (`YT2`), Facebook pages (`FB`) and Apple Search Ads (`ASA`) are not connected; YouTube
comes from Metricool. Instagram reach in Supermetrics and Metricool can differ slightly: the ledger uses
Metricool for reach and Supermetrics for follows, visits and clicks, and says so in its header.
