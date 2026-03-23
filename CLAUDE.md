# Five Dollar Down — Website Codebase Summary

## What this is
Static marketing website for **Five Dollar Down**, Ottawa's party band. Deployed on **Netlify** at `https://fivedollardown.com`. No framework, no build step for HTML/CSS/JS — just vanilla files served directly.

## File structure

```
/
├── index.html          # Single-page main site (hero, about, shows, media, songs, book us)
├── about.html          # Band members / story page
├── gallery.html        # Full photo gallery with lightbox
├── past-shows.html     # Table of all past shows
├── thank-you.html      # Post-form submission confirmation page
├── logo.svg            # SVG logo (also used as favicon)
├── robots.txt
├── sitemap.xml
├── netlify.toml        # Build config + cache headers
├── gallery-manifest.json  # Auto-generated at build time — do not edit manually
│
├── styles/
│   ├── tokens.css      # SINGLE SOURCE OF TRUTH for all colors, spacing, radius, transitions
│   ├── main.css        # Layout, hero, nav, sections, footer
│   ├── components.css  # Show cards, song items, booking form, buttons
│   └── gallery.css     # Gallery grid, lightbox, photo styles
│
├── scripts/
│   ├── shows.js        # SHOWS array + splitShows() — edit this for all show data
│   ├── songs.js        # SONGS array + getDisplaySongs() — edit this for setlist
│   ├── gallery.js      # Reads gallery-manifest.json, renders grid + lightbox
│   ├── youtube.js      # Lazy-loads YouTube embeds via Intersection Observer
│   ├── main.js         # Nav hamburger, form validation, show/song rendering, copyright
│   └── build-gallery-manifest.js  # Node script run by Netlify at build time
│
└── assets/
    ├── images/         # band-*.webp, logo.svg
    ├── gallery/        # show-NNN.webp (regular), pinned-show-NNN.webp (always first)
    └── video/          # hero-mobile.webm, hero-poster.jpg
```

## Design system

All design tokens live in `styles/tokens.css`. **Never hardcode hex values or pixel sizes outside this file.**

Key palette (Neon Pulse):
- `--c-ink` / `--c-ink-2` — dark navy backgrounds
- `--c-surface` / `--c-surface-2` — near-black surfaces
- `--c-accent` `#00D4FF` — cyan primary accent
- `--c-accent-lt` `#FF2D9B` — magenta for hover/badges
- Fonts: Montserrat (headings/UI) + Inter (body) via Google Fonts

## Key data files — edit these for content updates

### Adding/editing shows — `scripts/shows.js`
- Add an object to the `SHOWS` array: `{ date: "YYYY-MM-DD", name: "", venue: "", city: "", tickets: "" }`
- `tickets` is optional — if set, renders a "More Info" button linking to the URL
- `splitShows()` automatically separates upcoming vs past based on today's date
- **Never edit `index.html` or `past-shows.html` for show data**

### Adding/editing songs — `scripts/songs.js`
- Add to `SONGS` array: `{ artist: "", title: "", badge: "", pinned: true|false }`
- `pinned: true` — always shown; `pinned: false` — randomly rotated
- `DISPLAY_COUNT = 15` controls how many songs appear per page load

### Adding gallery photos — `assets/gallery/`
- Regular photos: `show-NNN.webp` (NNN = zero-padded number, newest = highest number)
- Pinned photos (always shown first): `pinned-show-NNN.webp`
- After adding files, push to GitHub — Netlify build runs `build-gallery-manifest.js` which regenerates `gallery-manifest.json` automatically

## Deployment

- **Host:** Netlify, auto-deploys on push to `main`
- **Build command:** `node scripts/build-gallery-manifest.js` (regenerates gallery manifest)
- **Publish directory:** `.` (root)
- **Forms:** Netlify Forms handles the booking form (`name="book-us"`) — submissions go to Netlify dashboard, no backend code needed
- **Cache:** assets get `max-age=31536000, immutable`; HTML gets `must-revalidate`

## Analytics & SEO

- Google Analytics: `G-BPMM4RKM3G` (in `<head>` of every HTML page)
- Open Graph + Twitter Card meta tags on all pages
- Schema.org `MusicGroup` structured data on `index.html`
- `sitemap.xml` and `robots.txt` present

## YouTube embeds

Videos use `<div class="yt-embed" data-id="VIDEO_ID" data-orientation="vertical|landscape">`. `scripts/youtube.js` lazy-loads them via Intersection Observer — no iframes render until the element is in view.

## Contact / social

- Booking email: `booking@fivedollardown.com`
- Facebook: `https://www.facebook.com/FiveDollarDown`
- Instagram: `https://www.instagram.com/fivedollardown`
