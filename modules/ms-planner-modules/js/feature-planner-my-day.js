/* ═══════════════════════════════════════════════
   FEATURE: Planner My Day — Personal daily view
   Today's tasks, suggested tasks, progress ring.
   ═══════════════════════════════════════════════ */
const FeatPlannerMyDay = {
  myDayTasks: [],
  suggestedTasks: [],

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.myDayTasks = [
      { id:1, title:'Review PR #247 — auth refactor', plan:'Sprint 12', done:false, priority:'urgent' },
      { id:2, title:'Update design tokens in Figma', plan:'Design System', done:true, priority:'important' },
      { id:3, title:'Prepare demo for stakeholders', plan:'Q2 Goals', done:false, priority:'urgent' },
      { id:4, title:'Fix pagination bug on /reports', plan:'Sprint 12', done:false, priority:'important' },
      { id:5, title:'Write migration script for users table', plan:'Backend Infra', done:true, priority:'medium' }
    ];
    this.suggestedTasks = [
      { id:101, title:'Update README with new endpoints', plan:'Backend Infra', priority:'low' },
      { id:102, title:'Test mobile responsive layout', plan:'Sprint 12', priority:'medium' },
      { id:103, title:'Schedule 1:1 with team lead', plan:'Q2 Goals', priority:'low' },
      { id:104, title:'Audit npm dependencies', plan:'Backend Infra', priority:'medium' }
    ];
  },

  render() {
    const priColors = { urgent:'#ef4444', important:'#f97316', medium:'#eab308', low:'#22c55e' };
    const doneCount = this.myDayTasks.filter(t => t.done).length;
    const totalCount = this.myDayTasks.length;
    const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (pct / 100) * circumference;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

    this.container.innerHTML = `
    <div class="pmd-wrap">
      <div class="pmd-header">
        <div>
          <h3 class="pmd-title">My Day</h3>
          <span class="pmd-date">${dateStr}</span>
        </div>
        <div class="pmd-ring-wrap">
          <svg class="pmd-ring" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1a3d28" stroke-width="6"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" stroke-width="6"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
              stroke-linecap="round" transform="rotate(-90 50 50)"/>
            <text x="50" y="48" text-anchor="middle" fill="#e8f5e9" font-size="18" font-weight="700">${pct}%</text>
            <text x="50" y="62" text-anchor="middle" fill="#5a8a60" font-size="9">complete</text>
          </svg>
        </div>
      </div>

      <div class="pmd-section">
        <div class="pmd-section-head">
          <span class="pmd-section-title">Today's Tasks</span>
          <span class="pmd-section-count">${doneCount}/${totalCount}</span>
        </div>
        <div class="pmd-task-list">
          ${this.myDayTasks.map(t => `
            <div class="pmd-task ${t.done?'pmd-task-done':''}">
              <button class="pmd-check ${t.done?'pmd-checked':''}" onclick="FeatPlannerMyDay.toggleDone(${t.id})">
                ${t.done ? '&#10003;' : ''}
              </button>
              <div class="pmd-task-info">
                <span class="pmd-task-title">${this._esc(t.title)}</span>
                <span class="pmd-task-plan">${this._esc(t.plan)}</span>
              </div>
              <span class="pmd-task-pri" style="color:${priColors[t.priority]}">${t.priority}</span>
              <button class="pmd-remove" onclick="FeatPlannerMyDay.removeFromDay(${t.id})">x</button>
            </div>`).join('')}
        </div>
      </div>

      <div class="pmd-section">
        <div class="pmd-section-head">
          <span class="pmd-section-title">Suggested for You</span>
          <span class="pmd-section-count">${this.suggestedTasks.length} tasks</span>
        </div>
        <div class="pmd-task-list">
          ${this.suggestedTasks.map(t => `
            <div class="pmd-task pmd-suggested">
              <div class="pmd-task-info">
                <span class="pmd-task-title">${this._esc(t.title)}</span>
                <span class="pmd-task-plan">${this._esc(t.plan)}</span>
              </div>
              <span class="pmd-task-pri" style="color:${priColors[t.priority]}">${t.priority}</span>
              <button class="pmd-add-btn" onclick="FeatPlannerMyDay.addToDay(${t.id})">+ Add</button>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
  },

  toggleDone(id) {
    const t = this.myDayTasks.find(x => x.id === id);
    if (t) t.done = !t.done;
    this.render();
  },

  removeFromDay(id) {
    const idx = this.myDayTasks.findIndex(t => t.id === id);
    if (idx >= 0) {
      const [task] = this.myDayTasks.splice(idx, 1);
      this.suggestedTasks.push({ id: task.id, title: task.title, plan: task.plan, priority: task.priority });
      this.render();
    }
  },

  addToDay(id) {
    const idx = this.suggestedTasks.findIndex(t => t.id === id);
    if (idx >= 0) {
      const [task] = this.suggestedTasks.splice(idx, 1);
      this.myDayTasks.push({ ...task, done: false });
      this.render();
    }
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { myDayTasks: this.myDayTasks, suggestedTasks: this.suggestedTasks }; },
  importState(s) { if (s.myDayTasks) this.myDayTasks = s.myDayTasks; if (s.suggestedTasks) this.suggestedTasks = s.suggestedTasks; this.render(); }
};
