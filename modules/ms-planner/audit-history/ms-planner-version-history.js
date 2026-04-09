/* ═══════════════════════════════════════════════
   MS PLANNER: Version History — JS Module
   Task version snapshots, side-by-side diff view,
   restore per version, auto-snapshot on edit
   Pattern: init(containerId), render(), exportState(), importState(state)
   ═══════════════════════════════════════════════ */

const MsPlannerVersionHistory = {
  container: null,
  task: null,
  versions: [],
  selectedVersion: null,
  diffMode: false,

  _defaultTask() {
    return {
      id: 'T-001', title: 'Design homepage mockup', description: 'Create wireframes for homepage.',
      assignee: 'Alice', status: 'In Progress', priority: 2, dueDate: '2026-04-15', bucket: 'Design'
    };
  },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    if (!this.task) this.task = this._defaultTask();
    if (!this.versions.length) this._seedVersions();
    this.render();
  },

  _seedVersions() {
    const now = Date.now();
    const h = 3600000;
    this.versions = [
      { id: 1, timestamp: now - 48 * h, author: 'Alice', snapshot: { title: 'Homepage mockup', description: '', assignee: 'Alice', status: 'Not Started', priority: 3, dueDate: '', bucket: 'Backlog' }, summary: 'Task created' },
      { id: 2, timestamp: now - 36 * h, author: 'Bob', snapshot: { title: 'Design homepage mockup', description: '', assignee: 'Alice', status: 'Not Started', priority: 3, dueDate: '2026-04-15', bucket: 'Backlog' }, summary: 'Updated title, set due date' },
      { id: 3, timestamp: now - 24 * h, author: 'Alice', snapshot: { title: 'Design homepage mockup', description: 'Create wireframes for homepage.', assignee: 'Alice', status: 'Not Started', priority: 2, dueDate: '2026-04-15', bucket: 'Design' }, summary: 'Added description, moved to Design bucket, raised priority' },
      { id: 4, timestamp: now - 6 * h, author: 'Alice', snapshot: { title: 'Design homepage mockup', description: 'Create wireframes for homepage.', assignee: 'Alice', status: 'In Progress', priority: 2, dueDate: '2026-04-15', bucket: 'Design' }, summary: 'Changed status to In Progress' }
    ];
  },

  editTask(field, value) {
    const prev = JSON.parse(JSON.stringify(this.task));
    this.task[field] = value;
    const changes = [];
    Object.keys(this.task).forEach(k => {
      if (String(this.task[k]) !== String(prev[k])) changes.push(k);
    });
    if (changes.length) {
      this.versions.push({
        id: Date.now(),
        timestamp: Date.now(),
        author: 'You',
        snapshot: JSON.parse(JSON.stringify(this.task)),
        summary: 'Changed ' + changes.join(', ')
      });
    }
    this.render();
  },

  render() {
    if (!this.container) return;
    const t = this.task;
    const vCount = this.versions.length;

    this.container.innerHTML = `
      <div class="mpvh-wrapper">
        <div class="mpvh-header">
          <div class="mpvh-title">Version History <span class="mpvh-badge">${vCount}</span></div>
        </div>

        <div class="mpvh-layout">
          <div class="mpvh-current-panel">
            <div class="mpvh-panel-title">Current Task</div>
            <div class="mpvh-field-group">
              ${this._editableRow('title', 'Title', t.title)}
              ${this._editableRow('description', 'Description', t.description)}
              ${this._editableRow('assignee', 'Assignee', t.assignee)}
              ${this._editableRow('status', 'Status', t.status)}
              ${this._editableRow('priority', 'Priority', String(t.priority))}
              ${this._editableRow('dueDate', 'Due Date', t.dueDate)}
              ${this._editableRow('bucket', 'Bucket', t.bucket)}
            </div>
          </div>

          <div class="mpvh-versions-panel">
            <div class="mpvh-panel-title">Versions</div>
            <div class="mpvh-version-list">
              ${this.versions.slice().reverse().map((v, i) => `
                <div class="mpvh-version-item ${this.selectedVersion === v.id ? 'mpvh-version--selected' : ''}"
                  onclick="MsPlannerVersionHistory._selectVersion(${v.id})">
                  <div class="mpvh-version-num">v${vCount - i}</div>
                  <div class="mpvh-version-info">
                    <div class="mpvh-version-summary">${this._esc(v.summary)}</div>
                    <div class="mpvh-version-meta">${this._esc(v.author)} &middot; ${this._formatTime(v.timestamp)}</div>
                  </div>
                  <button class="mpvh-restore-btn" onclick="event.stopPropagation(); MsPlannerVersionHistory._restore(${v.id})">Restore</button>
                </div>`).join('')}
            </div>
          </div>
        </div>

        ${this.selectedVersion && this.diffMode ? this._renderDiff() : ''}
      </div>`;
  },

  _editableRow(field, label, value) {
    return `
      <div class="mpvh-field-row">
        <span class="mpvh-field-label">${this._esc(label)}</span>
        <input class="mpvh-field-input" value="${this._escAttr(value)}"
          onchange="MsPlannerVersionHistory.editTask('${field}', this.value)" />
      </div>`;
  },

  _selectVersion(id) {
    this.selectedVersion = this.selectedVersion === id ? null : id;
    this.diffMode = !!this.selectedVersion;
    this.render();
  },

  _renderDiff() {
    const ver = this.versions.find(v => v.id === this.selectedVersion);
    if (!ver) return '';
    const snap = ver.snapshot;
    const current = this.task;
    const fields = ['title', 'description', 'assignee', 'status', 'priority', 'dueDate', 'bucket'];

    return `
      <div class="mpvh-diff-panel">
        <div class="mpvh-diff-title">Diff: Selected Version vs Current</div>
        <div class="mpvh-diff-table">
          <div class="mpvh-diff-header">
            <span class="mpvh-diff-col">Field</span>
            <span class="mpvh-diff-col">Snapshot</span>
            <span class="mpvh-diff-col">Current</span>
          </div>
          ${fields.map(f => {
            const old = String(snap[f] || '');
            const cur = String(current[f] || '');
            const changed = old !== cur;
            return `
              <div class="mpvh-diff-row ${changed ? 'mpvh-diff--changed' : ''}">
                <span class="mpvh-diff-field">${this._esc(f)}</span>
                <span class="mpvh-diff-old">${this._esc(old || '(empty)')}</span>
                <span class="mpvh-diff-new">${this._esc(cur || '(empty)')}</span>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  },

  _restore(id) {
    const ver = this.versions.find(v => v.id === id);
    if (!ver) return;
    const prev = JSON.parse(JSON.stringify(this.task));
    this.task = JSON.parse(JSON.stringify(ver.snapshot));
    const changes = [];
    Object.keys(this.task).forEach(k => {
      if (String(this.task[k]) !== String(prev[k])) changes.push(k);
    });
    if (changes.length) {
      this.versions.push({
        id: Date.now(),
        timestamp: Date.now(),
        author: 'You',
        snapshot: JSON.parse(JSON.stringify(this.task)),
        summary: 'Restored to earlier version (changed: ' + changes.join(', ') + ')'
      });
    }
    this.selectedVersion = null;
    this.diffMode = false;
    this.render();
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
      task: JSON.parse(JSON.stringify(this.task)),
      versions: JSON.parse(JSON.stringify(this.versions)),
      selectedVersion: this.selectedVersion,
      diffMode: this.diffMode
    };
  },

  importState(state) {
    if (!state) return;
    this.task = state.task || this._defaultTask();
    this.versions = state.versions || [];
    this.selectedVersion = state.selectedVersion || null;
    this.diffMode = state.diffMode || false;
    this.render();
  }
};
