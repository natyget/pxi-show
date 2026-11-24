// The All events list of one city, worked out by the app's own code (read-only): which listings are over, which
// night each belongs to, the order inside a night, the 12 a night shows before "32 more tonight", every row's
// place, and each row's words (price, clock, where the tickets are, the poster of a listing with no flyer).
//   cd pxi-mobile-app && npx tsx --tsconfig <tsconfig with the @/* path> <this file> <app.json> '<options as JSON>'
// app.json is the answer to the question the app asks (studio/events.py saves it). Options:
//   now     ISO time the list is read at (what is over, which night is "Tonight")
//   when    tonight | tomorrow | weekend | week | night:YYYY-MM-DD   (the app opens on week)
//   sort    rank | soonest | cheapest        (the app opens on rank, "Best for you")
//   expand  nights whose "more" row was pressed, YYYY-MM-DD
//   open    a listing id: its night is expanded when the 12 do not hold it, and its place is printed
// Prints JSON: { city, zone, tonight, whenLabel, total, sections: [{ night, title, count, top, rows }], height, open }
import { readFileSync } from 'fs';
import { parseListingsBody } from '@/services/discoverListingsModel';
import { tonightOf } from '@/utils/nights';
import { isOver } from '@/components/discover/allEvents/doorway';
import { whenFromKey, whenLabel, whenNights } from '@/components/discover/when/whenModel';
import {
    DEFAULT_FILTERS,
    buildSections,
    layoutOf,
    listingItem,
    listingPriceLabel,
    listingSourceTag,
    listingTimeText,
    type AllEventsSort,
} from '@/components/discover/allEvents/allEventsModel';
import { posterLayout } from '@/components/discover/allEvents/posterLayout';
import { POSTER_PAPER, posterInk } from '@/components/discover/allEvents/genres';

const [file, optsJson] = process.argv.slice(2);
const opts = JSON.parse(optsJson || '{}') as { now?: string; when?: string; sort?: AllEventsSort; expand?: string[]; open?: string };
const res = parseListingsBody(JSON.parse(readFileSync(file, 'utf8')));
const zone = res.city?.timeZone ?? null;
const nowMs = opts.now ? new Date(opts.now).getTime() : Date.now();
const tonight = tonightOf(nowMs, zone);
const when = whenFromKey(opts.when ?? 'week');
const sort: AllEventsSort = opts.sort ?? 'rank';

// useAllEvents: a listing that is over is not listed; no distance is known without the viewer's own position.
const items = res.listings.filter((l) => !isOver(l, nowMs)).map((l) => listingItem(l));
const expanded = new Set(opts.expand ?? []);
let openNote: string | null = null;
if (opts.open) {
    const it = items.find((i) => i.listing.id === opts.open);
    if (!it) openNote = 'not in the list: over, or not in the answer';
    else if (!whenNights(when, tonight).includes(it.night)) openNote = `its night (${it.night}) is outside the When`;
}
const build = () => buildSections({ pxi: [], listings: items, tonight, filters: { ...DEFAULT_FILTERS, time: when }, sort, favoriteIds: new Set(), expanded });
let { sections, total } = build();
const holds = (id: string) => sections.some((s) => s.data.some((r) => r.kind === 'listing' && r.listing.id === id));
let pressedMore: string | null = null;
if (opts.open && !openNote && !holds(opts.open)) {
    // The listing is behind its night's "more" row: the viewer presses it, as in the app.
    const night = items.find((i) => i.listing.id === opts.open)!.night;
    expanded.add(night);
    pressedMore = night;
    ({ sections, total } = build());
}

// AllEventsRows: the flyer of an outside row is 60 by 80 (LISTING_ROW_H 96 less 8 above and below, 3:4).
const FLYER_H = 96 - 16;
const FLYER_W = Math.round((FLYER_H * 3) / 4);
const layout = layoutOf(sections);
let k = 0;
let open: { id: string; top: number; night: string; sectionTop: number; pressedMore: string | null } | null = null;
const out = sections.map((s) => {
    const top = layout[k++]!.offset;
    const rows = s.data.map((r) => {
        const at = layout[k++]!.offset;
        if (r.kind === 'more') return { kind: 'more', top: at, label: r.label, remaining: r.remaining };
        if (r.kind !== 'listing') throw new Error('a row this screen does not draw: ' + r.kind);
        const l = r.listing;
        if (l.id === opts.open) open = { id: l.id, top: at, night: s.night, sectionTop: top, pressedMore };
        const venue = l.venueName?.trim() ?? '';
        return {
            kind: 'listing',
            top: at,
            id: l.id,
            title: l.title,
            venue,
            time: listingTimeText(l, zone),
            series: l.series?.label ?? '',
            price: listingPriceLabel(l),
            tag: listingSourceTag(l),
            play: !!l.topSong?.previewUrl,
            coverUrl: l.coverUrl ?? null,
            // PosterFallback, for a listing with no flyer: a thumbnail (under 88 wide), so the title and the rule alone.
            poster: l.coverUrl ? null : { ink: posterInk(l.genre), paper: POSTER_PAPER, ...posterLayout({ size: FLYER_W, height: FLYER_H, title: l.title, footLines: (venue ? 1 : 0) + (l.night ? 1 : 0) }) },
        };
    });
    k++; // the section's footer: an index, no height
    return { night: s.night, title: s.title, count: s.count, top, rows };
});
const last = layout[layout.length - 1];
process.stdout.write(
    JSON.stringify({
        city: res.city?.name ?? '',
        zone,
        tonight,
        whenLabel: whenLabel(when, tonight),
        sort,
        total,
        sections: out,
        height: last ? last.offset + last.length : 0,
        open,
        openNote,
    }),
);
