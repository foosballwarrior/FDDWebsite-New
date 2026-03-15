// scripts/youtube.js
// Five Dollar Down — Lazy YouTube embed (thumbnail → iframe on click)

document.addEventListener('DOMContentLoaded', () => {

  const embeds = document.querySelectorAll('.yt-embed[data-id]');

  embeds.forEach(embed => {
    const videoId = embed.dataset.id && embed.dataset.id.trim();

    // Skip placeholder TODOs
    if (!videoId || videoId.startsWith('<!--')) {
      embed.style.display = 'none';
      return;
    }

    const isVertical = embed.dataset.orientation === 'vertical';
    // maxresdefault gives best quality; fall back to hqdefault if not available
    const thumbUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const thumbW = isVertical ? 270 : 480;
    const thumbH = isVertical ? 480 : 270;

    embed.innerHTML = `
      <div class="yt-thumb" role="button" tabindex="0" aria-label="Play video on YouTube">
        <img src="${thumbUrl}" alt="Five Dollar Down live video" loading="lazy" width="${thumbW}" height="${thumbH}">
        <div class="yt-play-btn" aria-hidden="true">
          <svg viewBox="0 0 68 48" width="68" height="48">
            <path class="yt-play-bg" d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74 0 13.05 0 24 0 24s0 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C68 34.95 68 24 68 24s0-10.95-1.48-16.26z"/>
            <path class="yt-play-arrow" d="M45 24 27 14v20"/>
          </svg>
        </div>
      </div>
    `;

    function loadIframe() {
      embed.innerHTML = `
        <iframe
          src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1"
          title="Five Dollar Down live video"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      `;
    }

    const thumb = embed.querySelector('.yt-thumb');
    if (thumb) {
      thumb.addEventListener('click', loadIframe);
      thumb.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadIframe(); }
      });
    }
  });

});
