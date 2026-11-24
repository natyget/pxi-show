#!/usr/bin/env python3
"""The 3D rig from one command: what it has, whether it takes a shot, and one still to look at.

  python3 studio/rig.py list                      every set, the cast, actions, holds, faces
  python3 studio/rig.py list <set>                which camera sees a person at which place in that set
  python3 studio/rig.py check <spec.json>         ok, or every reason the world refuses the shot (no render)
  python3 studio/rig.py still <spec.json> <frame> <out.png>     one finished still (540x960: the rig's 180x320 at 3x)
  python3 studio/rig.py atlas <out.jpg> [--all] [set ...]       a labelled picture of each set (--all: of every camera)

Pick the camera from `list <set>`, check the spec, look at a still as the viewer, then render the shot with
studio/shot.py. `look/rig.md` shows the sets worth using, with a picture of each.

Talking: an actor in a spec may carry "says": [[frame, line], ...], where line is the number of a cast line in the
video's words.json (studio/voice.py) and frame is where that line starts in this shot. The mouth and the stressed
beats are worked out from that line's own audio."""
import json, os, subprocess, sys, tempfile
ROOT = os.path.dirname(os.path.abspath(__file__)); RIG = os.path.join(ROOT, 'world3d')
NOISE = ('You might have inadvertently set the --memory flag', 'docker run', 'Remotion will use')  # lines the renderer prints on every run

def expand(spec, spec_path):
    """An actor's "says" becomes the rig's own "speak" (mouth shapes) and "acc" (stressed beats), from the line's audio."""
    if not any('says' in a for a in spec.get('actors', [])): return spec
    sys.path.insert(0, ROOT); import lipsync, accents
    video = os.path.dirname(os.path.dirname(os.path.abspath(spec_path))); vo = json.load(open(os.path.join(video, 'words.json')))['lines']
    for a in spec['actors']:
        says = a.pop('says', None)
        if not says: continue
        a['speak'], a['acc'] = [], []
        for frame, i in says:
            l = vo[i]
            if 'file' not in l: sys.exit(f"line {i} is the narrator's: only a cast line (\"nio: ...\" in the voice block) moves a mouth")
            wav = os.path.join(video, l['file']); a['speak'].append([frame, lipsync.run(wav, l['text'])]); a['acc'].append([frame, accents.accents(wav)])
    return spec

def expanded(spec_path):
    """The spec as the rig takes it, in a temporary file."""
    spec = json.load(open(spec_path)); spec = expand(spec.get('spec', spec), spec_path)
    tmp = tempfile.mktemp(suffix='.json'); json.dump(spec, open(tmp, 'w')); return spec, tmp

def info(*args):
    js = os.path.join(RIG, 'out', 'rig_info.js'); os.makedirs(os.path.dirname(js), exist_ok=True)
    subprocess.run(['npx', 'esbuild', 'tools/rig_info.ts', '--bundle', '--platform=node', '--log-level=error', '--outfile=' + js], cwd=RIG, check=True)
    return subprocess.run(['node', js, *args], cwd=RIG).returncode

def info_json(*args):
    js = os.path.join(RIG, 'out', 'rig_info.js'); os.makedirs(os.path.dirname(js), exist_ok=True)
    subprocess.run(['npx', 'esbuild', 'tools/rig_info.ts', '--bundle', '--platform=node', '--log-level=error', '--outfile=' + js], cwd=RIG, check=True)
    return json.loads(subprocess.run(['node', js, *args], cwd=RIG, capture_output=True, text=True, check=True).stdout)

def atlas(out, args):
    from PIL import Image, ImageDraw
    shots = info_json('atlas', *args); tmp = tempfile.mkdtemp(prefix='atlas_'); tiles = []
    for i, sh in enumerate(shots):
        if not sh['mark']: print('no place fits', sh['set'], sh['camera']); continue
        sp = os.path.join(tmp, f'{i}.json'); json.dump(sh['spec'], open(sp, 'w')); png = os.path.join(tmp, f'{i}.png')
        for attempt in range(3):  # a blank frame is the busy machine: try again
            if still(sp, 0, png, quiet=True) == 0: break
        if os.path.exists(png): tiles.append((sh, png)); print(len(tiles), '/', len(shots), sh['set'], sh['camera'], flush=True)
    cols = min(6, len(tiles)) or 1; tw, th, lab = 270, 480, 44; rows = -(-len(tiles) // cols)
    sheet = Image.new('RGB', (cols * tw, rows * (th + lab)), '#0b0b0d'); d = ImageDraw.Draw(sheet)
    for k, (sh, png) in enumerate(tiles):
        x, y = (k % cols) * tw, (k // cols) * (th + lab)
        sheet.paste(Image.open(png).convert('RGB').resize((tw, th), Image.NEAREST), (x, y + lab))
        d.text((x + 8, y + 6), sh['set'], fill='#ffffff'); d.text((x + 8, y + 24), f"camera {sh['camera']}, at {sh['mark']}", fill='#c26bff')
    sheet.save(out, quality=88); print(len(tiles), 'pictures ->', out)

def still(spec_path, frame, out, quiet=False):
    spec, tmp = expanded(spec_path)
    if not quiet and info('check', tmp): return 1
    raw = tempfile.mktemp(suffix='.png')
    r = subprocess.run(['npx', 'remotion', 'still', 'src/index.ts', 'N3Shot', raw, '--props=' + json.dumps({'spec': spec}), f'--frame={frame}', '--gl=swangle',
                        '--log=error', '--timeout=240000', '--browser-executable=/opt/pw-browsers/chromium'], cwd=RIG, capture_output=True, text=True)
    for line in (r.stdout + r.stderr).splitlines():
        if line.strip() and not any(n in line for n in NOISE): print(line)
    if r.returncode or not os.path.exists(raw): return 1
    import numpy as np
    from PIL import Image
    sys.path.insert(0, os.path.join(RIG, 'tools'))
    from nw_finish import finish
    px = np.array(Image.open(raw).convert('RGB'))
    if px.std() < 4: print('the rig drew a blank frame (the machine was busy): run it again, alone'); return 1
    im = Image.fromarray(finish(px, int(frame))); im.resize((im.width * 3, im.height * 3), Image.NEAREST).save(out)
    if not quiet: print('still ->', out)
    return 0

if __name__ == '__main__':
    a = sys.argv[1:]
    if not a or a[0] not in ('list', 'check', 'still', 'atlas'): sys.exit(__doc__)
    if a[0] == 'atlas': sys.exit(atlas(os.path.abspath(a[1]), a[2:]))
    if a[0] == 'still':
        if len(a) != 4: sys.exit(__doc__)
        sys.exit(still(a[1], a[2], os.path.abspath(a[3])))
    if a[0] == 'check': a[1] = expanded(a[1])[1]
    sys.exit(info(*a))
