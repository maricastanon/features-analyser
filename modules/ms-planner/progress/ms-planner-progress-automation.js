const MsPlannerProgressAutomation = {
  container: null,
  rules: [],
  nextId: 1,
  editingId: null,
  editForm: { trigger: '', action: '' },
  triggers: ['Task created', 'Task completed', 'Due date passed', 'Checklist complete', 'Task assigned'],
  actions: ['Change status', 'Set priority', 'Add label', 'Notify member', 'Move to bucket'],
  executionLog: [],
  nextLogId: 1,

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  },

  _formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.rules = [
      { id: this.nextId++, trigger: 'Task completed', action: 'Change status', active: true },
      { id: this.nextId++, trigger: 'Due date passed', action: 'Set priority', active: true },
      { id: this.nextId++, trigger: 'Checklist complete', action: 'Add label', active: false }
    ];
    this.executionLog = [
      { id: this.nextLogId++, ruleId: 1, trigger: 'Task completed', action: 'Change status', timestamp: '2026-04-09T10:15:00Z', taskName: 'API docs' },
      { id: this.nextLogId++, ruleId: 2, trigger: 'Due date passed', action: 'Set priority', timestamp: '2026-04-09T08:00:00Z', taskName: 'QA review' },
      { id: this.nextLogId++, ruleId: 1, trigger: 'Task completed', action: 'Change status', timestamp: '2026-04-08T16:30:00Z', taskName: 'User guide' },
      { id: this.nextLogId++, ruleId: 2, trigger: 'Due date passed', action: 'Set priority', timestamp: '2026-04-08T08:00:00Z', taskName: 'Perf testing' },
      { id: this.nextLogId++, ruleId: 3, trigger: 'Checklist complete', action: 'Add label', timestamp: '2026-04-07T14:20:00Z', taskName: 'Design mockups' }
    ];
    this.editingId = null;
    this.render();
  },

  addRule() {
    this.editingId = 'new';
    this.editForm = { trigger: this.triggers[0], action: this.actions[0] };
    this.render();
  },

  saveNewRule() {
    this.rules.push({ id: this.nextId++, trigger: this.editForm.trigger, action: this.editForm.action, active: true });
    this.editingId = null;
    this.render();
  },

  startEdit(id) {
    const r = this.rules.find(r => r.id === id);
    if (!r) return;
    this.editingId = id;
    this.editForm = { trigger: r.trigger, action: r.action };
    this.render();
  },

  saveEdit() {
    const r = this.rules.find(r => r.id === this.editingId);
    if (r) { r.trigger = this.editForm.trigger; r.action = this.editForm.action; }
    this.editingId = null;
    this.render();
  },

  deleteRule(id) {
    this.rules = this.rules.filter(r => r.id !== id);
    this.render();
  },

  toggleRule(id) {
    const r = this.rules.find(r => r.id === id);
    if (r) r.active = !r.active;
    this.render();
  },

  render() {
    if (!this.container) return;

    let html = `<div class="ppa-panel">
      <div class="ppa-header">
        <h3>Automation Rules</h3>
        <button class="ppa-add-rule-btn" data-action="add-rule">+ New Rule</button>
      </div>`;

    if (this.editingId === 'new') {
      html += `<div class="ppa-edit-form">
        <div class="ppa-rule-builder">
          <span class="ppa-when-label">WHEN</span>
          <select class="ppa-trigger-select" data-ref="trigger">
            ${this.triggers.map(t => `<option value="${this._esc(t)}" ${t === this.editForm.trigger ? 'selected' : ''}>${this._esc(t)}</option>`).join('')}
          </select>
          <span class="ppa-then-label">THEN</span>
          <select class="ppa-action-select" data-ref="action">
            ${this.actions.map(a => `<option value="${this._esc(a)}" ${a === this.editForm.action ? 'selected' : ''}>${this._esc(a)}</option>`).join('')}
          </select>
        </div>
        <div class="ppa-edit-actions">
          <button class="ppa-save-btn" data-action="save-new">Save</button>
          <button class="ppa-cancel-btn" data-action="cancel">Cancel</button>
        </div>
      </div>`;
    }

    html += `<div class="ppa-rules-list">`;

    if (this.rules.length === 0) {
      html += `<div class="ppa-empty">No automation rules yet. Create one to get started.</div>`;
    }

    this.rules.forEach(r => {
      if (this.editingId === r.id) {
        html += `<div class="ppa-rule-item ppa-rule-editing">
          <div class="ppa-rule-builder">
            <span class="ppa-when-label">WHEN</span>
            <select class="ppa-trigger-select" data-ref="trigger">
              ${this.triggers.map(t => `<option value="${this._esc(t)}" ${t === this.editForm.trigger ? 'selected' : ''}>${this._esc(t)}</option>`).join('')}
            </select>
            <span class="ppa-then-label">THEN</span>
            <select class="ppa-action-select" data-ref="action">
              ${this.actions.map(a => `<option value="${this._esc(a)}" ${a === this.editForm.action ? 'selected' : ''}>${this._esc(a)}</option>`).join('')}
            </select>
          </div>
          <div class="ppa-edit-actions">
            <button class="ppa-save-btn" data-action="save-edit">Save</button>
            <button class="ppa-cancel-btn" data-action="cancel">Cancel</button>
          </div>
        </div>`;
      } else {
        html += `<div class="ppa-rule-item ${r.active ? '' : 'ppa-rule-inactive'}">
          <div class="ppa-rule-toggle">
            <label class="ppa-switch">
              <input type="checkbox" ${r.active ? 'checked' : ''} data-action="toggle" data-id="${r.id}" />
              <span class="ppa-slider"></span>
            </label>
          </div>
          <div class="ppa-rule-desc">
            <span class="ppa-when-tag">WHEN</span> ${this._esc(r.trigger)}
            <span class="ppa-then-tag">THEN</span> ${this._esc(r.action)}
          </div>
          <div class="ppa-rule-actions">
            <button class="ppa-edit-btn" data-action="edit" data-id="${r.id}" title="Edit">&#9998;</button>
            <button class="ppa-delete-btn" data-action="delete" data-id="${r.id}" title="Delete">&times;</button>
          </div>
        </div>`;
      }
    });

    html += `</div>
      <div class="ppa-log-section">
        <div class="ppa-section-label">Execution Log (Last 5)</div>
        <div class="ppa-log-list">`;

    this.executionLog.slice(0, 5).forEach(log => {
      html += `<div class="ppa-log-item">
        <span class="ppa-log-time">${this._esc(this._formatTime(log.timestamp))}</span>
        <span class="ppa-log-desc">${this._esc(log.trigger)} &rarr; ${this._esc(log.action)}</span>
        <span class="ppa-log-task">${this._esc(log.taskName)}</span>
      </div>`;
    });

    if (this.executionLog.length === 0) {
      html += `<div class="ppa-log-empty">No executions yet</div>`;
    }

    html += `</div></div></div>`;

    this.container.innerHTML = html;

    this.container.onclick = (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.dataset.action;
      const id = Number(el.dataset.id);
      if (action === 'add-rule') this.addRule();
      else if (action === 'save-new') this.saveNewRule();
      else if (action === 'edit') this.startEdit(id);
      else if (action === 'save-edit') this.saveEdit();
      else if (action === 'cancel') { this.editingId = null; this.render(); }
      else if (action === 'delete') this.deleteRule(id);
      else if (action === 'toggle') this.toggleRule(id);
    };

    this.container.onchange = (e) => {
      if (e.target.dataset.ref === 'trigger') this.editForm.trigger = e.target.value;
      else if (e.target.dataset.ref === 'action') this.editForm.action = e.target.value;
    };
  },

  exportState() {
    return {
      rules: JSON.parse(JSON.stringify(this.rules)),
      executionLog: JSON.parse(JSON.stringify(this.executionLog)),
      nextId: this.nextId, nextLogId: this.nextLogId
    };
  },

  importState(state) {
    if (!state) return;
    this.rules = state.rules || [];
    this.executionLog = state.executionLog || [];
    this.nextId = state.nextId || 1;
    this.nextLogId = state.nextLogId || 1;
    this.render();
  }
};
