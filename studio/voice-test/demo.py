import soundfile as sf, numpy as np, sys
from kokoro_onnx import Kokoro
k = Kokoro("/home/user/kokoro/kokoro-v1.0.onnx", "/home/user/kokoro/voices-v1.0.bin")
print(sorted(k.get_voices()))
lines = [
 ("nio", "am_puck",    "Okay. So the fridge has one lemon in it. That's my roommate now."),
 ("nio", "am_michael", "Okay. So the fridge has one lemon in it. That's my roommate now."),
 ("nio", "am_echo",    "Okay. So the fridge has one lemon in it. That's my roommate now."),
 ("maya","af_heart",   "I signed us up for something. I didn't read what it was. Get your shoes."),
 ("maya","af_nicole",  "I signed us up for something. I didn't read what it was. Get your shoes."),
 ("maya","af_sky",     "I signed us up for something. I didn't read what it was. Get your shoes."),
 ("friend","am_fenrir","Dude. Why are you whispering. It's your apartment."),
 ("friend","am_liam",  "Dude. Why are you whispering. It's your apartment."),
]
for i,(who,v,t) in enumerate(lines):
    a, sr = k.create(t, voice=v, speed=1.0, lang="en-us")
    sf.write(f"{i}_{who}_{v}.wav", a, sr)
    print(i, who, v, round(len(a)/sr,2))
