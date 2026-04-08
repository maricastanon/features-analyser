const AttachmentManager = {
  container: null,
  attachments: [],
  nextId: 1,
  viewMode: 'list',
  sortBy: 'date',
  sortAsc: false,

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

  _icon(type) {
    const map = { doc: '\u{1F4C4}', image: '\u{1F5BC}', spreadsheet: '\u{1F4CA}', other: '\u{1F4C1}' };
    return map[type] || map.other;
  },

  _formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  },

  _sorted() {
    const list = [...this.attachments];
    list.sort((a, b) => {
      let cmp = 0;
      if (this.sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (this.sortBy === 'type') cmp = a.type.localeCompare(b.type);
      else cmp = a.date - b.date;
      return this.sortAsc ? cmp : -cmp;
    });
    return list;
  },

  render() {
    const sorted = this._sorted();
    const isGrid = this.viewMode === 'grid';
    this.container.innerHTML = `
      <div class="am-panel">
        <div class="am-header">
          <h3 class="am-title">Attachments (${this.attachments.length})</h3>
          <div class="am-controls">
            <select class="am-sort-select" data-action="sort">
              <option value="date" ${this.sortBy === 'date' ? 'selected' : ''}>Date</option>
              <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Name</option>
              <option value="type" ${this.sortBy === 'type' ? 'selected' : ''}>Type</option>
            </select>
            <button class="am-btn am-btn-icon" data-action="toggle-order">${this.sortAsc ? '\u2191' : '\u2193'}</button>
            <button class="am-btn am-btn-icon ${!isGrid ? 'am-active' : ''}" data-action="view-list">\u2630</button>
            <button class="am-btn am-btn-icon ${isGrid ? 'am-active' : ''}" data-action="view-grid">\u25A6</button>
          </div>
        </div>
        <div class="am-add-form" id="am-add-form">
          <input class="am-input" type="text" placeholder="File name" id="am-name" />
          <input class="am-input" type="text" placeholder="URL or description" id="am-url" />
          <select class="am-input am-type-select" id="am-type">
            <option value="doc">Document</option>
            <option value="image">Image</option>
            <option value="spreadsheet">Spreadsheet</option>
            <option value="other">Other</option>
          </select>
          <button class="am-btn am-btn-primary" data-action="add">Add</button>
        </div>
        <div class="${isGrid ? 'am-grid' : 'am-list'}">
          ${sorted.length === 0 ? '<p class="am-empty">No attachments yet.</p>' : sorted.map(a => isGrid ? this._gridCard(a) : this._listRow(a)).join('')}
        </div>
      </div>`;
    this._bind();
  },

  _listRow(a) {
    return `<div class="am-list-row" data-id="${a.id}">
      <span class="am-file-icon">${this._icon(a.type)}</span>
      <span class="am-file-name">${this._esc(a.name)}</span>
      <span class="am-file-type">${this._esc(a.type)}</span>
      <span class="am-file-size">${this._formatSize(a.size)}</span>
      <span class="am-file-date">${new Date(a.date).toLocaleDateString()}</span>
      <button class="am-btn am-btn-danger am-btn-sm" data-action="delete" data-id="${a.id}">Delete</button>
    </div>`;
  },

  _gridCard(a) {
    return `<div class="am-grid-card" data-id="${a.id}">
      <div class="am-grid-icon">${this._icon(a.type)}</div>
      <div class="am-grid-name">${this._esc(a.name)}</div>
      <div class="am-grid-meta">${this._formatSize(a.size)} &middot; ${new Date(a.date).toLocaleDateString()}</div>
      <button class="am-btn am-btn-danger am-btn-sm" data-action="delete" data-id="${a.id}">Delete</button>
    </div>`;
  },

  _bind() {
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'add') this._add();
      else if (action === 'delete') this._confirmDelete(Number(btn.dataset.id));
      else if (action === 'confirm-del') this._delete(Number(btn.dataset.id));
      else if (action === 'cancel-del') this.render();
      else if (action === 'toggle-order') { this.sortAsc = !this.sortAsc; this.render(); }
      else if (action === 'view-list') { this.viewMode = 'list'; this.render(); }
      else if (action === 'view-grid') { this.viewMode = 'grid'; this.render(); }
    });
    const sortSel = this.container.querySelector('[data-action="sort"]');
    if (sortSel) sortSel.addEventListener('change', (e) => { this.sortBy = e.target.value; this.render(); });
  },

  _add() {
    const name = this.container.querySelector('#am-name').value.trim();
    const url = this.container.querySelector('#am-url').value.trim();
    const type = this.container.querySelector('#am-type').value;
    if (!name) return;
    this.attachments.push({
      id: this.nextId++,
      name, url, type,
      size: Math.floor(Math.random() * 5000000) + 1024,
      date: Date.now()
    });
    this.render();
  },

  _confirmDelete(id) {
    const row = this.container.querySelector(`[data-id="${id}"] .am-btn-danger`);
    if (!row) return;
    row.outerHTML = `<span class="am-confirm-group">
      <span class="am-confirm-text">Delete?</span>
      <button class="am-btn am-btn-danger am-btn-sm" data-action="confirm-del" data-id="${id}">Yes</button>
      <button class="am-btn am-btn-sm" data-action="cancel-del">No</button>
    </span>`;
  },

  _delete(id) {
    this.attachments = this.attachments.filter(a => a.id !== id);
    this.render();
  },

  exportState() {
    return { attachments: this.attachments, nextId: this.nextId, viewMode: this.viewMode, sortBy: this.sortBy, sortAsc: this.sortAsc };
  },

  importState(state) {
    if (!state) return;
    this.attachments = state.attachments || [];
    this.nextId = state.nextId || 1;
    this.viewMode = state.viewMode || 'list';
    this.sortBy = state.sortBy || 'date';
    this.sortAsc = !!state.sortAsc;
    this.render();
  }
};
