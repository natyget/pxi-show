# State

next: the scheduler thread schedules "idk to omw" (its `post.md` is approved). The maker thread makes the New York
weekend reel from real listings, then Boston. The trainer tests the engine with the cheaper model and fixes what
that shows.

## Where things stand (Nov 24, 2026)

- **Scheduled (not drafts):** "idk to omw" goes out Tue Nov 24 (America/Chicago): Instagram and Facebook Reel 6:30 PM
  (cover.jpg, TrackTribe "Just A Weekend" at 18), TikTok 6:35 PM, YouTube Short 6:40 PM. Read back from Metricool.
- **Metricool:** every pending post through Dec 8 was set to draft on Nov 23 (the founder: "nuked"). Nothing is
  scheduled to publish. The old "PXI social engine" scheduled task is off. The "Weekly show progress recap" task
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
- **Scheduled:** "PXI Monday heavy run" (Mon 1:45 PM), "PXI Thursday light run" (Thu 12:17 PM), "PXI Sunday plan
  run" (Sun 6:38 PM), all America/Chicago, each a fresh session that follows `runs.md`. They were created without
  the Metricool connector (this workspace does not let a session attach one): until the founder adds it to each
  task in the scheduled-tasks page, a run can make and plan but cannot read numbers or schedule posts.
- **Not built yet:** a pose library and mouth shapes for dialogue, the app's real Map and listing screens, real
  street maps (OpenStreetMap tiles are reachable), a story template for the daily listing cards.
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

## Open decisions (the founder's)

- Which city leads the profile name: New York or Boston.

## Founder notes (newest first, word for word)

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

- (none yet)
