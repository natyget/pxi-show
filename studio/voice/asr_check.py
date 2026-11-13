# Speech-recognition check of treated lines against the script. Usage: python asr_check.py jobs.json
import sys, json, re
from faster_whisper import WhisperModel
from clean import norm
import subprocess, numpy as np
def pcm(f): return np.frombuffer(subprocess.run(['ffmpeg','-loglevel','error','-i',f,'-f','f32le','-ac','1','-ar','16000','-'],capture_output=True,check=True).stdout,np.float32)
asr = WhisperModel('small.en', device='cpu', compute_type='int8')
W = {'200': 'two hundred', '212': 'two hundred and twelve', '40': 'forty', '3': 'three'}
for j in json.load(open(sys.argv[1])):
    key = j["out"][4:-4]
    t = " ".join(s.text for s in asr.transcribe(pcm(f"../anim/public/vo/{key}.wav"), beam_size=5)[0])
    for k, v in W.items(): t = re.sub(rf"\b{k}\b", v, t)
    got, want = norm(t.replace('-', ' ')), norm(j["text"])
    print("OK  " if got == want else "DIFF", key, repr(want), "|", repr(got), flush=True)
