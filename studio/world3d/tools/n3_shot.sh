#!/usr/bin/env bash
# n3_shot.sh <spec.json> <out.png> [frame=0] [scale=3] : check one shot spec against the world rules, then draw one frame of it.
set -euo pipefail
cd "$(dirname "$0")/.."
tools/n3_check.sh "$1"
npx remotion still src/index.ts N3Shot "out/_n3s.png" --props="{\"spec\":$(cat "$1")}" --frame="${3:-0}" --gl=swangle --log=error --browser-executable=/opt/pw-browsers/chromium >/dev/null
python3 tools/nw_finish.py still out/_n3s.png "$2" "${4:-3}"
