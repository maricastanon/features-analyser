const MsPlannerMemberWorkload = {
  _container: null,
  _members: [],
  _sortBy: 'name',
  _showReassign: null,

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  init(containerId) {
    this._container = document.getElementById(containerId);
    if (!this._container) return;
    this._members = [
      { id: 1, name: 'Alice Johnson', capacity: 8, tasks: { notStarted: 2, inProgress: 3, done: 1 } },
      { id: 2, name: 'Bob Smith', capacity: 6, tasks: { notStarted: 3, inProgress: 4, done: 2 } },
      { id: 3, name: 'Carol Davis', capacity: 5, tasks: { notStarted: 1, inProgress: 1, done: 3 } },
      { id: 4, name: 'Dan Lee', capacity: 7, tasks: { notStarted: 5, inProgress: 2, done: 1 } },
    ];
    this.render();
  },

  _totalTasks(m) {
    return m.tasks.notStarted + m.tasks.inProgress + m.tasks.done;
  },

  _isOverloaded(m) {
    return this._totalTasks(m) > m.capacity;
  },

  _sorted() {
    const arr = [...this._members];
    if (this._sortBy === 'name') arr.sort((a, b) => a.name.localeCompare(b.name));
    else if (this._sortBy === 'tasks') arr.sort((a, b) => this._totalTasks(b) - this._totalTasks(a));
    else if (this._sortBy === 'overload') arr.sort((a, b) => (this._isOverloaded(b) ? 1 : 0) - (this._isOverloaded(a) ? 1 : 0));
    return arr;
  },

  _summary() {
    const total = this._members.reduce((s, m) => s + this._totalTasks(m), 0);
    const avg = this._members.length ? (total / this._members.length).toFixed(1) : 0;
    const most = this._members.reduce((a, b) => this._totalTasks(a) >= this._totalTasks(b) ? a : b, this._members[0]);
    const least = this._members.reduce((a, b) => this._totalTasks(a) <= this._totalTasks(b) ? a : b, this._members[0]);
    return { avg, most: most ? most.name : '-', least: least ? least.name : '-' };
  },

  render() {
    const esc = this._escapeHtml.bind(this);
    const members = this._sorted();
    const summary = this._summary();

    let html = `<div class="mpw-panel">
      <h2 class="mpw-title">Workload Dashboard</h2>
      <div class="mpw-summary">
        <span class="mpw-stat">Avg tasks: <strong>${summary.avg}</strong></span>
        <span class="mpw-stat">Most loaded: <strong>${esc(summary.most)}</strong></span>
        <span class="mpw-stat">Least loaded: <strong>${esc(summary.least)}</strong></span>
      </div>
      <div class="mpw-sort">
        Sort by:
        <button class="mpw-sort-btn${this._sortBy === 'name' ? ' mpw-sort-active' : ''}" data-sort="name">Name</button>
        <button class="mpw-sort-btn${this._sortBy === 'tasks' ? ' mpw-sort-active' : ''}" data-sort="tasks">Task Count</button>
        <button class="mpw-sort-btn${this._sortBy === 'overload' ? ' mpw-sort-active' : ''}" data-sort="overload">Overload</button>
      </div>
      <div class="mpw-list">`;

    for (const m of members) {
      const total = this._totalTasks(m);
      const maxBar = Math.max(total, m.capacity);
      const pctNS = maxBar ? (m.tasks.notStarted / maxBar) * 100 : 0;
      const pctIP = maxBar ? (m.tasks.inProgress / maxBar) * 100 : 0;
      const pctD = maxBar ? (m.tasks.done / maxBar) * 100 : 0;
      const overloaded = this._isOverloaded(m);

      html += `<div class="mpw-member${overloaded ? ' mpw-overloaded' : ''}" data-id="${m.id}">
        <div class="mpw-member-header">
          <span class="mpw-member-name">${esc(m.name)}</span>
          <span class="mpw-member-count">${total} / ${m.capacity} tasks</span>
          ${overloaded ? '<span class="mpw-overload-badge">OVERLOADED</span>' : ''}
          <button class="mpw-btn mpw-btn-reassign">Reassign</button>
        </div>
        <div class="mpw-bar-track">
          <div class="mpw-bar-seg mpw-bar-not-started" style="width:${pctNS}%"></div>
          <div class="mpw-bar-seg mpw-bar-in-progress" style="width:${pctIP}%"></div>
          <div class="mpw-bar-seg mpw-bar-done" style="width:${pctD}%"></div>
        </div>
        <div class="mpw-bar-legend">
          <span class="mpw-legend-item"><span class="mpw-legend-dot mpw-bar-not-started"></span>Not started: ${m.tasks.notStarted}</span>
          <span class="mpw-legend-item"><span class="mpw-legend-dot mpw-bar-in-progress"></span>In progress: ${m.tasks.inProgress}</span>
          <span class="mpw-legend-item"><span class="mpw-legend-dot mpw-bar-done"></span>Done: ${m.tasks.done}</span>
        </div>`;

      if (this._showReassign === m.id) {
        html += `<div class="mpw-reassign-form">
          <label class="mpw-reassign-label">Move
            <input type="number" class="mpw-input mpw-reassign-count" min="1" max="${total}" value="1" />
            task(s) to
            <select class="mpw-select mpw-reassign-target">`;
        for (const other of this._members) {
          if (other.id !== m.id) html += `<option value="${other.id}">${esc(other.name)}</option>`;
        }
        html += `</select></label>
          <button class="mpw-btn mpw-btn-confirm-reassign">Move</button>
          <button class="mpw-btn mpw-btn-cancel-reassign">Cancel</button>
        </div>`;
      }
      html += `</div>`;
    }

    html += `</div></div>`;
    this._container.innerHTML = html;
    this._bind();
  },

  _bind() {
    const c = this._container;
    c.querySelectorAll('.mpw-sort-btn').forEach(btn => {
      btn.addEventListener('click', () => { this._sortBy = btn.dataset.sort; this.render(); });
    });
    c.querySelectorAll('.mpw-btn-reassign').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.closest('.mpw-member').dataset.id);
        this._showReassign = this._showReassign === id ? null : id;
        this.render();
      });
    });
    c.querySelectorAll('.mpw-btn-confirm-reassign').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.mpw-member');
        const fromId = Number(card.dataset.id);
        const count = parseInt(card.querySelector('.mpw-reassign-count').value, 10) || 1;
        const toId = Number(card.querySelector('.mpw-reassign-target').value);
        const from = this._members.find(x => x.id === fromId);
        const to = this._members.find(x => x.id === toId);
        if (from && to) {
          let moved = 0;
          for (const status of ['notStarted', 'inProgress']) {
            const take = Math.min(count - moved, from.tasks[status]);
            from.tasks[status] -= take;
            to.tasks[status] += take;
            moved += take;
            if (moved >= count) break;
          }
        }
        this._showReassign = null;
        this.render();
      });
    });
    c.querySelectorAll('.mpw-btn-cancel-reassign').forEach(btn => {
      btn.addEventListener('click', () => { this._showReassign = null; this.render(); });
    });
  },

  exportState() {
    return { members: JSON.parse(JSON.stringify(this._members)), sortBy: this._sortBy };
  },

  importState(state) {
    if (!state) return;
    if (state.members) this._members = state.members;
    if (state.sortBy) this._sortBy = state.sortBy;
    this.render();
  }
};
