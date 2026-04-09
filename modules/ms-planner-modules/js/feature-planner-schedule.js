/* ═══════════════════════════════════════════════
   FEATURE: Planner Schedule — Calendar month view
   Tasks on a month grid with due date indicators,
   color-coded by priority, drag to reschedule.
   ═══════════════════════════════════════════════ */
const FeatPlannerSchedule = {
  tasks: [],
  year: 2026,
  month: 3, // April (0-indexed)

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.tasks = [
      { id:1, title:'Sprint planning', dueDate:'2026-04-06', priority:'urgent' },
      { id:2, title:'Design review', dueDate:'2026-04-08', priority:'important' },
      { id:3, title:'API integration', dueDate:'2026-04-09', priority:'urgent' },
      { id:4, title:'Code review', dueDate:'2026-04-09', priority:'medium' },
      { id:5, title:'Unit tests', dueDate:'2026-04-11', priority:'important' },
      { id:6, title:'Bug bash', dueDate:'2026-04-14', priority:'medium' },
      { id:7, title:'Stakeholder demo', dueDate:'2026-04-15', priority:'urgent' },
      { id:8, title:'Release prep', dueDate:'2026-04-17', priority:'important' },
      { id:9, title:'Deploy to staging', dueDate:'2026-04-18', priority:'urgent' },
      { id:10, title:'Retrospective', dueDate:'2026-04-20', priority:'low' },
      { id:11, title:'Documentation update', dueDate:'2026-04-22', priority:'low' },
      { id:12, title:'Performance review', dueDate:'2026-04-24', priority:'important' },
      { id:13, title:'Sprint close', dueDate:'2026-04-27', priority:'medium' }
    ];
  },

  render() {
    const priColors = { urgent:'#ef4444', important:'#f97316', medium:'#eab308', low:'#22c55e' };
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    const firstDay = new Date(this.year, this.month, 1).getDay();
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    let cells = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: 0, tasks: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${this.year}-${String(this.month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      cells.push({ day: d, dateStr, tasks: this.tasks.filter(t => t.dueDate === dateStr) });
    }

    this.container.innerHTML = `
    <div class="ps-wrap">
      <div class="ps-header">
        <h3 class="ps-title">Schedule</h3>
        <div class="ps-nav">
          <button class="ps-nav-btn" onclick="FeatPlannerSchedule.prevMonth()">&laquo;</button>
          <span class="ps-month-label">${monthNames[this.month]} ${this.year}</span>
          <button class="ps-nav-btn" onclick="FeatPlannerSchedule.nextMonth()">&raquo;</button>
        </div>
        <button class="ps-btn ps-btn-pink" onclick="FeatPlannerSchedule.addTask()">+ Add Task</button>
      </div>
      <div class="ps-calendar">
        <div class="ps-day-names">
          ${dayNames.map(d => `<div class="ps-day-name">${d}</div>`).join('')}
        </div>
        <div class="ps-grid">
          ${cells.map(cell => {
            if (cell.day === 0) return `<div class="ps-cell ps-cell-empty"></div>`;
            const isToday = cell.dateStr === todayStr;
            return `
              <div class="ps-cell ${isToday?'ps-cell-today':''}" data-date="${cell.dateStr}"
                ondragover="event.preventDefault();this.classList.add('ps-cell-hover')"
                ondragleave="this.classList.remove('ps-cell-hover')"
                ondrop="FeatPlannerSchedule._drop(event,'${cell.dateStr}');this.classList.remove('ps-cell-hover')">
                <span class="ps-cell-day ${isToday?'ps-today-badge':''}">${cell.day}</span>
                <div class="ps-cell-tasks">
                  ${cell.tasks.map(t => `
                    <div class="ps-task-chip" draggable="true"
                      ondragstart="FeatPlannerSchedule._dragStart(event,${t.id})"
                      style="border-left:3px solid ${priColors[t.priority]}"
                      title="${this._esc(t.title)}">${this._esc(t.title)}</div>
                  `).join('')}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  },

  _dragStart(e, taskId) {
    this._dragTaskId = taskId;
    e.dataTransfer.effectAllowed = 'move';
  },

  _drop(e, dateStr) {
    e.preventDefault();
    if (!this._dragTaskId) return;
    const task = this.tasks.find(t => t.id === this._dragTaskId);
    if (task) { task.dueDate = dateStr; }
    this._dragTaskId = null;
    this.render();
  },

  prevMonth() {
    this.month--;
    if (this.month < 0) { this.month = 11; this.year--; }
    this.render();
  },

  nextMonth() {
    this.month++;
    if (this.month > 11) { this.month = 0; this.year++; }
    this.render();
  },

  addTask() {
    const title = prompt('Task title:');
    if (!title?.trim()) return;
    const due = prompt('Due date (YYYY-MM-DD):', `${this.year}-${String(this.month+1).padStart(2,'0')}-15`);
    if (!due) return;
    this.tasks.push({ id: Date.now(), title: title.trim(), dueDate: due, priority: 'medium' });
    this.render();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { tasks: this.tasks, year: this.year, month: this.month }; },
  importState(s) { if (s.tasks) this.tasks = s.tasks; if (s.year != null) this.year = s.year; if (s.month != null) this.month = s.month; this.render(); }
};
