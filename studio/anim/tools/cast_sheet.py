#!/usr/bin/env python3
"""cast_sheet.py <who> <out.png> : the model sheet for one of the cast, drawn by the engine (tools/n3_cast.sh).
A turnaround (front, three-quarter, side, back), a row of faces, and the poses given below. Every picture is the engine's
own render at its native pixels, enlarged, nothing painted over.
cast_sheet.py lineup <out.png> : everyone side by side, for heights and colours.
cast_sheet.py shots <specs.json> <out.png> <title> <note> <caption> ... : shot specs drawn through the world rules (N3Shot)."""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ANIM = os.path.dirname(HERE); OUT = os.path.join(ANIM, 'out', 'cast')
os.makedirs(OUT, exist_ok=True)
F = lambda w, px: ImageFont.truetype(os.path.join(ANIM, 'public', 'pxi-ui', 'fonts', f'Inter-{w}.otf'), px)
BG, INK, DIM, PURPLE = (24, 18, 21), (240, 236, 232), (165, 152, 160), (0xA5, 0x23, 0xEF)

def cast(name, props, scale=3):
    f = os.path.join(OUT, f'_{name}.png')
    subprocess.run([os.path.join(HERE, 'n3_cast.sh'), f, json.dumps(props), str(scale)], check=True)
    return Image.open(f).convert('RGB')

def shot(spec, i, frame=12, scale=3):
    raw = os.path.join(OUT, f'_shot{i}_raw.png'); fin = os.path.join(OUT, f'_shot{i}.png')
    subprocess.run(['npx', 'remotion', 'still', 'src/index.ts', 'N3Shot', raw, '--props=' + json.dumps({'spec': spec}), f'--frame={min(frame, spec["frames"] - 1)}',
                    '--gl=swangle', '--log=error', '--browser-executable=/opt/pw-browsers/chromium'], cwd=ANIM, check=True, stdout=subprocess.DEVNULL)
    subprocess.run(['python3', os.path.join(HERE, 'nw_finish.py'), 'still', raw, fin, str(scale)], check=True, stdout=subprocess.DEVNULL)
    return Image.open(fin).convert('RGB')

# who: (head height for the faces row, the faces, the poses: (label, actor fields, camera))
CAST = {
    'maya': dict(title='Maya', note="Deep brown skin, a round face, lashes, gold hoops. Her curls are pulled back into a puff high on the back of her head. "
                 "An oversized green varsity jacket with cream sleeves. A head shorter than Nio.", head=1.31,
                 faces=[('neutral', 'bright'), ('laughing', 'laughing'), ('real', 'means it'), ('hyped', 'delighted'), ('uneasy', 'reads the room')],
                 poses=[('at the party, a cup', dict(pose='cup', face='charm')), ('showing him something', dict(pose='show-phone', face='hyped')),
                        ('hand up', dict(pose='arm-up', face='laughing', yaw=168))]),
    'sami': dict(title='Sami', note="Tall and narrow, light olive skin, a longer face. Neat black hair, parted on the left. Always slightly overdressed: "
                 "a mustard knitted vest over a cream shirt, trousers with a fine check you have to squint at, brown loafers.", head=1.53,
                 faces=[('neutral', 'dignified'), ('smug', 'magnificent'), ('sheepish', 'someone saw'), ('suspicious', '"I am completely fine"'), ('asleep', 'upright, asleep')],
                 poses=[('arms up', dict(pose='arms-up', face='hyped', yaw=176)), ('a cup, held', dict(pose='cup', face='smug')),
                        ('asleep sitting up', dict(pose='asleep', face='asleep', clip='Sitting_Idle_Loop', seat=0.47, stance=1, arms=1, upright=0.3))]),
    'theo': dict(title='Theo', note="At the party. Warm brown skin, short twists, a rust hoodie and khakis. Always holding a drink he is not drinking, to point with.",
                 head=1.43, faces=[('smug', 'calls it'), ('hyped', 'called it'), ('laughing', 'laughing'), ('shock', 'asked if he has seen it'), ('neutral', 'neutral')],
                 poses=[('pointing with the cup', dict(pose='cup-point', face='smug', clip='Idle_Talking_Loop', arms=0.8, upright=0.7)),
                        ('the cup', dict(pose='cup', face='neutral')), ('hand up', dict(pose='arm-up', face='hyped', yaw=168))]),
    'imane': dict(title='Imane', note="At the party, a year below. Light brown skin, lashes, straight black hair to the jaw. A burgundy top and light jeans. Her whole logic: no.",
                  head=1.31, faces=[('suspicious', 'no'), ('deadpan', 'still no'), ('smug', 'told you'), ('laughing', 'once a year'), ('shock', 'shock')],
                  poses=[('the cup', dict(pose='cup', face='deadpan')), ('arms crossed', dict(pose='arms-crossed', face='suspicious')),
                         ('showing him the photo', dict(pose='show-phone', face='smug'))]),
}

def label(d, x, y, t, w=None, font=None, fill=DIM):
    font = font or F('Medium', 26); d.text((x, y), t, font=font, fill=fill)

def model_sheet(who, out):
    c = CAST[who]
    # turnaround: four views in one frame
    turn = cast(f'{who}_turn', dict(w=400, h=320, set='studio', camPos=[2.0, 0.95, -1.2], camAt=[2.0, 0.82, 2.5], fov=32,
                actors=[dict(who=who, at=[1.2 + i * 0.53, 2.5], yaw=y, face=c['faces'][0][0], arms=0.5) for i, y in enumerate([180, 135, 90, 0])]))
    # faces: five heads in a row
    hy = c['head']
    faces = cast(f'{who}_faces', dict(w=480, h=150, set='studio', camPos=[2.0, hy + 0.06, -0.3], camAt=[2.0, hy + 0.08, 2.5], fov=17,
                 actors=[dict(who=who, at=[1.0 + i * 0.5, 2.5], yaw=[188, 176, 184, 172, 180][i], face=f) for i, (f, _) in enumerate(c['faces'])]))
    # poses: three in one frame, turned three-quarters so the arms read
    poses = cast(f'{who}_poses', dict(w=480, h=320, set='studio', camPos=[2.0, 1.0, -1.6], camAt=[2.0, 0.88, 2.5], fov=31,
                 actors=[dict(who=who, at=[1.15 + i * 0.85, 2.5], **{'yaw': 150, **p}) for i, (_, p) in enumerate(c['poses'])]))
    M = 70; W = max(turn.width, faces.width, poses.width) + 2 * M
    H = M + 190 + turn.height + 70 + 60 + faces.height + 50 + 60 + poses.height + 50 + M
    sheet = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(sheet)
    d.text((M, M - 10), c['title'], font=F('Black', 72), fill=INK)
    # the note, wrapped
    words, line, y = c['note'].split(), '', M + 80
    for w_ in words:
        if d.textlength(line + ' ' + w_, font=F('Regular', 28)) > W - 2 * M: d.text((M, y), line.strip(), font=F('Regular', 28), fill=DIM); y += 38; line = ''
        line += ' ' + w_
    d.text((M, y), line.strip(), font=F('Regular', 28), fill=DIM)
    y = M + 190
    sheet.paste(turn, (M, y)); y += turn.height + 14
    for f, t in zip([0.13, 0.36, 0.58, 0.79], ['front', 'three-quarter', 'side', 'back']): label(d, M + int(f * turn.width) - 30, y, t)
    y += 56
    d.text((M, y), 'Faces', font=F('Bold', 40), fill=INK); y += 60
    sheet.paste(faces, (M, y)); y += faces.height + 10
    for i, (_, t) in enumerate(c['faces']): label(d, M + 30 + i * faces.width // 5, y, t)
    y += 50
    d.text((M, y), 'Poses', font=F('Bold', 40), fill=INK); y += 60
    sheet.paste(poses, (M, y)); y += poses.height + 10
    for i, (t, _) in enumerate(c['poses']): label(d, M + 60 + i * poses.width // 3, y, t)
    sheet.save(out); print(out, sheet.size)

def lineup(out):
    im = cast('lineup', dict(w=480, h=320, set='studio', camPos=[2.0, 0.95, -1.6], camAt=[2.0, 0.85, 2.5], fov=30,
              actors=[dict(who='imane', at=[0.95, 2.5], yaw=180), dict(who='maya', at=[1.47, 2.5], yaw=180), dict(who='nio', at=[2.0, 2.5], yaw=180, face='deadpan'),
                      dict(who='sami', at=[2.53, 2.5], yaw=180), dict(who='theo', at=[3.06, 2.5], yaw=165, pose='cup-point', clip='Idle_Talking_Loop', arms=0.8, upright=0.7)]))
    M = 70; sheet = Image.new('RGB', (im.width + 2 * M, im.height + 2 * M + 200), BG); d = ImageDraw.Draw(sheet)
    d.text((M, M - 10), "Nio's friends", font=F('Black', 72), fill=INK)
    d.text((M, M + 80), 'Imane, Maya, Nio, Sami and Theo, side by side, as the engine draws them.', font=F('Regular', 28), fill=DIM)
    sheet.paste(im, (M, M + 160))
    for i, t in enumerate(['Imane', 'Maya', 'Nio', 'Sami', 'Theo']): label(d, M + 140 + i * 287, M + 170 + im.height, t, fill=INK, font=F('Bold', 30))
    sheet.save(out); print(out, sheet.size)

def shots(specs, out, title, note, caps):
    sp = json.load(open(specs)); ims = [shot(s, i) for i, s in enumerate(sp)]
    subprocess.run([os.path.join(HERE, 'n3_check.sh'), specs], check=True, stdout=subprocess.DEVNULL)
    cols = 3; w, h = ims[0].size; M, G = 70, 36; rows = (len(ims) + cols - 1) // cols
    W = 2 * M + cols * w + (cols - 1) * G; H = M + 170 + rows * (h + 70) + M
    sheet = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(sheet)
    d.text((M, M - 10), title, font=F('Black', 72), fill=INK); d.text((M, M + 80), note, font=F('Regular', 28), fill=DIM)
    for i, im in enumerate(ims):
        x = M + (i % cols) * (w + G); y = M + 170 + (i // cols) * (h + 70)
        sheet.paste(im, (x, y)); label(d, x, y + h + 12, caps[i] if i < len(caps) else '', font=F('Medium', 28))
    sheet.save(out); print(out, sheet.size)

if __name__ == '__main__':
    if sys.argv[1] == 'lineup': lineup(sys.argv[2])
    elif sys.argv[1] == 'shots': shots(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6:])
    else: model_sheet(sys.argv[1], sys.argv[2])
