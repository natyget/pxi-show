#!/usr/bin/env bash
# One entry point for every render, so a run never has to work out Remotion flags.
#   engine/tools/render.sh still <Comp> <frame> <out.png>      one frame, full size
#   engine/tools/render.sh draft <Comp> [from-to]              half-size mp4 to studio/anim/out/<Comp>_draft.mp4
#   engine/tools/render.sh final <Comp> <out.mp4> [--cut short|long]   full 1080x1920 render (draft takes --cut too)
#   engine/tools/render.sh sheet <video.mp4> <outdir> "<shot start frames>" [fps]   QA contact sheets
#   engine/tools/render.sh loop <Comp> <from-to> [outbase]      seamless loop of that frame range: <outbase>.mp4 (silent h264) + .gif (540 px, 12 fps)
#                                                                 default outbase studio/anim/out/<Comp>_loop; PXI_LOOP_FADE=0.33 (seconds of crossfade), PXI_LOOP_GIF_FPS=12
#                                                                 prints SSIM/PSNR of last->first frame, loop vs naive cut
#   engine/tools/render.sh cover <Comp> <frame> [outbase]       <outbase>.png 1080x1920, <outbase>_wide.png 1920x1080 (blurred fill), <outbase>_grid.png 1080x1440 centre crop (IG grid check)
#                                                                 default outbase studio/anim/out/<Comp>_cover; PXI_SCALE=0.5 renders loop/cover at half size (tests only)
#   engine/tools/render.sh check <video.mp4>                  has an audio track, is not silent or too quiet, does not open on black
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ANIM="$ROOT/studio/anim"
BROWSER="${PXI_BROWSER:-/opt/pw-browsers/chromium}"
FLAGS=(--gl=swangle --log=error)
[ -x "$BROWSER" ] && FLAGS+=(--browser-executable="$BROWSER")
abs() { case "$1" in /*) echo "$1" ;; *) echo "$PWD/$1" ;; esac; }
mode="${1:?mode: still|draft|final|sheet|loop|cover|check}"; shift
# --cut short|long anywhere in the arguments picks the episode's cut (the composition's `cut` prop).
CUT=(); ARGS=()
while [ $# -gt 0 ]; do
  if [ "$1" = --cut ]; then case "${2:-}" in short|long) CUT=(--props="{\"cut\":\"$2\"}"); shift 2 ;; *) echo "--cut takes short or long" >&2; exit 2 ;; esac
  else ARGS+=("$1"); shift; fi
done
set -- "${ARGS[@]}"
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
         npx remotion render src/index.ts "$1" "out/$1_draft.mp4" --scale=0.5 ${2:+--frames="$2"} "${CUT[@]}" "${FLAGS[@]}"
         echo "out: studio/anim/out/$1_draft.mp4" ;;
  final) out="$(abs "$2")"; mkdir -p "$(dirname "$out")"; cd "$ANIM"
         npx remotion render src/index.ts "$1" "$out" --crf=18 "${CUT[@]}" "${FLAGS[@]}"; echo "out: $out" ;;
  sheet) v="$(abs "$1")"; o="$(abs "$2")"; bash "$ANIM/tools/qa_sheets.sh" "$v" "$o" "$3" "${4:-24}" ;;
  loop)  comp="$1"; rng="${2:?from-to}"; base="$(abs "${3:-$ANIM/out/${comp}_loop}")"; mkdir -p "$(dirname "$base")"
         from="${rng%-*}"; to="${rng#*-}"; n=$((to - from + 1)); fps=24
         F="$(awk -v s="${PXI_LOOP_FADE:-0.33}" -v f=$fps 'BEGIN{printf "%d", s*f+0.5}')"
         [ "$F" -ge 1 ] && [ $((n - 2 * F)) -ge 1 ] || { echo "range too short for the fade" >&2; exit 2; }
         tmp="$(mktemp -d)"; cd "$ANIM"
         npx remotion render src/index.ts "$comp" "$tmp/raw.mp4" --frames="$rng" --scale="${PXI_SCALE:-1}" --muted --crf=16 "${FLAGS[@]}"
         # out = [tail F frames crossfaded into head F frames] + body; last frame flows into the first
         ffmpeg -v error -y -i "$tmp/raw.mp4" -filter_complex "[0:v]split=3[a][b][c];\
[a]trim=start_frame=0:end_frame=$F,setpts=PTS-STARTPTS[h];\
[b]trim=start_frame=$((n - F)):end_frame=$n,setpts=PTS-STARTPTS[t];\
[c]trim=start_frame=$F:end_frame=$((n - F)),setpts=PTS-STARTPTS[m];\
[t][h]blend=all_expr='A*(1-(N+1)/($F+1))+B*((N+1)/($F+1))'[x];[x][m]concat=n=2:v=1[o]" \
           -map '[o]' -an -r $fps -c:v libx264 -pix_fmt yuv420p -crf 16 -movflags +faststart "$base.mp4"
         gf="${PXI_LOOP_GIF_FPS:-12}"
         ffmpeg -v error -y -i "$base.mp4" -vf "fps=$gf,scale=540:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" -loop 0 "$base.gif"
         lastf() { ffmpeg -v error -y -i "$1" -vf "select='eq(n,$(( $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 "$1" | tr -d ,) - 1 )))'" -vsync 0 -frames:v 1 "$2"; }
         firstf() { ffmpeg -v error -y -i "$1" -frames:v 1 "$2"; }
         cmp() { ffmpeg -hide_banner -nostats -i "$1" -i "$2" -lavfi "[0:v][1:v]ssim;[0:v][1:v]psnr" -f null - 2>&1 | sed -n 's/.* All:\([0-9.]*\) .*/ssim \1/p;s/.*PSNR.*average:\([0-9.inf]*\).*/psnr \1/p' | tr '\n' ' '; }
         lastf "$base.mp4" "$tmp/l.png"; firstf "$base.mp4" "$tmp/f.png"; lastf "$tmp/raw.mp4" "$tmp/nl.png"; firstf "$tmp/raw.mp4" "$tmp/nf.png"
         echo "loop   last->first: $(cmp "$tmp/l.png" "$tmp/f.png")"
         echo "naive  last->first: $(cmp "$tmp/nl.png" "$tmp/nf.png")"
         # reference: the same step taken inside the untouched clip (frame n-F-1 -> n-F) shows what "no jump" looks like here
         for k in $((n - F - 1)) $((n - F)); do ffmpeg -v error -y -i "$tmp/raw.mp4" -vf "select='eq(n,$k)'" -vsync 0 -frames:v 1 "$tmp/s$k.png"; done
         echo "ordinary step      : $(cmp "$tmp/s$((n - F - 1)).png" "$tmp/s$((n - F)).png")"
         rm -rf "$tmp"; echo "out: $base.mp4 $base.gif" ;;
  cover) comp="$1"; fr="${2:?frame}"; base="$(abs "${3:-$ANIM/out/${comp}_cover}")"; mkdir -p "$(dirname "$base")"; cd "$ANIM"
         npx remotion still src/index.ts "$comp" "$base.png" --frame="$fr" --scale="${PXI_SCALE:-1}" "${FLAGS[@]}"
         # horizontal: the vertical frame centred over a blurred, darkened, scaled-to-fill copy of itself
         ffmpeg -v error -y -i "$base.png" -filter_complex "[0:v]split[a][b];[a]scale=1920:1920:force_original_aspect_ratio=increase,crop=1920:1080,gblur=sigma=40,eq=brightness=-0.25[bg];[b]scale=-2:1080[fg];[bg][fg]overlay=(W-w)/2:0" "$base""_wide.png"
         # Instagram grid crop (3:4): 1080x1440 centre crop of the vertical cover
         ffmpeg -v error -y -i "$base.png" -vf "scale=1080:1920,crop=1080:1440" "$base""_grid.png"
         echo "out: $base.png $base""_wide.png $base""_grid.png" ;;
  *) echo "unknown mode $mode (still|draft|final|sheet|loop|cover|check)" >&2; exit 2 ;;
esac
