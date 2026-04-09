/* ═══════════════════════════════════════════════
   MS PLANNER: Recurrence Engine — JS Module
   Recurring task management with pause/resume, generate, history
   Pattern: init(containerId), render(), exportState(), importState(state)
   ═══════════════════════════════════════════════ */

const MsPlannerRecurrenceEngine = {
  // ── State ──
  recurrences: [],
  history: [],
  formOpen: false,
  assignees: ['Unassigned', 'Alice', 'Bob', 'Carol', 'Dave'],
  FREQUENCIES: ['daily', 'weekdays', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom'],

  // ── Initialize ──
  init(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    if (options.assignees) this.assignees = options.assignees;
    if (options.recurrences) this.recurrences = options.recurrences;
    this.render();
  },

  // ── Render ──
  render() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="mpre-wrap">
        <div class="mpre-header">
          <h3 class="mpre-title">Recurring Tasks</h3>
          <button class="mpre-btn-add" onclick="MsPlannerRecurrenceEngine.toggleForm()">
            ${this.formOpen ? '✕ Cancel' : '＋ New Recurrence'}
          </button>
        </div>
        ${this.formOpen ? this._renderForm() : ''}
        <div class="mpre-list">${this.recurrences.length
          ? this.recurrences.map(r => this._renderItem(r)).join('')
          : '<div class="mpre-empty">No recurring tasks. Click "＋ New Recurrence" to create one.</div>'
        }</div>
        ${this.history.length ? this._renderHistory() : ''}
      </div>`;
  },

  _renderForm() {
    const freqOpts = this.FREQUENCIES.map(f =>
      `<option value="${f}">${this._esc(f.charAt(0).toUpperCase() + f.slice(1))}</option>`).join('');
    const assignOpts = this.assignees.map(a =>
      `<option value="${this._escAttr(a)}">${this._esc(a)}</option>`).join('');
    return `
      <div class="mpre-form">
        <input class="mpre-input" id="mpre-f-title" placeholder="Recurring task title..." />
        <div class="mpre-form-row">
          <label class="mpre-label">Frequency<select class="mpre-select" id="mpre-f-freq">${freqOpts}</select></label>
          <label class="mpre-label">Start Date<input type="date" class="mpre-input mpre-input-sm" id="mpre-f-start" /></label>
          <label class="mpre-label">Assignee<select class="mpre-select" id="mpre-f-assign">${assignOpts}</select></label>
        </div>
        <div class="mpre-form-actions">
          <button class="mpre-btn-save" onclick="MsPlannerRecurrenceEngine.saveForm()">Create Recurrence</button>
        </div>
      </div>`;
  },

  _renderItem(r) {
    const nextDate = this._calcNext(r);
    const statusCls = r.paused ? 'mpre-paused' : 'mpre-active';
    const statusLabel = r.paused ? 'Paused' : 'Active';
    const instances = this.history.filter(h => h.recurrenceId === r.id);
    return `
      <div class="mpre-item ${statusCls}">
        <div class="mpre-item-top">
          <span class="mpre-item-title">${this._esc(r.title)}</span>
          <div class="mpre-item-actions">
            <button class="mpre-btn-icon" title="${r.paused ? 'Resume' : 'Pause'}"
              onclick="MsPlannerRecurrenceEngine.togglePause('${r.id}')">${r.paused ? '▶' : '⏸'}</button>
            <button class="mpre-btn-icon mpre-btn-gen" title="Generate Next"
              onclick="MsPlannerRecurrenceEngine.generateNext('${r.id}')">⚡</button>
            <button class="mpre-btn-icon mpre-btn-del" title="Delete"
              onclick="MsPlannerRecurrenceEngine.deleteRecurrence('${r.id}')">✕</button>
          </div>
        </div>
        <div class="mpre-item-meta">
          <span class="mpre-badge mpre-badge-freq">${this._esc(r.frequency)}</span>
          <span class="mpre-badge">${this._esc(r.assignee)}</span>
          <span class="mpre-badge mpre-badge-status ${statusCls}">${statusLabel}</span>
          <span class="mpre-badge mpre-badge-next">Next: ${nextDate}</span>
        </div>
        ${instances.length ? `
          <div class="mpre-instances">
            <span class="mpre-instances-label">History (${instances.length})</span>
            <div class="mpre-instances-list">
              ${instances.slice(-5).map(h => `<span class="mpre-instance-chip">${this._esc(h.generatedDate)}</span>`).join('')}
            </div>
          </div>` : ''}
      </div>`;
  },

  _renderHistory() {
    return `
      <div class="mpre-history">
        <h4 class="mpre-history-title">Instance History</h4>
        <div class="mpre-history-list">
          ${this.history.slice(-10).reverse().map(h => `
            <div class="mpre-history-row">
              <span class="mpre-history-task">${this._esc(h.title)}</span>
              <span class="mpre-history-date">${this._esc(h.generatedDate)}</span>
            </div>`).join('')}
        </div>
      </div>`;
  },

  // ── Actions ──
  toggleForm() { this.formOpen = !this.formOpen; this.render(); },

  saveForm() {
    const title = document.getElementById('mpre-f-title')?.value.trim();
    if (!title) return;
    const freq = document.getElementById('mpre-f-freq')?.value || 'weekly';
    const start = document.getElementById('mpre-f-start')?.value || new Date().toISOString().slice(0, 10);
    const assignee = document.getElementById('mpre-f-assign')?.value || this.assignees[0];
    this.recurrences.push({
      id: 'rec_' + Date.now(), title, frequency: freq, startDate: start,
      assignee, paused: false, lastGenerated: null, created: new Date().toISOString()
    });
    this.formOpen = false;
    this.render();
  },

  togglePause(id) {
    const r = this.recurrences.find(x => x.id === id);
    if (r) { r.paused = !r.paused; this.render(); }
  },

  generateNext(id) {
    const r = this.recurrences.find(x => x.id === id);
    if (!r || r.paused) return;
    const nextDate = this._calcNext(r);
    this.history.push({
      id: 'inst_' + Date.now(), recurrenceId: r.id, title: r.title,
      generatedDate: nextDate, createdAt: new Date().toISOString()
    });
    r.lastGenerated = nextDate;
    this.render();
  },

  deleteRecurrence(id) {
    this.recurrences = this.recurrences.filter(r => r.id !== id);
    this.render();
  },

  // ── Date Calculation ──
  _calcNext(r) {
    const base = r.lastGenerated ? new Date(r.lastGenerated) : new Date(r.startDate);
    const d = new Date(base);
    switch (r.frequency) {
      case 'daily': d.setDate(d.getDate() + 1); break;
      case 'weekdays':
        d.setDate(d.getDate() + 1);
        while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
        break;
      case 'weekly': d.setDate(d.getDate() + 7); break;
      case 'biweekly': d.setDate(d.getDate() + 14); break;
      case 'monthly': d.setMonth(d.getMonth() + 1); break;
      case 'quarterly': d.setMonth(d.getMonth() + 3); break;
      case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
      default: d.setDate(d.getDate() + 7); break;
    }
    return d.toISOString().slice(0, 10);
  },

  // ── Helpers ──
  _esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; },
  _escAttr(str) { return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },

  // ── Data Export / Import ──
  exportState() {
    return {
      recurrences: JSON.parse(JSON.stringify(this.recurrences)),
      history: JSON.parse(JSON.stringify(this.history))
    };
  },
  importState(state) {
    if (state.recurrences) this.recurrences = state.recurrences;
    if (state.history) this.history = state.history;
    this.render();
  }
};
