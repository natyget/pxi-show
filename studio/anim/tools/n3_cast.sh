#!/usr/bin/env bash
# n3_cast.sh <out.png> '<json props>' [scale=3] : one frame with any of the cast (see CastProps in src/nw3d/Scenes.tsx)
set -euo pipefail
cd "$(dirname "$0")/.."
tmp="out/_cast_$$.png"
npx remotion still src/index.ts N3Cast "$tmp" --props="${2:-{\}}" --gl=swangle --log=error --browser-executable=/opt/pw-browsers/chromium >/dev/null
python3 tools/nw_finish.py still "$tmp" "$1" "${3:-3}"; rm -f "$tmp"
