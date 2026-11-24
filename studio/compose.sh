#!/usr/bin/env bash
# Builds the video from rendered frames: fr/art (the world and the phone), fr/ui (captions) and mix.wav.
# The art is drawn on a hard pixel grid (1/3 size, scaled back up); the 3D plates sit on a grid twice as coarse,
# so the two line up. Captions stay sharp.   bash ../../studio/compose.sh <slug>   (run in the video's folder)
set -euo pipefail
slug=$1
ffmpeg -y -loglevel error -framerate 30 -i fr/art/f%05d.jpg -framerate 30 -i fr/ui/f%05d.png -i mix.wav \
  -filter_complex "[0:v]scale=360:640:flags=area,scale=1080:1920:flags=neighbor[a];[a][1:v]overlay=0:0,format=yuv420p[v]" \
  -map "[v]" -map 2:a -c:v libx264 -preset slow -crf 20 -c:a aac -b:a 192k -shortest -movflags +faststart "$slug.mp4"
ls -la "$slug.mp4"
