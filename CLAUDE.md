# PXI studio: how to work in this repo

This repo makes PXI's short videos and stills for @pxi.app (Instagram, TikTok, YouTube Shorts, Facebook): city
discovery reels, one-feature stories, Nio to camera, Nio World skits. All 9:16, all made in code: the 3D rig draws
the world and the cast (`studio/world3d`), HTML draws the real app screens and the captions, FFmpeg makes the file.
The old engine's rules and scripts are in `archive/`. They are history: never copy a line, name, joke or rule out
of them. Its renderer is the one part that lives on.

## Read in this order, every session

1. `STATE.md`: what is next and what the founder said last.
2. `studio/viewer.md`: who every piece is for, and how to check it as that person.
3. `dont.md`: the mistakes we never repeat.
4. `method.md`: how a video is made, step by step, with the commands.
5. A scheduled run: its section of `runs.md`.
6. Only what the job needs: `look/look.md` (how it looks), `product.md` (what PXI is), `growth.md` (what to post,
   hooks, endings, audio, the weekly loop).

## Rules

- **Show, never describe.** Quality is proven by a rendered file or a contact sheet, never by a sentence.
- **Discover leads.** The shared album and the camera come right after.
- **Every video:** a hook in the first 2 seconds, voice first or captions only, a caption on every spoken word,
  one idea per beat, one ending. 30 to 45 s or 60 to 90 s.
- **Think as the viewer** (`studio/viewer.md`): someone who has never heard of PXI or Nio. Say "you". If the
  founder would catch it, catch it first.
- **The world is Nio World, the app is real.** The cast and sets come from the 3D rig. App screens are the real
  app rebuilt (`look/app-screens/`) and animated. Never a fake screen, never a feature the app does not have.
- **One fix, one place.** When something goes wrong, fix the cause in the template or the tool. Never stack a new
  rule on top of an old one: change or delete the old one. A note from the founder is not a new rule; it is a
  sign the maker stopped thinking as the viewer.
- **Founder notes** go at the top of `STATE.md` the day they arrive, word for word. If a note changes a rule,
  change that rule in the one file that owns it.
- **Nothing leaves without the founder's yes** on that exact piece. Metricool: the PXI LABS brand only (blogId
  7790844), never @pxi.nyc. Show the video file before anything is scheduled.
- **Sound:** the narrator is the Kokoro `am_michael` voice (`studio/voice.py`). Nio and the cast speak in their own
  designed voices (`studio/cast_voice.py`, locked in `studio/cast_voice.json`).
  Never AI-generated music. Instagram reels get a licensed library track when scheduled; TikTok photo posts get
  auto music; TikTok videos carry their own sound.
- No copyrighted characters, music or art. No fee comparisons. Never the founder's photos. Keep the founder's name
  and email out of outside services. `pxi-mobile-app` is read-only. No model name in any commit or file. No pull
  request unless asked.

## Where things are

| Path | What |
|---|---|
| `STATE.md` | Next action, founder notes, open decisions |
| `dont.md` | Never again, one line each |
| `method.md` | The pipeline and its commands |
| `look/` | Palette, fonts, styles, cast, the rebuilt app screens, brand files |
| `product.md`, `growth.md` | What PXI is; what to post and how we learn |
| `runs.md` | The three scheduled runs a week: what each one does |
| `studio/` | The tools: `world3d` (the 3D rig), scene template, render, voice, sound, compose, check, `viewer.md` |
| `videos/<date>-<slug>/` | One folder per video: script, caption, scene, timings, contact sheet, the MP4s |
| `archive/` | The old engine's rules, scripts and renders |
