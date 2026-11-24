#!/usr/bin/env bash
# engine/tools/voice.sh <jobs.json> [--out DIR] [--audio-json FILE]
# The only way to make a voice line. See engine/tools/voice.py. Needs: bash engine/setup.sh voice
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PY="${PXI_VOICE_VENV:-$HOME/.pxi-voice}/bin/python"
export HF_HOME="${HF_HOME:-$HOME/.cache/pxi-hf}"
[ -x "$PY" ] || { echo "REFUSED: voice stack missing. Run: bash engine/setup.sh voice" >&2; exit 2; }
[ -n "${1:-}" ] || { echo "usage: voice.sh <jobs.json> [--out DIR] [--audio-json FILE]" >&2; exit 2; }
exec "$PY" "$ROOT/engine/tools/voice.py" "$@"
