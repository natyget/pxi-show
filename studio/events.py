#!/usr/bin/env python3
"""Real events for a city, from PXI's own API: the same listings the app's Discover shows, with their posters.

  python3 studio/events.py nyc|boston [--days 7] [--out videos/<slug>/events]

Writes into the out folder:
  events.json   one row per listing: title, clean title, venue, address, local start, night, price, source,
                ticket link, organiser, type, the song on its record, the poster file, where the poster came from
  covers/       the posters, one file per listing
  sources.md    every fact with its ticket link and the time it was fetched (the proof behind a post)
  raw.json      the API's answer as it came, for the tool that dresses a listing as the app's Discover card

These are listings from other ticket sites (Eventbrite, DICE, Posh, RA, Ticketmaster) as PXI shows them. Use a
poster only the way the app does: as the cover of that event's card, with the event's own name, date and venue.
Facts change: fetch again on the day a piece is made, and again before it is scheduled."""
import argparse, datetime, json, os, re, sys, unicodedata, urllib.parse, urllib.request
from zoneinfo import ZoneInfo

API = "https://api.pxispace.com/api/listings/discover"
CITIES = {"nyc": (40.7128, -74.0060), "boston": (42.3601, -71.0589)}
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
    if e.get("isFree"): return "Free"
    c = e.get("priceFromCents")
    if isinstance(c, (int, float)) and c > 0: return "$%d" % round(c / 100) if c % 100 == 0 else "$%.2f" % (c / 100)
    return None

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("city", choices=sorted(CITIES)); ap.add_argument("--days", type=int, default=7)
    ap.add_argument("--out", default=None); a = ap.parse_args()
    out = a.out or os.path.join("events", a.city); os.makedirs(os.path.join(out, "covers"), exist_ok=True)
    lat, lng = CITIES[a.city]
    q = urllib.parse.urlencode({"lat": lat, "lng": lng, "limit": 40, "sort": "rank", "days": max(1, min(9, a.days))})
    body, _ = get(f"{API}?{q}"); data = json.loads(body)
    tz = ZoneInfo((data.get("city") or {}).get("timeZone") or "America/New_York")
    fetched = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    rows, failed = [], []
    for e in data.get("events") or []:
        if not (e.get("id") and e.get("title") and e.get("startsAt")): continue
        start = datetime.datetime.fromisoformat(e["startsAt"].replace("Z", "+00:00")).astimezone(tz)
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
    print(f"{len(rows)} listings, {sum(1 for r in rows if r['cover'])} posters -> {out}")
    for r in rows[:40]: print(f"  {r['day']:<10} {r['time']:<8} {r['titleClean'][:44]:<44} {(r['venue'] or '')[:24]:<24} {r['price'] or '-':<6} {r['source']:<12} {r['type'] or ''}{' ♪' if r['song'] else ''}")
    for t, err in failed: print("  poster not fetched:", t, "|", err)

if __name__ == "__main__":
    sys.exit(main())
