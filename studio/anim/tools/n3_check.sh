#!/usr/bin/env bash
# n3_check.sh <spec.json> ... : check shot specs against the world rules before any render. Exit 1 if one is refused.
set -euo pipefail
cd "$(dirname "$0")/.."
npx esbuild tools/n3_check.ts --bundle --platform=node --log-level=error --outfile=out/n3_check.js
node out/n3_check.js "$@"
