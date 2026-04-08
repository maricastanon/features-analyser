const MsPlannerMyTasksOverview = {
  _container: null,
  _tasks: [],
  _completedThisWeek: 0,

  _sampleTasks() {
    return [
      { id: 1, title: 'Review Q2 budget proposal', plan: 'Finance Review', bucket: 'Analysis', due: this._daysFromNow(-2), completed: false, priority: 'high' },
      { id: 2, title: 'Update onboarding docs', plan: 'HR Onboarding', bucket: 'Documentation', due: this._daysFromNow(0), completed: false, priority: 'medium' },
      { id: 3, title: 'Fix login redirect bug', plan: 'Sprint 14', bucket: 'Bugs', due: this._daysFromNow(3), completed: false, priority: 'high' },
      { id: 4, title: 'Prepare demo slides', plan: 'Sprint 14', bucket: 'Deliverables', due: this._daysFromNow(1), completed: false, priority: 'medium' },
      { id: 5, title: 'Send partner contract', plan: 'Finance Review', bucket: 'Contracts', due: this._daysFromNow(-1), completed: false, priority: 'low' },
      { id: 6, title: 'Code review: auth module', plan: 'Sprint 14', bucket: 'Review', due: this._daysFromNow(5), completed: true, priority: 'medium' },
      { id: 7, title: 'Schedule team retro', plan: 'HR Onboarding', bucket: 'Meetings', due: this._daysFromNow(0), completed: false, priority: 'low' },
    ];
  },

  _daysFromNow(n) {
    const d = new Date(); d.setDate(d.getDate() + n); d.setHours(23, 59, 59, 0); return d.toISOString();
  },

  _esc(str) {
    const el = document.createElement('span'); el.textContent = str; return el.innerHTML;
  },

  _isOverdue(task) {
    return !task.completed && new Date(task.due) < new Date(new Date().toDateString());
  },

  _isDueToday(task) {
    const d = new Date(task.due); const t = new Date();
    return d.toDateString() === t.toDateString() && !task.completed;
  },

  _formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  _nextId() {
    return this._tasks.length ? Math.max(...this._tasks.map(t => t.id)) + 1 : 1;
  },

  _getStats() {
    const total = this._tasks.length;
    const overdue = this._tasks.filter(t => this._isOverdue(t)).length;
    const dueToday = this._tasks.filter(t => this._isDueToday(t)).length;
    return { total, overdue, dueToday, completedThisWeek: this._completedThisWeek };
  },

  _groupByPlan() {
    const groups = {};
    const active = this._tasks.filter(t => !t.completed);
    active.sort((a, b) => new Date(a.due) - new Date(b.due));
    active.forEach(t => { (groups[t.plan] = groups[t.plan] || []).push(t); });
    return groups;
  },

  _toggleComplete(id) {
    const task = this._tasks.find(t => t.id === id);
    if (task) { task.completed = !task.completed; if (task.completed) this._completedThisWeek++; else this._completedThisWeek = Math.max(0, this._completedThisWeek - 1); }
    this.render();
  },

  _deleteTask(id) {
    this._tasks = this._tasks.filter(t => t.id !== id);
    this.render();
  },

  _addTask(plan) {
    const form = this._container.querySelector(`.mto-add-form[data-plan="${CSS.escape(plan)}"]`);
    if (!form) return;
    const title = form.querySelector('.mto-input-title').value.trim();
    const due = form.querySelector('.mto-input-due').value;
    if (!title) return;
    this._tasks.push({ id: this._nextId(), title, plan, bucket: 'Inbox', due: due ? new Date(due).toISOString() : this._daysFromNow(7), completed: false, priority: 'medium' });
    this.render();
  },

  _renderStats() {
    const s = this._getStats();
    return `<div class="mto-stats-bar">
      <div class="mto-stat"><span class="mto-stat-num">${s.total}</span><span class="mto-stat-label">Assigned</span></div>
      <div class="mto-stat"><span class="mto-stat-num mto-today">${s.dueToday}</span><span class="mto-stat-label">Due Today</span></div>
      <div class="mto-stat"><span class="mto-stat-num mto-overdue">${s.overdue}</span><span class="mto-stat-label">Overdue</span></div>
      <div class="mto-stat"><span class="mto-stat-num mto-completed">${s.completedThisWeek}</span><span class="mto-stat-label">Done This Week</span></div>
    </div>`;
  },

  _renderTask(t) {
    const overdueClass = this._isOverdue(t) ? ' mto-task-overdue' : '';
    const todayClass = this._isDueToday(t) ? ' mto-task-today' : '';
    return `<div class="mto-task${overdueClass}${todayClass}" data-id="${t.id}">
      <label class="mto-check-label"><input type="checkbox" class="mto-check" data-id="${t.id}" ${t.completed ? 'checked' : ''}><span class="mto-checkmark"></span></label>
      <div class="mto-task-body">
        <span class="mto-task-title">${this._esc(t.title)}</span>
        <span class="mto-task-meta">${this._esc(t.bucket)} &middot; ${this._formatDate(t.due)}</span>
      </div>
      <span class="mto-priority mto-priority-${t.priority}">${this._esc(t.priority)}</span>
      <button class="mto-del-btn" data-id="${t.id}" title="Delete">&times;</button>
    </div>`;
  },

  render() {
    const groups = this._groupByPlan();
    const plans = Object.keys(groups).sort();
    let html = `<div class="mto-root"><h2 class="mto-heading">My Tasks</h2>${this._renderStats()}`;
    if (plans.length === 0) {
      html += '<p class="mto-empty">No active tasks assigned to you.</p>';
    }
    plans.forEach(plan => {
      html += `<div class="mto-plan-group"><h3 class="mto-plan-name">${this._esc(plan)} <span class="mto-plan-count">(${groups[plan].length})</span></h3>`;
      groups[plan].forEach(t => { html += this._renderTask(t); });
      html += `<div class="mto-add-form" data-plan="${this._esc(plan)}">
        <input type="text" class="mto-input-title" placeholder="New task title...">
        <input type="date" class="mto-input-due">
        <button class="mto-add-btn" data-plan="${this._esc(plan)}">Add</button>
      </div></div>`;
    });
    html += `<div class="mto-add-form" data-plan="__new__">
      <input type="text" class="mto-input-plan" placeholder="New plan name...">
      <input type="text" class="mto-input-title" placeholder="Task title...">
      <input type="date" class="mto-input-due">
      <button class="mto-add-new-plan-btn">Add to New Plan</button>
    </div>`;
    const completed = this._tasks.filter(t => t.completed);
    if (completed.length) {
      html += `<details class="mto-completed-section"><summary class="mto-completed-heading">Completed (${completed.length})</summary>`;
      completed.forEach(t => { html += this._renderTask(t); });
      html += '</details>';
    }
    html += '</div>';
    this._container.innerHTML = html;
    this._bind();
  },

  _bind() {
    this._container.querySelectorAll('.mto-check').forEach(cb => {
      cb.addEventListener('change', () => this._toggleComplete(Number(cb.dataset.id)));
    });
    this._container.querySelectorAll('.mto-del-btn').forEach(btn => {
      btn.addEventListener('click', () => this._deleteTask(Number(btn.dataset.id)));
    });
    this._container.querySelectorAll('.mto-add-btn').forEach(btn => {
      btn.addEventListener('click', () => this._addTask(btn.dataset.plan));
    });
    const newPlanBtn = this._container.querySelector('.mto-add-new-plan-btn');
    if (newPlanBtn) {
      newPlanBtn.addEventListener('click', () => {
        const form = newPlanBtn.closest('.mto-add-form');
        const plan = form.querySelector('.mto-input-plan').value.trim();
        const title = form.querySelector('.mto-input-title').value.trim();
        const due = form.querySelector('.mto-input-due').value;
        if (!plan || !title) return;
        this._tasks.push({ id: this._nextId(), title, plan, bucket: 'Inbox', due: due ? new Date(due).toISOString() : this._daysFromNow(7), completed: false, priority: 'medium' });
        this.render();
      });
    }
  },

  init(containerId) {
    this._container = document.getElementById(containerId);
    this._tasks = this._sampleTasks();
    this._completedThisWeek = this._tasks.filter(t => t.completed).length;
    this.render();
  },

  exportState() {
    return { tasks: JSON.parse(JSON.stringify(this._tasks)), completedThisWeek: this._completedThisWeek };
  },

  importState(state) {
    this._tasks = state.tasks || [];
    this._completedThisWeek = state.completedThisWeek || 0;
    this.render();
  }
};
