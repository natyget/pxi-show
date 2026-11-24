#!/bin/bash
# shots.sh <slug> <query>   stills of the camera, the event sheet and the gallery for one event, cropped to the phone screen
set -e; S=$(dirname "$0"); O=${OUT:-scr}; mkdir -p $O
NODE_PATH=$(npm root -g) node $S/render.cjs "$S/demo.html?$2" $O/$1 30 9,12.6,13.8,16.5
python3 - "$O" "$1" <<'PY'
import sys; from PIL import Image
o,s=sys.argv[1:]
for t,n in (('9','camera'),('12.6','event'),('13.8','event-open'),('16.5','gallery')):
    Image.open(f'{o}/{s}_{t}.png').convert('RGB').crop((160,262,920,1909)).resize((720,1560),Image.LANCZOS).save(f'{o}/{s}-{n}.png')
PY
