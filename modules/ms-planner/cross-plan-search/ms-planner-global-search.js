/* ═══════════════════════════════════════════════
   MS PLANNER: Global Search — JS Module
   Search input with live results grouped by plan,
   recent searches, result count, task detail popup
   Pattern: init(containerId), render(), exportState(), importState(state)
   ═══════════════════════════════════════════════ */

const MsPlannerGlobalSearch = {
  container: null,
  query: '',
  recentSearches: [],
  results: [],
  selectedTask: null,
  maxRecent: 5,

  _sampleTasks: [
    { id: 'T-001', title: 'Design homepage mockup', plan: 'Website Redesign', assignee: 'Alice', status: 'In Progress', priority: 2, description: 'Create initial wireframes and mockups for the new homepage.' },
    { id: 'T-002', title: 'Fix login redirect bug', plan: 'Website Redesign', assignee: 'Bob', status: 'Not Started', priority: 1, description: 'Users are redirected to 404 after login on mobile devices.' },
    { id: 'T-003', title: 'Write API documentation', plan: 'Backend Sprint', assignee: 'Carol', status: 'Completed', priority: 3, description: 'Document all REST endpoints for the v2 API.' },
    { id: 'T-004', title: 'Database migration script', plan: 'Backend Sprint', assignee: 'Dave', status: 'In Progress', priority: 2, description: 'Migrate user data from v1 schema to v2 schema.' },
    { id: 'T-005', title: 'Design system components', plan: 'Design Ops', assignee: 'Alice', status: 'In Progress', priority: 3, description: 'Build reusable component library for the design system.' },
    { id: 'T-006', title: 'Onboarding flow redesign', plan: 'Design Ops', assignee: 'Eve', status: 'Not Started', priority: 4, description: 'Redesign the onboarding experience for new users.' },
    { id: 'T-007', title: 'Fix notification delivery', plan: 'Backend Sprint', assignee: 'Bob', status: 'Completed', priority: 1, description: 'Notifications not being delivered when user is offline.' },
    { id: 'T-008', title: 'Homepage performance audit', plan: 'Website Redesign', assignee: 'Carol', status: 'Not Started', priority: 3, description: 'Audit and optimize homepage load times.' }
  ],

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
  },

  render() {
    if (!this.container) return;
    const grouped = this._groupByPlan(this.results);
    const count = this.results.length;

    this.container.innerHTML = `
      <div class="mpgs-wrapper">
        <div class="mpgs-header">
          <div class="mpgs-search-bar">
            <span class="mpgs-search-icon">&#128269;</span>
            <input class="mpgs-input" type="text" placeholder="Search across all plans..."
              value="${this._escAttr(this.query)}"
              oninput="MsPlannerGlobalSearch._onInput(this.value)"
              onkeydown="if(event.key==='Enter')MsPlannerGlobalSearch._commitSearch()" />
            ${this.query ? '<button class="mpgs-clear-btn" onclick="MsPlannerGlobalSearch._clearSearch()">&#10005;</button>' : ''}
          </div>
          ${count > 0 ? '<div class="mpgs-count">' + count + ' result' + (count !== 1 ? 's' : '') + ' found</div>' : ''}
        </div>

        ${!this.query && this.recentSearches.length ? `
          <div class="mpgs-recent">
            <div class="mpgs-recent-title">Recent Searches</div>
            ${this.recentSearches.map(s => `
              <div class="mpgs-recent-item" onclick="MsPlannerGlobalSearch._applyRecent('${this._escAttr(s)}')">
                <span class="mpgs-recent-icon">&#128336;</span> ${this._esc(s)}
              </div>`).join('')}
          </div>` : ''}

        ${this.query && count === 0 ? '<div class="mpgs-empty">No tasks match your search.</div>' : ''}

        ${Object.keys(grouped).map(plan => `
          <div class="mpgs-plan-group">
            <div class="mpgs-plan-name">${this._esc(plan)}</div>
            ${grouped[plan].map(t => `
              <div class="mpgs-result" onclick="MsPlannerGlobalSearch._showDetail('${this._escAttr(t.id)}')">
                <div class="mpgs-result-title">${this._highlight(t.title, this.query)}</div>
                <div class="mpgs-result-meta">
                  <span class="mpgs-assignee">${this._esc(t.assignee)}</span>
                  <span class="mpgs-status mpgs-status--${this._slugify(t.status)}">${this._esc(t.status)}</span>
                </div>
              </div>`).join('')}
          </div>`).join('')}

        ${this.selectedTask ? this._renderPopup(this.selectedTask) : ''}
      </div>`;
  },

  _renderPopup(t) {
    return `
      <div class="mpgs-overlay" onclick="MsPlannerGlobalSearch._closeDetail()">
        <div class="mpgs-popup" onclick="event.stopPropagation()">
          <button class="mpgs-popup-close" onclick="MsPlannerGlobalSearch._closeDetail()">&#10005;</button>
          <div class="mpgs-popup-id">${this._esc(t.id)}</div>
          <div class="mpgs-popup-title">${this._esc(t.title)}</div>
          <div class="mpgs-popup-row"><span class="mpgs-popup-label">Plan</span> ${this._esc(t.plan)}</div>
          <div class="mpgs-popup-row"><span class="mpgs-popup-label">Assignee</span> ${this._esc(t.assignee)}</div>
          <div class="mpgs-popup-row"><span class="mpgs-popup-label">Status</span>
            <span class="mpgs-status mpgs-status--${this._slugify(t.status)}">${this._esc(t.status)}</span></div>
          <div class="mpgs-popup-row"><span class="mpgs-popup-label">Priority</span> ${t.priority}</div>
          <div class="mpgs-popup-desc">${this._esc(t.description)}</div>
        </div>
      </div>`;
  },

  _onInput(val) {
    this.query = val;
    this.results = this.query.trim() ? this._search(this.query.trim()) : [];
    this.selectedTask = null;
    this.render();
    this.container.querySelector('.mpgs-input')?.focus();
  },

  _commitSearch() {
    const q = this.query.trim();
    if (!q) return;
    this.recentSearches = [q, ...this.recentSearches.filter(s => s !== q)].slice(0, this.maxRecent);
  },

  _clearSearch() { this.query = ''; this.results = []; this.selectedTask = null; this.render(); },

  _applyRecent(q) { this.query = q; this.results = this._search(q); this.render(); },

  _showDetail(id) { this.selectedTask = this._sampleTasks.find(t => t.id === id) || null; this.render(); },

  _closeDetail() { this.selectedTask = null; this.render(); },

  _search(q) {
    const lower = q.toLowerCase();
    return this._sampleTasks.filter(t =>
      t.title.toLowerCase().includes(lower) ||
      t.assignee.toLowerCase().includes(lower) ||
      t.plan.toLowerCase().includes(lower) ||
      t.id.toLowerCase().includes(lower)
    );
  },

  _groupByPlan(tasks) {
    const groups = {};
    tasks.forEach(t => { (groups[t.plan] = groups[t.plan] || []).push(t); });
    return groups;
  },

  _highlight(text, query) {
    if (!query) return this._esc(text);
    const escaped = this._esc(text);
    const qEsc = this._esc(query);
    const re = new RegExp('(' + qEsc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return escaped.replace(re, '<mark class="mpgs-mark">$1</mark>');
  },

  _slugify(s) { return (s || '').toLowerCase().replace(/\s+/g, '-'); },
  _esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; },
  _escAttr(str) { return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },

  exportState() {
    return { query: this.query, recentSearches: [...this.recentSearches], results: [...this.results], selectedTask: this.selectedTask };
  },

  importState(state) {
    if (!state) return;
    this.query = state.query || '';
    this.recentSearches = state.recentSearches || [];
    this.results = state.results || [];
    this.selectedTask = state.selectedTask || null;
    this.render();
  }
};
