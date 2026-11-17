"""Voice mediums. The founder has no favourite (Nov 17): each skit uses a different one so results can be compared.
Letters match the samples sent on Nov 17 (project files office-hours/voices/medium-options/)."""
import clean
OPT = {
 'A': clean.WALKIE,  # walkie talkie
 'B': "highpass=f=380,lowpass=f=3200,acompressor=threshold=-22dB:ratio=6:attack=5:release=60,asoftclip=type=atan:threshold=0.7,aecho=0.6:0.3:16:0.18",  # 1930s radio
 'C': "highpass=f=420,lowpass=f=3000,aresample=8000,acrusher=bits=8:mode=lin:mix=0.35,aresample=48000",  # phone line
 'D': "afftfilt=real='hypot(re,im)':imag='0':win_size=512:overlap=0.75,highpass=f=150,lowpass=f=6000,flanger=delay=2:depth=1:speed=0.3",  # robot
 'E': "vibrato=f=0.7:d=0.18,vibrato=f=5.5:d=0.03,lowpass=f=5200,highpass=f=110",  # warbly tape
 'F': "anull",  # clean
}
NOISE = {'B': 'crackle', 'E': 'hiss'}
# Which skit uses which medium. Record the result in engine/learning.md once posted.
SKIT = {'one-sip': 'B', 'group-photo': 'F', 'aux': 'E', 'wave-back': 'A'}
