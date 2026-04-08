/* ═══════════════════════════════════════════════
   MS PLANNER: Task Details — JS Module
   Slide-out detail pane with editable fields,
   checklist progress, attachments, comments, activity log
   Pattern: init(containerId), render(), exportState(), importState(state)
   ═══════════════════════════════════════════════ */

const MsPlannerTaskDetails = {
  // ── State ──
  task: null,
  editingField: null,
  container: null,

  _defaultTask() {
    return {
      id: '', title: 'Untitled Task', description: '',
      assignees: [], dueDate: '', startDate: '', bucket: '',
      priority: 3, percentComplete: 0,
      checklist: [],
      attachments: [],
      comments: [],
      activity: []
    };
  },

  PRIORITIES: {
    1: { label: 'Critical', color: '#ef4444' },
    2: { label: 'High',     color: '#f97316' },
    3: { label: 'Medium',   color: '#eab308' },
    4: { label: 'Low',      color: '#22c55e' },
    5: { label: 'Someday',  color: '#3b82f6' }
  },

  // ── Initialize ──
  init(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.task = options.task || this._defaultTask();
    this.render();
  },

  loadTask(task) {
    this.task = Object.assign(this._defaultTask(), task);
    this.editingField = null;
    this.render();
  },

  // ── Render ──
  render() {
    if (!this.container || !this.task) return;
    const t = this.task;
    const checkDone = t.checklist.filter(c => c.done).length;
    const checkTotal = t.checklist.length;
    const pct = checkTotal ? Math.round((checkDone / checkTotal) * 100) : 0;
    const balls = [1,2,3,4,5].map(p =>
      `<div class="mptd-pball ${p <= t.priority ? 'p' + p : ''}" title="${this.PRIORITIES[p].label}"
           onclick="MsPlannerTaskDetails.setPriority(${p})"></div>`
    ).join('');

    this.container.innerHTML = `
      <div class="mptd-panel">
        <div class="mptd-header">
          ${this._editableField('title', t.title, 'mptd-field-title')}
          <button class="mptd-close" onclick="MsPlannerTaskDetails.close()">✕</button>
        </div>

        <div class="mptd-section">
          <div class="mptd-row"><span class="mptd-label">Priority</span><div class="mptd-priority-row">${balls}</div></div>
          <div class="mptd-row"><span class="mptd-label">Bucket</span>${this._editableField('bucket', t.bucket || 'None', 'mptd-field-inline')}</div>
          <div class="mptd-row"><span class="mptd-label">Start</span><input type="date" class="mptd-date" value="${t.startDate}" onchange="MsPlannerTaskDetails.setField('startDate', this.value)" /></div>
          <div class="mptd-row"><span class="mptd-label">Due</span><input type="date" class="mptd-date" value="${t.dueDate}" onchange="MsPlannerTaskDetails.setField('dueDate', this.value)" /></div>
          <div class="mptd-row"><span class="mptd-label">Assignees</span><span class="mptd-chips">${t.assignees.map(a => `<span class="mptd-chip">${this._esc(a)} <span class="mptd-chip-x" onclick="MsPlannerTaskDetails.removeAssignee('${this._escAttr(a)}')">✕</span></span>`).join('')}<button class="mptd-chip-add" onclick="MsPlannerTaskDetails.addAssigneeInline()">+</button></span></div>
        </div>

        <div class="mptd-section">
          <span class="mptd-section-title">Description</span>
          ${this._editableField('description', t.description || 'Click to add description...', 'mptd-field-desc', true)}
        </div>

        <div class="mptd-section">
          <div class="mptd-section-head"><span class="mptd-section-title">Checklist</span><span class="mptd-pct">${pct}%</span></div>
          <div class="mptd-progress"><div class="mptd-progress-bar" style="width:${pct}%"></div></div>
          <div class="mptd-checklist">${t.checklist.map((c, i) => `
            <div class="mptd-check-item">
              <input type="checkbox" ${c.done ? 'checked' : ''} onchange="MsPlannerTaskDetails.toggleCheck(${i})" />
              <span class="mptd-check-text ${c.done ? 'done' : ''}">${this._esc(c.text)}</span>
              <button class="mptd-btn-xs" onclick="MsPlannerTaskDetails.removeCheck(${i})">✕</button>
            </div>`).join('')}
            <div class="mptd-check-add">
              <input class="mptd-input-sm" id="mptd-new-check" placeholder="Add item..." onkeydown="if(event.key==='Enter')MsPlannerTaskDetails.addCheck()" />
              <button class="mptd-btn-xs mptd-btn-go" onclick="MsPlannerTaskDetails.addCheck()">+</button>
            </div>
          </div>
        </div>

        <div class="mptd-section">
          <span class="mptd-section-title">Attachments</span>
          <div class="mptd-attach-list">${t.attachments.map((a, i) => `
            <div class="mptd-attach-item"><span>📎 ${this._esc(a.name)}</span><button class="mptd-btn-xs" onclick="MsPlannerTaskDetails.removeAttach(${i})">✕</button></div>`).join('')}
            <div class="mptd-check-add">
              <input class="mptd-input-sm" id="mptd-new-attach" placeholder="Attachment name..." onkeydown="if(event.key==='Enter')MsPlannerTaskDetails.addAttach()" />
              <button class="mptd-btn-xs mptd-btn-go" onclick="MsPlannerTaskDetails.addAttach()">+</button>
            </div>
          </div>
        </div>

        <div class="mptd-section">
          <span class="mptd-section-title">Comments</span>
          <div class="mptd-comments">${t.comments.map((c, i) => `
            <div class="mptd-comment"><strong>${this._esc(c.author)}</strong> <span class="mptd-comment-time">${this._relTime(c.date)}</span><p>${this._esc(c.text)}</p><button class="mptd-btn-xs" onclick="MsPlannerTaskDetails.removeComment(${i})">✕</button></div>`).join('')}
            <div class="mptd-comment-add">
              <input class="mptd-input-sm" id="mptd-new-comment" placeholder="Write a comment..." onkeydown="if(event.key==='Enter')MsPlannerTaskDetails.addComment()" />
              <button class="mptd-btn-xs mptd-btn-go" onclick="MsPlannerTaskDetails.addComment()">+</button>
            </div>
          </div>
        </div>

        <div class="mptd-section mptd-activity">
          <span class="mptd-section-title">Activity</span>
          ${t.activity.map(a => `<div class="mptd-activity-item"><span class="mptd-activity-dot"></span>${this._esc(a.text)} <span class="mptd-comment-time">${this._relTime(a.date)}</span></div>`).join('')}
        </div>
      </div>`;
  },

  // ── Editable Fields ──
  _editableField(field, value, cls, multiline = false) {
    if (this.editingField === field) {
      const tag = multiline ? 'textarea' : 'input';
      const val = this.task[field] || '';
      return `<${tag} class="mptd-edit-input ${cls}" id="mptd-edit-${field}" value="${this._escAttr(val)}"
        onblur="MsPlannerTaskDetails.commitEdit('${field}')"
        onkeydown="if(!${multiline}&&event.key==='Enter')MsPlannerTaskDetails.commitEdit('${field}')"
        autofocus>${multiline ? this._esc(val) + '</textarea>' : ''}`;
    }
    return `<span class="${cls} mptd-editable" onclick="MsPlannerTaskDetails.startEdit('${field}')">${this._esc(value)}</span>`;
  },

  startEdit(field) { this.editingField = field; this.render(); setTimeout(() => document.getElementById('mptd-edit-' + field)?.focus(), 0); },
  commitEdit(field) {
    const el = document.getElementById('mptd-edit-' + field);
    if (el) { const old = this.task[field]; this.task[field] = el.value.trim(); if (old !== this.task[field]) this._log(`Updated ${field}`); }
    this.editingField = null; this.render();
  },

  // ── Actions ──
  setPriority(p) { this.task.priority = p; this._log(`Priority set to ${this.PRIORITIES[p].label}`); this.render(); },
  setField(f, v) { this.task[f] = v; this._log(`Updated ${f}`); this.render(); },

  addAssigneeInline() {
    const name = window.prompt ? null : ''; // no prompt fallback
    // Use inline input trick: inject temp input
    const chips = this.container.querySelector('.mptd-chips');
    if (!chips || chips.querySelector('.mptd-inline-assign')) return;
    const inp = document.createElement('input'); inp.className = 'mptd-input-sm mptd-inline-assign'; inp.placeholder = 'Name...';
    inp.onkeydown = (e) => { if (e.key === 'Enter' && inp.value.trim()) { this.task.assignees.push(inp.value.trim()); this._log(`Added assignee ${inp.value.trim()}`); this.render(); } };
    inp.onblur = () => { if (inp.value.trim()) { this.task.assignees.push(inp.value.trim()); this._log(`Added assignee ${inp.value.trim()}`); } this.render(); };
    chips.insertBefore(inp, chips.querySelector('.mptd-chip-add')); inp.focus();
  },

  removeAssignee(name) { this.task.assignees = this.task.assignees.filter(a => a !== name); this._log(`Removed assignee ${name}`); this.render(); },

  toggleCheck(i) { this.task.checklist[i].done = !this.task.checklist[i].done; this.render(); },
  addCheck() { const el = document.getElementById('mptd-new-check'); if (el?.value.trim()) { this.task.checklist.push({ text: el.value.trim(), done: false }); this._log(`Added checklist item`); this.render(); } },
  removeCheck(i) { this.task.checklist.splice(i, 1); this.render(); },

  addAttach() { const el = document.getElementById('mptd-new-attach'); if (el?.value.trim()) { this.task.attachments.push({ name: el.value.trim(), url: '#' }); this._log(`Added attachment`); this.render(); } },
  removeAttach(i) { this.task.attachments.splice(i, 1); this.render(); },

  addComment() { const el = document.getElementById('mptd-new-comment'); if (el?.value.trim()) { this.task.comments.push({ author: 'You', text: el.value.trim(), date: new Date().toISOString() }); this._log(`Added comment`); this.render(); } },
  removeComment(i) { this.task.comments.splice(i, 1); this.render(); },

  close() { if (this.container) this.container.innerHTML = ''; },

  // ── Helpers ──
  _log(text) { if (this.task) this.task.activity.unshift({ text, date: new Date().toISOString() }); },
  _esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; },
  _escAttr(str) { return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },
  _relTime(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return Math.floor(diff / 86400000) + 'd ago';
  },

  // ── Data Export / Import ──
  exportState() { return { task: JSON.parse(JSON.stringify(this.task)) }; },
  importState(state) { if (state.task) { this.task = state.task; this.render(); } }
};
