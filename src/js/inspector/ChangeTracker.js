/* ═══════════════════════════════════════════════════════════════
   ChangeTracker — Variable change history and watchpoints
   Stores last N changes per variable path.
   ═══════════════════════════════════════════════════════════════ */
const ChangeTracker = {
  _history: {},   // path -> [{timestamp, oldValue, newValue, op}]
  _watches: new Set(),
  _maxHistory: 200,
  _paused: false,

  record(event) {
    if (this._paused) return;
    const path = event.target + '.' + event.prop;

    if (!this._history[path]) this._history[path] = [];
    this._history[path].push({
      timestamp: event.ts || performance.now(),
      oldValue: event.oldValue,
      newValue: event.newValue,
      op: event.op || 'set',
      valueType: event.valueType || typeof event.newValue
    });

    // Trim history
    if (this._history[path].length > this._maxHistory) {
      this._history[path] = this._history[path].slice(-this._maxHistory);
    }

    // Check watchpoints
    if (this._watches.has(path)) {
      EventBus.emit('watch:triggered', { path, event });
    }

    EventBus.emit('change:recorded', { path, event });
  },

  getHistory(path) {
    return this._history[path] || [];
  },

  getAllPaths() {
    return Object.keys(this._history);
  },

  addWatch(path) {
    this._watches.add(path);
  },

  removeWatch(path) {
    this._watches.delete(path);
  },

  isWatched(path) {
    return this._watches.has(path);
  },

  getWatches() {
    return [...this._watches];
  },

  clear() {
    this._history = {};
  },

  pause() { this._paused = true; },
  resume() { this._paused = false; },

  exportHistory() {
    return JSON.stringify(this._history, null, 2);
  }
};
