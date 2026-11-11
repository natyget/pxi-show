# Characters (who they are, how they look, how they sound)

Who they are comes from the founder's notes of Nov 9 to Nov 11 (`bible/show-bible.md`). The newest note wins.
Looks are as built in `studio/anim/src/world/Character.tsx`. The look of the whole show is being redesigned in
its own thread; until `bible/style-lock.md` is filled in, the looks below are the working ones.

## Nio

**In one line:** a 21-year-old who moved to a new city for college, has no money, built an app called PXI
because he kept missing everything, and is funnier than everyone in the room and knows it.

- **He is Gumball's kind of lead, with Gumball's soul.** Alive, quick, expressive. He gets hyped about himself,
  devastated by small personal things, and bored by things that should scare him. He is never robotic and
  never a narrator of his own plan. He is never a goof and never stupid. He is good-looking.
- **He trolls.** He asks the obvious question on purpose and keeps a straight face while the other person
  explains. He rage-baits friends for fun, copies the way they talk back at them, and starts laughing before
  they work out what he is doing. A dumb question from Nio is always a move, never a mistake.
- **He changes humors.** Deadpan one scene, hyped the next, petty, then sweet. The switch is the character.
- **He is laid back and he shows up.** He carries the friend home. He cannot say no to people, which is how he
  ends up in most of his problems. He hates on things freely and has a take on everything.
- **Blank but aware, and blank but not aware.** Sometimes he knows he is in a show and says "this can't be
  real". The next scene he misses the most obvious signal in the room, usually that a girl likes him.
- **He never explains himself.** Asked about anything sensitive (the girl, the breakup, the state of his room,
  why he was crying), he does not deny it, explain it or say he does not want to talk about it. He pivots to
  something sweeter, bigger or more interesting, and the room follows him.
- **Chill about the weird, big about himself.** A man under his bean bag gets a nod. A bad photo of him gets a
  full collapse. He stays calm when the world is insane and never screams at the strange thing.
- **PXI is his.** He built it and he is casual about it: "this my app, yo." Nobody around him is impressed.
- **Colour to use:** he wears contacts and cannot see without them. He speaks a little French and a little
  Arabic, both badly and with total confidence, which makes him friends with everyone in his building. His
  apartment is nice, new and spotless. He goes for walks alone after a long night; those are the quiet moments.
- **His girl.** He has a girlfriend when the series starts. She becomes his ex within the first few episodes,
  after a friend remarks that his room is messy just after she has left. He does not talk about it. Ever.
- **Key lines, each at most once an episode and not every episode:** "This can't be real." "Yeah, what's up."
  "I'm just tired." "They left."

**Look:** light skin `#d8a27c`, short black textured hair with a fade and its own volume, brown eyes, broad
shoulders, oversized burnt-orange crewneck, charcoal pants, spotless white sneakers. No hood. Attractive, no
receding jaw, eyes not too wide. The head is owned by the Nio head thread.

**Voice (locked by the founder, restated Nov 11): a designed voice, Qwen3-TTS VoiceDesign.** The description
sent to the tool, word for word:

> A 21-year-old Black American guy, light-skinned, lower-mid pitch, warm and a little husky, quick and animated like the lead of a cartoon comedy; confident, cocky, playful; big swings between deadpan and excited; casual Gen Z delivery.

## Maya

**In one line:** Nio as a girl, except that he cares what happens and she does not, and that scares him.

- Co-lead, in about four episodes out of ten. Provoking, outspoken, bossy in a way that gets things done, laid
  back. She gets them into things: she has already said yes for both of them.
- **She says the quiet part out loud, then moves on as if it were nothing.** She interrupts. She is faster and
  louder than Nio and she says the thing he will not say.
- Her voice is sweet, bright and earnest, and that is the joke: the most alarming sentence in the episode
  arrives in the kindest voice. She answers the words, not the meaning.
- She never does trend bits. If a trend appears, a girl says it to Nio's face and he cannot believe it.

**Look:** deep brown skin `#8d5a3d`, round face, curly puff high on the back of the head, gold hoops, lashes,
oversized green varsity jacket with cream sleeves.

**Voice (locked): Qwen3-TTS VoiceDesign.** Word for word:

> A young woman around 20, bright, sweet and earnest voice, soft and clear, slightly higher pitch, gentle and kind, a little breathless when excited; sincere and literal, like the kind sidekick in a cartoon.

## The best friend

Across the country. Phone only: a call, a voice note, a split screen. Nio tells him what happened and we
overhear it; that is how the show explains anything, because there is no narrator. He talks like a real phone
call: "Bro." "Wait, what?" "You are lying." No approved voice yet. Until the founder picks one, he is heard
only as text on Nio's screen.

## Everyone else

- **The world's people** talk as if they have lived in this strange place forever. They never explain the
  strange thing. "Yeah, I know. Weird. He's cool though."
- **The Kevin** (`bible/humor.md`): someone or something that was in the room the whole time. No origin story.
- **Friends are plots.** The lightweight who cannot hold a drink, the neighbour in love, the girl a year below
  him at college. They come from the founder's real stories (`engine/real-stories.md`), with every name and
  detail changed.
- People return: in the background of one episode, a line in the next, a friend after that.
- The sock guy (tall, bald, moustache, sunglasses indoors, black suit) is from the parked Ep 1 and may return
  as a Kevin.

## How a voice line is made (the only approved way)

- **Model:** `Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign` (Apache-2.0). An original voice designed from text. No
  actor is cloned or imitated.
- **Setup:** `qwen-tts 0.1.1` with its pinned parts (transformers 4.57.3, torch on CPU), installed from the
  pinned wheel with `--no-deps`. Never `pip install -U qwen-tts`.
- **Load:** `Qwen3TTSModel.from_pretrained(..., device_map="cpu", dtype=torch.float32, attn_implementation="sdpa")`.
- **Each line:** `torch.manual_seed(7)`, then `generate_voice_design(text=<line>, instruct=<the description
  above> + " " + <a short acting note for this line>, language="English")`. The acting note is where the
  performance comes from: "Hyped, bragging, can't stop smiling." "Devastated, quiet, like it is the worst thing
  that has happened to anyone." A line without an acting note comes out flat, and flat is a defect.
- **In the text sent to the tool, PXI is written `pixie`.** Nothing with "aight", "ight" or a drawn-out "nah".
- **Treatment:** clean. The file is trimmed and levelled to −16 LUFS and nothing else. The handoff the
  founder approved also had a walkie-talkie colour (`studio/voice/fx2.py`, roles `dnio` and `dmaya`: band-pass,
  bit-crush, vibrato, no pitch shift). The founder then called a pilot's voices "weird robo like buble voice"
  (Nov 10), and `bible/craft-library.md` treats any bubbly or metallic voice as a defect. So the colour stays
  off until the founder has heard both and picks (open decision in `engine/STATE.md`).
- **Output:** `public/vo/<key>.wav`, 48 kHz mono, with the 12 fps mouth envelope merged into `src/audio.json`.
- **Never:** the earlier Chatterbox and Kokoro picks (`am_puck`, `af_river` and the rest), any other tool, or
  any stand-in. If this voice cannot be made in the session, the stage is `BLOCKED`.
- Every new batch is compared by ear with the approved reference lines before it goes into a cut. The founder
  approved the designs, and still has to hear them in a finished cut before `bible/style-lock.md` records them.
