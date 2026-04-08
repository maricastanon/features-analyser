const AttachmentPreview = {
  container: null,
  attachments: [],
  nextId: 1,
  selectedIndex: -1,
  editing: false,

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

  _current() {
    return this.attachments[this.selectedIndex] || null;
  },

  render() {
    const att = this._current();
    this.container.innerHTML = `
      <div class="ap-panel">
        <div class="ap-sidebar">
          <h4 class="ap-sidebar-title">Files</h4>
          <div class="ap-file-list">
            ${this.attachments.map((a, i) => `
              <div class="ap-file-item ${i === this.selectedIndex ? 'ap-file-selected' : ''}" data-action="select" data-index="${i}">
                <span class="ap-file-icon">${this._icon(a.type)}</span>
                <span class="ap-file-label">${this._esc(a.name)}</span>
              </div>`).join('')}
          </div>
          <div class="ap-add-section">
            <input class="ap-input" id="ap-add-name" placeholder="File name" />
            <select class="ap-input" id="ap-add-type">
              <option value="doc">Document</option>
              <option value="image">Image</option>
              <option value="spreadsheet">Spreadsheet</option>
              <option value="other">Other</option>
            </select>
            <button class="ap-btn ap-btn-primary" data-action="add">Add File</button>
          </div>
        </div>
        <div class="ap-preview">
          ${att ? this._renderPreview(att) : '<div class="ap-no-selection">Select a file to preview</div>'}
        </div>
      </div>`;
    this._bind();
  },

  _renderPreview(att) {
    if (this.editing) return this._renderEditor(att);
    const isImage = att.type === 'image';
    return `
      <div class="ap-preview-header">
        <button class="ap-btn ap-nav-btn" data-action="prev" ${this.selectedIndex <= 0 ? 'disabled' : ''}>\u25C0 Prev</button>
        <span class="ap-preview-title">${this._icon(att.type)} ${this._esc(att.name)}</span>
        <button class="ap-btn ap-nav-btn" data-action="next" ${this.selectedIndex >= this.attachments.length - 1 ? 'disabled' : ''}>Next \u25B6</button>
      </div>
      <div class="ap-preview-area">
        ${isImage
          ? '<div class="ap-image-placeholder">Image Preview Placeholder</div>'
          : '<div class="ap-doc-placeholder">' + this._icon(att.type) + '<br>' + this._esc(att.type.toUpperCase()) + ' Document</div>'}
      </div>
      <div class="ap-meta-grid">
        <div class="ap-meta-row"><span class="ap-meta-label">Name</span><span class="ap-meta-value">${this._esc(att.name)}</span></div>
        <div class="ap-meta-row"><span class="ap-meta-label">Type</span><span class="ap-meta-value">${this._esc(att.type)}</span></div>
        <div class="ap-meta-row"><span class="ap-meta-label">Size</span><span class="ap-meta-value">${this._formatSize(att.size)}</span></div>
        <div class="ap-meta-row"><span class="ap-meta-label">Uploaded by</span><span class="ap-meta-value">${this._esc(att.uploadedBy)}</span></div>
        <div class="ap-meta-row"><span class="ap-meta-label">Date</span><span class="ap-meta-value">${new Date(att.date).toLocaleString()}</span></div>
        <div class="ap-meta-row"><span class="ap-meta-label">Description</span><span class="ap-meta-value">${this._esc(att.description || 'None')}</span></div>
      </div>
      <div class="ap-actions">
        <button class="ap-btn ap-btn-primary" data-action="open">Open / Download</button>
        <button class="ap-btn" data-action="edit">Edit Metadata</button>
        <button class="ap-btn ap-btn-danger" data-action="delete">Delete</button>
      </div>`;
  },

  _renderEditor(att) {
    return `
      <div class="ap-preview-header">
        <span class="ap-preview-title">Edit: ${this._esc(att.name)}</span>
      </div>
      <div class="ap-edit-form">
        <label class="ap-edit-label">Name</label>
        <input class="ap-input" id="ap-edit-name" value="${this._esc(att.name)}" />
        <label class="ap-edit-label">Description</label>
        <textarea class="ap-input ap-textarea" id="ap-edit-desc">${this._esc(att.description || '')}</textarea>
        <div class="ap-edit-actions">
          <button class="ap-btn ap-btn-primary" data-action="save-edit">Save</button>
          <button class="ap-btn" data-action="cancel-edit">Cancel</button>
        </div>
      </div>`;
  },

  _bind() {
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'select') { this.selectedIndex = Number(btn.dataset.index); this.editing = false; this.render(); }
      else if (action === 'prev' && this.selectedIndex > 0) { this.selectedIndex--; this.editing = false; this.render(); }
      else if (action === 'next' && this.selectedIndex < this.attachments.length - 1) { this.selectedIndex++; this.editing = false; this.render(); }
      else if (action === 'add') this._add();
      else if (action === 'edit') { this.editing = true; this.render(); }
      else if (action === 'cancel-edit') { this.editing = false; this.render(); }
      else if (action === 'save-edit') this._saveEdit();
      else if (action === 'delete') this._delete();
      else if (action === 'open') { const a = this._current(); if (a) alert('Opening: ' + a.name); }
    });
  },

  _add() {
    const name = this.container.querySelector('#ap-add-name').value.trim();
    const type = this.container.querySelector('#ap-add-type').value;
    if (!name) return;
    this.attachments.push({
      id: this.nextId++, name, type,
      size: Math.floor(Math.random() * 5000000) + 1024,
      uploadedBy: 'Current User',
      date: Date.now(),
      description: ''
    });
    this.selectedIndex = this.attachments.length - 1;
    this.render();
  },

  _saveEdit() {
    const att = this._current();
    if (!att) return;
    att.name = this.container.querySelector('#ap-edit-name').value.trim() || att.name;
    att.description = this.container.querySelector('#ap-edit-desc').value.trim();
    this.editing = false;
    this.render();
  },

  _delete() {
    if (this.selectedIndex < 0) return;
    this.attachments.splice(this.selectedIndex, 1);
    if (this.selectedIndex >= this.attachments.length) this.selectedIndex = this.attachments.length - 1;
    this.editing = false;
    this.render();
  },

  exportState() {
    return { attachments: this.attachments, nextId: this.nextId, selectedIndex: this.selectedIndex };
  },

  importState(state) {
    if (!state) return;
    this.attachments = state.attachments || [];
    this.nextId = state.nextId || 1;
    this.selectedIndex = state.selectedIndex ?? -1;
    this.editing = false;
    this.render();
  }
};
