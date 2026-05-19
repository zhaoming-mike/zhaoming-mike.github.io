/* ============================================================
   NMoF — Navigation Manager Application Logic
   纯前端 SPA，不依赖任何框架，仅使用 Bootstrap 5 的 UI 组件。
   ============================================================ */

// ---- State ----
const state = {
  links: [],           // 全部链接数据
  filtered: [],        // 搜索过滤后的结果
  currentPage: 1,
  pageSize: 12,
  searchTerm: '',
  editingId: null,     // 当前编辑的链接 ID（null = 新增模式）
  pendingDeleteId: null,
};

// ---- DOM refs ----
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  cardsContainer: $('#cardsContainer'),
  emptyState: $('#emptyState'),
  paginationNav: $('#paginationNav'),
  paginationList: $('#paginationList'),
  pageSizeSelect: $('#pageSizeSelect'),
  searchInput: $('#searchInput'),
  searchStats: $('#searchStats'),
  totalCount: $('#totalCount'),
  linkModal: new bootstrap.Modal('#linkModal'),
  confirmModal: new bootstrap.Modal('#confirmModal'),
  linkForm: $('#linkForm'),
  modalTitle: $('#modalTitle'),
  linkId: $('#linkId'),
  linkEmoji: $('#linkEmoji'),
  linkTitle: $('#linkTitle'),
  linkUrl: $('#linkUrl'),
  linkCategory: $('#linkCategory'),
  linkDesc: $('#linkDesc'),
  btnSave: $('#btnSave'),
  btnDelete: $('#btnDelete'),
  btnConfirmDelete: $('#btnConfirmDelete'),
  confirmText: $('#confirmText'),
  btnAdd: $('#btnAdd'),
  btnExport: $('#btnExport'),
  btnImportTrigger: $('#btnImportTrigger'),
  fileImport: $('#fileImport'),
  btnClearSearch: $('#btnClearSearch'),
  categoryList: $('#categoryList'),
  emojiSuggestions: $('#emojiSuggestions'),
  toastContainer: $('#toastContainer'),
};

// ---- Common emoji quick-pick ----
const quickEmojis = ['🔗','🌐','⭐','💻','🎨','📦','🚀','📚','🔧','🎯','🔍','📝','🤖','☁️','🔐','📊','🎬','🎵','🛒','🗂️'];

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  loadLinks();
  bindEvents();
});

// ---- Data Loading ----
async function loadLinks() {
  try {
    const resp = await fetch('./links.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    // Deduplicate by id
    const seen = new Set();
    state.links = data.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
    // Ensure unique ids
    state.links.forEach((item, i) => { item.id = i + 1; });
  } catch (err) {
    console.warn('无法加载 links.json，使用内置示例数据', err);
    state.links = getFallbackLinks();
  }
  state.filtered = [...state.links];
  refreshAll();
}

function getFallbackLinks() {
  return [
    { id:1, emoji:'🔍', title:'Google', url:'https://www.google.com', description:'全球最大的搜索引擎', category:'搜索' },
    { id:2, emoji:'💻', title:'GitHub', url:'https://github.com', description:'代码托管平台', category:'开发' },
    { id:3, emoji:'📦', title:'npm', url:'https://www.npmjs.com', description:'Node.js 包管理器', category:'开发' },
  ];
}

// ---- Event Binding ----
function bindEvents() {
  dom.searchInput.addEventListener('input', () => {
    state.searchTerm = dom.searchInput.value.trim().toLowerCase();
    state.currentPage = 1;
    applyFilter();
    renderCards();
    renderPagination();
  });

  dom.pageSizeSelect.addEventListener('change', () => {
    const val = dom.pageSizeSelect.value;
    state.pageSize = val === '100' ? Infinity : parseInt(val, 10);
    state.currentPage = 1;
    renderCards();
    renderPagination();
  });

  dom.btnAdd.addEventListener('click', () => openModal(null));
  dom.btnSave.addEventListener('click', handleSave);
  dom.btnDelete.addEventListener('click', () => {
    dom.confirmText.textContent = `确定要删除「${dom.linkTitle.value}」吗？`;
    state.pendingDeleteId = dom.linkId.value;
    dom.confirmModal.show();
  });
  dom.btnConfirmDelete.addEventListener('click', handleDelete);

  dom.btnExport.addEventListener('click', exportJSON);
  dom.btnImportTrigger.addEventListener('click', () => dom.fileImport.click());
  dom.fileImport.addEventListener('change', importJSON);
  dom.btnClearSearch.addEventListener('click', () => {
    dom.searchInput.value = '';
    state.searchTerm = '';
    state.currentPage = 1;
    applyFilter();
    refreshAll();
  });

  // Reset modal state on hidden
  document.getElementById('linkModal').addEventListener('hidden.bs.modal', () => {
    dom.linkForm.reset();
    dom.linkId.value = '';
    dom.btnDelete.classList.add('d-none');
    state.editingId = null;
  });

  // Quick emoji picker
  dom.emojiSuggestions.addEventListener('click', (e) => {
    const chip = e.target.closest('.emoji-chip');
    if (chip) dom.linkEmoji.value = chip.textContent.trim();
  });
}

// ---- Filtering ----
function applyFilter() {
  const q = state.searchTerm;
  if (!q) {
    state.filtered = [...state.links];
  } else {
    state.filtered = state.links.filter(item =>
      item.title.toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.url || '').toLowerCase().includes(q)
    );
  }
}

// ---- Rendering ----
function renderCards() {
  const { filtered, currentPage, pageSize } = state;
  const total = filtered.length;
  const totalPages = pageSize === Infinity ? 1 : Math.ceil(total / pageSize);

  // Clamp page
  if (currentPage > totalPages) state.currentPage = Math.max(1, totalPages);

  const start = pageSize === Infinity ? 0 : (state.currentPage - 1) * pageSize;
  const end = pageSize === Infinity ? total : start + pageSize;
  const pageItems = filtered.slice(start, end);

  dom.cardsContainer.innerHTML = '';

  if (pageItems.length === 0) {
    dom.emptyState.classList.remove('d-none');
    dom.paginationNav.classList.add('d-none');
    dom.searchStats.textContent = '';
  } else {
    dom.emptyState.classList.add('d-none');
    pageItems.forEach((item, idx) => {
      dom.cardsContainer.appendChild(createCard(item, idx));
    });
  }

  dom.totalCount.textContent = state.links.length;
  updateSearchStats();
}

function createCard(item, idx) {
  const col = document.createElement('div');
  col.className = 'col-xl-3 col-lg-4 col-md-6 col-sm-6';
  col.style.animationDelay = `${idx * 0.04}s`;

  const domain = extractDomain(item.url);

  col.innerHTML = `
    <div class="link-card" data-id="${item.id}">
      <div class="card-emoji-wrap">
        <span class="card-emoji">${escapeHTML(item.emoji || '🔗')}</span>
      </div>
      <div class="card-title" title="${escapeHTML(item.title)}">${escapeHTML(item.title)}</div>
      <div class="card-url" title="${escapeHTML(item.url)}">${escapeHTML(domain)}</div>
      <div class="card-desc">${escapeHTML(item.description || '暂无描述')}</div>
      <div class="card-footer-actions">
        <span class="card-badge">${escapeHTML(item.category || '未分类')}</span>
        <div class="card-btn-group" onclick="event.stopPropagation()">
          <button class="btn-icon btn-copy" data-copy="${escapeAttr(item.url)}" title="复制链接">
            <i class="bi bi-clipboard"></i>
          </button>
          <button class="btn-icon btn-edit" data-edit="${item.id}" title="编辑">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn-icon btn-delete" data-delete="${item.id}" data-name="${escapeAttr(item.title)}" title="删除">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  // Click card → open URL
  col.querySelector('.link-card').addEventListener('click', (e) => {
    if (e.button !== 0) return;
    if (window.getSelection().toString()) return;
    if (e.target.closest('.card-btn-group')) return;
    window.open(item.url, '_blank', 'noopener');
  });

  // Copy button
  col.querySelector('.btn-copy').addEventListener('click', (e) => {
    e.stopPropagation();
    copyToClipboard(item.url);
  });

  // Edit button
  col.querySelector('.btn-edit').addEventListener('click', (e) => {
    e.stopPropagation();
    openModal(item.id);
  });

  // Delete button
  col.querySelector('.btn-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    dom.confirmText.textContent = `确定要删除「${item.title}」吗？`;
    state.pendingDeleteId = item.id;
    dom.confirmModal.show();
  });

  return col;
}

function renderPagination() {
  const { filtered, currentPage, pageSize } = state;
  const total = filtered.length;
  const totalPages = pageSize === Infinity ? 1 : Math.ceil(total / pageSize);

  if (totalPages <= 1) {
    dom.paginationNav.classList.add('d-none');
    return;
  }

  dom.paginationNav.classList.remove('d-none');
  dom.paginationList.innerHTML = '';

  // Prev
  dom.paginationList.appendChild(makePageItem('‹', currentPage > 1, currentPage - 1));

  // Pages
  const pages = getPageRange(currentPage, totalPages);
  pages.forEach(p => {
    if (p === '...') {
      const li = document.createElement('li');
      li.className = 'page-item disabled';
      li.innerHTML = '<span class="page-link">…</span>';
      dom.paginationList.appendChild(li);
    } else {
      dom.paginationList.appendChild(makePageItem(p, true, p, p === currentPage));
    }
  });

  // Next
  dom.paginationList.appendChild(makePageItem('›', currentPage < totalPages, currentPage + 1));
}

function makePageItem(label, enabled, page, active = false) {
  const li = document.createElement('li');
  li.className = `page-item ${active ? 'active' : ''} ${!enabled ? 'disabled' : ''}`;
  const a = document.createElement('a');
  a.className = 'page-link';
  a.href = '#';
  a.textContent = label;
  if (enabled) {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      state.currentPage = page;
      renderCards();
      renderPagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  li.appendChild(a);
  return li;
}

function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

function updateSearchStats() {
  if (state.searchTerm) {
    dom.searchStats.textContent = `找到 ${state.filtered.length} 条`;
  } else {
    dom.searchStats.textContent = state.links.length > 0 ? `共 ${state.links.length} 条` : '';
  }
}

// ---- Modal (Add/Edit) ----
function openModal(id) {
  populateEmojiSuggestions();
  populateCategoryDatalist();

  if (id) {
    const item = state.links.find(l => l.id === id);
    if (!item) return;
    state.editingId = id;
    dom.modalTitle.textContent = '编辑链接';
    dom.linkId.value = item.id;
    dom.linkEmoji.value = item.emoji || '';
    dom.linkTitle.value = item.title || '';
    dom.linkUrl.value = item.url || '';
    dom.linkCategory.value = item.category || '';
    dom.linkDesc.value = item.description || '';
    dom.btnDelete.classList.remove('d-none');
    dom.btnSave.textContent = '更新';
  } else {
    state.editingId = null;
    dom.modalTitle.textContent = '添加链接';
    dom.linkId.value = '';
    dom.linkEmoji.value = '';
    dom.linkTitle.value = '';
    dom.linkUrl.value = '';
    dom.linkCategory.value = '';
    dom.linkDesc.value = '';
    dom.btnDelete.classList.add('d-none');
    dom.btnSave.textContent = '保存';
  }
  dom.linkModal.show();
  setTimeout(() => dom.linkTitle.focus(), 100);
}

function handleSave() {
  const emoji = dom.linkEmoji.value.trim() || '🔗';
  const title = dom.linkTitle.value.trim();
  const url = dom.linkUrl.value.trim();

  if (!title) { showToast('请输入网站名称', 'warning'); dom.linkTitle.focus(); return; }
  if (!url) { showToast('请输入链接地址', 'warning'); dom.linkUrl.focus(); return; }

  // Simple URL validation: prefix with https:// if missing
  let finalUrl = url;
  if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl;

  if (state.editingId) {
    const item = state.links.find(l => l.id === state.editingId);
    if (item) {
      item.emoji = emoji;
      item.title = title;
      item.url = finalUrl;
      item.category = dom.linkCategory.value.trim();
      item.description = dom.linkDesc.value.trim();
    }
  } else {
    const newId = state.links.length > 0 ? Math.max(...state.links.map(l => l.id)) + 1 : 1;
    state.links.unshift({
      id: newId,
      emoji,
      title,
      url: finalUrl,
      category: dom.linkCategory.value.trim(),
      description: dom.linkDesc.value.trim(),
    });
  }

  dom.linkModal.hide();
  applyFilter();
  state.currentPage = 1;
  refreshAll();
  showToast(state.editingId ? '链接已更新' : '链接已添加');
}

function handleDelete() {
  const id = state.pendingDeleteId;
  if (!id) return;
  state.links = state.links.filter(l => String(l.id) !== String(id));
  state.pendingDeleteId = null;
  dom.confirmModal.hide();
  applyFilter();
  state.currentPage = Math.min(state.currentPage, Math.max(1, Math.ceil(state.filtered.length / state.pageSize)));
  refreshAll();
  showToast('链接已删除');
}

// ---- Export / Import ----
function exportJSON() {
  const data = JSON.stringify(state.links, null, 2);
  downloadFile('links.json', data, 'application/json');
  showToast('已导出 links.json');
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!Array.isArray(data)) throw new Error('格式错误：需要 JSON 数组');
      // Merge: replace all if user confirms
      if (state.links.length > 0) {
        if (!confirm(`当前已有 ${state.links.length} 条链接。导入将替换全部数据，确定继续？`)) return;
      }
      state.links = data.map((item, i) => ({ ...item, id: item.id || i + 1 }));
      applyFilter();
      state.currentPage = 1;
      refreshAll();
      showToast(`成功导入 ${state.links.length} 条链接`);
    } catch (err) {
      showToast('导入失败：' + err.message, 'danger');
    }
  };
  reader.readAsText(file);
  dom.fileImport.value = ''; // reset so same file can be re-imported
}

// ---- Clipboard ----
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('链接已复制到剪贴板'));
  } else {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('链接已复制到剪贴板');
  }
}

// ---- Helpers ----
function refreshAll() {
  renderCards();
  renderPagination();
  dom.totalCount.textContent = state.links.length;
  updateSearchStats();
  populateCategoryDatalist();
}

function showToast(message, type = 'success') {
  const bgClass = { success: 'bg-success', warning: 'bg-warning text-dark', danger: 'bg-danger', info: 'bg-info' }[type] || 'bg-success';
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center border-0 ${bgClass} text-white mb-2`;
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${escapeHTML(message)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  dom.toastContainer.appendChild(toastEl);
  const bsToast = new bootstrap.Toast(toastEl, { delay: 2000 });
  bsToast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function extractDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch { return url; }
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function populateEmojiSuggestions() {
  dom.emojiSuggestions.innerHTML = quickEmojis.map(e => `<button type="button" class="emoji-chip">${e}</button>`).join('');
}

function populateCategoryDatalist() {
  const cats = [...new Set(state.links.map(l => l.category).filter(Boolean))].sort();
  dom.categoryList.innerHTML = cats.map(c => `<option value="${escapeHTML(c)}">`).join('');
}
