#!/usr/bin/env bash
# QA material for a reviewer: one frame every 0.5 s (overview), plus full-size stills of the middle of every shot.
# usage: tools/qa_sheets.sh <video.mp4> <outdir> "<shot start frames, space separated>" <fps>
set -e
V="$1"; O="$2"; STARTS="$3"; FPS="${4:-24}"
mkdir -p "$O"
ffmpeg -y -loglevel error -i "$V" -vf "fps=2,scale=270:-1,tile=8x4" -frames:v 1 "$O/overview_1.jpg"
ffmpeg -y -loglevel error -ss 16 -i "$V" -vf "fps=2,scale=270:-1,tile=8x4" -frames:v 1 "$O/overview_2.jpg"
ffmpeg -y -loglevel error -ss 32 -i "$V" -vf "fps=2,scale=270:-1,tile=8x4" -frames:v 1 "$O/overview_3.jpg"
prev=""
i=1
for s in $STARTS; do
  if [ -n "$prev" ]; then
    mid=$(( (prev + s) / 2 ))
    ffmpeg -y -loglevel error -ss "$(echo "scale=3; $mid / $FPS" | bc)" -i "$V" -frames:v 1 -vf "scale=540:-1" "$O/shot_$(printf %02d $i).jpg"
    i=$((i + 1))
  fi
  prev=$s
done
echo done
