/* ═══════════════════════════════════════════════════════════════
   EventBus — Pub/sub for cross-module communication
   Usage: EventBus.on('feature:added', data => { ... })
          EventBus.emit('feature:added', { id, name })
          EventBus.off('feature:added', handler)
   ═══════════════════════════════════════════════════════════════ */
const EventBus = {
  _listeners: {},

  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
    return () => this.off(event, callback); // return unsubscribe fn
  },

  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  },

  emit(event, data) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach(cb => {
      try { cb(data); }
      catch (e) { console.error(`[EventBus] Error in "${event}" handler:`, e); }
    });
  },

  once(event, callback) {
    const wrapper = (data) => {
      this.off(event, wrapper);
      callback(data);
    };
    this.on(event, wrapper);
  },

  clear(event) {
    if (event) delete this._listeners[event];
    else this._listeners = {};
  }
};
