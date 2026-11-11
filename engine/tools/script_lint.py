#!/usr/bin/env python3
"""Mechanical checks on an episode script, so a run does not spend tokens counting.

usage: python3 engine/tools/script_lint.py episodes/<id>/script.md [--target 55]

Reads dialogue lines of the form `NAME: text` or `NAME (note): text` or `NAME *(note)*: text`.
What we see is written in [square brackets] on its own line (older scripts use parentheses).
Only the part of the file under a "## Script" heading is checked, if there is one. The "## Tag" section is
not checked, because the tag is the one place where Nio may name PXI and ask the viewer to get it.
Text the show itself puts on screen or on a cover is listed under "## Screen text" and checked for labels,
number drama and capitals. Exit code 1 if anything FAILs. WARN lines are for judgment and do not fail the gate.
"""
import re
import statistics
import sys

WORDS_PER_SECOND = 2.3
SECONDS_PER_ACTION = 2.5
MAX_WORDS = 130
MAX_MEDIAN_LINE = 8
KEY_LINES = ["this can't be real", "yeah, what's up", "i'm just tired", "they left"]
TOLERANCE = 0.15

# Phrases the founder banned, plus the tells in .claude/skills/writers-room/tells.md that can be matched by text.
BANNED = [
    (r"\bhold up\b", "founder: avoid 'hold up' out loud"),
    (r"\ba?ight\b", "founder: never 'ight' or 'aight'"),
    (r"\bna+h{2,}\b|\bnaa+h\b", "founder: no drawn-out 'nah'"),
    (r"\bnot a relationship guy\b", "Nio never explains himself; he pivots"),
    (r"\bdon'?t want to talk about it\b", "Nio never explains himself; he pivots"),
    (r"\bso (random|crazy|weird)\b", "someone acknowledges the joke"),
    (r"\bcheaper than\b", "never compare fees"),
    (r"\bit'?s a short one\b", "founder's example of a forced non sequitur"),
    (r"\bliterally\b", "filler"),
    (r"\bvibes?\b", "filler"),
    (r"\bchaos\b", "filler"),
    (r"\bi mean\b", "filler"),
    (r"\byou know\b", "filler"),
    (r"\babsolutely\b", "filler"),
    (r"\bhonestly\b", "staged run-up"),
    (r"\bhere'?s the thing\b", "staged run-up"),
    (r"^\s*listen\b", "staged run-up"),
    (r"\b(totally )?normal (person )?thing\b", "tidy self-narration"),
    (r"\bi guess we learned\b", "closing moral"),
    (r"\b(that'?s|this is) (so |really |kind of )?(weird|awkward|crazy|random|funny)\b", "someone acknowledges the joke"),
    (r"\bdownload\b", "PXI is shown, never sold"),
    (r"\bapp store\b", "PXI is shown, never sold"),
    (r"\bcheck out pxi\b", "PXI is shown, never sold"),
]
NOT_X_BUT_Y = re.compile(r"\b(it'?s|that'?s|this is) not\b[^.?!]*,\s*(it'?s|that'?s|this is)\b", re.I)
LIST_OF_THREE = re.compile(r"\b[\w']+(?: [\w']+)?, [\w']+(?: [\w']+)?,? (?:and|or) [\w']+", re.I)
LINE = re.compile(r"^\s*(?:[-*]\s+)?\**([A-Z][A-Z .'-]{1,24}?)\**\s*(?:\*?\([^)]*\)\*?)?\s*:\s*(.+)$")
NOT_SPEAKERS = {"INSERT", "COLD OPEN", "BUTTON", "MONTAGE", "CUT", "STAMP", "TRUE THING", "PXI ENGINE", "SETS",
                "HOOK", "SETUP", "ABSURD TURN", "ESCALATION", "EMOTIONAL HIT", "GLITCH BUTTON", "INT", "EXT"}
NARRATORS = {"NARRATOR", "VO", "V.O.", "VOICEOVER", "VOICE OVER"}


def spoken(text):
    text = re.sub(r"\*\([^)]*\)\*", " ", text)
    text = re.sub(r"\([^)]*\)", " ", text)
    return text.replace("*", " ").strip()


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print(__doc__)
        return 2
    target = 55.0
    if "--target" in sys.argv:
        target = float(sys.argv[sys.argv.index("--target") + 1])
    raw = open(args[0], encoding="utf-8").read()
    body = raw.split("## Script", 1)[1] if "## Script" in raw else raw
    body = re.split(r"\n---\s*\n|\n## ", body)[0]  # stops before "## Tag": the tag is where PXI is asked for

    screen = []
    if "## Screen text" in raw:
        for row in raw.split("## Screen text", 1)[1].split("\n## ")[0].splitlines():
            t = row.strip().lstrip("-* ").strip()
            if t and not t.startswith("<"):
                screen.append(t)

    lines, actions = [], 0
    for row in body.splitlines():
        s = re.sub(r"^\[LONG\]\s*", "", row.strip())
        if not s:
            continue
        m = LINE.match(s)
        if m and m.group(1).strip().upper() not in NOT_SPEAKERS:
            said = spoken(m.group(2))
            if said:
                lines.append((m.group(1).strip(), said))
            continue
        if s.startswith(("[", "(", "*(", "-", "INSERT", "**")):
            actions += 1

    fails, warns = [], []
    if not lines:
        print("FAIL no dialogue lines found (expected `NAME: text`)")
        return 1

    counts = [len(re.findall(r"[\w']+", said)) for _, said in lines]
    words = sum(counts)
    est = words / WORDS_PER_SECOND + actions * SECONDS_PER_ACTION
    median = statistics.median(counts)

    if words > MAX_WORDS:
        fails.append(f"{words} spoken words (limit {MAX_WORDS})")
    if median > MAX_MEDIAN_LINE:
        fails.append(f"median line is {median:g} words (limit {MAX_MEDIAN_LINE})")
    if len(counts) >= 6 and statistics.pstdev(counts) < 1.5:
        fails.append("line lengths are uniform; vary them (a one-word line, a run-on, a silence)")
    if not target * (1 - TOLERANCE) <= est <= target * (1 + TOLERANCE):
        warns.append(f"runtime estimate {est:.0f} s is outside {target:.0f} s ±15% (rough: words and action lines)")

    if len(lines) >= 6 and len({w.upper() for w, _ in lines}) < 2:
        fails.append("only one person speaks; an episode needs people talking to each other")
    for w, _ in lines:
        if w.upper() in NARRATORS:
            fails.append(f"{w} speaks (no narrator, ever)")
            break
    joined = " ".join(s.lower().replace("\u2019", "'") for _, s in lines)
    for k in KEY_LINES:
        if joined.count(k) > 1:
            fails.append(f'key line "{k}" used {joined.count(k)} times (at most once an episode)')
    faces = len(re.findall(r"\[[^\]]*\b(Nio|NIO)\b[^\]]*\]", body))
    if "[" in body and faces < 3:
        warns.append(f"only {faces} bracketed cues mention Nio; write his face changes (at least three)")

    pxi_said = 0
    for who, said in lines:
        low = said.lower()
        for pat, why in BANNED:
            if re.search(pat, low):
                fails.append(f'{who}: "{said}" ({why})')
        if NOT_X_BUT_Y.search(said):
            fails.append(f'{who}: "{said}" ("it\'s not X, it\'s Y")')
        if LIST_OF_THREE.search(said):
            warns.append(f'{who}: "{said}" (looks like a list of three)')
        if "—" in said or said.count("...") + said.count("…") > 1:
            warns.append(f'{who}: "{said}" (dash or ellipsis used for timing; use a take)')
        pxi_said += len(re.findall(r"\b(pxi|pixie)\b", low))
    if pxi_said > 1:
        fails.append(f"PXI is named aloud {pxi_said} times (at most once)")
    if sum(said.count("...") + said.count("…") for _, said in lines) > 2:
        warns.append("more than two ellipses in the dialogue")

    for t in screen:
        letters = [c for c in t if c.isalpha()]
        if re.search(r"[\u00b7\u2022|]", t):
            fails.append(f'screen text "{t}" (labels joined by a dot or bar; write what a person would say)')
        if len(re.findall(r"\d+\s+[A-Za-z]+", t)) >= 2 and len(t.split()) <= 6:
            fails.append(f'screen text "{t}" (number contrast as drama)')
        if len(letters) >= 6 and sum(c.isupper() for c in letters) / len(letters) > 0.6:
            fails.append(f'screen text "{t}" (capitals for effect)')
        if re.search(r"\b(pilot|episode|part|ep)\b\s*\d*", t.lower()) and len(t.split()) <= 5:
            fails.append(f'screen text "{t}" (an episode or series label)')

    speakers = {}
    for (who, _), n in zip(lines, counts):
        speakers[who] = speakers.get(who, 0) + n
    share = ", ".join(f"{k} {v}" for k, v in sorted(speakers.items(), key=lambda kv: -kv[1]))
    print(f"lines {len(lines)} · words {words} · median {median:g} · longest {max(counts)} · shortest {min(counts)}")
    print(f"action lines {actions} · runtime estimate {est:.0f} s · words by speaker: {share}")
    for w in warns:
        print("WARN", w)
    for f in fails:
        print("FAIL", f)
    print("RESULT", "FAIL" if fails else "PASS")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
