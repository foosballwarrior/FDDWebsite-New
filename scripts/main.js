// scripts/main.js
// Five Dollar Down — Nav, smooth scroll, show renderer, form logic

document.addEventListener('DOMContentLoaded', () => {

  // ─── Navigation: hamburger / overlay ──────────────────
  const hamburger = document.querySelector('.nav-hamburger');
  const overlay   = document.getElementById('nav-overlay');
  const overlayClose = overlay && overlay.querySelector('.nav-overlay-close');
  const overlayLinks = overlay && overlay.querySelectorAll('a');

  function openMenu() {
    if (!overlay || !hamburger) return;
    overlay.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    overlayClose && overlayClose.focus();
  }

  function closeMenu() {
    if (!overlay || !hamburger) return;
    overlay.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.focus();
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      overlay && overlay.classList.contains('is-open') ? closeMenu() : openMenu();
    });
  }

  if (overlayClose) {
    overlayClose.addEventListener('click', closeMenu);
  }

  if (overlayLinks) {
    overlayLinks.forEach(link => link.addEventListener('click', closeMenu));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // ─── Set event date minimum to today ──────────────────
  const dateInput = document.getElementById('event-date');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  // ─── Render upcoming shows ─────────────────────────────
  const showsContainer = document.getElementById('shows-container');

  if (showsContainer && typeof splitShows === 'function') {
    const { upcoming } = splitShows();

    if (upcoming.length === 0) {
      showsContainer.innerHTML = `
        <p class="shows-empty">No shows currently scheduled — check back soon!</p>
      `;
    } else {
      const grid = document.createElement('div');
      grid.className = 'shows-grid';

      upcoming.forEach(show => {
        const dateObj = new Date(show.date + 'T00:00:00');
        const formatted = dateObj.toLocaleDateString('en-CA', {
          weekday: 'long',
          year:    'numeric',
          month:   'long',
          day:     'numeric',
        });

        const ticketsBtn = show.tickets
          ? `<a href="${show.tickets}" class="btn-ghost" target="_blank" rel="noopener noreferrer">Get Tickets</a>`
          : '';

        const card = document.createElement('div');
        card.className = 'show-card';
        card.innerHTML = `
          <div class="show-card-name">${show.name}</div>
          <div class="show-card-city">${show.city}</div>
          <div class="show-card-date">${formatted}</div>
          ${ticketsBtn}
        `;
        grid.appendChild(card);
      });

      showsContainer.appendChild(grid);
    }
  }

  // ─── Render songs ─────────────────────────────────────
  const songsContainer = document.getElementById('songs-container');

  if (songsContainer && typeof getDisplaySongs === 'function') {
    getDisplaySongs().forEach(song => {
      const item = document.createElement('div');
      item.className = 'song-item';
      item.innerHTML = `
        <span class="song-artist">${song.artist}</span>
        <span class="song-title">${song.title}</span>
        <span class="song-badge">${song.badge}</span>
      `;
      songsContainer.appendChild(item);
    });
  }

  // ─── Copyright year ────────────────────────────────────
  const copyright = document.getElementById('copyright');
  if (copyright) {
    copyright.textContent = `© ${new Date().getFullYear()} Five Dollar Down. All rights reserved.`;
  }

  // ─── Booking form validation ───────────────────────────
  const form = document.getElementById('book-form');

  if (form) {
    const fields = [
      { id: 'name',       errorId: 'name-error',       msg: 'Please enter your name or organization.' },
      { id: 'email',      errorId: 'email-error',      msg: 'Please enter a valid email address.' },
      { id: 'event-date', errorId: 'event-date-error', msg: 'Please select an event date.' },
      { id: 'message',    errorId: 'message-error',    msg: 'Please tell us about your event.' },
    ];

    // Clear error on input
    fields.forEach(({ id, errorId }) => {
      const input = document.getElementById(id);
      const errorEl = document.getElementById(errorId);
      if (input && errorEl) {
        input.addEventListener('input', () => {
          errorEl.textContent = '';
          errorEl.classList.remove('is-visible');
          input.removeAttribute('aria-invalid');
        });
      }
    });

    form.addEventListener('submit', (e) => {
      let hasError = false;

      fields.forEach(({ id, errorId, msg }) => {
        const input = document.getElementById(id);
        const errorEl = document.getElementById(errorId);
        if (!input || !errorEl) return;

        const invalid =
          !input.value.trim() ||
          (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));

        if (invalid) {
          errorEl.textContent = msg;
          errorEl.classList.add('is-visible');
          input.setAttribute('aria-invalid', 'true');
          if (!hasError) {
            input.focus();
            hasError = true;
          }
        }
      });

      if (hasError) {
        e.preventDefault();
        return;
      }

      // Show loading state
      const btn     = form.querySelector('.btn-submit');
      const spinner = document.getElementById('btn-spinner');
      const label   = document.getElementById('btn-label');

      if (btn)     btn.disabled = true;
      if (spinner) spinner.classList.add('is-visible');
      if (label)   label.textContent = 'Sending…';
    });
  }

});
