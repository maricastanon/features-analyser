const MsPlannerMyTasksFilters = {
  _container: null,
  _tasks: [],
  _filters: { status: '', priority: '', dueDateFrom: '', dueDateTo: '', plan: '', bucket: '' },
  _presets: [],

  _sampleTasks() {
    return [
      { id: 1, title: 'Write API documentation', status: 'in-progress', priority: 'high', due: '2026-04-07', plan: 'Sprint 14', bucket: 'Docs' },
      { id: 2, title: 'Design login mockup', status: 'not-started', priority: 'medium', due: '2026-04-12', plan: 'UX Redesign', bucket: 'Design' },
      { id: 3, title: 'Fix memory leak', status: 'in-progress', priority: 'high', due: '2026-04-05', plan: 'Sprint 14', bucket: 'Bugs' },
      { id: 4, title: 'Quarterly review prep', status: 'not-started', priority: 'low', due: '2026-04-20', plan: 'Management', bucket: 'Meetings' },
      { id: 5, title: 'Update dependencies', status: 'completed', priority: 'medium', due: '2026-04-08', plan: 'Sprint 14', bucket: 'Maintenance' },
      { id: 6, title: 'User research interviews', status: 'not-started', priority: 'high', due: '2026-04-10', plan: 'UX Redesign', bucket: 'Research' },
      { id: 7, title: 'Set up CI pipeline', status: 'completed', priority: 'high', due: '2026-04-03', plan: 'Sprint 14', bucket: 'DevOps' },
      { id: 8, title: 'Budget reconciliation', status: 'in-progress', priority: 'low', due: '2026-04-15', plan: 'Management', bucket: 'Finance' },
    ];
  },

  _esc(str) {
    const el = document.createElement('span'); el.textContent = str; return el.innerHTML;
  },

  _uniqueValues(key) {
    return [...new Set(this._tasks.map(t => t[key]))].sort();
  },

  _getFiltered() {
    return this._tasks.filter(t => {
      const f = this._filters;
      if (f.status && t.status !== f.status) return false;
      if (f.priority && t.priority !== f.priority) return false;
      if (f.plan && t.plan !== f.plan) return false;
      if (f.bucket && t.bucket !== f.bucket) return false;
      if (f.dueDateFrom && t.due < f.dueDateFrom) return false;
      if (f.dueDateTo && t.due > f.dueDateTo) return false;
      return true;
    });
  },

  _activeFilters() {
    return Object.entries(this._filters).filter(([, v]) => v !== '');
  },

  _clearAll() {
    Object.keys(this._filters).forEach(k => { this._filters[k] = ''; });
    this.render();
  },

  _removeFilter(key) {
    this._filters[key] = '';
    this.render();
  },

  _savePreset() {
    const form = this._container.querySelector('.mtf-preset-input');
    const name = form ? form.value.trim() : '';
    if (!name) return;
    this._presets.push({ name, filters: { ...this._filters } });
    this.render();
  },

  _loadPreset(idx) {
    const p = this._presets[idx];
    if (p) { this._filters = { ...p.filters }; this.render(); }
  },

  _deletePreset(idx) {
    this._presets.splice(idx, 1);
    this.render();
  },

  _deleteTask(id) {
    this._tasks = this._tasks.filter(t => t.id !== id);
    this.render();
  },

  _addTask() {
    const root = this._container.querySelector('.mtf-add-row');
    const title = root.querySelector('.mtf-add-title').value.trim();
    const plan = root.querySelector('.mtf-add-plan').value.trim();
    const priority = root.querySelector('.mtf-add-priority').value;
    const due = root.querySelector('.mtf-add-due').value;
    if (!title) return;
    const id = this._tasks.length ? Math.max(...this._tasks.map(t => t.id)) + 1 : 1;
    this._tasks.push({ id, title, status: 'not-started', priority: priority || 'medium', due: due || '2026-04-30', plan: plan || 'Inbox', bucket: 'General' });
    this.render();
  },

  _renderSelect(name, options, current, label) {
    let html = `<label class="mtf-label">${label}<select class="mtf-select" data-filter="${name}"><option value="">All</option>`;
    options.forEach(o => { html += `<option value="${this._esc(o)}"${o === current ? ' selected' : ''}>${this._esc(o)}</option>`; });
    return html + '</select></label>';
  },

  render() {
    const filtered = this._getFiltered();
    const active = this._activeFilters();
    const labelMap = { status: 'Status', priority: 'Priority', dueDateFrom: 'From', dueDateTo: 'To', plan: 'Plan', bucket: 'Bucket' };

    let html = '<div class="mtf-root"><h2 class="mtf-heading">Filter Tasks</h2><div class="mtf-panel">';
    html += this._renderSelect('status', ['not-started', 'in-progress', 'completed'], this._filters.status, 'Status');
    html += this._renderSelect('priority', ['high', 'medium', 'low'], this._filters.priority, 'Priority');
    html += this._renderSelect('plan', this._uniqueValues('plan'), this._filters.plan, 'Plan');
    html += this._renderSelect('bucket', this._uniqueValues('bucket'), this._filters.bucket, 'Bucket');
    html += `<label class="mtf-label">From<input type="date" class="mtf-date" data-filter="dueDateFrom" value="${this._filters.dueDateFrom}"></label>`;
    html += `<label class="mtf-label">To<input type="date" class="mtf-date" data-filter="dueDateTo" value="${this._filters.dueDateTo}"></label>`;
    html += '</div>';

    if (active.length) {
      html += '<div class="mtf-chips">';
      active.forEach(([k, v]) => {
        html += `<span class="mtf-chip">${this._esc(labelMap[k] || k)}: ${this._esc(v)} <button class="mtf-chip-remove" data-key="${k}">&times;</button></span>`;
      });
      html += `<button class="mtf-clear-btn">Clear All</button></div>`;
    }

    html += `<div class="mtf-preset-bar"><input type="text" class="mtf-preset-input" placeholder="Preset name..."><button class="mtf-save-preset-btn">Save Preset</button>`;
    this._presets.forEach((p, i) => {
      html += `<span class="mtf-preset-chip"><button class="mtf-load-preset" data-idx="${i}">${this._esc(p.name)}</button><button class="mtf-del-preset" data-idx="${i}">&times;</button></span>`;
    });
    html += '</div>';

    html += `<div class="mtf-results-count">${filtered.length} task${filtered.length !== 1 ? 's' : ''} found</div>`;
    html += '<div class="mtf-task-list">';
    filtered.forEach(t => {
      html += `<div class="mtf-task"><span class="mtf-task-status mtf-st-${t.status}"></span>
        <div class="mtf-task-body"><span class="mtf-task-title">${this._esc(t.title)}</span>
        <span class="mtf-task-meta">${this._esc(t.plan)} &middot; ${this._esc(t.bucket)} &middot; ${t.due}</span></div>
        <span class="mtf-priority mtf-p-${t.priority}">${this._esc(t.priority)}</span>
        <button class="mtf-del-task" data-id="${t.id}">&times;</button></div>`;
    });
    html += '</div>';

    html += `<div class="mtf-add-row">
      <input type="text" class="mtf-add-title" placeholder="Task title...">
      <input type="text" class="mtf-add-plan" placeholder="Plan...">
      <select class="mtf-add-priority"><option value="high">High</option><option value="medium" selected>Medium</option><option value="low">Low</option></select>
      <input type="date" class="mtf-add-due">
      <button class="mtf-add-btn">Add Task</button>
    </div></div>`;
    this._container.innerHTML = html;
    this._bind();
  },

  _bind() {
    this._container.querySelectorAll('.mtf-select').forEach(sel => {
      sel.addEventListener('change', () => { this._filters[sel.dataset.filter] = sel.value; this.render(); });
    });
    this._container.querySelectorAll('.mtf-date').forEach(inp => {
      inp.addEventListener('change', () => { this._filters[inp.dataset.filter] = inp.value; this.render(); });
    });
    this._container.querySelectorAll('.mtf-chip-remove').forEach(btn => {
      btn.addEventListener('click', () => this._removeFilter(btn.dataset.key));
    });
    const clearBtn = this._container.querySelector('.mtf-clear-btn');
    if (clearBtn) clearBtn.addEventListener('click', () => this._clearAll());
    const saveBtn = this._container.querySelector('.mtf-save-preset-btn');
    if (saveBtn) saveBtn.addEventListener('click', () => this._savePreset());
    this._container.querySelectorAll('.mtf-load-preset').forEach(btn => {
      btn.addEventListener('click', () => this._loadPreset(Number(btn.dataset.idx)));
    });
    this._container.querySelectorAll('.mtf-del-preset').forEach(btn => {
      btn.addEventListener('click', () => this._deletePreset(Number(btn.dataset.idx)));
    });
    this._container.querySelectorAll('.mtf-del-task').forEach(btn => {
      btn.addEventListener('click', () => this._deleteTask(Number(btn.dataset.id)));
    });
    const addBtn = this._container.querySelector('.mtf-add-btn');
    if (addBtn) addBtn.addEventListener('click', () => this._addTask());
  },

  init(containerId) {
    this._container = document.getElementById(containerId);
    this._tasks = this._sampleTasks();
    this.render();
  },

  exportState() {
    return { tasks: JSON.parse(JSON.stringify(this._tasks)), filters: { ...this._filters }, presets: JSON.parse(JSON.stringify(this._presets)) };
  },

  importState(state) {
    this._tasks = state.tasks || [];
    this._filters = state.filters || { status: '', priority: '', dueDateFrom: '', dueDateTo: '', plan: '', bucket: '' };
    this._presets = state.presets || [];
    this.render();
  }
};
