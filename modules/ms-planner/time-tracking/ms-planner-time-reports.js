const MsPlannerTimeReports = {
  container: null,
  timeLog: [
    { taskTitle: 'Design mockups', member: 'Alice', hours: 3.5, date: '2026-04-07' },
    { taskTitle: 'Design mockups', member: 'Alice', hours: 2.0, date: '2026-04-08' },
    { taskTitle: 'Write specs', member: 'Bob', hours: 4.0, date: '2026-04-07' },
    { taskTitle: 'Write specs', member: 'Bob', hours: 1.5, date: '2026-04-08' },
    { taskTitle: 'Build API', member: 'Charlie', hours: 6.0, date: '2026-04-07' },
    { taskTitle: 'Build API', member: 'Charlie', hours: 5.5, date: '2026-04-08' },
    { taskTitle: 'Build API', member: 'Alice', hours: 3.0, date: '2026-04-09' },
    { taskTitle: 'Auth module', member: 'Bob', hours: 2.5, date: '2026-04-09' },
    { taskTitle: 'Setup CI', member: 'Charlie', hours: 1.0, date: '2026-04-06' },
    { taskTitle: 'Design mockups', member: 'Alice', hours: 4.0, date: '2026-04-03' },
    { taskTitle: 'Write specs', member: 'Bob', hours: 3.0, date: '2026-04-04' },
    { taskTitle: 'Build API', member: 'Charlie', hours: 7.0, date: '2026-04-05' },
    { taskTitle: 'Auth module', member: 'Alice', hours: 2.0, date: '2026-04-05' }
  ],
  _rangeMode: 'thisWeek',
  _customStart: '',
  _customEnd: '',

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
  },

  _dateRange() {
    const today = new Date('2026-04-09');
    let start, end;
    if (this._rangeMode === 'thisWeek') {
      const day = today.getDay();
      start = new Date(today); start.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
      end = new Date(start); end.setDate(start.getDate() + 6);
    } else if (this._rangeMode === 'lastWeek') {
      const day = today.getDay();
      start = new Date(today); start.setDate(today.getDate() - (day === 0 ? 6 : day - 1) - 7);
      end = new Date(start); end.setDate(start.getDate() + 6);
    } else if (this._rangeMode === 'thisMonth') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else {
      start = this._customStart ? new Date(this._customStart) : new Date(today);
      end = this._customEnd ? new Date(this._customEnd) : new Date(today);
    }
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  },

  _filtered() {
    const { start, end } = this._dateRange();
    return this.timeLog.filter(l => l.date >= start && l.date <= end);
  },

  _groupBy(entries, key) {
    const map = {};
    entries.forEach(e => {
      const k = e[key];
      map[k] = (map[k] || 0) + e.hours;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  },

  _stats(entries) {
    const total = entries.reduce((s, e) => s + e.hours, 0);
    const days = {};
    entries.forEach(e => { days[e.date] = (days[e.date] || 0) + e.hours; });
    const dayEntries = Object.entries(days);
    const numDays = dayEntries.length || 1;
    const avg = total / numDays;
    let busiest = '-';
    if (dayEntries.length > 0) {
      dayEntries.sort((a, b) => b[1] - a[1]);
      busiest = dayEntries[0][0];
    }
    return { total: total.toFixed(1), avg: avg.toFixed(1), busiest };
  },

  _exportText() {
    const entries = this._filtered();
    const { start, end } = this._dateRange();
    const stats = this._stats(entries);
    const byTask = this._groupBy(entries, 'taskTitle');
    const byMember = this._groupBy(entries, 'member');
    let text = `Time Report (${start} to ${end})\n`;
    text += `Total: ${stats.total}h | Avg/day: ${stats.avg}h | Busiest: ${stats.busiest}\n\n`;
    text += 'By Task:\n' + byTask.map(([t, h]) => `  ${t}: ${h.toFixed(1)}h`).join('\n') + '\n\n';
    text += 'By Member:\n' + byMember.map(([m, h]) => `  ${m}: ${h.toFixed(1)}h`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `time-report-${start}.txt`; a.click();
    URL.revokeObjectURL(url);
  },

  render() {
    if (!this.container) return;
    const entries = this._filtered();
    const byTask = this._groupBy(entries, 'taskTitle');
    const byMember = this._groupBy(entries, 'member');
    const stats = this._stats(entries);
    const maxTask = byTask.length > 0 ? byTask[0][1] : 1;
    const maxMember = byMember.length > 0 ? byMember[0][1] : 1;
    const { start, end } = this._dateRange();

    const rangeOpts = [
      ['thisWeek', 'This Week'], ['lastWeek', 'Last Week'],
      ['thisMonth', 'This Month'], ['custom', 'Custom']
    ];

    const customFields = this._rangeMode === 'custom' ? `
      <div class="trp-custom-range">
        <input type="date" class="trp-input" data-field="customStart" value="${this._esc(this._customStart)}" />
        <span class="trp-range-sep">to</span>
        <input type="date" class="trp-input" data-field="customEnd" value="${this._esc(this._customEnd)}" />
      </div>` : '';

    let html = `<div class="trp-panel">
      <div class="trp-header">
        <h3>Time Reports</h3>
        <button class="trp-btn trp-btn-export" data-action="export">Export Text</button>
      </div>
      <div class="trp-range-bar">
        ${rangeOpts.map(([v, l]) => `<button class="trp-range-btn${this._rangeMode === v ? ' trp-range-active' : ''}" data-action="range" data-value="${v}">${l}</button>`).join('')}
      </div>
      ${customFields}
      <div class="trp-period">${this._esc(start)} &mdash; ${this._esc(end)}</div>
      <div class="trp-stats">
        <div class="trp-stat"><span class="trp-stat-val">${stats.total}h</span><span class="trp-stat-lbl">Total</span></div>
        <div class="trp-stat"><span class="trp-stat-val">${stats.avg}h</span><span class="trp-stat-lbl">Avg / Day</span></div>
        <div class="trp-stat"><span class="trp-stat-val">${this._esc(stats.busiest)}</span><span class="trp-stat-lbl">Busiest Day</span></div>
      </div>
      <div class="trp-section">
        <div class="trp-section-label">By Task</div>
        ${byTask.length === 0 ? '<div class="trp-empty">No data for this range</div>' : ''}
        ${byTask.map(([t, h]) => `<div class="trp-bar-row">
          <span class="trp-bar-label">${this._esc(t)}</span>
          <div class="trp-bar-track"><div class="trp-bar-fill" style="width:${(h / maxTask) * 100}%"></div></div>
          <span class="trp-bar-val">${h.toFixed(1)}h</span>
        </div>`).join('')}
      </div>
      <div class="trp-section">
        <div class="trp-section-label">By Member</div>
        ${byMember.map(([m, h]) => `<div class="trp-bar-row">
          <span class="trp-bar-label">${this._esc(m)}</span>
          <div class="trp-bar-track"><div class="trp-bar-fill trp-bar-fill-pink" style="width:${(h / maxMember) * 100}%"></div></div>
          <span class="trp-bar-val">${h.toFixed(1)}h</span>
        </div>`).join('')}
      </div>
    </div>`;

    this.container.innerHTML = html;

    this.container.onclick = (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'range') { this._rangeMode = btn.dataset.value; this.render(); }
      else if (btn.dataset.action === 'export') { this._exportText(); }
    };

    this.container.onchange = (e) => {
      if (e.target.dataset.field === 'customStart') { this._customStart = e.target.value; this.render(); }
      if (e.target.dataset.field === 'customEnd') { this._customEnd = e.target.value; this.render(); }
    };
  },

  exportState() {
    return {
      timeLog: JSON.parse(JSON.stringify(this.timeLog)),
      _rangeMode: this._rangeMode,
      _customStart: this._customStart,
      _customEnd: this._customEnd
    };
  },

  importState(state) {
    if (!state) return;
    this.timeLog = state.timeLog || [];
    this._rangeMode = state._rangeMode || 'thisWeek';
    this._customStart = state._customStart || '';
    this._customEnd = state._customEnd || '';
    this.render();
  }
};
