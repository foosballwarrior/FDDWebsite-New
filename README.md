# Five Dollar Down — Website

Static band website for [Five Dollar Down](https://fivedollardown.com), Ottawa's premier party band.
Built with plain HTML5, CSS3, and vanilla JavaScript. Hosted on Netlify free tier.

---

## Stack

- **HTML / CSS / JS** — no frameworks, no npm, no build step (except gallery manifest)
- **Netlify** — hosting, forms, CDN
- **Google Analytics** — G-BPMM4RKM3G
- **Fonts** — Montserrat (headings) + Inter (body) via Google Fonts

---

## Local Development

```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

After adding/renaming gallery photos, regenerate the manifest:
```bash
node scripts/build-gallery-manifest.js
```

Then hard-refresh the browser (Cmd + Shift + R).

---

## Adding Content

### Shows
Edit `scripts/shows.js` — add a new object to the `SHOWS` array:
```js
{ date: "2026-06-01", name: "Event Name", venue: "Venue Name", city: "Ottawa, ON", tickets: "" }
```
Dates must be `YYYY-MM-DD`. Shows split into upcoming/past automatically based on today's date.

### Gallery Photos
Drop files into `assets/gallery/` following these naming rules:
- **Regular photos:** `show-NNN.webp` or `show-NNN.jpg` (sequential numbers, highest = newest = shown first)
- **Pinned photos:** `pinned-anything.webp` or `pinned-anything.jpg` (always appear first in the gallery)

Then run `node scripts/build-gallery-manifest.js` locally, or just push to GitHub — Netlify regenerates the manifest on every deploy.

### YouTube Videos
In `index.html`, find the Watch Us Play section:
- **Landscape:** add a `<div class="yt-embed" data-id="VIDEO_ID" data-orientation="landscape"></div>` inside `.videos-grid`
- **Vertical (Shorts):** add inside `.videos-grid-vertical`

The video ID is the part after `youtu.be/` or `v=` in the URL.

---

## Deployment

Push to GitHub → Netlify auto-deploys.
- Netlify runs `node scripts/build-gallery-manifest.js` as the build command
- Publish directory: `.` (root)

---

## Pending TODOs

These are known outstanding items — pick up from here whenever ready:

### Content (requires your input)
- [ ] **Band history paragraph** — `index.html` line ~148 has an empty placeholder paragraph in the About section on the main page. Add 1–2 sentences about how the band formed.
- [ ] **YouTube social link** — footer YouTube icon is hidden (`style="display:none"`). Add the channel URL when ready.
- [ ] **TikTok social link** — footer TikTok icon is hidden (`style="display:none"`). Add the profile URL when ready.
- [ ] **OG image** — `og:image` currently points to `band-1.webp`. Replace with a proper 1200×630px promo photo for better social sharing previews.
- [ ] **Hero desktop video** — `index.html` has a commented-out `<source media="(min-width: 768px)">` tag. Uncomment and point to a landscape hero video when available.

### Optional Features (from original spec)
- [ ] **FAQ accordion** — CSS-only accordion between Book Us and Footer. Suggested questions: equipment provided, set length, song request policy, deposit info.
- [ ] **Google Search Console** — submit `https://fivedollardown.com/sitemap.xml` to get indexed faster.
- [ ] **Netlify auto-reply email** — set up a Zapier webhook to send a confirmation email to bookers on form submission.

---

## File Structure

```
/
├── index.html              Main page
├── about.html              About / Meet the Band
├── gallery.html            Full photo gallery
├── past-shows.html         Past shows archive
├── thank-you.html          Post-booking-form confirmation
├── sitemap.xml
├── robots.txt
├── netlify.toml
│
├── styles/
│   ├── tokens.css          Design tokens (colors, spacing, etc.)
│   ├── main.css            Global styles and typography
│   ├── components.css      Nav, buttons, cards, footer, forms
│   ├── gallery.css         Photo grid, video embeds, lightbox
│   └── about.css           About page specific styles
│
├── scripts/
│   ├── shows.js            ★ Master show list — edit this to add shows
│   ├── songs.js            Master song list with pinned + random rotation
│   ├── main.js             Nav, shows renderer, songs renderer, form
│   ├── gallery.js          Gallery renderer and lightbox
│   ├── youtube.js          Lazy YouTube embed loader
│   └── build-gallery-manifest.js   Netlify build script
│
└── assets/
    ├── video/
    │   └── hero-mobile.webm
    ├── images/
    │   ├── logo.svg
    │   ├── band-1.webp
    │   └── band/           pete.webp, eric.webp, ben.webp, mitch.webp
    └── gallery/            show-NNN.webp, pinned-*.webp
```
