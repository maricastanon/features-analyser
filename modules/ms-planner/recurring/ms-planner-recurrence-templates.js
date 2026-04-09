/* ═══════════════════════════════════════════════
   MS PLANNER: Recurrence Templates — JS Module
   Pre-built and custom recurrence patterns with preview
   Pattern: init(containerId), render(), exportState(), importState(state)
   ═══════════════════════════════════════════════ */

const MsPlannerRecurrenceTemplates = {
  // ── State ──
  builtIn: [
    { id: 'tpl_standup',  name: 'Daily Standup',   frequency: 'weekdays',  time: '09:00', description: 'Morning sync with the team every weekday at 9 AM', assignee: 'Team Lead' },
    { id: 'tpl_review',   name: 'Weekly Review',   frequency: 'weekly',    time: '14:00', description: 'End-of-week progress review every Friday', assignee: 'Project Manager' },
    { id: 'tpl_report',   name: 'Monthly Report',  frequency: 'monthly',   time: '10:00', description: 'Compile and submit monthly status report on the 1st', assignee: 'Analyst' },
    { id: 'tpl_okr',      name: 'Quarterly OKR',   frequency: 'quarterly', time: '09:00', description: 'Review and set OKRs at the start of each quarter', assignee: 'Director' },
    { id: 'tpl_retro',    name: 'Sprint Retro',    frequency: 'biweekly',  time: '15:00', description: 'Retrospective meeting every two weeks', assignee: 'Scrum Master' }
  ],
  custom: [],
  applied: [],
  formOpen: false,
  editingId: null,
  previewId: null,

  // ── Initialize ──
  init(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    if (options.custom) this.custom = options.custom;
    this.render();
  },

  // ── Render ──
  render() {
    if (!this.container) return;
    const all = [...this.builtIn, ...this.custom];
    this.container.innerHTML = `
      <div class="mprt-wrap">
        <div class="mprt-header">
          <h3 class="mprt-title">Recurrence Templates</h3>
          <button class="mprt-btn-add" onclick="MsPlannerRecurrenceTemplates.toggleForm()">
            ${this.formOpen ? '✕ Cancel' : '＋ Custom Template'}
          </button>
        </div>
        ${this.formOpen ? this._renderForm() : ''}
        <div class="mprt-list">
          ${all.map(t => this._renderTemplate(t)).join('')}
        </div>
        ${this.previewId ? this._renderPreview() : ''}
      </div>`;
  },

  _renderForm() {
    const tpl = this.editingId ? this.custom.find(c => c.id === this.editingId) : null;
    const v = tpl || { name: '', frequency: 'weekly', time: '09:00', description: '', assignee: '' };
    const freqs = ['daily','weekdays','weekly','biweekly','monthly','quarterly','yearly'].map(f =>
      `<option value="${f}" ${v.frequency === f ? 'selected' : ''}>${f.charAt(0).toUpperCase() + f.slice(1)}</option>`).join('');
    return `
      <div class="mprt-form">
        <input class="mprt-input" id="mprt-f-name" placeholder="Template name..." value="${this._escAttr(v.name)}" />
        <input class="mprt-input" id="mprt-f-desc" placeholder="Description..." value="${this._escAttr(v.description)}" />
        <div class="mprt-form-row">
          <label class="mprt-label">Frequency<select class="mprt-select" id="mprt-f-freq">${freqs}</select></label>
          <label class="mprt-label">Time<input type="time" class="mprt-input mprt-input-sm" id="mprt-f-time" value="${v.time}" /></label>
          <label class="mprt-label">Suggested Assignee<input class="mprt-input mprt-input-sm" id="mprt-f-assign" value="${this._escAttr(v.assignee)}" placeholder="Assignee..." /></label>
        </div>
        <div class="mprt-form-actions">
          <button class="mprt-btn-save" onclick="MsPlannerRecurrenceTemplates.saveForm()">
            ${tpl ? 'Update' : 'Create'} Template
          </button>
        </div>
      </div>`;
  },

  _renderTemplate(t) {
    const isCustom = this.custom.some(c => c.id === t.id);
    const isApplied = this.applied.includes(t.id);
    return `
      <div class="mprt-card ${isApplied ? 'mprt-applied' : ''}">
        <div class="mprt-card-top">
          <div class="mprt-card-info">
            <span class="mprt-card-name">${this._esc(t.name)}</span>
            <span class="mprt-card-desc">${this._esc(t.description)}</span>
          </div>
          <div class="mprt-card-actions">
            <button class="mprt-btn-preview" title="Preview" onclick="MsPlannerRecurrenceTemplates.togglePreview('${t.id}')">👁</button>
            ${!isApplied ? `<button class="mprt-btn-apply" onclick="MsPlannerRecurrenceTemplates.applyTemplate('${t.id}')">Apply</button>` :
              '<span class="mprt-badge-applied">Applied</span>'}
            ${isCustom ? `
              <button class="mprt-btn-icon" title="Edit" onclick="MsPlannerRecurrenceTemplates.editTemplate('${t.id}')">✎</button>
              <button class="mprt-btn-icon mprt-btn-del" title="Delete" onclick="MsPlannerRecurrenceTemplates.deleteTemplate('${t.id}')">✕</button>
            ` : ''}
          </div>
        </div>
        <div class="mprt-card-meta">
          <span class="mprt-badge mprt-badge-freq">${this._esc(t.frequency)}</span>
          <span class="mprt-badge">${this._esc(t.time || '')}</span>
          <span class="mprt-badge mprt-badge-assign">${this._esc(t.assignee)}</span>
        </div>
      </div>`;
  },

  _renderPreview() {
    const all = [...this.builtIn, ...this.custom];
    const tpl = all.find(t => t.id === this.previewId);
    if (!tpl) return '';
    const instances = this._generatePreview(tpl, 5);
    return `
      <div class="mprt-preview">
        <div class="mprt-preview-header">
          <span class="mprt-preview-title">Next 5 Instances: ${this._esc(tpl.name)}</span>
          <button class="mprt-btn-icon" onclick="MsPlannerRecurrenceTemplates.togglePreview(null)">✕</button>
        </div>
        <div class="mprt-preview-list">
          ${instances.map((d, i) => `
            <div class="mprt-preview-row">
              <span class="mprt-preview-num">#${i + 1}</span>
              <span class="mprt-preview-date">${this._esc(d)}</span>
            </div>`).join('')}
        </div>
      </div>`;
  },

  // ── Actions ──
  toggleForm() {
    this.formOpen = !this.formOpen;
    if (!this.formOpen) this.editingId = null;
    this.render();
  },

  saveForm() {
    const name = document.getElementById('mprt-f-name')?.value.trim();
    if (!name) return;
    const data = {
      name,
      description: document.getElementById('mprt-f-desc')?.value.trim() || '',
      frequency: document.getElementById('mprt-f-freq')?.value || 'weekly',
      time: document.getElementById('mprt-f-time')?.value || '09:00',
      assignee: document.getElementById('mprt-f-assign')?.value.trim() || 'Unassigned'
    };
    if (this.editingId) {
      const c = this.custom.find(x => x.id === this.editingId);
      if (c) Object.assign(c, data);
    } else {
      this.custom.push({ id: 'ctpl_' + Date.now(), ...data });
    }
    this.editingId = null;
    this.formOpen = false;
    this.render();
  },

  editTemplate(id) { this.editingId = id; this.formOpen = true; this.render(); },
  deleteTemplate(id) {
    this.custom = this.custom.filter(c => c.id !== id);
    if (this.previewId === id) this.previewId = null; this.render();
  },
  applyTemplate(id) { if (!this.applied.includes(id)) this.applied.push(id); this.render(); },
  togglePreview(id) { this.previewId = this.previewId === id ? null : id; this.render(); },

  _generatePreview(tpl, count) {
    const dates = [], d = new Date(); d.setHours(0, 0, 0, 0);
    let safety = 0;
    while (dates.length < count && safety < 365) {
      safety++; d.setDate(d.getDate() + 1);
      if (this._matchesFreq(d, tpl.frequency)) dates.push(d.toISOString().slice(0, 10) + ' ' + (tpl.time || ''));
    }
    return dates;
  },

  _matchesFreq(date, freq) {
    const day = date.getDay();
    if (freq === 'daily') return true;
    if (freq === 'weekdays') return day !== 0 && day !== 6;
    if (freq === 'weekly') return day === 5;
    if (freq === 'biweekly') { const wk = Math.floor((date - new Date(date.getFullYear(), 0, 1)) / 604800000); return day === 5 && wk % 2 === 0; }
    if (freq === 'monthly') return date.getDate() === 1;
    if (freq === 'quarterly') return date.getDate() === 1 && date.getMonth() % 3 === 0;
    if (freq === 'yearly') return date.getDate() === 1 && date.getMonth() === 0;
    return day === 5;
  },

  // ── Helpers ──
  _esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; },
  _escAttr(str) { return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },

  exportState() { return { custom: JSON.parse(JSON.stringify(this.custom)), applied: [...this.applied] }; },
  importState(state) {
    if (state.custom) this.custom = state.custom;
    if (state.applied) this.applied = state.applied;
    this.render();
  }
};
