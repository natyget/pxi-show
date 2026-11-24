#!/usr/bin/env bash
# Picture and sound check in one ffmpeg pass (blackdetect, freezedetect, silencedetect, ebur128).
#   engine/tools/av_check.sh <video.mp4>
# FAIL: black >= 0.25 s (WARN if only in the last 0.5 s), freeze >= 1.0 s, silent first 0.5 s or no audio,
#       true peak > -1.0 dBTP, integrated loudness outside -18..-12 LUFS (target -14..-16; WARN between).
# Freeze noise 0.003 (default 0.001 is so tight that pixel-art grain hides real freezes); tolerance of the
# grain is a mean frame difference of about 0.3 percent, a slow talking face still moves more than that.
set -euo pipefail
v="${1:?usage: av_check.sh <video>}"; fail=0
dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$v")"
has_a="$(ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 "$v")"
af=(); [ -n "$has_a" ] && af=(-af "silencedetect=n=-50dB:d=0.5,ebur128=peak=true:framelog=quiet")
log="$(ffmpeg -hide_banner -nostats -i "$v" -vf "blackdetect=d=0.25:pix_th=0.05,freezedetect=n=0.003:d=1.0" \
      "${af[@]}" -f null - 2>&1)"
say() { echo "$1 $2"; [ "$1" = FAIL ] && fail=1 || true; }

# black: pairs of start/end; a stretch still open at EOF ends at the duration
b="$(echo "$log" | sed -n 's/.*black_start:\([0-9.]*\) black_end:\([0-9.]*\).*/\1 \2/p')"
if [ -z "$b" ]; then say PASS "no black frames"; else
  while read -r s e; do
    if [ "$(echo "$s >= $dur - 0.5" | bc)" = 1 ]; then say WARN "black ${s}-${e}s (last 0.5 s only)"
    else say FAIL "black ${s}-${e}s ($(echo "$e - $s" | bc) s)"; fi
  done <<< "$b"; fi

# freeze: freeze_start / freeze_end pairs (end missing = frozen to the end)
fs=($(echo "$log" | sed -n 's/.*freeze_start: \([0-9.]*\).*/\1/p')); fe=($(echo "$log" | sed -n 's/.*freeze_end: \([0-9.]*\).*/\1/p'))
if [ ${#fs[@]} = 0 ]; then say PASS "no frozen frames"; else
  for i in "${!fs[@]}"; do say FAIL "frozen ${fs[$i]}-${fe[$i]:-$dur}s"; done; fi

if [ -z "$has_a" ]; then say FAIL "no audio track"; else
  s0="$(echo "$log" | sed -n 's/.*silence_start: \(-\{0,1\}[0-9.e-]*\).*/\1/p' | head -1)"
  e0="$(echo "$log" | sed -n 's/.*silence_end: \([0-9.]*\).*/\1/p' | head -1)"
  if [ -n "$s0" ] && [ "$(echo "$s0 < 0.1" | bc)" = 1 ] && { [ -z "$e0" ] || [ "$(echo "$e0 > 0.5" | bc)" = 1 ]; }; then
    say FAIL "silent start (silence 0-${e0:-$dur}s)"; else say PASS "sound within the first 0.5 s"; fi
  sm="$(echo "$log" | sed -n '/Summary:/,$p')"
  lufs="$(echo "$sm" | sed -n 's/^ *I: *\(-\{0,1\}[0-9.]*\) LUFS/\1/p')"
  tp="$(echo "$sm" | sed -n 's/^ *Peak: *\(-\{0,1\}[0-9.]*\) dBFS/\1/p')"
  if [ -n "$tp" ] && [ "$(echo "$tp > -1.0" | bc)" = 1 ]; then say FAIL "clipping: true peak $tp dBTP (limit -1.0)"
  else say PASS "true peak ${tp:-?} dBTP"; fi
  if [ -z "$lufs" ] || [ "$lufs" = "-70.0" ]; then say FAIL "loudness unreadable (${lufs:-none})"
  elif [ "$(echo "$lufs < -18 || $lufs > -12" | bc)" = 1 ]; then say FAIL "loudness $lufs LUFS (allowed -18..-12, target -14..-16)"
  elif [ "$(echo "$lufs < -16 || $lufs > -14" | bc)" = 1 ]; then say WARN "loudness $lufs LUFS (target -14..-16)"
  else say PASS "loudness $lufs LUFS"; fi
fi
[ "$fail" = 0 ] && echo "RESULT PASS" || echo "RESULT FAIL"; exit "$fail"
