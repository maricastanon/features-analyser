const AttachmentLinks = {
  container: null,
  links: [],
  nextId: 1,
  filterCategory: 'all',
  searchQuery: '',
  editingId: null,

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
  },

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  _categories: ['Docs', 'Design', 'API', 'Repo', 'Other'],

  _catColor(cat) {
    const map = { Docs: 'var(--accent-pink)', Design: '#9c27b0', API: 'var(--accent-green)', Repo: '#1565c0', Other: 'var(--text-muted)' };
    return map[cat] || map.Other;
  },

  _filtered() {
    return this.links.filter(l => {
      if (this.filterCategory !== 'all' && l.category !== this.filterCategory) return false;
      if (this.searchQuery && !l.title.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          !l.url.toLowerCase().includes(this.searchQuery.toLowerCase())) return false;
      return true;
    }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.date - a.date);
  },

  render() {
    const filtered = this._filtered();
    this.container.innerHTML = `
      <div class="al-panel">
        <div class="al-header">
          <h3 class="al-title">Links &amp; References</h3>
          <span class="al-count">${this.links.length} links</span>
        </div>
        <div class="al-toolbar">
          <input class="al-input al-search" id="al-search" placeholder="Search links..." value="${this._esc(this.searchQuery)}" />
          <select class="al-input al-filter-select" id="al-filter">
            <option value="all" ${this.filterCategory === 'all' ? 'selected' : ''}>All Categories</option>
            ${this._categories.map(c => `<option value="${c}" ${this.filterCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="al-add-form">
          <input class="al-input" id="al-title" placeholder="Link title" />
          <input class="al-input" id="al-url" placeholder="https://..." />
          <select class="al-input al-cat-select" id="al-cat">
            ${this._categories.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
          <button class="al-btn al-btn-primary" data-action="add">Add Link</button>
        </div>
        <div class="al-list">
          ${filtered.length === 0 ? '<p class="al-empty">No links found.</p>' : filtered.map(l => this._renderLink(l)).join('')}
        </div>
      </div>`;
    this._bind();
  },

  _renderLink(l) {
    if (this.editingId === l.id) return this._renderEditRow(l);
    return `<div class="al-link-row ${l.pinned ? 'al-pinned' : ''}" data-id="${l.id}">
      <div class="al-link-main">
        <span class="al-pin-icon" data-action="pin" data-id="${l.id}">${l.pinned ? '\u2B50' : '\u2606'}</span>
        <span class="al-link-title" data-action="open" data-id="${l.id}">${this._esc(l.title)}</span>
        <span class="al-cat-badge" style="background:${this._catColor(l.category)}">${this._esc(l.category)}</span>
      </div>
      <div class="al-link-url">${this._esc(l.url)}</div>
      <div class="al-link-actions">
        <button class="al-btn al-btn-sm" data-action="edit" data-id="${l.id}">Edit</button>
        <button class="al-btn al-btn-sm al-btn-danger" data-action="delete" data-id="${l.id}">Delete</button>
      </div>
    </div>`;
  },

  _renderEditRow(l) {
    return `<div class="al-link-row al-editing" data-id="${l.id}">
      <input class="al-input" id="al-edit-title" value="${this._esc(l.title)}" />
      <input class="al-input" id="al-edit-url" value="${this._esc(l.url)}" />
      <select class="al-input al-cat-select" id="al-edit-cat">
        ${this._categories.map(c => `<option value="${c}" ${l.category === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
      <div class="al-edit-btns">
        <button class="al-btn al-btn-primary al-btn-sm" data-action="save-edit" data-id="${l.id}">Save</button>
        <button class="al-btn al-btn-sm" data-action="cancel-edit">Cancel</button>
      </div>
    </div>`;
  },

  _bind() {
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = Number(btn.dataset.id);
      if (action === 'add') this._add();
      else if (action === 'delete') { this.links = this.links.filter(l => l.id !== id); this.render(); }
      else if (action === 'edit') { this.editingId = id; this.render(); }
      else if (action === 'cancel-edit') { this.editingId = null; this.render(); }
      else if (action === 'save-edit') this._saveEdit(id);
      else if (action === 'pin') this._togglePin(id);
      else if (action === 'open') { const l = this.links.find(x => x.id === id); if (l) window.open(l.url, '_blank'); }
    });
    const search = this.container.querySelector('#al-search');
    if (search) search.addEventListener('input', (e) => { this.searchQuery = e.target.value; this.render(); });
    const filter = this.container.querySelector('#al-filter');
    if (filter) filter.addEventListener('change', (e) => { this.filterCategory = e.target.value; this.render(); });
  },

  _add() {
    const title = this.container.querySelector('#al-title').value.trim();
    const url = this.container.querySelector('#al-url').value.trim();
    const category = this.container.querySelector('#al-cat').value;
    if (!title || !url) return;
    this.links.push({ id: this.nextId++, title, url, category, pinned: false, date: Date.now() });
    this.render();
  },

  _saveEdit(id) {
    const l = this.links.find(x => x.id === id);
    if (!l) return;
    l.title = this.container.querySelector('#al-edit-title').value.trim() || l.title;
    l.url = this.container.querySelector('#al-edit-url').value.trim() || l.url;
    l.category = this.container.querySelector('#al-edit-cat').value;
    this.editingId = null;
    this.render();
  },

  _togglePin(id) {
    const l = this.links.find(x => x.id === id);
    if (l) l.pinned = !l.pinned;
    this.render();
  },

  exportState() {
    return { links: this.links, nextId: this.nextId };
  },

  importState(state) {
    if (!state) return;
    this.links = state.links || [];
    this.nextId = state.nextId || 1;
    this.filterCategory = 'all';
    this.searchQuery = '';
    this.editingId = null;
    this.render();
  }
};
