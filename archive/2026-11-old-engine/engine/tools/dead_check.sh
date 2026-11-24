#!/usr/bin/env bash
# Dead-shot check: nothing moving for too long, or air between spoken lines.
#   engine/tools/dead_check.sh <video.mp4> [--holds t1,t2,...] [--lines lines.json]
# (a) Still picture over 1.2 s. Each frame is differenced with the one before, shrunk to a 24x42 grid by area
#     averaging (grain averages out, real movement does not) and the largest cell is read (signalstats YMAX).
#     Grain alone gives YMAX 4-5; a 30x8 px mouth moving slowly gives 17+; a head bob 40+. Still = YMAX < 8.
#     (freezedetect cannot split these: grain needs n=0.02, and then a talking face is flagged as frozen.)
# (b) Gap between lines over 1.0 s. --lines is a JSON list of {"start":s,"end":s}; without it lines are
#     ESTIMATED from the audio: 250-3500 Hz band, silence = 15 dB under that band's mean level, min 0.3 s.
#     A gap holding a --holds timestamp prints "hold ok". Before the first and after the last line is ignored.
set -euo pipefail
v="${1:?usage: dead_check.sh <video> [--holds t1,t2] [--lines lines.json]}"; shift
holds=""; lines=""
while [ $# -gt 0 ]; do case "$1" in --holds) holds="$2"; shift 2 ;; --lines) lines="$2"; shift 2 ;; *) echo "unknown arg $1" >&2; exit 2 ;; esac; done
fail=0; flag() { echo "FLAG $1"; fail=1; }

# (a) still stretches
ffmpeg -hide_banner -nostats -i "$v" -an -vf "tblend=all_mode=difference,scale=24:42:flags=area,signalstats,metadata=print:key=lavfi.signalstats.YMAX:file=-" -f null - 2>/dev/null |
  grep -o 'pts_time:[0-9.]*\|YMAX=[0-9]*' | paste - - | sed 's/pts_time://; s/YMAX=//' |
  awk -v fps=24 'function out(){ if (run && last+1/fps-st > 1.2) printf "static %.2f-%.2fs (%.1f s)\n", st, last+1/fps, last+1/fps-st; run=0 }
    NR>1 && $2<8 { if(!run){st=prev; run=1} last=$1 } NR>1 && $2>=8 { out() } { prev=$1 } END{ out() }' > /tmp/dead_a.$$ || true
if [ -s /tmp/dead_a.$$ ]; then while read -r l; do flag "$l"; done < /tmp/dead_a.$$; else echo "PASS no static stretch over 1.2 s"; fi
rm -f /tmp/dead_a.$$

# (b) gaps between lines, as "start end" pairs
if [ -n "$lines" ]; then
  gaps="$(python3 -I -c 'import json,sys
L=sorted(json.load(open(sys.argv[1])),key=lambda x:x["start"])
for a,b in zip(L,L[1:]): print(a["end"],b["start"])' "$lines")"; src="given"
else
  band="highpass=f=250,lowpass=f=3500"
  mean="$(ffmpeg -hide_banner -nostats -i "$v" -vn -af "$band,volumedetect" -f null - 2>&1 | sed -n 's/.*mean_volume: \(-\{0,1\}[0-9.]*\) dB.*/\1/p')"
  if [ -z "$mean" ]; then flag "no audio track, cannot find lines"; gaps=""; else
  gaps="$(ffmpeg -hide_banner -nostats -i "$v" -vn -af "$band,silencedetect=n=$(echo "$mean - 15" | bc)dB:d=0.3" -f null - 2>&1 |
    sed -n 's/.*silence_start: \(-\{0,1\}[0-9.e-]*\)$/S \1/p; s/.*silence_end: \([0-9.]*\).*/E \1/p' |
    awk '/^S/{s=$2} /^E/{ if (s>0.05) print s, $2 }')"   # a silence from 0 is "before the first line"; one open at EOF has no E
  fi; src="estimated from audio (mean band level ${mean:-?} dB)"
fi
echo "lines: $src"
n=0
while read -r s e; do [ -z "${s:-}" ] && continue
  [ "$(echo "$e - $s > 1.0" | bc)" = 1 ] || continue
  ok=0; for t in ${holds//,/ }; do [ "$(echo "$t >= $s && $t <= $e" | bc)" = 1 ] && ok=1; done
  n=$((n+1))
  if [ $ok = 1 ]; then echo "hold ok: gap ${s}-${e}s"; else flag "gap between lines ${s}-${e}s ($(echo "$e - $s" | bc) s, no hold)"; fi
done <<< "$gaps"
[ "$n" = 0 ] && echo "PASS no gap over 1.0 s between lines"
[ "$fail" = 0 ] && echo "RESULT PASS" || echo "RESULT FAIL"; exit "$fail"
