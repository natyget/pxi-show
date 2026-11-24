// stamps.ts <jobs.json> <out-dir> : the app's own stamp art, as SVG.
// It runs pxi-mobile-app's stamp code unchanged (src/components/stamps/buildStamp.ts and toSvgString.ts, with the rules
// in src/utils/stampLayout.ts that pick a stamp's shape from the ticket price and its colour from the night's score),
// so a stamp in the show is the stamp the phone would draw. stamps.sh bundles and runs this; ui.py reduces the result
// to hard pixels. jobs.json: [{ "id", "name", "date" (ISO), "price", "role"?, "xp"?, "shape"? }]
import fs from 'node:fs';
import path from 'node:path';
import { buildStampScene } from '../../../../../pxi-mobile-app/src/components/stamps/buildStamp';
import { sceneToSvg } from '../../../../../pxi-mobile-app/src/components/stamps/toSvgString';
import { formatStampDate, formatStampName, getStampColor, getStampTypeForEvent, STAMP_VIEWBOX } from '../../../../../pxi-mobile-app/src/utils/stampLayout';

const [jobsFile, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const meta: Record<string, unknown> = {};
for (const j of JSON.parse(fs.readFileSync(jobsFile, 'utf8'))) {
    const shape = j.shape ?? getStampTypeForEvent(j.price ?? 0, j.role ?? 'MEMBER');
    const scene = buildStampScene({ shape, color: j.color ?? getStampColor(j.xp ?? 0), name: formatStampName(j.name), date: formatStampDate(j.date), seed: j.id });
    if (!scene) throw new Error('no stamp for ' + j.id);
    fs.writeFileSync(path.join(out, j.id + '.svg'), sceneToSvg(scene));
    meta[j.id] = { shape, w: scene.w, h: scene.h, ratio: STAMP_VIEWBOX[shape].h / STAMP_VIEWBOX[shape].w };
}
fs.writeFileSync(path.join(out, 'stamps.json'), JSON.stringify(meta, null, 1));
