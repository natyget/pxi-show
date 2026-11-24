#!/usr/bin/env bash
# One-time setup for voice (Kokoro) and hearing (Whisper). Kokoro needs Python 3.12 or older.
set -euo pipefail
command -v uv >/dev/null || pip install -q uv
uv venv -q -p 3.12 "${VENV:-$HOME/.pxi-tts}" && . "${VENV:-$HOME/.pxi-tts}/bin/activate"
uv pip install -q torch --index-url https://download.pytorch.org/whl/cpu
uv pip install -q "kokoro>=0.9.4" soundfile numpy faster-whisper pip
python -c "from faster_whisper import WhisperModel; WhisperModel('small.en', device='cpu', compute_type='int8')" || echo "the hearing model did not download (a busy server): run this script again before hear.py"
echo "activate with: . ${VENV:-$HOME/.pxi-tts}/bin/activate   (Chromium and Playwright are preinstalled; ffmpeg must be on PATH)"
