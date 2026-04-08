/* ═══════════════════════════════════════════════
   MS PLANNER: Task Creator — JS Module
   Full inline CRUD task creation with priority balls
   Pattern: init(containerId), render(), exportState(), importState(state)
   ═══════════════════════════════════════════════ */

const MsPlannerTaskCreator = {
  // ── State ──
  tasks: [],
  formOpen: false,
  editingId: null,
  buckets: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'],
  assignees: ['Unassigned', 'Alice', 'Bob', 'Carol', 'Dave'],

  // ── Priority Levels (5 colored balls) ──
  PRIORITIES: {
    1: { label: 'Critical', color: '#ef4444', emoji: '🔴' },
    2: { label: 'High',     color: '#f97316', emoji: '🟠' },
    3: { label: 'Medium',   color: '#eab308', emoji: '🟡' },
    4: { label: 'Low',      color: '#22c55e', emoji: '🟢' },
    5: { label: 'Someday',  color: '#3b82f6', emoji: '🔵' }
  },

  // ── Initialize ──
  init(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    if (options.buckets) this.buckets = options.buckets;
    if (options.assignees) this.assignees = options.assignees;
    if (options.tasks) this.tasks = options.tasks;
    this.render();
  },

  // ── Render ──
  render() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="mptc-wrap">
        <div class="mptc-header">
          <h3 class="mptc-title">Tasks</h3>
          <button class="mptc-btn-add" onclick="MsPlannerTaskCreator.toggleForm()">
            ${this.formOpen ? '✕ Cancel' : '＋ New Task'}
          </button>
        </div>
        ${this.formOpen ? this._renderForm(this.editingId ? this.tasks.find(t => t.id === this.editingId) : null) : ''}
        <div class="mptc-list">${this.tasks.length
          ? this.tasks.map(t => this._renderTask(t)).join('')
          : '<div class="mptc-empty">No tasks yet. Click "＋ New Task" to create one.</div>'
        }</div>
      </div>`;
  },

  _renderForm(task) {
    const v = task || { title: '', description: '', dueDate: '', priority: 3, assignee: this.assignees[0], bucket: this.buckets[0] };
    const bucketOpts = this.buckets.map(b => `<option value="${this._esc(b)}" ${v.bucket === b ? 'selected' : ''}>${this._esc(b)}</option>`).join('');
    const assigneeOpts = this.assignees.map(a => `<option value="${this._esc(a)}" ${v.assignee === a ? 'selected' : ''}>${this._esc(a)}</option>`).join('');
    const priorityBalls = [1,2,3,4,5].map(p =>
      `<div class="mptc-pball ${p <= v.priority ? 'p' + p : ''}" title="${this.PRIORITIES[p].label}"
           onclick="MsPlannerTaskCreator._setFormPriority(${p})"></div>`
    ).join('');
    return `
      <div class="mptc-form" id="mptc-form">
        <input class="mptc-input" id="mptc-f-title" placeholder="Task title..." value="${this._escAttr(v.title)}" />
        <textarea class="mptc-textarea" id="mptc-f-desc" placeholder="Description (optional)">${this._esc(v.description)}</textarea>
        <div class="mptc-form-row">
          <label class="mptc-label">Due<input type="date" class="mptc-input mptc-input-sm" id="mptc-f-due" value="${v.dueDate || ''}" /></label>
          <label class="mptc-label">Bucket<select class="mptc-select" id="mptc-f-bucket">${bucketOpts}</select></label>
          <label class="mptc-label">Assignee<select class="mptc-select" id="mptc-f-assignee">${assigneeOpts}</select></label>
        </div>
        <div class="mptc-form-row">
          <label class="mptc-label">Priority</label>
          <div class="mptc-priority-row" id="mptc-f-priority" data-val="${v.priority}">${priorityBalls}</div>
          <span class="mptc-priority-label">${this.PRIORITIES[v.priority].label}</span>
        </div>
        <div class="mptc-form-actions">
          <button class="mptc-btn-save" onclick="MsPlannerTaskCreator.saveForm()">${task ? 'Update' : 'Create'} Task</button>
        </div>
      </div>`;
  },

  _renderTask(t) {
    const balls = [1,2,3,4,5].map(p =>
      `<div class="mptc-pball ${p <= t.priority ? 'p' + p : ''}" title="${this.PRIORITIES[p].label}"
           onclick="event.stopPropagation(); MsPlannerTaskCreator.setPriority('${t.id}', ${p})"></div>`
    ).join('');
    const overdue = t.dueDate && new Date(t.dueDate) < new Date() ? ' mptc-overdue' : '';
    return `
      <div class="mptc-task">
        <div class="mptc-task-top">
          <span class="mptc-task-title">${this._esc(t.title)}</span>
          <div class="mptc-task-actions">
            <button class="mptc-btn-icon" title="Edit" onclick="MsPlannerTaskCreator.editTask('${t.id}')">✎</button>
            <button class="mptc-btn-icon mptc-btn-del" title="Delete" onclick="MsPlannerTaskCreator.deleteTask('${t.id}')">✕</button>
          </div>
        </div>
        ${t.description ? `<div class="mptc-task-desc">${this._esc(t.description)}</div>` : ''}
        <div class="mptc-task-meta">
          <span class="mptc-badge">${this._esc(t.bucket)}</span>
          <span class="mptc-badge mptc-badge-assign">${this._esc(t.assignee)}</span>
          ${t.dueDate ? `<span class="mptc-badge${overdue}">${t.dueDate}</span>` : ''}
          <div class="mptc-priority-row">${balls}</div>
        </div>
      </div>`;
  },

  // ── Actions ──
  toggleForm() {
    this.formOpen = !this.formOpen;
    if (!this.formOpen) this.editingId = null;
    this.render();
  },

  _setFormPriority(p) {
    const el = document.getElementById('mptc-f-priority');
    if (el) el.dataset.val = p;
    // Re-render balls inline
    el.querySelectorAll('.mptc-pball').forEach((b, i) => {
      b.className = 'mptc-pball' + ((i + 1) <= p ? ' p' + (i + 1) : '');
    });
    const lbl = el.parentElement.querySelector('.mptc-priority-label');
    if (lbl) lbl.textContent = this.PRIORITIES[p].label;
  },

  _getFormData() {
    const title = document.getElementById('mptc-f-title')?.value.trim();
    if (!title) return null;
    return {
      title,
      description: document.getElementById('mptc-f-desc')?.value.trim() || '',
      dueDate: document.getElementById('mptc-f-due')?.value || '',
      bucket: document.getElementById('mptc-f-bucket')?.value || this.buckets[0],
      assignee: document.getElementById('mptc-f-assignee')?.value || this.assignees[0],
      priority: parseInt(document.getElementById('mptc-f-priority')?.dataset.val) || 3
    };
  },

  saveForm() {
    const data = this._getFormData();
    if (!data) return;
    if (this.editingId) {
      const t = this.tasks.find(x => x.id === this.editingId);
      if (t) Object.assign(t, data);
    } else {
      this.tasks.push({ id: 'task_' + Date.now(), ...data, created: new Date().toISOString() });
    }
    this.editingId = null;
    this.formOpen = false;
    this.render();
  },

  editTask(id) {
    this.editingId = id;
    this.formOpen = true;
    this.render();
  },

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.render();
  },

  setPriority(id, p) {
    const t = this.tasks.find(x => x.id === id);
    if (t) { t.priority = p; this.render(); }
  },

  // ── Helpers ──
  _esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; },
  _escAttr(str) { return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },

  // ── Data Export / Import ──
  exportState() { return { tasks: JSON.parse(JSON.stringify(this.tasks)), buckets: [...this.buckets], assignees: [...this.assignees] }; },
  importState(state) {
    if (state.tasks) this.tasks = state.tasks;
    if (state.buckets) this.buckets = state.buckets;
    if (state.assignees) this.assignees = state.assignees;
    this.render();
  }
};
