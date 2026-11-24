#!/usr/bin/env bash
# nw_still.sh <Comp> <frame> <out.png> [upscale=3]  : render a native 360x640 frame and show it at Nx nearest
set -euo pipefail
cd "$(dirname "$0")/.."
npx remotion still src/index.ts "$1" "out/_native.png" --frame="${2:-0}" --gl=angle --log=error --browser-executable=/opt/pw-browsers/chromium >/dev/null
python3 tools/nw_finish.py still out/_native.png "$3" "${4:-4}"
