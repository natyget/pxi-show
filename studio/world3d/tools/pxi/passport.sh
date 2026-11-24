#!/usr/bin/env bash
# passport.sh : the Passport's stamps, member stamp, level and marks, from the app's own code and tools/pxi/passport.json.
# Writes out/pxi/passport/ (SVG and passport.json) and draws them large into out/pxi/svg_big for screens.py.
# Needs pxi-mobile-app checked out beside this repo.
set -euo pipefail
cd "$(dirname "$0")/../.."
K=0.916030534
npx esbuild tools/pxi/passport.ts --bundle --platform=node --log-level=error --alias:@="$(cd ../../../pxi-mobile-app/src && pwd)" --outfile=out/pxi/passport.js
node out/pxi/passport.js tools/pxi/passport.json out/pxi/passport
jobs=$(node -e 'const d=require("./out/pxi/passport/passport.json");console.log(d.stamps.map(s=>"out/pxi/passport/stamp-"+s.id+".svg:"+Math.round(s.width*'$K')+":keep").join(" "))')
node tools/pxi/svg.cjs out/pxi/svg_big $jobs out/pxi/passport/member.svg:66:keep out/pxi/passport/level.svg:59:keep out/pxi/passport/citizen.svg:70:keep out/pxi/passport/mark.svg:18:keep
