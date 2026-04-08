const MsPlannerFilterPresets = {
  container: null,
  activePresetId: null,
  nextId: 100,
  builtInPresets: [
    { id: 1, name: 'My Tasks', conditions: [{ field: 'Assignee', operator: 'is', value: 'Me' }], builtIn: true, usageCount: 0 },
    { id: 2, name: 'Overdue', conditions: [{ field: 'Due Date', operator: 'before', value: 'today' }], builtIn: true, usageCount: 0 },
    { id: 3, name: 'High Priority', conditions: [{ field: 'Priority', operator: 'is', value: 'High' }], builtIn: true, usageCount: 0 },
    { id: 4, name: 'Unassigned', conditions: [{ field: 'Assignee', operator: 'is', value: '' }], builtIn: true, usageCount: 0 },
    { id: 5, name: 'Due This Week', conditions: [{ field: 'Due Date', operator: 'before', value: 'end-of-week' }], builtIn: true, usageCount: 0 },
    { id: 6, name: 'Completed', conditions: [{ field: 'Status', operator: 'is', value: 'Completed' }], builtIn: true, usageCount: 0 }
  ],
  customPresets: [],
  editingId: null,
  editingName: '',

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.activePresetId = null;
    this.customPresets = [];
    this.editingId = null;
    this.nextId = 100;
    this.render();
  },

  applyPreset(id) {
    this.activePresetId = id;
    const all = [...this.builtInPresets, ...this.customPresets];
    const p = all.find(p => p.id === id);
    if (p) p.usageCount = (p.usageCount || 0) + 1;
    this.render();
  },

  createCustomPreset(name, conditions) {
    const preset = { id: this.nextId++, name: name || 'Custom Filter', conditions: conditions || [], builtIn: false, usageCount: 0 };
    this.customPresets.push(preset);
    this.render();
  },

  startRename(id) {
    const all = [...this.builtInPresets, ...this.customPresets];
    const p = all.find(p => p.id === id);
    if (!p || p.builtIn) return;
    this.editingId = id;
    this.editingName = p.name;
    this.render();
  },

  commitRename() {
    if (this.editingId === null) return;
    const p = this.customPresets.find(p => p.id === this.editingId);
    if (p && this.editingName.trim()) p.name = this.editingName.trim();
    this.editingId = null;
    this.render();
  },

  deletePreset(id) {
    this.customPresets = this.customPresets.filter(p => p.id !== id);
    if (this.activePresetId === id) this.activePresetId = null;
    this.render();
  },

  render() {
    if (!this.container) return;
    const allPresets = [...this.builtInPresets, ...this.customPresets];

    let html = `<div class="pfp-panel">
      <div class="pfp-header"><h3>Filter Presets</h3></div>
      <div class="pfp-section-label">Built-in</div>
      <div class="pfp-list">`;

    this.builtInPresets.forEach(p => {
      const active = p.id === this.activePresetId ? ' pfp-active' : '';
      html += `<div class="pfp-preset-item${active}" data-action="apply" data-id="${p.id}">
        <span class="pfp-preset-name">${this._esc(p.name)}</span>
        <span class="pfp-usage-badge" title="Used ${p.usageCount} times">${p.usageCount}</span>
      </div>`;
    });

    html += `</div><div class="pfp-section-label">Custom</div><div class="pfp-list">`;

    if (this.customPresets.length === 0) {
      html += `<div class="pfp-empty">No custom presets yet</div>`;
    }

    this.customPresets.forEach(p => {
      const active = p.id === this.activePresetId ? ' pfp-active' : '';
      if (this.editingId === p.id) {
        html += `<div class="pfp-preset-item pfp-editing">
          <input class="pfp-rename-input" type="text" value="${this._esc(this.editingName)}" data-action="rename-input" />
          <button class="pfp-save-rename" data-action="commit-rename">Save</button>
        </div>`;
      } else {
        html += `<div class="pfp-preset-item${active}">
          <span class="pfp-preset-name" data-action="apply" data-id="${p.id}">${this._esc(p.name)}</span>
          <span class="pfp-usage-badge">${p.usageCount}</span>
          <button class="pfp-icon-btn" data-action="rename" data-id="${p.id}" title="Rename">&#9998;</button>
          <button class="pfp-icon-btn pfp-delete-btn" data-action="delete" data-id="${p.id}" title="Delete">&times;</button>
        </div>`;
      }
    });

    html += `</div>
      <div class="pfp-create-section">
        <input class="pfp-new-name" type="text" placeholder="New preset name..." data-ref="new-name" />
        <button class="pfp-create-btn" data-action="create">+ Create Preset</button>
      </div></div>`;

    this.container.innerHTML = html;

    this.container.onclick = (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.dataset.action;
      const id = Number(el.dataset.id);
      if (action === 'apply') this.applyPreset(id);
      else if (action === 'rename') this.startRename(id);
      else if (action === 'delete') this.deletePreset(id);
      else if (action === 'commit-rename') this.commitRename();
      else if (action === 'create') {
        const input = this.container.querySelector('[data-ref="new-name"]');
        if (input && input.value.trim()) { this.createCustomPreset(input.value.trim(), []); }
      }
    };

    this.container.oninput = (e) => {
      if (e.target.dataset.action === 'rename-input') this.editingName = e.target.value;
    };

    this.container.onkeydown = (e) => {
      if (e.key === 'Enter' && e.target.dataset.action === 'rename-input') this.commitRename();
      if (e.key === 'Enter' && e.target.dataset.ref === 'new-name' && e.target.value.trim()) {
        this.createCustomPreset(e.target.value.trim(), []);
      }
    };
  },

  exportState() {
    return { activePresetId: this.activePresetId, customPresets: JSON.parse(JSON.stringify(this.customPresets)), builtInPresets: JSON.parse(JSON.stringify(this.builtInPresets)), nextId: this.nextId };
  },

  importState(state) {
    if (!state) return;
    this.activePresetId = state.activePresetId ?? null;
    this.customPresets = state.customPresets || [];
    this.builtInPresets = state.builtInPresets || this.builtInPresets;
    this.nextId = state.nextId || 100;
    this.render();
  }
};
