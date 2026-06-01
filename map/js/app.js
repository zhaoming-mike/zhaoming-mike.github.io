const state = {
  maps: [],
  currentEnv: 'all',
  searchQuery: '',
  modalOpen: false,
  currentMapId: null,
  drawing: null,
  drawState: {}
};

fetch('data/maps.json')
  .then(r => r.json())
  .then(data => {
    state.maps = data.maps;
    renderCards();
  })
  .catch(() => {
    document.getElementById('cardGrid').innerHTML =
      '<div style="padding:60px 20px;text-align:center;color:var(--text-dim)">' +
      '<p style="font-size:1.1rem;margin-bottom:12px">需要通过 HTTP 服务器打开此页面</p>' +
      '<p>在项目目录下运行:</p>' +
      '<code style="background:var(--bg);padding:6px 14px;border-radius:4px;display:inline-block;margin-top:8px">python -m http.server 8080</code>' +
      '<p style="margin-top:8px">然后访问 <code>http://localhost:8080</code></p></div>';
  });

/* ── Card rendering ── */

function renderCards() {
  const grid = document.getElementById('cardGrid');
  grid.innerHTML = '';
  state.maps.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.env = m.environment;
    card.dataset.name = m.name_en.toLowerCase() + ' ' + m.name_zh.toLowerCase();
    card.innerHTML = `<img src="${m.image}" alt="${m.name_zh}" class="card-img" loading="lazy"
                          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23333%22 width=%22200%22 height=%22200%22/><text fill=%22%23666%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22>无图片</text></svg>'">
                      <div class="card-name-en">${m.name_en}</div>
                      <div class="card-name">${m.name_zh}</div>`;
    card.addEventListener('click', () => openModal(m));
    grid.appendChild(card);
  });
  applyFilters();
}

/* ── Search & Filter ── */

document.getElementById('searchInput').addEventListener('input', e => {
  state.searchQuery = e.target.value.toLowerCase().trim();
  applyFilters();
});

document.querySelectorAll('.tag').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tag').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.currentEnv = btn.dataset.env;
    applyFilters();
  });
});

function applyFilters() {
  document.querySelectorAll('.card').forEach(card => {
    const env = card.dataset.env;
    const names = card.dataset.name;
    const envMatch = state.currentEnv === 'all' || env === state.currentEnv;
    const searchMatch = !state.searchQuery || names.includes(state.searchQuery);
    card.classList.toggle('hidden', !(envMatch && searchMatch));
  });
}

/* ── Modal ── */

const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImage');
const canvas = document.getElementById('drawCanvas');
const canvasWrap = document.getElementById('canvasWrap');

function openModal(mapData) {
  state.modalOpen = true;
  state.currentMapId = mapData.id;
  modalImg.src = mapData.image;
  modal.classList.add('open');
  initCanvas();
  setActiveTool(null);
}

function closeModal() {
  state.modalOpen = false;
  modal.classList.remove('open');
  if (state.drawing) state.drawing.destroy();
}

document.getElementById('btnClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && state.modalOpen) closeModal();
});

/* ── Drawing tools ── */

let activeTool = null;

document.querySelectorAll('.tool-btn').forEach(btn => {
  const tool = btn.dataset.tool;
  if (tool === 'undo' || !tool) return;
  btn.addEventListener('click', () => setActiveTool(tool));
});

document.getElementById('btnCopy').addEventListener('click', () => copyToClipboard());
document.querySelector('[data-tool="undo"]').addEventListener('click', () => {
  setActiveTool(null);
  undoDraw();
});

function setActiveTool(tool) {
  activeTool = tool;
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
  if (tool) {
    const btn = document.querySelector(`[data-tool="${tool}"]`);
    if (btn) btn.classList.add('active');
  }
  canvas.classList.toggle('drawing-active', !!tool);
  if (state.drawing) {
    state.drawing.setTool(tool);
  }
}

/* Keyboard shortcuts */
document.addEventListener('keydown', e => {
  if (!state.modalOpen) return;
  if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undoDraw(); return; }
  const key = e.key.toLowerCase();
  const map = { 'a': 'arrow-red', 'g': 'arrow-green', 'c': 'circle-red', 'v': 'circle-green', 't': 'text', 'e': 'eraser', 'escape': null };
  if (map[key] !== undefined) { e.preventDefault(); setActiveTool(map[key]); }
});
