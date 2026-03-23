// scripts/upload.js
// Five Dollar Down — S3 multipart upload engine
//
// Flow per file:
//   initiate-multipart → (split into 10MB chunks) → get-upload-part-url per chunk
//   → XHR PUT to S3 presigned URL (max 3 concurrent parts per file, all files parallel)
//   → complete-multipart
//
// Cancel: abort all XHRs for the file → abort-multipart (cleans up S3 storage)

(function () {
  'use strict';

  const API_URL            = '/.netlify/functions/s3';
  const CHUNK_SIZE         = 10 * 1024 * 1024; // 10 MB
  const MAX_PARALLEL_PARTS = 3;

  // ─── State ──────────────────────────────────────────────────────────────────

  // Map<id, fileState>
  const queue = new Map();
  let rafPending = false;

  // Speed smoothing: circular buffer of { t, bytes } samples over ~5 seconds
  const SPEED_WINDOW_MS = 5000;

  // ─── Semaphore ──────────────────────────────────────────────────────────────

  class Semaphore {
    constructor(n) {
      this._n = n;
      this._waiting = [];
    }
    acquire() {
      if (this._n > 0) { this._n--; return Promise.resolve(); }
      return new Promise(resolve => this._waiting.push(resolve));
    }
    release() {
      if (this._waiting.length > 0) {
        this._waiting.shift()();
      } else {
        this._n++;
      }
    }
  }

  // ─── API ────────────────────────────────────────────────────────────────────

  async function callAPI(action, body, signal) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body }),
      signal,
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'API error');
    return data;
  }

  // ─── Format helpers ─────────────────────────────────────────────────────────

  function fmtBytes(n) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
    return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  function fmtSpeed(bytesPerSec) {
    return `${fmtBytes(bytesPerSec)}/s`;
  }

  function fmtETA(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '';
    if (seconds < 2)  return '< 1s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
    return `> 1h`;
  }

  // ─── Per-file speed calculation ─────────────────────────────────────────────

  function calcSpeed(state) {
    const now = Date.now();
    // Prune samples older than SPEED_WINDOW_MS
    state.speedSamples = state.speedSamples.filter(s => now - s.t < SPEED_WINDOW_MS);
    if (state.speedSamples.length < 2) return 0;
    const oldest = state.speedSamples[0];
    const newest = state.speedSamples[state.speedSamples.length - 1];
    const dt = (newest.t - oldest.t) / 1000;
    if (dt <= 0) return 0;
    return (newest.bytes - oldest.bytes) / dt;
  }

  // ─── Upload pipeline ────────────────────────────────────────────────────────

  function createState(file) {
    return {
      id: crypto.randomUUID(),
      file,
      status: 'queued',      // queued | uploading | completing | done | error | cancelled
      uploadId: null,
      key: null,
      totalParts: Math.ceil(file.size / CHUNK_SIZE),
      completedParts: [],    // [ { PartNumber, ETag }, ... ]
      partProgress: {},      // partNumber → bytesUploaded so far
      bytesUploaded: 0,
      startedAt: null,
      speedSamples: [],      // [ { t, bytes }, ... ]
      xhrs: [],              // active XHRs (for cancel)
      abortControllers: [],  // fetch AbortControllers (for cancel)
      errorMessage: null,
    };
  }

  async function startUpload(state) {
    state.status = 'uploading';
    state.startedAt = Date.now();
    scheduleRender();

    const ac = new AbortController();
    state.abortControllers.push(ac);

    try {
      // 1. Initiate
      const init = await callAPI('initiate-multipart', {
        filename: state.file.name,
        contentType: state.file.type || 'application/octet-stream',
      }, ac.signal);

      state.uploadId = init.uploadId;
      state.key = init.key;
      scheduleRender();

      // 2. Upload all parts with concurrency limit
      const sem = new Semaphore(MAX_PARALLEL_PARTS);
      const partCount = state.totalParts;
      const partPromises = [];

      for (let i = 1; i <= partCount; i++) {
        const partNumber = i;
        partPromises.push((async () => {
          await sem.acquire();
          if (state.status === 'cancelled') { sem.release(); return; }
          try {
            await uploadPart(state, partNumber, ac.signal);
          } finally {
            sem.release();
          }
        })());
      }

      await Promise.all(partPromises);
      if (state.status === 'cancelled') return;

      // 3. Complete
      state.status = 'completing';
      scheduleRender();

      const sorted = [...state.completedParts].sort((a, b) => a.PartNumber - b.PartNumber);
      await callAPI('complete-multipart', {
        key: state.uploadId ? state.key : null,
        uploadId: state.uploadId,
        parts: sorted,
      }, ac.signal);

      state.status = 'done';
      state.bytesUploaded = state.file.size;
      scheduleRender();

    } catch (e) {
      if (state.status === 'cancelled') return;
      console.error('[upload] error:', e);
      state.status = 'error';
      state.errorMessage = e.message || 'Upload failed';
      scheduleRender();
    }
  }

  async function uploadPart(state, partNumber, signal) {
    if (state.status === 'cancelled') return;

    // Get presigned URL
    const partAC = new AbortController();
    state.abortControllers.push(partAC);
    const combinedSignal = anyAbort([signal, partAC.signal]);

    const { url } = await callAPI('get-upload-part-url', {
      key: state.key,
      uploadId: state.uploadId,
      partNumber,
    }, combinedSignal);

    if (state.status === 'cancelled') return;

    // Slice the file chunk
    const start = (partNumber - 1) * CHUNK_SIZE;
    const end   = Math.min(start + CHUNK_SIZE, state.file.size);
    const blob  = state.file.slice(start, end);

    // PUT directly to S3 via XHR (fetch has no upload progress)
    const etag = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      state.xhrs.push(xhr);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          state.partProgress[partNumber] = e.loaded;
          state.bytesUploaded = Object.values(state.partProgress).reduce((s, v) => s + v, 0);
          // Record speed sample
          state.speedSamples.push({ t: Date.now(), bytes: state.bytesUploaded });
          scheduleRender();
        }
      };

      xhr.onload = () => {
        state.xhrs = state.xhrs.filter(x => x !== xhr);
        if (xhr.status >= 200 && xhr.status < 300) {
          // S3 returns ETag in response header — may be quoted, preserve as-is
          const rawETag = xhr.getResponseHeader('ETag') || '';
          resolve(rawETag || `"part-${partNumber}"`);
        } else {
          reject(new Error(`Part ${partNumber} upload failed: HTTP ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        state.xhrs = state.xhrs.filter(x => x !== xhr);
        reject(new Error(`Part ${partNumber} network error`));
      };

      xhr.onabort = () => {
        state.xhrs = state.xhrs.filter(x => x !== xhr);
        reject(new Error('Upload cancelled'));
      };

      xhr.open('PUT', url);
      xhr.send(blob);

      // Hook up abort signal
      signal.addEventListener('abort', () => xhr.abort(), { once: true });
    });

    state.completedParts.push({ PartNumber: partNumber, ETag: etag });
  }

  // Helper: create a signal that aborts when any of the given signals aborts
  function anyAbort(signals) {
    const ac = new AbortController();
    for (const sig of signals) {
      if (sig.aborted) { ac.abort(); break; }
      sig.addEventListener('abort', () => ac.abort(), { once: true });
    }
    return ac.signal;
  }

  // ─── Cancel ─────────────────────────────────────────────────────────────────

  function cancelUpload(id) {
    const state = queue.get(id);
    if (!state || state.status === 'done' || state.status === 'cancelled') return;

    state.status = 'cancelled';

    // Abort all active XHRs
    state.xhrs.forEach(x => x.abort());
    state.xhrs = [];

    // Abort all fetch controllers
    state.abortControllers.forEach(ac => ac.abort());
    state.abortControllers = [];

    // Tell S3 to clean up — fire and forget
    if (state.uploadId && state.key) {
      callAPI('abort-multipart', { key: state.key, uploadId: state.uploadId })
        .catch(e => console.warn('[upload] abort-multipart failed:', e));
    }

    scheduleRender();
  }

  // ─── DOM ────────────────────────────────────────────────────────────────────

  const fileList    = document.getElementById('upload-file-list');
  const overallEl   = document.getElementById('upload-overall');
  const overallFill = document.getElementById('overall-fill');
  const overallPct  = document.getElementById('overall-pct');
  const overallLabel = document.getElementById('overall-label');
  const overallStats = document.getElementById('overall-stats');

  // Map<id, HTMLElement> — keyed DOM nodes
  const domNodes = new Map();

  function scheduleRender() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      render();
    });
  }

  function render() {
    const states = [...queue.values()];

    // Update / create file cards
    states.forEach(state => {
      let el = domNodes.get(state.id);
      if (!el) {
        el = createFileCard(state.id);
        domNodes.set(state.id, el);
        fileList.appendChild(el);
      }
      updateFileCard(el, state);
    });

    // Overall progress
    const hasActive = states.some(s => s.status === 'uploading' || s.status === 'completing' || s.status === 'queued');
    const hasAny = states.length > 0;

    if (hasAny) {
      overallEl.hidden = false;
      const totalBytes = states.reduce((s, f) => s + f.file.size, 0);
      const doneBytes  = states.reduce((s, f) => s + f.bytesUploaded, 0);
      const pct = totalBytes > 0 ? Math.round((doneBytes / totalBytes) * 100) : 0;

      overallFill.style.width = pct + '%';
      overallPct.textContent = pct + '%';

      const allDone = states.every(s => s.status === 'done' || s.status === 'cancelled' || s.status === 'error');
      if (allDone) {
        const doneCount = states.filter(s => s.status === 'done').length;
        overallLabel.textContent = `${doneCount} of ${states.length} file${states.length !== 1 ? 's' : ''} uploaded`;
        overallStats.textContent = '';
      } else {
        overallLabel.textContent = 'Uploading…';
        // Aggregate speed from active uploading files
        const activeStates = states.filter(s => s.status === 'uploading');
        const totalSpeed = activeStates.reduce((s, f) => s + calcSpeed(f), 0);
        const remaining = totalBytes - doneBytes;
        const eta = totalSpeed > 0 ? remaining / totalSpeed : NaN;
        const etaStr = fmtETA(eta);
        const parts = [`${fmtBytes(doneBytes)} / ${fmtBytes(totalBytes)}`];
        if (totalSpeed > 0) parts.push(fmtSpeed(totalSpeed));
        if (etaStr) parts.push(`ETA ${etaStr}`);
        overallStats.textContent = parts.join(' · ');
      }
    } else {
      overallEl.hidden = true;
    }

    checkSubmitReady();
  }

  function createFileCard(id) {
    const li = document.createElement('li');
    li.className = 'upload-file-item';
    li.dataset.id = id;
    li.innerHTML = `
      <div class="upload-file-name"></div>
      <button class="upload-file-cancel" type="button" aria-label="Cancel upload" title="Cancel">&#x2715;</button>
      <div class="upload-file-meta"></div>
      <div class="upload-file-track"><div class="upload-file-fill"></div></div>
      <div class="upload-file-status">
        <span class="status-label"></span>
        <span class="status-eta"></span>
      </div>
    `;
    li.querySelector('.upload-file-cancel').addEventListener('click', () => cancelUpload(id));
    return li;
  }

  function updateFileCard(el, state) {
    // Status class
    el.className = 'upload-file-item' + (state.status !== 'uploading' && state.status !== 'queued' ? ` is-${state.status}` : '');

    el.querySelector('.upload-file-name').textContent = state.file.name;
    el.querySelector('.upload-file-meta').textContent = fmtBytes(state.file.size);

    const fill = el.querySelector('.upload-file-fill');
    const pct = state.file.size > 0
      ? Math.min(100, Math.round((state.bytesUploaded / state.file.size) * 100))
      : 0;
    if (state.status !== 'done' && state.status !== 'error' && state.status !== 'cancelled') {
      fill.style.width = pct + '%';
    }

    const cancelBtn = el.querySelector('.upload-file-cancel');
    const isDone = state.status === 'done' || state.status === 'cancelled' || state.status === 'error';
    cancelBtn.disabled = isDone;

    const label = el.querySelector('.status-label');
    const etaEl = el.querySelector('.status-eta');

    switch (state.status) {
      case 'queued':      label.textContent = 'Queued'; etaEl.textContent = ''; break;
      case 'uploading': {
        label.textContent = `${pct}%`;
        const speed = calcSpeed(state);
        const eta = speed > 0 ? (state.file.size - state.bytesUploaded) / speed : NaN;
        const parts = [];
        if (speed > 0) parts.push(fmtSpeed(speed));
        const etaStr = fmtETA(eta);
        if (etaStr) parts.push(`ETA ${etaStr}`);
        etaEl.textContent = parts.join(' · ');
        break;
      }
      case 'completing':  label.textContent = 'Finishing…'; etaEl.textContent = ''; break;
      case 'done':        label.textContent = 'Done'; etaEl.textContent = ''; break;
      case 'cancelled':   label.textContent = 'Cancelled'; etaEl.textContent = ''; break;
      case 'error':       label.textContent = state.errorMessage || 'Error'; etaEl.textContent = ''; break;
    }
  }

  // ─── Drop zone + file picker ────────────────────────────────────────────────

  const zone       = document.getElementById('upload-zone');
  const fileInput  = document.getElementById('file-input');
  const browseBtn  = document.getElementById('browse-btn');
  const submitBtn  = document.getElementById('submit-btn');
  const uploadForm = document.getElementById('upload-form');

  function addFiles(files) {
    [...files].forEach(file => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;
      const state = createState(file);
      queue.set(state.id, state);
      startUpload(state);
    });
    scheduleRender();
  }

  // Browse button
  browseBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) addFiles(e.target.files);
    e.target.value = '';
  });

  // Click anywhere on the drop zone (except the button) also opens picker
  zone.addEventListener('click', (e) => {
    if (!e.target.closest('#browse-btn')) fileInput.click();
  });

  // Drag-and-drop
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    zone.classList.add('is-dragging');
  });

  ['dragleave', 'dragend'].forEach(evt =>
    zone.addEventListener(evt, (e) => {
      if (!zone.contains(e.relatedTarget)) zone.classList.remove('is-dragging');
    })
  );

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('is-dragging');
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  });

  // ─── Submit button — enabled when all uploads complete ────────────────────

  function checkSubmitReady() {
    const states = [...queue.values()];
    if (states.length === 0) { submitBtn.disabled = true; return; }
    const allSettled = states.every(s => s.status === 'done' || s.status === 'cancelled' || s.status === 'error');
    const anyDone    = states.some(s => s.status === 'done');
    submitBtn.disabled = !(allSettled && anyDone);
  }

  // ─── Form submit → save manifest + show success ───────────────────────────

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name  = document.getElementById('submitter-name').value.trim();
    const email = document.getElementById('submitter-email').value.trim();
    const doneKeys = [...queue.values()]
      .filter(s => s.status === 'done')
      .map(s => s.key);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      // Save optional manifest with name/email if provided
      if ((name || email) && doneKeys.length > 0) {
        await callAPI('save-manifest', { name, email, keys: doneKeys });
      }
    } catch (err) {
      console.warn('[upload] manifest save failed (non-fatal):', err);
    }

    // Show success state
    document.getElementById('upload-body').style.display = 'none';
    document.getElementById('success-state').style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ─── Warn on tab close ────────────────────────────────────────────────────

  window.addEventListener('beforeunload', (e) => {
    const active = [...queue.values()].some(s => s.status === 'uploading' || s.status === 'completing');
    if (active) {
      e.preventDefault();
      e.returnValue = 'Uploads are in progress. Are you sure you want to leave?';
    }
  });

})();
