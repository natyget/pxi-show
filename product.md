# What PXI is

PXI (spoken "pixie", written PXI) is a free app on iPhone and Android. Site: pxispace.com. App code (read-only):
`PXILABS/pxi-mobile-app`. Look: pitch black with one purple, #A523EF.

In the order we lead with:

1. **Discover**: every event near you, as cards or on a map. It shows events hosted on PXI and listings from
   other ticket sites (Eventbrite, DICE, Posh, RA, Ticketmaster), each with its own poster. Join an event and share
   it. Cities today: New York and Boston.
2. **The shared album**: everyone at an event shoots into one album, so you get the photos other people took of you.
3. **The camera**: a flash look, faces lit and the room falling off to dark, warm film grade, straight into the
   event's album.
4. Albums for life events (birthdays, weddings, baby showers, graduations, game nights, run clubs), each with its
   own chat thread.
5. Face match ("you might be in 14 photos", with "Not me"), the scrapbook, the Passport (a stamp per event),
   making an event and inviting by link or code, sharing to Instagram, tickets for hosts.

Never invent a feature, price, city, number or quote. If it is not here, on pxispace.com or in the app code, ask.
Real events come from PXI's own API through `studio/events.py`: names, days, venues, prices, posters and ticket
links, saved with the piece in `sources.md`. A poster is used the way the app uses it, as the cover of that
event's card. An invented demo event uses plain names and our own flyer, and is never shown as a real listing.
