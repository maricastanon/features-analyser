const MsPlannerProgressAutomation = {
  container: null,
  triggers: ['Task Created', 'Task Completed', 'Due Date Passed', 'Checklist Complete', 'Task Assigned'],
  actions: ['Change Status', 'Set Priority', 'Add Label', 'Notify Member', 'Move to Bucket'],
  rules: [
    { id: 1, trigger: 'Task Completed', action: 'Change Status', value: 'Completed', active: true },
    { id: 2, trigger: 'Checklist Complete', action: 'Change Status', value: 'In Progress', active: true },
    { id: 3, trigger: 'Due Date Passed', action: 'Set Priority', value: 'Urgent', active: false }
  ],
  log: [
    { ts: '2026-04-09 09:12:04', rule: 'Task Completed -> Change Status', desc: 'Changed "Build API" status to Completed' },
    { ts: '2026-04-09 08:45:21', rule: 'Checklist Complete -> Change Status', desc: 'Changed "Write specs" status to In Progress' }
  ],
  _nextId: 4,
  _showForm: false,
  _editId: null,

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
  },

  _saveRule() {
    const trigger = this.container.querySelector('.ppa-sel-trigger');
    const action = this.container.querySelector('.ppa-sel-action');
    const value = this.container.querySelector('.ppa-input-value');
    if (!trigger || !action || !value.value.trim()) return;
    if (this._editId) {
      const rule = this.rules.find(r => r.id === this._editId);
      if (rule) {
        rule.trigger = trigger.value;
        rule.action = action.value;
        rule.value = value.value.trim();
      }
      this._editId = null;
    } else {
      this.rules.push({
        id: this._nextId++, trigger: trigger.value, action: action.value,
        value: value.value.trim(), active: true
      });
    }
    this._showForm = false;
    this.render();
  },

  _editRule(id) {
    this._editId = id;
    this._showForm = true;
    this.render();
  },

  _deleteRule(id) {
    this.rules = this.rules.filter(r => r.id !== id);
    this.render();
  },

  _toggleRule(id) {
    const rule = this.rules.find(r => r.id === id);
    if (rule) rule.active = !rule.active;
    this.render();
  },

  _runRule(id) {
    const rule = this.rules.find(r => r.id === id);
    if (!rule) return;
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const ts = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join('-') +
      ' ' + [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join(':');
    const targets = ['Design mockups', 'Build API', 'Write specs', 'Auth module', 'Setup CI'];
    const target = targets[Math.floor(Math.random() * targets.length)];
    const desc = rule.action + ': set "' + target + '" to "' + rule.value + '"';
    this.log.unshift({ ts: ts, rule: rule.trigger + ' -> ' + rule.action, desc: desc });
    if (this.log.length > 5) this.log = this.log.slice(0, 5);
    this.render();
  },

  _buildFormHtml(editRule) {
    const tr = editRule ? editRule.trigger : this.triggers[0];
    const ac = editRule ? editRule.action : this.actions[0];
    const val = editRule ? editRule.value : '';
    const triggerOpts = this.triggers.map(t =>
      '<option ' + (t === tr ? 'selected' : '') + '>' + this._esc(t) + '</option>'
    ).join('');
    const actionOpts = this.actions.map(a =>
      '<option ' + (a === ac ? 'selected' : '') + '>' + this._esc(a) + '</option>'
    ).join('');
    const btnLabel = this._editId ? 'Update' : 'Create';
    return '<div class="ppa-form">' +
      '<div class="ppa-form-row"><label class="ppa-form-label">WHEN</label>' +
        '<select class="ppa-sel-trigger ppa-input">' + triggerOpts + '</select></div>' +
      '<div class="ppa-form-row"><label class="ppa-form-label">THEN</label>' +
        '<select class="ppa-sel-action ppa-input">' + actionOpts + '</select></div>' +
      '<div class="ppa-form-row"><label class="ppa-form-label">VALUE</label>' +
        '<input class="ppa-input-value ppa-input" placeholder="e.g. Completed, Urgent, Bug..." value="' + this._esc(val) + '" /></div>' +
      '<div class="ppa-form-actions">' +
        '<button class="ppa-btn ppa-btn-save" data-action="saveRule">' + btnLabel + ' Rule</button>' +
        '<button class="ppa-btn ppa-btn-cancel" data-action="cancelForm">Cancel</button></div></div>';
  },

  _buildRuleCard(r) {
    const cls = r.active ? '' : ' ppa-rule-inactive';
    const chk = r.active ? 'checked' : '';
    return '<div class="ppa-rule-card' + cls + '">' +
      '<div class="ppa-rule-top">' +
        '<label class="ppa-toggle"><input type="checkbox" ' + chk + ' data-action="toggle" data-id="' + r.id + '" />' +
          '<span class="ppa-toggle-slider"></span></label>' +
        '<div class="ppa-rule-text">' +
          '<span class="ppa-rule-when">WHEN</span> ' + this._esc(r.trigger) +
          ' <span class="ppa-rule-then">THEN</span> ' + this._esc(r.action) +
          ' <span class="ppa-rule-value">&rarr; ' + this._esc(r.value) + '</span></div></div>' +
      '<div class="ppa-rule-actions">' +
        '<button class="ppa-btn ppa-btn-run" data-action="runRule" data-id="' + r.id + '">Run Now</button>' +
        '<button class="ppa-btn ppa-btn-edit" data-action="editRule" data-id="' + r.id + '">Edit</button>' +
        '<button class="ppa-btn-del" data-action="deleteRule" data-id="' + r.id + '">&times;</button></div></div>';
  },

  _buildLogEntry(l) {
    return '<div class="ppa-log-entry">' +
      '<span class="ppa-log-ts">' + this._esc(l.ts) + '</span>' +
      '<span class="ppa-log-rule">' + this._esc(l.rule) + '</span>' +
      '<span class="ppa-log-desc">' + this._esc(l.desc) + '</span></div>';
  },

  render() {
    if (!this.container) return;
    const editRule = this._editId ? this.rules.find(r => r.id === this._editId) : null;
    const formHtml = this._showForm ? this._buildFormHtml(editRule) : '';
    const addBtn = !this._showForm ? '<button class="ppa-btn ppa-btn-add" data-action="showForm">+ New Rule</button>' : '';
    const rulesHtml = this.rules.map(r => this._buildRuleCard(r)).join('');
    const emptyRules = this.rules.length === 0 ? '<div class="ppa-empty">No rules configured. Create one above.</div>' : '';
    const logHtml = this.log.length === 0
      ? '<div class="ppa-empty">No executions yet.</div>'
      : this.log.map(l => this._buildLogEntry(l)).join('');

    this.container.innerHTML = '<div class="ppa-panel">' +
      '<div class="ppa-header"><h3>Automation Rules</h3>' + addBtn + '</div>' +
      formHtml +
      '<div class="ppa-rules-list">' + rulesHtml + emptyRules + '</div>' +
      '<div class="ppa-log-section"><div class="ppa-log-title">Execution Log</div>' + logHtml + '</div></div>';

    this.container.onclick = (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = Number(btn.dataset.id);
      if (action === 'showForm') { this._showForm = true; this._editId = null; this.render(); }
      else if (action === 'cancelForm') { this._showForm = false; this._editId = null; this.render(); }
      else if (action === 'saveRule') { this._saveRule(); }
      else if (action === 'editRule') { this._editRule(id); }
      else if (action === 'deleteRule') { this._deleteRule(id); }
      else if (action === 'runRule') { this._runRule(id); }
    };
    this.container.onchange = (e) => {
      const chk = e.target.closest('[data-action="toggle"]');
      if (chk) { this._toggleRule(Number(chk.dataset.id)); }
    };
  },

  exportState() {
    return {
      rules: JSON.parse(JSON.stringify(this.rules)),
      log: JSON.parse(JSON.stringify(this.log)),
      _nextId: this._nextId
    };
  },

  importState(state) {
    if (!state) return;
    this.rules = state.rules || [];
    this.log = state.log || [];
    this._nextId = state._nextId || this.rules.length + 1;
    this.render();
  }
};
