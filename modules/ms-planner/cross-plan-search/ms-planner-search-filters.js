/* ═══════════════════════════════════════════════
   MS PLANNER: Search Filters — JS Module
   Filter panel with checkboxes, dropdowns, date range,
   active filter chips, presets, live match count
   Pattern: init(containerId), render(), exportState(), importState(state)
   ═══════════════════════════════════════════════ */

const MsPlannerSearchFilters = {
  container: null,
  filters: { statuses: [], priorities: [], plan: '', assignee: '', dateFrom: '', dateTo: '' },
  presets: [],
  activeTab: 'filters',

  _statuses: ['Not Started', 'In Progress', 'Completed'],
  _priorities: [1, 2, 3, 4, 5],
  _priorityLabels: { 1: 'Critical', 2: 'High', 3: 'Medium', 4: 'Low', 5: 'Someday' },
  _plans: ['Website Redesign', 'Backend Sprint', 'Design Ops'],
  _assignees: ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'],

  _sampleTasks: [
    { id: 'T-001', title: 'Design homepage mockup', plan: 'Website Redesign', assignee: 'Alice', status: 'In Progress', priority: 2, dueDate: '2026-04-15' },
    { id: 'T-002', title: 'Fix login redirect bug', plan: 'Website Redesign', assignee: 'Bob', status: 'Not Started', priority: 1, dueDate: '2026-04-10' },
    { id: 'T-003', title: 'Write API documentation', plan: 'Backend Sprint', assignee: 'Carol', status: 'Completed', priority: 3, dueDate: '2026-04-05' },
    { id: 'T-004', title: 'Database migration script', plan: 'Backend Sprint', assignee: 'Dave', status: 'In Progress', priority: 2, dueDate: '2026-04-12' },
    { id: 'T-005', title: 'Design system components', plan: 'Design Ops', assignee: 'Alice', status: 'In Progress', priority: 3, dueDate: '2026-04-20' },
    { id: 'T-006', title: 'Onboarding flow redesign', plan: 'Design Ops', assignee: 'Eve', status: 'Not Started', priority: 4, dueDate: '2026-04-18' },
    { id: 'T-007', title: 'Fix notification delivery', plan: 'Backend Sprint', assignee: 'Bob', status: 'Completed', priority: 1, dueDate: '2026-04-03' },
    { id: 'T-008', title: 'Homepage performance audit', plan: 'Website Redesign', assignee: 'Carol', status: 'Not Started', priority: 3, dueDate: '2026-04-22' }
  ],

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
  },

  render() {
    if (!this.container) return;
    const f = this.filters;
    const filtered = this._applyFilters();
    const chips = this._getActiveChips();

    this.container.innerHTML = `
      <div class="mpsf-wrapper">
        <div class="mpsf-panel">
          <div class="mpsf-panel-title">Filters</div>

          <div class="mpsf-group">
            <div class="mpsf-group-label">Status</div>
            ${this._statuses.map(s => `
              <label class="mpsf-checkbox">
                <input type="checkbox" ${f.statuses.includes(s) ? 'checked' : ''}
                  onchange="MsPlannerSearchFilters._toggleStatus('${this._escAttr(s)}')" />
                <span>${this._esc(s)}</span>
              </label>`).join('')}
          </div>

          <div class="mpsf-group">
            <div class="mpsf-group-label">Priority</div>
            ${this._priorities.map(p => `
              <label class="mpsf-checkbox">
                <input type="checkbox" ${f.priorities.includes(p) ? 'checked' : ''}
                  onchange="MsPlannerSearchFilters._togglePriority(${p})" />
                <span>${this._esc(this._priorityLabels[p])}</span>
              </label>`).join('')}
          </div>

          <div class="mpsf-group">
            <div class="mpsf-group-label">Plan</div>
            <select class="mpsf-select" onchange="MsPlannerSearchFilters._setPlan(this.value)">
              <option value="">All Plans</option>
              ${this._plans.map(p => `<option value="${this._escAttr(p)}" ${f.plan === p ? 'selected' : ''}>${this._esc(p)}</option>`).join('')}
            </select>
          </div>

          <div class="mpsf-group">
            <div class="mpsf-group-label">Assignee</div>
            <select class="mpsf-select" onchange="MsPlannerSearchFilters._setAssignee(this.value)">
              <option value="">All Members</option>
              ${this._assignees.map(a => `<option value="${this._escAttr(a)}" ${f.assignee === a ? 'selected' : ''}>${this._esc(a)}</option>`).join('')}
            </select>
          </div>

          <div class="mpsf-group">
            <div class="mpsf-group-label">Due Date Range</div>
            <div class="mpsf-date-row">
              <input type="date" class="mpsf-date" value="${f.dateFrom}" onchange="MsPlannerSearchFilters._setDate('dateFrom', this.value)" />
              <span class="mpsf-date-sep">to</span>
              <input type="date" class="mpsf-date" value="${f.dateTo}" onchange="MsPlannerSearchFilters._setDate('dateTo', this.value)" />
            </div>
          </div>

          <div class="mpsf-actions">
            <button class="mpsf-btn mpsf-btn-clear" onclick="MsPlannerSearchFilters._clearAll()">Clear All</button>
            <button class="mpsf-btn mpsf-btn-save" onclick="MsPlannerSearchFilters._savePreset()">Save Preset</button>
          </div>

          ${this.presets.length ? `
            <div class="mpsf-presets">
              <div class="mpsf-group-label">Saved Presets</div>
              ${this.presets.map((pr, i) => `
                <div class="mpsf-preset-item">
                  <span class="mpsf-preset-name" onclick="MsPlannerSearchFilters._applyPreset(${i})">${this._esc(pr.name)}</span>
                  <button class="mpsf-preset-del" onclick="MsPlannerSearchFilters._deletePreset(${i})">&#10005;</button>
                </div>`).join('')}
            </div>` : ''}
        </div>

        <div class="mpsf-results-area">
          ${chips.length ? `
            <div class="mpsf-chips">
              ${chips.map(c => `
                <span class="mpsf-chip">${this._esc(c.label)}
                  <button class="mpsf-chip-x" onclick="MsPlannerSearchFilters._removeChip('${this._escAttr(c.key)}', '${this._escAttr(String(c.value))}')">&#10005;</button>
                </span>`).join('')}
            </div>` : ''}

          <div class="mpsf-match-count">${filtered.length} task${filtered.length !== 1 ? 's' : ''} match</div>

          <div class="mpsf-results">
            ${filtered.map(t => `
              <div class="mpsf-result-row">
                <span class="mpsf-result-title">${this._esc(t.title)}</span>
                <span class="mpsf-result-plan">${this._esc(t.plan)}</span>
                <span class="mpsf-result-assignee">${this._esc(t.assignee)}</span>
                <span class="mpsf-result-status mpsf-st--${this._slug(t.status)}">${this._esc(t.status)}</span>
              </div>`).join('')}
            ${filtered.length === 0 ? '<div class="mpsf-empty">No tasks match the active filters.</div>' : ''}
          </div>
        </div>
      </div>`;
  },

  _applyFilters() {
    const f = this.filters;
    return this._sampleTasks.filter(t => {
      if (f.statuses.length && !f.statuses.includes(t.status)) return false;
      if (f.priorities.length && !f.priorities.includes(t.priority)) return false;
      if (f.plan && t.plan !== f.plan) return false;
      if (f.assignee && t.assignee !== f.assignee) return false;
      if (f.dateFrom && t.dueDate < f.dateFrom) return false;
      if (f.dateTo && t.dueDate > f.dateTo) return false;
      return true;
    });
  },

  _getActiveChips() {
    const c = [];
    this.filters.statuses.forEach(s => c.push({ key: 'status', value: s, label: s }));
    this.filters.priorities.forEach(p => c.push({ key: 'priority', value: p, label: this._priorityLabels[p] }));
    if (this.filters.plan) c.push({ key: 'plan', value: this.filters.plan, label: this.filters.plan });
    if (this.filters.assignee) c.push({ key: 'assignee', value: this.filters.assignee, label: this.filters.assignee });
    if (this.filters.dateFrom) c.push({ key: 'dateFrom', value: this.filters.dateFrom, label: 'From: ' + this.filters.dateFrom });
    if (this.filters.dateTo) c.push({ key: 'dateTo', value: this.filters.dateTo, label: 'To: ' + this.filters.dateTo });
    return c;
  },

  _removeChip(key, val) {
    if (key === 'status') this.filters.statuses = this.filters.statuses.filter(s => s !== val);
    else if (key === 'priority') this.filters.priorities = this.filters.priorities.filter(p => String(p) !== val);
    else this.filters[key] = '';
    this.render();
  },

  _toggleStatus(s) {
    const idx = this.filters.statuses.indexOf(s);
    idx === -1 ? this.filters.statuses.push(s) : this.filters.statuses.splice(idx, 1);
    this.render();
  },

  _togglePriority(p) {
    const idx = this.filters.priorities.indexOf(p);
    idx === -1 ? this.filters.priorities.push(p) : this.filters.priorities.splice(idx, 1);
    this.render();
  },

  _setPlan(v) { this.filters.plan = v; this.render(); },
  _setAssignee(v) { this.filters.assignee = v; this.render(); },
  _setDate(key, v) { this.filters[key] = v; this.render(); },

  _clearAll() {
    this.filters = { statuses: [], priorities: [], plan: '', assignee: '', dateFrom: '', dateTo: '' };
    this.render();
  },

  _savePreset() {
    const el = document.createElement('input');
    el.className = 'mpsf-inline-input';
    el.placeholder = 'Preset name...';
    el.onkeydown = (e) => {
      if (e.key === 'Enter' && el.value.trim()) {
        this.presets.push({ name: el.value.trim(), filters: JSON.parse(JSON.stringify(this.filters)) });
        this.render();
      }
    };
    el.onblur = () => {
      if (el.value.trim()) {
        this.presets.push({ name: el.value.trim(), filters: JSON.parse(JSON.stringify(this.filters)) });
      }
      this.render();
    };
    const actions = this.container.querySelector('.mpsf-actions');
    if (actions) { actions.appendChild(el); el.focus(); }
  },

  _applyPreset(i) {
    this.filters = JSON.parse(JSON.stringify(this.presets[i].filters));
    this.render();
  },

  _deletePreset(i) { this.presets.splice(i, 1); this.render(); },

  _slug(s) { return (s || '').toLowerCase().replace(/\s+/g, '-'); },
  _esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; },
  _escAttr(str) { return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },

  exportState() {
    return { filters: JSON.parse(JSON.stringify(this.filters)), presets: JSON.parse(JSON.stringify(this.presets)) };
  },

  importState(state) {
    if (!state) return;
    if (state.filters) this.filters = state.filters;
    if (state.presets) this.presets = state.presets;
    this.render();
  }
};
