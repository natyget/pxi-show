#!/usr/bin/env bash
# One entry point for every render, so a run never has to work out Remotion flags.
#   engine/tools/render.sh still <Comp> <frame> <out.png>      one frame, full size
#   engine/tools/render.sh draft <Comp> [from-to]              half-size mp4 to studio/anim/out/<Comp>_draft.mp4
#   engine/tools/render.sh final <Comp> <out.mp4>              full 1080x1920 render
#   engine/tools/render.sh sheet <video.mp4> <outdir> "<shot start frames>" [fps]   QA contact sheets
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ANIM="$ROOT/studio/anim"
BROWSER="${PXI_BROWSER:-/opt/pw-browsers/chromium}"
FLAGS=(--gl=swangle --log=error)
[ -x "$BROWSER" ] && FLAGS+=(--browser-executable="$BROWSER")
abs() { case "$1" in /*) echo "$1" ;; *) echo "$PWD/$1" ;; esac; }
mode="${1:?mode: still|draft|final|sheet}"; shift
[ -d "$ANIM/node_modules" ] || (cd "$ANIM" && npm ci --no-audit --no-fund >/dev/null)
case "$mode" in
  still) out="$(abs "$3")"; cd "$ANIM"; npx remotion still src/index.ts "$1" "$out" --frame="$2" "${FLAGS[@]}" ;;
  draft) cd "$ANIM"; mkdir -p out
         npx remotion render src/index.ts "$1" "out/$1_draft.mp4" --scale=0.5 ${2:+--frames="$2"} "${FLAGS[@]}"
         echo "out: studio/anim/out/$1_draft.mp4" ;;
  final) out="$(abs "$2")"; mkdir -p "$(dirname "$out")"; cd "$ANIM"
         npx remotion render src/index.ts "$1" "$out" --crf=18 "${FLAGS[@]}"; echo "out: $out" ;;
  sheet) v="$(abs "$1")"; o="$(abs "$2")"; bash "$ANIM/tools/qa_sheets.sh" "$v" "$o" "$3" "${4:-24}" ;;
  *) echo "unknown mode $mode" >&2; exit 2 ;;
esac
