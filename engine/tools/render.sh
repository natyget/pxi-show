#!/usr/bin/env bash
# One entry point for every render, so a run never has to work out Remotion flags.
#   engine/tools/render.sh still <Comp> <frame> <out.png>      one frame, full size
#   engine/tools/render.sh draft <Comp> [from-to]              half-size mp4 to studio/anim/out/<Comp>_draft.mp4
#   engine/tools/render.sh final <Comp> <out.mp4>              full 1080x1920 render
#   engine/tools/render.sh sheet <video.mp4> <outdir> "<shot start frames>" [fps]   QA contact sheets
#   engine/tools/render.sh check <video.mp4>                    has an audio track, is not silent or too quiet, does not open on black
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ANIM="$ROOT/studio/anim"
BROWSER="${PXI_BROWSER:-/opt/pw-browsers/chromium}"
FLAGS=(--gl=swangle --log=error)
[ -x "$BROWSER" ] && FLAGS+=(--browser-executable="$BROWSER")
abs() { case "$1" in /*) echo "$1" ;; *) echo "$PWD/$1" ;; esac; }
mode="${1:?mode: still|draft|final|sheet|check}"; shift
if [ "$mode" = check ]; then
  v="$(abs "$1")"; fail=0
  if ! ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 "$v" | grep -q .; then
    echo "FAIL no audio track"; fail=1
  else
    mean="$(ffmpeg -hide_banner -nostats -i "$v" -vn -af volumedetect -f null - 2>&1 | sed -n 's/.*mean_volume: \(-\{0,1\}[0-9.]*\) dB.*/\1/p')"
    if [ -z "$mean" ] || [ "$(echo "$mean < -50" | bc)" = 1 ]; then echo "FAIL audio is silent (mean ${mean:-none} dB)"; fail=1
    elif [ "$(echo "$mean < -27" | bc)" = 1 ]; then echo "WARN audio is quiet (mean $mean dB; aim for about -20)"
    else echo "audio ok (mean $mean dB)"; fi
  fi
  blacks="$(ffmpeg -hide_banner -nostats -i "$v" -an -vf blackdetect=d=0.5:pix_th=0.05 -f null - 2>&1 | sed -n 's/.*black_start:\([0-9.]*\).*/\1/p')"
  for b in $blacks; do
    if [ "$(echo "$b < 1" | bc)" = 1 ]; then echo "FAIL opens on black"; fail=1
    else echo "WARN black from ${b}s (fine if it is the end or on purpose)"; fi
  done
  [ "$fail" = 0 ] && echo "RESULT PASS" || echo "RESULT FAIL"; exit "$fail"
fi
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
