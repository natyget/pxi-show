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

if __name__ == '__main__':
    if len(sys.argv) > 1: save(sys.argv[1] + '.wav', globals()[sys.argv[1][3:]](), 0.5); sys.exit()
    save('sk_chatter.wav', chatter(40), 0.5)
    for name, f in [('sip', sip), ('sniff', sniff), ('pop', pop), ('flop', flop), ('gleam', gleam), ('gasp', gasp)]:
        save('sk_' + name + '.wav', f(), 0.8)
