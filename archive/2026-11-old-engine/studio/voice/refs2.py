import soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("/home/user/kokoro/kokoro-v1.0.onnx", "/home/user/kokoro/voices-v1.0.bin")
T_M = "Yo, okay, so boom. I'm at the store, right? And this dude just looks at me. Like, bro, why you looking at me? I'm just tryna get some chips."
T_F = "Oh my gosh, hi! Okay, I have the best news ever. We're going to a party! I already said yes. You're gonna love it, I promise!"
T_D = "The sock. Is clean. It has been clean. For many years now."
for n, v, t in [("n_puck","am_puck",T_M),("n_echo","am_echo",T_M),("n_eric","am_eric",T_M),("n_liam","am_liam",T_M),
                ("m_sky","af_sky",T_F),("m_bella","af_bella",T_F),("m_jessica","af_jessica",T_F),
                ("w_onyx","am_onyx",T_D)]:
    a, sr = k.create(t, voice=v, speed=1.0, lang="en-us"); sf.write(f"ref_{n}.wav", a, sr)
print("ok")
