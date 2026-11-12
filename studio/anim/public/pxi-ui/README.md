# PXI's screens in the show's pixels

Everything here is made by `tools/pxi/` from the app's own code (`pxilabs/pxi-mobile-app`). Nothing is a screenshot.

- `screens/` : finished phone screens, 360 x 780 hard pixels (the app's 393 x 852 points). Made by
  `python3 tools/pxi/screens.py all`, then copied here. A shot puts one on Nio's phone with `"screen": "<name>"`.
- `icons/` : the app's Hugeicons (`@hugeicons/core-free-icons`, MIT), reduced to one-bit pixels by `tools/pxi/icons.cjs`.
- `emoji/` : Noto Color Emoji (SIL Open Font License 1.1), reduced by `tools/pxi/ui.py`.
- `art/` : stamps drawn by the app's own stamp code (`tools/pxi/stamps.sh`), reduced by `tools/pxi/ui.py`.
- `fonts/` : Stack Sans Notch and DM Mono are the app's fonts. Inter stands in for the iPhone's system font and
  Gelasio for Georgia, which cannot be shipped. Each licence file sits beside its font.

Rules: the wording, layout and colours follow the app character for character. Photos and faces are renders of
Nio's world at the exact pixel size they appear, never real photos. Text and shapes are drawn as hard pixels,
never drawn smooth and filtered.
