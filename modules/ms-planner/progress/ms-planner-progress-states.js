const MsPlannerProgressStates = {
  container: null,
  states: [],
  nextId: 1,
  autoTransitions: [],
  nextAutoId: 1,
  editingId: null,
  editingName: '',
  editingColor: '',
  editingIcon: '',
  showColorPicker: null,
  dragSrcId: null,
  colorOptions: ['#6c757d', '#007bff', '#fd7e14', '#dc3545', '#28a745', '#6f42c1', '#e83e8c', '#17a2b8', '#ffc107', '#20c997'],
  iconOptions: ['\u{25CB}', '\u{25CF}', '\u{25B6}', '\u{2714}', '\u{2716}', '\u{2605}', '\u{26A0}', '\u{1F512}', '\u{23F8}', '\u{267B}'],

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.states = [
      { id: this.nextId++, name: 'Not Started', color: '#6c757d', icon: '\u{25CB}' },
      { id: this.nextId++, name: 'In Progress', color: '#007bff', icon: '\u{25B6}' },
      { id: this.nextId++, name: 'Completed', color: '#28a745', icon: '\u{2714}' }
    ];
    this.autoTransitions = [
      { id: this.nextAutoId++, trigger: 'All checklist items done', targetState: 'Completed' }
    ];
    this.editingId = null;
    this.dragSrcId = null;
    this.render();
  },

  addState() {
    const pos = this.states.length > 1 ? this.states.length - 1 : this.states.length;
    this.states.splice(pos, 0, { id: this.nextId++, name: '', color: '#6c757d', icon: '\u{25CB}' });
    this.editingId = this.states[pos].id;
    this.editingName = '';
    this.editingColor = '#6c757d';
    this.editingIcon = '\u{25CB}';
    this.render();
  },

  removeState(id) {
    if (this.states.length <= 2) return;
    this.states = this.states.filter(s => s.id !== id);
    if (this.editingId === id) this.editingId = null;
    this.render();
  },

  startEdit(id) {
    const s = this.states.find(s => s.id === id);
    if (!s) return;
    this.editingId = id;
    this.editingName = s.name;
    this.editingColor = s.color;
    this.editingIcon = s.icon;
    this.render();
  },

  commitEdit() {
    const s = this.states.find(s => s.id === this.editingId);
    if (s) {
      s.name = this.editingName.trim() || s.name;
      s.color = this.editingColor;
      s.icon = this.editingIcon;
    }
    this.editingId = null;
    this.showColorPicker = null;
    this.render();
  },

  moveState(fromId, toId) {
    const fromIdx = this.states.findIndex(s => s.id === fromId);
    const toIdx = this.states.findIndex(s => s.id === toId);
    if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;
    const [item] = this.states.splice(fromIdx, 1);
    this.states.splice(toIdx, 0, item);
    this.render();
  },

  addAutoTransition() {
    this.autoTransitions.push({ id: this.nextAutoId++, trigger: '', targetState: this.states.length ? this.states[this.states.length - 1].name : '' });
    this.render();
  },

  removeAutoTransition(id) {
    this.autoTransitions = this.autoTransitions.filter(a => a.id !== id);
    this.render();
  },

  render() {
    if (!this.container) return;

    let html = `<div class="pps-panel">
      <div class="pps-header"><h3>Status Workflow</h3></div>
      <div class="pps-workflow-diagram">`;

    this.states.forEach((s, i) => {
      if (i > 0) html += `<div class="pps-arrow">\u{2192}</div>`;
      const editing = s.id === this.editingId;
      if (editing) {
        html += `<div class="pps-state-box pps-state-editing" draggable="false">
          <input class="pps-edit-name" type="text" value="${this._esc(this.editingName)}" placeholder="State name..." data-ref="edit-name" />
          <div class="pps-edit-row">
            <div class="pps-color-pick-wrap">
              <button class="pps-color-swatch" data-action="toggle-color" data-id="${s.id}" style="background:${this._esc(this.editingColor)}"></button>
              ${this.showColorPicker === s.id ? `<div class="pps-color-grid">${this.colorOptions.map(c => `<button class="pps-color-opt" data-action="pick-color" data-color="${c}" style="background:${c}"></button>`).join('')}</div>` : ''}
            </div>
            <div class="pps-icon-pick-wrap">
              ${this.iconOptions.map(ic => `<button class="pps-icon-opt ${ic === this.editingIcon ? 'pps-icon-selected' : ''}" data-action="pick-icon" data-icon="${ic}">${ic}</button>`).join('')}
            </div>
          </div>
          <div class="pps-edit-actions">
            <button class="pps-save-btn" data-action="commit-edit">Save</button>
            <button class="pps-cancel-btn" data-action="cancel-edit">Cancel</button>
          </div>
        </div>`;
      } else {
        html += `<div class="pps-state-box" draggable="true" data-drag-id="${s.id}" data-action="edit-state" data-id="${s.id}">
          <span class="pps-state-icon" style="color:${this._esc(s.color)}">${s.icon}</span>
          <span class="pps-state-label">${this._esc(s.name)}</span>
          <button class="pps-remove-state" data-action="remove-state" data-id="${s.id}" title="Remove">&times;</button>
        </div>`;
      }
    });

    html += `<button class="pps-add-state-btn" data-action="add-state">+</button>
      </div>
      <div class="pps-section">
        <div class="pps-section-label">Auto-Transitions</div>`;

    this.autoTransitions.forEach(a => {
      html += `<div class="pps-auto-row">
        <span class="pps-auto-when">WHEN</span>
        <input class="pps-auto-trigger" type="text" value="${this._esc(a.trigger)}" placeholder="Trigger condition..." data-ref="auto-trigger" data-aid="${a.id}" />
        <span class="pps-auto-then">\u{2192}</span>
        <select class="pps-auto-target" data-ref="auto-target" data-aid="${a.id}">
          ${this.states.map(s => `<option value="${this._esc(s.name)}" ${s.name === a.targetState ? 'selected' : ''}>${this._esc(s.name)}</option>`).join('')}
        </select>
        <button class="pps-auto-remove" data-action="remove-auto" data-aid="${a.id}">&times;</button>
      </div>`;
    });

    html += `<button class="pps-add-auto-btn" data-action="add-auto">+ Add Auto-Transition</button>
      </div></div>`;

    this.container.innerHTML = html;

    this.container.onclick = (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.dataset.action;
      if (action === 'add-state') this.addState();
      else if (action === 'remove-state') { e.stopPropagation(); this.removeState(Number(el.dataset.id)); }
      else if (action === 'edit-state') this.startEdit(Number(el.dataset.id));
      else if (action === 'commit-edit') this.commitEdit();
      else if (action === 'cancel-edit') { this.editingId = null; this.showColorPicker = null; this.render(); }
      else if (action === 'toggle-color') { this.showColorPicker = this.showColorPicker === Number(el.dataset.id) ? null : Number(el.dataset.id); this.render(); }
      else if (action === 'pick-color') { this.editingColor = el.dataset.color; this.showColorPicker = null; this.render(); }
      else if (action === 'pick-icon') { this.editingIcon = el.dataset.icon; this.render(); }
      else if (action === 'add-auto') this.addAutoTransition();
      else if (action === 'remove-auto') this.removeAutoTransition(Number(el.dataset.aid));
    };

    this.container.oninput = (e) => {
      if (e.target.dataset.ref === 'edit-name') this.editingName = e.target.value;
      else if (e.target.dataset.ref === 'auto-trigger') {
        const a = this.autoTransitions.find(a => a.id === Number(e.target.dataset.aid));
        if (a) a.trigger = e.target.value;
      }
    };

    this.container.onchange = (e) => {
      if (e.target.dataset.ref === 'auto-target') {
        const a = this.autoTransitions.find(a => a.id === Number(e.target.dataset.aid));
        if (a) a.targetState = e.target.value;
      }
    };

    // Drag and drop reorder
    this.container.querySelectorAll('[draggable="true"]').forEach(el => {
      el.ondragstart = (e) => { this.dragSrcId = Number(el.dataset.dragId); e.dataTransfer.effectAllowed = 'move'; };
      el.ondragover = (e) => { e.preventDefault(); el.classList.add('pps-drag-over'); };
      el.ondragleave = () => { el.classList.remove('pps-drag-over'); };
      el.ondrop = (e) => { e.preventDefault(); el.classList.remove('pps-drag-over'); this.moveState(this.dragSrcId, Number(el.dataset.dragId)); };
    });
  },

  exportState() {
    return {
      states: JSON.parse(JSON.stringify(this.states)),
      autoTransitions: JSON.parse(JSON.stringify(this.autoTransitions)),
      nextId: this.nextId, nextAutoId: this.nextAutoId
    };
  },

  importState(state) {
    if (!state) return;
    this.states = state.states || [];
    this.autoTransitions = state.autoTransitions || [];
    this.nextId = state.nextId || 1;
    this.nextAutoId = state.nextAutoId || 1;
    this.render();
  }
};
