# PXI product truth (so a run never has to search the app repo)

PXI is a free app on the App Store and Google Play: everything to do in your city on one map, and every photo
you are in, from everyone's phones, in one shared album. Guests use it free. Hosts sell tickets through it.

The app is `PXILABS/pxi-mobile-app` (Expo, React Native). Its look is pitch black with one purple, `#A523EF`.
The four tabs are Wall, Studio, Camera and Passport.

## Features an episode can run on, and where each screen lives in the app

| Feature | What a real person does with it | Screen source in pxi-mobile-app |
|---|---|---|
| Face match | Gets a push: "You might be in a photo" / "You might be in N photos" | `src/components/notifications/FaceMatchCard.tsx` |
| Face review | Sees "IS THIS YOU?" and confirms, or taps "Not me", which hides the photo from their matches | `app/face-review.tsx` |
| Make an event | Creates an event in Studio and gets a page for it | `app/(tabs)/studio.tsx`, `src/components/create/` |
| Invite and join | Sends a link or a code; friends tap it and are in | `app/join/[code].tsx`, `src/components/share/` |
| Album thread | Chats in the album's thread, reacts to photos, drops GIFs | `src/components/album/ThreadView.tsx`, `ChatBar.tsx`, `AlbumReactionBar.tsx`, `GifPickerSheet.tsx` |
| Share to Instagram | Sends a photo or the night out to Instagram | `src/components/instashare/` |
| Shared album | Everyone at an event adds photos to one album; THREAD and GALLERY views | `app/album/[id].tsx`, `src/components/album/` |
| Discover and map | Looks at what is on tonight near them | `src/components/discover/`, `app/all-events.tsx` |
| Event page and tickets | Opens an event, gets a ticket into the wallet | `app/event/[id].tsx`, `app/ticket/[id].tsx` |
| Passport and stamps | Collects a stamp for each event they went to | `app/(tabs)/passport.tsx`, `src/components/stamps/` |
| Camera | Shoots into a live album | `app/(tabs)/camera.tsx`, `src/components/camera/` |
| Night Wrap and darkroom | Gets the night developed into a wrap or a scrapbook | `app/night-wrap.tsx`, `app/darkroom/[albumId].tsx`, `app/scrapbooks/[userId].tsx` |
| Notifications | Album invites, joins, activity | `app/notifications.tsx`, `src/components/notifications/` |
| Messages | Direct messages | `app/messages/` |
| Wall | The feed of albums and events from their circle | `app/(tabs)/index.tsx`, `src/components/feed/` |

## What a viewer should do after watching

The simplest sell is the Discover map: everything on near you, on one map. After that, in the order people
actually do it: make or join an event, invite friends by link, shoot into the shared album, chat and react in
the thread, find yourself in other people's photos, share to Instagram, and get the night back as a wrap.
A holiday episode shows that whole chain, or the part of it that fits the day (`engine/calendar.md`).

## Where PXI fits comfortably (founder, Nov 11)

Taking pictures: Camera and the shared album. Planning a trip or a night: the event, the invite, group plans.
Finding something to do: the Discover map. A sweet or sad moment: a notification, a look-back, a memory.
Something blowing up: the Thread and the Wall. If none fits without being forced, PXI is not in the picture,
and the call to action still goes in the tag or the caption (`bible/story.md`, section 4).

Never compare PXI's fees with anyone's, and never say "cheaper than other apps".

## Rules for putting PXI on screen

- Open the one source file for the screen you need, copy its layout, wording, sizes and colours, and say which
  file it came from in a comment at the top of the screen component. Do not browse the rest of the app repo.
- If the app repo is not in the session, reuse an existing screen component in `studio/anim/src/ui/` and do not
  invent a new screen. Say so in the report.
- Wording is the app's own, character for character.
- Only PXI's real icon. Every other app icon on a phone is generic.
- **Product fit test** for every PXI beat: would a real person use PXI exactly like this, here, tonight?
- A feature that is not in this table is not in the show until the founder adds it.
