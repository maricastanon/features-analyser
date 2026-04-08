/* ═══════════════════════════════════════════════════════════════
   FlowRecorder — Record/playback data flow events over time
   ═══════════════════════════════════════════════════════════════ */
const FlowRecorder = {
  _events: [],
  _recording: false,
  _maxEvents: 1000,

  startRecording() {
    this._recording = true;
    this._events = [];
    Toast.show('Recording data flow...', 'info');
  },

  stopRecording() {
    this._recording = false;
    Toast.show(`Recorded ${this._events.length} events`);
  },

  isRecording() { return this._recording; },

  record(event) {
    if (!this._recording) return;
    this._events.push({ ...event, recordedAt: Date.now() });
    if (this._events.length > this._maxEvents) {
      this._events = this._events.slice(-this._maxEvents);
    }
  },

  getEvents() { return this._events; },

  getEventsByTarget(target) {
    return this._events.filter(e => e.target === target);
  },

  // Playback events with timing
  async playback(speed = 1) {
    if (!this._events.length) return;
    Toast.show('Playing back...', 'info');

    for (let i = 0; i < this._events.length; i++) {
      const event = this._events[i];
      const next = this._events[i + 1];

      FlowGraph.highlight(event.target, event.prop);

      if (next) {
        const delay = (next.recordedAt - event.recordedAt) / speed;
        await new Promise(r => setTimeout(r, Math.min(delay, 1000)));
      }
    }
    Toast.show('Playback complete');
  },

  exportEvents() {
    return JSON.stringify(this._events, null, 2);
  },

  clear() { this._events = []; }
};
