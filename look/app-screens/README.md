# PXI screens, rebuilt for the web (founder, Nov 6)

The app can't run in a browser (Skia, Firebase native, camera), so screens are rebuilt from the component code as HTML and screenshotted. Fill them with any seed data a post needs ("Dina's 25th", "Maya + Ben's wedding").

- `discover.html`: the Discover carousel stage (header, filter pill, Cards/Map switch, dateline, cover card + neighbour, record with polaroids and reaction pill, event stamp, LOCATION/PRICE/TASTE MATCH, JOIN + share, floating tab bar). Geometry from `pxi-mobile-app/src/components/discover/geometry.ts` at a 390x844pt iPhone.
- Seed it: `node shot.cjs discover.html out.png '<json>'` (see DEFAULT in the file for the keys: clock, when, city, day, hour, center{name, host, cover, pos, faces, going, genre, second, label, polaroids, reaction, location, price, match, stamp{text,color}}, left{name, cover}, discOpen, joined). Images go in `assets/` (approved photos only).
- Output is 1170x2532 (3x). Use full-screen, inside a clean phone frame, or cropped to the part the joke needs.

Status
- **Discover: approved by the founder (Nov 6).** `discover-example.jpg` is the approved render. The active tab is just a brighter icon (no circle), "Discover" is centred, 3 tabs (Home, Camera, Ticket).
- Not built yet: Map, Album, Notifications, Passport, Thread, Event page. Build each the first time a post needs it, the same way (from the component files, seeded), get it through the side-by-side review, then **save it here for reuse** (`<screen>.html` + an approved `<screen>-example.jpg` + a line in this list).
- Stamps are real: `stamp.ts` runs the app's own stamp builder (`cd pxi-mobile-app && tsx --tsconfig <tsconfig with only the @/* path> stamp.ts <shape> <colour> "<NAME>" "<DATE>" > assets/stamp.svg`). Free events use `circle-exit` in #A523EF.
- **Camera:** never fake the live camera. To show it, flash real photos one after another like shots being taken and queued (a quick shutter flash, the next photo, the counter going up). No live viewfinder.
- **Profile pictures and facepiles:** chest-up or wider, like people really use. Never a tight face crop. Use different people from the polaroids and the header avatar.

Rules
1. Every screen is copied from its component files (structure, sizes, colours, fonts), never invented. Clone `PXILABS/pxi-mobile-app` fresh first; the code is newer than the App Store screenshots.
2. A run can reuse these files or rebuild its own, but **a new or changed screen must pass a side-by-side review** against the real app (App Store screenshots in `examples/pxi/app-store-2.3.2/` or the founder's recordings): PASS = could be posted as a real screenshot; anything that looks off or AI-made is a FAIL.
3. Don't fake screens that can't be rebuilt convincingly (the live camera, video playback). Use a different idea instead.
