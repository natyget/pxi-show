#!/usr/bin/env bash
# Environment setup for a scheduled run. Idempotent: skips what is present.
#   bash engine/setup.sh all|render|voice
#   render: ffmpeg, python deps the tools use (fontTools), npm ci in studio/anim
#   voice:  the pinned Qwen3-TTS VoiceDesign stack (bible/characters.md "How a voice line is made")
# Never installs or upgrades qwen-tts with -U; it is the pinned wheel with --no-deps.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PXI_VOICE_VENV="${PXI_VOICE_VENV:-$HOME/.pxi-voice}"            # venv (persists with the home dir)
export HF_HOME="${HF_HOME:-$HOME/.cache/pxi-hf}"                # model cache, outside the repo
MODEL="Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign"
TORCH_INDEX="https://download.pytorch.org/whl/cpu"
SUDO=""; [ "$(id -u)" = 0 ] || SUDO="sudo"
log() { echo "[setup] $*"; }

setup_render() {
  if ! command -v ffmpeg >/dev/null; then
    log "installing ffmpeg"; $SUDO apt-get update -qq && $SUDO apt-get install -y -qq ffmpeg bc
  else log "ffmpeg present"; fi
  command -v bc >/dev/null || { log "installing bc"; $SUDO apt-get install -y -qq bc; }
  if ! python3 -c "import fontTools" 2>/dev/null; then
    log "installing fontTools"; python3 -m pip install -q fonttools || python3 -m pip install -q --break-system-packages fonttools
  else log "fontTools present"; fi
  if [ ! -d "$ROOT/studio/anim/node_modules" ]; then
    log "npm ci (studio/anim)"; (cd "$ROOT/studio/anim" && npm ci --no-audit --no-fund >/dev/null)
  else log "node_modules present"; fi
}

setup_voice() {
  command -v ffmpeg >/dev/null || setup_render
  if [ ! -x "$PXI_VOICE_VENV/bin/python" ]; then
    log "creating venv $PXI_VOICE_VENV"; python3 -m venv "$PXI_VOICE_VENV"
  fi
  PY="$PXI_VOICE_VENV/bin/python"
  have() { "$PY" - "$1" "$2" <<'PYEOF' 2>/dev/null
import sys, importlib.metadata as m
try: sys.exit(0 if m.version(sys.argv[1]).split("+")[0] == sys.argv[2] else 1)
except Exception: sys.exit(1)
PYEOF
  }
  if ! have torch 2.8.0 || ! have torchaudio 2.8.0; then
    log "installing CPU torch 2.8.0 from the PyTorch CPU index"
    "$PY" -m pip install -q "torch==2.8.0" "torchaudio==2.8.0" --index-url "$TORCH_INDEX"
  else log "torch present"; fi
  if ! have transformers 4.57.3 || ! have accelerate 1.12.0; then
    log "installing pinned deps"
    "$PY" -m pip install -q -r "$ROOT/engine/voice-requirements.txt"
  else log "pinned deps present"; fi
  if ! have qwen-tts 0.1.1; then
    log "installing qwen-tts 0.1.1 (pinned wheel, --no-deps)"
    "$PY" -m pip install -q --no-deps "qwen-tts==0.1.1"
  else log "qwen-tts 0.1.1 present"; fi
  if [ ! -f "$HF_HOME/.pxi-model-ok-$(echo "$MODEL" | tr / _)" ]; then
    log "downloading $MODEL to $HF_HOME (once)"
    "$PY" - "$MODEL" <<'PYEOF'
import sys; from huggingface_hub import snapshot_download
print(snapshot_download(sys.argv[1]))
PYEOF
    mkdir -p "$HF_HOME" && touch "$HF_HOME/.pxi-model-ok-$(echo "$MODEL" | tr / _)"
  else log "model cached"; fi
  log "voice stack ready: $PY"
}

case "${1:-all}" in
  render) setup_render ;;
  voice)  setup_voice ;;
  all)    setup_render; setup_voice ;;
  *) echo "usage: bash engine/setup.sh all|render|voice" >&2; exit 2 ;;
esac
