// scripts/gallery.js
// Five Dollar Down — Gallery photos and lightbox
//
// ─── To add new photos ───────────────────────────────────────────────────────
// Regular photos: drop show-NNN.webp/jpg into assets/gallery/ (next number in sequence)
// Pinned photos:  name the file pinned-<anything>.webp/jpg — they always appear first
// Push to GitHub — Netlify build regenerates gallery-manifest.json automatically
// No other changes needed.
//
// Optional: add a custom alt text entry to PHOTO_ALTS below by photo number.
// ─────────────────────────────────────────────────────────────────────────────

// Optional custom alt text by photo number. Any photo not listed gets a default.
const PHOTO_ALTS = {
  '001': 'Five Dollar Down on stage at Ladies Night',
  '002': 'Five Dollar Down at Ladies Night',
  '003': 'Eric and Pete at Ladies Night',
  '004': 'Crowd at Homestead Pub',
  '005': 'Five Dollar Down wide shot at Mom Prom',
  '006': 'Pete and Mike with a cake on stage',
  '007': 'Eric and Pete at Mom Prom',
  '008': 'Mike dressed up on stage',
  '009': 'Five Dollar Down performing at Ladies Night',
  '010': 'Crowd interaction at a Five Dollar Down show',
  '011': 'Five Dollar Down merch',
  '012': 'Five Dollar Down at Mom Prom',
  '013': 'Five Dollar Down Halloween show',
  '014': 'Five Dollar Down band shot at Mom Prom',
  '015': 'Pete on stage',
  '016': 'Eric on acoustic guitar',
};

document.addEventListener('DOMContentLoaded', () => {

  const container = document.getElementById('gallery-container');
  if (!container) return;

  fetch('gallery-manifest.json')
    .then(r => r.json())
    .then(manifest => {
      const photos = manifest.map(entry => ({
        src: entry.src,
        alt: PHOTO_ALTS[entry.num] || `Five Dollar Down live`,
        pinned: entry.pinned || false,
      }));
      renderGallery(container, photos);
    })
    .catch(() => {
      container.innerHTML = `<p style="color:var(--c-muted);text-align:center;padding:2rem 0">Photos coming soon.</p>`;
    });

});

function renderGallery(container, allPhotos) {

  if (allPhotos.length === 0) {
    container.innerHTML = `<p style="color:var(--c-muted);text-align:center;padding:2rem 0">Photos coming soon.</p>`;
    return;
  }

  // Limit to preview count if set (e.g. data-preview="6" on index.html)
  const isDesktop      = window.matchMedia('(min-width: 1024px)').matches;
  const previewAttr    = isDesktop && container.dataset.previewDesktop
                           ? container.dataset.previewDesktop
                           : container.dataset.preview;
  const photosToRender = previewAttr ? allPhotos.slice(0, parseInt(previewAttr, 10)) : allPhotos;

  // ─── Render grid ──────────────────────────────────────
  photosToRender.forEach((photo, index) => {
    const fig = document.createElement('figure');
    fig.className = 'gallery-item';
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', `View photo: ${photo.alt}`);
    fig.dataset.index = index;

    fig.innerHTML = `
      <img
        src="${photo.src}"
        alt="${photo.alt}"
        loading="lazy"
        width="400"
        height="300"
      >
      <div class="gallery-overlay" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </div>
    `;

    fig.addEventListener('click',   () => openLightbox(index));
    fig.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(index); } });

    container.appendChild(fig);
  });

  // ─── Lightbox ─────────────────────────────────────────
  let currentIndex = 0;

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Photo viewer');
  lightbox.innerHTML = `
    <div class="lightbox-backdrop"></div>
    <div class="lightbox-content">
      <button class="lightbox-close" aria-label="Close photo viewer">&#x2715;</button>
      <button class="lightbox-prev" aria-label="Previous photo">&#8592;</button>
      <img class="lightbox-img" src="" alt="">
      <button class="lightbox-next" aria-label="Next photo">&#8594;</button>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lbImg      = lightbox.querySelector('.lightbox-img');
  const lbClose    = lightbox.querySelector('.lightbox-close');
  const lbPrev     = lightbox.querySelector('.lightbox-prev');
  const lbNext     = lightbox.querySelector('.lightbox-next');
  const lbBackdrop = lightbox.querySelector('.lightbox-backdrop');

  function openLightbox(index) {
    currentIndex = index;
    showPhoto(currentIndex);
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    const trigger = container.querySelector(`[data-index="${currentIndex}"]`);
    if (trigger) trigger.focus();
  }

  function showPhoto(index) {
    const photo = photosToRender[index];
    if (!photo) return;
    lbImg.src = photo.src;
    lbImg.alt = photo.alt;
    lbPrev.style.visibility = index > 0 ? 'visible' : 'hidden';
    lbNext.style.visibility = index < photosToRender.length - 1 ? 'visible' : 'hidden';
  }

  function prevPhoto() {
    if (currentIndex > 0) { currentIndex--; showPhoto(currentIndex); }
  }

  function nextPhoto() {
    if (currentIndex < photosToRender.length - 1) { currentIndex++; showPhoto(currentIndex); }
  }

  lbClose.addEventListener('click', closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', prevPhoto);
  lbNext.addEventListener('click', nextPhoto);

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
  });

  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) { delta < 0 ? nextPhoto() : prevPhoto(); }
  });
}
