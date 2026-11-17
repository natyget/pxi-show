# Sound for the launch skits: all original, synthesised here (no samples, no models, no music).
# One Sip: the party through the wall (voices and laughs, no music), a sip, a sniff, a costume pop, a cushion flop, a gleam.
import sys
from oh_audio import *
R = np.random.default_rng(23)

def chatter(d=40):  # a room of people talking next door: syllable bursts of band-limited voice, laughs now and then
    n = int(SR * d); x = band(R.normal(0, 1, n), 200, 1200) * 0.08
    for k in range(int(d * 14)):
        at = R.uniform(0, d - 0.4); l = int(SR * R.uniform(0.08, 0.22)); f0 = R.uniform(110, 260); t = np.arange(l) / SR
        v = np.sin(2 * np.pi * f0 * t) + 0.5 * np.sin(4 * np.pi * f0 * t) + 0.3 * np.sin(6 * np.pi * f0 * t)
        place(x, band(v * np.hanning(l), 200, 2500) * R.uniform(0.04, 0.12), at)
    for k in range(int(d / 4)):  # a laugh: a few quick falling bursts
        at = R.uniform(0, d - 1); f0 = R.uniform(180, 320)
        for j in range(R.integers(3, 6)):
            l = int(SR * 0.09); t = np.arange(l) / SR
            place(x, band(np.sin(2 * np.pi * f0 * (1 - 0.03 * j) * t) * np.hanning(l), 200, 3000) * 0.12, at + j * 0.13)
    x = band(x, 150, 1800)  # through a wall
    return fade(x, 0.5, 0.5)
def sip():  # a short polite slurp
    d = 0.35; t = t_(d); f = 900 + 1400 * (t / d)
    return band(R.normal(0, 1, len(t)), 600, 4000) * np.hanning(len(t)) * (0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(f) / SR * 0.05)) * 0.6
def sniff():  # two short sniffs
    x = np.zeros(int(SR * 0.45))
    for at in (0.0, 0.22):
        t = t_(0.14); place(x, band(R.normal(0, 1, len(t)), 1500, 7000) * np.hanning(len(t)) * 0.5, at)
    return x
def pop():  # a costume piece arriving: a cork pop and a little upward chime
    t = t_(0.5); x = band(R.normal(0, 1, len(t)), 400, 3000) * np.exp(-t * 60)
    x += 0.5 * np.sin(2 * np.pi * np.cumsum(1200 + 1600 * np.minimum(1, t * 8)) / SR) * np.exp(-t * 7) * np.minimum(1, t * 200)
    return x
def flop():  # landing on a velvet cushion: a soft low whump and a spring
    t = t_(0.7); x = np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-t * 15)) / SR) * np.exp(-t * 9)
    x += 0.15 * np.sin(2 * np.pi * 320 * t) * np.exp(-t * 6) * (1 + 0.5 * np.sin(2 * np.pi * 9 * t))
    return x + band(R.normal(0, 1, len(t)), 200, 1500) * np.exp(-t * 20) * 0.3
def gleam():  # a little sparkle (the bow tie straightened)
    x = np.zeros(int(SR * 0.6))
    for j, m in enumerate((88, 93, 100)):
        t = t_(0.35); place(x, np.sin(2 * np.pi * mtof(m) * t) * np.exp(-t * 12) * 0.5, j * 0.06)
    return x
def gasp():  # a sharp in-breath (Sami, hearing "apple juice")
    t = t_(0.4); return band(R.normal(0, 1, len(t)), 900, 6000) * np.sin(np.pi * t / 0.4) ** 2 * 0.6

def wind(d=40):  # up on a roof: a soft wind, the city far below (traffic hush, a far horn now and then)
    n = int(SR * d); x = band(R.normal(0, 1, n), 80, 600) * (0.5 + 0.5 * np.abs(band(R.normal(0, 1, n), 0, 0.6)) * 4)
    x = x * 0.3 + band(R.normal(0, 1, n), 200, 2000) * 0.05
    for k in range(int(d / 9)):
        at = R.uniform(0, d - 1); t = t_(0.6); place(x, np.sin(2 * np.pi * 330 * t) * np.sin(np.pi * t / 0.6) * 0.03, at)
    return fade(x, 0.5, 0.5)

# AUX: what plays on the aux. Each is an original few bars written here, heard in the room (it is the story, not a score).
def note(m, d, v=1.0, kind='piano'):
    t = t_(d); f = mtof(m)
    if kind == 'piano': x = (np.sin(2*np.pi*f*t) + 0.4*np.sin(4*np.pi*f*t) + 0.15*np.sin(6*np.pi*f*t)) * np.exp(-t * 2.5)
    elif kind == 'toy': x = (np.sin(2*np.pi*f*t) + 0.5*np.sin(2*np.pi*f*3.01*t)) * np.exp(-t * 5)
    elif kind == 'organ': x = (np.sin(2*np.pi*f*t) + 0.5*np.sin(4*np.pi*f*t) + 0.25*np.sin(8*np.pi*f*t)) * np.minimum(1, t * 30) * np.minimum(1, (d - t) * 20)
    else: x = np.sign(np.sin(2*np.pi*f*t)) * 0.5 * np.exp(-t * 6)
    return x * v
def seq(notes, bpm, kind, d):
    x = np.zeros(int(SR * d)); b = 60 / bpm; at = 0
    for m, l in notes:
        if m: place(x, note(m, l * b * 1.6, 0.6, kind), at)
        at += l * b
        if at > d - 0.5: break
    return x
def piano(d=6):  # slow, sad, minor
    mel = [(57, 1), (64, 1), (60, 2), (55, 1), (62, 1), (59, 2), (53, 1), (60, 1), (57, 2), (52, 4)]
    x = seq(mel, 60, 'piano', d) + seq([(45, 4), (43, 4), (41, 4), (40, 4)], 60, 'piano', d) * 0.7
    return fade(x, 0.05, 0.6)
def hype(d=4):  # four on the floor, a squarer lead
    x = np.zeros(int(SR * d)); b = 60 / 128
    for i in range(int(d / b)): place(x, kick(1.0), i * b); place(x, hat(0.4), i * b + b / 2)
    x += seq([(64, .5), (64, .5), (67, .5), (64, .5), (69, 1), (67, .5), (64, .5)] * 4, 128, 'square', d) * 0.5
    return fade(x, 0.01, 0.3)
def birthday(d=6):  # a toy-piano party tune (original)
    mel = [(72, .5), (72, .5), (74, 1), (72, 1), (77, 1), (76, 2), (72, .5), (72, .5), (74, 1), (72, 1), (79, 1), (77, 2)]
    return fade(seq(mel, 120, 'toy', d), 0.01, 0.4)
def muzak(d=6):  # lift music: a soft organ, smooth and nowhere
    mel = [(65, 1), (69, 1), (72, 1), (69, 1), (67, 2), (64, 2), (65, 1), (69, 1), (74, 1), (72, 3)]
    x = seq(mel, 84, 'organ', d) * 0.6 + seq([(53, 4), (48, 4), (50, 4)], 84, 'organ', d) * 0.4
    return fade(x, 0.2, 0.6)
def ding():  # the lift arriving
    x = np.zeros(int(SR * 1.2)); place(x, note(84, 1.0, 0.8, 'toy'), 0); place(x, note(79, 1.0, 0.8, 'toy'), 0.3); return x
def unplug():  # a jack yanked out: a pop and a short buzz
    t = t_(0.3); return band(R.normal(0, 1, len(t)), 100, 3000) * np.exp(-t * 40) + 0.3 * np.sign(np.sin(2*np.pi*60*t)) * np.exp(-t * 25)
def rain(d=8):  # rain on a floor indoors
    n = int(SR * d); x = band(R.normal(0, 1, n), 800, 8000) * 0.3
    for k in range(int(d * 40)): place(x, band(R.normal(0, 1, 400), 2000, 9000) * np.hanning(400) * R.uniform(0.1, 0.4), R.uniform(0, d - 0.01))
    return fade(x, 0.1, 0.3)
def bored(d=40):  # a flat party: a few low voices, a fridge hum, nobody talking much
    n = int(SR * d); x = band(R.normal(0, 1, n), 100, 300) * 0.04
    for k in range(int(d * 3)):
        at = R.uniform(0, d - 0.4); l = int(SR * R.uniform(0.1, 0.3)); f0 = R.uniform(100, 180); t = np.arange(l) / SR
        place(x, band(np.sin(2*np.pi*f0*t) * np.hanning(l), 100, 1200) * 0.05, at)
    return fade(x, 0.5, 0.5)

def quad(d=12):  # the campus lawn at midday: a light breeze, birds now and then, voices far off
    n = int(SR * d); x = band(R.normal(0, 1, n), 100, 900) * 0.08 + band(R.normal(0, 1, n), 300, 1500) * 0.015
    for k in range(int(d * 0.8)):  # a bird: two or three quick chirps
        at = R.uniform(0, d - 0.6); f0 = R.uniform(2600, 4200)
        for j in range(R.integers(2, 4)):
            t = t_(0.07); place(x, np.sin(2 * np.pi * np.cumsum(f0 + 900 * t / 0.07) / SR) * np.hanning(len(t)) * 0.05, at + j * 0.11)
    return fade(x, 0.3, 0.3)
def dinner(d=12):  # Sunday dinner: a warm quiet room, a clock, knives and forks on plates now and then
    n = int(SR * d); x = band(R.normal(0, 1, n), 60, 250) * 0.03
    for k in range(int(d)): t = t_(0.02); place(x, band(R.normal(0, 1, len(t)), 2000, 6000) * np.exp(-t * 300) * 0.06, k + 0.5)  # the clock
    for k in range(int(d * 1.2)):  # cutlery
        at = R.uniform(0, d - 0.3); f0 = R.uniform(2800, 5200); t = t_(0.25)
        place(x, (np.sin(2 * np.pi * f0 * t) + 0.5 * np.sin(2 * np.pi * f0 * 1.51 * t)) * np.exp(-t * 28) * R.uniform(0.02, 0.06), at)
    return fade(x, 0.2, 0.3)

if __name__ == '__main__':
    if len(sys.argv) > 1: save(sys.argv[1] + '.wav', globals()[sys.argv[1][3:]](), 0.5); sys.exit()
    save('sk_chatter.wav', chatter(40), 0.5)
    for name, f in [('sip', sip), ('sniff', sniff), ('pop', pop), ('flop', flop), ('gleam', gleam), ('gasp', gasp)]:
        save('sk_' + name + '.wav', f(), 0.8)
