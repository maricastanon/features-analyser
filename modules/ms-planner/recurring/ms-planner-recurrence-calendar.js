/* ═══════════════════════════════════════════════
   MS PLANNER: Recurrence Calendar — JS Module
   Monthly grid view for recurring task instances
   Pattern: init(containerId), render(), exportState(), importState(state)
   ═══════════════════════════════════════════════ */

const MsPlannerRecurrenceCalendar = {
  // ── State ──
  recurrences: [],
  exceptions: [],
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  selectedDate: null,
  FREQ_COLORS: { daily: 'mprc-green', weekdays: 'mprc-green', weekly: 'mprc-pink', biweekly: 'mprc-pink',
    monthly: 'mprc-gold', quarterly: 'mprc-gold', yearly: 'mprc-gold', custom: 'mprc-pink' },
  DAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  MONTHS: ['January','February','March','April','May','June','July','August','September','October','November','December'],

  // ── Initialize ──
  init(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    if (options.recurrences) this.recurrences = options.recurrences;
    this.render();
  },

  // ── Render ──
  render() {
    if (!this.container) return;
    const instances = this._generateMonthInstances();
    this.container.innerHTML = `
      <div class="mprc-wrap">
        <div class="mprc-header">
          <h3 class="mprc-title">Recurrence Calendar</h3>
        </div>
        <div class="mprc-nav">
          <button class="mprc-btn-nav" onclick="MsPlannerRecurrenceCalendar.prevMonth()">◀</button>
          <span class="mprc-month-label">${this.MONTHS[this.currentMonth]} ${this.currentYear}</span>
          <button class="mprc-btn-nav" onclick="MsPlannerRecurrenceCalendar.nextMonth()">▶</button>
        </div>
        <div class="mprc-grid">
          ${this.DAYS.map(d => `<div class="mprc-day-header">${d}</div>`).join('')}
          ${this._renderCells(instances)}
        </div>
        ${this.selectedDate ? this._renderDayDetail(instances) : ''}
        <div class="mprc-legend">
          <span class="mprc-legend-item"><span class="mprc-legend-dot mprc-green"></span>Daily / Weekdays</span>
          <span class="mprc-legend-item"><span class="mprc-legend-dot mprc-pink"></span>Weekly / Biweekly</span>
          <span class="mprc-legend-item"><span class="mprc-legend-dot mprc-gold"></span>Monthly / Quarterly / Yearly</span>
        </div>
      </div>`;
  },

  _renderCells(instances) {
    const first = new Date(this.currentYear, this.currentMonth, 1);
    const last = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDay = first.getDay();
    const totalDays = last.getDate();
    const today = new Date().toISOString().slice(0, 10);
    let cells = '';
    for (let i = 0; i < startDay; i++) cells += '<div class="mprc-cell mprc-cell-empty"></div>';
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayInsts = instances.filter(inst => inst.date === dateStr);
      const isToday = dateStr === today;
      const isSelected = dateStr === this.selectedDate;
      const dots = dayInsts.slice(0, 3).map(inst =>
        `<span class="mprc-dot ${this.FREQ_COLORS[inst.frequency] || 'mprc-pink'}"></span>`).join('');
      cells += `
        <div class="mprc-cell ${isToday ? 'mprc-today' : ''} ${isSelected ? 'mprc-selected' : ''} ${dayInsts.length ? 'mprc-has-items' : ''}"
             onclick="MsPlannerRecurrenceCalendar.selectDate('${dateStr}')">
          <span class="mprc-cell-num">${d}</span>
          <div class="mprc-cell-dots">${dots}</div>
        </div>`;
    }
    return cells;
  },

  _renderDayDetail(instances) {
    const dayInsts = instances.filter(inst => inst.date === this.selectedDate);
    const isException = this.exceptions.includes(this.selectedDate);
    return `
      <div class="mprc-detail">
        <div class="mprc-detail-header">
          <span class="mprc-detail-date">${this.selectedDate}</span>
          ${!isException ? `<button class="mprc-btn-skip" onclick="MsPlannerRecurrenceCalendar.addException('${this.selectedDate}')">Skip This Date</button>` :
            '<span class="mprc-badge-skipped">Skipped</span>'}
        </div>
        ${dayInsts.length ? dayInsts.map(inst => `
          <div class="mprc-detail-item">
            <span class="mprc-dot ${this.FREQ_COLORS[inst.frequency] || 'mprc-pink'}"></span>
            <span class="mprc-detail-title">${this._esc(inst.title)}</span>
            <span class="mprc-detail-freq">${this._esc(inst.frequency)}</span>
          </div>`).join('') : '<div class="mprc-detail-empty">No instances on this date.</div>'}
      </div>`;
  },

  // ── Actions ──
  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
    this.selectedDate = null;
    this.render();
  },

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
    this.selectedDate = null;
    this.render();
  },

  selectDate(dateStr) {
    this.selectedDate = this.selectedDate === dateStr ? null : dateStr;
    this.render();
  },

  addException(dateStr) {
    if (!this.exceptions.includes(dateStr)) this.exceptions.push(dateStr);
    this.render();
  },

  addRecurrence(rec) {
    this.recurrences.push(rec);
    this.render();
  },

  // ── Generate all instances for current month ──
  _generateMonthInstances() {
    const results = [];
    const monthStart = new Date(this.currentYear, this.currentMonth, 1);
    const monthEnd = new Date(this.currentYear, this.currentMonth + 1, 0);
    for (const r of this.recurrences) {
      if (r.paused) continue;
      let cursor = new Date(r.startDate);
      let safety = 0;
      while (cursor <= monthEnd && safety < 500) {
        safety++;
        if (cursor >= monthStart && cursor <= monthEnd) {
          const ds = cursor.toISOString().slice(0, 10);
          if (!this.exceptions.includes(ds)) {
            const valid = r.frequency !== 'weekdays' || (cursor.getDay() !== 0 && cursor.getDay() !== 6);
            if (valid) results.push({ date: ds, title: r.title, frequency: r.frequency, recurrenceId: r.id });
          }
        }
        this._advanceCursor(cursor, r.frequency);
        if (cursor > monthEnd && cursor >= monthStart) break;
      }
    }
    return results;
  },

  _advanceCursor(d, freq) {
    switch (freq) {
      case 'daily': case 'weekdays': d.setDate(d.getDate() + 1); break;
      case 'weekly': d.setDate(d.getDate() + 7); break;
      case 'biweekly': d.setDate(d.getDate() + 14); break;
      case 'monthly': d.setMonth(d.getMonth() + 1); break;
      case 'quarterly': d.setMonth(d.getMonth() + 3); break;
      case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
      default: d.setDate(d.getDate() + 7); break;
    }
  },

  // ── Helpers ──
  _esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; },

  // ── Data Export / Import ──
  exportState() {
    return {
      recurrences: JSON.parse(JSON.stringify(this.recurrences)),
      exceptions: [...this.exceptions],
      currentYear: this.currentYear, currentMonth: this.currentMonth
    };
  },
  importState(state) {
    if (state.recurrences) this.recurrences = state.recurrences;
    if (state.exceptions) this.exceptions = state.exceptions;
    if (state.currentYear !== undefined) this.currentYear = state.currentYear;
    if (state.currentMonth !== undefined) this.currentMonth = state.currentMonth;
    this.render();
  }
};
