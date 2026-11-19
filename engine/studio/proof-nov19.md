# Proof, Nov 19: what the new checks find in the four launch skits as they were cut

Run on the shot files of One Sip v11, Wave Back v10, Group Photo v12 and Aux v12 exactly as they were rendered and sent to the stranger. The old world check (`tools/skit_check.ts`) printed RESULT PASS for all four. Times are seconds into the cut, so they can be laid beside the stranger's reviews (`episodes/launch-skits/review/`).

## Story check (`studio/anim/tools/story_check.ts`)

### one-sip

```
Story check: one-sip, 31 shots, 58.7 s
speaker    shot 29      55s  sami says "Theo, I stand by the haircut." but is not in the picture; the viewer gives it to nio or theo or maya or imane or girl.
continuity shot 13    25.2s  sami changes to [longcoat] with his back to us. The viewer never sees him put it on (One Sip v11: "a coat I never saw him put on").
continuity shot 18    32.7s  sami cut from [longcoat] (shot 17) to [glove+longcoat] with no shot of it happening.
continuity shot 27    51.2s  sami changes to [nothing] with his back to us. The viewer never sees him put it on (One Sip v11: "a coat I never saw him put on").
lens       shot 1        0s  theo faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 1.5    1.3s  sami faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 10    19.5s  theo faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 15    27.4s  sami faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 16    30.2s  theo faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 17    31.5s  sami faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 18    32.7s  sami faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 21    38.9s  sami faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 22    39.6s  sami faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 26    49.8s  sami faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
empty      shot 13    25.3s  No face and no line in the picture: an empty shot. Give it a face, or list it in the intent ledger with what the viewer reads.
empty      shot 27    51.4s  No face and no line in the picture: an empty shot. Give it a face, or list it in the intent ledger with what the viewer reads.
empty      shot 28      53s  No face and no line in the picture: an empty shot. Give it a face, or list it in the intent ledger with what the viewer reads.
RESULT FAIL (speaker 1, continuity 3, lens 10, empty 3)
```

### wave-back

```
Story check: wave-back, 40 shots, 68.6 s
speaker    shot 6      9.1s  marcus says "Wait. I know you. Lakeview? Cabin Four?" but sis is nearer the lens, in front of his face.
speaker    shot 8     15.6s  marcus says "Reunion's Sunday. You're coming." but sis is nearer the lens, in front of his face.
speaker    shot 11    23.2s  maya's line "You never went to camp." plays over a picture with nobody in it (a screen). Show maya saying it, or mark it off: "<why>" on the board.
speaker    shot 13.5  27.3s  marcus says "Guys! Nio! Cabin Four!" but is not in the picture; the viewer gives it to nio.
speaker    shot 26    49.3s  tobi says "Nio. Come out." but is not in the picture; the viewer gives it to nio.
cast       shot 1        0s  marcus is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
cast       shot 6      8.8s  marcus is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
cast       shot 8     15.5s  marcus is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
cast       shot 15    31.4s  tobi is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
cast       shot 17    35.2s  tobi is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
cast       shot 20    39.5s  tobi is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
lens       shot 1        0s  marcus faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 2      1.5s  nio faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 2      1.5s  sis faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 3      3.2s  nio faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 4      5.8s  nio faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 23    44.5s  camp1 faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 26    48.8s  nio faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 29    53.8s  nio faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 30      55s  nio faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 32    56.8s  nio faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
empty      shot 27    51.8s  No face and no line in the picture: an empty shot. Give it a face, or list it in the intent ledger with what the viewer reads.
RESULT FAIL (speaker 5, cast 6, lens 10, empty 1)
```

### group-photo

```
Story check: group-photo, 45 shots, 84.3 s
cast       shot 29    53.6s  guest2 is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
cast       shot 31    56.1s  guest2 is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
cast       shot 32    57.4s  guest2 is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
cast       shot 34      62s  guest2 is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
lens       shot 1        0s  theo faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 1        0s  sami faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 1        0s  maya faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 4      9.7s  theo faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 4      9.7s  sami faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 4      9.7s  maya faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 5       12s  theo faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 5       12s  sami faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 5       12s  maya faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 6     13.3s  sami faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 8       19s  sami faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 9     19.9s  theo faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 9     19.9s  maya faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 11    22.8s  theo faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 16    31.3s  maya faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 18    33.8s  maya faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 20    37.8s  maya faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 32    57.4s  guest2 faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
lens       shot 40    74.5s  nio faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
empty      shot 4     10.8s  No face and no line in the picture: an empty shot. Give it a face, or list it in the intent ledger with what the viewer reads.
empty      shot 24      47s  No face and no line in the picture: an empty shot. Give it a face, or list it in the intent ledger with what the viewer reads.
empty      shot 26    50.1s  No face and no line in the picture: an empty shot. Give it a face, or list it in the intent ledger with what the viewer reads.
RESULT FAIL (cast 4, lens 19, empty 3)
```

### aux

```
Story check: aux, 43 shots, 77.7 s
speaker    shot 1      0.2s  maya's first line "That girl's reading the fire exit sign." is in a shot with 3 other faces (theo, sami, nio). Introduce a voice on his own face first.
speaker    shot 6       19s  guest1 says "It's raining inside!" but is not in the picture; the viewer gives it to girl2 or guest3 or cap.
speaker    shot 6       19s  guest1's first line "It's raining inside!" is in a shot with 3 other faces (girl2, guest3, cap). Introduce a voice on his own face first.
speaker    shot 6     20.5s  guest2 says "My phone, my phone!" but is not in the picture; the viewer gives it to girl2 or guest3 or cap.
speaker    shot 6     20.5s  guest2's first line "My phone, my phone!" is in a shot with 3 other faces (girl2, guest3, cap). Introduce a voice on his own face first.
speaker    shot 21      55s  guest2 says "I was on the ceiling." with his back to us. Nobody can tell who is talking.
speaker    shot 21.5  57.3s  guest1 says "My shoe's still up there." with his back to us. Nobody can tell who is talking.
speaker    shot 22.5  61.5s  guest2 says "Next weekend?" but is not in the picture; the viewer gives it to theo.
speaker    shot 27    73.5s  maya says "He's not worth it." with his back to us. Nobody can tell who is talking.
continuity shot 16    46.6s  guest3 cut from [nothing] (shot 6) to [partyhat] with no shot of it happening.
continuity shot 16    46.6s  maya cut from [nothing] (shot 13) to [partyhat] with no shot of it happening.
continuity shot 16    46.6s  sami cut from [nothing] (shot 13) to [partyhat] with no shot of it happening.
continuity shot 20      53s  theo cut from [nothing] (shot 11) to [partyhat] with no shot of it happening.
continuity shot 20      53s  nio cut from [nothing] (shot 14) to [partyhat] with no shot of it happening.
continuity shot 21.5  57.1s  guest1 cut from [nothing] (shot 13) to [partyhat] with no shot of it happening.
continuity shot 23    62.8s  nio cut from [partyhat] (shot 20) to [nothing] with no shot of it happening.
continuity shot 23    62.8s  theo cut from [partyhat] (shot 22.5) to [nothing] with no shot of it happening.
continuity shot 23    62.8s  maya cut from [partyhat] (shot 20) to [nothing] with no shot of it happening.
continuity shot 23    62.8s  sami cut from [partyhat] (shot 20) to [nothing] with no shot of it happening.
cast       shot 2      2.7s  girl3 is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
cast       shot 5.2     14s  girl2 is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
cast       shot 5.3     16s  girl2 is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
cast       shot 12      37s  guest1 is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
cast       shot 17    48.3s  guest3 is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
cast       shot 21    54.9s  guest2 is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
cast       shot 21.5  57.1s  guest1 is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
cast       shot 22    59.6s  guest3 is not on a passed model sheet (engine/studio/cast.json) and is featured here. Pass a model sheet first (engine/studio/departments.md, Model).
lens       shot 5.2     14s  girl2 faces straight into the lens with nothing to look at. Face him at someone (facing) or give a gaze.
empty      shot 5.4     18s  No face and no line in the picture: an empty shot. Give it a face, or list it in the intent ledger with what the viewer reads.
empty      shot 7     23.5s  No face and no line in the picture: an empty shot. Give it a face, or list it in the intent ledger with what the viewer reads.
RESULT FAIL (speaker 9, continuity 10, cast 8, lens 1, empty 2)
```

## Sound check (`engine/tools/sound_check.py`), each sound on its own

```
sk_party     ok    heard as Music 0.55, Electronic music 0.12, Techno 0.07
sk_walla     ok    heard as Speech 0.60, Male speech, man speaking 0.09, Speech synthesizer 0.07
sk_chatter   FAIL  at 0s heard as Music 0.38, Stream 0.06, Insect 0.05, Speech 0.04  << not heard as Chatter
sk_dinner    FAIL  at 0s heard as Ding 0.43, Chime 0.07, Chink, clink 0.05, Ping 0.05  << not heard as Chatter
sk_roof      FAIL  at 0s heard as Eruption 0.08, Vehicle 0.06, Explosion 0.06, Sound effect 0.05  << not heard as Wind
sk_quad      FAIL  at 4s heard as Vehicle 0.06, Bird 0.03, Buzzer 0.03, Chirp, tweet 0.03  << not heard as Outside, urban or manmade
sk_rain      ok    heard as Rain on surface 0.36, Raindrop 0.25, Rain 0.23
sk_mower     FAIL  at 0s heard as Aircraft 0.15, Vehicle 0.15, Helicopter 0.12, Propeller, airscrew 0.04  << bad: Helicopter
sk_splash    FAIL  at 0s heard as Explosion 0.35, Burst, pop 0.22, Eruption 0.07, Sound effect 0.07  << bad: Explosion
sk_sip       FAIL  at 0s heard as Sound effect 0.04, Scrape 0.03, Coin (dropping) 0.03, Static 0.03  << not heard as Slurp
sk_gulp      FAIL  at 0s heard as Sound effect 0.11, Music 0.07, Synthesizer 0.04, Electronic music 0.04  << not heard as Gulp
sk_sniff     FAIL  at 0s heard as Sound effect 0.18, Speech 0.03, Frog 0.02, Music 0.02  << not heard as Sniff
sk_snort     FAIL  at 0s heard as Sound effect 0.19, Frog 0.02, Music 0.02, Speech 0.02  << not heard as Snort
sk_gasp      ok    heard as Speech 0.66, Wail, moan 0.08, Whimper 0.08
sk_cheer     FAIL  at 0s heard as Speech 0.48, Whoop 0.08, Bellow 0.06, Screaming 0.06  << not heard as Cheering
sk_boo       ok    heard as Sigh 0.20, Grunt 0.16, Gasp 0.12
sk_ding      ok    heard as Ding 0.57, Clang 0.31, Sound effect 0.02
sk_plink     ok    heard as Ding 0.76, Clang 0.26, Sound effect 0.01
sk_pop       FAIL  at 0s heard as Beep, bleep 0.19, Sound effect 0.09, Smoke detector, smoke alarm 0.06, Ding 0.05  << bad: Beep, bleep
sk_hit       FAIL  at 0s heard as Sound effect 0.23, Music 0.04, Bang 0.04, Ding 0.02  << not heard as Slap, smack
sk_flop      ok    heard as Sound effect 0.43, Boing 0.07, Bang 0.07
sk_piano     ok    heard as Music 0.72, Musical instrument 0.24, Synthesizer 0.20
sk_muzak     ok    heard as Music 0.44, Vibraphone 0.40, Marimba, xylophone 0.37
oh_tap       FAIL  at 0s heard as Silence 0.13, Music 0.07, Sound effect 0.06, Speech 0.03  << not heard as Tap
oh_click     FAIL  at 0s heard as Sound effect 0.14, Clang 0.04, Music 0.02, Ding 0.02  << not heard as Clicking
oh_bang      ok    heard as Bang 0.27, Burst, pop 0.16, Explosion 0.07
oh_hit       FAIL  at 0s heard as Music 0.11, Sound effect 0.11, Synthesizer 0.08, Electronic music 0.05  << not heard as Slap, smack
oh_creak     FAIL  at 0s heard as Fart 0.68, Boing 0.14, Sound effect 0.10, Grunt 0.03  << bad: Fart
ne_knock     ok    heard as Knock 0.47, Drum machine 0.18, Music 0.11
ne_swell     FAIL  at 0s heard as Sine wave 0.65, Chirp tone 0.12, Beep, bleep 0.04, Whistle 0.04  << bad: Sine wave
RESULT FAIL (18 of 30 sounds not heard as what they are)
```

## What lines up with the stranger

| Stranger said | Check that now catches it, before a frame is drawn |
|---|---|
| Wave Back 9.4 s: "a guy in a red cap says 'Wait. I know you...' and a long-black-haired person with their back to us is in the frame. I cannot tell who is speaking." | speaker, shot 6, 9.1 s: Sis is nearer the lens, in front of Marcus's face |
| Wave Back 15.6 s: "'Reunion's Sunday. You're coming.' is said by someone I cannot see." | speaker, shot 8, 15.6 s |
| Wave Back: "'You never went to camp.' appears over a phone call screen ... nobody's face is visible" | speaker, shot 11, 23.2 s: Maya's line over a screen |
| Wave Back: "'Nio. Come out.' unattributed"; Marcus and Tobi "off-model because they are not in the golden cast" | speaker, shot 26; cast, shots 1 to 20 |
| One Sip 27.6 s: "a brown coat-like shape that I never saw him put on" | continuity, shot 13: the coat goes on with his back to us; shot 18: the glove appears between shots |
| One Sip 55.0 s: "'Theo, I stand by the haircut.' pays off nothing I could follow" (said through the door) | speaker, shot 29: said by someone not in the picture, with no off: reason on the board |
| One Sip 52.9 s: "he walks off alone through the room", "an almost empty room" | empty, shots 27 and 28 |
| One Sip 0.6 s: "smiling at the camera" | lens, shot 1, 0 s: Theo |
| Group Photo 47.5 s: "a pure skyline with nobody in it" | empty, shot 24, 47.0 s |
| Group Photo 7.8 s, 15.0 s: "looks straight at the camera" | lens, shots 4 to 9 (posing for Nio's phone: legitimate only if written as lens: true with a ledger row) |
| One Sip 48 to 52 s: "Beep, bleep ... fails the piece" | sound, sk_pop: heard as Beep, bleep alone |
| Wave Back 56 to 64 s: "helicopter, vehicle, explosion and eruption ... a quiet lake and a small tractor" | sound, sk_mower: Helicopter; sk_splash: Explosion |
| Wave Back 28 to 48 s: "dings, chimes ... over a room of people talking" | sound, sk_dinner: heard as Ding |
| Group Photo 32 to 36 s: "Explosion / Eruption ... nobody doing anything" | sound, sk_roof: heard as Eruption, Explosion |
| One Sip 40 to 44 s: "Fart" | sound, oh_creak: heard as Fart 0.68 |

## The animatic

`node studio/anim/tools/animatic.mjs wave-back <out> --shots 1,...,11` renders the key frames of Wave Back's
opening with their subtitles: Marcus's first line sits on Sis's hair (sheet in the project files,
`studio-engine/wave-back-animatic-opening.jpg`). A blind reader given that sheet faces the same problem the
stranger did, a full render and a stranger round earlier.
