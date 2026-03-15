# Five Dollar Down — Website Build Outline
Version 1.1 | Agent prompt reference

---

## CRITICAL RULES — READ FIRST

- Use NO frameworks. No React, no Vue, no Tailwind, no npm, no build step.
- Stack is: plain HTML5, CSS3, vanilla JavaScript only.
- Hosting target is Netlify free tier. Static files only.
- Write mobile-first CSS: base styles for small screens, then min-width media queries up.
  - Mobile breakpoint: base (< 768px)
  - Tablet breakpoint: @media (min-width: 768px)
  - Desktop breakpoint: @media (min-width: 1024px)
- Never invent placeholder content. All real brand details are in Section 1 below.
  If something is marked TODO, insert an HTML comment `<!-- TODO: add value here -->` instead.
- All JS goes at the end of `<body>`. Never in `<head>`.
- Wrap all DOM manipulation in a DOMContentLoaded listener.
- Use `const` by default, `let` only when reassignment is needed. Never `var`.
- Every interactive element needs :hover, :focus-visible, and :active states with CSS transitions.
- Target: 95+ Google PageSpeed on mobile.

---

## SECTION 1 — BRAND IDENTITY (use exactly, no substitutions)

- **Band name:** Five Dollar Down
- **Location:** Ottawa, Ontario
- **Booking email:** booking@fivedollardown.com
- **Facebook:** https://www.facebook.com/FiveDollarDown
- **Instagram:** https://www.instagram.com/fivedollardown
- **YouTube:** <!-- TODO: add URL when confirmed -->
- **TikTok:** <!-- TODO: add URL when confirmed -->

### Tagline (working copy — use as-is)
> "Five Dollar Down is Ottawa's premier party band. Our high energy booty shaking song list
> and scalable show is available for your wedding, corporate events, private parties and clubs."

**How to use the tagline on the site:**
- Hero subheading: use only the first sentence fragment — "Ottawa's premier party band"
- About section intro paragraph: use the full second sentence — "Our high energy booty shaking
  song list and scalable show is available for your wedding, corporate events, private parties
  and clubs."
- Do NOT consolidate these into one block. They live in two different sections.

---

## SECTION 2 — TECHNOLOGY STACK

| Component         | Technology                  | Reason                                      |
|-------------------|-----------------------------|---------------------------------------------|
| Structure         | HTML5                       | No overhead, fastest possible load          |
| Styling           | CSS3 + Custom Properties    | Central token system, no framework needed   |
| Interactivity     | Vanilla JavaScript          | Nav, gallery, shows logic, form validation  |
| Forms             | Netlify Forms               | Free, zero backend, 100 submissions/month   |
| Layout            | CSS Grid + Flexbox          | Responsive without any library              |
| Images            | WebP format                 | ~30% smaller than JPG                       |
| Video             | MP4 (H.264)                 | Hero background, broadest device support    |
| Embedded video    | YouTube (lazy-loaded)       | Offloads bandwidth, improves load time      |
| Fonts             | Google Fonts (preconnect)   | Bebas Neue + DM Sans                        |
| Hosting           | Netlify free tier           | CDN, forms, no server required              |

### Performance targets
- Google PageSpeed (mobile): 95+
- First Contentful Paint: < 2 seconds
- Total initial page weight: < 500kb
- Cache headers: A+ via netlify.toml

---

## SECTION 3 — DESIGN TOKENS (styles/tokens.css)

All colors and spacing MUST be defined here as CSS custom properties.
Never hardcode a hex value or pixel value anywhere outside this file.

```css
/* styles/tokens.css — Neon Pulse palette */
:root {
  /* Brand colors */
  --c-black:      #020608;
  --c-ink:        #071218;
  --c-ink-2:      #071E22;
  --c-accent:     #00D4FF;              /* cyan — primary accent */
  --c-accent-lt:  #FF2D9B;             /* magenta — hover states, badges, highlights */
  --c-accent-dim: rgba(0, 212, 255, 0.10);

  /* Neutral surfaces */
  --c-surface:    #071218;
  --c-surface-2:  #071E22;
  --c-white:      #FFFFFF;
  --c-border:     #005F6E;
  --c-muted:      #4A9AAA;

  /* Spacing scale */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 2rem;
  --space-lg: 4rem;
  --space-xl: 6rem;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;

  /* Transitions */
  --t-fast: 0.15s ease;
  --t-base: 0.25s ease;
  --t-slow: 0.4s ease;
}
```

---

## SECTION 4 — TYPOGRAPHY

Load both fonts via Google Fonts. Use `<link rel="preconnect">` before the stylesheet link
to avoid render-blocking.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet">
```

| Role          | Font        | Size  | Weight | Letter-spacing |
|---------------|-------------|-------|--------|----------------|
| Hero H1       | Bebas Neue  | 64px  | 400    | 0.04em         |
| Section H2    | Bebas Neue  | 36px  | 400    | 0.05em         |
| Sub-heading H3| Bebas Neue  | 22px  | 400    | 0.06em         |
| Body text     | DM Sans     | 17px  | 400    | normal         |
| Caption/label | DM Sans     | 14px  | 400    | normal         |
| Nav links     | DM Sans     | 13px  | 400    | 0.06em         |

---

## SECTION 5 — BUTTON STYLES

### Primary button (.btn-primary) — cyan fill, used for "Book Us"
```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 2rem;
  background: var(--c-accent);
  color: var(--c-black);
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.05rem;
  letter-spacing: 0.1em;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-decoration: none;
  transition: background var(--t-fast), transform var(--t-fast), box-shadow var(--t-fast);
}
.btn-primary:hover {
  background: var(--c-accent-lt);
  color: var(--c-white);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(255, 45, 155, 0.45);
}
.btn-primary:active {
  transform: translateY(0);
  box-shadow: none;
}
.btn-primary:focus-visible {
  outline: 3px solid var(--c-accent-lt);
  outline-offset: 3px;
}
```

### Ghost button (.btn-ghost) — cyan outline, used for secondary actions
```css
.btn-ghost {
  padding: 0.7rem 1.5rem;
  background: transparent;
  color: var(--c-accent);
  border: 1px solid var(--c-accent);
  border-radius: var(--radius-sm);
  font-family: 'Bebas Neue', sans-serif;
  font-size: 0.95rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  text-decoration: none;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.btn-ghost:hover {
  background: var(--c-accent-dim);
  color: var(--c-accent-lt);
  border-color: var(--c-accent-lt);
}
.btn-ghost:focus-visible {
  outline: 3px solid var(--c-accent-lt);
  outline-offset: 3px;
}
```

---

## SECTION 6 — PAGE SECTIONS (in order, top to bottom)

### Section 0 — Navigation (sticky)
- Sticky, fixed at top, z-index high enough to stay above all content.
- Height: 60px.
- Background: var(--c-ink). Bottom border: 1px solid var(--c-accent).
- Left: band logo/name "Five Dollar Down" in Bebas Neue, var(--c-accent) cyan colour.
- Right: nav links — About · Shows · Media · Songs · Book Us
- "Book Us" styled as .btn-primary (cyan fill button) to always draw the eye.
- All links smooth-scroll to their anchor on the same page.
- Mobile (< 768px): collapse nav links to a hamburger icon.
  Tapping hamburger opens a full-screen overlay menu (dark background, centered links, large text).
  Tapping any link or pressing Escape closes the overlay.
- All sections must use `scroll-margin-top: 60px` so anchor links are not hidden under the nav.

### Section 1 — Hero (full-screen video background)
- Full viewport height (100vh).
- Background: `<video>` element with autoplay muted loop playsinline attributes.
  All four attributes are required — omitting any one will break autoplay on mobile Safari.
- Video file: /assets/video/hero.mp4 (H.264, max 1080p, max 15MB)
- Video must have a `poster` attribute pointing to a still image fallback.
- Dark overlay above video: `background: linear-gradient(160deg, rgba(2,6,8,0.85) 0%, rgba(7,18,24,0.75) 100%)` covering full area.
- Overlay content (centered, text-align center on mobile):
  - H1: "Five Dollar Down" — Bebas Neue, large, white
  - Subheading: "Ottawa's premier party band" — DM Sans, lighter weight, `color: rgba(255,255,255,0.72)`
  - .btn-primary button: "Book Us" — smooth-scrolls to #book-us section

### Section 2 — About the Band
- Background: var(--c-surface)
- Two-column layout on desktop (text left, photos right). Single column on mobile (text above, photos below).
- Left column: band bio text.
  - Paragraph 1: "Our high energy booty shaking song list and scalable show is available for
    your wedding, corporate events, private parties and clubs."
  - Add 1-2 more paragraphs of generic band history placeholder with a TODO comment for the
    band to fill in.
- Right column: two band photos side by side or stacked.
  - Images: /assets/images/band-1.webp and /assets/images/band-2.webp
  - Both images: loading="lazy", descriptive alt text, max-width 100%
  - Small caption under each (venue name, year) — use placeholder text with TODO comment

### Section 3 — Shows (driven entirely by scripts/shows.js)

**IMPORTANT: Do not hardcode any show data in HTML. All shows come from scripts/shows.js.**

The page renders two views from one data source:
1. Upcoming shows — displayed on index.html
2. Past shows — displayed on past-shows.html

Both pages load the same shows.js file. Each page calls a different render function.

#### shows.js structure (the ONLY file that needs editing to add/remove shows):
```javascript
// scripts/shows.js
// FIVE DOLLAR DOWN — MASTER SHOW LIST
// Add shows here. Never edit index.html or past-shows.html for show data.

const SHOWS = [
  {
    date:    "2025-10-18",         // YYYY-MM-DD format — required
    name:    "Harvest Festival",   // Event name — required
    venue:   "The Brass Rail",     // Venue name — required
    city:    "Ottawa, ON",         // City — required
    tickets: ""                    // Ticket URL — empty string if none
  },
  // Add more shows above this line
];

// Do not edit below this line
function splitShows() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = SHOWS
    .filter(s => new Date(s.date + 'T00:00:00') >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = SHOWS
    .filter(s => new Date(s.date + 'T00:00:00') < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return { upcoming, past };
}
```

#### Upcoming shows rendering (index.html):
- Background: var(--c-ink). Section H2 in var(--c-accent).
- Responsive card grid: 3 columns desktop → 2 tablet → 1 mobile.
- Each card contains: event name (bold), venue name, city, date formatted as
  "Saturday, October 18, 2025" (use JS Date formatting, not hardcoded strings).
- "Get Tickets" .btn-ghost button: render ONLY when tickets field is non-empty string.
- Card hover: cyan left border accent (border-left: 3px solid var(--c-accent)).
- Empty state: if no upcoming shows exist, render the message:
  "No shows currently scheduled — check back soon!" centered in the section.
- Below the cards: a "View Past Shows →" link to past-shows.html.

#### Past shows rendering (past-shows.html):
- Shared nav and footer with index.html.
- Past shows sorted descending (most recent first) — already done by splitShows().
- Display as a clean HTML table: Date | Event | Venue | City.
- No cards — a table is appropriate for an archive.

#### Edge case:
A show whose date equals today stays in Upcoming Shows all day, then moves to Past Shows
the following morning. This is correct and intentional.

### Section 4 — Media (videos and photo gallery)

#### Videos sub-section
- Background: var(--c-surface).
- H2 heading: "Watch Us Play"
- Responsive grid: 2 columns desktop → 1 mobile.
- Each embed uses a lazy-load technique: render a YouTube thumbnail image with a play button
  overlay. On click, replace the thumbnail with the actual YouTube iframe.
- This technique is critical for page speed — do NOT embed iframes directly.
- Each video block in HTML:
  ```html
  <div class="yt-embed" data-id="YOUTUBE_VIDEO_ID">
    <!-- JS replaces this with the iframe on click -->
  </div>
  ```
- Use placeholder TODO comments for video IDs since none are provided yet.

#### Photos sub-section
- Background: var(--c-ink).
- H2 heading: "Photos"
- CSS Grid: 4 columns desktop → 3 tablet → 2 mobile.
- Each photo is a `<figure>` element with a hover overlay showing a magnify icon.
- Clicking a photo opens a lightbox. Build lightbox in vanilla JS (~30 lines), no library.
  Lightbox requirements:
  - Dims the page behind the photo
  - Shows the full photo centered
  - Close button (X) in corner
  - Left/right arrow navigation between photos
  - Keyboard support: Escape to close, arrow keys to navigate
  - Touch swipe support on mobile (touchstart/touchend delta)

#### Photo numbering and ordering — CRITICAL:
- Files are named sequentially: show-001.webp, show-002.webp, show-003.webp, etc.
- Numbers ONLY go up. Never renumber or rename existing files.
- The gallery MUST render in DESCENDING numerical order (highest number first, top-left).
- This means the newest photo always appears at the top of the grid automatically.
- Implementation: maintain a GALLERY_PHOTOS array in scripts/gallery.js.
  Sort it by filename in reverse (descending) before rendering to the DOM.

```javascript
// scripts/gallery.js
// Add new photo filenames to the TOP of this array (or let the sort handle it)
const GALLERY_PHOTOS = [
  { src: "assets/gallery/show-003.webp", alt: "Five Dollar Down live at The Brass Rail" },
  { src: "assets/gallery/show-002.webp", alt: "Five Dollar Down performing" },
  { src: "assets/gallery/show-001.webp", alt: "Five Dollar Down on stage" },
];

// Sort descending by filename before render — newest always appears first
const sorted = [...GALLERY_PHOTOS].sort((a, b) => b.src.localeCompare(a.src));
```

- To add photos: drop the new WebP file into /assets/gallery/ with the next number in sequence,
  then add it to the GALLERY_PHOTOS array in gallery.js. The grid renders it at the top.

### Section 5 — Songs We Play (Setlist)
- Background: var(--c-surface).
- H2 heading: "Songs We Play"
- Responsive multi-column grid: 3 columns desktop → 2 tablet → 1 mobile.
- Each song entry (.song-item):
  - Artist name: small, uppercase, var(--c-muted) color
  - Song title: medium weight, var(--c-ink) color
  - Optional era/genre badge (e.g. "80s", "Classic Rock", "Country")
- Use 12-15 placeholder song entries with a TODO comment to replace with real setlist.
  Example placeholder:
  ```html
  <!-- TODO: replace with real setlist -->
  <div class="song-item">
    <span class="song-artist">Bon Jovi</span>
    <span class="song-title">Livin' on a Prayer</span>
    <span class="song-badge">80s Rock</span>
  </div>
  ```
- No links. This section is informational only.

### Section 6 — Book Us (primary CTA)
- Background: var(--c-ink). Cyan accent details throughout. Magenta on hover states.
- Two-column layout desktop: left column is selling copy, right column is the form.
  Single column mobile: copy above, form below.
- Left column content:
  - H2: "Let's Make Your Event Unforgettable"
  - Bullet list (3 items): availability, coverage, what types of events
  - Use TODO placeholder for specific claims — do not invent facts about the band
- Right column: Netlify booking form (full spec in Section 7 below)

### Section 7 — Footer
- Background: var(--c-ink). Top border: 1px solid rgba(0,212,255,0.2).
- Three-column layout desktop → single column stacked on mobile.
- Column 1:
  - Band name: "Five Dollar Down" in Bebas Neue, var(--c-accent)
  - Tagline: "Ottawa's premier party band" — DM Sans, small, muted white
- Column 2:
  - Nav links: About · Shows · Media · Songs · Book Us
  - Each link smooth-scrolls to its section anchor
- Column 3:
  - Social icons (SVG inline — no external image requests):
    - Facebook → https://www.facebook.com/FiveDollarDown
    - Instagram → https://www.instagram.com/fivedollardown
    - YouTube → <!-- TODO: add URL -->
    - TikTok → <!-- TODO: add URL -->
  - All social links: target="_blank" rel="noopener noreferrer"
  - Each icon hover state: colour transitions to var(--c-accent) cyan with var(--t-fast)
  - Direct email: booking@fivedollardown.com as mailto: link
- Bottom bar: copyright line "© [current year] Five Dollar Down. All rights reserved."
  Use JS to insert the current year: `new Date().getFullYear()`

---

## SECTION 7 — BOOK US FORM SPECIFICATION

### Netlify Forms setup
The form must use `data-netlify="true"` — do NOT use Formspree, EmailJS, or any third-party
form service. Netlify handles everything on form submission.

```html
<form
  name="book-us"
  method="POST"
  data-netlify="true"
  data-netlify-honeypot="bot-field"
  action="/thank-you.html"
  novalidate
  id="book-form"
>
  <!-- Required hidden fields for Netlify -->
  <input type="hidden" name="form-name" value="book-us">
  <!-- Honeypot spam trap — hidden from real users, bots fill it in -->
  <input type="text" name="bot-field" style="display:none" tabindex="-1" aria-hidden="true">

  <!-- Visible fields below -->
</form>
```

### Form fields

| #  | Field               | Type     | Name         | Required | Notes                                        |
|----|---------------------|----------|--------------|----------|----------------------------------------------|
| 1  | Full Name           | text     | name         | Yes      | Placeholder: "Your name or organization"     |
| 2  | Email Address       | email    | email        | Yes      | Placeholder: "your@email.com"                |
| 3  | Event Date          | date     | event-date   | Yes      | min attribute set to today via JS            |
| 4  | Phone Number        | tel      | phone        | No       | Placeholder: "Phone (optional)"              |
| 5  | Tell Us About Event | textarea | message      | Yes      | 5 rows min. Placeholder: "Wedding reception for 150 guests, indoor venue, looking for 2 sets of classic rock and country..." |

Every field must have an associated `<label>` with matching `for`/`id` attributes.
Never rely on placeholder text as the only label — this fails accessibility.

### Setting the date minimum via JS:
```javascript
const dateInput = document.getElementById('event-date');
if (dateInput) {
  dateInput.min = new Date().toISOString().split('T')[0];
}
```

### Validation (two layers):
1. HTML5 native: `required` attribute and `type="email"` handle the first pass.
2. Custom JS: on submit, check each required field. If invalid, show an error message
   as a `<span class="field-error">` directly beneath the offending field — not as an alert().
   Clear the error when the user starts typing in that field again.

### Submit button states:
- Default: "Send Booking Inquiry" (using .btn-primary)
- Loading (after click, before response): show spinner + "Sending…" text. Disable the button
  to prevent double-submissions.
- On success: Netlify redirects to /thank-you.html (set via `action` attribute).

### Spam protection:
The honeypot field (bot-field) is sufficient for a band site — no CAPTCHA needed.
Netlify auto-rejects submissions where the honeypot field is populated.

---

## SECTION 8 — FILE STRUCTURE

```
/five-dollar-down/
│
├── index.html              <- Main page — all sections except past shows
├── past-shows.html         <- Past shows archive — shares nav/footer, loads shows.js
├── thank-you.html          <- Post-form confirmation page
├── netlify.toml            <- Cache headers and Netlify config
│
├── styles/
│   ├── tokens.css          <- CSS custom properties (colors, spacing, radius, transitions)
│   ├── main.css            <- Global styles, layout, typography
│   ├── components.css      <- Cards, buttons, nav, footer, badges
│   └── gallery.css         <- Photo grid and lightbox styles
│
├── scripts/
│   ├── shows.js            <- ★ MASTER SHOW LIST — only file to edit for shows
│   ├── main.js             <- Nav toggle, smooth scroll, date min, show renderer
│   ├── gallery.js          <- GALLERY_PHOTOS array, sort logic, lightbox
│   └── youtube.js          <- Lazy YouTube embed (thumbnail → iframe on click)
│
└── assets/
    ├── video/
    │   └── hero.mp4        <- Hero video (H.264, max 1080p, max 15MB)
    ├── images/
    │   ├── band-1.webp     <- About section photo 1
    │   ├── band-2.webp     <- About section photo 2
    │   ├── logo.svg        <- Band logo
    │   └── og-image.jpg    <- Open Graph social preview (1200x630px)
    └── gallery/
        ├── show-001.webp   <- Oldest gallery photo
        ├── show-002.webp
        └── show-NNN.webp   <- Newest — always appears first in gallery grid
```

### netlify.toml (include this exactly):
```toml
[build]
  publish = "."

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

---

## SECTION 9 — CODING CONVENTIONS

### HTML
- Use semantic elements: `<section>`, `<nav>`, `<main>`, `<article>`, `<footer>`, `<header>`
- Every `<img>` must have a descriptive `alt` attribute
- Every `<img>` below the fold must have `loading="lazy"`
- Every section must have an `id` attribute matching its nav anchor link
- Every page must include:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Five Dollar Down — Ottawa's premier party band...">
  ```
- Form inputs must have `<label for="id">` pairs — never use placeholder as the only label

### CSS
- All color and spacing values must use CSS variables — no hardcoded hex outside tokens.css
- Mobile-first: write base styles for small screens, add min-width queries for larger sizes
- Every hover/focus/active state must use a CSS `transition` — no instant changes
- Every interactive element must have a `:focus-visible` outline for keyboard navigation
- Do not use `!important`
- Container max-width: 1140px, centered, with padding: 0 1.5rem on mobile

### JavaScript
- All scripts load at end of `<body>` — never in `<head>`
- All DOM manipulation wrapped in `document.addEventListener('DOMContentLoaded', ...)`
- Always null-check elements before accessing properties: `if (el) { el.classList.add(...) }`
- Use `const` by default, `let` only when reassignment needed, never `var`
- Form error handling: catch errors and display them in the UI as inline field errors,
  not as `alert()` calls or `console.error()` only

### Media
- All photos: WebP format, max 1400px wide, max 300kb per file
- Hero video: MP4 (H.264), max 1080p, max 15MB, must have poster image fallback
- YouTube: lazy-load thumbnails only — never embed iframes directly in initial HTML
- Google Fonts: always use `<link rel="preconnect">` before the font stylesheet link

---

## SECTION 10 — PLANNED OPTIONAL FEATURES (not in initial build)

These are confirmed for a later phase. Do not build them now, but structure the HTML
so adding them won't require restructuring existing sections.

1. **Netlify auto-reply email** — when a booking form is submitted, a Zapier webhook sends
   a confirmation email to the inquirer. Zapier free tier covers this.

2. **FAQ accordion** — CSS-only accordion (no JS). Location: between Book Us and Footer.
   Common questions: equipment provided, set length, request policy, deposit.

3. **SEO / Open Graph** — meta tags for description, keywords, og:title, og:image, og:url.
   Sitemap.xml. Submit to Google Search Console.

---

## SECTION 11 — BUILD ORDER (recommended sequence for agents)

Build and test one file at a time. Do not generate the entire site in one pass.

1. `styles/tokens.css` — all CSS variables
2. `styles/main.css` — global styles, typography, container, section spacing
3. `styles/components.css` — buttons, cards, nav, footer
4. `scripts/shows.js` — data structure and splitShows() function only (no DOM code yet)
5. `index.html` — full page HTML structure with all sections, placeholder content
6. `scripts/main.js` — nav toggle, smooth scroll, date min, show renderer for index.html
7. `past-shows.html` — archive page with past show table renderer
8. `styles/gallery.css` — photo grid and lightbox styles
9. `scripts/gallery.js` — GALLERY_PHOTOS array, sort, lightbox open/close/keyboard/swipe
10. `scripts/youtube.js` — lazy embed loader
11. `thank-you.html` — post-form confirmation page
12. `netlify.toml` — cache headers

After each file: verify it renders correctly in a browser before proceeding to the next.
