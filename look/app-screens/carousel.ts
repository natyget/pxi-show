// The Discover carousel of one city, worked out by the app's own code (read-only): which outside listings are cards
// (carouselMix.ts: only the ones that carry a song), their order, how each card is dressed, and the last card of the
// loop, the doorway to All events (doorway.ts: its count, its three picks, its words).
//   cd pxi-mobile-app && TZ=<the city's zone> npx tsx --tsconfig <tsconfig with the @/* path> <this file> <app.json> '<options as JSON>'
// app.json is the answer to the question the app asks (studio/events.py saves it). Options:
//   now   ISO time the carousel is read at (what is over, which night is "Tonight")
//   when  tonight | tomorrow | weekend | week | night:YYYY-MM-DD   (the app opens on week)
// Prints JSON: { city, zone, tonight, whenLabel, geo, cards: [...], doorway }
// discoverLogic.ts cannot be loaded outside the app (it pulls in the network client), so its few lines used here
// (matchesWhen, priceDisplay, locationDisplay, recordCaption, stampPreviewFor) are copied below, each with its name.
import { readFileSync } from 'fs';
import { parseListingsBody, type DiscoverListing } from '@/services/discoverListingsModel';
import { clockLabel, nightOf, nightsBetween, tonightOf, wallClock, weekdayOf, NIGHT_CUTOFF_HOUR } from '@/utils/nights';
import { listingToDiscoverEvent } from '@/components/discover/externalEvents';
import { mixByTime, ridesInCarousel } from '@/components/discover/carouselMix';
import { pickDoorway, pickTime, sourceLine } from '@/components/discover/allEvents/doorway';
import { whenFromKey, whenLabel, whenNights } from '@/components/discover/when/whenModel';
import { computeGeometry, detailsHeight } from '@/components/discover/geometry';
import { posterLayout } from '@/components/discover/allEvents/posterLayout';
import { POSTER_PAPER, posterInk } from '@/components/discover/allEvents/genres';
import { pxiVenueName } from '@/components/discover/allEvents/allEventsModel';
import { eventRequiresPaidTicket } from '@/lib/eventTicketPricing';
import { eventFromPrice } from '@/lib/ticketPriceDisplay';
import { parseEventTicketTiers } from '@/lib/ticketTiers';
import { STAMP_VIEWBOX, formatStampDate, formatStampName, getStampColor, getStampTypeForEvent } from '@/utils/stampLayout';
import { buildStampScene } from '@/components/stamps/buildStamp';
import { sceneToSvg } from '@/components/stamps/toSvgString';

const [file, optsJson] = process.argv.slice(2);
const opts = JSON.parse(optsJson || '{}') as { now?: string; when?: string };
const res = parseListingsBody(JSON.parse(readFileSync(file, 'utf8')));
const zone = res.city?.timeZone ?? null;
const nowMs = opts.now ? new Date(opts.now).getTime() : Date.now();
const tonight = tonightOf(nowMs, zone);
const when = whenFromKey(opts.when ?? 'week');
const nights = whenNights(when, tonight);

// DiscoverScreen at a 390x844 phone: the height left for the stage, the details and the action row.
const W = 390;
const geo = computeGeometry(W, 844 - (24 + 64 + 10) - 215 - 26 - 8);

// ── useDiscoverFeed: the outside listings that are cards, and the doorway for the rest ──────────────────────────
const rows = res.listings.map((l) => ({ l, e: listingToDiscoverEvent(l) }));
// matchesWhen (discoverLogic.ts): the event's night falls in the When. (The phone's clock is the city's here.)
const inWhen = (start: string) => { const n = nightOf(start, zone); return !!n && nights.includes(n); };
const cardsOutside = rows.map((r) => r.e).filter((e) => ridesInCarousel(e, nowMs) && inWhen(e.startDate));
const ordered = mixByTime([], cardsOutside); // no PXI event is mixed in: none was public when this was built
const isCard = new Set(ordered.map((e) => e.__external!.listing.id));
const doorway = pickDoorway(rows.filter((r) => !isCard.has(r.l.id)).map((r) => r.l), when, tonight, nowMs, zone);

// ── how a card is dressed ───────────────────────────────────────────────────────────────────────────────────────
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
// eventTimeParts (utils/eventClock.ts): "Tonight" or "Today", the weekday for the next six nights, then the date.
function timeParts(startsAt: string): { day: string; clock: string } {
    const night = nightOf(startsAt, zone)!;
    const at = wallClock(startsAt, zone)!;
    const days = nightsBetween(tonight, night);
    const evening = at.hour >= 17 || at.hour < NIGHT_CUTOFF_HOUR;
    const day = days === 0 ? (evening ? 'Tonight' : 'Today') : days > 0 && days < 7 ? WEEKDAYS[weekdayOf(night)]! : `${MONTHS[Number(night.slice(5, 7)) - 1]} ${Number(night.slice(8, 10))}`;
    return { day, clock: clockLabel(startsAt, zone) };
}
// formatPriceAmount and priceDisplay (discoverLogic.ts)
const amount = (usd: number | null | undefined, currency = 'USD') => {
    if (usd == null || !Number.isFinite(Number(usd))) return '—';
    const sym = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    const n = Number(usd);
    return Number.isInteger(n) ? `${sym}${n}` : `${sym}${n.toFixed(2)}`;
};
function priceDisplay(e: any): string {
    if (e.__external && !e.__external.priceKnown) return 'TBA';
    if (!eventRequiresPaidTicket(e)) return 'FREE';
    const from = eventFromPrice(e);
    const text = amount(from.usd ?? e.ticketPrice, e.currency);
    return from.several ? `FROM ${text}` : text;
}
// locationDisplay (discoverLogic.ts)
function locationDisplay(e: any): string {
    const firstLine = String(e.location ?? '').split(/\n|,|•/).map((p: string) => p.trim()).find(Boolean);
    return (e.venueName?.trim() || firstLine || 'TBA').toUpperCase();
}
// shortDateLabel and recordCaption (discoverLogic.ts); an outside card always has a song, so its first two branches decide.
const shortDate = (start: string) => new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: zone ?? undefined }).toUpperCase();
function recordCaption(e: any): [string, string] {
    const genre = e.genre?.trim();
    const song = e.topSong;
    if (genre) return [genre.toUpperCase(), String(song?.title ?? song?.artist ?? shortDate(e.startDate)).toUpperCase()];
    return [String(song.artist || song.title).toUpperCase(), String(song.artist ? song.title : shortDate(e.startDate)).toUpperCase()];
}
// stampPreviewFor (discoverLogic.ts) and stampBoxIn (DiscoverDetails.tsx): the stamp a guest would earn, and its box in the circle.
function stamp(e: any) {
    const tiers = parseEventTicketTiers(e); // eventTicketValueUsd (services/events.ts)
    const shape = getStampTypeForEvent(tiers.length ? Math.min(...tiers.map((t) => t.priceUsd)) : 0, 'MEMBER');
    const vb = STAMP_VIEWBOX[shape];
    const ratio = vb.h / vb.w;
    const inner = geo.detailsD * (shape === 'oval-entry' ? 0.9 : 0.74);
    const w = Math.min(inner, inner / ratio);
    const scene = buildStampScene({ shape: shape as any, color: getStampColor(0), name: formatStampName(e.name ?? ''), date: formatStampDate(e.startDate), seed: e.id, widthScale: 1 });
    return { svg: sceneToSvg(scene!), w, h: w * ratio };
}
// EventCover: what the poster of a card with no flyer keeps clear of (the record tab; the faces and heart at the foot).
const pad = Math.round(geo.cw * 0.07);
const face = Math.round(26 * Math.max(0.85, geo.s));
const avoid = [{ top: Math.round(geo.ch * 0.48 - geo.tabR), bottom: Math.round(geo.ch * 0.48 + geo.tabR), right: geo.tabR + 8 }];

const cards = ordered.map((e: any) => {
    const l: DiscoverListing = e.__external.listing;
    const venue = pxiVenueName(e);
    const night = nightOf(e.startDate, zone);
    const songArt = e.topSong?.artworkUrl || null;
    return {
        id: l.id,
        external: true,
        name: e.name,
        // A flyer already says the event's name: the cover prints nothing over it (hideNameOnCover).
        hideName: !!e.hideNameOnCover,
        host: '',
        coverUrl: e.coverImage ?? null,
        poster: e.coverImage ? null : { ink: posterInk(e.genre, ''), paper: POSTER_PAPER, where: venue.toUpperCase(), when: night ? posterNight(night) : '',
            ...posterLayout({ size: geo.cw, height: geo.ch, title: e.name ?? '', hasByline: false, footLines: (venue ? 1 : 0) + (night ? 1 : 0), reserveBottom: Math.max(32, face) + Math.round(pad * 0.6), avoid }) },
        // EventDisc: the label is the song's artwork, else a tinted crop of the cover.
        labelUrl: songArt ?? e.coverImage ?? null,
        labelFallback: !songArt,
        record: recordCaption(e),
        song: e.topSong?.title ?? null,
        ...timeParts(e.startDate),
        location: locationDisplay(e),
        price: priceDisplay(e),
        stamp: stamp(e),
        night,
        startsAt: e.startDate,
        venue: l.venueName ?? null,
        source: l.source,
        ticketUrl: l.ticketUrl,
    };
});
// nightLine (posterLayout.ts): "FRI OCT 16"
function posterNight(night: string): string {
    return `${WEEKDAYS[weekdayOf(night)]} ${MONTHS[Number(night.slice(5, 7)) - 1]} ${Number(night.slice(8, 10))}`;
}

// ── the doorway: DoorwayCover (the fan, the number, "MORE THIS WEEK") and DoorwayDetails (the three lines) ──────
const fw = Math.round(geo.cw * 0.46);
const border = Math.max(2, Math.round(fw * 0.045));
const door = doorway && {
    count: doorway.count,
    windowLabel: doorway.windowLabel,
    from: sourceLine(doorway.sources),
    picks: doorway.picks.map((p) => ({
        id: p.id,
        title: p.title,
        time: pickTime(p, doorway),
        coverUrl: p.coverUrl ?? null,
        venue: p.venueName ?? null,
        ticketUrl: p.ticketUrl,
        poster: p.coverUrl ? null : { ink: posterInk(p.genre), paper: POSTER_PAPER, where: (p.venueName?.trim() ?? '').toUpperCase(), when: posterNight(p.night),
            ...posterLayout({ size: fw - border * 2, title: p.title, footLines: (p.venueName?.trim() ? 1 : 0) + (p.night ? 1 : 0) }) },
    })),
};

process.stdout.write(JSON.stringify({ city: res.city?.name ?? '', zone, tonight, whenLabel: whenLabel(when, tonight), geo: { ...geo, detailsH: detailsHeight(geo) }, cards, doorway: door }));
