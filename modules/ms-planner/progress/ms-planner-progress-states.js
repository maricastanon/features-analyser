const MsPlannerProgressStates = {
  container: null,
  states: [
    { id: 1, name: 'Not Started', color: '#95a5a6', isDefault: true, taskCount: 3, autoRule: null },
    { id: 2, name: 'In Progress', color: '#e84393', isDefault: true, taskCount: 3, autoRule: null },
    { id: 3, name: 'Completed', color: '#00b894', isDefault: true, taskCount: 4, autoRule: null }
  ],
  _nextId: 4,
  _showForm: false,
  _insertAfter: null,

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
  },

  _addState() {
    const nameEl = this.container.querySelector('.pps-input-name');
    const colorEl = this.container.querySelector('.pps-input-color');
    if (!nameEl || !nameEl.value.trim()) return;
    const idx = this._insertAfter !== null
      ? this.states.findIndex(s => s.id === this._insertAfter) + 1
      : this.states.length - 1;
    this.states.splice(idx, 0, {
      id: this._nextId++, name: nameEl.value.trim(), color: colorEl.value,
      isDefault: false, taskCount: 0, autoRule: null
    });
    this._showForm = false;
    this._insertAfter = null;
    this.render();
  },

  _deleteState(id) {
    const st = this.states.find(s => s.id === id);
    if (!st || st.isDefault) return;
    this.states = this.states.filter(s => s.id !== id);
    this.render();
  },

  _moveState(id, dir) {
    const idx = this.states.findIndex(s => s.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= this.states.length) return;
    const temp = this.states[idx];
    this.states[idx] = this.states[newIdx];
    this.states[newIdx] = temp;
    this.render();
  },

  _setAutoRule(id, targetStateName) {
    const st = this.states.find(s => s.id === id);
    if (st) st.autoRule = targetStateName || null;
    this.render();
  },

  _showInsertForm(afterId) {
    this._showForm = true;
    this._insertAfter = afterId;
    this.render();
  },

  render() {
    if (!this.container) return;
    const stateNames = this.states.map(s => s.name);

    let formHtml = '';
    if (this._showForm) {
      formHtml = `<div class="pps-add-form">
        <input class="pps-input-name pps-input" placeholder="State name" />
        <input class="pps-input-color pps-input" type="color" value="#6c5ce7" />
        <button class="pps-btn pps-btn-save" data-action="saveState">Add</button>
        <button class="pps-btn pps-btn-cancel" data-action="cancelForm">Cancel</button>
      </div>`;
    }

    let html = `<div class="pps-panel">
      <div class="pps-header">
        <h3>Task Status Workflow</h3>
      </div>
      <div class="pps-workflow">
        ${this.states.map((s, i) => {
          const arrow = i < this.states.length - 1
            ? `<div class="pps-arrow-wrap">
                <div class="pps-arrow"></div>
                <button class="pps-btn-insert" data-action="insertAfter" data-id="${s.id}" title="Insert state here">+</button>
              </div>` : '';
          const autoOptions = stateNames.filter(n => n !== s.name).map(n =>
            `<option value="${this._esc(n)}" ${s.autoRule === n ? 'selected' : ''}>${this._esc(n)}</option>`
          ).join('');
          return `<div class="pps-state-card" style="border-left:4px solid ${s.color}">
            <div class="pps-state-top">
              <span class="pps-state-color-dot" style="background:${s.color}"></span>
              <span class="pps-state-name">${this._esc(s.name)}</span>
              <span class="pps-state-count">${s.taskCount} tasks</span>
            </div>
            <div class="pps-state-controls">
              <button class="pps-btn-move" data-action="moveUp" data-id="${s.id}" ${i === 0 ? 'disabled' : ''}>&#9650;</button>
              <button class="pps-btn-move" data-action="moveDown" data-id="${s.id}" ${i === this.states.length - 1 ? 'disabled' : ''}>&#9660;</button>
              ${!s.isDefault ? `<button class="pps-btn-del" data-action="deleteState" data-id="${s.id}">&times;</button>` : ''}
            </div>
            <div class="pps-auto-rule">
              <label class="pps-auto-label">When all checklist items done &rarr;</label>
              <select class="pps-auto-select" data-action="setAutoRule" data-id="${s.id}">
                <option value="">No auto-transition</option>
                ${autoOptions}
              </select>
            </div>
          </div>${arrow}`;
        }).join('')}
      </div>
      ${this._showForm && this._insertAfter !== null ? formHtml : ''}
      ${!this._showForm ? `<button class="pps-btn pps-btn-add" data-action="showForm">+ Add Custom State</button>` : ''}
      ${this._showForm && this._insertAfter === null ? formHtml : ''}
    </div>`;

    this.container.innerHTML = html;
    this.container.onclick = (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = Number(btn.dataset.id);
      if (action === 'showForm') { this._showForm = true; this._insertAfter = null; this.render(); }
      else if (action === 'cancelForm') { this._showForm = false; this.render(); }
      else if (action === 'saveState') { this._addState(); }
      else if (action === 'deleteState') { this._deleteState(id); }
      else if (action === 'moveUp') { this._moveState(id, -1); }
      else if (action === 'moveDown') { this._moveState(id, 1); }
      else if (action === 'insertAfter') { this._showInsertForm(id); }
    };
    this.container.onchange = (e) => {
      const sel = e.target.closest('[data-action="setAutoRule"]');
      if (sel) this._setAutoRule(Number(sel.dataset.id), sel.value);
    };
  },

  exportState() {
    return { states: JSON.parse(JSON.stringify(this.states)), _nextId: this._nextId };
  },

  importState(state) {
    if (!state) return;
    this.states = state.states || [];
    this._nextId = state._nextId || this.states.length + 1;
    this.render();
  }
};
