const MsPlannerTimeStopwatch = {
  container: null,
  tasks: [
    { id: 1, title: 'Design mockups' },
    { id: 2, title: 'Write specs' },
    { id: 3, title: 'Build API' },
    { id: 4, title: 'Auth module' },
    { id: 5, title: 'Setup CI' }
  ],
  timeLog: [],
  _nextLogId: 1,
  _activeTaskId: 1,
  _running: false,
  _elapsed: 0,
  _startTime: null,
  _intervalId: null,

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },

  _fmtDuration(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  },

  _fmtHours(ms) {
    return (ms / 3600000).toFixed(2);
  },

  _todayStr() {
    return new Date().toISOString().split('T')[0];
  },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
  },

  _tick() {
    if (!this._running) return;
    this._elapsed = Date.now() - this._startTime;
    const display = this.container.querySelector('.tsw-display');
    if (display) display.textContent = this._fmtDuration(this._elapsed);
  },

  _start() {
    if (this._running) return;
    this._running = true;
    this._startTime = Date.now() - this._elapsed;
    this._intervalId = setInterval(() => this._tick(), 200);
    this.render();
  },

  _pause() {
    if (!this._running) return;
    this._running = false;
    this._elapsed = Date.now() - this._startTime;
    clearInterval(this._intervalId);
    this._intervalId = null;
    this.render();
  },

  _stop() {
    if (this._elapsed < 1000) {
      this._running = false;
      this._elapsed = 0;
      clearInterval(this._intervalId);
      this._intervalId = null;
      this.render();
      return;
    }
    const wasRunning = this._running;
    if (wasRunning) this._elapsed = Date.now() - this._startTime;
    this._running = false;
    clearInterval(this._intervalId);
    this._intervalId = null;
    const task = this.tasks.find(t => t.id === this._activeTaskId);
    this.timeLog.push({
      id: this._nextLogId++,
      taskId: this._activeTaskId,
      taskTitle: task ? task.title : 'Unknown',
      duration: this._elapsed,
      date: this._todayStr()
    });
    this._elapsed = 0;
    this._startTime = null;
    this.render();
  },

  _deleteLog(logId) {
    this.timeLog = this.timeLog.filter(l => l.id !== logId);
    this.render();
  },

  _selectTask(taskId) {
    if (this._running) this._stop();
    this._activeTaskId = taskId;
    this._elapsed = 0;
    this.render();
  },

  _dailyTotal() {
    const today = this._todayStr();
    return this.timeLog.filter(l => l.date === today).reduce((sum, l) => sum + l.duration, 0);
  },

  render() {
    if (!this.container) return;
    const activeTask = this.tasks.find(t => t.id === this._activeTaskId);
    const displayTime = this._fmtDuration(this._elapsed);
    const pulseClass = this._running ? ' tsw-pulse' : '';
    const dailyMs = this._dailyTotal();

    let html = `<div class="tsw-panel">
      <div class="tsw-header">
        <h3>Time Stopwatch</h3>
        <span class="tsw-daily-total">Today: ${this._fmtHours(dailyMs)}h</span>
      </div>
      <div class="tsw-task-select">
        <label class="tsw-label">Active Task</label>
        <select class="tsw-select" data-action="selectTask">
          ${this.tasks.map(t => `<option value="${t.id}"${t.id === this._activeTaskId ? ' selected' : ''}>${this._esc(t.title)}</option>`).join('')}
        </select>
      </div>
      <div class="tsw-timer-area">
        <div class="tsw-display${pulseClass}">${displayTime}</div>
        <div class="tsw-task-name">${this._esc(activeTask ? activeTask.title : '')}</div>
        <div class="tsw-controls">
          ${!this._running
            ? `<button class="tsw-btn tsw-btn-start" data-action="start">Start</button>`
            : `<button class="tsw-btn tsw-btn-pause" data-action="pause">Pause</button>`}
          <button class="tsw-btn tsw-btn-stop" data-action="stop">Stop</button>
        </div>
      </div>
      <div class="tsw-section">
        <div class="tsw-section-label">Time Log</div>
        ${this.timeLog.length === 0 ? '<div class="tsw-empty">No entries yet</div>' : ''}
        ${this.timeLog.slice().reverse().map(l => `<div class="tsw-log-item">
          <span class="tsw-log-task">${this._esc(l.taskTitle)}</span>
          <span class="tsw-log-dur">${this._fmtDuration(l.duration)}</span>
          <span class="tsw-log-date">${this._esc(l.date)}</span>
          <button class="tsw-btn-del" data-action="deleteLog" data-id="${l.id}">&times;</button>
        </div>`).join('')}
      </div>
    </div>`;

    this.container.innerHTML = html;

    this.container.onclick = (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'start') this._start();
      else if (action === 'pause') this._pause();
      else if (action === 'stop') this._stop();
      else if (action === 'deleteLog') this._deleteLog(Number(btn.dataset.id));
    };

    this.container.onchange = (e) => {
      if (e.target.dataset.action === 'selectTask') {
        this._selectTask(Number(e.target.value));
      }
    };

    if (this._running) {
      clearInterval(this._intervalId);
      this._intervalId = setInterval(() => this._tick(), 200);
    }
  },

  exportState() {
    return {
      tasks: JSON.parse(JSON.stringify(this.tasks)),
      timeLog: JSON.parse(JSON.stringify(this.timeLog)),
      _nextLogId: this._nextLogId,
      _activeTaskId: this._activeTaskId,
      _elapsed: this._running ? Date.now() - this._startTime : this._elapsed
    };
  },

  importState(state) {
    if (!state) return;
    this.tasks = state.tasks || this.tasks;
    this.timeLog = state.timeLog || [];
    this._nextLogId = state._nextLogId || this.timeLog.length + 1;
    this._activeTaskId = state._activeTaskId || 1;
    this._elapsed = state._elapsed || 0;
    this._running = false;
    this.render();
  }
};
