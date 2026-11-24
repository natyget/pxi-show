#!/usr/bin/env python3
"""What a video was rendered from, so a file that is older than its own scene or screens is caught.
  python3 studio/made.py write <video folder> <file.mp4>   (studio/compose.sh runs this) -> <file>.made.json
  python3 studio/made.py check <file.mp4>                  (studio/check.py video runs this) lists what changed since
It fingerprints what the picture is drawn from: the folder's scene, voice timings and seeds, the rebuilt app
screens (look/app-screens) and the fonts and brand files. Rig plates are not in the repo, so they are not checked."""
import glob, hashlib, json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def prints(folder):
    files = [f for pat in ("scene.html", "words.json", "reel.js", "seed*.json", "events/seed-*.json", "cues.json") for f in glob.glob(os.path.join(folder, pat))]
    files += [f for pat in ("look/app-screens/*.html", "look/app-screens/*.js", "look/brand/*", "look/fonts/*") for f in glob.glob(os.path.join(ROOT, pat))]
    return {os.path.relpath(f, ROOT): hashlib.sha1(open(f, "rb").read()).hexdigest()[:12] for f in sorted(files) if os.path.isfile(f)}
def changed(mp4):
    side = mp4 + ".made.json"
    if not os.path.exists(side): return None
    then = json.load(open(side)); now = prints(os.path.dirname(os.path.abspath(mp4)))
    return sorted(k for k in set(then) | set(now) if then.get(k) != now.get(k))
if __name__ == "__main__":
    if sys.argv[1] == "write": json.dump(prints(os.path.abspath(sys.argv[2])), open(sys.argv[3] + ".made.json", "w"), indent=1)
    else:
        c = changed(sys.argv[2]); print("no record of what it was rendered from" if c is None else "\n".join(c) or "rendered from the files as they are now")
