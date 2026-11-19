import { drawCover, getPanelRects } from './cover.js';
import { isCoverScene, sceneForQuery } from './shots.js';

const sizes = { square: [1080, 1080], portrait: [1080, 1350], wide: [1920, 1080] };
const labels = { square: '1080 × 1080', portrait: '1080 × 1350', wide: '1920 × 1080' };
const photoNames = { pier: 'PIER', boulevard: 'BOULEVARD' };
const query = new URLSearchParams(window.location.search);
const shot = sceneForQuery(query);
const canvas = document.getElementById('preview-canvas');
const statusText = document.getElementById('status-text');
const state = {
  layout: 'key', previewSize: 'square', grade: 'sunset', title: 'SUNSET HEIST', tagline: 'A NIGHT TO REMEMBER', titleFill: 'gradient', titlePosition: 'bottom', titleSize: 112, letterSpacing: 4, titleOutline: true, titleGlow: true, effects: { sun: true, palms: true, grain: true }, photos: [], assignments: [0, 0, 0, 0, 0], transforms: Array.from({ length: 5 }, () => ({ zoom: 1, panX: 0, panY: 0, fit: false })), selectedPanel: 0, selectedPhoto: 0,
};

function setStatus(message) { statusText.textContent = message; }

function loadImage(source, name) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ image, src: source, name });
    image.onerror = reject;
    image.src = source;
  });
}

async function loadSamples(names = ['pier', 'boulevard']) {
  state.photos = [];
  for (const name of names) {
    try { state.photos.push(await loadImage(`./samples/${name}.jpg`, photoNames[name] || name.toUpperCase())); } catch { setStatus('Could not load that sample photo.'); }
  }
  state.selectedPhoto = 0;
  state.assignments = state.assignments.map(() => 0);
  renderTray();
  render();
}

function renderTray() {
  const tray = document.getElementById('photo-tray');
  tray.innerHTML = '';
  if (!state.photos.length) { tray.innerHTML = '<div class="tray-empty">Add a photo, then click a panel to place it.</div>'; return; }
  state.photos.forEach((photo, index) => {
    const card = document.createElement('button');
    card.className = `tray-card${index === state.selectedPhoto ? ' active' : ''}`;
    card.title = `Use ${photo.name}`;
    card.innerHTML = `<img src="${photo.src}" alt="${photo.name} photo"><span>${photo.name}</span>`;
    card.addEventListener('click', () => { state.selectedPhoto = index; state.assignments[state.selectedPanel] = index; renderTray(); render(); setStatus(`${photo.name} placed in panel ${String(state.selectedPanel + 1).padStart(2, '0')}.`); });
    tray.appendChild(card);
  });
}

function updateControls() {
  document.getElementById('preview-size').value = state.previewSize;
  document.getElementById('title-input').value = state.title;
  document.getElementById('tagline-input').value = state.tagline;
  document.getElementById('title-position').value = state.titlePosition;
  document.getElementById('title-fill').value = state.titleFill;
  document.getElementById('title-size').value = state.titleSize;
  document.getElementById('title-size-value').value = state.titleSize;
  document.getElementById('title-size-value').textContent = state.titleSize;
  document.getElementById('letter-spacing').value = state.letterSpacing;
  document.getElementById('letter-spacing-value').value = state.letterSpacing;
  document.getElementById('letter-spacing-value').textContent = state.letterSpacing;
  document.getElementById('title-outline').checked = state.titleOutline;
  document.getElementById('title-glow').checked = state.titleGlow;
  document.getElementById('panel-label').textContent = `PANEL ${String(state.selectedPanel + 1).padStart(2, '0')}`;
  const transform = state.transforms[state.selectedPanel];
  document.getElementById('panel-zoom').value = Math.round(transform.zoom * 100);
  document.getElementById('panel-zoom-value').textContent = `${transform.zoom.toFixed(1)}×`;
  document.getElementById('fit-mode').textContent = transform.fit ? 'Fit' : 'Fill';
  document.querySelectorAll('.layout-button').forEach(button => button.classList.toggle('active', button.dataset.layout === state.layout));
  document.querySelectorAll('.grade-button').forEach(button => button.classList.toggle('active', button.dataset.grade === state.grade));
  document.getElementById('preview-meta').textContent = `${labels[state.previewSize]} · ${state.layout.toUpperCase()}`;
}

function resizePreview() {
  const [width, height] = sizes[state.previewSize];
  canvas.width = width;
  canvas.height = height;
  render();
}

function render() {
  updateControls();
  drawCover(canvas, state, { showSelection: !isCoverScene(shot.scene) });
}

function selectPanelAt(clientX, clientY) {
  const bounds = canvas.getBoundingClientRect();
  const canvasX = (clientX - bounds.left) * canvas.width / bounds.width;
  const canvasY = (clientY - bounds.top) * canvas.height / bounds.height;
  const panels = getPanelRects(state.layout, canvas.width, canvas.height);
  const selected = panels.findIndex(panel => canvasX >= panel.x && canvasX <= panel.x + panel.w && canvasY >= panel.y && canvasY <= panel.y + panel.h);
  if (selected >= 0) { state.selectedPanel = selected; state.selectedPhoto = state.assignments[selected] || 0; renderTray(); render(); }
}

function wireControls() {
  document.getElementById('use-samples').addEventListener('click', () => loadSamples());
  document.getElementById('photo-upload').addEventListener('change', event => {
    [...event.target.files].forEach(file => {
      const reader = new FileReader();
      reader.onload = async () => { try { state.photos.push(await loadImage(reader.result, file.name.slice(0, 12).toUpperCase())); state.selectedPhoto = state.photos.length - 1; renderTray(); render(); setStatus('Photo ready. Select a panel to place it.'); } catch { setStatus('That image could not be opened.'); } };
      reader.readAsDataURL(file);
    });
  });
  document.getElementById('assign-all').addEventListener('click', () => { state.assignments = state.assignments.map(() => state.selectedPhoto); render(); setStatus('Selected photo filled every panel.'); });
  document.querySelectorAll('.layout-button').forEach(button => button.addEventListener('click', () => { state.layout = button.dataset.layout; state.selectedPanel = 0; if (state.layout === 'trio') state.transforms.forEach((transform, index) => { transform.panY = [-0.3, 0.05, 0.35][index] ?? 0; }); render(); setStatus(`${button.textContent.trim()} layout selected.`); }));
  document.querySelectorAll('.grade-button').forEach(button => button.addEventListener('click', () => { state.grade = button.dataset.grade; render(); setStatus(`${button.textContent.trim()} grade applied.`); }));
  document.getElementById('preview-size').addEventListener('change', event => { state.previewSize = event.target.value; resizePreview(); });
  document.getElementById('title-input').addEventListener('input', event => { state.title = event.target.value; render(); });
  document.getElementById('tagline-input').addEventListener('input', event => { state.tagline = event.target.value; render(); });
  document.getElementById('title-position').addEventListener('change', event => { state.titlePosition = event.target.value; render(); });
  document.getElementById('title-fill').addEventListener('change', event => { state.titleFill = event.target.value; render(); });
  document.getElementById('title-size').addEventListener('input', event => { state.titleSize = Number(event.target.value); render(); });
  document.getElementById('letter-spacing').addEventListener('input', event => { state.letterSpacing = Number(event.target.value); render(); });
  document.getElementById('title-outline').addEventListener('change', event => { state.titleOutline = event.target.checked; render(); });
  document.getElementById('title-glow').addEventListener('change', event => { state.titleGlow = event.target.checked; render(); });
  ['sun', 'palms', 'grain'].forEach(effect => document.getElementById(`effect-${effect}`).addEventListener('change', event => { state.effects[effect] = event.target.checked; render(); }));
  document.getElementById('panel-zoom').addEventListener('input', event => { state.transforms[state.selectedPanel].zoom = Number(event.target.value) / 100; render(); });
  document.getElementById('fit-mode').addEventListener('click', () => { state.transforms[state.selectedPanel].fit = !state.transforms[state.selectedPanel].fit; render(); });
  document.querySelectorAll('[data-nudge]').forEach(button => button.addEventListener('click', () => { const transform = state.transforms[state.selectedPanel]; const distance = .025; if (button.dataset.nudge === 'left') transform.panX -= distance; if (button.dataset.nudge === 'right') transform.panX += distance; if (button.dataset.nudge === 'up') transform.panY -= distance; if (button.dataset.nudge === 'down') transform.panY += distance; render(); }));
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener('pointerdown', event => { selectPanelAt(event.clientX, event.clientY); dragging = true; lastX = event.clientX; lastY = event.clientY; canvas.setPointerCapture(event.pointerId); });
  canvas.addEventListener('pointermove', event => { if (!dragging) return; const bounds = canvas.getBoundingClientRect(); const transform = state.transforms[state.selectedPanel]; transform.panX += (event.clientX - lastX) / bounds.width; transform.panY += (event.clientY - lastY) / bounds.height; lastX = event.clientX; lastY = event.clientY; render(); });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointercancel', () => { dragging = false; });
  document.getElementById('export-current').addEventListener('click', () => exportSize(state.previewSize));
  document.getElementById('export-all').addEventListener('click', async () => { for (const size of Object.keys(sizes)) await exportSize(size); setStatus('All three PNG sizes exported.'); });
}

function drawExport(size) {
  const [width, height] = sizes[size];
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = width;
  exportCanvas.height = height;
  drawCover(exportCanvas, state, { showSelection: false });
  return exportCanvas;
}

function exportSize(size) {
  return new Promise(resolve => {
    const exportCanvas = drawExport(size);
    exportCanvas.toBlob(blob => {
      if (!blob) { setStatus('PNG export failed.'); resolve(); return; }
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `sunset-cover-${sizes[size][0]}x${sizes[size][1]}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
      setStatus(`Exported ${labels[size]} PNG · ${(blob.size / 1024).toFixed(0)} KB`);
      resolve();
    }, 'image/png');
  });
}

async function runSelftest() {
  const result = document.getElementById('selftest-result');
  result.hidden = false;
  const checks = [];
  for (const size of Object.keys(sizes)) {
    try {
      const exportCanvas = drawExport(size);
      const blob = await new Promise(resolve => exportCanvas.toBlob(resolve, 'image/png'));
      checks.push(`${labels[size]} PNG ${blob ? blob.size : 0} bytes`);
    } catch (error) { checks.push(`${labels[size]} FAIL ${error.message}`); }
  }
  result.textContent = checks.every(line => !line.includes('FAIL') && !line.endsWith(' 0 bytes')) ? `SELFTEST PASS 3/3 · ${checks.join(' · ')}` : `SELFTEST FAIL · ${checks.join(' · ')}`;
}

async function bootstrap() {
  wireControls();
  if (document.fonts?.ready) await document.fonts.ready;
  await loadSamples([shot.photo]);
  state.layout = shot.layout;
  if (shot.layout === 'trio') state.transforms.forEach((transform, index) => { transform.panY = [-0.3, 0.05, 0.35][index] ?? 0; });
  state.previewSize = shot.size;
  state.grade = shot.grade;
  state.title = shot.caption;
  state.tagline = shot.tagline;
  state.titlePosition = shot.titlePosition;
  state.selectedPanel = 0;
  resizePreview();
  if (isCoverScene(shot.scene)) document.body.classList.add('shot-cover');
  if (query.has('selftest')) await runSelftest();
  window.__shotReady = true;
}

bootstrap();
