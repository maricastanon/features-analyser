const MsPlannerProgressTracker = {
  container: null,
  tasks: [
    { id: 1, title: 'Design mockups', status: 'Completed', bucket: 'Design', member: 'Alice', completedDate: '2026-04-03' },
    { id: 2, title: 'Write specs', status: 'Completed', bucket: 'Planning', member: 'Bob', completedDate: '2026-04-04' },
    { id: 3, title: 'Build API', status: 'In Progress', bucket: 'Development', member: 'Charlie', completedDate: null },
    { id: 4, title: 'Auth module', status: 'In Progress', bucket: 'Development', member: 'Alice', completedDate: null },
    { id: 5, title: 'Setup CI', status: 'Not Started', bucket: 'DevOps', member: 'Bob', completedDate: null },
    { id: 6, title: 'Write tests', status: 'Not Started', bucket: 'Development', member: 'Charlie', completedDate: null },
    { id: 7, title: 'Deploy staging', status: 'Not Started', bucket: 'DevOps', member: 'Alice', completedDate: null },
    { id: 8, title: 'QA review', status: 'Late', bucket: 'QA', member: 'Bob', completedDate: null },
    { id: 9, title: 'Perf testing', status: 'Late', bucket: 'QA', member: 'Charlie', completedDate: null },
    { id: 10, title: 'User guide', status: 'Completed', bucket: 'Docs', member: 'Alice', completedDate: '2026-04-07' },
    { id: 11, title: 'API docs', status: 'Completed', bucket: 'Docs', member: 'Bob', completedDate: '2026-04-08' },
    { id: 12, title: 'Release notes', status: 'In Progress', bucket: 'Docs', member: 'Charlie', completedDate: null }
  ],
  _nextId: 13,
  _showForm: false,

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
  },

  _statusCounts() {
    const counts = { 'Not Started': 0, 'In Progress': 0, 'Completed': 0, 'Late': 0 };
    this.tasks.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return counts;
  },

  _bucketProgress() {
    const buckets = {};
    this.tasks.forEach(t => {
      if (!buckets[t.bucket]) buckets[t.bucket] = { total: 0, done: 0 };
      buckets[t.bucket].total++;
      if (t.status === 'Completed') buckets[t.bucket].done++;
    });
    return buckets;
  },

  _memberProgress() {
    const members = {};
    this.tasks.forEach(t => {
      if (!members[t.member]) members[t.member] = { total: 0, done: 0 };
      members[t.member].total++;
      if (t.status === 'Completed') members[t.member].done++;
    });
    return members;
  },

  _dailyCompletions() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date('2026-04-09');
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const count = this.tasks.filter(t => t.completedDate === iso).length;
      days.push({ label, count, date: iso });
    }
    return days;
  },

  _svgRing(percent, size, stroke) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percent / 100) * circ;
    return `<svg width="${size}" height="${size}" class="ppt-ring">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--border-soft)" stroke-width="${stroke}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--accent-green)" stroke-width="${stroke}"
        stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"
        transform="rotate(-90 ${size/2} ${size/2})"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" class="ppt-ring-text">${Math.round(percent)}%</text>
    </svg>`;
  },

  _addTask() {
    const title = this.container.querySelector('.ppt-input-title');
    const status = this.container.querySelector('.ppt-input-status');
    const bucket = this.container.querySelector('.ppt-input-bucket');
    const member = this.container.querySelector('.ppt-input-member');
    if (!title.value.trim()) return;
    const now = new Date().toISOString().split('T')[0];
    this.tasks.push({
      id: this._nextId++, title: title.value.trim(), status: status.value,
      bucket: bucket.value.trim() || 'General', member: member.value.trim() || 'Unassigned',
      completedDate: status.value === 'Completed' ? now : null
    });
    this._showForm = false;
    this.render();
  },

  _deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.render();
  },

  render() {
    if (!this.container) return;
    const counts = this._statusCounts();
    const total = this.tasks.length;
    const completedPct = total ? (counts['Completed'] / total) * 100 : 0;
    const buckets = this._bucketProgress();
    const members = this._memberProgress();
    const daily = this._dailyCompletions();
    const maxDaily = Math.max(...daily.map(d => d.count), 1);
    const statusColors = { 'Not Started': 'var(--text-muted)', 'In Progress': 'var(--accent-pink)', 'Completed': 'var(--accent-green)', 'Late': '#e74c3c' };

    let formHtml = '';
    if (this._showForm) {
      formHtml = `<div class="ppt-add-form">
        <input class="ppt-input-title ppt-input" placeholder="Task title" />
        <select class="ppt-input-status ppt-input">
          <option>Not Started</option><option>In Progress</option><option>Completed</option><option>Late</option>
        </select>
        <input class="ppt-input-bucket ppt-input" placeholder="Bucket" />
        <input class="ppt-input-member ppt-input" placeholder="Member" />
        <div class="ppt-form-actions">
          <button class="ppt-btn ppt-btn-save" data-action="save">Save</button>
          <button class="ppt-btn ppt-btn-cancel" data-action="cancel">Cancel</button>
        </div>
      </div>`;
    }

    let html = `<div class="ppt-panel">
      <div class="ppt-header">
        <h3>Progress Tracker</h3>
        <button class="ppt-btn ppt-btn-add" data-action="showForm">+ Add Task</button>
      </div>
      ${formHtml}
      <div class="ppt-top">
        <div class="ppt-ring-wrap">${this._svgRing(completedPct, 130, 10)}</div>
        <div class="ppt-status-breakdown">
          ${Object.entries(counts).map(([s, c]) => `<div class="ppt-status-row">
            <span class="ppt-status-dot" style="background:${statusColors[s]}"></span>
            <span class="ppt-status-name">${this._esc(s)}</span>
            <span class="ppt-status-count">${c}</span>
          </div>`).join('')}
        </div>
      </div>
      <div class="ppt-section">
        <div class="ppt-section-label">Per-Bucket Progress</div>
        ${Object.entries(buckets).map(([name, b]) => {
          const pct = b.total ? (b.done / b.total) * 100 : 0;
          return `<div class="ppt-bar-row">
            <span class="ppt-bar-label">${this._esc(name)}</span>
            <div class="ppt-bar-track"><div class="ppt-bar-fill" style="width:${pct}%"></div></div>
            <span class="ppt-bar-val">${b.done}/${b.total}</span>
          </div>`;
        }).join('')}
      </div>
      <div class="ppt-section">
        <div class="ppt-section-label">Per-Member Progress</div>
        ${Object.entries(members).map(([name, m]) => {
          const pct = m.total ? (m.done / m.total) * 100 : 0;
          return `<div class="ppt-bar-row">
            <span class="ppt-bar-label">${this._esc(name)}</span>
            <div class="ppt-bar-track"><div class="ppt-bar-fill ppt-bar-fill-pink" style="width:${pct}%"></div></div>
            <span class="ppt-bar-val">${m.done}/${m.total}</span>
          </div>`;
        }).join('')}
      </div>
      <div class="ppt-section">
        <div class="ppt-section-label">Daily Completions (Last 7 Days)</div>
        <div class="ppt-chart">
          ${daily.map(d => `<div class="ppt-chart-col">
            <div class="ppt-chart-bar-wrap"><div class="ppt-chart-bar" style="height:${(d.count / maxDaily) * 100}%">${d.count > 0 ? d.count : ''}</div></div>
            <div class="ppt-chart-label">${this._esc(d.label)}</div>
          </div>`).join('')}
        </div>
      </div>
      <div class="ppt-section">
        <div class="ppt-section-label">Task List</div>
        ${this.tasks.map(t => `<div class="ppt-task-item">
          <span class="ppt-task-title">${this._esc(t.title)}</span>
          <span class="ppt-task-meta">${this._esc(t.status)} &middot; ${this._esc(t.bucket)}</span>
          <button class="ppt-btn-del" data-action="delete" data-id="${t.id}">&times;</button>
        </div>`).join('')}
      </div>
    </div>`;

    this.container.innerHTML = html;
    this.container.onclick = (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'showForm') { this._showForm = true; this.render(); }
      else if (action === 'cancel') { this._showForm = false; this.render(); }
      else if (action === 'save') { this._addTask(); }
      else if (action === 'delete') { this._deleteTask(Number(btn.dataset.id)); }
    };
  },

  exportState() {
    return { tasks: JSON.parse(JSON.stringify(this.tasks)), _nextId: this._nextId };
  },

  importState(state) {
    if (!state) return;
    this.tasks = state.tasks || [];
    this._nextId = state._nextId || this.tasks.length + 1;
    this.render();
  }
};
