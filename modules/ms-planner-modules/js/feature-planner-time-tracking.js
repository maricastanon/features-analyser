/* ═══════════════════════════════════════════════
   FEATURE: Planner Time Tracking — #1 Missing Feature
   Per-task timer, manual entry, weekly timesheet,
   billable/non-billable, team total hours.
   ═══════════════════════════════════════════════ */
const FeatPlannerTimeTracking = {
  entries: [],
  activeTimer: null,
  timerStart: null,
  timerInterval: null,
  timerElapsed: 0,
  viewMode: 'tasks',

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.entries = [
      { id:1, task:'Design dashboard wireframes', person:'Alex M.', hours:4.5, billable:true, date:'2026-04-07', category:'Design' },
      { id:2, task:'Implement REST API endpoints', person:'Chen W.', hours:6.0, billable:true, date:'2026-04-07', category:'Backend' },
      { id:3, task:'Write integration tests', person:'Kim P.', hours:3.0, billable:true, date:'2026-04-07', category:'Testing' },
      { id:4, task:'Team standup meeting', person:'Alex M.', hours:0.5, billable:false, date:'2026-04-07', category:'Meeting' },
      { id:5, task:'Design dashboard wireframes', person:'Alex M.', hours:3.0, billable:true, date:'2026-04-08', category:'Design' },
      { id:6, task:'Code review - PR #231', person:'Chen W.', hours:1.5, billable:true, date:'2026-04-08', category:'Backend' },
      { id:7, task:'Sprint planning meeting', person:'Sara K.', hours:2.0, billable:false, date:'2026-04-08', category:'Meeting' },
      { id:8, task:'Fix login redirect loop', person:'Sara K.', hours:4.0, billable:true, date:'2026-04-08', category:'Frontend' },
      { id:9, task:'Database query optimization', person:'Chen W.', hours:5.0, billable:true, date:'2026-04-09', category:'Backend' },
      { id:10, task:'Accessibility audit', person:'Eva J.', hours:3.5, billable:true, date:'2026-04-09', category:'Testing' },
      { id:11, task:'Deploy staging environment', person:'Bob L.', hours:2.0, billable:true, date:'2026-04-09', category:'DevOps' },
      { id:12, task:'1:1 with manager', person:'Bob L.', hours:0.5, billable:false, date:'2026-04-09', category:'Meeting' }
    ];
  },

  render() {
    const totalHrs = this.entries.reduce((s,e) => s + e.hours, 0);
    const billableHrs = this.entries.filter(e => e.billable).reduce((s,e) => s + e.hours, 0);
    const nonBillable = totalHrs - billableHrs;
    const billPct = totalHrs ? Math.round((billableHrs / totalHrs) * 100) : 0;

    // Team totals
    const byPerson = {};
    this.entries.forEach(e => { byPerson[e.person] = (byPerson[e.person] || 0) + e.hours; });
    const maxPersonHrs = Math.max(...Object.values(byPerson));

    // Weekly view
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const dates = ['2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10','2026-04-11','2026-04-12'];
    const dayTotals = dates.map(d => this.entries.filter(e => e.date === d).reduce((s,e) => s + e.hours, 0));

    const timerStr = this._formatTime(this.timerElapsed);

    this.container.innerHTML = `
    <div class="ptt-wrap">
      <div class="ptt-header">
        <h3 class="ptt-title">Time Tracking</h3>
        <span class="ptt-missing-badge">MISSING FROM PLANNER</span>
        <button class="ptt-btn ptt-btn-pink" onclick="FeatPlannerTimeTracking.addEntry()">+ Log Time</button>
      </div>

      <!-- Timer -->
      <div class="ptt-timer-bar">
        <div class="ptt-timer-display">${timerStr}</div>
        <input class="ptt-timer-input" id="pttTimerTask" placeholder="What are you working on?" value="${this._esc(this.activeTimer || '')}">
        ${this.timerInterval ?
          `<button class="ptt-timer-btn ptt-stop" onclick="FeatPlannerTimeTracking.stopTimer()">Stop</button>` :
          `<button class="ptt-timer-btn ptt-start" onclick="FeatPlannerTimeTracking.startTimer()">Start</button>`}
      </div>

      <!-- Stats -->
      <div class="ptt-stats">
        <div class="ptt-stat"><span class="ptt-stat-val">${totalHrs.toFixed(1)}h</span><span class="ptt-stat-label">Total Hours</span></div>
        <div class="ptt-stat"><span class="ptt-stat-val" style="color:#22c55e">${billableHrs.toFixed(1)}h</span><span class="ptt-stat-label">Billable</span></div>
        <div class="ptt-stat"><span class="ptt-stat-val" style="color:#5a8a60">${nonBillable.toFixed(1)}h</span><span class="ptt-stat-label">Non-billable</span></div>
        <div class="ptt-stat"><span class="ptt-stat-val" style="color:#e91e90">${billPct}%</span><span class="ptt-stat-label">Billable Rate</span></div>
      </div>

      <!-- View toggle -->
      <div class="ptt-view-toggle">
        <button class="ptt-vbtn ${this.viewMode==='tasks'?'active':''}" onclick="FeatPlannerTimeTracking.setView('tasks')">Task Log</button>
        <button class="ptt-vbtn ${this.viewMode==='timesheet'?'active':''}" onclick="FeatPlannerTimeTracking.setView('timesheet')">Timesheet</button>
        <button class="ptt-vbtn ${this.viewMode==='team'?'active':''}" onclick="FeatPlannerTimeTracking.setView('team')">Team</button>
      </div>

      ${this.viewMode === 'tasks' ? `
      <div class="ptt-entries">
        ${this.entries.slice().reverse().map(e => `
          <div class="ptt-entry">
            <div class="ptt-entry-left">
              <div class="ptt-entry-task">${this._esc(e.task)}</div>
              <div class="ptt-entry-meta">${this._esc(e.person)} &middot; ${e.date} &middot; ${e.category}</div>
            </div>
            <div class="ptt-entry-right">
              <span class="ptt-entry-hours">${e.hours.toFixed(1)}h</span>
              <span class="ptt-billable-tag ${e.billable?'ptt-bill':'ptt-nonbill'}" onclick="FeatPlannerTimeTracking.toggleBillable(${e.id})">${e.billable?'Billable':'Non-billable'}</span>
            </div>
          </div>`).join('')}
      </div>` : ''}

      ${this.viewMode === 'timesheet' ? `
      <div class="ptt-timesheet">
        <div class="ptt-ts-header">
          ${days.map((d,i) => `<div class="ptt-ts-day">
            <span class="ptt-ts-day-name">${d}</span>
            <span class="ptt-ts-day-total">${dayTotals[i].toFixed(1)}h</span>
          </div>`).join('')}
        </div>
        <div class="ptt-ts-bars">
          ${dayTotals.map((h,i) => `
            <div class="ptt-ts-col">
              <div class="ptt-ts-bar" style="height:${h ? (h/10)*100 : 0}%">
                ${h > 0 ? `<span class="ptt-ts-bar-val">${h.toFixed(1)}</span>` : ''}
              </div>
            </div>`).join('')}
        </div>
      </div>` : ''}

      ${this.viewMode === 'team' ? `
      <div class="ptt-team">
        ${Object.entries(byPerson).sort((a,b) => b[1]-a[1]).map(([name, hrs]) => `
          <div class="ptt-team-row">
            <span class="ptt-team-name">${this._esc(name)}</span>
            <div class="ptt-team-bar"><div class="ptt-team-fill" style="width:${(hrs/maxPersonHrs)*100}%"></div></div>
            <span class="ptt-team-hrs">${hrs.toFixed(1)}h</span>
          </div>`).join('')}
      </div>` : ''}
    </div>`;
  },

  startTimer() {
    const input = document.getElementById('pttTimerTask');
    this.activeTimer = input ? input.value : 'Untitled task';
    this.timerStart = Date.now();
    this.timerElapsed = 0;
    this.timerInterval = setInterval(() => {
      this.timerElapsed = Math.floor((Date.now() - this.timerStart) / 1000);
      const display = this.container.querySelector('.ptt-timer-display');
      if (display) display.textContent = this._formatTime(this.timerElapsed);
    }, 1000);
    this.render();
  },

  stopTimer() {
    clearInterval(this.timerInterval);
    const hours = Math.round((this.timerElapsed / 3600) * 10) / 10 || 0.1;
    this.entries.push({ id: Date.now(), task: this.activeTimer || 'Untitled', person: 'You', hours, billable: true, date: '2026-04-09', category: 'General' });
    this.timerInterval = null;
    this.timerElapsed = 0;
    this.activeTimer = null;
    this.render();
  },

  _formatTime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  },

  toggleBillable(id) {
    const e = this.entries.find(x => x.id === id);
    if (e) e.billable = !e.billable;
    this.render();
  },

  setView(v) { this.viewMode = v; this.render(); },

  addEntry() {
    const task = prompt('Task name:');
    if (!task?.trim()) return;
    const hours = parseFloat(prompt('Hours spent:', '1.0'));
    if (isNaN(hours)) return;
    this.entries.push({ id: Date.now(), task: task.trim(), person: 'You', hours, billable: true, date: '2026-04-09', category: 'General' });
    this.render();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { entries: this.entries, viewMode: this.viewMode }; },
  importState(s) { if (s.entries) this.entries = s.entries; if (s.viewMode) this.viewMode = s.viewMode; this.render(); }
};
