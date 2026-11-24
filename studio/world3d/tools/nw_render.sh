#!/usr/bin/env bash
# nw_render.sh <Comp> <out.mp4> [audio.wav] [glitchStart:glitchEnd]
# Renders a Nio World composition at native 270x480, runs the finisher, and encodes 1080x1920 with hard pixels.
set -euo pipefail
cd "$(dirname "$0")/.."
comp="$1"; out="$2"; wav="${3:-}"; gl="${4:-}"
rm -rf "out/${comp}_raw" "out/${comp}_fin"
npx remotion render src/index.ts "$comp" "out/${comp}_raw" --sequence --image-format=png --gl="${NW_GL:-angle}" --log=error --browser-executable=/opt/pw-browsers/chromium >/dev/null
python3 tools/nw_finish.py seq "out/${comp}_raw" "out/${comp}_fin" ${gl:+--glitch "$gl"}
mkdir -p "$(dirname "$out")"
if [ -n "$wav" ]; then
  ffmpeg -y -loglevel error -framerate 24 -i "out/${comp}_fin/%05d.png" -i "$wav" -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "$out"
else
  ffmpeg -y -loglevel error -framerate 24 -i "out/${comp}_fin/%05d.png" -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p "$out"
fi
echo "out: $out"
