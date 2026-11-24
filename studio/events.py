#!/usr/bin/env python3
"""Real events for a city, from PXI's own API: the same listings the app's Discover shows, with their posters.

  python3 studio/events.py la|nyc|boston [--days 9] [--out videos/<slug>/events/<city>]
  python3 studio/events.py --posters videos/<slug>/events/<city>     the posters of a list already saved, fetched again
                (posters are never committed, so run this after a fresh clone before a scene with real cards renders)

Writes into the out folder:
  events.json   {"city", "fetched", "events"}; events has one row per listing: title, clean title, venue, address,
                local start, night, price, source, ticket link, organiser, type, the song on its record, the poster
                file, where the poster came from. Listings that have already started are left out
  covers/       the posters, one file per listing
  sources.md    every fact with its ticket link and the time it was fetched (the proof behind a post)
  raw.json      the API's answer as it came, for the tool that dresses a listing as the app's Discover card

These are listings from other ticket sites (Eventbrite, DICE, Posh, RA, Ticketmaster) as PXI shows them. Use a
poster only the way the app does: as the cover of that event's card, with the event's own name, date and venue.
Facts change: fetch again on the day a piece is made, and again before it is scheduled."""
import argparse, datetime, json, os, re, sys, unicodedata, urllib.parse, urllib.request
from zoneinfo import ZoneInfo

API = "https://api.pxispace.com/api/listings/discover"
CITIES = {"la": (34.0522, -118.2437), "nyc": (40.7128, -74.0060), "boston": (42.3601, -71.0589)}  # the founder's order: LA, then New York
UA = {"User-Agent": "pxi-studio/1.0"}

def get(url, timeout=40):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        return r.read(), r.headers.get("Content-Type", "")

def clean_title(t):
    """The title without the decoration some listings wrap it in (emoji, music notes, sparkles)."""
    keep = "".join(ch for ch in t if unicodedata.category(ch)[0] not in ("S", "C") and unicodedata.category(ch) != "Mn"
                   and not (0x1D100 <= ord(ch) <= 0x1D1FF) and not (0x700 <= ord(ch) <= 0x74F))
    keep = re.sub(r"\s+", " ", keep).strip()
    keep = re.sub(r"^[\W_]+|[\s\-–|:•·.,*~˖˚⋆]+$", "", keep).strip()
    keep = re.sub(r"^[˖˚⋆.\s]+|[˖˚⋆\s]+$", "", keep).strip()
    return keep or t.strip()

def price_label(e):
    c = e.get("priceFromCents")
    if e.get("isFree") or c == 0: return "Free"  # the app reads a price of 0 as free too (externalEvents.ts)
    if isinstance(c, (int, float)) and c > 0: return "$%d" % round(c / 100) if c % 100 == 0 else "$%.2f" % (c / 100)
    return None

def posters(out):
    """Fetch the posters named in a saved events.json again, into the same files the seeds point at."""
    rows = json.load(open(os.path.join(out, "events.json")))["events"]; os.makedirs(os.path.join(out, "covers"), exist_ok=True); got = gone = 0
    for r in rows:
        if not (r.get("cover") and r.get("coverUrl")): continue
        dst = os.path.join(out, r["cover"])
        if os.path.exists(dst): got += 1; continue
        try: open(dst, "wb").write(get(r["coverUrl"], 30)[0]); got += 1
        except Exception as err: gone += 1; print("  poster gone:", r["titleClean"], "|", str(err)[:60])
    print(f"{got} posters in {out}/covers" + (f", {gone} could not be fetched: fetch the listings again and check those events still stand" if gone else ""))

def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--posters": return posters(sys.argv[2])
    ap = argparse.ArgumentParser(); ap.add_argument("city", choices=sorted(CITIES)); ap.add_argument("--days", type=int, default=9, help="how many nights ahead, 1 to 9 (9 reaches the weekend after next from any day)")
    ap.add_argument("--out", default=None); a = ap.parse_args()
    out = a.out or os.path.join("events", a.city); os.makedirs(os.path.join(out, "covers"), exist_ok=True)
    lat, lng = CITIES[a.city]
    q = urllib.parse.urlencode({"lat": lat, "lng": lng, "limit": 40, "sort": "rank", "days": max(1, min(9, a.days))})
    body, _ = get(f"{API}?{q}"); data = json.loads(body)
    tz = ZoneInfo((data.get("city") or {}).get("timeZone") or "America/New_York")
    fetched = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    rows, failed, started = [], [], 0
    now = datetime.datetime.now(tz)
    for e in data.get("events") or []:
        if not (e.get("id") and e.get("title") and e.get("startsAt")): continue
        start = datetime.datetime.fromisoformat(e["startsAt"].replace("Z", "+00:00")).astimezone(tz)
        if start < now: started += 1; continue  # the app still shows last night's party at 2 AM; a post cannot send anyone to it
        row = {"id": e["id"], "title": e["title"].strip(), "titleClean": clean_title(e["title"]), "venue": e.get("venueName"), "address": e.get("address"),
               "start": start.isoformat(), "day": start.strftime("%a %b %-d"), "time": start.strftime("%-I:%M %p").replace(":00 ", " "), "night": e.get("night"),
               "price": price_label(e), "free": bool(e.get("isFree")), "source": e.get("source"), "ticketUrl": e.get("ticketUrl"),
               "organizer": e.get("organizerName"), "type": e.get("eventType"), "genre": e.get("genre"),
               "song": (e.get("topSong") or {}).get("title"), "songArtist": (e.get("topSong") or {}).get("artist"),
               "rank": e.get("rank"), "quality": e.get("quality"), "lat": e.get("lat"), "lng": e.get("lng"), "distanceKm": e.get("distanceKm"),
               "coverUrl": e.get("coverUrl"), "coverAttribution": e.get("coverAttribution"), "cover": None}
        if e.get("coverUrl"):
            try:
                img, ctype = get(e["coverUrl"], 30)
                ext = "png" if "png" in ctype else "webp" if "webp" in ctype else "jpg"
                name = re.sub(r"[^A-Za-z0-9_-]", "_", e["id"])[:60] + "." + ext
                open(os.path.join(out, "covers", name), "wb").write(img); row["cover"] = "covers/" + name
            except Exception as err:
                failed.append((row["titleClean"], str(err)[:60]))
        rows.append(row)
    json.dump(data, open(os.path.join(out, "raw.json"), "w"), ensure_ascii=False)  # the API's own rows, for look/app-screens/listing.ts
    json.dump({"city": data.get("city"), "fetched": fetched, "events": rows}, open(os.path.join(out, "events.json"), "w"), indent=1, ensure_ascii=False)
    with open(os.path.join(out, "sources.md"), "w") as f:
        f.write(f"# Listings for {(data.get('city') or {}).get('name', a.city)}, fetched {fetched}\n\nFrom PXI's API (`/api/listings/discover`). Check the ticket page again before a piece is scheduled.\n\n")
        f.write("| When | Event | Venue | Price | Listed on | Ticket page |\n|---|---|---|---|---|---|\n")
        for r in rows: f.write(f"| {r['day']}, {r['time']} | {r['titleClean']} | {r['venue'] or ''} | {r['price'] or 'not stated'} | {r['source']} | {r['ticketUrl']} |\n")
    print(f"{len(rows)} listings, {sum(1 for r in rows if r['cover'])} posters -> {out}" + (f" ({started} already started, left out)" if started else ""))
    for r in rows[:40]: print(f"  {r['day']:<10} {r['time']:<8} {r['titleClean'][:44]:<44} {(r['venue'] or '')[:24]:<24} {r['price'] or '-':<6} {r['source']:<12} {r['type'] or ''}{' ♪' if r['song'] else ''}")
    for t, err in failed: print("  poster not fetched:", t, "|", err)

if __name__ == "__main__":
    sys.exit(main())
