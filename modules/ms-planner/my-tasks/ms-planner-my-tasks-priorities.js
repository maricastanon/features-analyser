const MsPlannerMyTasksPriorities = {
  _container: null,
  _tasks: [],
  _draggedId: null,

  _quadrants: [
    { key: 'ui', label: 'Urgent & Important', color: '#e74c3c' },
    { key: 'ni', label: 'Not Urgent & Important', color: '#3498db' },
    { key: 'un', label: 'Urgent & Not Important', color: '#f39c12' },
    { key: 'nn', label: 'Neither Urgent nor Important', color: '#95a5a6' }
  ],

  _sampleTasks() {
    return [
      { id: 1, title: 'Fix production outage', quadrant: 'ui', priority: 'high', due: '2026-04-08' },
      { id: 2, title: 'Prepare strategy deck', quadrant: 'ni', priority: 'high', due: '2026-04-20' },
      { id: 3, title: 'Reply to vendor email', quadrant: 'un', priority: 'medium', due: '2026-04-09' },
      { id: 4, title: 'Clean up old branches', quadrant: 'nn', priority: 'low', due: '2026-04-30' },
      { id: 5, title: 'Security patch rollout', quadrant: 'ui', priority: 'high', due: '2026-04-07' },
      { id: 6, title: 'Team skill workshops', quadrant: 'ni', priority: 'medium', due: '2026-04-25' },
      { id: 7, title: 'Schedule room booking', quadrant: 'un', priority: 'low', due: '2026-04-10' },
      { id: 8, title: 'Archive old projects', quadrant: 'nn', priority: 'low', due: '2026-05-01' },
    ];
  },

  _esc(str) {
    const el = document.createElement('span'); el.textContent = str; return el.innerHTML;
  },

  _nextId() {
    return this._tasks.length ? Math.max(...this._tasks.map(t => t.id)) + 1 : 1;
  },

  _suggestQuadrant(priority, due) {
    const daysUntil = (new Date(due) - new Date()) / 86400000;
    const urgent = daysUntil <= 3;
    const important = priority === 'high';
    if (urgent && important) return 'ui';
    if (!urgent && important) return 'ni';
    if (urgent && !important) return 'un';
    return 'nn';
  },

  _tasksInQuadrant(key) {
    return this._tasks.filter(t => t.quadrant === key);
  },

  _deleteTask(id) {
    this._tasks = this._tasks.filter(t => t.id !== id);
    this.render();
  },

  _moveTask(id, newQuadrant) {
    const task = this._tasks.find(t => t.id === id);
    if (task) { task.quadrant = newQuadrant; }
    this.render();
  },

  _addTask(quadrant) {
    const form = this._container.querySelector(`.mtp-add-form[data-quad="${quadrant}"]`);
    if (!form) return;
    const title = form.querySelector('.mtp-add-title').value.trim();
    const priority = form.querySelector('.mtp-add-priority').value;
    const due = form.querySelector('.mtp-add-due').value;
    if (!title) return;
    const suggested = this._suggestQuadrant(priority, due || '2026-04-30');
    this._tasks.push({
      id: this._nextId(), title, quadrant: suggested !== quadrant ? quadrant : suggested,
      priority: priority || 'medium', due: due || '2026-04-30'
    });
    this.render();
  },

  _autoSort() {
    this._tasks.forEach(t => {
      t.quadrant = this._suggestQuadrant(t.priority, t.due);
    });
    this.render();
  },

  _renderQuadrant(q) {
    const tasks = this._tasksInQuadrant(q.key);
    let html = `<div class="mtp-quadrant mtp-q-${q.key}" data-quad="${q.key}">
      <div class="mtp-q-header" style="border-color: ${q.color}">
        <span class="mtp-q-label">${this._esc(q.label)}</span>
        <span class="mtp-q-count">${tasks.length}</span>
      </div>
      <div class="mtp-q-tasks" data-quad="${q.key}">`;
    tasks.forEach(t => {
      html += `<div class="mtp-task" draggable="true" data-id="${t.id}">
        <span class="mtp-task-title">${this._esc(t.title)}</span>
        <span class="mtp-task-due">${t.due}</span>
        <button class="mtp-task-del" data-id="${t.id}">&times;</button>
      </div>`;
    });
    html += `</div>
      <div class="mtp-add-form" data-quad="${q.key}">
        <input type="text" class="mtp-add-title" placeholder="Task title...">
        <select class="mtp-add-priority"><option value="high">High</option><option value="medium" selected>Medium</option><option value="low">Low</option></select>
        <input type="date" class="mtp-add-due">
        <button class="mtp-add-btn" data-quad="${q.key}">+</button>
      </div>
    </div>`;
    return html;
  },

  render() {
    let html = `<div class="mtp-root">
      <div class="mtp-header"><h2 class="mtp-heading">Priority Matrix</h2>
      <button class="mtp-auto-btn">Auto-Sort</button></div>
      <div class="mtp-grid">`;
    this._quadrants.forEach(q => { html += this._renderQuadrant(q); });
    html += '</div></div>';
    this._container.innerHTML = html;
    this._bind();
  },

  _bind() {
    // Drag and drop
    this._container.querySelectorAll('.mtp-task[draggable]').forEach(el => {
      el.addEventListener('dragstart', (e) => {
        this._draggedId = Number(el.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
        el.classList.add('mtp-dragging');
      });
      el.addEventListener('dragend', () => { el.classList.remove('mtp-dragging'); });
    });

    this._container.querySelectorAll('.mtp-q-tasks').forEach(zone => {
      zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('mtp-drop-active'); });
      zone.addEventListener('dragleave', () => { zone.classList.remove('mtp-drop-active'); });
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('mtp-drop-active');
        if (this._draggedId !== null) {
          this._moveTask(this._draggedId, zone.dataset.quad);
          this._draggedId = null;
        }
      });
    });

    // Delete
    this._container.querySelectorAll('.mtp-task-del').forEach(btn => {
      btn.addEventListener('click', () => this._deleteTask(Number(btn.dataset.id)));
    });

    // Add
    this._container.querySelectorAll('.mtp-add-btn').forEach(btn => {
      btn.addEventListener('click', () => this._addTask(btn.dataset.quad));
    });

    // Auto-sort
    const autoBtn = this._container.querySelector('.mtp-auto-btn');
    if (autoBtn) autoBtn.addEventListener('click', () => this._autoSort());
  },

  init(containerId) {
    this._container = document.getElementById(containerId);
    this._tasks = this._sampleTasks();
    this.render();
  },

  exportState() {
    return { tasks: JSON.parse(JSON.stringify(this._tasks)) };
  },

  importState(state) {
    this._tasks = state.tasks || [];
    this.render();
  }
};
