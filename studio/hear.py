#!/usr/bin/env python3
"""What a stranger hears: transcribes a voice file with Whisper (small.en) so misheard words get caught.
  python ../../studio/hear.py vo_raw.wav"""
import subprocess, sys, tempfile
import soundfile as sf
from faster_whisper import WhisperModel
tmp = tempfile.mktemp(suffix=".wav")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", sys.argv[1], "-ac", "1", "-ar", "16000", tmp], check=True)
a, _ = sf.read(tmp, dtype="float32")
for s in WhisperModel("small.en", device="cpu", compute_type="int8").transcribe(a, beam_size=5)[0]:
    print(f"{s.start:5.1f}-{s.end:5.1f} {s.text}")
