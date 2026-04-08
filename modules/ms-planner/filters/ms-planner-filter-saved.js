const MsPlannerFilterSaved = {
  container: null,
  savedFilters: [],
  nextId: 1,
  editingId: null,
  editingName: '',

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  },

  _formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.savedFilters = [
      { id: this.nextId++, name: 'My overdue high-pri', conditions: [{ field: 'Priority', operator: 'is', value: 'High' }, { field: 'Due Date', operator: 'before', value: 'today' }], logic: 'AND', created: '2026-04-01T10:00:00Z', shared: false },
      { id: this.nextId++, name: 'Unassigned bugs', conditions: [{ field: 'Label', operator: 'is', value: 'Bug' }, { field: 'Assignee', operator: 'is', value: '' }], logic: 'AND', created: '2026-04-03T14:30:00Z', shared: true }
    ];
    this.editingId = null;
    this.render();
  },

  addFilter(name, conditions, logic) {
    this.savedFilters.push({
      id: this.nextId++, name: name || 'Untitled Filter',
      conditions: conditions || [], logic: logic || 'AND',
      created: new Date().toISOString(), shared: false
    });
    this.render();
  },

  deleteFilter(id) {
    this.savedFilters = this.savedFilters.filter(f => f.id !== id);
    this.render();
  },

  duplicateFilter(id) {
    const orig = this.savedFilters.find(f => f.id === id);
    if (!orig) return;
    this.addFilter(orig.name + ' (copy)', JSON.parse(JSON.stringify(orig.conditions)), orig.logic);
  },

  toggleShare(id) {
    const f = this.savedFilters.find(f => f.id === id);
    if (f) f.shared = !f.shared;
    this.render();
  },

  startEdit(id) {
    const f = this.savedFilters.find(f => f.id === id);
    if (!f) return;
    this.editingId = id;
    this.editingName = f.name;
    this.render();
  },

  commitEdit() {
    const f = this.savedFilters.find(f => f.id === this.editingId);
    if (f && this.editingName.trim()) f.name = this.editingName.trim();
    this.editingId = null;
    this.render();
  },

  conditionSummary(filter) {
    return filter.conditions.map(c => `${c.field} ${c.operator} "${c.value}"`).join(` ${filter.logic} `) || 'No conditions';
  },

  exportFiltersJSON() {
    const blob = new Blob([JSON.stringify(this.savedFilters, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'planner-filters.json'; a.click();
    URL.revokeObjectURL(url);
  },

  importFiltersJSON(jsonStr) {
    try {
      const arr = JSON.parse(jsonStr);
      if (!Array.isArray(arr)) return;
      arr.forEach(f => {
        this.savedFilters.push({ ...f, id: this.nextId++, created: f.created || new Date().toISOString() });
      });
      this.render();
    } catch (e) { /* invalid JSON */ }
  },

  render() {
    if (!this.container) return;
    let html = `<div class="pfs-panel">
      <div class="pfs-header">
        <h3>Saved Filters</h3>
        <div class="pfs-header-actions">
          <button class="pfs-export-btn" data-action="export">Export JSON</button>
          <label class="pfs-import-btn">Import JSON<input type="file" accept=".json" data-action="import" hidden /></label>
        </div>
      </div>
      <div class="pfs-create-row">
        <input type="text" class="pfs-new-input" placeholder="New filter name..." data-ref="new-name" />
        <button class="pfs-add-btn" data-action="add">+ Save Filter</button>
      </div>
      <div class="pfs-list">`;

    if (this.savedFilters.length === 0) {
      html += `<div class="pfs-empty">No saved filters</div>`;
    }

    this.savedFilters.forEach(f => {
      if (this.editingId === f.id) {
        html += `<div class="pfs-item pfs-item-editing">
          <input class="pfs-edit-input" type="text" value="${this._esc(this.editingName)}" data-action="edit-input" />
          <button class="pfs-save-edit" data-action="commit-edit">Save</button>
        </div>`;
      } else {
        html += `<div class="pfs-item">
          <div class="pfs-item-main">
            <div class="pfs-item-top">
              <span class="pfs-filter-name">${this._esc(f.name)}</span>
              <span class="pfs-share-badge ${f.shared ? 'pfs-shared' : ''}" data-action="toggle-share" data-id="${f.id}">${f.shared ? 'Shared' : 'Personal'}</span>
            </div>
            <div class="pfs-condition-summary">${this._esc(this.conditionSummary(f))}</div>
            <div class="pfs-created">Created ${this._esc(this._formatDate(f.created))}</div>
          </div>
          <div class="pfs-item-actions">
            <button class="pfs-action-btn" data-action="apply" data-id="${f.id}" title="Apply">&#9654;</button>
            <button class="pfs-action-btn" data-action="edit" data-id="${f.id}" title="Edit">&#9998;</button>
            <button class="pfs-action-btn" data-action="duplicate" data-id="${f.id}" title="Duplicate">&#10697;</button>
            <button class="pfs-action-btn pfs-del-btn" data-action="delete" data-id="${f.id}" title="Delete">&times;</button>
          </div>
        </div>`;
      }
    });

    html += `</div></div>`;
    this.container.innerHTML = html;

    this.container.onclick = (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.dataset.action;
      const id = Number(el.dataset.id);
      if (action === 'add') {
        const input = this.container.querySelector('[data-ref="new-name"]');
        if (input && input.value.trim()) this.addFilter(input.value.trim());
      }
      else if (action === 'delete') this.deleteFilter(id);
      else if (action === 'duplicate') this.duplicateFilter(id);
      else if (action === 'toggle-share') this.toggleShare(id);
      else if (action === 'edit') this.startEdit(id);
      else if (action === 'commit-edit') this.commitEdit();
      else if (action === 'export') this.exportFiltersJSON();
      else if (action === 'apply') { /* apply placeholder */ }
    };

    this.container.oninput = (e) => {
      if (e.target.dataset.action === 'edit-input') this.editingName = e.target.value;
    };

    this.container.onkeydown = (e) => {
      if (e.key === 'Enter' && e.target.dataset.action === 'edit-input') this.commitEdit();
      if (e.key === 'Enter' && e.target.dataset.ref === 'new-name' && e.target.value.trim()) this.addFilter(e.target.value.trim());
    };

    const fileInput = this.container.querySelector('[data-action="import"]');
    if (fileInput) {
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => this.importFiltersJSON(ev.target.result);
        reader.readAsText(file);
      };
    }
  },

  exportState() {
    return { savedFilters: JSON.parse(JSON.stringify(this.savedFilters)), nextId: this.nextId };
  },

  importState(state) {
    if (!state) return;
    this.savedFilters = state.savedFilters || [];
    this.nextId = state.nextId || 1;
    this.render();
  }
};
