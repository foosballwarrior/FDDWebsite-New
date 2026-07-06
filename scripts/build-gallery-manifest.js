// scripts/build-gallery-manifest.js
// Runs at build time (via netlify.toml) — not in the browser.
// Scans assets/gallery/ for show-NNN.webp files, generates grid thumbnails
// into assets/gallery/thumbs/, and writes gallery-manifest.json.
// To add photos: drop show-NNN.webp into assets/gallery/ and push to GitHub.
//
// Thumbnails are only generated when missing, so committing them keeps
// Netlify builds fast and protects deploys if sharp ever fails to install.
// NOTE: /assets/* is served with immutable caching — never regenerate a thumb
// under the same filename with different content; delete and rename instead.

const fs   = require('fs');
const path = require('path');

const galleryDir   = path.join(__dirname, '..', 'assets', 'gallery');
const thumbsDir    = path.join(galleryDir, 'thumbs');
const manifestPath = path.join(__dirname, '..', 'gallery-manifest.json');

const THUMB_WIDTHS = [400, 800];
const THUMB_QUALITY = 72;

const allFiles = fs.readdirSync(galleryDir);

const pinnedFiles = allFiles
  .filter(f => /^pinned-.+\.(webp|jpg|jpeg)$/i.test(f))
  .sort((a, b) => a.localeCompare(b)); // ascending — predictable order

const regularFiles = allFiles
  .filter(f => /^show-\d{3}\.(webp|jpg|jpeg)$/i.test(f))
  .sort((a, b) => b.localeCompare(a)); // descending — newest first

async function generateThumbs(files) {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (err) {
    console.warn('sharp unavailable — skipping thumbnail generation:', err.message);
    return {};
  }

  fs.mkdirSync(thumbsDir, { recursive: true });

  const thumbMap = {}; // filename -> { thumb, thumb2x }
  for (const f of files) {
    const base = f.replace(/\.(webp|jpg|jpeg)$/i, '');
    const paths = {};
    for (const width of THUMB_WIDTHS) {
      const thumbName = `${base}-${width}.webp`;
      const thumbPath = path.join(thumbsDir, thumbName);
      try {
        if (!fs.existsSync(thumbPath)) {
          await sharp(path.join(galleryDir, f))
            .resize({ width, withoutEnlargement: true })
            .webp({ quality: THUMB_QUALITY })
            .toFile(thumbPath);
          console.log(`Generated ${thumbName}`);
        }
        paths[width] = `assets/gallery/thumbs/${thumbName}`;
      } catch (err) {
        console.warn(`Thumb failed for ${f} @${width}:`, err.message);
      }
    }
    if (paths[400]) {
      thumbMap[f] = { thumb: paths[400], thumb2x: paths[800] || paths[400] };
    }
  }
  return thumbMap;
}

(async () => {
  const sourceFiles = [...pinnedFiles, ...regularFiles];
  const thumbMap = await generateThumbs(sourceFiles);

  const entry = (f, pinned) => {
    const src = `assets/gallery/${f}`;
    const thumbs = thumbMap[f] || { thumb: src, thumb2x: src }; // fall back to full-res
    return {
      src,
      thumb: thumbs.thumb,
      thumb2x: thumbs.thumb2x,
      num: f.replace(/^(pinned-|show-)/, '').replace(/\.(webp|jpg|jpeg)$/i, ''),
      pinned,
    };
  };

  const manifest = [
    ...pinnedFiles.map(f => entry(f, true)),
    ...regularFiles.map(f => entry(f, false)),
  ];

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Gallery manifest written: ${manifest.length} photos`);
})();
