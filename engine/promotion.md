# Promotion (paid): from viewers to followers to app users

The founder, Nov 12: "run ads on better performing one to get more followers and from there also turn followers
to app users ... we want more people to follow us not like and comment but follow ... from theones that watch
95% of our videos and engange a lot we want to make an audiance and show ads to those people to get the app and
the ads will have to be videos that were successful when promoting the app as nio".

Nothing on this page spends money by itself. Every campaign is built **paused** and is switched on only after
the founder approves that exact campaign in their own words, recorded with a date in `engine/STATE.md`. A run
never raises a budget, starts a campaign, edits billing or touches @pxi.nyc.

## The ladder

| Rung | Goal | Who sees it | What runs | Judged on |
|---|---|---|---|---|
| 1. Organic | Reach and follows for free | Everyone the platforms choose | Every release (`engine/formats.md`) | Follows per 1,000 reach, full watches, sends |
| 2. Follow boost | Turn strangers into followers | Lookalike or broad, 18+, the cities in `engine/audience-notes.md` | An organic **winner** (below), unchanged | Cost per follow (TikTok `follows`; Instagram the account's gain in the boost window, marked "acct") |
| 3. Warm audience | Collect the people who love the show | Built, not shown | Two saved audiences on each platform (below) | Audience size (a platform needs about 1,000 people to serve to it) |
| 4. App retarget | Turn the warm audience into app users | The warm audience only, minus people who already installed where the platform can exclude them | A Nio **app video** that already won organically (below) | Cost per install, then cost per store click |

A rung opens only when the one before it has numbers. Rung 4 never runs on a cold audience.

## What counts as a winner

From the ledger in `engine/learning.md`, at least three days old, on the same platform:

- **For rung 2:** in the top quarter of the last twelve releases for follows per 1,000 reach, and above the
  account's average full-watch rate. Likes and comments do not count.
- **For rung 4:** a release whose job was the app (FOURTH WALL, APP PROMO, an EPISODE with PXI as ENGINE) that
  is in the top half for full watches **and** got profile visits or store clicks above the account's average.
- Never boost a release to rescue it. Never boost something the founder has not approved for posting.
- A boosted post runs as posted. No new text over it, no new hook, no "download now" card added for the ad.

## The warm audience (rung 3)

Built once in each ads account, then left to fill. Exact names so later runs find them:

- **Meta (Instagram and Facebook):** `nio-95` = a video engagement audience, "people who watched at least 95%"
  of any @pxi.app reel, last 365 days. `nio-engaged` = Instagram account engagement, "everyone who engaged with
  this professional account" (likes, comments, saves, shares, profile visits), last 365 days.
- **TikTok:** `nio-100` = an engagement audience, "video viewers who watched 100%" of any @pxi.app video
  (TikTok's nearest step to 95%), last 365 days. `nio-engaged` = "people who followed, liked, commented or shared".
- Rung 4 targets `nio-95` + `nio-engaged` together. If they hold fewer than 1,000 people, rung 4 waits.

The run writes these as a spec in its report. If the ads tools available to the run can create an audience,
it creates it (an audience costs nothing). If they cannot, the founder makes it in Ads Manager from the spec.

## Budgets (from the founder's earlier engine; unchanged until the founder says otherwise)

- The founder, Nov 12: "yes its $1 a day but as scales as we see results, the one that shows most results gets
  more budget".
- Every campaign starts at **$1 a day**. Each week LEARN ranks the running campaigns by cost per follow (rung 2)
  or cost per install (rung 4). The best one's budget goes up by about 20%, and money comes off the worst. That
  rule is the founder's standing yes for raises; a new campaign still needs its own yes.
- Kept from the earlier engine until the founder changes it: all campaigns together stay under **$150 a month**
  (Meta $90, TikTok $90, Google $220, Apple $90 at most). Going past it needs the founder's yes.
- Every proposal has an end date (14 days at most). A campaign whose cost per result is worse than the last one's
  for three days in a row is proposed for a pause.
- Paid and organic numbers are always kept apart in the ledger (paid columns are marked "paid").

## The numbers (Supermetrics, read-only)

Pulled in stage L (`engine/stages/L-learn.md`, Pulling the numbers (Supermetrics)). The field ids:

- **Meta ads (`FA`):** `reach`, `video_p95_watched_actions`, `video_thruplay_watched_actions`,
  `cost_per_thruplay`, `action_link_click`, `CPLC`, `action_mobile_app_install`, `cost_per_mobile_app_install`.
  Meta does not report follows from an ad; use the account's gain on Instagram in the boost window.
- **TikTok ads (`TIK`, report `Ad`):** `reach`, `video_views_p100`, `engaged_view`, `profile_visits`, `follows`,
  `app_install`, `cost_per_result`, `onsite_download_start`.
- **Cost per follow** = spend / follows. **Cost per install** = spend / installs. Written to two decimals, or
  "n/a" when the number is missing. Never a guess.

## A proposal (what the run writes, one at a time)

```
PROMOTE <release id> on <platform>, rung <2|4>
Why: <the two numbers that make it a winner, against the account average>
Audience: <broad + cities | nio-95 + nio-engaged (size)>
Budget: $<n>/day for <days> days, ends <date>. Month so far: $<spent> of $150.
Built: paused, <campaign name>. Switch on only on your yes.
```

The founder answers yes or no. A yes is recorded word for word in `STATE.md` before anything is switched on.
