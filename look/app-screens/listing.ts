// Dress one outside listing the way the app's Discover does, with the app's own code where it is free of
// app-only dependencies (read-only): the card's name and byline, and the stamp a guest would earn.
// The Location and Price lines follow discoverLogic.ts (locationDisplay, priceDisplay), copied here in a few
// lines because that file pulls in the network client.
//   cd pxi-mobile-app && npx tsx --tsconfig <tsconfig with the @/* path> <this file> <raw.json> <listing id>
// Prints JSON: { name, byline, host, location, price, record: [line 1, line 2], stampSvg }
import { readFileSync } from 'fs';
import { listingToDiscoverEvent } from '@/components/discover/externalEvents';
import { formatStampDate, formatStampName, getStampColor, getStampTypeForEvent } from '@/utils/stampLayout';
import { buildStampScene } from '@/components/stamps/buildStamp';
import { sceneToSvg } from '@/components/stamps/toSvgString';

const [file, id] = process.argv.slice(2);
const raw = JSON.parse(readFileSync(file, 'utf8'));
const l = (raw.events as any[]).find((e) => e.id === id);
if (!l) throw new Error('no listing ' + id);
const ev: any = listingToDiscoverEvent(l);
const usd = typeof l.priceFromCents === 'number' ? l.priceFromCents / 100 : 0;
const money = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);
// priceDisplay: an outside listing that gave no price says TBA, a free one FREE, several prices FROM the lowest
const several = typeof l.priceToCents === 'number' && l.priceToCents > l.priceFromCents;
const price = l.isFree ? 'FREE' : typeof l.priceFromCents !== 'number' ? 'TBA' : several ? `FROM ${money(usd)}` : money(usd);
// locationDisplay: the venue's name, else the first line of the address, else TBA
const firstLine = String(l.address || '').split(',')[0];
const location = String(l.venueName || firstLine || 'TBA').trim().toUpperCase();
const shape = getStampTypeForEvent(l.isFree ? 0 : usd, 'MEMBER');
const name = formatStampName(ev.name ?? '');
const date = formatStampDate(ev.startDate);
// recordCaption: genre in magenta over the song (or its artist, or the date); with no genre, the artist over the song
const shortDate = new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: raw.city?.timeZone || 'America/New_York' }).toUpperCase();
const genre = String(ev.genre ?? l.genre ?? '').trim();
const song = l.topSong ?? null;
const record = genre
  ? [genre.toUpperCase(), String(song?.title ?? song?.artist ?? shortDate).toUpperCase()]
  : song?.title
    ? [String(song.artist || song.title).toUpperCase(), String(song.artist ? song.title : shortDate).toUpperCase()]
    : [String(raw.city?.name ?? 'PXI').toUpperCase(), shortDate];
const scene = buildStampScene({ shape: shape as any, color: getStampColor(0), name, date, seed: name });
process.stdout.write(
  JSON.stringify({
    name: ev.name,
    byline: ev.host?.name ? `BY ${String(ev.host.name).toUpperCase()}` : '',
    host: ev.host?.name ?? null,
    location,
    price,
    record,
    stampSvg: sceneToSvg(scene!, { width: 300, height: 300 }),
  }),
);
