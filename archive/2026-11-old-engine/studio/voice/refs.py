# Timbre references for each character, made with Kokoro (Apache-2.0). Chatterbox then performs the lines in that timbre.
import soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("/home/user/kokoro/kokoro-v1.0.onnx", "/home/user/kokoro/voices-v1.0.bin")
refs = {
 "nio": ("am_puck", "Bro, I'm being so serious right now. I walked in, I looked at it, and I was like, nah. Not today. I'm good, honestly."),
 "maya": ("af_nicole", "Okay, listen. I already said yes for both of us, so you can complain in the car. It's gonna be fun. Probably."),
 "friend": ("am_fenrir", "Dude. Why are you whispering? It's your apartment. Nobody's in there but you and that weird plant."),
}
for n, (v, t) in refs.items():
    a, sr = k.create(t, voice=v, speed=1.0, lang="en-us"); sf.write(f"ref_{n}.wav", a, sr); print(n, len(a) / sr)
