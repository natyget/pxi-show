#!/usr/bin/env bash
# One-time setup for the cast's voices (studio/cast_voice.py): a venv with the pinned parts and the model.
# The versions are part of the approved voice (studio/cast_voice.json). Never upgrade them.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
VENV="${PXI_VOICE_VENV:-$HOME/.pxi-voice}"
export HF_HOME="${HF_HOME:-$HOME/.cache/pxi-hf}"
MODEL="Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign"
log() { echo "[setup] $*"; }
command -v ffmpeg >/dev/null || { echo "ffmpeg is needed on PATH" >&2; exit 2; }
[ -x "$VENV/bin/python" ] || { log "creating venv $VENV"; python3 -m venv "$VENV"; }
PY="$VENV/bin/python"
have() { "$PY" -c "import sys, importlib.metadata as m; sys.exit(0 if m.version('$1').split('+')[0] == '$2' else 1)" 2>/dev/null; }
if ! have torch 2.8.0 || ! have torchaudio 2.8.0; then
  log "installing CPU torch 2.8.0"; "$PY" -m pip install -q "torch==2.8.0" "torchaudio==2.8.0" --index-url https://download.pytorch.org/whl/cpu
fi
if ! have transformers 4.57.3; then log "installing the pinned parts"; "$PY" -m pip install -q -r "$HERE/cast_voice_requirements.txt"; fi
if ! have qwen-tts 0.1.1; then log "installing qwen-tts 0.1.1"; "$PY" -m pip install -q --no-deps "qwen-tts==0.1.1"; fi
MARK="$HF_HOME/.pxi-model-ok-$(echo "$MODEL" | tr / _)"
if [ ! -f "$MARK" ]; then
  log "downloading $MODEL (once)"; "$PY" -c "from huggingface_hub import snapshot_download; print(snapshot_download('$MODEL'))"
  mkdir -p "$HF_HOME" && touch "$MARK"
fi
log "ready: $PY studio/cast_voice.py <jobs.json> --out <dir>"
