/* ═══════════════════════════════════════════════
   MS PLANNER: Activity Log — JS Module
   Full activity feed with auto-generated entries,
   filtering by member/action, grouped by day, export
   Pattern: init(containerId), render(), exportState(), importState(state)
   ═══════════════════════════════════════════════ */

const MsPlannerActivityLog = {
  container: null,
  entries: [],
  filterMember: '',
  filterAction: '',

  _actions: ['created', 'edited', 'completed', 'deleted'],
  _members: ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'],

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    if (!this.entries.length) this._seedEntries();
    this.render();
  },

  _seedEntries() {
    const now = Date.now();
    const day = 86400000;
    const hour = 3600000;
    this.entries = [
      { id: 1, member: 'Alice', action: 'created', detail: 'Created task "Design homepage mockup"', timestamp: now - 1 * hour },
      { id: 2, member: 'Bob', action: 'edited', detail: 'Changed priority from Medium to Critical on "Fix login redirect bug"', timestamp: now - 3 * hour },
      { id: 3, member: 'Carol', action: 'completed', detail: 'Completed task "Write API documentation"', timestamp: now - 5 * hour },
      { id: 4, member: 'Dave', action: 'edited', detail: 'Updated due date on "Database migration script" to Apr 12', timestamp: now - 8 * hour },
      { id: 5, member: 'Alice', action: 'edited', detail: 'Added checklist item to "Design system components"', timestamp: now - 1 * day - 2 * hour },
      { id: 6, member: 'Eve', action: 'created', detail: 'Created task "Onboarding flow redesign"', timestamp: now - 1 * day - 5 * hour },
      { id: 7, member: 'Bob', action: 'completed', detail: 'Completed task "Fix notification delivery"', timestamp: now - 1 * day - 7 * hour },
      { id: 8, member: 'Carol', action: 'edited', detail: 'Assigned "Homepage performance audit" to self', timestamp: now - 2 * day - 1 * hour },
      { id: 9, member: 'Dave', action: 'deleted', detail: 'Deleted task "Old migration script"', timestamp: now - 2 * day - 4 * hour },
      { id: 10, member: 'Alice', action: 'edited', detail: 'Changed status of "Design homepage mockup" to In Progress', timestamp: now - 3 * day - 2 * hour },
      { id: 11, member: 'Eve', action: 'created', detail: 'Created task "User research plan"', timestamp: now - 4 * day - 3 * hour },
      { id: 12, member: 'Bob', action: 'edited', detail: 'Added comment on "Fix login redirect bug"', timestamp: now - 5 * day - 1 * hour }
    ];
  },

  logChange(member, action, detail) {
    this.entries.unshift({
      id: Date.now(),
      member: member,
      action: action,
      detail: detail,
      timestamp: Date.now()
    });
    this.render();
  },

  render() {
    if (!this.container) return;
    const filtered = this._getFiltered();
    const grouped = this._groupByDay(filtered);
    const members = [...new Set(this.entries.map(e => e.member))];

    this.container.innerHTML = `
      <div class="mpal-wrapper">
        <div class="mpal-header">
          <div class="mpal-title">Activity Log</div>
          <div class="mpal-header-actions">
            <button class="mpal-btn mpal-btn-export" onclick="MsPlannerActivityLog._exportLog()">Export</button>
            <button class="mpal-btn mpal-btn-clear" onclick="MsPlannerActivityLog._clearLog()">Clear Log</button>
          </div>
        </div>

        <div class="mpal-filters">
          <select class="mpal-select" onchange="MsPlannerActivityLog._setMember(this.value)">
            <option value="">All Members</option>
            ${members.map(m => `<option value="${this._escAttr(m)}" ${this.filterMember === m ? 'selected' : ''}>${this._esc(m)}</option>`).join('')}
          </select>
          <select class="mpal-select" onchange="MsPlannerActivityLog._setAction(this.value)">
            <option value="">All Actions</option>
            ${this._actions.map(a => `<option value="${this._escAttr(a)}" ${this.filterAction === a ? 'selected' : ''}>${this._esc(a.charAt(0).toUpperCase() + a.slice(1))}</option>`).join('')}
          </select>
          <span class="mpal-filter-count">${filtered.length} entr${filtered.length !== 1 ? 'ies' : 'y'}</span>
        </div>

        <div class="mpal-add-entry">
          <select class="mpal-select mpal-add-member" id="mpal-add-member">
            ${members.map(m => `<option value="${this._escAttr(m)}">${this._esc(m)}</option>`).join('')}
          </select>
          <select class="mpal-select mpal-add-action" id="mpal-add-action">
            ${this._actions.map(a => `<option value="${this._escAttr(a)}">${this._esc(a)}</option>`).join('')}
          </select>
          <input class="mpal-add-input" id="mpal-add-detail" placeholder="Activity detail..." onkeydown="if(event.key==='Enter')MsPlannerActivityLog._addEntry()" />
          <button class="mpal-btn mpal-btn-add" onclick="MsPlannerActivityLog._addEntry()">+</button>
        </div>

        <div class="mpal-feed">
          ${Object.keys(grouped).map(day => `
            <div class="mpal-day-group">
              <div class="mpal-day-label">${this._esc(day)}</div>
              ${grouped[day].map(e => `
                <div class="mpal-entry">
                  <div class="mpal-entry-dot mpal-dot--${this._esc(e.action)}"></div>
                  <div class="mpal-entry-body">
                    <div class="mpal-entry-text">
                      <span class="mpal-entry-member">${this._esc(e.member)}</span>
                      ${this._esc(e.detail)}
                    </div>
                    <div class="mpal-entry-time">${this._formatTime(e.timestamp)}</div>
                  </div>
                  <span class="mpal-entry-badge mpal-badge--${this._esc(e.action)}">${this._esc(e.action)}</span>
                </div>`).join('')}
            </div>`).join('')}
          ${filtered.length === 0 ? '<div class="mpal-empty">No activity entries match the current filters.</div>' : ''}
        </div>
      </div>`;
  },

  _getFiltered() {
    return this.entries.filter(e => {
      if (this.filterMember && e.member !== this.filterMember) return false;
      if (this.filterAction && e.action !== this.filterAction) return false;
      return true;
    });
  },

  _groupByDay(entries) {
    const groups = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;

    entries.forEach(e => {
      let label;
      if (e.timestamp >= today) label = 'Today';
      else if (e.timestamp >= yesterday) label = 'Yesterday';
      else label = 'Earlier';
      (groups[label] = groups[label] || []).push(e);
    });
    return groups;
  },

  _setMember(v) { this.filterMember = v; this.render(); },
  _setAction(v) { this.filterAction = v; this.render(); },

  _addEntry() {
    const memberEl = document.getElementById('mpal-add-member');
    const actionEl = document.getElementById('mpal-add-action');
    const detailEl = document.getElementById('mpal-add-detail');
    if (!detailEl || !detailEl.value.trim()) return;
    this.logChange(memberEl.value, actionEl.value, detailEl.value.trim());
  },

  _clearLog() { this.entries = []; this.render(); },

  _exportLog() {
    const text = this.entries.map(e =>
      `[${new Date(e.timestamp).toISOString()}] ${e.member} (${e.action}): ${e.detail}`
    ).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'activity-log.txt'; a.click();
    URL.revokeObjectURL(url);
  },

  _formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' +
           d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  },

  _esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; },
  _escAttr(str) { return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },

  exportState() {
    return {
      entries: JSON.parse(JSON.stringify(this.entries)),
      filterMember: this.filterMember,
      filterAction: this.filterAction
    };
  },

  importState(state) {
    if (!state) return;
    this.entries = state.entries || [];
    this.filterMember = state.filterMember || '';
    this.filterAction = state.filterAction || '';
    this.render();
  }
};
