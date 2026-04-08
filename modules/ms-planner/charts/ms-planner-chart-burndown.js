const MsPlannerChartBurndown = {
  _container: null,
  _sprintDays: 10,
  _totalTasks: 30,
  _dailyActual: [],

  _sampleData() {
    this._sprintDays = 10;
    this._totalTasks = 30;
    this._dailyActual = [30, 28, 25, 24, 21, 18, 16];
  },

  _esc(str) {
    const el = document.createElement('span'); el.textContent = str; return el.innerHTML;
  },

  _idealForDay(day) {
    return this._totalTasks - (this._totalTasks / this._sprintDays) * day;
  },

  _velocity() {
    if (this._dailyActual.length < 2) return 0;
    const completed = this._dailyActual[0] - this._dailyActual[this._dailyActual.length - 1];
    return (completed / (this._dailyActual.length - 1)).toFixed(1);
  },

  _daysRemaining() {
    return Math.max(0, this._sprintDays - this._dailyActual.length + 1);
  },

  _projectedCompletion() {
    const v = parseFloat(this._velocity());
    if (v <= 0) return 'Never';
    const remaining = this._dailyActual[this._dailyActual.length - 1];
    const daysNeeded = Math.ceil(remaining / v);
    const currentDay = this._dailyActual.length - 1;
    const finishDay = currentDay + daysNeeded;
    if (finishDay <= this._sprintDays) return `Day ${finishDay}`;
    return `Day ${finishDay} (+${finishDay - this._sprintDays} over)`;
  },

  _svgWidth: 560,
  _svgHeight: 280,
  _padL: 50,
  _padR: 20,
  _padT: 20,
  _padB: 40,

  _chartW() { return this._svgWidth - this._padL - this._padR; },
  _chartH() { return this._svgHeight - this._padT - this._padB; },

  _xForDay(d) { return this._padL + (d / this._sprintDays) * this._chartW(); },
  _yForVal(v) { return this._padT + (1 - v / this._totalTasks) * this._chartH(); },

  _renderSVG() {
    const w = this._svgWidth, h = this._svgHeight;
    let svg = `<svg class="mcb-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">`;

    // Grid lines
    for (let i = 0; i <= 5; i++) {
      const val = (this._totalTasks / 5) * i;
      const y = this._yForVal(val);
      svg += `<line x1="${this._padL}" y1="${y}" x2="${w - this._padR}" y2="${y}" stroke="var(--border-soft)" stroke-width="0.5"/>`;
      svg += `<text x="${this._padL - 8}" y="${y + 4}" text-anchor="end" fill="var(--text-muted)" font-size="10">${Math.round(val)}</text>`;
    }

    // X-axis labels
    for (let d = 0; d <= this._sprintDays; d++) {
      const x = this._xForDay(d);
      svg += `<text x="${x}" y="${h - 8}" text-anchor="middle" fill="var(--text-muted)" font-size="10">D${d}</text>`;
    }

    // Ideal line
    svg += `<line x1="${this._xForDay(0)}" y1="${this._yForVal(this._totalTasks)}" x2="${this._xForDay(this._sprintDays)}" y2="${this._yForVal(0)}" stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="6 3"/>`;

    // Actual line (stepped)
    if (this._dailyActual.length > 0) {
      let pathD = `M ${this._xForDay(0)} ${this._yForVal(this._dailyActual[0])}`;
      for (let i = 1; i < this._dailyActual.length; i++) {
        const x = this._xForDay(i);
        const yPrev = this._yForVal(this._dailyActual[i - 1]);
        const y = this._yForVal(this._dailyActual[i]);
        pathD += ` L ${x} ${yPrev} L ${x} ${y}`;
      }
      svg += `<path d="${pathD}" fill="none" stroke="var(--accent-pink)" stroke-width="2.5" stroke-linecap="round"/>`;

      // Hover points
      this._dailyActual.forEach((val, i) => {
        const x = this._xForDay(i);
        const y = this._yForVal(val);
        svg += `<circle cx="${x}" cy="${y}" r="5" fill="var(--accent-pink)" class="mcb-point" data-day="${i}" data-val="${val}"/>`;
        svg += `<title>Day ${i}: ${val} remaining</title>`;
      });
    }

    // Area fill under actual
    if (this._dailyActual.length > 1) {
      let areaD = `M ${this._xForDay(0)} ${this._yForVal(0)}`;
      areaD += ` L ${this._xForDay(0)} ${this._yForVal(this._dailyActual[0])}`;
      for (let i = 1; i < this._dailyActual.length; i++) {
        const x = this._xForDay(i);
        const yPrev = this._yForVal(this._dailyActual[i - 1]);
        const y = this._yForVal(this._dailyActual[i]);
        areaD += ` L ${x} ${yPrev} L ${x} ${y}`;
      }
      const lastX = this._xForDay(this._dailyActual.length - 1);
      areaD += ` L ${lastX} ${this._yForVal(0)} Z`;
      svg += `<path d="${areaD}" fill="var(--accent-pink)" opacity="0.08"/>`;
    }

    svg += '</svg>';
    return svg;
  },

  _renderStats() {
    const v = this._velocity();
    const dr = this._daysRemaining();
    const pc = this._projectedCompletion();
    const current = this._dailyActual.length ? this._dailyActual[this._dailyActual.length - 1] : this._totalTasks;
    return `<div class="mcb-stats">
      <div class="mcb-stat"><span class="mcb-stat-num">${v}</span><span class="mcb-stat-label">Velocity/day</span></div>
      <div class="mcb-stat"><span class="mcb-stat-num">${dr}</span><span class="mcb-stat-label">Days Left</span></div>
      <div class="mcb-stat"><span class="mcb-stat-num">${current}</span><span class="mcb-stat-label">Remaining</span></div>
      <div class="mcb-stat"><span class="mcb-stat-num mcb-stat-proj">${this._esc(pc)}</span><span class="mcb-stat-label">Projected</span></div>
    </div>`;
  },

  _addDataPoint() {
    const input = this._container.querySelector('.mcb-add-val');
    if (!input) return;
    const val = parseInt(input.value);
    if (isNaN(val) || val < 0) return;
    this._dailyActual.push(val);
    this.render();
  },

  _removeLastPoint() {
    if (this._dailyActual.length > 1) {
      this._dailyActual.pop();
      this.render();
    }
  },

  _resetSprint() {
    const daysInput = this._container.querySelector('.mcb-cfg-days');
    const tasksInput = this._container.querySelector('.mcb-cfg-tasks');
    const days = parseInt(daysInput?.value) || 10;
    const tasks = parseInt(tasksInput?.value) || 30;
    this._sprintDays = days;
    this._totalTasks = tasks;
    this._dailyActual = [tasks];
    this.render();
  },

  render() {
    let html = `<div class="mcb-root"><h2 class="mcb-heading">Burndown</h2>
      ${this._renderStats()}
      <div class="mcb-chart-wrap">${this._renderSVG()}</div>
      <div class="mcb-legend">
        <span class="mcb-legend-item"><span class="mcb-ldash"></span>Ideal</span>
        <span class="mcb-legend-item"><span class="mcb-lline"></span>Actual</span>
      </div>
      <div class="mcb-controls">
        <div class="mcb-add-row">
          <input type="number" class="mcb-add-val" placeholder="Remaining tasks..." min="0" value="${this._dailyActual.length ? Math.max(0, this._dailyActual[this._dailyActual.length - 1] - 2) : 0}">
          <button class="mcb-add-btn">Add Day</button>
          <button class="mcb-undo-btn">Undo</button>
        </div>
        <div class="mcb-config-row">
          <label class="mcb-cfg-label">Sprint Days<input type="number" class="mcb-cfg-days" value="${this._sprintDays}" min="1"></label>
          <label class="mcb-cfg-label">Total Tasks<input type="number" class="mcb-cfg-tasks" value="${this._totalTasks}" min="1"></label>
          <button class="mcb-reset-btn">New Sprint</button>
        </div>
      </div>
    </div>`;
    this._container.innerHTML = html;
    this._bind();
  },

  _bind() {
    const addBtn = this._container.querySelector('.mcb-add-btn');
    if (addBtn) addBtn.addEventListener('click', () => this._addDataPoint());
    const undoBtn = this._container.querySelector('.mcb-undo-btn');
    if (undoBtn) undoBtn.addEventListener('click', () => this._removeLastPoint());
    const resetBtn = this._container.querySelector('.mcb-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', () => this._resetSprint());
  },

  init(containerId) {
    this._container = document.getElementById(containerId);
    this._sampleData();
    this.render();
  },

  exportState() {
    return { sprintDays: this._sprintDays, totalTasks: this._totalTasks, dailyActual: [...this._dailyActual] };
  },

  importState(state) {
    this._sprintDays = state.sprintDays || 10;
    this._totalTasks = state.totalTasks || 30;
    this._dailyActual = state.dailyActual || [];
    this.render();
  }
};
