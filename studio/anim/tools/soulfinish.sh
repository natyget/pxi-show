#!/usr/bin/env bash
# The round-2 finish: soft pixels (area-reduce to 1/3, nearest back up) plus moving grain. Works on a png or an mp4.
# usage: soulfinish.sh in out
set -euo pipefail
VF="scale=270:480:flags=area,scale=1080:1920:flags=neighbor,noise=alls=7:allf=t"
case "$1" in
  *.png) ffmpeg -y -loglevel error -i "$1" -vf "$VF" "$2" ;;
  *) ffmpeg -y -loglevel error -i "$1" -vf "$VF" -af loudnorm=I=-20:TP=-2 -c:v libx264 -crf 16 -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 "$2" ;;
esac
