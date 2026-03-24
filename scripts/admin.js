// scripts/admin.js
// Five Dollar Down — Admin dashboard
// Lists, previews, renames, downloads, and deletes files in the S3 bucket.

(function () {
  'use strict';

  const API_URL = '/.netlify/functions/s3';

  // ─── State ──────────────────────────────────────────────────────────────────

  const state = {
    username: sessionStorage.getItem('adminUsername') || null,
    password: sessionStorage.getItem('adminPassword') || null,
    files: [],
    loading: false,
    nextToken: null,
    isTruncated: false,
    renameKey: null,       // key currently being renamed
    viewMode: 'grid',      // 'list' | 'grid'
  };

  // ─── API ────────────────────────────────────────────────────────────────────

  async function callAPI(action, body = {}) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, adminUsername: state.username, adminPassword: state.password, ...body }),
    });
    const data = await res.json();
    if (res.status === 401) {
      clearAuth();
      showAuth();
      throw new Error('Unauthorized');
    }
    if (!data.ok) throw new Error(data.error || 'API error');
    return data;
  }

  // ─── Auth ────────────────────────────────────────────────────────────────────

  function clearAuth() {
    state.username = null;
    state.password = null;
    sessionStorage.removeItem('adminUsername');
    sessionStorage.removeItem('adminPassword');
  }

  function showAuth() {
    document.getElementById('admin-auth').style.display = '';
    document.getElementById('admin-dashboard').style.display = 'none';
  }

  function showDashboard() {
    document.getElementById('admin-auth').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = '';
    loadFiles(false);
  }

  // ─── File helpers ────────────────────────────────────────────────────────────

  const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i;
  const VIDEO_EXTS = /\.(mp4|webm|mov|avi|mkv|m4v|ogv)$/i;

  function getFileType(key) {
    if (IMAGE_EXTS.test(key)) return 'image';
    if (VIDEO_EXTS.test(key)) return 'video';
    return 'file';
  }

  function basename(key) {
    return key.split('/').pop();
  }

  function fmtBytes(n) {
    if (n == null) return '—';
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-CA', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  // ─── Load files ──────────────────────────────────────────────────────────────

  async function loadFiles(append = false) {
    if (state.loading) return;
    state.loading = true;
    setStatus('Loading…');

    try {
      const body = { prefix: 'uploads/' };
      if (append && state.nextToken) body.continuationToken = state.nextToken;

      const data = await callAPI('list-objects', body);

      if (append) {
        state.files = state.files.concat(data.files);
      } else {
        state.files = data.files;
      }

      state.nextToken = data.nextContinuationToken || null;
      state.isTruncated = data.isTruncated || false;

      renderFileList();
      setStatus(
        state.files.length === 0
          ? 'No files uploaded yet.'
          : `${state.files.length} file${state.files.length !== 1 ? 's' : ''}${state.isTruncated ? '+' : ''}`
      );
    } catch (e) {
      if (e.message !== 'Unauthorized') setStatus(`Error: ${e.message}`);
    } finally {
      state.loading = false;
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  function setStatus(msg) {
    document.getElementById('admin-status').textContent = msg;
  }

  function renderFileList() {
    const isGrid = state.viewMode === 'grid';

    document.getElementById('admin-thumb-wrap').style.display  = isGrid ? '' : 'none';
    document.getElementById('admin-table-wrap').style.display  = isGrid ? 'none' : '';
    document.getElementById('admin-cards-wrap').style.display  = isGrid ? 'none' : '';

    if (isGrid) {
      renderThumbGrid();
    } else {
      renderTable();
      renderCards();
    }

    const loadMoreEl = document.getElementById('admin-load-more');
    loadMoreEl.hidden = !state.isTruncated;
  }

  function renderTable() {
    const tbody = document.getElementById('admin-tbody');
    tbody.innerHTML = '';

    if (state.files.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="5" class="admin-empty">No files found.</td>`;
      tbody.appendChild(tr);
      return;
    }

    state.files.forEach(file => {
      const tr = document.createElement('tr');
      tr.dataset.key = file.key;
      tr.innerHTML = `
        <td class="col-name" title="${escHtml(file.key)}">${escHtml(basename(file.key))}</td>
        <td class="col-type">${getFileType(file.key)}</td>
        <td class="col-size">${fmtBytes(file.size)}</td>
        <td class="col-date">${fmtDate(file.lastModified)}</td>
        <td class="col-actions">${actionButtons(file.key)}</td>
      `;
      attachRowHandlers(tr, file.key);
      tbody.appendChild(tr);
    });
  }

  function renderCards() {
    const cards = document.getElementById('admin-cards');
    cards.innerHTML = '';

    if (state.files.length === 0) {
      cards.innerHTML = `<div class="admin-empty">No files found.</div>`;
      return;
    }

    state.files.forEach(file => {
      const div = document.createElement('div');
      div.className = 'admin-card';
      div.dataset.key = file.key;
      div.innerHTML = `
        <div class="admin-card-name">${escHtml(basename(file.key))}</div>
        <div class="admin-card-meta">${getFileType(file.key)} · ${fmtBytes(file.size)} · ${fmtDate(file.lastModified)}</div>
        <div class="admin-card-actions">${actionButtons(file.key)}</div>
      `;
      attachRowHandlers(div, file.key);
      cards.appendChild(div);
    });
  }

  // ─── Thumbnail grid ────────────────────────────────────────────────────────

  let thumbObserver = null;

  function renderThumbGrid() {
    const grid = document.getElementById('admin-thumb-grid');
    grid.innerHTML = '';

    if (thumbObserver) { thumbObserver.disconnect(); thumbObserver = null; }

    if (state.files.length === 0) {
      grid.innerHTML = `<div class="admin-empty">No files found.</div>`;
      return;
    }

    thumbObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        thumbObserver.unobserve(entry.target);
        loadThumb(entry.target);
      });
    }, { rootMargin: '100px' });

    state.files.forEach(file => {
      const type = getFileType(file.key);
      const card = document.createElement('div');
      card.className = 'admin-thumb-card';
      card.dataset.key = file.key;

      const mediaHtml = (type === 'image' || type === 'video')
        ? `<div class="admin-thumb-media" data-key="${escAttr(file.key)}" data-type="${type}">
             <div class="thumb-loading"></div>
           </div>`
        : `<div class="admin-thumb-media">
             <div class="thumb-placeholder">
               ${imageIcon()}
               <span>File</span>
             </div>
           </div>`;

      card.innerHTML = `
        ${mediaHtml}
        <div class="admin-thumb-info">
          <div class="admin-thumb-name" title="${escAttr(basename(file.key))}">${escHtml(basename(file.key))}</div>
          <div class="admin-thumb-meta">${fmtBytes(file.size)}</div>
        </div>
        <div class="admin-thumb-actions">
          ${type === 'image' || type === 'video' ? `<button class="admin-action-btn js-preview" data-key="${escAttr(file.key)}">Preview</button>` : ''}
          <button class="admin-action-btn js-download" data-key="${escAttr(file.key)}">Download</button>
          <button class="admin-action-btn js-rename" data-key="${escAttr(file.key)}">Rename</button>
          <button class="admin-action-btn is-danger js-delete" data-key="${escAttr(file.key)}">Delete</button>
        </div>
      `;

      attachRowHandlers(card, file.key);
      grid.appendChild(card);

      // Observe image and video cards for lazy thumbnail loading
      if (type === 'image' || type === 'video') {
        thumbObserver.observe(card.querySelector('.admin-thumb-media[data-key]'));
      }
    });
  }

  async function loadThumb(mediaEl) {
    const key  = mediaEl.dataset.key;
    const type = mediaEl.dataset.type;
    try {
      const { url } = await callAPI('get-presigned-url', { key, expiresIn: 3600 });
      if (type === 'image') {
        loadImageThumb(mediaEl, url, key);
      } else if (type === 'video') {
        loadVideoThumb(mediaEl, url, key);
      }
    } catch {
      mediaEl.innerHTML = `<div class="thumb-placeholder">${type === 'video' ? videoIcon() : imageIcon()}<span>Error</span></div>`;
    }
  }

  function loadImageThumb(mediaEl, url, key) {
    const img = document.createElement('img');
    img.alt = basename(key);
    img.onload = () => { mediaEl.innerHTML = ''; mediaEl.appendChild(img); };
    img.onerror = () => { mediaEl.innerHTML = `<div class="thumb-placeholder">${imageIcon()}<span>Error</span></div>`; };
    img.src = url;
  }

  function loadVideoThumb(mediaEl, url, key) {
    const video  = document.createElement('video');
    const canvas = document.createElement('canvas');

    video.muted        = true;
    video.preload      = 'metadata';
    video.style.display = 'none';
    document.body.appendChild(video);

    video.addEventListener('loadedmetadata', () => {
      video.currentTime = Math.min(1, video.duration * 0.1);
    }, { once: true });

    video.addEventListener('seeked', () => {
      try {
        canvas.width  = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = document.createElement('img');
        img.alt = basename(key);
        img.src = canvas.toDataURL('image/jpeg', 0.8);
        mediaEl.innerHTML = '';
        mediaEl.appendChild(img);
      } catch {
        mediaEl.innerHTML = `<div class="thumb-placeholder">${videoIcon()}<span>Video</span></div>`;
      }
      video.remove();
    }, { once: true });

    video.addEventListener('error', () => {
      mediaEl.innerHTML = `<div class="thumb-placeholder">${videoIcon()}<span>Video</span></div>`;
      video.remove();
    }, { once: true });

    video.src = url;
  }

  function videoIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>`;
  }

  function imageIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>`;
  }

  function actionButtons(key) {
    const type = getFileType(key);
    const previewable = type === 'image' || type === 'video';
    return `
      ${previewable ? `<button class="admin-action-btn js-preview" data-key="${escAttr(key)}">Preview</button>` : ''}
      <button class="admin-action-btn js-download" data-key="${escAttr(key)}">Download</button>
      <button class="admin-action-btn js-rename" data-key="${escAttr(key)}">Rename</button>
      <button class="admin-action-btn is-danger js-delete" data-key="${escAttr(key)}">Delete</button>
    `;
  }

  function attachRowHandlers(el, key) {
    el.querySelector('.js-preview')?.addEventListener('click', () => previewFile(key));
    el.querySelector('.js-download')?.addEventListener('click', () => downloadFile(key));
    el.querySelector('.js-rename')?.addEventListener('click', () => openRenameModal(key));
    el.querySelector('.js-delete')?.addEventListener('click', (e) => showDeleteConfirm(e.currentTarget, key));
  }

  // ─── Preview ─────────────────────────────────────────────────────────────────

  async function previewFile(key) {
    const modal    = document.getElementById('admin-preview-modal');
    const mediaEl  = document.getElementById('preview-media');
    const fnameEl  = document.getElementById('preview-filename');

    mediaEl.innerHTML = '<p style="color:var(--c-muted);padding:2rem;">Loading…</p>';
    fnameEl.textContent = basename(key);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    try {
      const { url } = await callAPI('get-presigned-url', { key });
      const type = getFileType(key);

      if (type === 'image') {
        const img = document.createElement('img');
        img.src = url;
        img.alt = basename(key);
        mediaEl.innerHTML = '';
        mediaEl.appendChild(img);
      } else if (type === 'video') {
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        video.autoplay = false;
        video.style.maxWidth = '100%';
        mediaEl.innerHTML = '';
        mediaEl.appendChild(video);
      }
    } catch (e) {
      mediaEl.innerHTML = `<p style="color:#e07070;padding:2rem;">Failed to load preview: ${escHtml(e.message)}</p>`;
    }
  }

  function closePreviewModal() {
    const modal   = document.getElementById('admin-preview-modal');
    const mediaEl = document.getElementById('preview-media');
    modal.hidden  = true;
    document.body.style.overflow = '';
    // Stop any playing video and release URL
    const video = mediaEl.querySelector('video');
    if (video) { video.pause(); video.src = ''; }
    mediaEl.innerHTML = '';
  }

  // ─── Download ────────────────────────────────────────────────────────────────

  async function downloadFile(key) {
    try {
      const { url } = await callAPI('get-presigned-url', { key, expiresIn: 300 });
      const a = document.createElement('a');
      a.href = url;
      a.download = basename(key);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 1000);
    } catch (e) {
      alert(`Download failed: ${e.message}`);
    }
  }

  // ─── Rename ──────────────────────────────────────────────────────────────────

  function openRenameModal(key) {
    state.renameKey = key;
    const modal   = document.getElementById('admin-rename-modal');
    const input   = document.getElementById('rename-input');
    const errorEl = document.getElementById('rename-error');

    // Pre-fill with current basename (without prefix)
    input.value = basename(key);
    errorEl.textContent = '';
    errorEl.classList.remove('is-visible');

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    input.focus();
    input.select();
  }

  function closeRenameModal() {
    document.getElementById('admin-rename-modal').hidden = true;
    document.body.style.overflow = '';
    state.renameKey = null;
  }

  async function confirmRename() {
    const input   = document.getElementById('rename-input');
    const errorEl = document.getElementById('rename-error');
    const btn     = document.getElementById('rename-confirm-btn');

    const sourceKey = state.renameKey;
    if (!sourceKey) return;

    let newName = input.value.trim();
    if (!newName) {
      errorEl.textContent = 'Please enter a filename.';
      errorEl.classList.add('is-visible');
      input.focus();
      return;
    }

    // Preserve original extension if user didn't include one
    const origExt = sourceKey.split('.').pop();
    if (!newName.includes('.') && origExt && origExt !== sourceKey.split('/').pop()) {
      newName = `${newName}.${origExt}`;
    }

    // Build destination key (keep same prefix)
    const prefix = sourceKey.substring(0, sourceKey.lastIndexOf('/') + 1);
    const destKey = prefix + newName;

    if (destKey === sourceKey) {
      closeRenameModal();
      return;
    }

    btn.disabled = true;
    errorEl.textContent = '';
    errorEl.classList.remove('is-visible');

    try {
      await callAPI('rename-object', { sourceKey, destKey });

      // Update local state
      const idx = state.files.findIndex(f => f.key === sourceKey);
      if (idx !== -1) state.files[idx].key = destKey;
      renderFileList();
      closeRenameModal();
    } catch (e) {
      errorEl.textContent = `Rename failed: ${e.message}`;
      errorEl.classList.add('is-visible');
    } finally {
      btn.disabled = false;
    }
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────

  function showDeleteConfirm(originalBtn, key) {
    // Replace the Delete button with an inline confirm widget
    const confirm = document.createElement('span');
    confirm.className = 'admin-delete-confirm';
    confirm.innerHTML = `
      Delete?
      <button class="confirm-yes" type="button">Yes</button>
      <button class="confirm-no" type="button">No</button>
    `;
    originalBtn.replaceWith(confirm);

    confirm.querySelector('.confirm-yes').addEventListener('click', async () => {
      confirm.innerHTML = 'Deleting…';
      try {
        await callAPI('delete-object', { key });
        state.files = state.files.filter(f => f.key !== key);
        renderFileList();
        setStatus(`${state.files.length} file${state.files.length !== 1 ? 's' : ''}`);
      } catch (e) {
        confirm.innerHTML = `<span style="color:#e07070">Error: ${escHtml(e.message)}</span>`;
      }
    });

    confirm.querySelector('.confirm-no').addEventListener('click', () => {
      // Restore the original delete button
      const newBtn = document.createElement('button');
      newBtn.className = 'admin-action-btn is-danger js-delete';
      newBtn.dataset.key = key;
      newBtn.textContent = 'Delete';
      newBtn.addEventListener('click', (e) => showDeleteConfirm(e.currentTarget, key));
      confirm.replaceWith(newBtn);
    });
  }

  // ─── XSS helpers ─────────────────────────────────────────────────────────────

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escAttr(str) {
    return escHtml(str);
  }

  // ─── Event bindings ──────────────────────────────────────────────────────────

  // Login
  document.getElementById('admin-login-btn').addEventListener('click', async () => {
    const user    = document.getElementById('admin-user').value.trim();
    const pw      = document.getElementById('admin-pw').value;
    const errorEl = document.getElementById('admin-pw-error');
    const spinner = document.getElementById('admin-spinner');
    const label   = document.getElementById('admin-login-label');
    const btn     = document.getElementById('admin-login-btn');

    if (!user || !pw) {
      errorEl.textContent = 'Please enter your username and password.';
      errorEl.classList.add('is-visible');
      return;
    }

    errorEl.textContent = '';
    errorEl.classList.remove('is-visible');
    btn.disabled = true;
    spinner.classList.add('is-visible');
    label.textContent = 'Logging in…';

    state.username = user;
    state.password = pw;

    try {
      // Test credentials by listing objects (small call)
      console.log('[admin] attempting login...');
      const result = await callAPI('list-objects', { prefix: 'uploads/' });
      console.log('[admin] login success, files:', result.files.length);
      sessionStorage.setItem('adminUsername', user);
      sessionStorage.setItem('adminPassword', pw);
      showDashboard();
    } catch (e) {
      console.error('[admin] login error:', e);
      if (e.message === 'Unauthorized') {
        state.username = null;
        state.password = null;
        errorEl.textContent = 'Incorrect username or password.';
        errorEl.classList.add('is-visible');
        document.getElementById('admin-user').focus();
      } else {
        errorEl.textContent = `Error: ${e.message}`;
        errorEl.classList.add('is-visible');
      }
    } finally {
      btn.disabled = false;
      spinner.classList.remove('is-visible');
      label.textContent = 'Login';
    }
  });

  document.getElementById('admin-user').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('admin-pw').focus();
  });

  document.getElementById('admin-pw').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('admin-login-btn').click();
  });

  // Logout
  document.getElementById('admin-logout-btn').addEventListener('click', () => {
    clearAuth();
    showAuth();
    document.getElementById('admin-user').value = '';
    document.getElementById('admin-pw').value = '';
  });

  // View toggle
  document.getElementById('view-list-btn').addEventListener('click', () => {
    state.viewMode = 'list';
    document.getElementById('view-list-btn').classList.add('is-active');
    document.getElementById('view-list-btn').setAttribute('aria-pressed', 'true');
    document.getElementById('view-grid-btn').classList.remove('is-active');
    document.getElementById('view-grid-btn').setAttribute('aria-pressed', 'false');
    renderFileList();
  });

  document.getElementById('view-grid-btn').addEventListener('click', () => {
    state.viewMode = 'grid';
    document.getElementById('view-grid-btn').classList.add('is-active');
    document.getElementById('view-grid-btn').setAttribute('aria-pressed', 'true');
    document.getElementById('view-list-btn').classList.remove('is-active');
    document.getElementById('view-list-btn').setAttribute('aria-pressed', 'false');
    renderFileList();
  });

  // Refresh
  document.getElementById('admin-refresh-btn').addEventListener('click', () => {
    state.nextToken = null;
    loadFiles(false);
  });

  // Load more
  document.getElementById('admin-load-more-btn').addEventListener('click', () => {
    loadFiles(true);
  });

  // Preview modal close
  document.getElementById('preview-close').addEventListener('click', closePreviewModal);
  document.getElementById('preview-backdrop').addEventListener('click', closePreviewModal);

  // Rename modal
  document.getElementById('rename-close').addEventListener('click', closeRenameModal);
  document.getElementById('rename-backdrop').addEventListener('click', closeRenameModal);
  document.getElementById('rename-cancel-btn').addEventListener('click', closeRenameModal);
  document.getElementById('rename-confirm-btn').addEventListener('click', confirmRename);
  document.getElementById('rename-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmRename();
    if (e.key === 'Escape') closeRenameModal();
  });

  // Escape key closes any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!document.getElementById('admin-preview-modal').hidden) closePreviewModal();
    if (!document.getElementById('admin-rename-modal').hidden) closeRenameModal();
  });

  // ─── Init ─────────────────────────────────────────────────────────────────────

  if (state.username && state.password) {
    // Resume session — verify credentials then go straight to dashboard
    (async () => {
      try {
        await callAPI('list-objects', { prefix: 'uploads/' });
        sessionStorage.setItem('adminUsername', state.username);
        sessionStorage.setItem('adminPassword', state.password);
        showDashboard();
      } catch {
        clearAuth();
        showAuth();
      }
    })();
  } else {
    showAuth();
  }

})();
