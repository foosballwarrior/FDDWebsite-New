// scripts/build-gallery-manifest.js
// Runs at build time (via netlify.toml) — not in the browser.
// Scans assets/gallery/ for show-NNN.webp files, writes gallery-manifest.json.
// To add photos: drop show-NNN.webp into assets/gallery/ and push to GitHub.

const fs   = require('fs');
const path = require('path');

const galleryDir   = path.join(__dirname, '..', 'assets', 'gallery');
const manifestPath = path.join(__dirname, '..', 'gallery-manifest.json');

const allFiles = fs.readdirSync(galleryDir);

const pinnedFiles = allFiles
  .filter(f => /^pinned-.+\.(webp|jpg|jpeg)$/i.test(f))
  .sort((a, b) => a.localeCompare(b)); // ascending — predictable order

const regularFiles = allFiles
  .filter(f => /^show-\d{3}\.(webp|jpg|jpeg)$/i.test(f))
  .sort((a, b) => b.localeCompare(a)); // descending — newest first

const manifest = [
  ...pinnedFiles.map(f => ({
    src: `assets/gallery/${f}`,
    num: f.replace(/^pinned-/, '').replace(/\.(webp|jpg|jpeg)$/i, ''),
    pinned: true,
  })),
  ...regularFiles.map(f => ({
    src: `assets/gallery/${f}`,
    num: f.replace(/^show-/, '').replace(/\.(webp|jpg|jpeg)$/i, ''),
    pinned: false,
  })),
];

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Gallery manifest written: ${manifest.length} photos`);
