# State

next: until Monday the scheduler thread (the cheaper model) does everything: still image posts from the real app
screens and real listings, a fresh check of each, scheduling, and a phone notification of what it scheduled (the
founder's words are the first note below). No thread on the stronger model works until the weekly reset on Monday
8 PM Chicago: the two episodes of the series (`series.md`) are made then. Waiting for the founder's yes: three New
York "One night" shorts.

## Where things stand (Nov 24, 2026)

- **Thursday light run (Nov 26):** numbers small so far (Instagram reels reach 88 to 129, TikTok 94 to 135 views, no shares or saves yet); every scheduled event re-checked and stands; 12 Friday/Saturday stories (`videos/2026-11-26-thu-run/stories/`) wait for the founder's yes.
- **Stills (scheduler thread, until Monday):** Nov 25: LA tonight carousel (2 slides) IG+FB 7:45 PM, TikTok 7:50 PM Chicago; passed the fresh reviewer on the second cut (`videos/2026-11-25-la-stills/`, composer `studio/still.cjs`). Nov 26 (Thanksgiving): free tonight, NYC IG+FB 3:00 / TikTok 3:05 PM, LA IG+FB 6:30 / TikTok 6:35 PM Chicago; NYC passed on its second cut (the Delancey listing still wears a Halloween flyer: dropped). Thanksgiving LA carousel (intro, seven cards Thu to Sat, the app's map with the logo): IG+FB carousel 1:00 PM Chicago; the 6:30/6:35 PM single LA posts set to draft on the founder's word (duplicates); TikTok carousel with auto music 10:00 AM. NYC rebuilt as a Thanksgiving-weekend carousel (`videos/2026-11-26-nyc-carousel/`): IG+FB 3:00 PM, TikTok auto music 3:05 PM. Friday to Monday: built each morning at 5:30 AM Chicago from fresh listings (`studio/carousel.py`), one carousel per city, IG+FB and TikTok on auto music, the founder adds the Instagram song by hand; the TikTok version (9:16) the founder posts by hand with their sound (`videos/2026-11-26-la-tiktok/`).
- **Scheduled (not drafts, read back):** LA weekend Wed Nov 25 8:30/8:35/8:40 PM; NYC nights Thu Nov 26 5:30/5:35/
  5:40 PM; Nio LA Thu Nov 26 8:30/8:35/8:40 PM (Chicago; IG+FB reel, TikTok, YouTube Short). Listings re-fetched first: all stand.
- **City weekend reels (maker thread, Nov 24):** the weekend told as nights out, one scene for every city and week:
  `studio/weekend-reel.html`, built by `studio/weekend.py` from a `reel.json` of beats (a rig shot, the pick's real
  card, a chat, the end card) and the voice. `videos/2026-11-24-la-weekend/script.md` says how to make the next one.
  Los Angeles (34 s) and New York (`videos/2026-11-24-nyc-nights/`, 37 s) are at their latest cuts: the hook calls the city and
  the need, the quick narrator reads (the founder's note on cut 1), and a Discover card is drawn only for a listing
  the app shows as one (it needs a song); the other picks are a picture and a plain label. Both, and the Nio to camera piece
  (`videos/2026-11-24-nio-la/`), were made again the evening of Nov 24 on the founder's three aesthetic notes (app screens
  clean and centred, a circle on the price, the map under "all of these"), passed the fresh reviewer and wait for
  the founder's yes. The first two, New York and Boston,
  were the old shape (the app under a voice listing events), failed the reviewer twice and are dropped; their
  folders keep the files and what the reviewer said.
- **Scheduled (not drafts):** "idk to omw" goes out Tue Nov 24 (America/Chicago): Instagram and Facebook Reel 6:30 PM
  (cover.jpg, TrackTribe "Just A Weekend" at 18), TikTok 6:35 PM, YouTube Short 6:40 PM. Read back from Metricool.
- **Metricool:** every pending post through Dec 8 was set to draft on Nov 23 (the founder: "nuked"). Nothing from
  the old engine is scheduled to publish. The old "PXI social engine" scheduled task is off. The "Weekly show progress recap" task
  lives in the Project and could not be switched off from a repo session; it only writes a commit recap.
- **Repo:** the old engine's rules, scripts and renders are in `archive/2026-11-old-engine/`. Its renderer moved to
  `studio/world3d` and is the house look. Thread branches 11rl11, d7kodp and 2n09ns are merged into this branch.
- **First video on the new pipeline:** "idk to omw", 32 s, cut 5. Cut 1 failed the stranger (narrator taglines, no
  joke, a stare). Cut 2 used a 2D Nio the founder found cheaper than the old rig. Cut 3 brought the old rig back
  and said "you"; a fresh reviewer failed it narrowly (Nio read as looking at us, the joke could slip past, the
  host on the flyer was someone in the chat, the mic hid the singer's face, the chat looked like a mock-up).
  Cut 4 fixed those; the founder: "video good overal a little slow tho when it lists the events". Cut 5 has
  Nio's picture as the profile avatar, the App Store badge bigger and a shorter event list. No fresh review since
  cut 3: the founder is reviewing directly.
- **Known weakness of the rig:** it drops blank frames when another render runs beside it. `studio/shot.py`
  catches and repairs them.
- **Real events:** `studio/events.py` pulls this week's listings and posters for New York and Boston from PXI's
  own API; `studio/card.py` dresses one as the app's Discover card with the app's own code.
- **Nio's voice:** rebuilt with the recipe behind his 20 approved lines (same description, model, versions and
  seed); `studio/cast_voice.py` makes a line in about 30 seconds. The founder picked the first sample: `look/cast/voice/nio-reference.wav`.
- **The threads and the runs:** three threads, all on this repo (`runs.md`). "PXI scheduler" holds Metricool
  (checked Nov 24: it scheduled and read back) and gets the Thursday 12:17 PM and Sunday 6:38 PM runs. "PXI maker"
  makes the pieces and gets the Monday 1:45 PM heavy run. The runs fire into those two threads, so they keep
  Metricool: a run that starts a fresh thread gets no connectors in this workspace. Do not archive the two threads.
- **Talking works:** a cast line in the voice block is made in that person's voice and timed for captions, and a
  shot's `"says"` moves the mouth from the line's own audio (`look/rig.md`). Nio to camera can be made now.
- **The app's screens (screens thread, Nov 24):** rebuilt from the component code and filled by the app's own code
  (`look/app-screens/README.md`): the All events list (`studio/list.py`), the carousel with a real swipe and its
  last card, the doorway (`studio/card.py`). The corrected card shows an outside listing's flyer with no name printed
  over it and always prints TASTE MATCH, 18 points lower, so the two weekend reels waiting for a yes no longer match
  their MP4s: their scenes render (the camera is re-aimed) but need a new render before they go out. A
  `weekend.py` run needs a fresh `events.py` fetch (it reads `app.json`) and the new `scene.html`.
- **Not built yet:** the app's real Map and listing sheet, the PXI event row of All events, real street maps
  (OpenStreetMap tiles are reachable), a story template for the daily listing cards, a wide 16:9 frame for episodes.
- **Tools that could not be reached from here:** Wikimedia Commons and Openverse image search (rate limits), the
  AI Geek Gumroad checkout (bot check). The two long AI Geek prompts were read from their public documents.

## Decided (Nov 24)

- Cut 5 of "idk to omw" is the level to build from ("the latest cut is nice").
- Real listings, with their real posters, from PXI's own API. More app demos.
- Nio never quotes downloads or followers, unless the founder asks for a milestone post.
- Nio's existing voice is rebuilt, not replaced.
- 3 to 5 posts a day on each network and 3 to 10 stories a day (confirmed: "i mean per network per day so 3-5 on
  tiktok in that day for example").
- Nio's voice: the first sample is the one ("the first smaple for nio voice the best"). Its acting note, "Talking
  to a friend, quick and easy, a little pleased with himself", is the reference delivery
  (`look/cast/voice/nio-reference.wav`).
- "idk to omw" is approved for scheduling.
- Three runs a week: the heavy one on Monday before the 8 PM usage reset, two light ones for numbers and planning.
- The stronger model stays the maker of new pieces (the founder: "ok i agree with you being the maker"); the cheaper
  model keeps the scheduler thread and the two light runs. Its next test is a new week of an approved reel.
- Every piece is built on one search phrase people really type (`growth.md`, "Being found"): said first, on screen
  first, first in every caption and title. `studio/check.py find` holds a piece to it.
- Cities: Los Angeles first, New York second ("lets actually have LA first priority then nyc second"). Boston
  after those, when there is room. The trainer's reading: the profile name leads with Los Angeles too.
- The founder says yes or no from a phone notification; the scheduler never holds a piece for being animated.
- Also on the menu now (`growth.md`): long episodes for YouTube, organizer posts for LinkedIn, pieces for people
  hosting at home, more hook types, and every kind of ask (follow, comment, download, profile, send, save).
  Discover stays first: at least seven pieces in ten. The trainer's reading of "your own home people": people
  hosting at home.

## Open decisions (the founder's)

- (none)

## Founder notes (newest first, word for word)

- **Nov 26, 3:30 AM (scheduler thread):** "ok ill do by hand on ig schedule n post. all the following ones updated too and schedule all. for tiktok ill manually add songs by posting if you cant pick. which list i checked you can do that", then, asked how: "schedule all tiktok on auto and for ig ill edit and add song"; New York today: "Yes, rebuild it".

- **Nov 26, early morning (scheduler thread):** "no isntagram should be carousel as well why video? and when i meant tomorrow i meant like in the morning but still thursday or now at 4 almost. why not now and then just give verdict short tbh. no need for reel and why cant you add music to carousels? pull that post and for future ones to pull them and ensure like this one there is more vents on the post and entry+exit cards". (Done: Instagram back to the carousel, the two single LA posts for tonight set to draft; the rule is in growth.md's Weekend carousel row.)

- **Nov 26, on the Thanksgiving carousel (scheduler thread):** "maybe more on the things to do it will be nice and maybe the cta being our map to show that all event in one place get pxi would be better dot you think". "ok you arent using our actual maps and how it looks and our logo isnt there on the last cta and we dont really need the list view im just saying more suggestions like the 2 you gave". "maybe 4 or so suggestion one more wont really do it". "why do you say this weekend after la, just saying in la is enough". (Done: cards only, about seven picks, the closing slide is the app's own map with the logo, `studio/map.cjs`; the cover says "tryna find things to do in LA?".)

- **Nov 25, on carousels (to the scheduler thread; for the stronger-model thread when it checks on Monday after 8 PM):** "i need you from now on to make a nice intro carousel with big text like "trynna finid things to do this weekend" just one headline and an arrow to sipw with swipe text under it or over whatever nothing more. generate me that image and also please make me a last cta slide to at all time so that we can see download pxi cta. make sure to report this to fable next time it checks on you monday after 8 pm".

- **On usage and who works until Monday:** "ok we only have 4% of fable left so go ahead and lets prepare to make those
  content when its monday after tokens reset since you make the script and all as you said. so for now lets do
  simpler stuff like still iamge posts and ahve opus do it all and revise (checker) and schedule till moday because
  we posted nothing today literally loosing opportunity so lets have opus do all that till monday until you
  replensih tokens as fable".

- **Nov 24, night, on pace, retention and the series:** "ok but to be honest we can start making this weeks content now
  and wait for monday for next week because its only tuesday we got no posts today and we should build so our what
  to do in video and idk to omw videos dont flop as well. so since its 6:40 r with tokens resetted lets make a
  couple videos for this week and the rest of the week you will learn and monday you get to resses learn and run new
  session and then from there when it resets as well you will have more tokens and we can even have the scheduler
  work alone nod me so im in the loop and give direction based on token we have to amp up or reduce production. were
  also at half fable limit for this week right now just fyi from this session alone".
  "wanted to mention is that our video, right at the 3-second marker, it starts dropping off where we animate the
  messages thing, because I think, again, we're not really clear about saying like Friday 9 p.m. at night, and nobody
  wants to pick an event or, you know, something like that. And then the next second is Friday 9 p.m. I think on the
  3rd second mark, right after the direct messages flow, where Neo sits in his room and he just says a word, and that
  just kills the retention right there. That's where like a good 20% of the people just swipe away because it's
  taking too long. It's not going to the point. It's not fast enough, and it's not entertaining enough either. Like,
  it's not really catchy enough. You know, it's not punchy enough. It's not also funny. Like, we need to add in
  humor. And I realize that you're just making the same like things to do content. You're not really like following
  Neo in his world where he tries to figure out events and making series out of it, demos out of Neo using the app,
  or, you know, him talking to us, although those should be like limited. He shouldn't be always talking to us. But I
  really want a series where we follow a interesting character that we just want to follow because it's funny
  stories that he encounters, you know, like the amazing world of Gumball. And you would just follow Gumball. But
  imagine Gumball created Pixie and he's using it, and he showcases it. Like, within the show, you see him using the
  app and all that. I think that would gain more retention. And I think you can do a lot by learning where people
  tend to drop the following and scroll away, and really learn what's wrong in that part. Is it just too long? Is
  there a specific word? Is there, you know, a frame or a looks that does that? And then from the videos that do
  well, learn why people tend to stick and not scroll to. Look into those things, please. Right now, you don't need
  to really pump in and work on all the other videos, but a couple would be nice."

- **Nov 24, on volume, after three pieces were scheduled:** "yes but were supposed to be posting 3-10 posts a day, 3
  reels some posts a lot of stories right so your 3 scheduled work i hope its not it for us and that were pumping
  quality content at quantity because its necessary for growth".

- **Nov 24, evening, the yes and the ad cap:** "ok go soft for now lets try to go viral and see traction at first. lets
  see if people watch a video if one does exceptionally well that is our sign i dont want to spend more tan 150 a
  month total for ads on tiktok ig seo all combined. but i need you to optimize and think of our growth and how
  things are looking push ads for highest roi not just for the sake of it". "i can approve all three as good we can
  move on".

- **Nov 24, on connectors and ads:** "if there is any other mcp or connector i can add to really boost our performance
  or anything i can do for pxi because we really need to start going viral really seriously. also should i run ads if
  so where and how. im sure that supermetric is also connected i had a strategy to run$1-5 ads to have people watch
  it and then turn the people who watched 95% of the reel or tiktok to be a audience and then make another ad for a
  proper app ad with download cta, the firts one would be to incease engengemnet and have people watch and then pick
  from them the most interested to make a profile that we can build an alike profile with. you think you can do
  something similar here like that? for both tiktok and insta ads run smart budgeted low cost high efffeciency new
  method and smart exsiting ones camapaign? think about it please and let me know what you need".

- **Nov 24, on the three waiting pieces (LA weekend, Nio to camera, New York):** "only aesthetic point id comment in are
  1. there is padding on bottom when showing app screenshots and it looks weird. small thing that could have been
  polished to look nice instead of having that block in the bottom. there is also some lighter corners when showing
  pop up cards screen recording like direct message having to right and left corner light 2. is the zoom in effect
  needs ti be refined and a kot needs to be centered properly like the recording and the shots of app etc to look
  neat and clean. similarly circling them and having pop effects and other might have better entertaining effect
  3. when nio says here is everything in la it has a darkened top and bottom gradient which i think hides from our
  app aesthetics. and for that moment i think the map does so well. saying all events near you in one map is kinda
  a big deal. refine these things and im satisfied".

- **Nov 24, afternoon, on the maker and on being found:** "ok i agree with you being the maker. lets also have it so
  that we optimize captions and the whole video so we show up when people type the best key words like things to do
  in la or so. im sure you can use metricool and tiktok analytics to really see what people be looking up on ig
  tiktok facebook ad the other platofrms and workt o be ranked on those searches and work on really being able to
  reach braod new audiences each post and trying different things and learning from trial and repeating things that
  work well etc. were on a good track im excited to see the next video that you said your currently making".

- **Nov 24, on the New York weekend reel (cut 2), in the maker thread:** "i see that jyd had a regeton at huston in san
  Antonio. we should do one video one city not every city. i fear it may resonate with nobody when trying to appeal
  to everyone". (The video was New York only: "Reggaeton on Houston" is on Houston Street, at a bar named San
  Antonios. It read as Texas to the founder and to the fresh reviewer, so the pick is out.)

- **Nov 24, on the three quick-narrator samples:** "voice b nice". (B is Kokoro `am_puck` at 1.27, the `quick`
  narrator in `studio/voice.py`.)

- **Nov 24, on the Los Angeles weekend reel:** "the hooks are a bit weak and not specific. it doesn't say are you in
  [city] looking for things to do? we got you. or something. and the voice sleepy and not fat and quick better for
  stories not info like this".

- **Nov 24, after the hand-off page:** "lets actually have LA first priority then nyc second". "in the scheduler case
  then fix the thing where it stopped us from posting because of animation what not". "and if i get a mobile
  notification i can say yes no". "im really liking what you made so far". "keep at it and consider other formats as
  well of posting. For example, longer episodes that could go on YouTube, like full-on series-like episodes. And we
  did talk about the different variation hooks, different variation CTAs, like to follow, to comment, to download
  app, to check our profile, etc. Different hooks to engage people. Did you know? Fun fact. Here are these events
  and more. Like, I'm pretty sure you can think of more, and we've probably mentioned them in chat. Don't forget
  LinkedIn for event organizers. And then also think of content for pretty much everyone, organizers, your own home
  people. But again, priority right now is for the discovery page to be used. What you built now already is good
  and you should keep at it. I'm just saying keep these things in mind and think of them."

- **Nov 24, on the threads:** "metricool is connected and been connected i dont know why you cant access it but if you
  cant then make the sceduler be able to and hand off what you made in this session and show me too". "the first
  smaple for nio voice the best". "i mean per network per day so 3-5 on tiktok in that day for example". "lets
  schedule the ones we have right no on this new scheduler thread and show me what else you made and make the other
  tread also do upcoming videos as fable i need you to train an engine until opus 5.5 be able to actually produce
  videos at that quality because its toekn effecient to check and do what you need".
- **Nov 24, on cut 5 and the plan:** "yes use real listings and also have more demos the latest cut is nice. no dont
  say real donwlaods and folllowers what type of video would ever need that unless he is celebrting a milestone.
  and rebuild his existing voice". "you can literally check our repo and webste and scrap the event posters from
  there when you demo real events havae that pipeline built. i think if we do monday its better because my tokens
  reset at 8pm time for a over many session run right before reset so we can do the most out of ourusage weekly
  limit". "lets have to be honest 3-5 posts per social media and many stories on all social inculding tiktok like
  3-10. and for the how many runs try like 3 a week and the others are smaller sessions and also analytic and
  insight and planning sessions more than making content while the heavy one does all".
- **Nov 24, on cut 4:** "phone has image on top right that isnt nio's its weird and have appstore button be the
  bigger one". "i mean the profile avatar image should be nio's but video good overal a little slow tho when it
  lists the events".
- **Nov 24, on the red flyer redone in yellow:** "no erlier red desing looks so much better just change typography".
- **Nov 24, on the first flyer:** "the friday poster looks somewhat ai the friday should have been bigger with time
  smaller and differnt look then no footer or cover text so stopping making these ui ai looking descisions from now
  again".
- **Nov 24, on cut 2:** "not bad but nio is not recognized by people so for these videos say you instead of nio and
  say your friend sang instead of theo". "we ned better covers for events like real event covers". "the 40 idk
  kinda wierd, instead nobody knows what to do then the following being you open pxi and find xyz and then not
  saying for some reason because thats just weird why wouldyou say some raeson seems like the narrator confused
  about his own app. but again these arent to be put in bibleinstead you should think of how you can have engine
  that thinks like i did, i would not say thesethings because i thiink as the viewer so have the content maker that
  wil be scheduled think like that too". "i aslo like the new aniamton your aking".
- **Nov 24, on the 2D Nio:** "to be honest the animation could have been much better why dont you just take the old
  engine instead of this cheaoer lamer look? the old nio really looked nice". "unless there is a major compromise
  whihc then you should xplain what". (There was none: about a second a frame to render.)
- **Nov 24, after the first stills:** "so kep going but this time as fable i expect a greater result making a great
  animated content engine some even not animated but using real open sources images some animated in different
  format and if we even can make stand alone series following a character like nio making the app the journey of
  using it and all it would be nice. what i mean by that is we will have a couple videos of him talking to the
  camera about the app to test if those content yield results as a founder. some as him being part of a skit
  throwing an evnet it being a mess but the scrapbook shows it as sweet moments and pxi lets you remeber moments in
  nostalgia not sour feeling im sure you can make a enigne that makes catchy phrasesno slop overexplaning and
  repeated text 3-3 times no pills eyebrows and weird ai components, make some videos where its funny and you just
  follow and they use the product too, some still posts some post with still everything and some moving stuff."
  And: "really the goal is good quality posts in mass quantity that will attract new poeple".
- **Nov 24:** "also you could make gta themed map content for pxi considering gta blowing up. something like whats
  attached and even make other content like you busy x[funny action] but you get a notification from lucia to
  [action too] and the notification is from pxi app and it can be an invitte. maybe a sleepover event invitation
  might by funny or a date at 6 flags type of amusment park. soemthing cretive." And: "always look for trendy
  topics to make things around".
- **Nov 24:** "the dm's look uncanny because the pills are longer than the words they are full width thats not how
  message bubles are".
- **Nov 24:** "i saw your recent render and dont you think nio animation would look better with same concept and
  animation i dont know i just think so".
- **Nov 24:** "our old engine was able to make a nio world pixelated version of our posts so just incaase you want
  to make animation with the real thing make sure the real screenshots are turned into aniamtions".
- **Nov 23, late:** "the content from now on on metricool all should be nuked all of them. they are slop. the one
  that has music instead of having tiktok auto pick for them or have some voice explainor reading and narating it
  has this ai slop beat audio. when its insta i can add a song so its not as serious". "yes archive it". "how about
  nio's look and all is that not a good thing to copy we worked hard on it? it can be a style we rotate wit hthe
  other ai geek thing, and as you said maybe we need a lot more poses and a lot better keyframe making and then a
  lot better at also filling them in between". "tidy branch then as much as you need and do what you want, trun of
  any scheduled existing psoter and make new one i give you freedom for all". "no caption with ai track at most we
  do just caption if not caption with audio and if you use the same vioces in nio world for characters its nice but
  for the voice over you can pick a guy ai voice that is standard".
- **Nov 23, evening:** "post nothing tonight". "i think those rules need to be chopped down till only reasonable
  ones are left. like i think we tell the engine to make nio look at the camera and then theres a rule telling hi
  not to instead of remving the first one so i need a clean up". "we need a new engine with the most recent tips
  like a new begining with the mistakes of the old serving as a what not to do for us instead of for the bible etc,
  bible and other stuff should be short clean to the point only on stuff that matter like visual pacing and more".
  "yes we want to lead with the discovery page but also make the album and camera a priority right after".
- **Nov 23, 8:30 PM:** "you are posting silent sstuff but you should pick auto viral audio or even pick one if you
  can because i cant edit the posts audio once youve scheduled it." "really make hooks interesting and addictive
  to not make people scroll. most the time questions do well to attract people attention or things that would get
  them hooked in the beging like a mid plot then throw back to the start." "we really need people to just use the
  event discovery page for now". "trun out also 30-45 sec and 60-90 does well." "we need to copu right properly
  and lose the slop and reatin the font shape color layout and form identity".

Older notes: `archive/2026-11-old-engine/bible/show-bible.md`.

## Test log (one line per test)

- Nov 25, six "One night" pieces cut from the two approved reels (15 to 20 s; the builder now draws the All events list, holds a card over two lines, and says the ask over the end card). Cut 1: five of six failed the fresh reviewer for the same reasons: three to five seconds of Nio before the listing, captions on the list's text, the map held five to six seconds. Cut 2 (listing on screen by second 2 or 3, the app's black under captions on the list, map two seconds at most): New York free rave and New York tonight passed; New York skate had passed cut 1. All three Los Angeles pieces (dinner with strangers, Night Tales tonight, free brunch) failed twice and are dropped. What the second failures share: a list or card held five to seven seconds reads as "a dark list of tiny text", the app's card crops the flyer so the event cannot be read, and a plate that does not match the listing (a sunset roof for an 11 AM brunch) reads as unrelated. Every reviewer, pass or fail, marks the five-second end card.
- Nov 24, clean-app builder (the founder's three aesthetic notes): app screens whole, centred, black to the edge; a circle on the price in place of a zoom; the map under "all of these". LA, New York and Nio to camera rendered again; fresh reviewers: LA pass, Nio pass, New York fail (small chat in a black frame) then pass with the chat filling the frame. Found after the reviews: the circle did not render because the app layer was removed, not hidden, in the captions pass; fixed in `studio/weekend-reel.html`. `studio/weekend.py` now copies the builder into the piece on every run, so a fix there reaches every piece.
- Nov 24, the first two city reels (the stronger model): both failed the stranger twice. After three seconds they
  were thirty seconds of one app screen under a voice listing events. Cause: the format as `growth.md` defined it.
  Changed there (nights out, the app as the proof) and one question added to `studio/viewer.md`.
- Nov 24, engine trial 1, the cheaper model, "screen time" (`trial/screen-time`): the script and the joke were at the
  level; the tools cost it the rest. Fixed where each lived: a scene with real cards went blank on a fresh clone
  (the ignore file hid the listings; now only posters stay out and `events.py --posters` fetches them again); no
  contact-sheet tool (`studio/sheet.py`); the rig hid why it refused a shot and cameras were guesswork
  (`studio/rig.py`, `look/rig.md` with a picture of every set); captions were counted by hand and failed silently
  (the breaks now live in the voice block); a name the voice says wrong had no way to the caption (`Lys{Leece}`);
  the safe check only looked where a scene told it to (it checks the whole sharp layer now); two scene files to
  start from (one model now); the card's clock was the fetch time (`--clock`); listings that had already started.
- Nov 24, engine trial 2b, the cheaper model, read the app's code and found what every thread had missed: the app
  shows a listing from another ticket site as a Discover card only when it carries a song (`carouselMix.ts`); the
  rest are in All events. The LA weekend reel drew two cards the app never would (the dinner, the brunch), New
  York four. `studio/card.py` now refuses such a card and follows the app's card order; the All events list and
  the carousel's last card are being rebuilt so those listings have a true screen.
- Nov 24, engine trial 3, the cheaper model with the beat builder ("One night", Midnight Lovers,
  `trial/la-one-night-midnight-lovers`): dropped after two fails. The builder removed the hand-made faults; what
  was left is in two places. The builder itself: captions sit on the stamp and the price on every card, the push
  crops the day and time off the card, the end card and the chat open on a near-black frame (the stronger
  model's reels have the same marks and pass "only just"). And the script: a hook the card cannot answer, a
  tagline, a stock ask. Fixed now: `LA{L.A.}` reached the caption as "l.a." (`studio/voice.py`; the LA reel's
  first caption had it too), a question in `studio/viewer.md` about paying off the first line, a line on asks in
  `growth.md`. The builder's four marks go to the maker thread, which owns it. Verdict after four pieces: the
  cheaper model is not at the level for writing a new piece; the next test for it is narrower (a new week of an
  approved reel, where only the listings and lines change).
- Nov 24, "idk to omw", the first hours (the founder read the retention): about one in five left from second 3
  on: the hook took four seconds to say one sentence, a second opening ran from 4.8 to 9.4 s over Nio sitting on
  his bed, the app arrived at second 10 and the first joke at second 26. Written into `series.md` (the shape of an episode) and the first question in
  `studio/viewer.md`. The same founder note turned the lead format from city lists to the series.
- Nov 24, the stall and the stale file: six threads at once spent the five-hour limit by 9:40 AM Chicago; three
  stopped mid-piece until 1 PM (`runs.md` now caps the threads). And cut 3 of both city reels was rendered four
  minutes after the card screen was corrected on the default branch but from the old copy, so the files sent to the
  founder still printed the name over the flyer. The trainer caught it by rendering the repo's own scene.
  `studio/compose.sh` now records what a file was rendered from and `studio/check.py video` fails a file that is
  older than its scene or the app screens.
- Nov 24, engine trials 2a ("One night", dinner with strangers) and 2b (Discover demo), the cheaper model: both
  dropped after two fails from the stranger. The ideas held ("Sunday, you sleep"); the pictures did not: scenes
  built by hand came out with shots that do not move, zooms that crop, a small dim phone, a long end card. Half of
  that is the trainer's doing: the engine changed under both trials and the re-cuts cost a pass. What their notes
  named is fixed where it lived (lengths in one place, the script check reads only the voice block, the hearing
  model comes with setup, raw.json is committed, the rig's list shows which way a seat faces, contact sheets keep
  every cut and the whole hook and refuse a blank picture, a count restarts on a cut the founder asked for). The
  larger cause: an information piece should never be built by hand; `method.md` now sends it to the beat builder
  the stronger model made for the weekend reels. Trial 3 tests exactly that, with no engine change while it runs.
- Nov 24, the founder on the LA weekend reel: the hook did not call out the city and the need, and the narrator was
  "sleepy" for information. Measured: 2.3 words a second, and the flattest pitch of the standard voices. Fixed
  where each lives: the first question in `studio/viewer.md` and the hooks in `growth.md` (say who it is for), and
  a quick narrator in `studio/voice.py` (```voice quick, 3.2 words a second). The founder picked sample B.
- Nov 24, talking: Nio's approved reference line went through `studio/voice.py` byte for byte, and a 156-frame shot
  moved his mouth to it (`videos/2026-11-24-talk-test/`). Not yet seen by the founder or a stranger.
- Nov 24, engine trial, the cheaper model as scheduler: every commit was refused because it ended with a
  `Co-Authored-By` line naming the model. `CLAUDE.md` now says how a commit ends; the next commit went through.
- Nov 24, city weekend reel, the fresh reviewer: a phone shown small on a dark background failed (the viewer sees an
  ad and leaves), and so did captions lying on the app's own text and a card whose price disagreed with the voice.
  The scene now shows the app screen as wide as the picture, keeps the captions in the empty band between the place
  and the price, and `listing.ts` reads a price of 0 as FREE, as the app does.
- Nov 24, city weekend reel, what the second round of fresh reviews still failed: four cards in the same shape under
  a voice that lists day, name, place, price reads as a list over a screen recording, however large the cards are;
  a hook has to be shown, and a real listing's poster may not show it (Boston's igloos are a photo of beer glasses).
- Nov 24, Los Angeles weekend reel, the new shape (a Nio World picture and a reason for each night, the card as the
  proof, a chat for the party with no location yet): the fresh reviewer passed it on the first read. Hook: did you
  know. Ask: send. What it still marked down: the app's name printed over a poster's own lettering.
- Nov 24, New York weekend reel in the new shape: passed on the first read. Hook: a question, as a chat. Ask: comment.
  A listing can disagree with its own poster (start time), and a pick can leave the feed between two fetches the
  same day: look at each poster against its card, and fetch again before a yes.
- Nov 24, both weekend reels, cut 2 (city hook, quick narrator, 34 and 35 s): passed, "barely". The reviewer now
  leaves at the app cards (about 9 s and 15 s): four cards in the same layout, the caption over the stamp, the app's
  name printed over a poster's lettering. Next thing to test: each card held half as long, and the city in written
  words on the first frame.
- Nov 24, both weekend reels, cut 3 (two real cards each, two nights told with a picture and a label): passed,
  "barely". Still marked down: a shot held about six seconds under a label, the label's small second line, the
  captions over the card's stamp, the first seconds saying nothing about the city with the sound off.
- Nov 24, Nio to camera (PXI maker 2). The first piece, "I built an app because I was annoyed", failed two fresh
  reviewers and is dropped (`videos/2026-11-24-nio-annoyed/review/notes.md`): fifteen seconds of him before the app,
  then the app shown under words about the problem; captions read as part of the card; a hook that could open any
  founder video. The second, "things to do in LA this weekend" (`videos/2026-11-24-nio-la/`), passed, narrowly; its first line was
  then remade on the search phrase (`check.py find` reads "L.A." in a script as two letters: write `LA{L.A.}`). Hook: the city and
  the need, in his voice. Ask: follow. Fixed where each lived: `close` and `screen` put his mouth under the
  captions (three cameras for talking: `talk`, `talkSide`, `talkClose`); most faces looked past the lens (with
  `lens: true` the pupils come to the viewer); a talking shot's `says` was counted by hand (`weekend.py` refuses
  a wrong one and prints the right one; `"after": true` holds the end card until he has finished); the last
  caption lay on the end card; captions lay on a card's own text (the card's lower half dims under them until the
  push to the price). Learned and not fixed: a cast line under about six words comes out of the voice model
  garbled; the phone he holds up is blank; a label for a listing with no card is small.

- Nov 24, New York weekend reel after the founder's one-city note: a pick that read as another city is out. On the
  corrected Discover screen the captions fell on the app's own text and the reviewer failed it; with the captions on
  the poster, the labels clear of faces and no stray fifth card, it passed. A listing's start time moved by two hours
  within the day: fetch again right before a yes.
- Nov 24, the weekend builder, four things reviewers marked on every piece, fixed in `studio/weekend-reel.html` and
  `weekend.py`: on a card the captions sit on the poster, off the stamp, place and price; on the price's word the rest
  of the screen dims and the card stays whole (no push that cropped the day line); the end card is whole on its first
  frame; a chat opens with its first message already there. Seen on stills of the LA and New York scenes; the two MP4s
  were rendered before the last three and show them only on a next cut.
- Nov 25, the series, episodes 1 and 2 (PXI maker 2): "Strangers" (`videos/2026-11-27-strangers/`, for Fri Nov 27)
  and "One second" (`videos/2026-11-29-one-second/`, for Sun Nov 29), both 30 s, both built with `weekend.py` from
  cast lines, rig shots and the All events list, both passed one fresh reviewer who would have watched to the end.
  In both, the one moment the thumb twitched was the two seconds of the app's list ("reads as an ad"), and neither
  would be sent to a friend: the endings are a picture with no button. Learned: a wide shot of a table loses the
  speaker at the frame's edge (open on a face, cut wide); a zoom from the bottom edge lifts a face above the
  captions; a vocative name in purple reads as the name of whoever is on screen (names are not key words); the
  list's clock has to agree with a time said later (`"now"`); the dining room reads as a house, not a restaurant.
  Fixed in the tool: `"after"` takes seconds and works on any beat (the last picture holds, or follows a line);
  the caption over the list sat 13 px under the safe box on a descender.

