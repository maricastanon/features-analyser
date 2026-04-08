const MsPlannerFilterBuilder = {
  container: null,
  conditions: [],
  logicOperator: 'AND',
  nextId: 1,
  fields: ['Status', 'Priority', 'Assignee', 'Bucket', 'Due Date', 'Label'],
  operators: {
    default: ['is', 'is not', 'contains'],
    'Due Date': ['is', 'is not', 'before', 'after']
  },
  sampleTasks: [
    { status: 'Not Started', priority: 'High', assignee: 'Alice', bucket: 'To Do', dueDate: '2026-04-10', label: 'Bug' },
    { status: 'In Progress', priority: 'Medium', assignee: 'Bob', bucket: 'Doing', dueDate: '2026-04-08', label: 'Feature' },
    { status: 'Completed', priority: 'Low', assignee: 'Alice', bucket: 'Done', dueDate: '2026-04-05', label: 'Bug' },
    { status: 'In Progress', priority: 'High', assignee: 'Charlie', bucket: 'Doing', dueDate: '2026-04-12', label: 'Enhancement' },
    { status: 'Not Started', priority: 'Medium', assignee: '', bucket: 'To Do', dueDate: '2026-04-15', label: 'Feature' },
    { status: 'Completed', priority: 'High', assignee: 'Bob', bucket: 'Done', dueDate: '2026-04-03', label: 'Bug' }
  ],

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.conditions = [];
    this.nextId = 1;
    this.logicOperator = 'AND';
    this.addCondition();
    this.render();
  },

  addCondition() {
    this.conditions.push({ id: this.nextId++, field: 'Status', operator: 'is', value: '' });
  },

  removeCondition(id) {
    this.conditions = this.conditions.filter(c => c.id !== id);
    if (this.conditions.length === 0) this.addCondition();
    this.render();
  },

  updateCondition(id, key, val) {
    const c = this.conditions.find(c => c.id === id);
    if (c) c[key] = val;
    this.render();
  },

  toggleLogic() {
    this.logicOperator = this.logicOperator === 'AND' ? 'OR' : 'AND';
    this.render();
  },

  getMatchCount() {
    return this.sampleTasks.filter(task => {
      const results = this.conditions.map(c => {
        const fieldMap = { 'Status': 'status', 'Priority': 'priority', 'Assignee': 'assignee', 'Bucket': 'bucket', 'Due Date': 'dueDate', 'Label': 'label' };
        const val = task[fieldMap[c.field]] || '';
        const cv = c.value.toLowerCase();
        if (!cv) return true;
        switch (c.operator) {
          case 'is': return val.toLowerCase() === cv;
          case 'is not': return val.toLowerCase() !== cv;
          case 'contains': return val.toLowerCase().includes(cv);
          case 'before': return val < c.value;
          case 'after': return val > c.value;
          default: return true;
        }
      });
      return this.logicOperator === 'AND' ? results.every(Boolean) : results.some(Boolean);
    }).length;
  },

  render() {
    if (!this.container) return;
    const ops = (field) => (this.operators[field] || this.operators.default);
    const matchCount = this.getMatchCount();

    let html = `<div class="pfb-panel">
      <div class="pfb-header"><h3>Filter Builder</h3>
        <span class="pfb-result-count">${matchCount} of ${this.sampleTasks.length} tasks match</span>
      </div>
      <div class="pfb-conditions">`;

    this.conditions.forEach((c, i) => {
      if (i > 0) {
        html += `<div class="pfb-logic-row">
          <button class="pfb-logic-toggle" data-action="toggle-logic">${this._esc(this.logicOperator)}</button>
        </div>`;
      }
      html += `<div class="pfb-condition-row" data-id="${c.id}">
        <select class="pfb-field" data-id="${c.id}" data-key="field">
          ${this.fields.map(f => `<option value="${this._esc(f)}" ${f === c.field ? 'selected' : ''}>${this._esc(f)}</option>`).join('')}
        </select>
        <select class="pfb-operator" data-id="${c.id}" data-key="operator">
          ${ops(c.field).map(o => `<option value="${this._esc(o)}" ${o === c.operator ? 'selected' : ''}>${this._esc(o)}</option>`).join('')}
        </select>
        <input class="pfb-value" type="${c.field === 'Due Date' ? 'date' : 'text'}" value="${this._esc(c.value)}" placeholder="Value..." data-id="${c.id}" data-key="value" />
        <button class="pfb-remove-btn" data-action="remove" data-id="${c.id}" title="Remove">&times;</button>
      </div>`;
    });

    html += `</div>
      <div class="pfb-actions">
        <button class="pfb-add-btn" data-action="add">+ Add Condition</button>
        <button class="pfb-apply-btn" data-action="apply">Apply Filter</button>
      </div></div>`;

    this.container.innerHTML = html;
    this.container.onclick = (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'add') { this.addCondition(); this.render(); }
      else if (action === 'remove') this.removeCondition(Number(btn.dataset.id));
      else if (action === 'toggle-logic') this.toggleLogic();
      else if (action === 'apply') { /* apply callback placeholder */ }
    };
    this.container.onchange = (e) => {
      const el = e.target;
      if (el.dataset.id && el.dataset.key) {
        this.updateCondition(Number(el.dataset.id), el.dataset.key, el.value);
      }
    };
    this.container.oninput = (e) => {
      const el = e.target;
      if (el.classList.contains('pfb-value') && el.dataset.id) {
        const c = this.conditions.find(c => c.id === Number(el.dataset.id));
        if (c) { c.value = el.value; this.container.querySelector('.pfb-result-count').textContent = `${this.getMatchCount()} of ${this.sampleTasks.length} tasks match`; }
      }
    };
  },

  exportState() {
    return { conditions: JSON.parse(JSON.stringify(this.conditions)), logicOperator: this.logicOperator, nextId: this.nextId };
  },

  importState(state) {
    if (!state) return;
    this.conditions = state.conditions || [];
    this.logicOperator = state.logicOperator || 'AND';
    this.nextId = state.nextId || 1;
    this.render();
  }
};
