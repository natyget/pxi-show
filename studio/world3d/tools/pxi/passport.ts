// passport.ts <job.json> <out-dir> : everything the Passport screen needs from the app's own code, as SVG and numbers.
// It runs pxi-mobile-app unchanged: where each stamp sits on the page (src/utils/stampLayout.ts), what each stamp looks
// like (src/components/stamps), the round "MEMBER FOR ..." ink stamp (src/components/popups/art) and the level
// (src/utils/odysseyTier.ts). The small drawings that live inside NewPassportCard.tsx (the level hexagon, the Citizen
// mark, the little passport icon) are copied here path for path. passport.sh bundles and runs this.
// job.json: { area: {width, height}, now, user: {since, xp}, events: [{id, name, startDate, ticketPriceUsd, xp, albumRole?, isPrivate?}] }
import fs from 'node:fs';
import path from 'node:path';
import { buildStampScene } from '../../../../../pxi-mobile-app/src/components/stamps/buildStamp';
import { sceneToSvg } from '../../../../../pxi-mobile-app/src/components/stamps/toSvgString';
import { computePassportStampBundle, formatStampFullDate, formatStampNameForEvent, getStampColor, getStampTypeForEvent, oneStampPerEvent, MAX_VISIBLE_PASSPORT_STAMPS } from '../../../../../pxi-mobile-app/src/utils/stampLayout';
import { inkStampNodes, memberStampSpec, STAMP_BOX } from '../../../../../pxi-mobile-app/src/components/popups/art/inkStampArt';
import { svgToString } from '../../../../../pxi-mobile-app/src/components/popups/art/svgString';
import { memberDuration } from '../../../../../pxi-mobile-app/src/components/passport/memberDuration';
import { getOdysseyTierBandForXp, getLevelProgressWithinTier, getPassportLevelBadgeTheme } from '../../../../../pxi-mobile-app/src/utils/odysseyTier';

const [jobFile, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const job = JSON.parse(fs.readFileSync(jobFile, 'utf8'));
const save = (name: string, svg: string) => fs.writeFileSync(path.join(out, name + '.svg'), svg);

// the stamps, where the app would put them
const events = oneStampPerEvent(job.events).slice(0, MAX_VISIBLE_PASSPORT_STAMPS) as any[];
const { layouts, shapes } = computePassportStampBundle(events, { width: job.area.width, height: job.area.height, yearRowHeight: 0 });
const stamps = events.map((e) => {
    const shape = shapes.get(e.id) ?? getStampTypeForEvent(e.ticketPriceUsd ?? 0, e.albumRole);
    const color = getStampColor(e.xp);
    const scene = buildStampScene({ shape, color, name: formatStampNameForEvent(e), date: formatStampFullDate(e.startDate), isPrivate: !!e.isPrivate, seed: e.id, widthScale: 1 });
    if (!scene) throw new Error('no stamp for ' + e.id);
    save('stamp-' + e.id, sceneToSvg(scene));
    return { id: e.id, shape, color, ...layouts.get(e.id)! };
});

// the member stamp
const d = memberDuration(job.user.since, new Date(job.now));
save('member', svgToString(inkStampNodes({ ...memberStampSpec(String(d.value), d.unit), ink: '#A523EF' }), { width: STAMP_BOX, height: STAMP_BOX }));

// the level
const band = getOdysseyTierBandForXp(job.user.xp), theme = getPassportLevelBadgeTheme(band.id), progress = getLevelProgressWithinTier(job.user.xp);
const HEX = 'M39.8184 19.6525C40.9842 18.9794 41.5671 18.6429 42.1868 18.5111C42.7351 18.3946 43.3018 18.3946 43.8501 18.5111C44.4698 18.6429 45.0527 18.9794 46.2184 19.6525L58.005 26.4574C59.1707 27.1305 59.7536 27.467 60.1775 27.9378C60.5526 28.3544 60.836 28.8451 61.0092 29.3783C61.205 29.9808 61.205 30.6539 61.205 32V45.6099C61.205 46.956 61.205 47.6291 61.0092 48.2316C60.836 48.7647 60.5526 49.2555 60.1775 49.6721C59.7536 50.1429 59.1707 50.4794 58.005 51.1525L46.2184 57.9574C45.0527 58.6305 44.4698 58.967 43.8501 59.0987C43.3018 59.2153 42.7351 59.2153 42.1868 59.0987C41.5671 58.967 40.9842 58.6305 39.8184 57.9574L28.0319 51.1525C26.8661 50.4794 26.2832 50.1429 25.8593 49.6721C25.4842 49.2555 25.2009 48.7647 25.0277 48.2316C24.8319 47.6291 24.8319 46.956 24.8319 45.6099V32C24.8319 30.6539 24.8319 29.9808 25.0277 29.3783C25.2009 28.8451 25.4842 28.3544 25.8593 27.9378C26.2832 27.467 26.8661 27.1305 28.0319 26.4574L39.8184 19.6525Z';
// HeaderPolygonBadge: a 64 ring (radius 25, stroke 6) round a 34 x 36 hexagon drawn from the viewBox "22 15.5 42 46.5"
const R = 25, C = 2 * Math.PI * R, k = Math.min(34 / 42, 36 / 46.5), hx = 32 - (42 * k) / 2, hy = 32 - (46.5 * k) / 2;
save('level', `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">` +
    `<circle cx="32" cy="32" r="${R}" stroke="${theme.progressTrack}" stroke-width="6" fill="none"/>` +
    `<circle cx="32" cy="32" r="${R}" stroke="${theme.progressFill}" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="${C} ${C}" stroke-dashoffset="${C * (1 - Math.max(0.08, Math.min(1, progress)))}" transform="rotate(-90 32 32)"/>` +
    `<g transform="translate(${hx} ${hy}) scale(${k}) translate(-22 -15.5)"><path d="${HEX}" fill="${theme.fill}"/><path d="${HEX}" stroke="${theme.stroke}" stroke-width="5" fill="none"/></g></svg>`);
// CitizenBadgeGraphic: a 76-point C with a slot cut for "itizen"
save('citizen', `<svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" viewBox="0 0 76 76"><defs><mask id="m"><rect x="0" y="0" width="76" height="76" fill="#fff"/><rect x="28" y="28" width="48" height="20" fill="#000"/></mask></defs>` +
    `<text x="4" y="64" fill="#fff" font-family="Inter" font-size="76" font-weight="900" mask="url(#m)">C</text><text x="28" y="42" fill="#fff" font-family="Inter" font-size="15" font-weight="900" letter-spacing="0.2">itizen</text></svg>`);
// VectorIcon: the purple passport mark, 20 x 12 from the viewBox "12 11 17 10"
save('mark', `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="12" viewBox="12 11 17 10" fill="none"><path d="M12 11H29V21H12V11Z" fill="#BB17E8"/>` +
    `<path fill-rule="evenodd" clip-rule="evenodd" d="M20.5 13C21.9864 13 23.2194 14.0812 23.4575 15.5H29V16.5H23.4575C23.2194 17.9188 21.9864 19 20.5 19C19.0136 19 17.7806 17.9188 17.5425 16.5H12V15.5H17.5425C17.7806 14.0812 19.0136 13 20.5 13ZM20.5 14C19.3954 14 18.5 14.8954 18.5 16C18.5 17.1046 19.3954 18 20.5 18C21.6046 18 22.5 17.1046 22.5 16C22.5 14.8954 21.6046 14 20.5 14Z" fill="#0C0C0C"/></svg>`);

fs.writeFileSync(path.join(out, 'passport.json'), JSON.stringify({ stamps, member: d, level: { label: band.label, letter: band.badgeLetter, progress, theme } }, null, 1));
