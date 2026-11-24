#!/usr/bin/env bash
# n3_still.sh <out.png> '<json props>' [scale=3] : one frame of the 3D figure, any clip, angle, face
set -euo pipefail
cd "$(dirname "$0")/.."
npx remotion still src/index.ts N3Still "out/_n3.png" --props="${2:-{\}}" --gl=swangle --log=error --browser-executable=/opt/pw-browsers/chromium >/dev/null
python3 tools/nw_finish.py still out/_n3.png "$1" "${3:-3}"
