#!/usr/bin/env bash
# stamps.sh <jobs.json> <width-px> : the app's own stamps for the events in jobs.json, drawn large into out/pxi/svg_big.
# Needs pxi-mobile-app checked out beside this repo.
set -euo pipefail
cd "$(dirname "$0")/../.."
npx esbuild tools/pxi/stamps.ts --bundle --platform=node --log-level=error --alias:@="$(cd ../../../pxi-mobile-app/src && pwd)" --outfile=out/pxi/stamps.js
node out/pxi/stamps.js "$1" out/pxi/stamps_svg
node tools/pxi/svg.cjs out/pxi/svg_big $(for f in out/pxi/stamps_svg/*.svg; do echo "$f:$2"; done)
